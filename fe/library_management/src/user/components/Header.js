import React, { useEffect, useState } from 'react';
import { FiUser, FiLogOut, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { getToken } from '../../services/localStorageService';
import { useStoreState, useStoreActions } from 'easy-peasy';
import logo from '../assets/images/logo.svg';
import '../../user/styles/user.css';
import { logOut, checkTokenExpiration } from '../../services/authenticationService';
import { useHistory } from 'react-router-dom';
const Header = () => {
  const history = useHistory();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOtherDropdownOpen, setIsOtherDropdownOpen] = useState(false);

  const userDetails = useStoreState(state => state.userDetails);
  const bookCategories = useStoreState(state => state.bookCategories);
  const getUserDetailsthunk = useStoreActions(actions => actions.getUserDetailsthunk);

  const defaultCategoryNames = ["TÌNH CẢM", "Y HỌC", "TRINH THÁM"];

  // Lấy thông tin user
  useEffect(() => {
    const fetchUserData = async () => {
      const token = getToken();
      if (token) await getUserDetailsthunk(token);
    };
    fetchUserData();
  }, [getUserDetailsthunk]);

  const handleLogout = () => {
    logOut();
    window.scrollTo({ top: 0 });
    setIsDropdownOpen(false);
  };

  const getInitials = () => {
    if (!userDetails?.firstName && !userDetails?.lastName) return 'US';
    return `${userDetails?.firstName?.charAt(0) || ''}${userDetails?.lastName?.charAt(0) || ''}`;
  };

  // Scroll đến section theo category
  const handleScrollToCategory = (categoryName) => {
    const id = `category-${categoryName.trim().toLowerCase().replace(/\s+/g, '-')}`;
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Phân loại category cố định và khác
  const defaultCategories = bookCategories.filter(cat =>
    defaultCategoryNames.includes(cat.categoryName.toUpperCase())
  );

  const otherCategories = bookCategories.filter(
    cat => !defaultCategoryNames.includes(cat.categoryName.toUpperCase())
  );

  return (
    <header className="header-container">
      <nav className="header-menu">
        {/* Left menu */}
        <div className="header-menu__left">
          <h1 className="header-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={logo} alt="logo" style={{ cursor: 'pointer' }} />
          </h1>

          <ul className="header-list" style={{ cursor: 'pointer' }}>
            {/* 3 category cố định */}
            {defaultCategories.map(cat => (
              <li
                key={cat.id}
                className="header-list__item"
                onClick={() => handleScrollToCategory(cat.categoryName)}
              >
                {cat.categoryName}
              </li>
            ))}

            {/* Dropdown "KHÁC" */}
            {otherCategories.length > 0 && (
              <li
                className="header-list__item header-list__item--dropdown"
                onMouseEnter={() => setIsOtherDropdownOpen(true)}
                onMouseLeave={() => setIsOtherDropdownOpen(false)}
              >
                KHÁC
                {isOtherDropdownOpen && (
                  <ul className="dropdown-menu">
                    {otherCategories.map(cat => (
                      <li
                        key={cat.id}
                        onClick={() => handleScrollToCategory(cat.categoryName)}
                      >
                        {cat.categoryName}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )}
          </ul>
        </div>

        {/* Right menu */}
        <div className="header-menu__right">
          <h2
            className="header-shop"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ cursor: 'pointer' }}
          >
            WEBToon Shop
          </h2>

          {getToken() && checkTokenExpiration(getToken()) ? (
            <div className="header-user">
              <div
                className="header-user__trigger"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                <div className="header-user__avatar">{getInitials()}</div>
                <span className="header-user__name">Hi, {userDetails?.firstName || 'User'}</span>
                {isDropdownOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </div>

              {isDropdownOpen && (
                <div className="header-user__dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">{getInitials()}</div>
                    <div className="dropdown-user-info">
                      <div className="dropdown-user-name">{`${userDetails?.firstName || ''} ${userDetails?.lastName || ''}`.trim() || 'User'}</div>
                      <div className="dropdown-user-email">{userDetails?.email || 'No email provided'}</div>
                    </div>
                  </div>

                  <div className="dropdown-divider"></div>

                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <FiUser className="dropdown-icon" />
                    <span>Profile</span>
                  </button>

                  <button className="dropdown-item" onClick={handleLogout}>
                    <FiLogOut className="dropdown-icon" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="header-auth">
              <button className="header-publish" onClick={() => history.push('/register')}>
                Register
              </button>
              <button className="header-login" onClick={() => history.push('/login')}>
                Login
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
