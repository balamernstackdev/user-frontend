import api from './api';

const TOKEN_KEY = 'access_token';

/**
 * Authentication Service
 * Handles all authentication-related operations
 */
export const authService = {
    /**
     * Register a new user
     */
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    /**
     * Login user
     */
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.success && response.data.data.accessToken) {
            // Store access token in memory (localStorage for persistence)
            localStorage.setItem(TOKEN_KEY, response.data.data.accessToken);
        }
        return response.data;
    },

    /**
     * Logout user
     */
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear token from storage
            localStorage.removeItem(TOKEN_KEY);
        }
    },

    /**
     * Request password reset email
     */
    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    /**
     * Reset password with token
     */
    resetPassword: async (token, password) => {
        const response = await api.post('/auth/reset-password', { token, password });
        return response.data;
    },

    /**
     * Get stored JWT token
     */
    getToken: () => {
        return localStorage.getItem(TOKEN_KEY);
    },

    /**
     * Set JWT token
     */
    setToken: (token) => {
        localStorage.setItem(TOKEN_KEY, token);
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return false;

        // Check if token is expired
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp * 1000; // Convert to milliseconds
            return Date.now() < expiry;
        } catch (error) {
            return false;
        }
    },

    /**
     * Get decoded user from token
     */
    getUser: () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                userId: payload.userId,
                role: payload.role,
            };
        } catch (error) {
            return null;
        }
    },
};
