import api from './api';
import TokenService from './token.service';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
const AuthService = {
    /**
     * Register a new user
     * @param {object} userData - User registration data
     * @returns {Promise<object>} Response data
     */
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.data?.accessToken) {
            TokenService.setUser(response.data.data);
        }
        return response.data;
    },

    /**
     * Login user
     * @param {object} credentials - User credentials {email, password}
     * @returns {Promise<object>} Response data
     */
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.data?.accessToken) {
            TokenService.setUser(response.data.data);
        }
        return response.data;
    },

    /**
     * Logout user
     * @returns {Promise<void>}
     */
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            TokenService.removeUser();
            window.location.href = '/login';
        }
    },

    /**
     * Request password reset email
     * @param {string} email - User email
     * @returns {Promise<object>} Response data
     */
    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    /**
     * Reset password with token
     * @param {string} token - Reset token
     * @param {string} password - New password
     * @returns {Promise<object>} Response data
     */
    resetPassword: async (token, password) => {
        const response = await api.post('/auth/reset-password', { token, newPassword: password });
        return response.data;
    },

    /**
     * Verify email address
     * @param {string} token - Verification token
     * @returns {Promise<object>} Response data
     */
    verifyEmail: async (token) => {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        return response.data;
    },

    /**
     * Resend verification email
     * @param {string} email - User email
     * @returns {Promise<object>} Response data
     */
    resendVerification: async (email) => {
        const response = await api.post('/auth/resend-verification', { email });
        return response.data;
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated: () => {
        return !!TokenService.getToken();
    },

    /**
     * Get current user
     * @returns {object|null} User object or null
     */
    getUser: () => {
        const data = TokenService.getUser();
        return data?.user || null;
    }
};

export const authService = AuthService;
export default AuthService;
