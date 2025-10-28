import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../../api/server';
import { getToken } from '../../services/localStorageService';
import Swal from 'sweetalert2';
import '../../user/styles/user.css';
import { useStoreState, useStoreActions } from 'easy-peasy';
const BookDetails = () => {
    const history = useHistory();
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [borrowDate, setBorrowDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const userDetails = useStoreState(state => state.userDetails);
    const getUserDetailsthunk = useStoreActions(actions => actions.getUserDetailsthunk);
    useEffect(() => {
        const fetchBookDetails = async () => {
            const accessToken = getToken();
            try {
                // 1. Fetch book details
                const response = await api.get(`/books/${id}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                const bookData = response.data.result;
                setBook(bookData);

                // 2. Fetch book image if exists
                if (bookData.images) {
                    try {
                        const imageResponse = await api.get(`/files/${bookData.images}`, {
                            responseType: 'blob',
                            headers: {
                                Authorization: `Bearer ${accessToken}`
                            }
                        });

                        // Create object URL from blob
                        const url = URL.createObjectURL(imageResponse.data);
                        setImageUrl(url);
                    } catch (imageError) {
                        console.error('Error loading book image:', imageError);
                        setImageUrl(null);
                    }
                } else {
                    setImageUrl(null);
                }

                // 3. Fetch user details 
                if (!userDetails) {
                    await getUserDetailsthunk(accessToken);
                }

                // Set default dates
                const today = new Date();
                const defaultReturnDate = new Date();
                defaultReturnDate.setDate(today.getDate() + 14);

                setBorrowDate(today.toISOString().split('T')[0]);
                setReturnDate(defaultReturnDate.toISOString().split('T')[0]);
            } catch (error) {
                console.error('Error fetching book details:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load book details',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchBookDetails();

        // Cleanup function to revoke object URL
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [id]);

    const handleBorrowOnline = async () => {
        const accessToken = getToken();
        if (!accessToken) {
            Swal.fire({
                icon: 'warning',
                title: 'Login Required',
                text: 'You need to login to borrow books',
                showCancelButton: true,
                confirmButtonText: 'Login',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    history.push('/login');
                }
            });
            return;
        }

        try {
            const response = await api.post('/borrow_book/online', {
                userId: userDetails.id,
                bookId: id,
                quantity: quantity,
                borrowDate: borrowDate,
                returnDate: returnDate
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            Swal.fire({
                icon: 'success',
                title: 'Borrow Request Submitted',
                text: 'Your book borrowing request has been received and is pending approval',
                confirmButtonText: 'OK'
            }).then(() => {
                history.push('/');
            });
        } catch (error) {
            console.error('Error borrowing book:', error);
            Swal.fire({
                icon: 'error',
                title: 'Borrow Failed',
                text: error.response?.data?.message || 'Failed to borrow book',
            });
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="book-details-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading book details...</p>
                </div>
                <Footer />
            </>
        );
    }

    if (!book) {
        return (
            <>
                <Header />
                <div className="book-details-error">
                    <h2>Book Not Found</h2>
                    <p>The requested book could not be found.</p>
                    <button onClick={() => history.push('/')}>Back to Home</button>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <section className="desktop">
                <Header />

                <div className="book-details-container">
                    <div className="book-details-content">
                        <div className="book-cover-container">
                            <img
                                src={imageUrl || '/images/default-book-cover.jpg'}
                                alt={book.bookName}
                                className="book-cover"
                                onError={(e) => {
                                    e.target.src = '/images/default-book-cover.jpg';
                                    console.error('Error loading book cover:', e);
                                }}
                            />
                        </div>

                        <div className="book-info">
                            <h1 className="detail_book-title">{book.bookName}</h1>
                            <p className="book-author">Tác giả {book.author}</p>
                            <p className="book-category">Thể loại: {book.categoryName || 'Unknown'}</p>

                            <div className="book-meta">
                                <span
                                    style={{
                                        fontWeight: 'bold',
                                        fontSize: '1.5rem',
                                        color: book.available > 0 ? 'green' : 'red'
                                    }}
                                >
                                    {book.available > 0 ? `${book.available} sách có sẵn` : 'Hết sách'}
                                </span>
                            </div>

                            {book.available > 0 && (
                                <div className="borrow-form">
                                    <h3>Mượn sách</h3>

                                    <div className="form-group">
                                        <label htmlFor="quantity">CCCD:</label>
                                        <input
                                            type="text"
                                            id="userId"
                                            value={userDetails?.id || ''}
                                            readOnly
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="quantity">Quantity:</label>
                                        <input
                                            type="number"
                                            id="quantity"
                                            min="1"
                                            max={book.available}
                                            value={quantity}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                if (val < 1) {
                                                    setQuantity(1);
                                                } else if (val > book.available) {
                                                    setQuantity(book.available);
                                                } else {
                                                    setQuantity(val);
                                                }
                                            }}
                                        />

                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="borrowDate">Borrow Date:</label>
                                        <input
                                            type="date"
                                            id="borrowDate"
                                            value={borrowDate}
                                            onChange={(e) => setBorrowDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="returnDate">Expected Return Date:</label>
                                        <input
                                            type="date"
                                            id="returnDate"
                                            value={returnDate}
                                            onChange={(e) => setReturnDate(e.target.value)}
                                            min={borrowDate}
                                        />
                                    </div>

                                    <button
                                        className="borrow-button"
                                        onClick={handleBorrowOnline}
                                    >
                                        Borrow Online
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <Footer />
            </section>
        </>
    );
};

export default BookDetails;