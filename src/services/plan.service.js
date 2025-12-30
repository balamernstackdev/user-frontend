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

/**
 * Create plan
 * @param {object} planData - Plan data
 * @returns {Promise} Created plan
 */
export const createPlan = async (planData) => {
    const response = await api.post('/plans', planData);
    return response.data;
};

/**
 * Update plan
 * @param {string} id - Plan ID
 * @param {object} planData - Updated plan data
 * @returns {Promise} Updated plan
 */
export const updatePlan = async (id, planData) => {
    const response = await api.put(`/plans/${id}`, planData);
    return response.data;
};

/**
 * Delete plan
 * @param {string} id - Plan ID
 * @returns {Promise} Delete status
 */
export const deletePlan = async (id) => {
    const response = await api.delete(`/plans/${id}`);
    return response.data;
};

/**
 * Toggle plan active status
 * @param {string} id - Plan ID
 * @returns {Promise} Toggled plan
 */
export const togglePlanStatus = async (id) => {
    const response = await api.put(`/plans/${id}/toggle-status`);
    return response.data;
};

export default {
    getPlans,
    getPlan,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanStatus
};
