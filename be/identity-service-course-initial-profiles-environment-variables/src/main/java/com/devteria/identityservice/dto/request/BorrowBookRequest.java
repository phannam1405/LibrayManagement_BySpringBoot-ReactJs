package com.devteria.identityservice.dto.request;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BorrowBookRequest {
    String userId;
    String bookId;
    int quantity;
    LocalDate borrowDate;
    LocalDate returnDate;
}
