import api from './api';

export const activityService = {
    // Get all logs
    getAllLogs: async (params) => {
        const response = await api.get('/activity-logs', { params });
        return response.data;
    },

    // Get current user logs
    getMyLogs: async (params) => {
        const response = await api.get('/activity-logs/my', { params });
        return response.data;
    },

    // Get system stats
    getSystemStats: async (params) => {
        const response = await api.get('/activity-logs/stats', { params });
        return response.data;
    }
};

export default activityService;
