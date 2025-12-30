import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { userService } from '../services/user.service';
import paymentService from '../services/payment.service';
import { activityService } from '../services/activity.service';
import { authService } from '../services/auth.service';
import './Dashboard.css';
import './AdminListings.css'; // For table styles

const AdminDashboard = () => {
    const user = authService.getUser();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeMarketers: 0,
        pendingApprovals: 0,
        totalRevenue: 0
    });
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch Stats
                const usersRes = await userService.getAllUsers({ limit: 1 });
                const totalUsers = usersRes.data?.pagination?.total || 0;

                const marketersRes = await userService.getAllUsers({ role: 'marketer', status: 'active', limit: 1 });
                const activeMarketers = marketersRes.data?.pagination?.total || 0;

                const pendingMarketersRes = await userService.getAllUsers({ role: 'marketer', status: 'pending', limit: 1 });
                const pendingApprovals = pendingMarketersRes.data?.pagination?.total || 0;

                const revenueRes = await paymentService.getAllTransactions({ status: 'success', limit: 1000 });
                const transactions = revenueRes.data || [];
                const totalRevenue = transactions.reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);

                setStats({ totalUsers, activeMarketers, pendingApprovals, totalRevenue });

                // Fetch Recent Activity
                const logsRes = await activityService.getAllLogs({ limit: 5 });
                setRecentLogs(logsRes.data || []);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <DashboardLayout>
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
                            <div className="stat-card">
                                <div className="stat-icon" style={{ backgroundColor: 'rgba(30, 138, 138, 0.1)', color: '#1e8a8a' }}>
                                    <i className="fa-light fa-users"></i>
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Total Users</span>
                                    <span className="stat-value">{loading ? '...' : stats.totalUsers.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <Link to="/admin/users" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', width: '100%' }}>
                                    <div className="stat-icon" style={{ backgroundColor: 'rgba(40, 167, 69, 0.1)', color: '#28a745' }}>
                                        <i className="fa-light fa-user-tie"></i>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-label">Active Marketers</span>
                                        <span className="stat-value">{loading ? '...' : stats.activeMarketers}</span>
                                    </div>
                                </Link>
                            </div>
                            <div className="stat-card">
                                <Link to="/admin/users" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', width: '100%' }}>
                                    <div className="stat-icon" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', color: '#ffc107' }}>
                                        <i className="fa-light fa-clock-rotate-left"></i>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-label">Pending Marketers</span>
                                        <span className="stat-value">{loading ? '...' : stats.pendingApprovals}</span>
                                    </div>
                                </Link>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon" style={{ backgroundColor: 'rgba(23, 162, 184, 0.1)', color: '#17a2b8' }}>
                                    <i className="fa-light fa-chart-line-up"></i>
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Total Revenue</span>
                                    <span className="stat-value">{loading ? '...' : `₹${stats.totalRevenue.toLocaleString()}`}</span>
                                </div>
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
