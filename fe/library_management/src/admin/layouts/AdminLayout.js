import React from 'react';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }) => {
  return (
    <>
      <AdminNavbar />
      <div className="admin-container">
        <AdminSidebar />
        <div className="main-content">
          {children}
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
