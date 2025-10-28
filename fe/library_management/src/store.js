import { createStore, action, thunk } from "easy-peasy";
import api from './api/server';

export default createStore({

    userDetails: {},

    setUserDetails: action((state, payload) => {
        state.userDetails = payload;
    }),

    bookCategories: [],
    setBookCategories: action((state, payload) => {
        state.bookCategories = payload;
    }),

    addBookCategory: action((state, payload) => {
        state.bookCategories.push(payload);
    }),

    books: [],
    isBooksLoading: false,
    setBooks: action((state, payload) => {
        state.books = payload;
    }),
    setBooksLoading: action((state, payload) => {
        state.isBooksLoading = payload;
    }),

    permission: [],
    setPermission: action((state, payload) => {
        state.permission = payload
    }),

    role: [],
    setRole: action((state, payload) => {
        state.role = payload
    }),




    getRoles: thunk(async (actions, accessToken) => {
        try {
            const response = await api.get('/roles', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (response.data.code === 1000) {
                actions.setRole(response.data.result);
            } else {
                console.warn("Lỗi từ server:", response.data.message || "Không xác định");
            }
        } catch (error) {
            console.error("Error fetching permissions:", error);
        }
    }),
    getPermissions: thunk(async (actions, accessToken) => {
        try {
            const response = await api.get('/permissions', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (response.data.code === 1000) {
                actions.setPermission(response.data.result);
            } else {
                console.warn("Lỗi từ server:", response.data.message || "Không xác định");
            }
        } catch (error) {
            console.error("Error fetching permissions:", error);
        }
    }),

    getBooks: thunk(async (actions, accessToken) => {
        try {
            const response = await api.get("/books");

            if (response.data.code === 1000) {
                const booksWithBlobImages = await Promise.all(
                    response.data.result.map(async (book) => {
                        if (book.images) {
                            try {
                                const imageBlob = await api.get(`/files/${book.images}`, {
                                    responseType: 'blob'
                                });
                                // tạo URL tạm để dùng trong <img>
                                book.imageUrl = URL.createObjectURL(imageBlob.data);    
                            } catch (imgErr) {
                                console.error("Không thể load ảnh:", imgErr.message);
                                book.imageUrl = null;
                            }
                        } else {
                            book.imageUrl = null;
                        }
                        return book;
                    })
                );

                actions.setBooks(booksWithBlobImages);
            } else {
                console.warn("Lỗi từ server:", response.data.message || "Không xác định");
            }
        } catch (err) {
            console.error("Error fetching books:", err.message);
        }
    }),




    getBookCategories: thunk(async (actions, accessToken) => {
        try {
            const response = await api.get("/book_category");

            if (response.data.code === 1000) {
                actions.setBookCategories(response.data.result);
            } else {
                console.warn("Lỗi từ server:", response.data.message || "Không xác định");
            }
        } catch (err) {
            console.error("Error fetching user details:", err.message);
        }
    }),



    getUserDetailsthunk: thunk(async (actions, accessToken) => {
        try {
            const response = await api.get("/users/my-info", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.data.code === 1000) {
                actions.setUserDetails(response.data.result);
            } else {
                console.warn("Lỗi từ server:", response.data.message || "Không xác định");
            }
        } catch (err) {
            console.error("Error fetching user details:", err.message);
        }
    }),
});
