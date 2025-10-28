import React, { useEffect, useState } from 'react';
import { Row, Col, Spin, message } from 'antd';
import StatisticsCard from '../components/StatisticsCard';
import api from '../../api/server';
import '../styles/statistics.css';
import { getToken } from '../../services/localStorageService';
import { useHistory } from 'react-router-dom';
const AdminStatistics = () => {
  const history = useHistory()
  const [stats, setStats] = useState({
    users: {},
    books: {},
    borrows: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const token = getToken();
    
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        

        // Cấu hình header với token
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const [usersRes, booksRes, borrowsRes] = await Promise.all([
          api.get('/statistics/users', config),
          api.get('/statistics/books', config),
          api.get('/statistics/borrows', config)
        ]);
        
        setStats({
          users: usersRes.data.result,
          books: booksRes.data.result,
          borrows: borrowsRes.data.result
        });
      } catch (error) {
        console.error('Lỗi khi tải thống kê:', error);
        setError('Không thể tải dữ liệu thống kê');
        
        if (error.response?.status === 401) {
          message.error('Phiên đăng nhập hết hạn');
          history.push('/login');
        } else {
          message.error('Có lỗi xảy ra khi tải dữ liệu');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [history]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]} className="statistics-row">
      <Col xs={24} sm={24} md={8}>
        <StatisticsCard 
          title="Thống kê Người dùng" 
          data={stats.users} 
          color="#1890ff" 
        />
      </Col>
      <Col xs={24} sm={24} md={8}>
        <StatisticsCard 
          title="Thống kê Sách" 
          data={stats.books} 
          color="#52c41a" 
        />
      </Col>
      <Col xs={24} sm={24} md={8}>
        <StatisticsCard 
          title="Thống kê Mượn sách" 
          data={stats.borrows} 
          color="#faad14" 
        />
      </Col>
    </Row>
  );
};

export default AdminStatistics;