import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // ENFORCED: Always Light Mode
    const theme = 'light';

    useEffect(() => {
        // Ensure dark mode class is never applied
        const root = window.document.documentElement;
        root.classList.remove('dark');
        // Clear any lingering legacy preference
        localStorage.removeItem('theme');
    }, []);

    const toggleTheme = () => {
        // No-op: Dark mode disabled per requirement
        console.log('Dark mode is currently disabled.');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
