import api from './api';

/**
 * Payment Service
 * Handles payment processing and order management
 */
const PaymentService = {
    /**
     * Create Razorpay order
     * @param {string} planId - ID of plan to subscribe to
     * @returns {Promise<object>} Response data containing order details
     */
    createOrder: async (planId, planType) => {
        const response = await api.post('/payments/create-order', {
            planId,
            planType
        });
        return response.data;
    },

    /**
     * Verify payment
     * @param {object} paymentData - Razorpay payment details
     * @returns {Promise<object>} Response data
     */
    verifyPayment: async (paymentData) => {
        const {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            planId,
            planType,
            transactionId
        } = paymentData;

        const response = await api.post('/payments/verify', {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            planId,
            planType,
            transactionId
        });
        return response.data;
    },

    /**
     * Get transaction history
     * @returns {Promise<object>} Response data containing transactions
     */
    /**
     * Get transaction history
     * @returns {Promise<object>} Response data containing transactions
     */
    getTransactions: async (params = {}) => {
        const response = await api.get('/payments/transactions', { params });
        return response.data;
    },

    /**
     * Get all transactions (Admin only)
     * @param {object} params - Query parameters (status, limit, offset)
     * @returns {Promise<object>} Response data containing all transactions
     */
    getAllTransactions: async (params = {}) => {
        const response = await api.get('/admin/transactions', { params });
        return response.data;
    },

    /**
     * Get single transaction details
     * @param {string} id - Transaction ID
     * @returns {Promise<object>} Response data
     */
    getTransaction: async (id) => {
        const response = await api.get(`/payments/transactions/${id}`);
        return response.data;
    },

    /**
     * Download Invoice PDF
     * @param {string} transactionId
     * @returns {Promise<Blob>} PDF Blob
     */
    downloadInvoice: async (transactionId) => {
        const response = await api.get(`/invoices/${transactionId}/download`, { responseType: 'blob' });
        return response.data;
    }
};

export default PaymentService;
