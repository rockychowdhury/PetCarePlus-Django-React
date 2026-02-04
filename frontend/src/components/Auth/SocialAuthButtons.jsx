import React from 'react';

/**
 * SocialAuthButtons - Google and Apple social login buttons
 * Refactored to use Tailwind CSS utility classes
 */
const SocialAuthButtons = () => {
    const handleGoogleAuth = () => {
        // TODO: Implement Google OAuth
        console.log('Google auth clicked');
    };

    const handleFacebookAuth = () => {
        // TODO: Implement Facebook OAuth
        console.log('Facebook auth clicked');
    };

    const buttonBase = "flex-1 h-14 px-6 text-[13px] font-black border rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]";

    return (
        <div className="flex flex-row gap-4 w-full">
            {/* Google Button */}
            <button
                type="button"
                onClick={handleGoogleAuth}
                className={`${buttonBase} bg-white text-gray-700 border-gray-100 shadow-sm hover:shadow-md hover:bg-gray-50`}
            >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M19.805 10.227c0-.709-.064-1.39-.182-2.045H10.1v3.868h5.438a4.651 4.651 0 01-2.019 3.052v2.507h3.268c1.913-1.761 3.018-4.356 3.018-7.382z" fill="#4285F4" />
                    <path d="M10.1 19.945c2.731 0 5.023-.906 6.697-2.454l-3.268-2.536c-.906.607-2.064.967-3.429.967-2.637 0-4.871-1.78-5.668-4.175H1.064v2.614a9.945 9.945 0 008.936 5.584z" fill="#34A853" />
                    <path d="M4.432 11.747a5.975 5.975 0 010-3.81V5.323H1.164a9.945 9.945 0 000 8.938l3.268-2.514z" fill="#FBBC05" />
                    <path d="M10.1 3.958c1.487 0 2.823.511 3.872 1.514l2.904-2.904C15.119.91 12.827 0 10.1 0A9.945 9.945 0 001.164 5.323l3.268 2.614c.797-2.394 3.031-4.175 5.668-4.175z" fill="#EA4335" />
                </svg>
                Google
            </button>

            {/* Facebook Button */}
            <button
                type="button"
                onClick={handleFacebookAuth}
                className={`${buttonBase} bg-[#1877F2] text-white border-[#1877F2] shadow-md shadow-[#1877F2]/20 hover:bg-[#1864D9] hover:shadow-lg`}
            >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M20 10.061C20 4.505 15.523 0 10 0S0 4.505 0 10.061C0 15.083 3.657 19.245 8.438 19.949v-6.995H5.897V10.06h2.541V7.846c0-2.522 1.492-3.915 3.777-3.915 1.094 0 2.238.197 2.238.197v2.476h-1.26c-1.243 0-1.63.775-1.63 1.57v1.888h2.773l-.443 2.895h-2.33v6.995C16.343 19.245 20 15.083 20 10.061z" />
                </svg>
                Facebook
            </button>
        </div>
    );
};

export default SocialAuthButtons;
