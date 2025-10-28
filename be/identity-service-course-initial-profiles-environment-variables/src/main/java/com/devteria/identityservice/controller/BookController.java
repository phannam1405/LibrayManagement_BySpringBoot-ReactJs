package com.devteria.identityservice.controller;

import com.devteria.identityservice.dto.request.ApiResponse;
import com.devteria.identityservice.dto.request.BookRequest;

import com.devteria.identityservice.dto.response.BookResponse;

import com.devteria.identityservice.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
public class BookController {
    private final BookService bookService;

    //consumes = "multipart/form-data" là để Spring biết yêu cầu này chứa file upload
    @PostMapping(consumes = "multipart/form-data")
    public ApiResponse<BookResponse> createBook(
            @RequestPart("bookData") BookRequest request,
            @RequestPart("images") MultipartFile images) {

        request.setImages(images);
        return ApiResponse.<BookResponse>builder()
                .result(bookService.createBook(request))
                .build();
    }

    @PutMapping(value = "/{bookId}", consumes = "multipart/form-data")
    ApiResponse<BookResponse> updateBook(
            @PathVariable String bookId,
            @RequestPart("bookData") BookRequest request,
            @RequestPart(value = "images", required = false) MultipartFile images) {

        if (images != null) {
            request.setImages(images);
        }
        return ApiResponse.<BookResponse>builder()
                .result(bookService.updateBook(bookId, request))
                .build();
    }

    @GetMapping
    public ApiResponse<List<BookResponse>> getBooks() {
        return ApiResponse.<List<BookResponse>>builder()
                .result(bookService.getBooks())
                .build();
    }

    @GetMapping("/{bookId}")
    public ApiResponse<BookResponse> getBook(@PathVariable String bookId) {
        return ApiResponse.<BookResponse>builder()
                .result(bookService.getBook(bookId))
                .build();
    }

    @DeleteMapping("/{bookId}")
    ApiResponse<String> deleteBook(@PathVariable String bookId) {
        bookService.deleteBook(bookId);
        return ApiResponse.<String>builder().result("Book  has been deleted").build();
    }

}