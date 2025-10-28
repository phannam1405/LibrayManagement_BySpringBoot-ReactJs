package com.devteria.identityservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailRequest {
    private String toEmail;
    private String subject;
    private String htmlContent;
}
