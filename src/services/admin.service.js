import instance from './api';

const adminService = {
    getStats: async () => {
        const response = await instance.get('/admin/stats');
        return response.data;
    }
};

export default adminService;
