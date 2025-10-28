package com.devteria.identityservice.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookResponse {
    String id;
    String bookName;
    String author;
    String  categoryName;
    int available;
    String images;
}
