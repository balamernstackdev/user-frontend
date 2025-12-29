import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import planService from '../services/plan.service';
import paymentService from '../services/payment.service';
import { authService } from '../services/auth.service';
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
            const order = await paymentService.createOrder(planId);

            if (selectedMethod === 'razorpay') {
                const options = {
                    key: order.key, // Enter the Key ID generated from the Dashboard
                    amount: order.amount,
                    currency: order.currency,
                    name: "Stoxzo",
                    description: `Subscription for ${plan.name}`,
                    image: "/assets/images/Stoxzo_Logo.svg", // Ensure this path is correct
                    order_id: order.id,
                    handler: async function (response) {
                        try {
                            const verifyResponse = await paymentService.verifyPayment({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
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
                    },
                    prefill: {
                        name: `${user.firstname} ${user.lastname}`,
                        email: user.email,
                        contact: user.mobile || ''
                    },
                    theme: {
                        color: "#1e8a8a"
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    navigate('/payment-failed', {
                        state: {
                            error: response.error.description || 'Payment failed',
                            code: response.error.code
                        }
                    });
                });
                rzp.open();
            } else {
                // Handle other methods if implemented (e.g. offline, etc)
                // For now only Razorpay is fully integrated in this flow
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

                    <div className="checkout-container animate-fade-up">
                        <div className="checkout-card">
                            <div className="checkout-header">
                                <h2>Order Summary</h2>
                                <p>Review your order before proceeding to payment</p>
                            </div>
                            <div className="order-summary">
                                <div className="order-item">
                                    <div className="order-item-info">
                                        <h4>{plan.name}</h4>
                                        <p>{plan.plan_type} Subscription</p>
                                    </div>
                                    <div className="order-item-price">₹{price}</div>
                                </div>
                            </div>
                            <div className="summary-total-section">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>₹{price}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Tax</span>
                                    <span>₹0.00</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span>₹{price}</span>
                                </div>
                            </div>
                        </div>

                        <div className="checkout-card animate-fade-up" style={{ animationDelay: '0.1s' }}>
                            <div className="payment-method">
                                <h4>Select Payment Method</h4>
                                <div className="payment-options">
                                    <div
                                        className={`payment-option ${selectedMethod === 'razorpay' ? 'selected' : ''}`}
                                        onClick={() => setSelectedMethod('razorpay')}
                                    >
                                        <i className="fa-light fa-credit-card"></i>
                                        <span>Online Payment</span>
                                        <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>(Credit/Debit Card, UPI, NetBanking)</div>
                                    </div>
                                    {/* Additional methods can be added here */}
                                </div>
                            </div>

                            <div className="checkout-actions">
                                <button
                                    className="tj-primary-btn"
                                    onClick={handlePayment}
                                    disabled={processing}
                                    style={{ minWidth: '200px' }}
                                >
                                    <span className="btn-text">
                                        <span>{processing ? 'Processing...' : 'Proceed to Payment'}</span>
                                    </span>
                                    {!processing && <span className="btn-icon"><i className="tji-arrow-right-long"></i></span>}
                                </button>
                                <button
                                    className="tj-primary-btn transparent-btn"
                                    onClick={() => navigate('/plans')}
                                    disabled={processing}
                                >
                                    <span className="btn-text"><span>Back to Plans</span></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default Checkout;
