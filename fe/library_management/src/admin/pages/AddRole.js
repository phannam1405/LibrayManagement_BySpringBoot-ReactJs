import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import api from '../../api/server';
import Swal from 'sweetalert2';
import { getToken } from '../../services/localStorageService';

const AddRole = () => {
    const [availablePermissions, setAvailablePermissions] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: []
    });
    const accessToken = getToken()
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const response = await api.get("/permissions", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (response.data.code === 1000) {
                    // Thêm trường checked vào mỗi permission
                    const permissonWithCheck = response.data.result.map(per => ({
                        ...per,
                        checked: false
                    }));
                    setAvailablePermissions(permissonWithCheck);
                }
            } catch (err) {
                console.error("Error fetching roles:", err);
                Swal.fire('Lỗi', 'Không thể tải danh sách permissions', 'error');
            }
        };

        fetchPermissions();
    }, [accessToken]);

    const handlePermissionChange = (permName) => {
        setAvailablePermissions(prevPerm =>
            prevPerm.map(per =>
                per.name === permName ? { ...per, checked: !per.checked } : per
            )
        );
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('ok')
        // Lấy danh sách role đã chọn
        const selectedPermissions = availablePermissions
            .filter(per => per.checked)
            .map(per => per.name);

        if (selectedPermissions.length === 0) {
            Swal.fire('Lỗi', 'Vui lòng chọn ít nhất một role', 'error');
            return;
        }

        try {
            const response = await api.post('/roles', {
                ...formData,
                permissions: selectedPermissions
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.data.code === 1000) {
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: 'Tạo role thành công',
                    confirmButtonColor: '#3085d6',
                }).then(() => {
                    // Reset form
                    setFormData({
                        name: '',
                        description: '',
                        permissions: []
                    });
                    setAvailablePermissions(prev => prev.map(per => ({ ...per, checked: false })));
                });
            }
        } catch (error) {
            console.error('Error creating user:', error);
            const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi tạo role';
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: errorMsg,
                confirmButtonColor: '#d33',
            });
        }
    };

    return (
        <AdminLayout>
            <div className="book-category-form-container">
                <h2>Add New Role</h2>
                <form onSubmit={handleSubmit} className="book-category-form">
                    <div className="form-group">
                        <label htmlFor="name">Role Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Enter permission name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Enter description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label>
                            Permissions <span className="text-danger">*</span>
                        </label>
                        <div className="permissions-container">
                            {availablePermissions.map((per) => (
                                <div key={per.name} className="permission-item">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={per.checked}
                                            onChange={() => handlePermissionChange(per.name)}
                                        />
                                        <span className="perm-name">{per.name}</span> –{" "}
                                        <span className="perm-desc">{per.description}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>


                    <button type="submit" className="submit-btn">Add Role</button>
                </form>
            </div>
        </AdminLayout>
    )
}

export default AddRole
