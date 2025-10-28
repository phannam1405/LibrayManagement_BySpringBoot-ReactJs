package com.devteria.identityservice.mapper;

import com.devteria.identityservice.dto.request.BookRequest;

import com.devteria.identityservice.dto.response.BookResponse;
import com.devteria.identityservice.entity.Book;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.web.multipart.MultipartFile;


@Mapper(componentModel = "spring")
public interface BookMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "images", ignore = true) // Vẫn bỏ qua images ở đây vì sẽ xử lý riêng
    @Mapping(target = "categoryName", source = "categoryName")
    Book toBook(BookRequest request);

    @Mapping(target = "categoryName", source = "categoryName.categoryName")
    BookResponse toBookResponse(Book book);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "images", ignore = true) // Bỏ qua images khi update
    @Mapping(target = "categoryName", source = "categoryName")
    void updateBook(@MappingTarget Book book, BookRequest request);

    //  method map từ MultipartFile sang String (tên file)
    default String map(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        return file.getOriginalFilename();
    }
}