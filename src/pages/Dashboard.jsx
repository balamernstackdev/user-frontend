import React, { useEffect, useState } from 'react';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import RecentActivityList from '../components/dashboard/RecentActivityList';
import AnnouncementWidget from '../components/dashboard/AnnouncementWidget';
import { useSettings } from '../context/SettingsContext';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { authService } from '../services/auth.service';
import ReferralService from '../services/referral.service';
import SubscriptionService from '../services/subscription.service';
import PaymentService from '../services/payment.service';
import ticketService from '../services/ticket.service';
import SEO from '../components/common/SEO';
import './Dashboard.css';
import { Box, Clock, CreditCard, LifeBuoy, Rocket, User, ChevronRight, Activity, Bell } from 'lucide-react';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [businessAssociateStats, setBusinessAssociateStats] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [stats, setStats] = useState({
        paymentCount: 0,
        ticketCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [copySuccess, setCopySuccess] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = authService.getUser();
        if (currentUser) {
            if (['admin', 'finance_manager', 'support_agent'].includes(currentUser.role)) {
                navigate('/admin/dashboard');
                return;
            }
            if (currentUser.role === 'business_associate') {
                navigate('/business-associate/dashboard');
                return;
            }
            setUser(currentUser);
            loadDashboardData(currentUser);
        } else {
            setLoading(false);
        }
    }, []);

    const loadDashboardData = async (currentUser) => {
        try {
            setLoading(true);
            const promises = [
                SubscriptionService.getActiveSubscription(),
                PaymentService.getTransactions({ limit: 1 }), // Just for count
                ticketService.getMyTickets({ limit: 1 })    // Just for count
            ];

            const responses = await Promise.all(promises.map(p => p.catch(e => {
                console.error('Promise failed in dashboard:', e);
                return null;
            })));

            const [subRes, transRes, ticketsRes, baRes] = responses;

            if (subRes) setSubscription(subRes.data);

            // Extract counts from pagination metadata if available
            setStats({
                paymentCount: transRes?.data?.pagination?.total || transRes?.data?.length || 0,
                ticketCount: ticketsRes?.data?.pagination?.total || ticketsRes?.data?.length || 0
            });

            if (baRes) setBusinessAssociateStats(baRes.data);

        } catch (error) {
            console.error('Dashboard data load error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = () => {
        if (businessAssociateStats?.referral_code) {
            const referralUrl = `${window.location.origin}/register?ref=${businessAssociateStats.referral_code}`;
            navigator.clipboard.writeText(referralUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const quickLinks = [
        { title: 'My Profile', icon: User, link: '/profile', color: '#13689e' },
        { title: 'Subscriptions', icon: Box, link: '/subscription', color: '#28a745' },
        { title: 'Support', icon: LifeBuoy, link: '/tickets', color: '#ffc107' },
        { title: 'Tutorials', icon: Activity, link: '/tutorials', color: '#17a2b8' },
        { title: 'Transactions', icon: Clock, link: '/transactions', color: '#6f42c1' },
    ];

    if (loading) {
        return (
            <DashboardLayout>
                <div className="dashboard-loading">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const daysRemaining = subscription?.end_date ? Math.max(0, Math.floor((new Date(subscription.end_date) - new Date()) / (1000 * 60 * 60 * 24))) : 0;

    return (
        <DashboardLayout>
            <SEO title="User Dashboard" description="Account overview and activities" />

            <div className="user-dashboard-container animate-fade-up">
                {/* Header Section */}
                <header className="dashboard-header mb-4">
                    <div className="welcome-text">
                        <h1>Welcome Back, {user?.name?.split(' ')[0] || 'User'}!</h1>
                        <p className="text-muted">Here's a quick overview of your account status.</p>
                    </div>
                </header>

                {subscription && subscription.status === 'active' ? (
                    <>
                        {/* Stats Grid - Admin Like */}
                        <div className="user-stats-grid mb-4">
                            <StatCard
                                label="Active Plan"
                                value={subscription?.plan_name || 'No Plan'}
                                icon={Box}
                                className="card-users"
                                isLoading={loading}
                            />
                            <StatCard
                                label="Days Remaining"
                                value={
                                    <div className="d-flex flex-column">
                                        <span>{daysRemaining === 0 ? 'Today' : daysRemaining}</span>
                                        {subscription?.end_date && (
                                            <span style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: 'normal', marginTop: '2px' }}>
                                                Expires {new Date(subscription.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </span>
                                        )}
                                    </div>
                                }
                                icon={Clock}
                                iconColor="#ffc107"
                                iconBgColor="rgba(255, 193, 7, 0.1)"
                                isLoading={loading}
                                className="card-pending"
                            />
                            <StatCard
                                label="My Payments"
                                value={stats.paymentCount}
                                icon={CreditCard}
                                iconColor="#28a745"
                                iconBgColor="rgba(40, 167, 69, 0.1)"
                                isLoading={loading}
                                className="card-active-marketers"
                            />
                            <StatCard
                                label="Support Tickets"
                                value={stats.ticketCount}
                                icon={LifeBuoy}
                                iconColor="#17a2b8"
                                iconBgColor="rgba(23, 162, 184, 0.1)"
                                isLoading={loading}
                                className="card-payouts"
                            />
                        </div>

                        <div className="dashboard-grid">
                            {/* Main Content */}
                            <div className="main-content">
                                <div className="mb-4">
                                    <AnnouncementWidget />
                                </div>

                                {/* New Quick Actions Grid - Fills big empty space */}
                                <div className="main-quick-actions mb-4">
                                    <h3 className="section-title-sm mb-3">Quick Actions</h3>
                                    <div className="quick-actions-grid">
                                        {quickLinks.map((item, idx) => (
                                            <Link to={item.link} key={idx} className="quick-action-card">
                                                <div className="q-icon-wrapper" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                                                    <item.icon size={24} />
                                                </div>
                                                <div className="q-info">
                                                    <span className="q-title">{item.title}</span>
                                                    <span className="q-desc">Access your {item.title.toLowerCase()}</span>
                                                </div>
                                                <ChevronRight size={16} className="q-arrow" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div >

                            {/* Sidebar */}
                            <aside className="dashboard-sidebar">
                                {
                                    user?.role === 'business_associate' && (
                                        <div className="sidebar-card mb-4">
                                            <h3>Referral Program</h3>
                                            <div className="premium-referral-card">
                                                <div className="ref-header">
                                                    <i className="fas fa-gift"></i>
                                                    <span>Your Link</span>
                                                </div>
                                                <div className="ref-body">
                                                    <input readOnly value={`${window.location.origin}/register?ref=${businessAssociateStats?.referral_code}`} />
                                                    <button onClick={handleCopyCode} className={copySuccess ? 'success' : ''}>
                                                        {copySuccess ? <i className="fas fa-check"></i> : <i className="far fa-copy"></i>}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }

                                <div className="sidebar-card help-gradient">
                                    <LifeBuoy size={40} className="help-icon-main" />
                                    <h3>Direct Support</h3>
                                    <p>Stuck somewhere? Reach out to our technical team.</p>
                                    <Link to="/tickets" className="tj-primary-btn btn-sm w-100">Open Ticket</Link>
                                </div>
                            </aside>
                        </div>
                    </>
                ) : (
                    <div className="empty-state-container animate-fade-up">
                        <div className="subscription-cta-card">
                            <div className="cta-content">
                                <div className="cta-icon-wrapper">
                                    <Rocket size={48} color="#13689e" />
                                </div>
                                <h2>Unlock Your Trading Potential!</h2>
                                <p>
                                    {subscription && subscription.status === 'expired'
                                        ? "Your subscription has expired. Renew now to regain access to premium analysis and features."
                                        : "You don't have an active subscription. Subscribe to one of our premium plans to access exclusive market analysis, tutorials, and support."}
                                </p>
                                <div className="cta-actions">
                                    <Link to="/plans" className="tj-primary-btn display-inline-flex gap-2">
                                        {subscription && subscription.status === 'expired' ? 'Renew Subscription' : 'View Subscription Plans'}
                                        <ChevronRight size={18} />
                                    </Link>
                                </div>
                            </div>
                            <div className="cta-features">
                                <div className="feature-item">
                                    <div className="feature-icon"><i className="fas fa-chart-line"></i></div>
                                    <span>Premium Analysis</span>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon"><i className="fas fa-video"></i></div>
                                    <span>Exclusive Tutorials</span>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon"><i className="fas fa-headset"></i></div>
                                    <span>Priority Support</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout >
    );
};

export default Dashboard;
