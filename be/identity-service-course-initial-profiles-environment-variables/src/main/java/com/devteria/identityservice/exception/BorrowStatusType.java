package com.devteria.identityservice.exception;


public enum BorrowStatusType {
    PENDING("Đã đặt", "Đơn đặt chờ xử lý"), // Dành cho sau này
    REJECTED("Từ chối", "Đơn mượn bị từ chối"), // Dành cho sau này
    BORROWING("Đang mượn", "Đơn sách đang được mượn"), // Mượn trực tiếp
    RETURNED("Đã trả", "Sách đã được trả"),
    AGREE("Đồng ý", "Chấp nhận đơn mượn"),
    OVERDUE("Quá hạn", "Quá hạn trả sách");

    private final String displayName;
    private final String description;

    BorrowStatusType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}