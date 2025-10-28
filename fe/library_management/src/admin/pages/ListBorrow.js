import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTimes, faInfoCircle, faSyncAlt, faSpinner, faBook, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import api from '../../api/server';
import { getToken } from '../../services/localStorageService';
import Swal from 'sweetalert2';
import BorrowDetailModal from './BorrowDetailModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Cấu hình trạng thái
const STATUS_CONFIG = {
  PENDING: { value: 'PENDING', label: 'Đã đặt', color: 'text-warning', bgColor: 'bg-warning-light' },
  REJECTED: { value: 'REJECTED', label: 'Từ chối', color: 'text-danger', bgColor: 'bg-danger-light' },
  BORROWING: { value: 'BORROWING', label: 'Đang mượn', color: 'text-primary', bgColor: 'bg-primary-light' },
  RETURNED: { value: 'RETURNED', label: 'Đã trả', color: 'text-success', bgColor: 'bg-success-light' },
  OVERDUE: { value: 'OVERDUE', label: 'Quá hạn', color: 'text-danger', bgColor: 'bg-danger-light' },
  AGREE: { value: 'AGREE', label: 'Đồng ý', color: 'text-success', bgColor: 'bg-danger-light' }

};

const ListBorrow = () => {
  const [originalBorrows, setOriginalBorrows] = useState([]);
  const [filteredBorrows, setFilteredBorrows] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentBorrowDetail, setCurrentBorrowDetail] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');


  const [borrowDateFilter, setBorrowDateFilter] = useState(null);
  const [returnDateFilter, setReturnDateFilter] = useState(null);

  const token = getToken();

  // Format ngày tháng
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('vi-VN', options);
    } catch {
      return dateString;
    }
  }, []);

  // Hàm kiểm tra ngày trùng khớp
  const isSameDate = useCallback((dateString, filterDate) => {
    if (!dateString || !filterDate) return true;
    try {
      const date = new Date(dateString);
      const filter = new Date(filterDate);
      return (
        date.getDate() === filter.getDate() &&
        date.getMonth() === filter.getMonth() &&
        date.getFullYear() === filter.getFullYear()
      );
    } catch {
      return false;
    }
  }, []);

  // Lấy trạng thái mới nhất
  const getLatestStatus = useCallback((statusHistory) => {
    if (!statusHistory || statusHistory.length === 0) {
      return { status: 'PENDING', statusDescription: 'Đã đặt', createdAt: new Date().toISOString() };
    }

    const sorted = [...statusHistory].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    return sorted[0];
  }, []);

  // Fetch dữ liệu
  const fetchBorrows = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/borrow_book', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const normalizedData = response.data.result.map(borrow => {
        const latestStatus = getLatestStatus(borrow.statusHistory);
        const statusValue = latestStatus?.status || 'PENDING';

        return {
          ...borrow,
          statusValue,
          statusLabel: STATUS_CONFIG[statusValue]?.label || latestStatus?.statusDescription,
          statusColor: STATUS_CONFIG[statusValue]?.color,
          statusBgColor: STATUS_CONFIG[statusValue]?.bgColor
        };
      });

      setOriginalBorrows(normalizedData);
      setFilteredBorrows(normalizedData);
      setSearchTerm('');
      setSelectedStatus('ALL');
      // Reset các ngày tìm kiếm
      setBorrowDateFilter(null);
      setReturnDateFilter(null);
    } catch (error) {
      console.error('Error fetching borrows:', error);
      Swal.fire('Lỗi!', 'Không thể tải dữ liệu mượn sách', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [token, getLatestStatus]);

  // Load dữ liệu ban đầu
  useEffect(() => {
    fetchBorrows();
  }, [fetchBorrows]);

  // Xử lý tìm kiếm
  useEffect(() => {
    const filtered = originalBorrows.filter(borrow => {
      const statusMatch = selectedStatus === 'ALL' ||
        borrow.statusValue === selectedStatus;

      const keywordMatch = searchTerm === '' ||
        borrow.book.bookName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${borrow.user.firstName} ${borrow.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        borrow.user.username.toLowerCase().includes(searchTerm.toLowerCase());

      // Kiểm tra ngày mượn
      const borrowDateMatch = isSameDate(borrow.borrowDate, borrowDateFilter);

      // Kiểm tra ngày trả
      const returnDateMatch = isSameDate(borrow.returnDate, returnDateFilter);

      return statusMatch && keywordMatch && borrowDateMatch && returnDateMatch;
    });

    setFilteredBorrows(filtered);
  }, [
    searchTerm,
    selectedStatus,
    originalBorrows,
    borrowDateFilter,
    returnDateFilter,
    isSameDate
  ]);



  const handleShowDetail = async (borrowId) => {
    try {
      const response = await api.get(`/borrow_book/${borrowId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentBorrowDetail(response.data.result);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching borrow detail:', error);
      Swal.fire('Lỗi!', 'Không thể tải chi tiết mượn sách', 'error');
    }
  };


  const sendStatusEmail = async (borrow, status, reason = '') => {
  try {
    let subject, htmlContent;

    if (status === 'REJECTED') {
      subject = `Thông báo từ chối đơn mượn sách #${borrow.id}`;
      htmlContent = `
        <h2>Đơn mượn sách của bạn đã bị từ chối</h2>
        <p>Xin chào <strong>${borrow.user.firstName} ${borrow.user.lastName}</strong>,</p>
        <p>Chúng tôi rất tiếc phải thông báo rằng đơn mượn sách của bạn đã bị từ chối.</p>
        <p><strong>Chi tiết đơn mượn:</strong></p>
        <ul>
          <li>Sách: ${borrow.book.bookName}</li>
          <li>Số lượng: ${borrow.quantity}</li>
          <li>Ngày mượn: ${formatDate(borrow.borrowDate)}</li>
          <li>Lý do: ${reason}</li>
        </ul>
        <p>Vui lòng liên hệ với thư viện nếu bạn có bất kỳ câu hỏi nào.</p>
        <p>Trân trọng,<br>Thư viện</p>
      `;
    } else if (status === 'AGREE') {
      subject = `Thông báo chấp thuận đơn mượn sách #${borrow.id}`;
      htmlContent = `
        <h2>Đơn mượn sách của bạn đã được chấp thuận</h2>
        <p>Xin chào <strong>${borrow.user.firstName} ${borrow.user.lastName}</strong>,</p>
        <p>Chúng tôi vui mừng thông báo rằng đơn mượn sách của bạn đã được chấp thuận.</p>
        <p><strong>Chi tiết đơn mượn:</strong></p>
        <ul>
          <li>Sách: ${borrow.book.bookName}</li>
          <li>Số lượng: ${borrow.quantity}</li>
          <li>Ngày mượn: ${formatDate(borrow.borrowDate)}</li>
          <li>Ngày trả dự kiến: ${formatDate(borrow.returnDate)}</li>
        </ul>
        <p>Vui lòng đến thư viện ở địa chỉ 470TDN để nhận sách theo lịch trình.</p>
        <p>Trân trọng,<br>Thư viện</p>
      `;
    }else if (status === 'OVERDUE') {
      subject = `Thông báo quá hạn đơn mượn sách #${borrow.id}`;
      htmlContent = `
        <h2>Đơn mượn sách của bạn đã quá thời hạn trả sách</h2>
        <p>Xin chào <strong>${borrow.user.firstName} ${borrow.user.lastName}</strong>,</p>
        <p>Chúng tôi xin thông báo rằng đơn mượn sách của bạn đã quá hạn trả.</p>
        <p><strong>Chi tiết đơn mượn:</strong></p>
        <ul>
          <li>Sách: ${borrow.book.bookName}</li>
          <li>Số lượng: ${borrow.quantity}</li>
          <li>Ngày mượn: ${formatDate(borrow.borrowDate)}</li>
          <li>Ngày trả dự kiến: ${formatDate(borrow.returnDate)}</li>
        </ul>
        <p>Vui lòng đến thư viện để trả lại sách sớm nhất. Mọi trường hợp làm hư tổn sách sẽ bị sử lý theo quy định của thư viện</p>
        <p>Trân trọng,<br>Thư viện</p>
      `;
    }

    // Gọi API gửi email
    await api.post(
      '/email/send-html',
      {
        toEmail: borrow.user.email,
        subject: subject,
        htmlContent: htmlContent
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    Swal.fire({
      title: 'Thành công!',
      text: `Đã cập nhật trạng thái và gửi email thông báo`,
      icon: 'success',
      timer: 3000
    });
  } catch (error) {
    console.error('Error sending email:', error);
    Swal.fire({
      title: 'Lỗi!',
      text: 'Cập nhật trạng thái thành công nhưng không thể gửi email thông báo',
      icon: 'warning'
    });
  }
};

  // Xử lý thay đổi trạng thái
const handleStatusChange = async (borrowId, oldStatusValue, newStatusValue) => {
  if (oldStatusValue === newStatusValue) return;

  try {
    setUpdatingId(borrowId);
    const borrow = filteredBorrows.find(b => b.id === borrowId);

    // Xử lý từ chối
    if (newStatusValue === 'REJECTED') {
      const { value: reason } = await Swal.fire({
        title: 'Lý do từ chối',
        input: 'text',
        inputLabel: 'Nhập lý do từ chối',
        showCancelButton: true,
        inputValidator: (value) => !value && 'Vui lòng nhập lý do!'
      });

      if (!reason) {
        setUpdatingId(null);
        return;
      }

      const confirmResult = await Swal.fire({
        title: 'Xác nhận từ chối?',
        text: 'Bạn chắc chắn muốn từ chối đơn mượn này?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Từ chối',
        cancelButtonText: 'Hủy'
      });

      if (!confirmResult.isConfirmed) {
        setUpdatingId(null);
        return;
      }

      await updateStatus(borrowId, newStatusValue, `Từ chối: ${reason}`);
      
      // Gửi email thông báo từ chối
      await sendStatusEmail(borrow, 'REJECTED', reason);
      return;
    }

    // Xử lý đồng ý
    if (newStatusValue === 'AGREE') {
      const confirmResult = await Swal.fire({
        title: 'Xác nhận đồng ý?',
        html: `Xác nhận <b>đồng ý</b> cho đơn mượn sách này?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy'
      });

      if (!confirmResult.isConfirmed) {
        setUpdatingId(null);
        return;
      }

      await updateStatus(borrowId, newStatusValue, `Đã đồng ý đơn mượn`);
      
      // Gửi email thông báo đồng ý
      await sendStatusEmail(borrow, 'AGREE');
      return;
    }

        // Xử lý quá hạn
    if (newStatusValue === 'OVERDUE') {
      const confirmResult = await Swal.fire({
        title: 'Thông báo quá hạn',
        html: `Thông báo <b>quá hạn</b> cho đơn mượn sách này?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Gửi thông báo',
        cancelButtonText: 'Hủy'
      });

      if (!confirmResult.isConfirmed) {
        setUpdatingId(null);
        return;
      }

      await updateStatus(borrowId, newStatusValue, `Đã thông báo quá hạn`);
      
      // Gửi email thông báo đồng ý
      await sendStatusEmail(borrow, 'OVERDUE');
      return;
    }

    // Xử lý các trạng thái khác
    const result = await Swal.fire({
      title: 'Xác nhận thay đổi',
      html: `Chuyển từ <b>${STATUS_CONFIG[oldStatusValue]?.label}</b> sang <b>${STATUS_CONFIG[newStatusValue]?.label}</b>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      await updateStatus(borrowId, newStatusValue, `Change status from ${oldStatusValue} to ${newStatusValue}`);
    }
  } catch (error) {
    handleUpdateError(error, borrowId, oldStatusValue);
  } finally {
    setUpdatingId(null);
  }
};

  const updateStatus = async (borrowId, status, note) => {
    const response = await api.put(
      `/borrow_book/${borrowId}`,
      { status, note },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    //prev (giá trị trước đó của state)
    //duyệt qua mảng và chỉ cập nhật đơn mượn có id trùng với borrowId
    setOriginalBorrows(prev => prev.map(b =>
      b.id === borrowId ? updateBorrowStatus(b, response.data.result) : b
    ));

    Swal.fire('Thành công!', 'Đã cập nhật trạng thái', 'success');
  };

  const updateBorrowStatus = (borrow, updatedData) => {
    const latestStatus = getLatestStatus(updatedData.statusHistory);
    return {
      ...borrow,
      statusValue: latestStatus.status,
      statusLabel: latestStatus.statusDescription,
      statusColor: STATUS_CONFIG[latestStatus.status]?.color,
      statusBgColor: STATUS_CONFIG[latestStatus.status]?.bgColor
    };
  };

  const handleUpdateError = (error, borrowId, oldStatusValue) => {
    console.error('Update error:', error.response?.data || error.message);
    Swal.fire(
      'Lỗi!',
      error.response?.data?.message || 'Cập nhật trạng thái thất bại',
      'error'
    );

    setOriginalBorrows(prev => prev.map(b =>
      b.id === borrowId ? { ...b, statusValue: oldStatusValue } : b
    ));
  };

  // Xử lý xóa
  const handleDelete = async (borrowId) => {
    try {
      setDeletingId(borrowId);
      const result = await Swal.fire({
        title: 'Xác nhận xóa?',
        text: "Bạn không thể hoàn tác hành động này!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        await api.delete(`/borrow_book/${borrowId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setOriginalBorrows(prev => prev.filter(b => b.id !== borrowId));
        Swal.fire('Đã xóa!', 'Bản ghi đã được xóa thành công.', 'success');
      }
    } catch (error) {
      console.error('Delete error:', error.response?.data || error.message);
      Swal.fire('Lỗi!', error.response?.data?.message || 'Xóa bản ghi thất bại', 'error');
    } finally {
      setDeletingId(null);
    }
  };



  if (isLoading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
          <div className="text-center">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
            <p className="mt-3">Đang tải dữ liệu...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <BorrowDetailModal
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        borrowDetail={currentBorrowDetail}
      />

      <div className="container-fluid py-4">
        <div className="card shadow-lg">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h4 className="mb-0">
              <i className="fas fa-book-reader me-2"></i>
              Quản lý mượn sách
            </h4>
            <button
              onClick={fetchBorrows}
              className="btn btn-sm btn-light"
              disabled={!!updatingId}
            >
              <FontAwesomeIcon
                icon={faSyncAlt}
                spin={!!updatingId}
                className={updatingId ? 'text-primary' : ''}
              />
              {updatingId ? ' Đang cập nhật...' : ' Làm mới'}
            </button>
          </div>

          <div className="card-body p-3 border-bottom">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Trạng thái</label>
                <select
                  className="form-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  {Object.values(STATUS_CONFIG).map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-5">
                <label className="form-label">Tìm kiếm</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập tên sách hoặc người mượn..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setSearchTerm('')}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
              </div>
            </div>


            <div className="row g-3 mt-2">
              <div className="col-md-6">
                <label className="form-label">Ngày mượn</label>
                <div className="d-flex align-items-center gap-2">
                  <div className="input-group">
                    <span className="input-group-text">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                    </span>
                    <DatePicker
                      selected={borrowDateFilter}
                      onChange={(date) => setBorrowDateFilter(date)}
                      placeholderText="Chọn ngày mượn"
                      className="form-control"
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>
                  {borrowDateFilter && (
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setBorrowDateFilter(null)}
                      title="Xóa lọc ngày mượn"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label">Ngày trả</label>
                <div className="d-flex align-items-center gap-2">
                  <div className="input-group">
                    <span className="input-group-text">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                    </span>
                    <DatePicker
                      selected={returnDateFilter}
                      onChange={(date) => setReturnDateFilter(date)}
                      placeholderText="Chọn ngày trả"
                      className="form-control"
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>
                  {returnDateFilter && (
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setReturnDateFilter(null)}
                      title="Xóa lọc ngày trả"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>




          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th width="50">STT</th>
                    <th>Người mượn</th>
                    <th>Email</th>
                    <th>Sách</th>
                    <th width="100">Số lượng</th>
                    <th width="120">Ngày mượn</th>
                    <th width="120">Ngày trả</th>
                    <th width="180">Trạng thái</th>
                    <th width="100">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBorrows.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-muted">
                        <FontAwesomeIcon icon={faBook} size="2x" className="mb-3" />
                        <p>Không có dữ liệu mượn sách</p>
                      </td>
                    </tr>
                  ) : (
                    filteredBorrows.map((borrow, index) => (
                      <tr key={borrow.id} className={updatingId === borrow.id ? 'table-info' : ''}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="fw-semibold">{borrow.user.username}</div>
                          <small className="text-muted">
                            {borrow.user.firstName} {borrow.user.lastName}
                          </small>
                        </td>
                        <td>{borrow.user.email}</td>
                        <td>
                          <div className="fw-semibold">{borrow.book.bookName}</div>
                          <small className="text-muted">{borrow.book.author}</small>
                        </td>
                        <td className="text-center">{borrow.quantity}</td>
                        <td>{formatDate(borrow.borrowDate)}</td>
                        <td>{formatDate(borrow.returnDate)}</td>
                        {/* trang thai */}
                        <td>
                          <div className={`d-flex align-items-center ${borrow.statusBgColor} p-2 rounded`}>
                            <select
                              className={`form-select form-select-sm border-0 shadow-none ${borrow.statusColor} ${borrow.statusBgColor}`}
                              value={borrow.statusValue}
                              onChange={(e) => handleStatusChange(borrow.id, borrow.statusValue, e.target.value)}
                              disabled={updatingId === borrow.id || deletingId === borrow.id}
                            >
                              {Object.values(STATUS_CONFIG).map(status => (
                                <option
                                  key={status.value}
                                  value={status.value}
                                  className={`${status.color} ${status.bgColor}`}
                                >
                                  {status.label}
                                </option>
                              ))}
                            </select>
                            {updatingId === borrow.id && (
                              <FontAwesomeIcon icon={faSpinner} spin className="ms-2 text-primary" />
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              onClick={() => handleShowDetail(borrow.id)}
                              className="btn btn-sm btn-info"
                              disabled={updatingId === borrow.id || deletingId === borrow.id}
                            >
                              <FontAwesomeIcon icon={faInfoCircle} />
                            </button>
                            <button
                              onClick={() => handleDelete(borrow.id)}
                              className="btn btn-sm btn-danger"
                              disabled={updatingId === borrow.id || deletingId === borrow.id}
                            >
                              {deletingId === borrow.id ? (
                                <FontAwesomeIcon icon={faSpinner} spin />
                              ) : (
                                <FontAwesomeIcon icon={faTrash} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card-footer bg-light d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Tổng số: <span className="fw-bold">{filteredBorrows.length}</span> bản ghi
            </small>
            <small className="text-muted">
              {Object.values(STATUS_CONFIG).map(status => (
                <span
                  key={status.value}
                  className={`badge ${status.bgColor} ${status.color} me-2`}
                >
                  {status.label}
                </span>
              ))}
            </small>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ListBorrow;