package com.devteria.identityservice.service;

import com.devteria.identityservice.dto.request.BorrowBookRequest;
import com.devteria.identityservice.dto.response.BorrowBookResponse;
import com.devteria.identityservice.entity.Book;
import com.devteria.identityservice.entity.BorrowBook;
import com.devteria.identityservice.entity.User;
import com.devteria.identityservice.exception.AppException;
import com.devteria.identityservice.exception.BorrowStatusType;
import com.devteria.identityservice.exception.ErrorCode;
import com.devteria.identityservice.mapper.BorrowBookMapper;
import com.devteria.identityservice.repository.BookRepository;
import com.devteria.identityservice.repository.BorrowBookRepository;
import com.devteria.identityservice.repository.BorrowStatusRepository;
import com.devteria.identityservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;


@Service
@RequiredArgsConstructor
@Slf4j
public class BorrowBookService {
    private final BorrowBookRepository borrowBookRepository;
    private final BorrowBookMapper borrowBookMapper;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final BorrowStatusRepository borrowStatusRepository;

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public BorrowBookResponse createBorrowBook(BorrowBookRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_EXISTED));

        if (book.getAvailable() < request.getQuantity()) {
            throw new AppException(ErrorCode.BOOK_NOT_AVAILABLE);
        }

        BorrowBook borrowBook = borrowBookMapper.toBorrowBook(request);
        borrowBook.setUser(user);
        borrowBook.setBook(book);
        borrowBook.setBorrowDate(request.getBorrowDate());


        borrowBook.addStatus(BorrowStatusType.BORROWING, "Mượn sách trực tiếp");

        // Trừ sách khỏi kho
        book.setAvailable(book.getAvailable() - request.getQuantity());
        bookRepository.save(book);

        borrowBook = borrowBookRepository.save(borrowBook);
        return borrowBookMapper.toBorrowBookResponse(borrowBook);
    }


    public BorrowBookResponse createBorrowBookOnline(BorrowBookRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_EXISTED));

        if (book.getAvailable() < request.getQuantity()) {
            throw new AppException(ErrorCode.BOOK_NOT_AVAILABLE);
        }

        BorrowBook borrowBook = borrowBookMapper.toBorrowBook(request);
        borrowBook.setUser(user);
        borrowBook.setBook(book);
        borrowBook.setBorrowDate(request.getBorrowDate());


        borrowBook.addStatus(BorrowStatusType.PENDING, "Đơn đặt chờ xử lý");

        // Trừ sách khỏi kho
        book.setAvailable(book.getAvailable() - request.getQuantity());
        bookRepository.save(book);

        borrowBook = borrowBookRepository.save(borrowBook);
        return borrowBookMapper.toBorrowBookResponse(borrowBook);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public BorrowBookResponse updateBorrowStatus(String borrowId, String status, String note) {
        BorrowBook borrowBook = borrowBookRepository.findById(borrowId)
                .orElseThrow(() -> new AppException(ErrorCode.BORROW_NOT_FOUND));

        BorrowStatusType newStatus = BorrowStatusType.valueOf(status.toUpperCase());
        return processStatusUpdate(borrowBook, newStatus, note);
    }

    private BorrowBookResponse processStatusUpdate(BorrowBook borrowBook,
                                                   BorrowStatusType newStatus,
                                                   String note) {
        Book book = borrowBook.getBook();
        int quantity = borrowBook.getQuantity();

        switch (newStatus) {
            case RETURNED:
                // Trả sách về kho
                book.setAvailable(book.getAvailable() + quantity);
                borrowBook.setReturnDate(LocalDate.now());
                break;

            case OVERDUE:
                // Ghi nhận quá hạn, không thay đổi số lượng sách
                break;

            default:
                // Không xử lý đặc biệt cho các trạng thái khác
                break;
        }

        bookRepository.save(book);
        borrowBook.addStatus(newStatus, note);
        borrowBook = borrowBookRepository.save(borrowBook);

        return borrowBookMapper.toBorrowBookResponse(borrowBook);
    }

    private BorrowStatusType getCurrentStatus(BorrowBook borrowBook) {
        if (borrowBook.getStatusHistory() == null || borrowBook.getStatusHistory().isEmpty()) {
            return BorrowStatusType.BORROWING; // Mặc định là BORROWING cho mượn trực tiếp
        }
        borrowBook.getStatusHistory().sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return BorrowStatusType.valueOf(borrowBook.getStatusHistory().get(0).getStatus());
    }



    @PreAuthorize("hasRole('ADMIN')")
    public List<BorrowBookResponse> getListBorrow() {
        log.info("In method get Users");
        return borrowBookRepository.findAll().stream()
                .map(borrowBookMapper::toBorrowBookResponse)
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteBorrowBook(String borrowId) {
        BorrowBook borrowBook = borrowBookRepository.findById(borrowId)
                .orElseThrow(() -> new AppException(ErrorCode.BORROW_NOT_FOUND));

        BorrowStatusType currentStatus = getCurrentStatus(borrowBook);


        if (currentStatus == BorrowStatusType.BORROWING) {
            Book book = borrowBook.getBook();
            book.setAvailable(book.getAvailable() + borrowBook.getQuantity());
            bookRepository.save(book);
        }

        borrowBookRepository.delete(borrowBook);
    }


    @PreAuthorize("hasRole('ADMIN')")
    public BorrowBookResponse getDetailsBorrow(String borrowId) {
        BorrowBook borrowBook = borrowBookRepository.findById(borrowId)
                .orElseThrow(() -> new AppException(ErrorCode.BORROW_NOT_FOUND));

        BorrowBookResponse response = borrowBookMapper.toBorrowBookResponse(borrowBook);

        // Sắp xếp lại statusHistory
        if (response.getStatusHistory() != null) {
            response.getStatusHistory().sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        }

        return response;
    }
}