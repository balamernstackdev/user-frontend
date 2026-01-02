import api from './api';

export const userService = {
    // Get user profile
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    // Update user profile
    updateProfile: async (userData) => {
        const response = await api.put('/users/profile', userData);
        return response.data;
    },

    // Change password
    changePassword: async (passwordData) => {
        const response = await api.put('/users/password', passwordData);
        return response.data;
    },

    // Get business associate profile
    getBusinessAssociateProfile: async () => {
        const response = await api.get('/users/business-associate/profile');
        return response.data;
    },

    // Update business associate profile
    updateBusinessAssociateProfile: async (profileData) => {
        const response = await api.put('/users/business-associate/profile', profileData);
        return response.data;
    },

    // --- Admin Methods ---

    // Get all users
    getAllUsers: async (params) => {
        const response = await api.get('/users', { params });
        return response.data;
    },

    // Update user (admin)
    updateUser: async (id, userData) => {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    },

    // Delete user
    deleteUser: async (id) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    }
};
