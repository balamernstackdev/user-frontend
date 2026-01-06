import api from './api';

/**
 * Payment Service
 * Handles payment processing and order management
 */
const PaymentService = {
    /**
     * Create Razorpay order
     * @param {string} planId - ID of plan to subscribe to
     * @param {string} planType - Billing cycle (monthly, yearly, lifetime)
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
     * Load Razorpay Checkout Script
     * @returns {Promise<boolean>} Success status
     */
    loadRazorpay: () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    },

    /**
     * Initialize Payment Flow
     * @param {object} orderData - Data returned from createOrder
     * @param {object} user - User object
     * @param {object} settings - Settings object
     * @param {object} handlers - { onSuccess, onFailure }
     */
    initializePayment: async (orderData, user, settings, handlers) => {
        const { onSuccess, onFailure } = handlers;

        const options = {
            key: orderData.key || settings.razorpay_key,
            amount: orderData.amount,
            currency: orderData.currency,
            name: settings.site_name || 'Stoxzo',
            description: `Subscription for ${orderData.plan_name || 'Plan'}`,
            image: settings.logo_url,
            order_id: orderData.orderId || orderData.id,

            handler: async function (response) {
                try {
                    const verifyRes = await PaymentService.verifyPayment({
                        razorpayOrderId: response.razorpay_order_id,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpaySignature: response.razorpay_signature,
                        transactionId: orderData.transactionId,
                        planId: orderData.plan_id
                    });

                    if (verifyRes.success) {
                        onSuccess(verifyRes.data);
                    } else {
                        onFailure(new Error('Verification failed'));
                    }
                } catch (error) {
                    onFailure(error);
                }
            },
            prefill: {
                name: user.name,
                email: user.email,
                contact: user.phone || '',
                vpa: orderData.upiId || '' // Add VPA prefill
            },
            theme: {
                color: settings.brand_color || '#13689e'
            },
            modal: {
                ondismiss: function () {
                    if (handlers.onDismiss) handlers.onDismiss();
                }
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
            onFailure({
                message: response.error.description,
                metadata: response.error.metadata
            });
        });
        rzp.open();
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
