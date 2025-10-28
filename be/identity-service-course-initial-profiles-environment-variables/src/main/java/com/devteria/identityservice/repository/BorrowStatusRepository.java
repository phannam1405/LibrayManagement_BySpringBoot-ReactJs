package com.devteria.identityservice.repository;

import com.devteria.identityservice.entity.BorrowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BorrowStatusRepository extends JpaRepository<BorrowStatus, String> {
}
