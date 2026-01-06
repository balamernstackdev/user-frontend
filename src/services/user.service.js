import api from './api';
import TokenService from './token.service';

/**
 * User Service
 * Handles user profile and account management
 */
const UserService = {
    /**
     * Get user profile
     * @returns {Promise<object>} Response data containing user profile
     */
    getProfile: async () => {
        const response = await api.get('/users/profile');
        // Update stored user data if changed
        if (response.data.data && response.data.data.user) {
            const currentUser = TokenService.getUser();
            if (currentUser) {
                currentUser.user = { ...currentUser.user, ...response.data.data.user };
                TokenService.setUser(currentUser);
            }
        }
        return response.data;
    },

    /**
     * Update user profile
     * @param {object} profileData - Data to update
     * @returns {Promise<object>} Response data
     */
    updateProfile: async (profileData) => {
        const response = await api.put('/users/profile', profileData);
        if (response.data.data) {
            const currentUser = TokenService.getUser();
            if (currentUser && currentUser.user) {
                // Preserve token, update user info
                currentUser.user = { ...currentUser.user, ...response.data.data };
                TokenService.setUser(currentUser);
            }
        }
        return response.data;
    },

    /**
     * Change password
     * @param {string} oldPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<object>} Response data
     */
    changePassword: async (oldPassword, newPassword) => {
        const response = await api.put('/users/password', { oldPassword, newPassword });
        return response.data;
    },

    /**
     * Upload user avatar
     * @param {File} file - Image file
     * @returns {Promise<object>} Response data
     */
    uploadAvatar: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/users/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.data && response.data.data.avatarUrl) {
            const currentUser = TokenService.getUser();
            if (currentUser && currentUser.user) {
                currentUser.user.avatar_url = response.data.data.avatarUrl;
                TokenService.setUser(currentUser);
            }
        }

        return response.data;
    },


    /**
     * Get business associate profile
     * @returns {Promise<object>} Response data
     */
    getBusinessAssociateProfile: async () => {
        const response = await api.get('/users/business-associate/profile');
        return response.data;
    },

    /**
     * Update business associate profile
     * @param {object} profileData - Business profile data
     * @returns {Promise<object>} Response data
     */
    updateBusinessAssociateProfile: async (profileData) => {
        const response = await api.put('/users/business-associate/profile', profileData);
        return response.data;
    },

    /**
     * Get all users (Admin only)
     * @param {object} params - Query params (page, limit, role, status)
     * @returns {Promise<object>} Response data
     */
    getAllUsers: async (params) => {
        const response = await api.get('/users', { params });
        return response;
    },

    /**
     * Create user (Admin only)
     * @param {object} userData - User data to create
     * @returns {Promise<object>} Response data
     */
    createUser: async (userData) => {
        const response = await api.post('/users/create', userData);
        return response.data;
    },

    /**
     * Update user (Admin only)
     * @param {string} id - User ID
     * @param {object} userData - User data to update
     * @returns {Promise<object>} Response data
     */
    updateUser: async (id, userData) => {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    },

    /**
     * Update user VIP status (Admin only)
     * @param {string} userId - User ID
     * @param {boolean} isVip - New VIP status
     * @returns {Promise<object>} Response data
     */
    updateVipStatus: async (userId, isVip) => {
        const response = await api.put(`/users/${userId}`, { is_vip: isVip });
        return response.data;
    },

    /**
     * Delete user (Admin only)
     * @param {string} id - User ID
     * @returns {Promise<object>} Response data
     */
    deleteUser: async (id) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    }
};

export const userService = UserService;
export default UserService;
