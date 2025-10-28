package com.devteria.identityservice.controller;

import com.devteria.identityservice.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class GeminiController {

    private final GeminiService geminiService;


    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        String answer = geminiService.askGemini(message);
        return ResponseEntity.ok(Map.of("reply", answer));
    }
}
