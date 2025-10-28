package com.devteria.identityservice.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    @NonFinal
     String apiKey;

    RestTemplate restTemplate;
   JdbcTemplate jdbcTemplate;

    // Cấm các lệnh nguy hiểm
    private static final Pattern FORBIDDEN_SQL_PATTERN = Pattern.compile(
            "\\b(update|delete|insert|drop|alter|truncate|create|replace|grant|revoke)\\b",
            Pattern.CASE_INSENSITIVE
    );



    public String askGemini(String message) {
        boolean isDbQuery = message.trim().toLowerCase().startsWith("@db:");
        String prompt;

        if (isDbQuery) {
            // Với câu hỏi dữ liệu
            String schema = """
                Database schema:

                book_category(id, category_name, description)
                book(id, book_name, author, available, category_id, images)
                borrow_book(id, borrow_date, return_date, quantity, book_id, borrower_name)
                borrow_status(id, borrow_book_id, status, status_description, created_at, note)
                """;

            prompt = """
                Bạn là chuyên gia SQL MySQL.
                Dựa trên schema dưới đây, hãy TRẢ LỜI bằng câu lệnh SQL SELECT hợp lệ.
                KHÔNG GIẢI THÍCH, KHÔNG DÙNG ```sql```.
                Nếu không thể viết được câu SELECT hợp lệ, hãy trả về: SELECT 'INVALID';
                """ + schema + "\nCâu hỏi: " + message.replace("@db:", "");
        } else {
            // Với câu hỏi thông thường (hướng dẫn, quy tắc, liên hệ, v.v.)
            String context = """
                Bạn là trợ lý ảo của thư viện NamTech.
                Hãy trả lời ngắn gọn, rõ ràng, lịch sự và dễ hiểu cho người dùng.

                Thông tin và quy tắc ở thư viện:
                - Địa chỉ là 470 TDN
                - Phải trả sách đúng thời hạn quy định
                - Không làm hư tổn sách, khi mượn, nếu có thiệt hại sẽ phải đền bù
                - Mỗi người dùng có thể mượn tối đa 5 quyển cùng lúc.
                - Để mượn sách, cần có thẻ thư viện (tạo trong bảng user).
                - Có thể mượn sách online nhưng cần tạo tài khoản trước và khi nhận sách thì cần làm thẻ thư viện.
                - Nếu có lỗi hoặc thắc mắc, Liên hệ 0112443 - Thủ thư hoặc vui lòng gửi email về: phannam1405@gmail.com hoặc đến trực tiếp thư viện.

                Nếu người dùng hỏi về cách mượn sách, lập thẻ, hoặc quy định, hãy hướng dẫn chi tiết.
                Nếu người dùng hỏi về dữ liệu, hãy gợi ý họ dùng cú pháp: @db: [nội dung câu hỏi].
                """;

            prompt = context + "\n\nNgười dùng hỏi: " + message;
        }

        // Gọi API Gemini
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        //gemiri yêu cầu phải format request như sau:
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
        );

        //Tạo header và gói dữ liệu gửi đi
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            //Gửi request đến Gemini API
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            Map<String, Object> body = response.getBody(); // lấy data
            if (body == null || !body.containsKey("candidates"))
                return "Lỗi: Không có dữ liệu từ Gemini.";

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
            if (candidates.isEmpty())
                return "Lỗi: Không có ứng viên.";

            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            if (content == null || !content.containsKey("parts"))
                return "Lỗi: Không có phần nội dung.";

            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            if (parts.isEmpty())
                return "Lỗi: Không có phần text.";

            //tạo phản hồi
            String reply = (String) parts.get(0).get("text");
            if (reply == null || reply.isEmpty())
                return "Lỗi: Phản hồi trống.";

            //xử lý các trường hợp truy vấn
            if (isDbQuery) {
                String sql = extractSql(reply);
                if (sql == null || sql.isEmpty())
                    return "Không tìm thấy SQL.";

                Matcher forbidden = FORBIDDEN_SQL_PATTERN.matcher(sql);
                if (forbidden.find())
                    return "Từ chối: SQL chứa lệnh bị cấm.";

                if (!sql.trim().toLowerCase().startsWith("select"))
                    return "Chỉ cho phép SELECT.";

                try {
                    List<Map<String, Object>> results = jdbcTemplate.queryForList(sql); // chạy sql trả về 1 list
                    return formatSimple(results);
                } catch (Exception ex) {
                    return "Lỗi khi chạy SQL: " + ex.getMessage();
                }
            }

            return reply;

        } catch (Exception e) {
            return "Lỗi khi gọi Gemini API: " + e.getMessage();
        }
    }

    // Trích xuất SQL từ phản hồi
    //AI(GPT, Gemini) thường hay trả về ```sql\nSELECT * FROM users;\n```
    private String extractSql(String text) {
        if (text.contains("```")) {
            int start = text.indexOf("```");
            int end = text.lastIndexOf("```");
            if (start != -1 && end > start)
                return text.substring(start + 3, end).replace("sql", "").trim();
        }
        return text.trim();
    }

   //  Format kết quả
    private String formatSimple(List<Map<String, Object>> results) {
        if (results.isEmpty()) {
            return "(Không có kết quả nào)";
        }

        StringBuilder sb = new StringBuilder();
        for (Map<String, Object> row : results) {
            for (Map.Entry<String, Object> entry : row.entrySet()) {
                sb.append(entry.getKey()).append(": ").append(entry.getValue()).append("\n");
            }
            sb.append("\n");
        }

        return sb.toString().trim();
    }
}
