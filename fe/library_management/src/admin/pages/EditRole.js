import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { useStoreState, useStoreActions } from 'easy-peasy';
import { useParams, useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../api/server';
import { getToken } from '../../services/localStorageService';

const EditRole = () => {
    const { roleName } = useParams();
    const history = useHistory();
    const accessToken = getToken();
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: []
    });
    
    const [availablePermissions, setAvailablePermissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const permissions = useStoreState(state => state.permission);
    const getPermissions = useStoreActions(actions => actions.getPermissions);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                
                // Fetch permissions if not already in store
                if (permissions.length === 0) {
                    await getPermissions(accessToken);
                }
                
                // Fetch role details
                const response = await api.get(`/roles/${roleName}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (response.data.code === 1000) {
                    const role = response.data.result;
                    
                    // Set form data
                    setFormData({
                        name: role.name,
                        description: role.description || '',
                        permissions: role.permissions.map(p => p.name)
                    });
                    
                    // Prepare permissions with checked status
                    const preparedPermissions = permissions.map(per => ({
                        ...per,
                        checked: role.permissions.some(rp => rp.name === per.name)
                    }));
                    
                    setAvailablePermissions(preparedPermissions);
                } else {
                    throw new Error(response.data.message || 'Failed to fetch role');
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                Swal.fire('Error', 'Failed to load role data', 'error');
                history.push('/list-roles');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [roleName, accessToken, history, permissions, getPermissions]);

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
        
        // Get selected permissions
        const selectedPermissions = availablePermissions
            .filter(per => per.checked)
            .map(per => per.name);

        if (selectedPermissions.length === 0) {
            Swal.fire('Error', 'Please select at least one permission', 'error');
            return;
        }

        try {
            const response = await api.put(`/roles/${roleName}`, {
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
                    title: 'Success',
                    text: 'Role updated successfully',
                    confirmButtonColor: '#3085d6',
                }).then(() => {
                    history.push('/list-roles');
                });
            }
        } catch (error) {
            console.error('Error updating role:', error);
            const errorMsg = error.response?.data?.message || 'An error occurred while updating the role';
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMsg,
                confirmButtonColor: '#d33',
            });
        }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="text-center mt-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="book-category-form-container">
                <h2>Edit Role</h2>
                <form onSubmit={handleSubmit} className="book-category-form">
                    <div className="form-group">
                        <label htmlFor="name">Role Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Enter role name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled 
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

                    <button type="submit" className="submit-btn">Update Role</button>
                </form>
            </div>
        </AdminLayout>
    );
};

export default EditRole;