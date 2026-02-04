import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Logo from '../components/common/Logo';

const AuthSplitLayout = ({ carousel, children }) => {
    return (
        <div className="flex flex-col md:flex-row min-h-screen w-full bg-white">
            {/* Left Panel - Carousel */}
            <div className="w-full md:w-[45%] lg:w-1/2 h-[40vh] md:h-screen md:sticky md:top-0 relative overflow-hidden">
                {/* Logo - Top Left */}
                <div className="absolute top-8 left-8 md:top-12 md:left-12 z-30">
                    <Link to="/" className="hover:opacity-80 transition-opacity">
                        <Logo variant="white" />
                    </Link>
                </div>

                {/* Back Button - Top Right */}
                <div className="absolute top-8 right-8 md:top-12 md:right-12 z-30">
                    <Link
                        to="/"
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-black/10 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider hover:bg-black/20 transition-all border border-white/10"
                    >
                        Return Home
                        <ArrowRight size={14} strokeWidth={3} />
                    </Link>
                </div>

                {/* Carousel Content */}
                {carousel}
            </div>

            {/* Right Panel - Forms */}
            <div className="w-full md:w-[55%] lg:w-1/2 min-h-[60vh] md:min-h-screen bg-white flex items-center justify-center p-6 md:p-12 lg:p-20 overflow-y-auto">
                <div className="w-full max-w-[480px]">
                    {children}
                </div>
            </div>
        </div>
    );
};

AuthSplitLayout.propTypes = {
    carousel: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
};

export default AuthSplitLayout;
