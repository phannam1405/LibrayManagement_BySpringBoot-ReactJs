package com.devteria.identityservice.controller;

import com.devteria.identityservice.dto.request.ApiResponse;
import com.devteria.identityservice.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/statistics")
@RequiredArgsConstructor
public class StatisticsController {
    private final StatisticsService statisticsService;

    @GetMapping("/users")
    public ApiResponse<Map<String, Long>> getUserStatistics() {
        return ApiResponse.<Map<String, Long>>builder()
                .result(statisticsService.getUserStatistics())
                .build();
    }

    @GetMapping("/books")
    public ApiResponse<Map<String, Long>> getBookStatistics() {
        return ApiResponse.<Map<String, Long>>builder()
                .result(statisticsService.getBookStatistics())
                .build();
    }

    @GetMapping("/borrows")
    public ApiResponse<Map<String, Long>> getBorrowStatistics() {
        return ApiResponse.<Map<String, Long>>builder()
                .result(statisticsService.getBorrowStatistics())
                .build();
    }
}