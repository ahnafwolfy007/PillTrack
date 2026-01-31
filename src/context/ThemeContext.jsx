import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Check localStorage first, then system preference
        const stored = localStorage.getItem('pilltrack-theme');
        if (stored) return stored;
        
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        
        // Remove both classes first
        root.classList.remove('light', 'dark');
        
        // Add the current theme class
        root.classList.add(theme);
        
        // Store preference
        localStorage.setItem('pilltrack-theme', theme);
    }, [theme]);

    // Listen for system preference changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e) => {
            const stored = localStorage.getItem('pilltrack-theme');
            // Only auto-switch if user hasn't set a preference
            if (!stored) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const setLightTheme = () => setTheme('light');
    const setDarkTheme = () => setTheme('dark');
    const setSystemTheme = () => {
        localStorage.removeItem('pilltrack-theme');
        setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    };

    const isDark = theme === 'dark';

    return (
        <ThemeContext.Provider value={{
            theme,
            isDark,
            toggleTheme,
            setLightTheme,
            setDarkTheme,
            setSystemTheme,
            setTheme
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
