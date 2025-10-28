package com.devteria.identityservice.service;

import com.devteria.identityservice.entity.Role;
import com.devteria.identityservice.exception.BorrowStatusType;
import com.devteria.identityservice.repository.BookCategoryRepository;
import com.devteria.identityservice.repository.BorrowBookRepository;
import com.devteria.identityservice.repository.RoleRepository;
import com.devteria.identityservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatisticsService {
    private final UserRepository userRepository;
    private final BookCategoryRepository bookCategoryRepository;
    private final BorrowBookRepository borrowBookRepository;
    private final RoleRepository roleRepository;

    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Long> getUserStatistics() {
        List<Role> allRoles = roleRepository.findAll();
        Map<String, Long> result = new HashMap<>();

        for (Role role : allRoles) {
            long count = userRepository.countByRoleName(role.getName());
            result.put(role.getName(), count);
        }

        // Thêm tổng số user
        result.put("TOTAL", userRepository.count());

        return result;
    }

    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Long> getBookStatistics() {
        Map<String, Long> result = new HashMap<>();
        List<Object[]> categoryCounts = bookCategoryRepository.countBooksByCategory();

        categoryCounts.forEach(item -> {
            String categoryName = (String) item[0];
            Long count = (Long) item[1];
            result.put(categoryName, count);
        });

        // Add total books count
        result.put("TOTAL", categoryCounts.stream().mapToLong(item -> (Long) item[1]).sum());

        return result;
    }

    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Long> getBorrowStatistics() {
        Map<String, Long> result = new HashMap<>();
        result.put("TOTAL", borrowBookRepository.countAllBorrowBooks());
        result.put(BorrowStatusType.BORROWING.getDescription(), borrowBookRepository.countBorrowingBooks());
        result.put(BorrowStatusType.RETURNED.getDescription(), borrowBookRepository.countReturnedBooks());
        result.put(BorrowStatusType.OVERDUE.getDescription(), borrowBookRepository.countOverdueBooks());
        result.put(BorrowStatusType.REJECTED.getDescription(), borrowBookRepository.countRejectBooks());
        result.put(BorrowStatusType.PENDING.getDescription(), borrowBookRepository.countPendingBooks());

        return result;
    }
}