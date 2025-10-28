package com.devteria.identityservice.controller;

import com.devteria.identityservice.dto.request.EmailRequest;
import com.devteria.identityservice.service.EmailService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/email")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/send-html")
    public ResponseEntity<String> sendHtmlEmail(@RequestBody EmailRequest request) {
        try {
            emailService.sendHtmlEmail(
                    request.getToEmail(),
                    request.getSubject(),
                    request.getHtmlContent()
            );
            return ResponseEntity.ok("Email sent successfully");
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send email: " + e.getMessage());
        }
    }
}