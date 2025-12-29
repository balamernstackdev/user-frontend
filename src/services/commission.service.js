import api from './api';

/**
 * Commission Service (for marketers)
 */

export const getMyCommissions = async (params = {}) => {
    const response = await api.get('/commissions/my-commissions', { params });
    return response.data;
};

export const getMyStats = async () => {
    const response = await api.get('/commissions/my-stats');
    return response.data;
};

export const getMonthlyEarnings = async (months = 12) => {
    const response = await api.get('/commissions/monthly-earnings', {
        params: { months }
    });
    return response.data;
};

export default {
    getMyCommissions,
    getMyStats,
    getMonthlyEarnings
};
