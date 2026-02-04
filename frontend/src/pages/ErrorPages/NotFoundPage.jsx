import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, PawPrint, Briefcase, LayoutDashboard, Home } from 'lucide-react';
import notFoundImage from '../../assets/404.jpg';

const NotFoundPage = () => {
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        // Implement search logic or redirect to browse
        navigate('/pets');
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#FEF9ED] flex flex-col items-center justify-center p-4 relative overflow-hidden text-center">
            {/* Background 404 Text */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[15rem] md:text-[25rem] font-bold text-[#FDF6E3] select-none pointer-events-none z-0">
                404
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">

                {/* Image Section */}
                <div className="relative mb-8">
                    <div className="w-48 h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden shadow-xl border-4 border-white transform rotate-3 transition-transform hover:rotate-0 duration-300">
                        <img
                            src={notFoundImage}
                            alt="Lost Dog"
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                        />
                    </div>
                    {/* Question Mark Badge */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 md:w-16 md:h-16 bg-[#C48B28] text-white rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold shadow-lg border-4 border-[#FEF9ED]">
                        ?
                    </div>
                </div>

                {/* Text Content */}
                <h1 className="text-4xl md:text-5xl font-bold text-themev2-text mb-4 font-serif">
                    Oops! Page Not Found
                </h1>
                <p className="text-lg md:text-xl text-themev2-text/70 mb-8 max-w-md">
                    The page you're looking for seems to have wandered off.
                </p>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="w-full max-w-md mb-12 relative">
                    <input
                        type="text"
                        placeholder="Search for what you need..."
                        className="w-full h-14 pl-6 pr-14 rounded-full border-none shadow-soft text-themev2-text placeholder:text-themev2-text/40 focus:ring-2 focus:ring-[#C48B28]/20 bg-white"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-2 h-10 w-10 bg-[#C48B28] text-white rounded-full flex items-center justify-center hover:bg-[#B07212] transition-colors"
                    >
                        <Search size={20} />
                    </button>
                </form>

                {/* Suggestions Section */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-soft w-full">
                    <h2 className="text-sm font-bold text-themev2-text mb-6 uppercase tracking-wider">
                        You might be looking for:
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <QuickLink
                            to="/pets"
                            icon={<Search size={20} />}
                            label="Browse Pets"
                        />
                        <QuickLink
                            to="/services"
                            icon={<Briefcase size={20} />}
                            label="Find Services"
                        />
                        <QuickLink
                            to="/dashboard"
                            icon={<LayoutDashboard size={20} />}
                            label="Dashboard"
                        />
                        <QuickLink
                            to="/"
                            icon={<Home size={20} />}
                            label="Homepage"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuickLink = ({ to, icon, label }) => (
    <Link
        to={to}
        className="flex items-center gap-3 p-4 rounded-xl bg-[#FEF9ED] hover:bg-[#FDF6E3] transition-colors group text-left border border-[#EBC176]/20"
    >
        <div className="text-[#C48B28] group-hover:text-[#B07212] transition-colors">
            {icon}
        </div>
        <span className="font-semibold text-themev2-text">{label}</span>
    </Link>
);

export default NotFoundPage;
