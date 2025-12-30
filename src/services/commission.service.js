import api from './api';

export const commissionService = {
    // Get commissions for the current marketer
    getMyCommissions: async (params) => {
        const response = await api.get('/commissions/my-commissions', { params });
        return response.data;
    },

    // Get stats
    getMyStats: async () => {
        const response = await api.get('/commissions/my-stats');
        return response.data;
    },

    // --- Admin Methods ---

    // Get all commissions
    getAllCommissions: async (params) => {
        const response = await api.get('/commissions', { params });
        return response.data;
    },

    // Approve commission
    approveCommission: async (id) => {
        const response = await api.put(`/commissions/${id}/approve`);
        return response.data;
    },

    // Mark as paid
    markAsPaid: async (id) => {
        const response = await api.put(`/commissions/${id}/pay`);
        return response.data;
    }
};

export default commissionService;
