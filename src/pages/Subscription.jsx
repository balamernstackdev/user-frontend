import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import subscriptionService from '../services/subscription.service';
import { authService } from '../services/auth.service';
import { useSettings } from '../context/SettingsContext';
import { toast } from 'react-toastify';
import './styles/Subscription.css';

const Subscription = () => {
    const { settings } = useSettings();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const user = authService.getUser();
        if (user?.role === 'business_associate') {
            navigate('/dashboard');
            return;
        }
        fetchSubscription();
    }, [navigate]);

    const fetchSubscription = async () => {
        try {
            setLoading(true);
            const response = await subscriptionService.getActiveSubscription();
            if (response.success && response.data) {
                const sub = response.data;
                // Normalize backend flat structure to expected nested structure
                if (!sub.plan && sub.plan_name) {
                    sub.plan = {
                        id: sub.plan_id,
                        name: sub.plan_name,
                        plan_type: sub.plan_type,
                        monthly_price: sub.monthly_price,
                        yearly_price: sub.yearly_price,
                        lifetime_price: sub.lifetime_price,
                        features: sub.features
                    };
                }
                setSubscription(sub);
            }
        } catch (err) {
            console.error('Error fetching subscription:', err);
            setError('Failed to load subscription details.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!subscription) {
        return (
            <DashboardLayout>
                <section className="page-section">
                    <div className="container">
                        <div className="page-header">
                            <h2>My Subscription</h2>
                            <p style={{ color: '#6c757d' }}>Manage your subscription plan and billing</p>
                        </div>
                        <div className="row justify-content-center">
                            <div className="col-lg-12">
                                <div className="no-content-state">
                                    <div className="no-content-icon">
                                        <i className="fas fa-crown"></i>
                                    </div>
                                    <h3>No Active Subscription</h3>
                                    <p>Experience the full power of our platform with a premium plan. Unlock exclusive tools, reports, and priority support today.</p>
                                    <Link to="/plans" className="tj-primary-btn" style={{ display: 'inline-flex' }}>
                                        <span className="btn-text"><span>Explore Premium Plans</span></span>
                                        <span className="btn-icon"><i className="fas fa-arrow-right"></i></span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </DashboardLayout>
        );
    }

    // Determine plan price/cycle from API data
    const getPriceDisplay = () => {
        const plan = subscription.plan || {};
        const symbol = settings?.currency_symbol || '₹';
        const formatPrice = (price) => {
            return `${symbol}${parseFloat(price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        };

        if (plan.plan_type === 'monthly') return `${formatPrice(plan.monthly_price)}/month`;
        if (plan.plan_type === 'yearly') return `${formatPrice(plan.yearly_price)}/year`;
        if (plan.plan_type === 'lifetime') return `${formatPrice(plan.lifetime_price)} One-time`;

        // Final fallback if plan_type is missing but monthly_price is there
        if (plan.monthly_price) return `${formatPrice(plan.monthly_price)}/month`;

        return 'N/A';
    };

    // Features handling
    let features = [];
    if (subscription.plan?.features) {
        const rawFeatures = subscription.plan.features;
        if (Array.isArray(rawFeatures)) {
            features = rawFeatures;
        } else if (typeof rawFeatures === 'string') {
            try {
                features = JSON.parse(rawFeatures);
            } catch (e) {
                // If parse fails, assume it's valid string or comma-separated
                features = [rawFeatures];
            }
        }
    }

    return (
        <DashboardLayout>
            <section className="page-section">
                <div className="container">
                    <div className="page-header">
                        <h2>My Subscription</h2>
                        <p>Manage your subscription plan and billing</p>
                    </div>
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="subscription-card">
                                <div className="subscription-header">
                                    <h3 className="subscription-title">{subscription.plan?.name || 'Unknown Plan'}</h3>
                                    <span className={`subscription-status ${subscription.status?.toLowerCase() === 'active' ? 'active' : ''}`}>
                                        {subscription.status}
                                    </span>
                                </div>
                                <div className="subscription-info">
                                    <div className="info-item">
                                        <span className="info-label">Plan Type</span>
                                        <span className="info-value">{subscription.plan?.plan_type ? subscription.plan.plan_type.charAt(0).toUpperCase() + subscription.plan.plan_type.slice(1) : 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Billing Cycle</span>
                                        <span className="info-value">{subscription.plan?.plan_type === 'monthly' ? 'Monthly' : subscription.plan?.plan_type === 'yearly' ? 'Yearly' : 'One-time'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Next Billing Date</span>
                                        <span className="info-value">{formatDate(subscription.end_date)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Amount</span>
                                        <span className="info-value">{getPriceDisplay()}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Auto Renew</span>
                                        <span className={`info-value ${subscription.auto_renew ? 'text-success' : 'text-muted'}`}>
                                            {subscription.auto_renew ? 'On' : 'Off'}
                                        </span>
                                    </div>
                                </div>
                                <div className="subscription-features">
                                    <h4>Plan Features</h4>
                                    <ul className="features-list">
                                        {features.length > 0 ? (
                                            features.map((feature, index) => (
                                                <li key={index}><i className="fas fa-check"></i> {feature}</li>
                                            ))
                                        ) : (
                                            <li>No features listed</li>
                                        )}
                                    </ul>
                                </div>
                                <div className="subscription-actions">
                                    <Link to="/plans" className="tj-primary-btn">
                                        <span className="btn-text">Renew / Upgrade Plan</span>
                                        <span className="btn-icon"><i className="fas fa-arrow-right"></i></span>
                                    </Link>
                                    <Link to="/payments" className="tj-primary-btn transparent-btn">
                                        <span className="btn-text">View Payment History</span>
                                        <span className="btn-icon"><i className="fas fa-arrow-right"></i></span>
                                    </Link>
                                    {subscription.auto_renew && (
                                        <button
                                            onClick={async () => {
                                                if (window.confirm('Are you sure you want to cancel auto-renewal? Your subscription will remain active until the end of the current period.')) {
                                                    try {
                                                        const res = await subscriptionService.cancelSubscription(subscription.id);
                                                        if (res.success) {
                                                            fetchSubscription();
                                                            toast.success('Auto-renewal cancelled successfully');
                                                        }
                                                    } catch (err) {
                                                        toast.error('Failed to cancel auto-renewal');
                                                    }
                                                }
                                            }}
                                            className="tj-primary-btn danger-btn"
                                            style={{ backgroundColor: '#13689e', borderColor: '#13689e' }}
                                        >
                                            <span className="btn-text">Cancel Auto-renew</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default Subscription;
