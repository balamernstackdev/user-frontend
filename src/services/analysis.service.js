import api from './api';

/**
 * Analysis Service - Handles API calls for curated analysis
 */
const AnalysisService = {
    /**
     * Get all published analyses
     * @param {object} params - Optional filters (category, limit, offset)
     */
    getAnalyses: async (params = {}) => {
        const response = await api.get('/analyses', { params });
        return response.data;
    },

    /**
     * Get analysis categories
     */
    getCategories: async () => {
        const response = await api.get('/analyses/categories');
        return response.data;
    },

    /**
     * Get single analysis by ID
     */
    getAnalysis: async (id) => {
        const response = await api.get(`/analyses/${id}`);
        return response.data;
    },

    /**
     * Admin: Get all analyses (including drafts)
     */
    getAdminAnalyses: async () => {
        const response = await api.get('/analyses/admin/all');
        return response.data;
    },

    /**
     * Admin: Create new analysis
     */
    createAnalysis: async (data) => {
        const response = await api.post('/analyses', data);
        return response.data;
    },

    /**
     * Admin: Update analysis
     */
    updateAnalysis: async (id, data) => {
        const response = await api.put(`/analyses/${id}`, data);
        return response.data;
    },

    /**
     * Admin: Upload file (Image or PDF)
     */
    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/analyses/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    /**
     * Admin: Delete analysis
     */
    deleteAnalysis: async (id) => {
        const response = await api.delete(`/analyses/${id}`);
        return response.data;
    }
};

export default AnalysisService;
