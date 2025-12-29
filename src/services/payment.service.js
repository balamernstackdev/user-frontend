import api from './api';

/**
 * Payment Service - Razorpay integration
 */

/**
 * Create payment order
 * @param {string} planId - Plan ID to purchase
 * @returns {Promise} Order details
 */
export const createOrder = async (planId) => {
    const response = await api.post('/payments/create-order', { planId });
    return response.data;
};

/**
 * Verify payment
 * @param {object} paymentData - Payment verification data
 * @returns {Promise} Verification result
 */
export const verifyPayment = async (paymentData) => {
    const response = await api.post('/payments/verify', paymentData);
    return response.data;
};

/**
 * Get user's transactions
 * @param {object} params - Query parameters
 * @returns {Promise} Transaction list
 */
export const getTransactions = async (params = {}) => {
    const response = await api.get('/payments/transactions', { params });
    return response.data;
};

/**
 * Get single transaction
 * @param {string} id - Transaction ID
 * @returns {Promise} Transaction details
 */
export const getTransaction = async (id) => {
    const response = await api.get(`/payments/transactions/${id}`);
    return response.data;
};

export default {
    createOrder,
    verifyPayment,
    getTransactions,
    getTransaction
};
