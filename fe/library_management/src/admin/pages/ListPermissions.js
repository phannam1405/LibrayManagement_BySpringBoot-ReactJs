import React, { useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { useStoreState, useStoreActions } from "easy-peasy";
import api from '../../api/server';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { getToken } from '../../services/localStorageService';

const ListPermissions = () => {
    const permission = useStoreState((state) => state.permission);
    const getPermissions = useStoreActions((actions) => actions.getPermissions);

    const token = getToken();
    useEffect(() => {
        getPermissions(token)
    }, [getPermissions, token])

    const handleDelete = async (id) => {
        console.log(" id:", id);
        const confirmDelete = window.confirm("Are you sure you want to delete this permission?");
        if (!confirmDelete) return;

        try {
            const response = await api.delete(`/permissions/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data.code === 1000) {
                getPermissions(token);
            } else {
                alert("Failed to delete.");
            }

        } catch (error) {
            console.error("Delete failed:", error);
            alert("Error deleting permission.");
        }
    };
    return (
        <AdminLayout>
            <div className="container mt-4">
                <h3 className="mb-4">List of Permissions</h3>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">#</th>

                            <th scope="col">Permission Name</th>
                            <th scope="col">Description</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {permission.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center">No data available.</td>
                            </tr>
                        ) : (
                            permission.map((item, index) => (
                                <tr key={item.id || index}>
                                    <th scope="row">{index + 1}</th>

                                    <td>{item.name}</td>
                                    <td>{item.description}</td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(item.name)}
                                            className="btn btn-sm btn-danger"
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
    )
}

export default ListPermissions
