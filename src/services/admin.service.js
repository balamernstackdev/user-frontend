import instance from './api';

export const adminService = {
    getDashboardStatus: async () => {
        const response = await instance.get('/admin/dashboard-status');
        return response.data;
    },

    /**
     * Get business associate transactions with referral tracking
     * @param {object} params - Query parameters (status, businessAssociateId, limit, offset)
     * @returns {Promise<object>} Response data
     */
    getBATransactions: async (params = {}) => {
        const response = await instance.get('/admin/ba-transactions', { params });
        return response.data;
    },

    /**
     * Get all business associates
     * @param {object} params - Query parameters (status, limit, offset)
     * @returns {Promise<object>} Response data
     */
    getBusinessAssociates: async (params = {}) => {
        const response = await instance.get('/admin/business-associates', { params });
        return response.data;
    }
};

export default adminService;
