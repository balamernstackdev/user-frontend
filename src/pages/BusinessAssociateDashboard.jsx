import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ReferralService from '../services/referral.service';
import { authService } from '../services/auth.service';
import SEO from '../components/common/SEO';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Users, DollarSign, MousePointer, Copy, ExternalLink, ArrowRight, TrendingUp, UserCheck, Clock } from 'lucide-react';
import SkeletonLoader from '../components/dashboard/SkeletonLoader';
import StatCard from '../components/dashboard/StatCard';
import AnnouncementWidget from '../components/dashboard/AnnouncementWidget';
import './styles/Dashboard.css';

const BusinessAssociateDashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentReferrals, setRecentReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        const currentUser = authService.getUser();
        setUser(currentUser);
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes] = await Promise.all([
                ReferralService.getStats(),
                ReferralService.getReferredUsers({ limit: 5 }) // Get minimal list for dashboard
            ]);
            setStats(statsRes.data);
            setRecentReferrals(usersRes.data.slice(0, 5));
        } catch (err) {
            console.error('Error fetching BA dashboard data:', err);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = () => {
        if (stats?.referral_code) {
            const referralUrl = `${window.location.origin}/register?ref=${stats.referral_code}`;
            navigator.clipboard.writeText(referralUrl);
            setCopySuccess(true);
            toast.success('Referral link copied!');
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-4">
                    <div className="mb-4"><SkeletonLoader width="300px" height="40px" /></div>
                    <div className="row g-4 mb-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="col-md-3"><SkeletonLoader height="120px" /></div>
                        ))}
                    </div>
                    <SkeletonLoader height="300px" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <SEO title="Marketer Dashboard" description="Track your referrals and earnings" />

            <section className="welcome-section">
                <div className="container">
                    <div className="welcome-content">
                        {/* Header Section */}
                        <div className="welcome-header animate-fade-up mb-4">
                            <div>
                                <h1 className="section-title fw-bold mb-2" style={{ fontSize: '2.5rem', letterSpacing: '-0.02em', color: '#1a1a1a' }}>Welcome back, {user?.name?.split(' ')[0] || 'Partner'}! 👋</h1>
                                <p className="section-subtitle text-muted mb-0" style={{ fontSize: '1.15rem' }}>Here's how your referral campaigns are performing.</p>
                            </div>
                            <div className="last-updated text-muted small d-none d-md-block">
                                <Clock size={14} className="me-1 d-inline-block" />
                                Last updated: {new Date().toLocaleTimeString()}
                            </div>
                        </div>

                        {/* Referral Link Card - Prominent */}
                        <div className="card border-0 shadow-sm mb-4 overflow-hidden position-relative animate-fade-up" style={{ backgroundColor: '#13689e', borderRadius: '12px' }}>
                            <div className="card-body p-4 position-relative" style={{ zIndex: 1 }}>
                                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-4">
                                    <div className="text-white">
                                        <h4 className="fw-bold mb-2 text-white">Your Referral Program</h4>
                                        <p className="mb-0 opacity-75 text-white">Share your link and earn commissions on every successful referral.</p>
                                    </div>

                                    <div className="flex-grow-1 w-100" style={{ maxWidth: '600px' }}>
                                        <div className="d-flex align-items-center p-1 rounded-pill" style={{ background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                                            <div className="px-3 text-truncate flex-grow-1 font-monospace text-white small" style={{ letterSpacing: '0.5px' }}>
                                                {window.location.origin}/register?ref={stats?.referral_code || ''}
                                            </div>
                                            <button
                                                onClick={handleCopyCode}
                                                className="btn btn-light rounded-circle d-flex align-items-center justify-content-center m-1 shadow-sm border-0"
                                                style={{ width: '38px', height: '38px', flexShrink: 0, color: '#13689e' }}
                                                title="Copy to clipboard"
                                            >
                                                {copySuccess ? <UserCheck size={18} color="#13689e" /> : <Copy size={18} color="#13689e" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        {/* Stats Grid */}
                        <div className="row g-4 mb-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                            <div className="col-md-6 col-lg-3">
                                <StatCard
                                    label="Total Users Referred"
                                    value={stats?.total_referrals || 0}
                                    icon={Users}
                                    iconColor="#6366f1"
                                    iconBgColor="rgba(99, 102, 241, 0.1)"
                                    link="/business-associate/referrals"
                                />
                            </div>
                            <div className="col-md-6 col-lg-3">
                                <StatCard
                                    label="Active Subscribers"
                                    value={stats?.active_subscribers || 0}
                                    icon={UserCheck}
                                    iconColor="#10b981"
                                    iconBgColor="rgba(16, 185, 129, 0.1)"
                                    link="/business-associate/referrals"
                                />
                            </div>
                            <div className="col-md-6 col-lg-3">
                                <StatCard
                                    label="Total Earnings"
                                    value={`₹${Number(stats?.total_commissions || 0).toLocaleString()}`}
                                    icon={DollarSign}
                                    iconColor="#f59e0b"
                                    iconBgColor="rgba(245, 158, 11, 0.1)"
                                    link="/business-associate/commissions"
                                />
                            </div>
                            <div className="col-md-6 col-lg-3">
                                <StatCard
                                    label="Pending Payouts"
                                    value={`₹${Number(stats?.pending_commissions || 0).toLocaleString()}`}
                                    icon={TrendingUp}
                                    iconColor="#3b82f6"
                                    iconBgColor="rgba(59, 130, 246, 0.1)"
                                    link="/business-associate/commissions?status=pending"
                                />
                            </div>
                        </div>

                        {/* Recent Activity & Announcements Section */}
                        <div className="row animate-fade-up" style={{ animationDelay: '0.2s' }}>
                            <div className="col-lg-8 mb-4">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0 fw-bold text-dark d-flex align-items-center"><Users size={20} className="me-2 text-primary" />Recent Referrals</h5>
                                        <Link to="/business-associate/referrals" className="text-primary text-decoration-none small fw-semibold d-flex align-items-center hover-opacity">
                                            View All <ArrowRight size={16} className="ms-1" />
                                        </Link>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle mb-0">
                                                <thead className="bg-light">
                                                    <tr>
                                                        <th className="px-4 py-3 text-muted fw-semibold small text-uppercase">User</th>
                                                        <th className="px-4 py-3 text-muted fw-semibold small text-uppercase">Joined Date</th>
                                                        <th className="px-4 py-3 text-muted fw-semibold small text-uppercase">Plan</th>
                                                        <th className="px-4 py-3 text-muted fw-semibold small text-uppercase">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {recentReferrals.length > 0 ? (
                                                        recentReferrals.map((user) => (
                                                            <tr key={user.user_id}>
                                                                <td className="px-4 py-3">
                                                                    <div className="d-flex align-items-center">
                                                                        <div className="avatar-initial rounded-circle bg-light text-primary d-flex align-items-center justify-content-center fw-bold me-3" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                                                                            {user.name.charAt(0).toUpperCase()}
                                                                        </div>
                                                                        <div>
                                                                            <div className="fw-semibold text-dark" style={{ fontSize: '14px' }}>{user.name}</div>
                                                                            <div className="text-muted small" style={{ fontSize: '12px' }}>{user.email}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-muted" style={{ fontSize: '14px' }}>
                                                                    {formatDate(user.referred_at)}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    {user.subscription_status === 'active' && user.plan_name ? (
                                                                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2 py-1 fw-medium">
                                                                            {user.plan_name}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-muted small fst-italic">No active plan</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <StatusBadge status={user.subscription_status || 'inactive'} />
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="4" className="text-center py-5 text-muted">
                                                                <div className="mb-2"><Users size={32} className="opacity-25" /></div>
                                                                <p className="mb-0">No referrals yet. Share your link to get started!</p>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 mb-4">
                                <AnnouncementWidget />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

// Helper Components
const StatusBadge = ({ status }) => {
    const styles = {
        active: 'bg-success-subtle text-success',
        expired: 'bg-warning-subtle text-warning-emphasis',
        cancelled: 'bg-danger-subtle text-danger',
        inactive: 'bg-secondary-subtle text-secondary'
    };
    return (
        <span className={`badge ${styles[status] || styles.inactive} rounded-pill px-2 py-1 fw-medium text-capitalize`}>
            {status}
        </span>
    );
};

const RocketIconDecoration = () => (
    <svg viewBox="0 0 200 200" className="opacity-25 text-primary" style={{ width: '140px', height: '140px', transform: 'rotate(15deg)' }}>
        <path fill="currentColor" d="M154.5,138.8c-2.3-3.6-5.4-6.6-9-8.9c-3.6-2.3-7.6-3.8-11.8-4.4c-4.2-0.6-8.5-0.3-12.7,1
		c-4.2,1.3-8.1,3.5-11.4,6.4c-3.3,2.9-6,6.5-7.8,10.6c-1.8,4.1-2.7,8.5-2.5,12.9c0.2,4.4,1.4,8.7,3.6,12.6c2.2,3.9,5.2,7.3,8.9,9.9
		c15.8,11.2,37.3,7.5,48.5-8.3C171.5,154.8,165.7,144.1,154.5,138.8z"/>
        <path fill="currentColor" d="M48.2,93.5c-3.3-11-9.9-20.7-18.7-27.4C20.6,59.3,10.2,55.9,0,54.8l23.5,88.4L48.2,93.5z" />
        <path fill="currentColor" d="M127.3,38.6c-4.4-2.2-9-3.9-13.8-5L98,87.3l48.6,24.3C143.9,89.5,138.6,62,127.3,38.6z" />
        <path fill="currentColor" d="M78.6,67.7L30,19.1c16-8.9,35.2-11.7,53.2-7.5L78.6,67.7z" />
    </svg>
);

export default BusinessAssociateDashboard;
