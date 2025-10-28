package com.devteria.identityservice.controller;

import com.devteria.identityservice.dto.request.ApiResponse;
import com.devteria.identityservice.dto.request.BorrowBookRequest;

import com.devteria.identityservice.dto.request.UpdateStatusRequest;
import com.devteria.identityservice.dto.response.BorrowBookResponse;

import com.devteria.identityservice.dto.response.UserResponse;
import com.devteria.identityservice.service.BorrowBookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/borrow_book")
@RequiredArgsConstructor
public class BorrowBookController {
    private final BorrowBookService borrowBookService;

    @PostMapping("/offline")
    ApiResponse<BorrowBookResponse> createBorrowBook(@RequestBody @Valid BorrowBookRequest request) {
        return ApiResponse.<BorrowBookResponse>builder()
                .result(borrowBookService.createBorrowBook(request))
                .build();
    }

    @PostMapping("/online")
    ApiResponse<BorrowBookResponse> createBorrowBookOnline(@RequestBody @Valid BorrowBookRequest request) {
        return ApiResponse.<BorrowBookResponse>builder()
                .result(borrowBookService.createBorrowBookOnline(request))
                .build();
    }



    @PutMapping("/{borrowId}")
    public ApiResponse<BorrowBookResponse> updateStatus(
            @PathVariable String borrowId,
            @RequestBody @Valid UpdateStatusRequest request) {
        return ApiResponse.<BorrowBookResponse>builder()
                .result(borrowBookService.updateBorrowStatus(
                        borrowId,
                        request.getStatus(),
                        request.getNote()))
                .build();
    }


    @GetMapping
    ApiResponse<List<BorrowBookResponse>> getListBorrow() {
        return ApiResponse.<List<BorrowBookResponse>>builder()
                .result(borrowBookService.getListBorrow())
                .build();
    }

    @DeleteMapping("/{borrowId}")
    public ApiResponse<Void> deleteBorrowBook(@PathVariable String borrowId) {
        borrowBookService.deleteBorrowBook(borrowId);
        return ApiResponse.<Void>builder()
                .message("Borrow record deleted successfully")
                .build();
    }

    @GetMapping("/{borrowId}")
    ApiResponse<BorrowBookResponse> getDetailsBorrow(@PathVariable String borrowId) {
        return ApiResponse.<BorrowBookResponse>builder()
                .result(borrowBookService.getDetailsBorrow(borrowId))
                .build();
    }

}
