import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Initialize from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem("pilltrack-theme");
    if (saved !== null) {
      return saved === "dark";
    }
    // Fall back to system preference
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // Apply dark mode class to document
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("pilltrack-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("pilltrack-theme", "light");
    }
  }, [isDarkMode]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      // Only auto-switch if user hasn't set a preference
      const saved = localStorage.getItem("pilltrack-theme");
      if (saved === null) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const setTheme = (theme) => {
    if (theme === "dark") {
      setIsDarkMode(true);
    } else if (theme === "light") {
      setIsDarkMode(false);
    } else if (theme === "system") {
      localStorage.removeItem("pilltrack-theme");
      setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        setTheme,
        theme: isDarkMode ? "dark" : "light",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
