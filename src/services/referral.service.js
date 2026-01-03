import api from './api';

/**
 * Referral Service
 * Handles referral codes and statistics
 */
const ReferralService = {
    /**
     * Validate referral code
     * @param {string} code - Referral code to validate
     * @returns {Promise<object>} Response data
     */
    validateCode: async (code) => {
        const response = await api.post('/referrals/validate', { code });
        return response.data;
    },

    /**
     * Get my referral code (Business Associate)
     * @returns {Promise<object>} Response data containing code
     */
    getMyCode: async () => {
        const response = await api.get('/referrals/my-code');
        return response.data;
    },

    /**
     * Get referred users
     * @returns {Promise<object>} Response data containing list of users
     */
    getReferredUsers: async () => {
        const response = await api.get('/referrals/referred-users');
        return response.data;
    },

    /**
     * Get referral statistics
     * @returns {Promise<object>} Response data containing stats
     */
    getStats: async () => {
        const response = await api.get('/referrals/stats');
        return response.data;
    },

    /**
     * Get my commissions
     * @returns {Promise<object>} Response data containing commissions
     */
    getMyCommissions: async () => {
        const response = await api.get('/commissions/my-commissions');
        return response.data;
    },

    /**
     * Get commission statistics
     * @returns {Promise<object>} Response data containing stats
     */
    getCommissionStats: async () => {
        const response = await api.get('/commissions/my-stats');
        return response.data;
    },

    /**
     * Get monthly earnings
     * @returns {Promise<object>} Response data
     */
    getMonthlyEarnings: async () => {
        const response = await api.get('/commissions/monthly-earnings');
        return response.data;
    }
};

export const referralService = ReferralService;
export default ReferralService;
