import api from './api';

/**
 * Subscription Service
 */

export const getMySubscriptions = async (params = {}) => {
    const response = await api.get('/subscriptions/my-subscriptions', { params });
    return response.data;
};

export const getActiveSubscription = async () => {
    const response = await api.get('/subscriptions/active');
    return response.data;
};

export const getDownloadableFiles = async () => {
    const response = await api.get('/subscriptions/downloadable-files');
    return response.data;
};

export const cancelSubscription = async (id) => {
    const response = await api.put(`/subscriptions/${id}/cancel`);
    return response.data;
};

export default {
    getMySubscriptions,
    getActiveSubscription,
    getDownloadableFiles,
    cancelSubscription
};
