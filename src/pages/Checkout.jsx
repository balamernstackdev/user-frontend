import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import planService from '../services/plan.service';
import paymentService from '../services/payment.service';
import { authService } from '../services/auth.service';
import SecurePaymentCard from '../components/checkout/SecurePaymentCard';
import './Checkout.css';

const Checkout = () => {
    const { planId } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
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
            setError('Failed to load plan details');
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
            setError('');

            // Create order
            const response = await paymentService.createOrder(planId);
            const order = response.data; // Access nested data object

            if (selectedMethod === 'razorpay') {
                // Simulate embedded payment processing
                setTimeout(async () => {
                    try {
                        const verifyResponse = await paymentService.verifyPayment({
                            orderId: order.orderId,
                            paymentId: 'pay_test_1234567890', // Test Payment ID
                            signature: 'test_signature',      // Test Signature
                            transactionId: order.transactionId
                        });

                        if (verifyResponse.success) {
                            navigate('/payment-success', { state: { transaction: verifyResponse.transaction } });
                        } else {
                            navigate('/payment-failed', { state: { error: 'Payment verification failed' } });
                        }
                    } catch (err) {
                        console.error(err);
                        navigate('/payment-failed', { state: { error: err.message || 'Payment verification failed' } });
                    }
                }, 2000); // 2 second delay to simulate processing

                /* 
                // Original Razorpay Modal Logic - Disabled for Embedded Test Flow
                const options = {
                    key: order.key, // Enter the Key ID generated from the Dashboard
                    amount: order.amount,
                    currency: order.currency,
                    name: "Stoxzo",
                    description: `Subscription for ${plan.name}`,
                    image: "/assets/images/Stoxzo_Logo.svg",
                    order_id: order.orderId, 
                    handler: async function (response) { ... },
                    ...
                };
                const rzp = new window.Razorpay(options);
                rzp.open();
                */
            } else {
                alert('Only Credit/Debit Card/NetBanking (via Razorpay) is currently supported.');
                setProcessing(false);
            }

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to initiate payment');
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
                    {error && <div className="alert alert-error mb-4">{error}</div>}

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
