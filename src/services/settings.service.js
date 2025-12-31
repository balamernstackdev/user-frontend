import api from './api';

const getAll = () => {
    return api.get('/settings');
};

const update = (key, value) => {
    return api.put(`/settings/${key}`, { value });
};

const validateRazorpayX = (credentials) => {
    return api.post('/settings/validate-razorpayx', credentials);
};

const settingsService = {
    getAll,
    update,
    validateRazorpayX
};

export default settingsService;
