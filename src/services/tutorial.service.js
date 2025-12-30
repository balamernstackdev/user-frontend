import api from './api';

/**
 * Tutorial Service
 */

export const getTutorials = async (params = {}) => {
    const response = await api.get('/tutorials', { params });
    return response.data;
};

export const getTutorial = async (id) => {
    const response = await api.get(`/tutorials/${id}`);
    return response.data;
};

export const getCategories = async () => {
    const response = await api.get('/tutorials/categories');
    return response.data;
};

export const getTutorialsByCategory = async (category) => {
    const response = await api.get(`/tutorials/category/${category}`);
    return response.data;
};

export const getAdminTutorialsByCategory = async (category) => {
    const response = await api.get(`/tutorials/admin/category/${category}`);
    return response.data;
};

export const createTutorial = async (data) => {
    const response = await api.post('/tutorials', data);
    return response.data;
};

export const updateTutorial = async (id, data) => {
    const response = await api.put(`/tutorials/${id}`, data);
    return response.data;
};

export const deleteTutorial = async (id) => {
    const response = await api.delete(`/tutorials/${id}`);
    return response.data;
};

export const togglePublishStatus = async (id) => {
    const response = await api.put(`/tutorials/${id}/toggle-publish`);
    return response.data;
};

export default {
    getTutorials,
    getTutorial,
    getCategories,
    getCategories,
    getTutorialsByCategory,
    getAdminTutorialsByCategory,
    createTutorial,
    updateTutorial,
    deleteTutorial,
    togglePublishStatus
};
