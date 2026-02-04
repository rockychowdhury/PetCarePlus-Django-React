import React from 'react';
import { Link, useNavigate, useRouteError } from 'react-router-dom';
import { RefreshCcw, Home, AlertTriangle } from 'lucide-react';
import serverErrorImage from '../../assets/500.jpg';
import Logo from '../../components/common/Logo';

const ServerErrorPage = () => {
    const navigate = useNavigate();
    const error = useRouteError(); // Capture the error
    console.error("Router Caught Error:", error);

    const handleTryAgain = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-[#FEF9ED] flex flex-col  relative overflow-hidden">
            {/* ... header ... */}
            <header className="px-6 py-6 md:px-12 flex justify-between items-center z-20">
                <Link to="/">
                    <Logo />
                </Link>
                <Link to="/" className="text-sm font-semibold text-themev2-text/70 hover:text-themev2-text transition-colors">
                    Back to Home
                </Link>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4 relative text-center -mt-20">
                {/* ... existing UI ... */}

                {/* DEBUG INFO */}
                {error && (
                    <div className="z-20 mt-8 p-4 bg-red-100 text-red-800 rounded-lg max-w-xl text-left overflow-auto">
                        <p className="font-bold">Debugging Error Info:</p>
                        <pre className="text-xs mt-2 p-2 bg-white/50 rounded code">
                            {error.statusText || error.message || String(error)}
                        </pre>
                        {error.stack && (
                            <details className="mt-2 text-xs cursor-pointer">
                                <summary>Stack Trace</summary>
                                <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>
                            </details>
                        )}
                    </div>
                )}

                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[15rem] md:text-[25rem] font-bold text-[#FDF6E3] select-none pointer-events-none z-0">
                    500
                </div>

                <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">
                    <div className="relative mb-8">
                        <div className="w-64 h-48 md:w-80 md:h-56 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                            <img
                                src={serverErrorImage}
                                alt="Something went wrong"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -top-6 -left-6 w-14 h-14 md:w-16 md:h-16 bg-[#C48B28] text-white rounded-full flex items-center justify-center shadow-lg border-4 border-[#FEF9ED] animate-bounce-slow">
                            <AlertTriangle size={28} strokeWidth={2.5} />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-themev2-text mb-4 font-serif">
                        Something Went Wrong
                    </h1>
                    <p className="text-lg md:text-xl text-themev2-text/70 mb-10 max-w-md">
                        We're working on fixing this issue. Please bear with us!
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <button
                            onClick={handleTryAgain}
                            className="w-full sm:w-auto px-8 py-3 bg-[#C48B28] text-white rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-[#B07212] transition-all shadow-lg hover:shadow-xl active:scale-95"
                        >
                            <RefreshCcw size={18} />
                            Try Again
                        </button>
                        <Link
                            to="/"
                            className="w-full sm:w-auto px-8 py-3 bg-transparent border-2 border-[#EBC176]/40 text-themev2-text rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-[#FEF9ED] hover:border-[#C48B28] transition-all"
                        >
                            Go to Homepage
                        </Link>
                    </div>

                    <p className="mt-12 text-sm text-themev2-text/60">
                        If the problem persists, please <Link to="/contact" className="underline hover:text-themev2-text transition-colors">contact support</Link>.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default ServerErrorPage;
