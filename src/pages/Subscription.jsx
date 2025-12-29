import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import './Subscription.css';

const Subscription = () => {
    // Placeholder data matching HTML template
    // In a real app, this would come from user.subscription or similar API
    const subscription = {
        planType: 'Premium',
        status: 'Active',
        billingCycle: 'Monthly',
        nextBilling: 'January 15, 2025',
        amount: '$99.00/month',
        features: [
            'Unlimited downloads',
            'Priority support',
            'Advanced analytics',
            'API access',
            'Custom integrations'
        ]
    };

    return (
        <DashboardLayout>
            <section className="page-section">
                <div className="container">
                    <div className="page-header">
                        <h2>My Subscription</h2>
                        <p style={{ color: '#6c757d' }}>Manage your subscription plan and billing</p>
                    </div>

                    <div className="row">
                        <div className="col-lg-12">
                            <div className="subscription-card animate-fade-up">
                                <div className="subscription-header">
                                    <h3 className="subscription-title">{subscription.planType} Plan</h3>
                                    <span className={`subscription-status ${subscription.status.toLowerCase()}`}>
                                        {subscription.status}
                                    </span>
                                </div>

                                <div className="subscription-info">
                                    <div className="info-item">
                                        <span className="info-label">Plan Type</span>
                                        <span className="info-value">{subscription.planType}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Billing Cycle</span>
                                        <span className="info-value">{subscription.billingCycle}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Next Billing Date</span>
                                        <span className="info-value">{subscription.nextBilling}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Amount</span>
                                        <span className="info-value">{subscription.amount}</span>
                                    </div>
                                </div>

                                <div className="subscription-features">
                                    <h4>Plan Features</h4>
                                    <ul className="features-list">
                                        {subscription.features.map((feature, index) => (
                                            <li key={index}>
                                                <i className="fa-light fa-check"></i>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="subscription-actions">
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
