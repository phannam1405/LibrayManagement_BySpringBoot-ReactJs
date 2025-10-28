package com.devteria.identityservice.repository;

import com.devteria.identityservice.entity.BorrowBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface BorrowBookRepository extends JpaRepository<BorrowBook, String> {

    @Query("SELECT COUNT(b) FROM BorrowBook b")
    long countAllBorrowBooks();

    @Query("SELECT COUNT(b) FROM BorrowBook b JOIN b.statusHistory s WHERE s.status = 'BORROWING'")
    long countBorrowingBooks();

    @Query("SELECT COUNT(b) FROM BorrowBook b JOIN b.statusHistory s WHERE s.status = 'RETURNED'")
    long countReturnedBooks();

    @Query("SELECT COUNT(b) FROM BorrowBook b JOIN b.statusHistory s WHERE s.status = 'PENDING'")
    long countPendingBooks();

    @Query("SELECT COUNT(b) FROM BorrowBook b JOIN b.statusHistory s WHERE s.status = 'REJECTED'")
    long countRejectBooks();

    @Query("SELECT COUNT(b) FROM BorrowBook b JOIN b.statusHistory s WHERE s.status = 'OVERDUE'")
    long countOverdueBooks();
}
