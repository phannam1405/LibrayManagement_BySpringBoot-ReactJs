import React, { useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { useStoreState, useStoreActions } from "easy-peasy";
import api from '../../api/server';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { getToken } from '../../services/localStorageService';
import { useHistory } from 'react-router-dom';

const ListRoles = () => {
    const history = useHistory()
    const role = useStoreState((state) => state.role);
    const getRoles = useStoreActions((actions) => actions.getRoles);
    const token = getToken();
    useEffect(() => {
        getRoles(token)
    }, [getRoles, token])

    const handleDelete = async (id) => {
        console.log(" id:", id);
        const confirmDelete = window.confirm("Are you sure you want to delete this role?");
        if (!confirmDelete) return;

        try {
            const response = await api.delete(`/roles/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data.code === 1000) {
                getRoles(token);
            } else {
                alert("Failed to delete.");
            }

        } catch (error) {
            console.error("Delete failed:", error);
            alert("Error deleting role.");
        }
    };
    return (
        <AdminLayout>
            <div className="container mt-4">
                <h3 className="mb-4">List of roles</h3>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">#</th>

                            <th scope="col">Role Name</th>
                            <th scope="col">Description</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {role.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center">No data available.</td>
                            </tr>
                        ) : (
                            role.map((item, index) => (
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
                                    <td>
                                        <button
                                            onClick={() => history.push(`/edit-role/${item.name}`)}
                                            className="btn btn-sm btn-primary"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
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

export default ListRoles
