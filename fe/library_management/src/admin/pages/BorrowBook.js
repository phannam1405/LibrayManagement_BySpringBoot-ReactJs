import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import api from '../../api/server';
import Swal from 'sweetalert2';
import { getToken } from '../../services/localStorageService';
import Select from 'react-select';
import { useStoreState, useStoreActions } from 'easy-peasy';

const BorrowBook = () => {
    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const [formData, setFormData] = useState({
        userId: '',
        bookId: '',
        quantity: '',
        borrowDate: getCurrentDate(),
        returnDate: '',
    });

    // Lấy state và actions từ store
    const { books, isLoading: isBooksLoading } = useStoreState(state => ({
        books: state.books,
        isLoading: state.isLoading
    }));

    const { getBooks } = useStoreActions(actions => ({
        getBooks: actions.getBooks
    }));

    const [isSubmitting, setIsSubmitting] = useState(false);
    const accessToken = getToken();

    // Fetch books khi component mount
    useEffect(() => {
        getBooks(accessToken);
    }, [getBooks, accessToken]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBookChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            bookId: selectedOption.value,
            quantity: 1 // Set mặc định quantity là 1
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra ngày trả
        const today = new Date();
        const returnDate = new Date(formData.returnDate);

        if (returnDate <= today) {
            Swal.fire('Error', 'Return date must be in the future', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await api.post('/borrow_book/offline', formData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (response.data.code === 1000) {
                Swal.fire('Success', 'Book borrowed successfully!', 'success');

                // Fetch lại danh sách sách để cập nhật số lượng
                await getBooks(accessToken);

                setFormData({
                    userId: '',
                    bookId: '',
                    quantity: '',
                    returnDate: '',
                });
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to borrow book', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Format books data cho Select component
    const bookOptions = books.map(book => ({
        value: book.id,
        label: `${book.bookName} (${book.author}) - Còn lại: ${book.available}`,
        data: book
    }));

    return (
        <AdminLayout>
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card shadow">
                            <div className="card-header bg-primary text-white">
                                <h4 className="mb-0">Borrow book</h4>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label">
                                            CCCD <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="userId"
                                            name="userId"
                                            value={formData.userId}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="bookSelect" className="form-label">
                                            Book <span className="text-danger">*</span>
                                        </label>
                                        <Select
                                            id="bookSelect"
                                            options={bookOptions}
                                            onChange={handleBookChange}
                                            isLoading={isBooksLoading}
                                            placeholder="Search for a book..."
                                            noOptionsMessage={() => "No books found"}
                                            isSearchable
                                            required
                                        />
                                        <input
                                            type="hidden"
                                            name="bookId"
                                            value={formData.bookId}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="quantity" className="form-label">
                                            Quantity <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="quantity"
                                            name="quantity"
                                            min="1"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="borrowDate" className="form-label">
                                            Borrow Date <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            id="borrowDate"
                                            name="borrowDate"
                                            value={formData.borrowDate}
                                            onChange={handleChange}
                                            required
                                        />

                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="returnDate" className="form-label">
                                            Return Date <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            id="returnDate"
                                            name="returnDate"
                                            value={formData.returnDate}
                                            onChange={handleChange}
                                            required
                                            min={new Date().toISOString().split('T')[0]} // Không cho chọn ngày trong quá khứ
                                        />
                                        {formData.returnDate && new Date(formData.returnDate) <= new Date() && (
                                            <div className="text-danger mt-1">Return date must be in the future</div>
                                        )}
                                    </div>

                                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                        <button
                                            type="button"
                                            className="btn btn-secondary me-md-2"
                                            onClick={() => window.history.back()}
                                            disabled={isSubmitting}
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Processing...
                                                </>
                                            ) : 'Borrow Book'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default BorrowBook;