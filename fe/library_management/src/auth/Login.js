import React, { useState, useEffect } from 'react';
import './Login.css';
import api from '../api/server';
import { useHistory } from 'react-router-dom';
import { getToken, setToken } from '../services/localStorageService';
import { checkTokenExpiration, logOut } from '../services/authenticationService';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

const Login = () => {
    const history = useHistory();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const accessToken = getToken();
        if (!accessToken) return;
        if (!checkTokenExpiration(accessToken)) {
            logOut();
            return;
        }
        try {
            // chỉ đọc payload
            const decoded = jwtDecode(accessToken);
            const roles = decoded.scope.split(' ').filter(scope => scope.startsWith('ROLE_'));
            if (roles.includes('ROLE_ADMIN')) {
                history.push("/admin-dashboard");
            } else if (roles.includes('ROLE_USER')) {
                history.push("/");
            }
        } catch {
            logOut();
        }
    }, [history]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post("/auth/token", { username, password });
            const data = response.data;
            if (data.code !== 1000) throw new Error(data.message);
            const token = data.result?.token;
            setToken(token);

            const decoded = jwtDecode(token);
            const roles = decoded.scope.split(' ').filter(scope => scope.startsWith('ROLE_'));
            if (roles.length > 1) {
                showRoleSelection(roles);
            } else if (roles.length === 1) {
                redirectBasedOnRole(roles[0]);
            } else {
                throw new Error("No valid roles found");
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text:
                    (error.response?.data?.code ===1006 ? 'Invalid username or password' : '') ||
                    'Something went wrong. Please try again.',
            });

        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        Swal.fire({
            title: 'Reset Password',
            input: 'email',
            inputLabel: 'Enter your email address',
            inputPlaceholder: 'you@example.com',
            showCancelButton: true,
            confirmButtonText: 'Send',
            cancelButtonText: 'Cancel',
            inputValidator: (value) => {
                if (!value) return 'Email is required';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return 'Invalid email format';
                return null;
            },
            preConfirm: async (email) => {
                const btn = Swal.getConfirmButton();
                btn.disabled = true;
                btn.textContent = 'Sending...';

                try {
                    const res = await api.post('/users/forgot_password', { email });
                    if (res.data.code !== 1000) {
                        throw new Error(res.data.message);
                    }
                    return email;
                } catch (err) {
                    Swal.showValidationMessage(err.message || 'Error sending reset email');
                    btn.disabled = false;
                    btn.textContent = 'Send';
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: `Password reset link sent to ${result.value}`,
                });
            }

        });
    };


    const showRoleSelection = (roles) => {
        Swal.fire({
            title: 'Select Your Role',
            html: `
                <div style="margin-top: 20px;">
                    ${roles.map(role => `
                        <button 
                            onclick="window.selectRole('${role}')"
                            style="
                                display: block;
                                width: 100%;
                                padding: 10px;
                                margin: 8px 0;
                                border: none;
                                border-radius: 4px;
                                background-color: ${role === 'ROLE_ADMIN' ? '#d32f2f' : '#1976d2'};
                                color: white;
                                font-size: 16px;
                                cursor: pointer;
                            "
                        >
                            ${getRoleDisplayName(role)}
                        </button>
                    `).join('')}
                </div>
            `,
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => {
                window.selectRole = (role) => {
                    Swal.close();
                    redirectBasedOnRole(role);
                };
            }
        });
    };

    const getRoleDisplayName = (role) => {
        const roleName = role.replace('ROLE_', '');
        return roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase();
    };

    const redirectBasedOnRole = (role) => {
        switch (role) {
            case 'ROLE_ADMIN':
                history.push("/admin-dashboard");
                break;
            case 'ROLE_USER':
                history.push("/");
                break;
            default:
                history.push("/login");
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2 className="login-title">Login</h2>

                <input
                    type="text"
                    placeholder="Username"
                    className="login-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="login-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="login-button"
                    disabled={isLoading}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
                <div className="login-footer">
                    Don't have account? <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => history.push('/register')}>Register</span>
                </div>
                <div className="login-footer">
                    <span style={{ color: 'blue', cursor: 'pointer' }} onClick={handleForgotPassword}>
                        Forgot password
                    </span>
                </div>
            </form>
        </div>
    );
};

export default Login;
