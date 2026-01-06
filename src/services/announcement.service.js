import api from './api';

const announcementService = {
    getActive: async () => {
        const response = await api.get('/announcements');
        return response.data;
    },

    getAll: async () => {
        const response = await api.get('/announcements?view=admin');
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/announcements', data);
        return response.data;
    }
};

export default announcementService;
