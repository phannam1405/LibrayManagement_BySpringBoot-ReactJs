import React from 'react';
import bannerImg from '../assets/images/banner.png';
import bannerSec1 from '../assets/images/banner-sec-1.png';
import bannerSec2 from '../assets/images/banner-sec-2.png';
import '../styles/user.css';

const Banner = () => {
  return (
    <div className="banner">
      <img src={bannerImg} alt="banner" className="banner-img" />
      <div className="banner-section">
        <img src={bannerSec1} alt="banner-sec-1" className="banner-sec-1" />
        <img src={bannerSec2} alt="banner-sec-2" className="banner-sec-2" />
      </div>
    </div>
  );
};

export default Banner;