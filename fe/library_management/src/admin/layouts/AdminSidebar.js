import React, { useState } from 'react';
import { FaBook, FaUsers, FaCogs, FaChevronDown, FaAddressBook, FaRavelry, FaBacteria, FaBookReader, FaList } from 'react-icons/fa';
import { useHistory } from 'react-router-dom';
const AdminSidebar = () => {
  const history = useHistory()
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };


  const handleAddBookCategory = () => {
    history.push('/add-new-book-category')
  }

  const handleListBookCate = () => {
    history.push('/list-book-categories')
  }

  const handleAddBook = () => {
    history.push('/add-new-book')
    console.log('ok')
  }

  const handleListBook = () => {
    history.push('/list-books')
    console.log('ok')
  }

  return (
    <div className="sidebar">
      <div className="sidebar-item" onClick={() => toggleMenu("books")}>
        <FaBook className="sidebar-icon" />
        Book
        <FaChevronDown className={`chevron ${openMenu === "books" ? 'rotate' : ''}`} />
      </div>
      {openMenu === "books" && (
        <div className="sidebar-dropdown">
          <div onClick={handleAddBook} className="sidebar-subitem"> New Book </div>
          <div onClick={handleListBook} className="sidebar-subitem">List Book </div>
        </div>
      )}

      <div className="sidebar-item" onClick={() => toggleMenu("users")}>
        <FaUsers className="sidebar-icon" />
        User/Employee
        <FaChevronDown className={`chevron ${openMenu === "users" ? 'rotate' : ''}`} />
      </div>
      {openMenu === "users" && (
        <div className="sidebar-dropdown">
          <div onClick={() => history.push('/add-employee')} className="sidebar-subitem"> New User/Employee </div>
          <div onClick={() => history.push('/list-user-emp')} className="sidebar-subitem">List User/Employee </div>
        </div>
      )}

      <div className="sidebar-item" onClick={() => toggleMenu("roles")}>
        <FaRavelry className="sidebar-icon" />
        Role
        <FaChevronDown className={`chevron ${openMenu === "roles" ? 'rotate' : ''}`} />
      </div>
      {openMenu === "roles" && (
        <div className="sidebar-dropdown">
          <div onClick={() => history.push('/add-role')} className="sidebar-subitem"> New Role </div>
          <div onClick={() => history.push('/list-roles')} className="sidebar-subitem">List Roles </div>
        </div>
      )}

      <div className="sidebar-item" onClick={() => toggleMenu("permission")}>
        <FaBacteria className="sidebar-icon" />
        Permission
        <FaChevronDown className={`chevron ${openMenu === "permission" ? 'rotate' : ''}`} />
      </div>
      {openMenu === "permission" && (
        <div className="sidebar-dropdown">
          <div onClick={() => history.push('/add-permission')} className="sidebar-subitem"> New Permission </div>
          <div onClick={() => history.push('/list-permissions')} className="sidebar-subitem">List Permissions </div>
        </div>
      )}

      <div className="sidebar-item" onClick={() => toggleMenu("bookCate")}>
        <FaAddressBook className="sidebar-icon" />
        Book Category
        <FaChevronDown className={`chevron ${openMenu === "books" ? 'rotate' : ''}`} />
      </div>
      {openMenu === "bookCate" && (
        <div className="sidebar-dropdown">
          <div onClick={handleAddBookCategory} className="sidebar-subitem"> New Book Category</div>
          <div onClick={handleListBookCate} className="sidebar-subitem">List Book Categories</div>
        </div>
      )}

      <div onClick={() => history.push('/borrow-book')} className="sidebar-item">
        <FaBookReader className="sidebar-icon" />
        Borrow
      </div>

      <div onClick={() => history.push('/list-borrow')} className="sidebar-item">
        <FaList className="sidebar-icon" />
        List Borrow
      </div>
    

      <div className="sidebar-item">
        <FaCogs className="sidebar-icon" />
        Settings
      </div>
    </div>
  );
};

export default AdminSidebar;
