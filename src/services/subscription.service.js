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

// --- Admin ---

export const getAllSubscriptions = async (params) => {
    const response = await api.get('/subscriptions', { params });
    return response.data;
};

export const createSubscription = async (data) => {
    const response = await api.post('/subscriptions', data);
    return response.data;
};

export const deleteSubscription = async (id) => {
    const response = await api.delete(`/subscriptions/${id}`);
    return response.data;
};

export const getSubscription = async (id) => {
    const response = await api.get(`/subscriptions/${id}`);
    return response.data;
};

export const extendSubscription = async (id, days) => {
    const response = await api.put(`/subscriptions/${id}/extend`, { days });
    return response.data;
};

export const updateSubscription = async (id, data) => {
    const response = await api.put(`/subscriptions/${id}`, data);
    return response.data;
};

export default {
    getMySubscriptions,
    getActiveSubscription,
    getDownloadableFiles,
    cancelSubscription,
    getAllSubscriptions,
    createSubscription,
    deleteSubscription,
    getSubscription,
    extendSubscription,
    updateSubscription
};
