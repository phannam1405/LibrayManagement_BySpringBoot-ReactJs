import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { useStoreState, useStoreActions } from 'easy-peasy';
import { getToken } from '../../services/localStorageService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useHistory } from 'react-router-dom';
import api from '../../api/server'
const ListBooks = () => {
    const history = useHistory();
    const token = getToken();
    const books = useStoreState((state) => state.books);
    const getBooks = useStoreActions((actions) => actions.getBooks);
    const bookCategories = useStoreState((state) => state.bookCategories);
    const getBookCategories = useStoreActions((actions) => actions.getBookCategories);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [filteredBooks, setFilteredBooks] = useState([]);

    useEffect(() => {
        getBooks(token);
        getBookCategories(token);
    }, [getBooks, getBookCategories, token]);

    // Xử lý tìm kiếm và lọc
    useEffect(() => {
        const filtered = books.filter(book => {
            // Lọc theo danh mục
            const categoryMatch = selectedCategory === 'ALL' || 
                                book.categoryName === selectedCategory;
            
            // Tìm kiếm theo tên sách hoặc tác giả
            const searchMatch = searchTerm === '' ||
                book.bookName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.author.toLowerCase().includes(searchTerm.toLowerCase());

            return categoryMatch && searchMatch;
        });

        setFilteredBooks(filtered);
    }, [searchTerm, selectedCategory, books]);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Bạn có chắc muốn xóa sách này?");
        if (!confirmDelete) return;

        try {
            const response = await api.delete(`/books/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data.code === 1000) {
                getBooks(token); // Cập nhật lại danh sách sau khi xóa
            } else {
                alert("Xóa không thành công");
            }
        } catch (error) {
            console.error("Lỗi khi xóa:", error);
            alert("Có lỗi xảy ra khi xóa sách");
        }
    };

    return (
        <AdminLayout>
            <div className='container'>
                {/* Thanh tìm kiếm và lọc */}
                <div className="row mb-4">
                    <div className="col-md-6">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Tìm theo tên sách hoặc tác giả..."
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
                    <div className="col-md-4">
                        <select
                            className="form-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="ALL">Tất cả danh mục</option>
                            {bookCategories.map(category => (
                                <option key={category.id} value={category.categoryName}>
                                    {category.categoryName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <button 
                            className="btn btn-secondary w-100"
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('ALL');
                            }}
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Bảng hiển thị kết quả */}
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Tên sách</th>
                            <th scope="col">Danh mục</th>
                            <th scope="col">Tác giả</th>
                            <th>Số lượng</th>
                            <th>Ảnh</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBooks.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center">Không tìm thấy sách phù hợp</td>
                            </tr>
                        ) : (
                            filteredBooks.map((book, index) => (
                                <tr key={book.id || index}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{book.bookName}</td>
                                    <td>{book.categoryName}</td>
                                    <td>{book.author}</td>
                                    <td>{book.available}</td>
                                    <td>
                                        {book.imageUrl && (
                                            <img
                                                src={book.imageUrl}
                                                alt={book.bookName}
                                                style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    objectFit: 'cover',
                                                    borderRadius: '4px'
                                                }}
                                                className="img-thumbnail"
                                            />
                                        )}
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => handleDelete(book.id)}
                                            className="btn btn-sm btn-danger"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => history.push(`/edit-book/${book.id}`)}
                                            className="btn btn-sm btn-primary"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};

export default ListBooks;