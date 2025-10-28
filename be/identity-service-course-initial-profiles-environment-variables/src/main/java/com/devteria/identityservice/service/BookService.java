package com.devteria.identityservice.service;

import com.devteria.identityservice.dto.request.BookRequest;
import com.devteria.identityservice.dto.response.BookResponse;
import com.devteria.identityservice.entity.Book;
import com.devteria.identityservice.entity.BookCategory;
import com.devteria.identityservice.exception.AppException;
import com.devteria.identityservice.exception.ErrorCode;
import com.devteria.identityservice.mapper.BookMapper;
import com.devteria.identityservice.repository.BookCategoryRepository;
import com.devteria.identityservice.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookService {
    private final BookRepository bookRepository;
    private final BookMapper bookMapper;
    private final FileStorageService fileStorageService;
    private final BookCategoryRepository bookCategoryRepository;


    @PreAuthorize("hasRole('ADMIN')")
    public BookResponse createBook(BookRequest request) {
        // Lưu file ảnh và lấy tên file
        String fileName = fileStorageService.storeFile(request.getImages());

        BookCategory category = bookCategoryRepository.findById(request.getCategoryName().getId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));


        Book book = bookMapper.toBook(request);
        book.setImages(fileName); // Lưu TÊN FILE vào DB
        book.setCategoryName(category);

        try {
            book = bookRepository.save(book);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.BOOK_EXISTED);
        }

        return bookMapper.toBookResponse(book);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public BookResponse updateBook(String bookId, BookRequest request) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_EXISTED));

        // Xử lý ảnh mới nếu có
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            // Xóa ảnh cũ (nếu cần)
            fileStorageService.deleteFile(book.getImages());
            // Lưu ảnh mới
            String fileName = fileStorageService.storeFile(request.getImages());
            book.setImages(fileName);
        }

        // Cập nhật thông tin khác
        bookMapper.updateBook(book, request);

        // Cập nhật category nếu có
        if (request.getCategoryName() != null && request.getCategoryName().getId() != null) {
            BookCategory category = bookCategoryRepository.findById(request.getCategoryName().getId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            book.setCategoryName(category);
        }

        return bookMapper.toBookResponse(bookRepository.save(book));
    }

    public List<BookResponse> getBooks() {
        List<Book> books = bookRepository.findAll();

        return books.stream()
                .map(book -> {
                    BookResponse response = bookMapper.toBookResponse(book);
                    // Thêm URL đầy đủ cho ảnh nếu cần
                    if (book.getImages() != null) {
                        response.setImages( book.getImages());
                    }
                    return response;
                })
                .toList();
    }

    public BookResponse getBook(String bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_EXISTED));

        return bookMapper.toBookResponse((book));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteBook(String bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_EXISTED));
        // Xóa ảnh cũ
        fileStorageService.deleteFile(book.getImages());
        bookRepository.deleteById(bookId);
    }

}