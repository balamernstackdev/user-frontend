import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout'; // Optional: if Plans page shouldn't be in DashboardLayout, remove this. But typically dashboard pages are.
// Actually product.html has header and footer, so it might be a public page. 
// However, if the user is logged in, DashboardLayout is preferred.
// I'll check if user is logged in. If so, use DashboardLayout? 
// For now, consistent with other migrated pages, I'll use DashboardLayout if it fits the "Dashboard" theme.
// But product.html has "Back to Home" style header.
// I'll stick to DashboardLayout for consistency within the app flow, 
// or simpler: just the page content wrapped.
// Given "Choose Your Plan" is likely accessible from dashboard, I'll use DashboardLayout.

import planService from '../services/plan.service';
import { authService } from '../services/auth.service';
import './Plans.css';

const Plans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const navigate = useNavigate();
    const user = authService.getUser();

    useEffect(() => {
        fetchPlans();
    }, [selectedType]);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const params = selectedType !== 'all' ? { planType: selectedType } : {};
            const response = await planService.getPlans(params);
            setPlans(response.data);
        } catch (err) {
            setError('Failed to load plans');
            console.error(err);
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
        if (name.includes('premium') || name.includes('pro')) return 'fa-star';
        if (name.includes('enterprise') || name.includes('business')) return 'fa-building';
        return 'fa-box'; // default
    };

    const formatPrice = (plan) => {
        if (plan.monthly_price) return { amount: `₹${plan.monthly_price}`, period: '/month' };
        if (plan.yearly_price) return { amount: `₹${plan.yearly_price}`, period: '/year' };
        if (plan.lifetime_price) return { amount: `₹${plan.lifetime_price}`, period: '(Lifetime)' };
        return { amount: 'Contact Us', period: '' };
    };

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout>
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

                    {error && <div className="alert alert-error text-center">{error}</div>}

                    <div className="product-grid">
                        {plans.map((plan, index) => {
                            const { amount, period } = formatPrice(plan);
                            const icon = getPlanIcon(plan.name);
                            const isPopular = plan.is_popular || plan.name.toLowerCase().includes('premium'); // Fallback logic if DB flag missing
                            const animationDelay = 0.2 + (index * 0.1) + 's';

                            return (
                                <div
                                    key={plan.id}
                                    className="product-card animate-fade-up"
                                    style={{
                                        animationDelay,
                                        border: isPopular ? '2px solid var(--tj-color-theme-primary)' : 'none',
                                        position: 'relative'
                                    }}
                                >
                                    {isPopular && (
                                        <span className="product-badge popular">Most Popular</span>
                                    )}

                                    <div className="product-icon">
                                        <i className={`fa-light ${icon}`}></i>
                                    </div>

                                    <h3 className="product-title">{plan.name}</h3>
                                    <div className="product-price">{amount}<span>{period}</span></div>
                                    <p className="product-description">{plan.description}</p>

                                    <ul className="product-features">
                                        {plan.features && plan.features.map((feature, i) => (
                                            <li key={i}>
                                                <i className="fa-light fa-check"></i> {feature}
                                            </li>
                                        ))}
                                        {plan.max_downloads !== undefined && (
                                            <li>
                                                <i className="fa-light fa-check"></i> {plan.max_downloads ? `${plan.max_downloads} Downloads/mo` : 'Unlimited Downloads'}
                                            </li>
                                        )}
                                    </ul>

                                    <button
                                        className="tj-primary-btn"
                                        style={{ width: '100%', justifyContent: 'center' }}
                                        onClick={() => handlePurchase(plan.id)}
                                    >
                                        <span className="btn-text"><span>{user ? `Choose ${plan.name.split(' ')[0]}` : 'Get Started'}</span></span>
                                        <span className="btn-icon"><i className="tji-arrow-right-long"></i></span>
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
