import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Default to local for dev
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for JWT
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized (logout)
            localStorage.removeItem('token');
            window.location.href = '/auth?mode=login';
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: async (credentials) => {
        // Mock response for development
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: {
                        user: { id: 1, name: 'Alex Johnson', role: 'patient' },
                        token: 'mock-jwt-token-xyz'
                    }
                });
            }, 1000);
        });
        // return api.post('/auth/login', credentials);
    },
    register: async (userData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: {
                        user: { id: 1, name: 'Alex Johnson', role: 'patient' },
                        token: 'mock-jwt-token-xyz'
                    }
                });
            }, 1000);
        });
        // return api.post('/auth/register', userData);
    },
    logout: () => {
        localStorage.removeItem('token');
    }
};

export const medicationService = {
    getAll: () => Promise.resolve([
        { id: 1, name: 'Amoxicillin', dose: '500mg' },
        { id: 2, name: 'Vitamin D', dose: '1000IU' }
    ]),
};

export default api;
