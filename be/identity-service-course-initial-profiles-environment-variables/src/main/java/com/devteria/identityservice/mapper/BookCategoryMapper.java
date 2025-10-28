package com.devteria.identityservice.mapper;

import com.devteria.identityservice.dto.request.BookCategoryRequest;
import com.devteria.identityservice.dto.response.BookCategoryResponse;
import com.devteria.identityservice.entity.BookCategory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface BookCategoryMapper {
    BookCategory toBookCategory(BookCategoryRequest request);

    @Mapping(target = "id", source = "id")
    BookCategoryResponse toBookCategoryResponse(BookCategory bookCategory);
}
