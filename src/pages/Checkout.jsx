import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import planService from '../services/plan.service';
import paymentService from '../services/payment.service';
import { authService } from '../services/auth.service';
import SecurePaymentCard from '../components/checkout/SecurePaymentCard';
import './Checkout.css';
import { toast } from 'react-toastify';

const Checkout = () => {
    const { planId } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('razorpay'); // Default to Razorpay
    const user = authService.getUser();

    useEffect(() => {
        if (!planId) {
            navigate('/plans');
            return;
        }
        fetchPlanDetails();
        loadRazorpayScript();
    }, [planId]);

    const fetchPlanDetails = async () => {
        try {
            setLoading(true);
            const response = await planService.getPlan(planId);
            setPlan(response.data);
        } catch (err) {
            toast.error('Failed to load plan details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadRazorpayScript = () => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    };

    const handlePayment = async () => {
        if (!plan) return;

        try {
            setProcessing(true);

            // Create order
            const response = await paymentService.createOrder(planId, plan.plan_type || 'monthly');
            const order = response.data; // Access nested data object

            if (selectedMethod === 'razorpay') {
                const {
                    orderId,
                    subscriptionId,
                    isRecurring,
                    amount,
                    currency,
                    transactionId,
                    key
                } = response.data; // Access nested data

                // Razorpay options
                const options = {
                    key: key,
                    amount: amount,
                    currency: currency,
                    name: "Dashboard App",
                    description: plan.name,
                    image: "/logo192.png", // Add your logo here

                    // Subscription vs Order
                    ...(isRecurring && subscriptionId
                        ? { subscription_id: subscriptionId }
                        : { order_id: orderId }
                    ),

                    handler: async function (response) {
                        try {
                            const verifyData = {
                                transactionId: transactionId,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                            };

                            if (isRecurring) {
                                verifyData.razorpaySubscriptionId = response.razorpay_subscription_id;
                                // For subscriptions, order_id might not be returned in handler response or is different
                            } else {
                                verifyData.razorpayOrderId = response.razorpay_order_id;
                            }

                            const verifyResponse = await paymentService.verifyPayment(verifyData);

                            if (verifyResponse.success) {
                                navigate('/payment-success', { state: { transaction: verifyResponse.data.transaction } });
                            } else {
                                navigate('/payment-failed', { state: { error: 'Payment verification failed' } });
                            }
                        } catch (err) {
                            console.error(err);
                            navigate('/payment-failed', { state: { error: err.message || 'Payment verification failed' } });
                        }
                    },
                    prefill: {
                        name: user.name,
                        email: user.email,
                        contact: user.phone || ''
                    },
                    theme: {
                        color: "#3399cc"
                    }
                };

                const rzp1 = new window.Razorpay(options);
                rzp1.on('payment.failed', function (response) {
                    navigate('/payment-failed', {
                        state: {
                            error: response.error.description,
                            metadata: response.error.metadata
                        }
                    });
                });
                rzp1.open();

                setProcessing(false); // Reset processing state as modal is open
            } else {
                toast.info('Only Credit/Debit Card/NetBanking (via Razorpay) is currently supported.');
                setProcessing(false);
            }

        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to initiate payment');
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="checkout-page">
                    <div className="container">
                        <div className="checkout-loader">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3">Loading order details...</p>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!plan) {
        return (
            <DashboardLayout>
                <div className="checkout-page">
                    <div className="container text-center">
                        <div className="alert alert-error">Plan not found</div>
                        <button className="tj-primary-btn" onClick={() => navigate('/plans')}>
                            Back to Plans
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const price = plan.monthly_price || plan.yearly_price || plan.lifetime_price;

    return (
        <DashboardLayout>
            <section className="checkout-page">
                <div className="container">
                    {/* Use SecurePaymentCard if Razorpay is displayed, otherwise could show generic summary */}
                    <SecurePaymentCard
                        plan={plan}
                        amount={price}
                        onPay={handlePayment}
                        processing={processing}
                        onCancel={() => navigate('/plans')}
                    />
                </div>
            </section>
        </DashboardLayout>
    );
};

export default Checkout;
