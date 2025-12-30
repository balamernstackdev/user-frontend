import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import subscriptionService from '../services/subscription.service';
import './Subscription.css';

const Subscription = () => {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSubscription();
    }, []);

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
                        <div className="alert alert-info">
                            You do not have an active subscription. <Link to="/plans">Browse Plans</Link>
                        </div>
                    </div>
                </section>
            </DashboardLayout>
        );
    }

    // Determine plan price/cycle from API data
    const getPriceDisplay = () => {
        const plan = subscription.plan || {};
        if (plan.monthly_price && subscription.plan_id === plan.id) return `$${plan.monthly_price}/month`; // fallback logic if needed

        // Ideally backend active subscription endpoint returns the specific price paid or current plan price
        // Since the endpoint is getActiveSubscription, let's assume it returns a combined object or nested plan
        if (plan.plan_type === 'monthly') return `₹${plan.monthly_price}/month`;
        if (plan.plan_type === 'yearly') return `₹${plan.yearly_price}/year`;
        if (plan.plan_type === 'lifetime') return `₹${plan.lifetime_price} One-time`;
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
                        <p style={{ color: 'var(--tj-color-text-body-3)' }}>Manage your subscription plan and billing</p>
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
                                </div>
                                <div className="subscription-features">
                                    <h4>Plan Features</h4>
                                    <ul className="features-list">
                                        {features.length > 0 ? (
                                            features.map((feature, index) => (
                                                <li key={index}><i className="fa-light fa-check"></i> {feature}</li>
                                            ))
                                        ) : (
                                            <li>No features listed</li>
                                        )}
                                    </ul>
                                </div>
                                <div style={{ marginTop: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                    <Link to="/plans" className="tj-primary-btn">
                                        <span className="btn-text"><span>Renew / Upgrade Plan</span></span>
                                        <span className="btn-icon"><i className="tji-arrow-right-long"></i></span>
                                    </Link>
                                    <Link to="/payments" className="tj-primary-btn transparent-btn">
                                        <span className="btn-text"><span>View Payment History</span></span>
                                        <span className="btn-icon"><i className="tji-arrow-right-long"></i></span>
                                    </Link>
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
