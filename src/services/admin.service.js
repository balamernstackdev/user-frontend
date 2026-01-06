import instance from './api';

export const adminService = {
    getDashboardStatus: async (params = {}) => {
        const response = await instance.get('/admin/dashboard-status', { params });
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
    },

    /**
     * Export data to CSV or PDF
     * @param {string} type - Data type ('transactions', 'commissions', 'users')
     * @param {string} format - File format ('csv', 'pdf')
     * @returns {Promise<Blob>} File blob
     */
    exportData: async (type, format, params = {}) => {
        const response = await instance.get(`/admin/export/${type}/${format}`, {
            params,
            responseType: 'blob'
        });
        return response.data;
    },

    exportTransactions: (params) => adminService.exportData('transactions', 'csv', params),
    exportUsers: (params) => adminService.exportData('users', 'csv', params),
    exportMarketersCSV: (params) => adminService.exportData('marketers', 'csv', params),
    exportMarketersPDF: (params) => adminService.exportData('marketers', 'pdf', params),
    exportCommissions: (params) => adminService.exportData('commissions', 'csv', params)
};

export default adminService;
