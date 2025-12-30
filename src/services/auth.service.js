import api from './api';
import TokenService from './token.service';

export const authService = {
    async register(userData) {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    async login(credentials) {
        const response = await api.post('/auth/login', credentials);
        if (response.data.success) {
            // Store user AND accessToken
            const { user, accessToken } = response.data.data;
            TokenService.setUser({ ...user, accessToken });
        }
        return response.data;
    },

    async logout() {
        try {
            await api.post('/auth/logout');
        } finally {
            TokenService.removeUser();
        }
    },

    async forgotPassword(email) {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    async resetPassword(token, password) {
        const response = await api.post('/auth/reset-password', { token, password });
        return response.data;
    },

    async verifyEmail(token) {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        return response.data;
    },

    async resendVerification(email) {
        const response = await api.post('/auth/resend-verification', { email });
        return response.data;
    },

    getCurrentUser() {
        return TokenService.getUser();
    },

    isAuthenticated() {
        return !!TokenService.getToken();
    },

    getUser() {
        return TokenService.getUser();
    },

    // Kept for backward compatibility if needed, but delegated to TokenService
    getToken() {
        return TokenService.getToken();
    }
};
