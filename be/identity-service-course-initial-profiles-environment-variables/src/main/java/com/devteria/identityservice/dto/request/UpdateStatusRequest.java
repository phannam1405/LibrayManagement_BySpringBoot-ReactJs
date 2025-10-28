package com.devteria.identityservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateStatusRequest {
    @NotBlank(message = "Trạng thái không được để trống")
    private String status; // Nhận giá trị enum name (ví dụ: "BORROWING")

    private String note;
}