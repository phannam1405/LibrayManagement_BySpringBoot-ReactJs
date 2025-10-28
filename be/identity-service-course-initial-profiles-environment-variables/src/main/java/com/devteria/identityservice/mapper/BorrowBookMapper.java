package com.devteria.identityservice.mapper;

import com.devteria.identityservice.dto.request.BorrowBookRequest;
import com.devteria.identityservice.dto.response.BorrowBookResponse;
import com.devteria.identityservice.entity.BorrowBook;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;




@Mapper(componentModel = "spring")
public interface BorrowBookMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "book", ignore = true)
    @Mapping(target = "borrowDate", ignore = true)
    @Mapping(target = "statusHistory", ignore = true)
    @Mapping(target = "returnDate", source = "returnDate")
    BorrowBook toBorrowBook(BorrowBookRequest request);

    @Mapping(target = "status", expression = "java(borrowBook.getCurrentStatus())")
    BorrowBookResponse toBorrowBookResponse(BorrowBook borrowBook);
}