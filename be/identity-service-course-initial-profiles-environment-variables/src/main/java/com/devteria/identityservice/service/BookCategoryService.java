package com.devteria.identityservice.service;

import com.devteria.identityservice.constant.PredefinedRole;
import com.devteria.identityservice.dto.request.BookCategoryRequest;
import com.devteria.identityservice.dto.request.UserCreationRequest;
import com.devteria.identityservice.dto.response.BookCategoryResponse;
import com.devteria.identityservice.dto.response.UserResponse;
import com.devteria.identityservice.entity.BookCategory;
import com.devteria.identityservice.entity.Role;
import com.devteria.identityservice.entity.User;
import com.devteria.identityservice.exception.AppException;
import com.devteria.identityservice.exception.ErrorCode;
import com.devteria.identityservice.mapper.BookCategoryMapper;
import com.devteria.identityservice.repository.BookCategoryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookCategoryService {
    BookCategoryRepository bookCategoryRepository;
    BookCategoryMapper bookCategoryMapper;


    public List<BookCategoryResponse> getBookCategories() {
        log.info("In method get Users");
        return bookCategoryRepository.findAll().stream().map(bookCategoryMapper::toBookCategoryResponse).toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public BookCategoryResponse createBookCategory(BookCategoryRequest request) {
        BookCategory bookCategory = bookCategoryMapper.toBookCategory(request);
        try {
            bookCategory = bookCategoryRepository.save(bookCategory);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.BOOK_CATEGORY_EXISTED);
        }

        return bookCategoryMapper.toBookCategoryResponse(bookCategory);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteBookCategory(String bookCategoryId) {
        bookCategoryRepository.deleteById(bookCategoryId);
    }
}
