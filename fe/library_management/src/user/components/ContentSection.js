import React, { useEffect } from 'react';
import '../styles/user.css';
import { useStoreState, useStoreActions } from 'easy-peasy';
import { getToken } from '../../services/localStorageService';
import { useHistory } from 'react-router-dom';

const ContentSection = () => {
  const history = useHistory();
  const { books, isBooksLoading, bookCategories } = useStoreState(state => ({
    books: state.books,
    isBooksLoading: state.isBooksLoading,
    bookCategories: state.bookCategories
  }));

  const { getBooks, getBookCategories, setBooksLoading } = useStoreActions(actions => ({
    getBooks: actions.getBooks,
    getBookCategories: actions.getBookCategories,
    setBooksLoading: actions.setBooksLoading
  }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setBooksLoading(true);
        await Promise.all([getBookCategories(), getBooks()]);
      } catch (error) {
        console.error(error);
      } finally {
        setBooksLoading(false);
      }
    };
    fetchData();
  }, [getBooks, getBookCategories, setBooksLoading]);

  const booksByCategory = bookCategories.map(category => {
    const categoryBooks = books
      .filter(book => book.categoryName === category.categoryName)
      .slice(0, 8);
    return { ...category, books: categoryBooks };
  });

  if (isBooksLoading) return <div className="loading">Loading...</div>;
  if (!books.length || !bookCategories.length) return <div className="no-data">No books or categories found</div>;

  return (
    <main className="main-content">
      <div className="genres">
        {booksByCategory.map(category => (
          <div
            key={category.id}
            id={`category-${category.categoryName.trim().toLowerCase().replace(/\s+/g, '-')}`}
            className="category-section"
          >
            <div className="category-header">
              <h3 className="category-title">{category.categoryName}</h3>
            </div>

            {category.books.length > 0 ? (
              <div className="top">
                {category.books.map((book, index) => (
                  <div key={book.id} className="book-container">
                    <div
                      className={`top-item item-${(index % 9) + 1}`}
                      style={book.imageUrl ? {
                        backgroundImage: `url(${book.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      } : {}}
                    >
                      <div className="section-head">
                        <p className="scan">Available: {book.available}</p>
                      </div>
                      <div className="section-content">
                        <div className="content-head">
                          <h3>{book.bookName}</h3>
                          <p>{book.author}</p>
                        </div>
                        <button onClick={() => history.push(`/details/${book.id}`)}>Mượn sách</button>
                        <p className="content">Thể loại: {book.categoryName}</p>
                      </div>
                    </div>
                    <div className="book-info">
                      <h3 className="book-title">{book.bookName}</h3>
                      <p className="book-author">{book.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-books">No books in this category</div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
};

export default ContentSection;
