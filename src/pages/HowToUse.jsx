import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import './HowToUse.css';

const HowToUse = () => {
    return (
        <DashboardLayout>
            <section className="page-section">
                <div className="container">
                    <div className="page-header">
                        <h2>How to Use Stoxzo</h2>
                        <p style={{ color: '#6c757d' }}>Step-by-step guide to get started</p>
                    </div>

                    <div className="row">
                        <div className="col-lg-10 mx-auto">
                            {/* Step 1 */}
                            <div className="step-card animate-fade-up">
                                <div className="step-number">1</div>
                                <h3 className="step-title">Create Your Account</h3>
                                <div className="step-content">
                                    <p>Start by creating your account. Click on "Register" and fill in your details including:</p>
                                    <ul>
                                        <li>First Name and Last Name</li>
                                        <li>Email Address</li>
                                        <li>Secure Password</li>
                                        <li>Accept Terms & Conditions</li>
                                    </ul>
                                    <p>After registration, check your email to verify your account.</p>
                                </div>
                                <div className="video-container">
                                    <div className="video-placeholder">
                                        <i className="fa-light fa-video"></i>
                                        <p>Video: Creating Your Account</p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="step-card animate-fade-up" style={{ animationDelay: '0.1s' }}>
                                <div className="step-number">2</div>
                                <h3 className="step-title">Choose Your Plan</h3>
                                <div className="step-content">
                                    <p>Browse through our available subscription plans and choose the one that fits your needs:</p>
                                    <ul>
                                        <li>Basic Plan - For individuals getting started</li>
                                        <li>Premium Plan - For professionals and small teams</li>
                                        <li>Enterprise Plan - For large organizations</li>
                                    </ul>
                                    <p>Each plan includes different features and benefits. Select the plan and proceed to checkout.</p>
                                </div>
                                <div className="video-container">
                                    <div className="video-placeholder">
                                        <i className="fa-light fa-video"></i>
                                        <p>Video: Choosing Your Subscription Plan</p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="step-card animate-fade-up" style={{ animationDelay: '0.2s' }}>
                                <div className="step-number">3</div>
                                <h3 className="step-title">Complete Payment</h3>
                                <div className="step-content">
                                    <p>Secure payment process through Razorpay:</p>
                                    <ul>
                                        <li>Review your order summary</li>
                                        <li>Enter your payment details securely</li>
                                        <li>Complete the payment process</li>
                                        <li>Receive instant confirmation</li>
                                    </ul>
                                    <p>Your subscription will be activated immediately after successful payment.</p>
                                </div>
                                <div className="video-container">
                                    <div className="video-placeholder">
                                        <i className="fa-light fa-video"></i>
                                        <p>Video: Completing Payment</p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="step-card animate-fade-up" style={{ animationDelay: '0.3s' }}>
                                <div className="step-number">4</div>
                                <h3 className="step-title">Access Your Dashboard</h3>
                                <div className="step-content">
                                    <p>Once logged in, you'll have access to your personalized dashboard where you can:</p>
                                    <ul>
                                        <li>View your subscription details</li>
                                        <li>Manage your profile settings</li>
                                        <li>Access your downloads</li>
                                        <li>View payment history</li>
                                        <li>Create support tickets</li>
                                    </ul>
                                </div>
                                <div className="video-container">
                                    <div className="video-placeholder">
                                        <i className="fa-light fa-video"></i>
                                        <p>Video: Navigating Your Dashboard</p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 5 */}
                            <div className="step-card animate-fade-up" style={{ animationDelay: '0.4s' }}>
                                <div className="step-number">5</div>
                                <h3 className="step-title">Download Resources</h3>
                                <div className="step-content">
                                    <p>Access all your purchased resources in the "My Downloads" section:</p>
                                    <ul>
                                        <li>Browse your available downloads</li>
                                        <li>Click the download button for any item</li>
                                        <li>Files will be saved to your device</li>
                                        <li>Track your download history</li>
                                    </ul>
                                </div>
                                <div className="video-container">
                                    <div className="video-placeholder">
                                        <i className="fa-light fa-video"></i>
                                        <p>Video: Downloading Resources</p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 6 */}
                            <div className="step-card animate-fade-up" style={{ animationDelay: '0.5s' }}>
                                <div className="step-number">6</div>
                                <h3 className="step-title">Get Support</h3>
                                <div className="step-content">
                                    <p>Need help? We're here for you:</p>
                                    <ul>
                                        <li>Check the FAQ section for common questions</li>
                                        <li>Create a support ticket in "My Tickets"</li>
                                        <li>Email us at support@stoxzo.com</li>
                                        <li>View video tutorials in this guide</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default HowToUse;
