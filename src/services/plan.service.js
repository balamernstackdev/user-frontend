import api from './api';

/**
 * Plan Service
 */

/**
 * Get all plans
 * @param {object} params - Query parameters
 * @returns {Promise} Plans list
 */
export const getPlans = async (params = {}) => {
    const response = await api.get('/plans', { params });
    return response.data;
};

/**
 * Get single plan
 * @param {string} id - Plan ID or slug
 * @returns {Promise} Plan details
 */
export const getPlan = async (id) => {
    const response = await api.get(`/plans/${id}`);
    return response.data;
};

export default {
    getPlans,
    getPlan
};
