import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { activityService } from '../services/activity.service';
import { authService } from '../services/auth.service';
import adminService from '../services/admin.service';
import SEO from '../components/common/SEO';
import { Users, UserCheck, Clock, CreditCard, TrendingUp, AlertCircle, CheckCircle, Package } from 'lucide-react';
import './styles/Dashboard.css';
import './styles/AdminListings.css';
import { Settings as SettingsIcon } from 'lucide-react';


// New Components
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import PlanDistributionChart from '../components/dashboard/PlanDistributionChart';
import UserRoleChart from '../components/dashboard/UserRoleChart';
import RecentActivityList from '../components/dashboard/RecentActivityList';

const AdminDashboard = () => {
    const user = authService.getUser();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeMarketers: 0,
        pendingApprovals: 0,
        pendingCommissionsCount: 0,
        totalRevenue: 0,
        activeSubscriptions: 0,
        expiringSubscriptions: 0,
        totalPlans: 0,
        analytics: {
            revenueTrend: [],
            planDistribution: [],
            roleDistribution: []
        }
    });
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setDateRange({ startDate: '', endDate: '' });
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);

                // Only pass dateRange if it has actual values
                const params = (dateRange.startDate || dateRange.endDate) ? dateRange : {};
                const statsResponse = await adminService.getDashboardStatus(params);
                const {
                    totalUsers, activeMarketers, pendingMarketers, pendingCommissions,
                    pendingPayouts, totalRevenue, activeSubscriptions, expiringSubscriptions,
                    totalPlans, analytics
                } = statsResponse.data;

                // Process Revenue Trend to ensure smooth line chart
                const processRevenueData = (rawTrend) => {
                    if (dateRange.startDate || dateRange.endDate) {
                        return rawTrend?.map(item => ({
                            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                            fullDate: item.date,
                            revenue: Number(item.revenue) || 0
                        })) || [];
                    }

                    const days = 30;
                    const today = new Date();
                    const filledData = [];

                    for (let i = days - 1; i >= 0; i--) {
                        const d = new Date();
                        d.setDate(today.getDate() - i);
                        const dateStr = d.toISOString().split('T')[0];
                        const found = rawTrend?.find(item => item.date === dateStr);

                        filledData.push({
                            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                            fullDate: dateStr,
                            revenue: found ? Number(found.revenue) : 0
                        });
                    }
                    return filledData;
                };

                const processedRevenue = processRevenueData(analytics?.revenueTrend);

                setStats({
                    totalUsers,
                    activeMarketers,
                    pendingApprovals: (pendingMarketers || 0) + (pendingCommissions || 0),
                    pendingMarketers: pendingMarketers || 0,
                    pendingCommissions: pendingCommissions || 0,
                    pendingCommissionsCount: pendingPayouts,
                    totalRevenue,
                    activeSubscriptions: activeSubscriptions || 0,
                    expiringSubscriptions: expiringSubscriptions || 0,
                    totalPlans: totalPlans || 0,
                    analytics: {
                        revenueTrend: processedRevenue,
                        planDistribution: analytics?.planDistribution?.map(item => ({
                            ...item,
                            count: Number(item.count) || 0
                        })) || [],
                        roleDistribution: analytics?.roleDistribution?.map(item => ({
                            ...item,
                            count: Number(item.count) || 0
                        })) || []
                    }
                });

                const logsRes = await activityService.getAllLogs({ limit: 5 });
                if (logsRes.data && logsRes.data.logs) {
                    setRecentLogs(logsRes.data.logs);
                } else if (Array.isArray(logsRes.data)) {
                    setRecentLogs(logsRes.data);
                } else if (logsRes.data && Array.isArray(logsRes.data.data)) {
                    setRecentLogs(logsRes.data.data);
                }

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [dateRange]);

    const getPendingLink = () => {
        if (stats.pendingMarketers > 0) return "/admin/users?status=pending";
        if (stats.pendingCommissions > 0) return "/admin/commissions?status=pending";
        return "/admin/commissions";
    };

    return (
        <DashboardLayout>
            <SEO title="Admin Dashboard" description="Advanced Analytics & System Overview" />
            <section className="welcome-section">
                <div className="admin-container">
                    <div className="welcome-content">
                        <div className="welcome-header animate-fade-up mb-4">
                            <div>
                                <h1 className="section-title" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Welcome back, {user?.name || 'Admin'}! 👋</h1>
                                <p className="section-subtitle" style={{ fontSize: '1.15rem' }}>Real-time system health and growth analytics.</p>
                            </div>
                            <div className="last-updated text-muted small">
                                <Clock size={14} style={{ display: 'inline', marginRight: '5px' }} />
                                Last updated: {new Date().toLocaleTimeString()}
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="admin-stats-grid stats-grid animate-fade-up">
                            <StatCard
                                label="Total Users"
                                value={stats.totalUsers.toLocaleString()}
                                icon={Users}
                                className="card-users"
                                isLoading={loading}
                                link="/admin/users"
                            />
                            <StatCard
                                label="Active Business Associates"
                                value={stats.activeMarketers}
                                icon={UserCheck}
                                iconColor="#28a745"
                                iconBgColor="rgba(40, 167, 69, 0.1)"
                                link="/admin/users?role=business_associate&status=active"
                                isLoading={loading}
                                className="card-active-marketers"
                            />
                            <StatCard
                                label="Total Plans"
                                value={stats.totalPlans || 0}
                                icon={Package}
                                iconColor="#ffc107"
                                iconBgColor="rgba(255, 193, 7, 0.1)"
                                link="/admin/plans"
                                isLoading={loading}
                                className="card-plans"
                            />
                            <StatCard
                                label="Pending Payouts"
                                value={stats.pendingCommissionsCount || 0}
                                icon={CreditCard}
                                iconColor="#17a2b8"
                                iconBgColor="rgba(23, 162, 184, 0.1)"
                                link="/admin/commissions?status=pending"
                                isLoading={loading}
                                className="card-payouts"
                            />
                            <StatCard
                                label="Total Revenue"
                                value={`₹${stats.totalRevenue.toLocaleString()}`}
                                icon={TrendingUp}
                                iconColor="#6f42c1"
                                iconBgColor="rgba(111, 66, 193, 0.1)"
                                isLoading={loading}
                                link="/admin/transactions?status=success"
                                className="card-revenue"
                            />
                            <StatCard
                                label="Active Subscriptions"
                                value={stats.activeSubscriptions}
                                icon={CheckCircle}
                                iconColor="#20c997"
                                iconBgColor="rgba(32, 201, 151, 0.1)"
                                link="/admin/subscriptions?status=active"
                                isLoading={loading}
                                className="card-active-subs"
                            />
                            <StatCard
                                label="Expiring Soon"
                                value={stats.expiringSubscriptions}
                                icon={AlertCircle}
                                iconColor="#dc3545"
                                iconBgColor="rgba(220, 53, 69, 0.1)"
                                link="/admin/subscriptions?status=active"
                                isLoading={loading}
                                className="card-expiring"
                            />
                        </div>

                        {/* Analytics Row 1 */}
                        <div className="row mt-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                            <div className="col-lg-8 mb-4">
                                <RevenueChart
                                    data={stats.analytics.revenueTrend}
                                    dateRange={dateRange}
                                    onDateChange={handleDateChange}
                                    onClearFilters={clearFilters}
                                    isLoading={loading}
                                />
                            </div>
                            <div className="col-lg-4 mb-4">
                                <PlanDistributionChart
                                    data={stats.analytics.planDistribution}
                                    isLoading={loading}
                                />
                            </div>
                        </div>

                        {/* Analytics Row 2 */}
                        <div className="row animate-fade-up" style={{ animationDelay: '0.2s' }}>
                            <div className="col-lg-5 mb-4">
                                <UserRoleChart
                                    data={stats.analytics.roleDistribution}
                                    isLoading={loading}
                                />

                                {stats.expiringSubscriptions > 0 && !loading && (
                                    <div className="analytics-card bg-warning-soft border-0 mt-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="warning-icon-bg">
                                                <AlertCircle size={24} className="text-warning-dark" />
                                            </div>
                                            <div>
                                                <h5 className="mb-1 text-warning-dark">{stats.expiringSubscriptions} Subscriptions Expiring</h5>
                                                <p className="mb-0 text-muted small">Action needed within 7 days.</p>
                                            </div>
                                            <Link to="/admin/subscriptions?status=active" className="btn btn-sm btn-warning ms-auto">View</Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="col-lg-7 mb-4">
                                <RecentActivityList
                                    logs={recentLogs}
                                    isLoading={loading}
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Floating Settings Gear - From Screenshot */}
            <Link
                to="/admin/settings"
                className="floating-settings-btn"
                title="System Settings"
            >
                <SettingsIcon size={20} />
            </Link>
        </DashboardLayout>
    );
};

export default AdminDashboard;
