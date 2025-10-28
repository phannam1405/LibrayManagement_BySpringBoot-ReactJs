import React from 'react';
import { Card, List, Typography } from 'antd';
import '../styles/statistics.css';

const { Title, Text } = Typography;

const StatisticsCard = ({ title, data, color }) => {
  const total = data['TOTAL'] || 0;
  const details = Object.entries(data).filter(([key]) => key !== 'TOTAL');

  return (
    <Card 
      title={title} 
      bordered={false} 
      className="statistics-card"
      headStyle={{ borderBottom: `3px solid ${color}` }}
    >
      <div className="statistics-content">
        <Title level={2} className="total-value" style={{ color }}>{total}</Title>
        <Text strong>Details:</Text>
        <List
          size="small"
          dataSource={details}
          renderItem={([key, value]) => (
            <List.Item>
              <Text>{key}:</Text> <Text strong>{value}</Text>
            </List.Item>
          )}
        />
      </div>
    </Card>
  );
};

export default StatisticsCard;