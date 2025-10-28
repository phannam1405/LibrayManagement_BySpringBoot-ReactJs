import React, { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import { getToken } from '../../services/localStorageService';
import api from '../../api/server';
import { useStoreState, useStoreActions } from 'easy-peasy';

const ListUserAndEmployee = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('ALL');
    const [users, setUsers] = useState([]);
    const [filteredUser, setFilteredUser] = useState([]);
    const role = useStoreState((state) => state.role);
    const getRoles = useStoreActions((actions) => actions.getRoles);
    const token = getToken();

    useEffect(() => {
        const fetchUserAndEmp = async () => {
            try {
                const response = await api.get('/users', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUsers(response.data.result);
                setFilteredUser(response.data.result);
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu người dùng:', error);
            }
        };

        fetchUserAndEmp();
        getRoles(token);
    }, [token, getRoles]);

    useEffect(() => {
        const filtered = users.filter(user => {
            const roleMatch = selectedRole === 'ALL' || 
                user.roles?.some(r => r.name === selectedRole);

            const searchMatch = searchTerm === '' ||
                user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.username?.toLowerCase().includes(searchTerm.toLowerCase());

            return roleMatch && searchMatch;
        });

        setFilteredUser(filtered);
    }, [searchTerm, selectedRole, users]);

    const handleDelete = async (userId) => {
        try {
            await api.delete(`/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(users.filter(user => user.id !== userId));
        } catch (err) {
            console.error('Lỗi khi xoá người dùng:', err);
        }
    };

    return (
        <AdminLayout>
            <div className="container mt-4">
                {/* Thanh tìm kiếm và lọc */}
                <div className="row mb-4">
                    <div className="col-md-6">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Tìm theo họ tên hoặc username..."
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
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            <option value="ALL">Tất cả role</option>
                            {role.map(r => (
                                <option key={r.id} value={r.name}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <button
                            className="btn btn-secondary w-100"
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedRole('ALL');
                            }}
                        >
                            Reset
                        </button>
                    </div>
                </div>
                <h3 className="mb-4">Danh sách người dùng</h3>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Họ</th>
                            <th>Tên</th>
                            <th>Tên đăng nhập</th>
                            <th>Ngày sinh</th>
                            <th>Vai trò</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUser.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center">Không có dữ liệu</td>
                            </tr>
                        ) : (
                            filteredUser.map((user, index) => (
                                <tr key={user.id || index}>
                                    <td>{index + 1}</td>
                                    <td>{user.firstName}</td>
                                    <td>{user.lastName}</td>
                                    <td>{user.username}</td>
                                    <td>{user.dob || 'N/A'}</td>
                                    <td>{user.roles?.map(role => role.name).join(', ') || 'N/A'}</td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="btn btn-sm btn-danger me-2"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
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

export default ListUserAndEmployee;