import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import planService from '../services/plan.service';
import paymentService from '../services/payment.service';
import { authService } from '../services/auth.service';
import SecurePaymentCard from '../components/checkout/SecurePaymentCard';
import './styles/Checkout.css';
import { toast } from 'react-toastify';
import { useSettings } from '../context/SettingsContext';
import logo from '../assets/images/Stoxzo_Logo.svg';

const Checkout = () => {
    const { planId } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('razorpay'); // Default to Razorpay

    const user = authService.getUser();
    const { settings } = useSettings();
    const symbol = settings?.currency_symbol || '₹';
    const taxRate = parseFloat(settings?.tax_rate || '18');

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

            // 1. Create Order/Subscription in DB
            const response = await paymentService.createOrder(planId, plan.plan_type || 'monthly');
            const {
                transactionId,
                orderId,
                subscriptionId, // Razorpay Subscription ID (if recurring)
                amount,
                currency,
                key,
                planName
            } = response.data;

            if (!window.Razorpay) {
                toast.error('Razorpay SDK failed to load. Please refresh and try again.');
                setProcessing(false);
                return;
            }

            // 2. Initialize Razorpay Options
            const options = {
                key: key,
                amount: amount,
                currency: currency,
                name: "Stoxzo",
                description: `Payment for ${planName}`,
                image: logo, // Use imported logo
                handler: async function (response) {
                    try {
                        // 3. Verify Payment on Backend
                        const verifyData = {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            razorpaySubscriptionId: response.razorpay_subscription_id,
                            transactionId: transactionId,
                            planId: planId,
                            planType: plan.plan_type || 'monthly'
                        };

                        await paymentService.verifyPayment(verifyData);

                        // 4. Success Navigation
                        const successTransaction = {
                            id: transactionId,
                            status: 'success',
                            amount: amount / 100,
                            paymentId: response.razorpay_payment_id
                        };

                        setProcessing(false);
                        navigate('/payment-success', { state: { transaction: successTransaction } });

                    } catch (verifyErr) {
                        console.error('Verification failed:', verifyErr);
                        toast.error('Payment verification failed. Please contact support.');
                        setProcessing(false);
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone || ''
                },
                notes: {
                    address: "Stoxzo"
                },
                theme: {
                    color: "#0d6efd"
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false);
                        toast.info('Payment cancelled');
                    }
                }
            };

            // Attach Order ID or Subscription ID
            if (subscriptionId) {
                options.subscription_id = subscriptionId;
            } else if (orderId) {
                options.order_id = orderId;
            }

            // 5. Open Razorpay
            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                console.error('Payment Failed', response.error);
                toast.error(response.error.description || 'Payment Failed');
                setProcessing(false);
            });
            rzp1.open();

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

    const basePrice = Number(plan.monthly_price || plan.yearly_price || plan.lifetime_price || 0);
    const taxAmount = (basePrice * taxRate) / 100;
    const totalPrice = basePrice + taxAmount;

    return (
        <DashboardLayout>
            <section className="checkout-page">
                <div className="container">
                    <div className="checkout-container">
                        <div className="checkout-card animate-fade-up">
                            <div className="checkout-header">
                                <h2>Order Summary</h2>
                                <p style={{ color: 'var(--tj-color-text-body-3)' }}>Review your order before proceeding to payment</p>
                            </div>
                            <div className="order-summary">
                                <div className="order-item">
                                    <div className="order-item-info">
                                        <h4>{plan.name}</h4>
                                        <p>{plan.plan_type === 'monthly' ? 'Monthly Subscription' : plan.plan_type === 'yearly' ? 'Yearly Subscription' : 'Lifetime Access'}</p>
                                    </div>
                                    <div className="order-item-price">{symbol}{basePrice.toLocaleString()}</div>
                                </div>
                            </div>
                            <div style={{ borderTop: '2px solid var(--tj-color-border-1)', paddingTop: '20px' }}>
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>{symbol}{basePrice.toLocaleString()}</span>
                                </div>
                                <div className="summary-row">
                                    <span>GST ({taxRate}%)</span>
                                    <span>{symbol}{taxAmount.toLocaleString()}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span>{symbol}{totalPrice.toLocaleString()}</span>
                                </div>
                            </div>
                            <button
                                className="tj-primary-btn"
                                style={{ width: '100%', justifyContent: 'center', marginTop: '30px' }}
                                onClick={handlePayment}
                                disabled={processing}
                            >
                                <span className="btn-text">
                                    {processing ? 'Processing...' : <span>Proceed to Payment</span>}
                                </span>
                                {!processing && <span className="btn-icon"><i className="fas fa-arrow-right"></i></span>}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};


export default Checkout;
