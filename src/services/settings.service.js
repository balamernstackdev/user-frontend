import api from './api';

const getAll = () => {
    return api.get('/settings');
};

const getPublic = () => {
    return api.get('/settings/public');
};

const update = (key, value) => {
    return api.put(`/settings/${key}`, { value });
};

const validateRazorpayX = (credentials) => {
    return api.post('/settings/validate-razorpayx', credentials);
};

export const settingsService = {
    getAll,
    getPublic,
    update,
    validateRazorpayX
};

export default settingsService;
