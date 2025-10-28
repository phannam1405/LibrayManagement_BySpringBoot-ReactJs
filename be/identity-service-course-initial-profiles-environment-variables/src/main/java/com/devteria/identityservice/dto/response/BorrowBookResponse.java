package com.devteria.identityservice.dto.response;

import com.devteria.identityservice.entity.Book;
import com.devteria.identityservice.entity.BorrowStatus;
import com.devteria.identityservice.entity.User;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BorrowBookResponse {
    String id;
    User user;
    Book book;
    int quantity;
    LocalDate borrowDate;
    LocalDate returnDate;
    String status; // Trạng thái hiện tại
    List<BorrowStatus> statusHistory; // Toàn bộ lịch sử
}
