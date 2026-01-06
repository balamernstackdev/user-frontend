import api from './api';

const announcementService = {
    getActive: async () => {
        const response = await api.get('/announcements');
        return response.data;
    },

    getAll: async (params) => {
        const response = await api.get('/announcements', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/announcements/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/announcements', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/announcements/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/announcements/${id}`);
        return response.data;
    }
};

export default announcementService;
