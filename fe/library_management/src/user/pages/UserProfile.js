import React, { useEffect, useState } from 'react';
import api from '../../api/server';
import { getToken } from '../../services/localStorageService';
import Swal from 'sweetalert2';
import { useStoreState, useStoreActions } from 'easy-peasy';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MyProfile = () => {
    const [profile, setProfile] = useState(null);
    const userDetails = useStoreState((state) => state.userDetails);
    const getUserDetailsthunk = useStoreActions((actions) => actions.getUserDetailsthunk);
    const [formData, setFormData] = useState({
        password: '',
        firstName: '',
        lastName: '',
        dob: '',
        roles: []
    });

    useEffect(() => {
        const accessToken = getToken();
        getUserDetailsthunk(accessToken);
    }, [getUserDetailsthunk]);

    useEffect(() => {
        if (userDetails && userDetails.id) {
            setProfile(userDetails);
            setFormData({
                password: '',
                firstName: userDetails.firstName || '',
                lastName: userDetails.lastName || '',
                dob: userDetails.dob || '',
                roles: userDetails.roles?.map(r => r.name) || []
            });
        }
    }, [userDetails]);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = roleName => {
        setFormData(prev => {
            const roles = prev.roles.includes(roleName)
                ? prev.roles.filter(r => r !== roleName)
                : [...prev.roles, roleName];
            return { ...prev, roles };
        });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const token = getToken();
            await api.put(`/users/${profile?.id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await getUserDetailsthunk(token);
            Swal.fire('Thành công', 'Cập nhật thông tin thành công!', 'success');
        } catch (err) {
            console.error(err);
            Swal.fire('Lỗi', 'Không thể cập nhật!', 'error');
        }
    };

    if (!profile) {
        return (
            <div className="container mt-5 text-center">
                <p>Đang tải thông tin...</p>
            </div>
        );
    }

    return (
        <>
            <Header></Header>
            <div className="container mt-5">
                <div className="card shadow">
                    <div className="card-header">
                        <h3>Thông tin cá nhân</h3>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">ID: {profile?.id}</label>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Email: {profile?.email}</label>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Username: {profile?.username}</label>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Password:</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    required
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="Enter new password or current password"
                                />
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Last Name:</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">First Name:</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Day of Birth:</label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>

                            {profile.roles.map(r => r.name).includes('ADMIN') && (
                                <div className="mb-4">
                                    <label className="form-label">Roles:</label>
                                    <div className="d-flex flex-wrap gap-3">
                                        {['USER', 'ADMIN', 'EMPLOYEE'].map(role => (
                                            <div className="form-check me-3" key={role}>
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={formData.roles.includes(role)}
                                                    onChange={() => handleRoleChange(role)}
                                                    id={`role-${role}`}
                                                />
                                                <label className="form-check-label" htmlFor={`role-${role}`}>
                                                    {role}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}



                            <div className="text-end">
                                <button type="submit" className="btn btn-primary px-4">
                                    Cập nhật
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div style={{ marginTop: '50px' }}>
                <Footer />
            </div>

        </>
    );

};

export default MyProfile;
