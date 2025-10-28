import React, { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import api from '../../api/server'
import Swal from 'sweetalert2';
import { getToken } from '../../services/localStorageService';
const AddPermission = () => {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const accessToken = getToken()
    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await api.post('/permissions',
            {
                name: name,
                description: description
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        )
        const data = response.data;
        console.log("Response body:", data);

        if (data.code === 1000) {
            setName("");
            setDescription("");
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Thêm danh mục sách thành công!',
                confirmButtonColor: '#3085d6',
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Thất bại',
                text: 'Có lỗi xảy ra khi thêm danh mục.',
                confirmButtonColor: '#d33',
            })
        }
    }

    return (
        <AdminLayout>
            <div className="book-category-form-container">
                <h2>Add New Book Category</h2>
                <form onSubmit={handleSubmit} className="book-category-form">
                    <div className="form-group">
                        <label htmlFor="name">Permission Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Enter permission name"
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

                    <button type="submit" className="submit-btn">Add Permission</button>
                </form>
            </div>
        </AdminLayout>
    )
}

export default AddPermission
