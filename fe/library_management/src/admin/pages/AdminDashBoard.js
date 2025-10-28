import AdminNavbar from '../layouts/AdminNavbar';
import AdminSidebar from '../layouts/AdminSidebar';
import AdminStatistics from '../components/AdminStatistics';
import '../styles/admin.css';
import RequireAuth from '../../auth/RequireAuth';

const AdminDashBoard = () => {
  return (
    <RequireAuth>
      <div className="dashboard-wrapper">
        <AdminNavbar />
        <div className="admin-container">
          <AdminSidebar />
          <div className="main-content">
            <h2>Welcome to Admin Dashboard</h2>
            <AdminStatistics />
          </div>
        </div>
      </div>
    </RequireAuth>
  );
};

export default AdminDashBoard;