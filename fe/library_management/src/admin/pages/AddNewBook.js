import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import api from '../../api/server';
import Swal from 'sweetalert2';
import { useStoreActions, useStoreState } from 'easy-peasy';
import { getToken } from '../../services/localStorageService';

const AddNewBook = () => {
    const [formData, setFormData] = useState({
        bookName: '',
        author: '',
        categoryId: '',
        available: 0,
        images: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState(null); 

    const getBookCategories = useStoreActions((actions) => actions.getBookCategories);
    const bookCategories = useStoreState((state) => state.bookCategories);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const accessToken = getToken();
                await getBookCategories(accessToken);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, [getBookCategories]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'available' ? parseInt(value) || 0 : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData(prev => ({
            ...prev,
            images: file
        }));

        //  Hiển thị ảnh preview
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewImage(event.target.result);
            };
            reader.readAsDataURL(file); // Chuyển đổi file ảnh có thể dùng trong thẻ img
        } else {
            setPreviewImage(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const accessToken = getToken();
            const formDataToSend = new FormData();

            const bookData = {
                bookName: formData.bookName,
                author: formData.author,
                categoryName: { id: formData.categoryId },
                available: formData.available
            };

            const bookDataBlob = new Blob([JSON.stringify(bookData)], {
                type: 'application/json'
            });
            formDataToSend.append('bookData', bookDataBlob);

            if (formData.images) {
                formDataToSend.append('images', formData.images);
            }

            const response = await api.post("/books", formDataToSend, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.code === 1000) {
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Thêm sách mới thành công!',
                    confirmButtonColor: '#3085d6',
                });

                // Reset form
                setFormData({
                    bookName: '',
                    author: '',
                    categoryId: '',
                    available: 0,
                    images: null
                });
                setPreviewImage(null);
                document.getElementById("bookForm")?.reset();
            }
        } catch (error) {
            console.error("Upload error:", error);
            const errorMsg = error.response?.data?.message || error.message || "Lỗi không xác định khi thêm sách.";
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
                                <h4 className="mb-0">Thêm sách mới</h4>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit} id="bookForm">

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
                                            {bookCategories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.categoryName}
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
                                        {previewImage && (
                                            <div className="mb-2">
                                                <img
                                                    src={previewImage}
                                                    alt="Book preview"
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
                                            required
                                        />
                                        <div className="form-text">Chỉ chấp nhận file ảnh (JPG, PNG, JPEG)</div>
                                    </div>

                                    {/* Nút submit */}
                                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                        <button
                                            type="reset"
                                            className="btn btn-secondary me-md-2"
                                            onClick={() => {
                                                setFormData({
                                                    bookName: '',
                                                    author: '',
                                                    categoryId: '',
                                                    available: 0,
                                                    images: null
                                                });
                                                setPreviewImage(null);
                                            }}
                                        >
                                            Nhập lại
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Đang xử lý...' : 'Thêm sách'}
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

export default AddNewBook;
