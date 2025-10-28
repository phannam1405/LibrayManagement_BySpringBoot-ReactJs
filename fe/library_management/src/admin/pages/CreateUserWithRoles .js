import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import api from '../../api/server';
import Swal from 'sweetalert2';
import { getToken } from '../../services/localStorageService';

const CreateUserWithRoles = () => {
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    dob: '',
    roleNames: []
  });

  const [availableRoles, setAvailableRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const accessToken = getToken();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get("/roles", {
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
        });

        if (response.data.code === 1000) {
          // Thêm trường checked vào mỗi role
          const rolesWithCheck = response.data.result.map(role => ({
            ...role,
            checked: false
          }));
          setAvailableRoles(rolesWithCheck);
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
        Swal.fire('Lỗi', 'Không thể tải danh sách roles', 'error');
      }
    };

    fetchRoles();
  }, [accessToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (roleName) => {
    setAvailableRoles(prevRoles =>
      prevRoles.map(role =>
        role.name === roleName ? { ...role, checked: !role.checked } : role
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Lấy danh sách role đã chọn
    const selectedRoles = availableRoles
      .filter(role => role.checked)
      .map(role => role.name);

    if (selectedRoles.length === 0) {
      Swal.fire('Lỗi', 'Vui lòng chọn ít nhất một role', 'error');
      setIsLoading(false);
      return;
    }

    try {
      const formattedData = {
        ...formData,
        dob: new Date(formData.dob).toISOString().split('T')[0], // Format as YYYY-MM-DD
        roleNames: selectedRoles
      };

      await api.post('/users/with-roles', formattedData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log("Sending:", {
        ...formData,
        roleNames: selectedRoles
      });
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Tạo user thành công',
        confirmButtonColor: '#3085d6',
      }).then(() => {
        // Reset form
        setFormData({
          username: '',
          password: '',
          firstName: '',
          lastName: '',
          roleNames: []
        });
        setAvailableRoles(prev => prev.map(role => ({ ...role, checked: false })));
      });
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi tạo user';
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: errorMsg,
        confirmButtonColor: '#d33',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">Tạo User với Role</h4>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>

                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      CCCD <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="id"
                      name="id"
                      value={formData.id}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {/* Username */}
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      Username <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* First Name */}
                  <div className="mb-3">
                    <label htmlFor="firstName" className="form-label">
                      First Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Last Name */}
                  <div className="mb-3">
                    <label htmlFor="lastName" className="form-label">
                      Last Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="dob" className="form-label">
                      Ngày sinh <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="dob"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      required
                    />
                  </div>


                  {/* Roles */}
                  <div className="mb-3">
                    <label className="form-label">Roles <span className="text-danger">*</span></label>
                    <div className="row">
                      {availableRoles.map((role) => (
                        <div key={role.name} className="col-md-6 mb-2">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`role-${role.name}`}
                              checked={role.checked}
                              onChange={() => handleRoleChange(role.name)}
                            />
                            <label className="form-check-label" htmlFor={`role-${role.name}`}>
                              {role.name} - {role.description}
                            </label>
                          </div>
                          {role.permissions.length > 0 && (
                            <div className="ms-4 text-muted small">
                              <span>Permissions: </span>
                              {role.permissions.map(p => p.name).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-md-2"
                      onClick={() => window.history.back()}
                      disabled={isLoading}
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Đang xử lý...
                        </>
                      ) : 'Tạo User'}
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

export default CreateUserWithRoles;