import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/LandingPage/Footer';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#FEF9ED] flex flex-col">
            <Navbar />
            <main className="flex-1 pt-20">
                {children || <Outlet />}
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
