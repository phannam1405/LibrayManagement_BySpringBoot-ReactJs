package com.devteria.identityservice.configuration;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import com.devteria.identityservice.dto.request.ApiResponse;
import com.devteria.identityservice.exception.ErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;


//Class này được dùng trong Spring Security để xử lý lỗi khi người dùng chưa được xác thực
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    //Khi một request không được xác thực (không có token hợp lệ hoặc token hết hạn),
    // Spring Security sẽ gọi commence() để xử lý phản hồi.
    public void commence(
            HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException, ServletException {
        ErrorCode errorCode = ErrorCode.UNAUTHENTICATED;

        response.setStatus(errorCode.getStatusCode().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ApiResponse<?> apiResponse = ApiResponse.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();

        //Chuyển object thành JSON
        ObjectMapper objectMapper = new ObjectMapper();
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
        response.flushBuffer(); //Đảm bảo tất cả dữ liệu được gửi ngay lập tức về client.
    }
}
