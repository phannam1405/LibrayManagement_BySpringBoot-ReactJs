package com.devteria.identityservice.entity;

import com.devteria.identityservice.exception.BorrowStatusType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BorrowBook {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    User user;

    @ManyToOne
    Book book;

    int quantity;

    LocalDate borrowDate;
    LocalDate returnDate;

    @OneToMany(mappedBy = "borrowBook", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt DESC")
    List<BorrowStatus> statusHistory;

    // Helper method để thêm status mới
    public void addStatus(BorrowStatusType status, String note) {
        if (statusHistory == null) {
            statusHistory = new ArrayList<>();
        }
        statusHistory.add(BorrowStatus.builder()
                .borrowBook(this)
                .status(status.name())
                .statusDescription(status.getDescription())
                .createdAt(LocalDateTime.now())
                .note(note)
                .build());
    }

    public String getCurrentStatus() {
        if (statusHistory == null || statusHistory.isEmpty()) {
            return null;
        }
        // Sắp xếp giảm dần theo thời gian (mới nhất đầu tiên)
        statusHistory.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return statusHistory.get(0).getStatusDescription();
    }
}
