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

export default {
    getTutorials,
    getTutorial,
    getCategories,
    getTutorialsByCategory
};
