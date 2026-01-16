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
            console.log('AuthContext: Attempting login for:', email);
            const response = await authService.login(email, password);
            console.log('AuthContext: Login response:', response);
            const { user, token, refreshToken, roles } = response.data;
            
            if (!token) {
                console.error('AuthContext: No token received');
                return { success: false, error: 'No token received from server' };
            }
            
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify({ ...user, roles }));
            
            setUser({ ...user, roles });
            setIsAuthenticated(true);
            
            console.log('AuthContext: Login successful');
            return { success: true, user: { ...user, roles } };
        } catch (error) {
            console.error('AuthContext: Login error:', error);
            return { success: false, error: error.message || 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            console.log('AuthContext: Attempting registration for:', userData.email);
            const response = await authService.register(userData);
            console.log('AuthContext: Register response:', response);
            const { user, token, refreshToken, roles } = response.data;
            
            if (!token) {
                console.error('AuthContext: No token received');
                return { success: false, error: 'No token received from server' };
            }
            
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify({ ...user, roles }));
            
            setUser({ ...user, roles });
            setIsAuthenticated(true);
            
            console.log('AuthContext: Registration successful');
            return { success: true, user: { ...user, roles } };
        } catch (error) {
            console.error('AuthContext: Register error:', error);
            return { success: false, error: error.message || 'Registration failed' };
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
