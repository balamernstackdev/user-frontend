import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import planService from '../services/plan.service';
import subscriptionService from '../services/subscription.service';
import { authService } from '../services/auth.service';
import { useSettings } from '../context/SettingsContext';
import SEO from '../components/common/SEO';
import './styles/Plans.css';
import { toast } from 'react-toastify';

const Plans = () => {
    const { settings } = useSettings();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('all');
    const navigate = useNavigate();
    const user = authService.getUser();

    const [activeSubscription, setActiveSubscription] = useState(null);

    useEffect(() => {
        if (user?.role === 'business_associate') {
            navigate('/dashboard');
            return;
        }
        fetchPlans();
        if (user) {
            fetchActiveSubscription();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedType, user?.role]);

    const fetchActiveSubscription = async () => {
        try {
            const response = await subscriptionService.getActiveSubscription();
            if (response && response.success && response.data) {
                setActiveSubscription(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch active subscription', error);
        }
    };

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const params = selectedType !== 'all' ? { planType: selectedType } : {};
            const response = await planService.getPlans(params);
            setPlans(response.data || []);
        } catch (err) {
            console.error('Error fetching plans:', err);
            toast.error(err.response?.data?.message || 'Failed to load plans');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = (planId) => {
        if (!user) {
            navigate('/login', { state: { from: `/checkout/${planId}` } });
        } else {
            navigate(`/checkout/${planId}`);
        }
    };

    const getPlanIcon = (planName) => {
        const name = planName.toLowerCase();
        if (name.includes('basic') || name.includes('starter')) return 'fa-rocket';
        if (name.includes('advanced')) return 'fa-bolt';
        if (name.includes('premium') || name.includes('pro')) return 'fa-crown';
        if (name.includes('enterprise') || name.includes('business')) return 'fa-gem';
        if (name.includes('life time') || name.includes('lifetime')) return 'fa-infinity';
        return 'fa-box'; // default
    };

    const formatPrice = (plan) => {
        const symbol = settings.currency_symbol || '₹';
        if (plan.plan_type === 'lifetime' && (plan.lifetime_price || plan.monthly_price)) return { amount: `${symbol}${plan.lifetime_price || plan.monthly_price}`, period: ' (Lifetime)' };
        if (plan.plan_type === 'yearly' && (plan.yearly_price || plan.monthly_price)) return { amount: `${symbol}${plan.yearly_price || plan.monthly_price}`, period: '/year' };
        if (plan.monthly_price) return { amount: `${symbol}${plan.monthly_price}`, period: '/month' };
        return { amount: 'Contact Us', period: '' };
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <SEO title="Membership Plans" description="Choose a plan to get access to premium stock market analysis." />
            <section className="page-section">
                <div className="container">
                    <div className="page-header animate-fade-up">
                        <h2>Choose Your Plan</h2>
                        <p style={{ color: 'var(--tj-color-text-body-3)' }}>Select the perfect plan for your needs</p>
                    </div>

                    <div className="plan-type-filter animate-fade-up" style={{ animationDelay: '0.1s' }}>
                        {['all', 'monthly', 'yearly', 'lifetime'].map(type => (
                            <button
                                key={type}
                                className={`filter-btn ${selectedType === type ? 'active' : ''}`}
                                onClick={() => setSelectedType(type)}
                                style={{ textTransform: 'capitalize' }}
                            >
                                {type === 'all' ? 'All Plans' : type}
                            </button>
                        ))}
                    </div>

                    <div className="product-grid">
                        {plans.map((plan, index) => {
                            const { amount, period } = formatPrice(plan);
                            const icon = getPlanIcon(plan.name);
                            const isPopular = plan.is_popular || plan.name.toLowerCase().includes('premium'); // Fallback logic if DB flag missing
                            const isCurrentPlan = activeSubscription && activeSubscription.plan_id === plan.id && activeSubscription.status === 'active';
                            const animationDelay = 0.2 + (index * 0.1) + 's';

                            return (
                                <div
                                    key={plan.id}
                                    className="product-card animate-fade-up"
                                    style={{
                                        animationDelay,
                                        border: isCurrentPlan ? '2px solid #28a745' : (isPopular ? '2px solid var(--tj-color-theme-primary)' : 'none'),
                                        background: isCurrentPlan ? '#f0fff4' : 'var(--tj-color-common-white)',
                                        position: 'relative'
                                    }}
                                >
                                    {isCurrentPlan && (
                                        <span className="product-badge" style={{ background: '#28a745' }}>Current Plan</span>
                                    )}
                                    {!isCurrentPlan && isPopular && (
                                        <span className="product-badge popular">Most Popular</span>
                                    )}

                                    <div className="product-icon">
                                        <i className={`fas ${icon}`}></i>
                                    </div>

                                    <h3 className="product-title">{plan.name}</h3>
                                    <div className="product-price">{amount}<span>{period}</span></div>
                                    <p className="product-description">{plan.description}</p>

                                    <ul className="product-features">
                                        {plan.features && plan.features.map((feature, i) => (
                                            <li key={i}>
                                                <i className="fas fa-check"></i> {feature}
                                            </li>
                                        ))}
                                        {plan.max_downloads !== undefined && (
                                            <li>
                                                <i className="fas fa-check"></i> {(plan.max_downloads > 0) ? `${plan.max_downloads} Downloads/mo` : 'Unlimited Downloads'}
                                            </li>
                                        )}
                                    </ul>

                                    <button
                                        className={`tj-primary-btn ${isCurrentPlan ? 'disabled-btn' : ''}`}
                                        style={{
                                            width: '100%',
                                            justifyContent: 'center',
                                            opacity: isCurrentPlan ? 0.7 : 1,
                                            cursor: isCurrentPlan ? 'not-allowed' : 'pointer',
                                            backgroundColor: isCurrentPlan ? '#28a745' : ''
                                        }}
                                        onClick={() => !isCurrentPlan && handlePurchase(plan.id)}
                                        disabled={isCurrentPlan}
                                    >
                                        <span className="btn-text"><span>{isCurrentPlan ? 'Current Plan' : (user ? 'Choose Plan' : 'Get Started')}</span></span>
                                        {!isCurrentPlan && <span className="btn-icon"><i className="fas fa-arrow-right"></i></span>}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {plans.length === 0 && !loading && (
                        <div className="text-center" style={{ padding: '50px' }}>
                            <p className="text-muted">No plans available at the moment.</p>
                        </div>
                    )}
                </div>
            </section>
        </DashboardLayout>
    );
};

export default Plans;
