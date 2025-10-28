import React, { useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { useStoreState, useStoreActions } from "easy-peasy";
import api from '../../api/server';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { getToken } from '../../services/localStorageService';

const ListBookCategory = () => {
    const bookCategories = useStoreState((state) => state.bookCategories);
    const getBookCategories = useStoreActions((actions) => actions.getBookCategories);

    const token = getToken();

    useEffect(() => {
        getBookCategories(token);
    }, [getBookCategories, token]);

    const handleDeleteCategory = async (id) => {
        console.log(" id:", id);
        const confirmDelete = window.confirm("Are you sure you want to delete this category?");
        if (!confirmDelete) return;

        try {
            const response = await api.delete(`/book_category/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data.code === 1000) {
                getBookCategories(token);
            } else {
                alert("Failed to delete.");
            }

        } catch (error) {
            console.error("Delete failed:", error);
            alert("Error deleting category.");
        }
    };

    return (
        <AdminLayout>
            <div className="container mt-4">
                <h3 className="mb-4">List of Book Categories</h3>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">#</th>

                            <th scope="col">Category Name</th>
                            <th scope="col">Description</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookCategories.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center">No data available.</td>
                            </tr>
                        ) : (
                            bookCategories.map((item, index) => (
                                <tr key={item.id || index}>
                                    <th scope="row">{index + 1}</th>

                                    <td>{item.categoryName}</td>
                                    <td>{item.description}</td>
                                    <td>
                                        <button
                                            onClick={() => handleDeleteCategory(item.id)}
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
    );
};

export default ListBookCategory;
