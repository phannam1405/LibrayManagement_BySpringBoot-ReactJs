import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../auth/Login.css';
import api from '../../api/server';

const Register = () => {
    const history = useHistory();
    const [formData, setFormData] = useState({
        id: '',
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName: '',
        dob: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Sửa lại cách gửi dữ liệu để phù hợp với API
            await api.post("/users", formData);

            Swal.fire({
                icon: 'success',
                title: 'Registration Successful',
                text: 'You can now login with your credentials'
            });
            history.push('/login');
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Registration Failed',
                text: error.response?.data?.message || 'Please check your information and try again'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container"> {/* Sử dụng cùng class với Login */}
            <form className="login-form" onSubmit={handleSubmit}>
                <h2 className="login-title">Create Account</h2>
                <div className="form-row">
                  
                        <input
                            type="text"
                            name="id"
                            placeholder="CCCD"
                            value={formData.id}
                            onChange={handleChange}
                            className="login-input"
                            required
                        />
                    
                  
                            <input
                                type="text"
                                name="firstName"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="login-input"
                                required
                            />
                    
                  
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="login-input"
                            required
                        />
                  
                </div>


                <input
                    type="text"
                    name="username"
                    placeholder="Username (min 4 characters)"
                    value={formData.username}
                    onChange={handleChange}
                    className="login-input"
                    minLength="4"
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="login-input"
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password (min 6 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    className="login-input"
                    minLength="6"
                    required
                />

                <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="login-input"
                    required
                />

                <button
                    type="submit"
                    className="login-button"
                    disabled={isLoading}
                >
                    {isLoading ? 'Creating Account...' : 'Register'}
                </button>

                <div className="login-footer">
                    Already have an account? <span style={{ color:'blue'   ,cursor: 'pointer' }} onClick={() => history.push('/login')}>Login</span>
                </div>
            </form>
        </div>
    );
};

export default Register;