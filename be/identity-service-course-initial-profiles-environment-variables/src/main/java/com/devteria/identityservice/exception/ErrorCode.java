package com.devteria.identityservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Uncategorized error", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "User existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),
    BOOK_CATEGORY_EXISTED(1009, "Book category existed", HttpStatus.BAD_REQUEST),
    BOOK_EXISTED(1100, "Book  existed", HttpStatus.BAD_REQUEST),
    CATEGORY_NOT_FOUND(1101, "Book category not found", HttpStatus.BAD_REQUEST),
    BOOK_NOT_EXISTED(1102, "Book not exited", HttpStatus.NOT_FOUND),
    ROLE_NOT_FOUND(1103, "Role not found", HttpStatus.NOT_FOUND),
    BOOK_NOT_AVAILABLE(1104, "Book not available", HttpStatus.NOT_FOUND),
    BORROW_NOT_FOUND(1105, "No transaction", HttpStatus.NOT_FOUND),
    INVALID_STATUS_TRANSITION(1106,"Không thể chuyển sang cùng trạng thái hiện tại", HttpStatus.BAD_REQUEST),
    STATUS_IS_FINAL(1107,  "Chỉ có thể thay đổi trạng thái từ 'Đang mượn'", HttpStatus.BAD_REQUEST);
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}
