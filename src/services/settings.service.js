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

const uploadBranding = (formData) => {
    return api.post('/settings/upload-branding', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

const testSMTP = (testEmail) => {
    return api.post('/settings/test-smtp', { testEmail });
};

export const settingsService = {
    getAll,
    getPublic,
    update,
    validateRazorpayX,
    uploadBranding,
    testSMTP
};

export default settingsService;
