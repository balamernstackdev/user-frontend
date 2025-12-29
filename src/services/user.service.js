import api from './api';

/**
 * User Service
 * Handles user profile and marketer-related operations
 */
export const userService = {
    /**
     * Get user profile
     */
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    /**
     * Update user profile
     */
    updateProfile: async (profileData) => {
        const response = await api.put('/users/profile', profileData);
        return response.data;
    },

    /**
     * Change password
     */
    changePassword: async (passwordData) => {
        const response = await api.put('/users/password', passwordData);
        return response.data;
    },

    /**
     * Get marketer profile (marketers only)
     */
    getMarketerProfile: async () => {
        const response = await api.get('/users/marketer/profile');
        return response.data;
    },

    /**
     * Update marketer profile (marketers only)
     */
    updateMarketerProfile: async (marketerData) => {
        const response = await api.put('/users/marketer/profile', marketerData);
        return response.data;
    },
};
