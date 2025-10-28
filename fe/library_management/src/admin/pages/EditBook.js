import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { useStoreState, useStoreActions } from 'easy-peasy';
import { useParams, useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../api/server';
import { getToken } from '../../services/localStorageService';

const EditBook = () => {
    const history = useHistory()
    const { id } = useParams();
    
    const token = getToken();
    
    const books = useStoreState((state) => state.books);
    const getBooks = useStoreActions((actions) => actions.getBooks);
    const getBookCategories = useStoreActions((actions) => actions.getBookCategories);
    const categories = useStoreState((state) => state.bookCategories);
    
    const [formData, setFormData] = useState({
        bookName: '',
        author: '',
        categoryId: '',
        available: 0,
        images: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);

    // Load dữ liệu sách và danh mục
    useEffect(() => {
        const token = getToken()
        console.log(token)
        const fetchData = async () => {
            try {
                await getBooks(token);
                await getBookCategories(token);
                
                const bookToEdit = books.find(book => book.id === id);
                if (bookToEdit) {
                    setFormData({
                        bookName: bookToEdit.bookName,
                        author: bookToEdit.author,
                        categoryId: bookToEdit.categoryName?.id || '',
                        available: bookToEdit.available,
                        images: null
                    });
                    setCurrentImage(bookToEdit.imageUrl);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        
        fetchData();
    }, [id, getBooks, getBookCategories, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'available' ? parseInt(value) || 0 : value
        }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            images: e.target.files[0]
        }));
        
        // Hiển thị preview ảnh mới
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setCurrentImage(event.target.result);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();
            
            // Tạo đối tượng bookData
            const bookData = {
                bookName: formData.bookName,
                author: formData.author,
                categoryName: { id: formData.categoryId },
                available: formData.available
            };

            // Thêm bookData dưới dạng Blob với Content-Type application/json
            const bookDataBlob = new Blob([JSON.stringify(bookData)], {
                type: 'application/json'
            });
            formDataToSend.append('bookData', bookDataBlob);

            // Thêm file ảnh 
            if (formData.images) {
                formDataToSend.append('images', formData.images);
            }

            const response = await api.put(`/books/${id}`, formDataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.code === 1000) {
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Cập nhật sách thành công!',
                    confirmButtonColor: '#3085d6',
                }).then(() => {
                    history.push('/list-books');
                });
            }
        } catch (error) {
            console.error('Update failed:', error);
            const errorMsg = error.response?.data?.message || error.message || "Lỗi không xác định khi cập nhật sách.";
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: errorMsg,
                confirmButtonColor: '#d33',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AdminLayout>
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card shadow">
                            <div className="card-header bg-primary text-white">
                                <h4 className="mb-0">Chỉnh sửa thông tin sách</h4>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    {/* Tên sách */}
                                    <div className="mb-3">
                                        <label htmlFor="bookName" className="form-label">
                                            Tên sách <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="bookName"
                                            name="bookName"
                                            value={formData.bookName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* Tác giả */}
                                    <div className="mb-3">
                                        <label htmlFor="author" className="form-label">
                                            Tác giả <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="author"
                                            name="author"
                                            value={formData.author}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* Danh mục */}
                                    <div className="mb-3">
                                        <label htmlFor="categoryId" className="form-label">
                                            Danh mục <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className="form-select"
                                            id="categoryId"
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Chọn danh mục</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.categoryName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Số lượng có sẵn */}
                                    <div className="mb-3">
                                        <label htmlFor="available" className="form-label">
                                            Số lượng <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="available"
                                            name="available"
                                            value={formData.available}
                                            onChange={handleChange}
                                            min="0"
                                            required
                                        />
                                    </div>

                                    {/* Ảnh bìa */}
                                    <div className="mb-3">
                                        <label htmlFor="images" className="form-label">
                                            Ảnh bìa
                                        </label>
                                        {currentImage && (
                                            <div className="mb-2">
                                                <img 
                                                    src={currentImage} 
                                                    alt="Current book cover" 
                                                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                                                    className="img-thumbnail"
                                                />
                                            </div>
                                        )}
                                        <input
                                            className="form-control"
                                            type="file"
                                            id="images"
                                            name="images"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                        <div className="form-text">Chỉ chấp nhận file ảnh (JPG, PNG, JPEG)</div>
                                    </div>

                                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                        <button
                                            type="button"
                                            className="btn btn-secondary me-md-2"
                                            onClick={() => history.push('/list-books')}
                                        >
                                            Quay lại
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Đang xử lý...' : 'Cập nhật'}
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

export default EditBook;