import React, { useEffect, useState } from 'react';
import '../styles/admin.css';
import { FaUserCircle } from 'react-icons/fa';
import { useHistory } from 'react-router-dom';
import { logOut } from '../../services/authenticationService';
import { getToken } from '../../services/localStorageService';
import { useStoreState, useStoreActions } from 'easy-peasy';

const AdminNavbar = () => {
  const history = useHistory();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const userDetails = useStoreState((state) => state.userDetails);
  const getUserDetailsthunk = useStoreActions((actions) => actions.getUserDetailsthunk);

  useEffect(() => {
    const accessToken = getToken();
    console.log(accessToken);
    if (accessToken) {
      getUserDetailsthunk(accessToken);
      console.log(userDetails.firstName)
    } else {
      history.push('/login')
    }
  }, [getUserDetailsthunk, history, userDetails.firstName]);

  const handleToggleDropdown = () => {
    console.log('Dropdown toggle clicked');
    setDropdownOpen(prev => !prev);
  };

  const handleLogout = () => {
    logOut();
    history.push('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span
          style={{ cursor: "pointer" }}
          onClick={() => history.push('/admin-dashboard')}
          className="logo"
        >
          Dashboard
        </span>
      </div>

      <div className="navbar-right">
        <div className="user-info-wrapper">
          <div className="user-info">
            {userDetails.firstName && (
              <span className="welcome-msg">
                Hi, {userDetails.firstName} {userDetails.lastName}
              </span>
            )}
            <div className="user-icon" onClick={handleToggleDropdown}>
              <FaUserCircle size={28} />
            </div>
          </div>

          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => history.push('/my-info')}>Profile</div>
              <div className="dropdown-item" onClick={handleLogout}>Logout</div>
            </div>
          )}
        </div>

      </div>

    </nav>
  );
};

export default AdminNavbar;
