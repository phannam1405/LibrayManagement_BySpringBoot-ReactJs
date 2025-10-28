import React from 'react';
import '../styles/user.css';

const WeekDaySelector = () => {
  return (
    <div className="week">
      <ul className="week-list">
        <li>MON</li>
        <li>TUE</li>
        <li className="week-active">WED</li>
        <li>THU</li>
        <li>FRI</li>
        <li>SAT</li>
        <li>SUN</li>
      </ul>
    </div>
  );
};

export default WeekDaySelector;