import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check for stored token on mount
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            } catch (e) {
                // Invalid stored user, clear storage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password);
            const { user, token, refreshToken, roles } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify({ ...user, roles }));
            
            setUser({ ...user, roles });
            setIsAuthenticated(true);
            
            return { success: true, user: { ...user, roles } };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authService.register(userData);
            const { user, token, refreshToken, roles } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify({ ...user, roles }));
            
            setUser({ ...user, roles });
            setIsAuthenticated(true);
            
            return { success: true, user: { ...user, roles } };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateUser = (updates) => {
        const updatedUser = { ...user, ...updates };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    const refreshProfile = async () => {
        try {
            const userData = await userService.getCurrentUser();
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = { ...userData, roles: storedUser.roles };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            console.error('Failed to refresh profile:', error);
            return null;
        }
    };

    // Helper to check if user has a specific role
    const hasRole = (role) => {
        if (!user?.roles) return false;
        return user.roles.includes(role) || user.roles.includes(`ROLE_${role}`);
    };

    const isAdmin = () => hasRole('ADMIN');
    const isShopOwner = () => hasRole('SHOP_OWNER');

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated,
            login,
            register,
            logout,
            updateUser,
            refreshProfile,
            hasRole,
            isAdmin,
            isShopOwner
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
