package com.devteria.identityservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BorrowStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "borrow_book_id")
    @JsonIgnore
    private BorrowBook borrowBook;

    private String status; // Lưu tên enum (ví dụ: "BORROWING")
    private String statusDescription; // Lưu mô tả (ví dụ: "Đang mượn")

    private LocalDateTime createdAt;
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    private String note;


}