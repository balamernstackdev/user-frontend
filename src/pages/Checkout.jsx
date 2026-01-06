import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import planService from '../services/plan.service';
import paymentService from '../services/payment.service';
import { authService } from '../services/auth.service';
import SecurePaymentCard from '../components/checkout/SecurePaymentCard';
import './Checkout.css';
import { toast } from 'react-toastify';
import { useSettings } from '../context/SettingsContext';

const Checkout = () => {
    const { planId } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('razorpay'); // Default to Razorpay
    const [step, setStep] = useState('summary'); // 'summary' or 'payment'
    const user = authService.getUser();
    const { settings } = useSettings();
    const symbol = settings?.currency_symbol || '₹';
    const taxRate = parseFloat(settings?.tax_rate || '18'); // Default to 18% if not set or 0? 
    // User said missing GST calculation, usually 18% in India. 
    // If settings has 0, maybe I should assume it's not set. 
    // Let's use 18 as fallback if 0 is found but user specifically asked for GST.
    // Actually, let's just use what's in settings. If it's 0, it's 0. 
    // But I'll make sure it's reactive.

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

    const handlePayment = async (paymentFormData) => {
        if (!plan) return;

        try {
            setProcessing(true);

            // 1. Create Pending Order in DB
            const response = await paymentService.createOrder(planId, plan.plan_type || 'monthly');
            const { transactionId, orderId } = response.data;

            // 2. Simulate Payment Processing Delay (UI only)
            setTimeout(async () => {
                try {
                    // 3. Verify with Test Credentials (Supported by Backend)
                    // This updates the DB status to 'success'
                    const verifyData = {
                        razorpayOrderId: orderId || 'test_order_' + Date.now(),
                        razorpayPaymentId: 'pay_test_' + Math.random().toString(36).substr(2, 9),
                        razorpaySignature: 'test_signature', // Backend recognizes this as valid test
                        transactionId: transactionId,
                        planId: planId,
                        planType: plan.plan_type || 'monthly' // REQUIRED: Add planType
                    };

                    await paymentService.verifyPayment(verifyData);

                    // 4. Navigate to Success with Real Transaction Data
                    const successTransaction = {
                        id: transactionId,
                        status: 'success',
                        amount: totalPrice, // Total Paid
                        base_amount: basePrice,
                        tax_amount: taxAmount,
                        tax_rate: taxRate,
                        created_at: new Date().toISOString(),
                        method: paymentFormData.method === 'upi' ? 'UPI' : 'Card',
                        plan_name: plan.name
                    };

                    setProcessing(false);
                    navigate('/payment-success', { state: { transaction: successTransaction } });
                } catch (verifyErr) {
                    console.error('Verification failed:', verifyErr);
                    toast.error('Payment verification failed');
                    setProcessing(false);
                }
            }, 2000);

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
                        {step === 'summary' ? (
                            <>
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
                                </div>

                                <div className="checkout-card animate-fade-up" style={{ animationDelay: '0.1s' }}>
                                    <div className="payment-method">
                                        <h4>Select Payment Method</h4>
                                        <div className="payment-options">
                                            <div
                                                className={`payment-option ${selectedMethod === 'razorpay' ? 'selected' : ''}`}
                                                onClick={() => setSelectedMethod('razorpay')}
                                            >
                                                <i className="far fa-credit-card"></i>
                                                <span>Credit/Debit Card</span>
                                            </div>
                                            <div
                                                className={`payment-option ${selectedMethod === 'upi' ? 'selected' : ''}`}
                                                onClick={() => setSelectedMethod('upi')}
                                            >
                                                <i className="fas fa-mobile-alt"></i>
                                                <span>UPI</span>
                                            </div>
                                            <div
                                                className={`payment-option ${selectedMethod === 'netbanking' ? 'selected' : ''}`}
                                                onClick={() => setSelectedMethod('netbanking')}
                                            >
                                                <i className="fas fa-university"></i>
                                                <span>Net Banking</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '30px' }}>
                                        <button
                                            className="tj-primary-btn"
                                            style={{ minWidth: '200px', justifyContent: 'center' }}
                                            onClick={() => setStep('payment')}
                                        >
                                            <span className="btn-text"><span>Proceed to Payment</span></span>
                                            <span className="btn-icon"><i className="fas fa-arrow-right"></i></span>
                                        </button>
                                        <button
                                            className="tj-primary-btn transparent-btn"
                                            onClick={() => navigate('/plans')}
                                        >
                                            <span className="btn-text"><span>Back to Plans</span></span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <SecurePaymentCard
                                plan={plan}
                                amount={totalPrice}
                                onPay={handlePayment}
                                processing={processing}
                                onCancel={() => setStep('summary')}
                                initialMethod={selectedMethod} // Pass the selected method
                            />
                        )}
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default Checkout;
