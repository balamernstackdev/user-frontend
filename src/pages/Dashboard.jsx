import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import MarketerStats from '../components/dashboard/MarketerStats';
import { authService } from '../services/auth.service';
import ReferralService from '../services/referral.service';
import SEO from '../components/common/SEO';
import './Dashboard.css';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [marketerStats, setMarketerStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        const currentUser = authService.getUser();
        if (currentUser) {
            // Redirect admin to admin dashboard
            if (currentUser.role === 'admin') {
                window.location.href = '/admin/dashboard';
                return;
            }

            setUser(currentUser);
            if (currentUser.role === 'marketer') {
                fetchMarketerStats();
            } else {
                setLoading(false);
            }
        } else {
            // Fallback for safety, should be handled by ProtectedRoute
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser?.role === 'admin') {
                window.location.href = '/admin/dashboard';
                return;
            }
            setUser(storedUser);
            setLoading(false);
        }
    }, []);

    const fetchMarketerStats = async () => {
        try {
            const response = await ReferralService.getStats();
            setMarketerStats(response.data);
        } catch (error) {
            console.error('Failed to fetch marketer stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = () => {
        if (marketerStats?.referral_code) {
            navigator.clipboard.writeText(marketerStats.referral_code);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const quickLinks = [
        { title: 'My Profile', icon: 'fas fa-user-circle', link: '/profile' },
        { title: 'Subscriptions', icon: 'fas fa-box-open', link: '/subscription' },
        { title: 'Support', icon: 'fas fa-life-ring', link: '/tickets' },
        { title: 'Tutorials', icon: 'fas fa-video', link: '/tutorials' },
        { title: 'Transactions', icon: 'fas fa-history', link: '/transactions' },
    ];

    const marketerLinks = [
        { title: 'Referrals', icon: 'fas fa-users', link: '/referrals' }, // Corrected route
        { title: 'Commissions', icon: 'fas fa-chart-line', link: '/marketer/commissions' }, // Corrected route
    ];

    return (
        <DashboardLayout>
            <SEO title="Dashboard" description="Overview of your account, plans, and recent activity." />
            <section className="welcome-section">
                <div className="container-fluid">
                    <div className="welcome-content">
                        {/* Welcome Card */}
                        <div className="welcome-card animate-fade-up">
                            <div className="welcome-icon">
                                <i className="far fa-check-circle"></i>
                            </div>
                            <div className="welcome-title">
                                <h1>Welcome Back, {user?.name || 'User'}!</h1>
                                <p>You have successfully logged in to your account. We're excited to have you here!</p>
                            </div>
                            <div className="welcome-actions">
                                <Link to={user?.role === 'marketer' ? "/marketer/commissions" : "/plans"} className="tj-primary-btn">
                                    <span className="btn-text"><span>{user?.role === 'marketer' ? "Explore Earnings" : "Explore Plans"}</span></span>
                                    <span className="btn-icon"><i className="fas fa-arrow-right"></i></span>
                                </Link>
                                <Link to="/profile" className="tj-primary-btn transparent-btn">
                                    <span className="btn-text"><span>Manage Profile</span></span>
                                    <span className="btn-icon"><i className="fas fa-arrow-right"></i></span>
                                </Link>
                            </div>
                        </div>

                        {/* Marketer Specific Section */}
                        {user?.role === 'marketer' && !loading && (
                            <div className="marketer-dashboard-section animate-fade-up" style={{ animationDelay: '0.1s' }}>
                                <MarketerStats stats={marketerStats} />

                                {marketerStats?.referral_code && (
                                    <div className="referral-card">
                                        <div className="referral-info">
                                            <h3>Your Referral Program</h3>
                                            <p>Share your code and earn commissions on every successful referral.</p>
                                        </div>
                                        <div className="referral-code-wrapper">
                                            <span className="referral-code">{marketerStats.referral_code}</span>
                                            <button
                                                className="copy-btn"
                                                onClick={handleCopyCode}
                                                title="Copy Code"
                                            >
                                                {copySuccess ? (
                                                    <i className="fas fa-check" style={{ color: '#28a745' }}></i>
                                                ) : (
                                                    <i className="far fa-copy"></i>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Quick Links */}
                        <div className="quick-links animate-fade-up" style={{ animationDelay: '0.2s' }}>
                            <h3>Quick Links</h3>
                            <div className="quick-links-grid">
                                {(user?.role === 'marketer'
                                    ? [...marketerLinks, ...quickLinks].filter(item => item.title !== 'Subscriptions')
                                    : quickLinks
                                ).map((item, index) => (
                                    <Link to={item.link} className="quick-link-item" key={index}>
                                        <div className="quick-link-icon">
                                            <i className={item.icon}></i>
                                        </div>
                                        <div className="quick-link-title">{item.title}</div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default Dashboard;
