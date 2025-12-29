import api from './api';

/**
 * Referral Service (for marketers)
 */

export const validateCode = async (code) => {
    const response = await api.post('/referrals/validate', { code });
    return response.data;
};

export const getMyCode = async () => {
    const response = await api.get('/referrals/my-code');
    return response.data;
};

export const getReferredUsers = async (params = {}) => {
    const response = await api.get('/referrals/referred-users', { params });
    return response.data;
};

export const getStats = async () => {
    const response = await api.get('/referrals/stats');
    return response.data;
};

export default {
    validateCode,
    getMyCode,
    getReferredUsers,
    getStats
};
