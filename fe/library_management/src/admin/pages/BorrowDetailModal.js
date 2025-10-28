import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const STATUS_CONFIG = {
  PENDING: { value: 'PENDING', label: 'Đã đặt', color: 'text-warning', bgColor: 'bg-warning-light' },
  REJECTED: { value: 'REJECTED', label: 'Từ chối', color: 'text-danger', bgColor: 'bg-danger-light' },
  BORROWING: { value: 'BORROWING', label: 'Đang mượn', color: 'text-primary', bgColor: 'bg-primary-light' },
  RETURNED: { value: 'RETURNED', label: 'Đã trả', color: 'text-success', bgColor: 'bg-success-light' },
  OVERDUE: { value: 'OVERDUE', label: 'Quá hạn', color: 'text-danger', bgColor: 'bg-danger-light' },
  AGREE: { value: 'AGREE', label: 'Đồng ý', color: 'text-success', bgColor: 'bg-success-light' }
};

const BorrowDetailModal = ({ show, onClose, borrowDetail }) => {
  if (!show || !borrowDetail) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('vi-VN', options);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1050
    }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Chi tiết mượn sách</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            >
             
            </button>
          </div>
          <div className="modal-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <h6>Thông tin người mượn</h6>
                <p><strong>Tên:</strong> {borrowDetail.user.firstName} {borrowDetail.user.lastName}</p>
                <p><strong>Username:</strong> {borrowDetail.user.username}</p>
              </div>
              <div className="col-md-6">
                <h6>Thông tin sách</h6>
                <p><strong>Tên sách:</strong> {borrowDetail.book.bookName}</p>
                <p><strong>Tác giả:</strong> {borrowDetail.book.author}</p>
                <p><strong>Số lượng:</strong> {borrowDetail.quantity}</p>
                <p><strong>Ngày mượn:</strong> {formatDate(borrowDetail.borrowDate)}</p>
                <p><strong>Ngày trả:</strong> {formatDate(borrowDetail.returnDate)}</p>
              </div>
            </div>

            <h6>Lịch sử trạng thái</h6>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Trạng thái</th>
                    <th>Mô tả</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowDetail.statusHistory.map((status, index) => (
                    <tr key={index}>
                      <td>{new Date(status.createdAt).toLocaleString('vi-VN')}</td>
                      <td>
                        <span className={`badge ${STATUS_CONFIG[status.status]?.bgColor || 'bg-secondary'} ${STATUS_CONFIG[status.status]?.color || 'text-white'}`}>
                          {STATUS_CONFIG[status.status]?.label || status.status}
                        </span>
                      </td>
                      <td>{status.statusDescription}</td>
                      <td>{status.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowDetailModal;