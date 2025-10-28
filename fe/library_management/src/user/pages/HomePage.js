import React from 'react';
import Header from '../components/Header';
import Banner from '../components/Banner';
import WeekDaySelector from '../components/WeekDaySelector';
import ContentSection from '../components/ContentSection';

import Footer from '../components/Footer';
// import MobileVersion from '../components/MobileVersion';
import ChatBox from '../components/ChatBox';
import '../../user/styles/user.css';

const HomePage = () => {
    return (
        <>
            
            <section className="desktop">
                <Header />
                <Banner />
                <WeekDaySelector />
                <ContentSection />
                <ChatBox />
                <Footer />
            </section>
            {/* <MobileVersion /> */}
        </>
    );
};

export default HomePage;