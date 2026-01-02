import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { userService } from '../services/user.service';
import paymentService from '../services/payment.service';
import { activityService } from '../services/activity.service';
import { authService } from '../services/auth.service';
import adminService from '../services/admin.service';
import SEO from '../components/common/SEO';
import './Dashboard.css';
import './AdminListings.css'; // For table styles

const AdminDashboard = () => {
    const user = authService.getUser();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeMarketers: 0,
        pendingApprovals: 0,
        pendingCommissionsCount: 0,
        totalRevenue: 0,
        activeSubscriptions: 0,
        expiringSubscriptions: 0
    });
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch Stats
                const statsResponse = await adminService.getStats();
                const { totalUsers, activeMarketers, pendingMarketers, pendingCommissions, pendingPayouts, totalRevenue, activeSubscriptions, expiringSubscriptions } = statsResponse.data;

                setStats({
                    totalUsers,
                    activeMarketers,
                    pendingApprovals: (pendingMarketers || 0) + (pendingCommissions || 0),
                    pendingMarketers: pendingMarketers || 0, // Store strictly for link logic
                    pendingCommissions: pendingCommissions || 0, // Store strictly for link logic
                    pendingCommissionsCount: pendingPayouts,
                    totalRevenue,
                    activeSubscriptions: activeSubscriptions || 0,
                    expiringSubscriptions: expiringSubscriptions || 0
                });

                // Fetch Recent Activity
                const logsRes = await activityService.getAllLogs({ limit: 5 });
                if (logsRes.data && logsRes.data.logs) {
                    setRecentLogs(logsRes.data.logs);
                } else if (Array.isArray(logsRes.data)) {
                    setRecentLogs(logsRes.data);
                } else if (logsRes.data && Array.isArray(logsRes.data.data)) {
                    setRecentLogs(logsRes.data.data);
                } else {
                    setRecentLogs([]);
                }

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Dynamic Link Logic
    const getPendingLink = () => {
        if (stats.pendingMarketers > 0) return "/admin/users?status=pending";
        if (stats.pendingCommissions > 0) return "/admin/commissions?status=pending";
        return "/admin/commissions"; // Default
    };

    return (
        <DashboardLayout>
            <SEO title="Admin Dashboard" description="System overview and management." />
            <section className="welcome-section">
                <div className="container-fluid">
                    <div className="welcome-content">
                        {/* Welcome Header */}
                        <div className="welcome-header animate-fade-up mb-4">
                            <h1 className="section-title">Welcome back, {user?.name || 'Admin'}! 👋</h1>
                            <p className="section-subtitle">Here's what's happening with your platform today.</p>
                        </div>

                        {/* Admin Stats Overview */}
                        <div className="admin-stats-grid stats-grid animate-fade-up">
                            <div className="stat-card card-users">
                                <div className="stat-icon" style={{ color: '#1e8a8a' }}>
                                    <i className="fas fa-users"></i>
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Total Users</span>
                                    <span className="stat-value">{loading ? '...' : stats.totalUsers.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="stat-card card-active-marketers">
                                <Link to="/admin/users" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', width: '100%', alignItems: 'center', gap: '25px' }}>
                                    <div className="stat-icon" style={{ color: '#28a745' }}>
                                        <i className="fas fa-user-tie"></i>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-label">Active Marketers</span>
                                        <span className="stat-value">{loading ? '...' : stats.activeMarketers}</span>
                                    </div>
                                </Link>
                            </div>
                            <div className="stat-card card-pending">
                                <Link to={getPendingLink()} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', width: '100%', alignItems: 'center', gap: '25px' }}>
                                    <div className="stat-icon" style={{ color: '#ffc107' }}>
                                        <i className="fas fa-clock-rotate-left"></i>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-label">Pending Approvals</span>
                                        <span className="stat-value">{loading ? '...' : stats.pendingApprovals}</span>
                                    </div>
                                </Link>
                            </div>
                            <div className="stat-card card-payouts">
                                <Link to="/admin/commissions" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', width: '100%', alignItems: 'center', gap: '25px' }}>
                                    <div className="stat-icon" style={{ color: '#17a2b8' }}>
                                        <i className="fas fa-hand-holding-usd"></i>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-label">Pending Payouts</span>
                                        <span className="stat-value">{loading ? '...' : stats.pendingCommissionsCount}</span>
                                    </div>
                                </Link>
                            </div>
                            <div className="stat-card card-revenue">
                                <div className="stat-icon" style={{ color: '#6f42c1' }}>
                                    <i className="fas fa-chart-line"></i>
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Total Revenue</span>
                                    <span className="stat-value">{loading ? '...' : `₹${stats.totalRevenue.toLocaleString()}`}</span>
                                </div>
                            </div>
                            <div className="stat-card card-active-subs">
                                <Link to="/admin/users?filter=active_sub" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', width: '100%', alignItems: 'center', gap: '25px' }}>
                                    <div className="stat-icon" style={{ color: '#28a745' }}>
                                        <i className="fas fa-check-circle"></i>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-label">Active Subs</span>
                                        <span className="stat-value">{loading ? '...' : stats.activeSubscriptions}</span>
                                    </div>
                                </Link>
                            </div>
                            <div className="stat-card card-expiring">
                                <Link to="/admin/users?filter=expiring" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', width: '100%', alignItems: 'center', gap: '25px' }}>
                                    <div className="stat-icon" style={{ color: '#dc3545' }}>
                                        <i className="fas fa-exclamation-triangle"></i>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-label">Expiring Soon</span>
                                        <span className="stat-value">{loading ? '...' : stats.expiringSubscriptions}</span>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Recent Activity Section (Replaces Administrative Tools) */}
                        <div className="recent-activity animate-fade-up" style={{ animationDelay: '0.2s', marginTop: '40px' }}>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="mb-0">Recent System Activity</h3>
                                <Link to="/admin/logs" className="btn btn-sm btn-outline-primary">View All Logs</Link>
                            </div>

                            <div className="listing-table-container">
                                <table className="listing-table">
                                    <thead>
                                        <tr>
                                            <th>Timestamp</th>
                                            <th>User</th>
                                            <th>Action</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="4" className="text-center">Loading...</td></tr>
                                        ) : recentLogs.length === 0 ? (
                                            <tr><td colSpan="4" className="text-center">No recent activity</td></tr>
                                        ) : (
                                            recentLogs.map(log => (
                                                <tr key={log.id}>
                                                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.created_at).toLocaleString()}</td>
                                                    <td>
                                                        <div className="d-flex flex-column">
                                                            <span style={{ fontWeight: 500 }}>{log.user_name || 'System'}</span>
                                                            <span style={{ fontSize: '12px', color: '#6c757d' }}>{log.user_email}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="badge" style={{ background: '#f8f9fa', color: '#333', marginRight: '8px' }}>{log.action_type}</span>
                                                        <span style={{ fontSize: '14px' }}>{log.description || log.action}</span>
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            color: log.status === 'success' ? '#28a745' : '#dc3545',
                                                            fontWeight: 500,
                                                            textTransform: 'capitalize'
                                                        }}>
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default AdminDashboard;
