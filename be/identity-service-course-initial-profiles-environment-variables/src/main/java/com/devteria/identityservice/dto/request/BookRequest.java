package com.devteria.identityservice.dto.request;

import com.devteria.identityservice.entity.BookCategory;
import jakarta.persistence.Transient;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookRequest {
    private String bookName;
    private String author;
    private BookCategory categoryName;
    private int available;

    @Transient // Đánh dấu không lưu vào database
    private MultipartFile images;
}