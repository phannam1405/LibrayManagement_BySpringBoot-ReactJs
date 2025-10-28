package com.devteria.identityservice.repository;

import com.devteria.identityservice.entity.BookCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookCategoryRepository extends JpaRepository<BookCategory, String> {
    @Query("SELECT bc.categoryName, COUNT(b) FROM Book b JOIN b.categoryName bc GROUP BY bc.categoryName")
    List<Object[]> countBooksByCategory();
}
