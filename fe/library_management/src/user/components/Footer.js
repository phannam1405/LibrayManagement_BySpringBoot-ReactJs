import React from 'react';
import ggPlay from '../assets/images/gg-play.png';
import appStore from '../assets/images/appstore.png';
import '../styles/user.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-app">
        <h2>Thư viện NamTeach</h2>
        <div className="app-flex">
          <img src={ggPlay} alt="google-play" />
          <img src={appStore} alt="app-store" />
        </div>
      </div>
      <div className="footer-icon">
        {/* Các icon SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
          <path fill="#FFF" d="M18.896 0H1.104C.494 0 0 .494 0 1.104v17.793C0 19.506.494 20 1.104 20h9.58v-7.745H8.076V9.237h2.606V7.01c0-2.583 1.578-3.99 3.883-3.99 1.104 0 2.052.082 2.329.119v2.7h-1.598c-1.254 0-1.496.597-1.496 1.47v1.928h2.989l-.39 3.018h-2.6V20h5.098c.608 0 1.102-.494 1.102-1.104V1.104C20 .494 19.506 0 18.896 0z" />
        </svg>
        {/* Thêm các SVG khác tương tự */}
      </div>
      <ul className="footer-list">
        <li>Terms of Use</li>
        <li>Feedback</li>
        <li>Help</li>
        <li>Terms</li>
        <li>Privacy</li>
        <li>Contact</li>
      </ul>
    </footer>
  );
};

export default Footer;