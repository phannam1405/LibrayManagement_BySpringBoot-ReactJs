package com.devteria.identityservice.controller;

import com.devteria.identityservice.dto.request.ApiResponse;
import com.devteria.identityservice.dto.request.BookCategoryRequest;
import com.devteria.identityservice.dto.response.BookCategoryResponse;
import com.devteria.identityservice.dto.response.UserResponse;
import com.devteria.identityservice.service.BookCategoryService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/book_category")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookCategoryController {
    BookCategoryService bookCategoryService;

    @GetMapping
    ApiResponse<List<BookCategoryResponse>> getBookCategories() {
        return ApiResponse.<List<BookCategoryResponse>>builder()
                .result(bookCategoryService.getBookCategories())
                .build();
    }

    @PostMapping
    ApiResponse<BookCategoryResponse> createBookCategory(@RequestBody @Valid BookCategoryRequest request) {
        return ApiResponse.<BookCategoryResponse>builder()
                .result(bookCategoryService.createBookCategory(request))
                .build();
    }

    @DeleteMapping("/{bookCategoryId}")
    ApiResponse<String> deleteBookCategory(@PathVariable String bookCategoryId) {
        bookCategoryService.deleteBookCategory(bookCategoryId);
        return ApiResponse.<String>builder().result("Book Category has been deleted").build();
    }
}
