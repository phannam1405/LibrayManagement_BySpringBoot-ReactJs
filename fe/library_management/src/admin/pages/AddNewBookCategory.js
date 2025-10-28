import React, { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import api from '../../api/server'
import Swal from 'sweetalert2';
import { useStoreActions } from "easy-peasy";
import { getToken } from '../../services/localStorageService';
const AddNewBookCategory = () => {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const addBookCategory = useStoreActions((actions) => actions.addBookCategory);


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const accessToken = getToken();
            console.log(accessToken);

            const response = await api.post("/book_category",
                {
                    categoryName: name,
                    description: description,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const data = response.data;
            console.log("Response body:", data);

            if (data.code === 1000) {
                addBookCategory(data.result);
                setName("");
                setDescription("");
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Thêm danh mục sách thành công!',
                    confirmButtonColor: '#3085d6',
                });
                addBookCategory(data.result);
            }

        } catch (error) {
            console.log(error)
            Swal.fire({
                icon: 'error',
                title: 'Thất bại',
                text: error.message || 'Có lỗi xảy ra khi thêm danh mục.',
                confirmButtonColor: '#d33',
            })
        }
    };

    return (
        <AdminLayout>
            <div className="book-category-form-container">
                <h2>Add New Book Category</h2>
                <form onSubmit={handleSubmit} className="book-category-form">
                    <div className="form-group">
                        <label htmlFor="name">Category Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Enter category name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Enter description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn">Add Category</button>
                </form>
            </div>
        </AdminLayout>
    );
};

export default AddNewBookCategory;
