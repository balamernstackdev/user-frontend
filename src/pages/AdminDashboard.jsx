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

            <div className="admin-listing-page animate-fade-up">
                <div className="admin-container">
                    <div className="admin-listing-header mb-5">
                        <div className="header-title">
                            <h1 className="display-6 fw-bold text-dark mb-1">Welcome back, {user?.name || 'Admin'}! 👋</h1>
                            <p className="text-muted fs-5 mb-0">Real-time system health and growth analytics</p>
                        </div>
                        <div className="d-none d-md-flex align-items-center gap-3 text-muted bg-white px-4 py-2 rounded-pill shadow-sm border">
                            <Clock size={16} />
                            <span className="small fw-medium">Last updated: {new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>

                    {/* Stats Grid - Using Row/Col for Better Control */}
                    <div className="row g-4 mb-5">
                        <div className="col-xl-3 col-md-6">
                            <StatCard
                                label="Total Users"
                                value={stats.totalUsers.toLocaleString()}
                                icon={Users}
                                isLoading={loading}
                                link="/admin/users"
                            />
                        </div>
                        <div className="col-xl-3 col-md-6">
                            <StatCard
                                label="Active Business Associates"
                                value={stats.activeMarketers}
                                icon={UserCheck}
                                iconColor="#10b981"
                                iconBgColor="rgba(16, 185, 129, 0.1)"
                                link="/admin/users?role=business_associate&status=active"
                                isLoading={loading}
                            />
                        </div>
                        <div className="col-xl-3 col-md-6">
                            <StatCard
                                label="Total Plans"
                                value={stats.totalPlans || 0}
                                icon={Package}
                                iconColor="#f59e0b"
                                iconBgColor="rgba(245, 158, 11, 0.1)"
                                link="/admin/plans"
                                isLoading={loading}
                            />
                        </div>
                        <div className="col-xl-3 col-md-6">
                            <StatCard
                                label="Pending Payouts"
                                value={stats.pendingCommissionsCount || 0}
                                icon={CreditCard}
                                iconColor="#0ea5e9"
                                iconBgColor="rgba(14, 165, 233, 0.1)"
                                link="/admin/commissions?status=pending"
                                isLoading={loading}
                            />
                        </div>
                        <div className="col-xl-3 col-md-6">
                            <StatCard
                                label="Total Revenue"
                                value={`₹${stats.totalRevenue.toLocaleString()}`}
                                icon={TrendingUp}
                                iconColor="#8b5cf6"
                                iconBgColor="rgba(139, 92, 246, 0.1)"
                                isLoading={loading}
                                link="/admin/transactions?status=success"
                            />
                        </div>
                        <div className="col-xl-3 col-md-6">
                            <StatCard
                                label="Active Subscriptions"
                                value={stats.activeSubscriptions}
                                icon={CheckCircle}
                                iconColor="#10b981"
                                iconBgColor="rgba(16, 185, 129, 0.1)"
                                link="/admin/subscriptions?status=active"
                                isLoading={loading}
                            />
                        </div>
                        <div className="col-xl-3 col-md-6">
                            <StatCard
                                label="Expiring Soon"
                                value={stats.expiringSubscriptions}
                                icon={AlertCircle}
                                iconColor="#ef4444"
                                iconBgColor="rgba(239, 68, 68, 0.1)"
                                link="/admin/subscriptions?status=active"
                                isLoading={loading}
                            />
                        </div>
                    </div>

                    {/* Analytics Row 1 */}
                    <div className="row g-4 mb-5">
                        <div className="col-lg-8">
                            <div className="listing-table-container h-100 p-0 overflow-hidden border-0 bg-transparent">
                                <RevenueChart
                                    data={stats.analytics.revenueTrend}
                                    dateRange={dateRange}
                                    onDateChange={handleDateChange}
                                    onClearFilters={clearFilters}
                                    isLoading={loading}
                                />
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="listing-table-container h-100 p-0 overflow-hidden border-0 bg-transparent">
                                <PlanDistributionChart
                                    data={stats.analytics.planDistribution}
                                    isLoading={loading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Analytics Row 2 */}
                    <div className="row g-4">
                        <div className="col-lg-5">
                            <div className="d-flex flex-column gap-4">
                                <div className="listing-table-container p-0 overflow-hidden border-0 bg-transparent">
                                    <UserRoleChart
                                        data={stats.analytics.roleDistribution}
                                        isLoading={loading}
                                    />
                                </div>

                                {stats.expiringSubscriptions > 0 && !loading && (
                                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-warning-subtle border-start border-4 border-warning">
                                        <div className="card-body p-4">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                                        <AlertCircle size={24} />
                                                    </div>
                                                    <div>
                                                        <h5 className="fw-bold mb-1 text-warning-emphasis">{stats.expiringSubscriptions} Subscriptions Expiring</h5>
                                                        <p className="mb-0 text-muted small">Action needed within 7 days.</p>
                                                    </div>
                                                </div>
                                                <Link to="/admin/subscriptions?status=active" className="tj-btn tj-btn-sm tj-btn-primary">View All</Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="listing-table-container h-100 p-0 overflow-hidden border-0 bg-transparent">
                                <RecentActivityList
                                    logs={recentLogs}
                                    isLoading={loading}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Settings Gear */}
            <Link
                to="/admin/settings"
                className="floating-settings-btn"
                title="System Settings"
            >
                <SettingsIcon size={20} />
            </Link>

            <style>{`
                .floating-settings-btn {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    width: 50px;
                    height: 50px;
                    background: #1e293b;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                    z-index: 1000;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .floating-settings-btn:hover {
                    transform: rotate(90deg) scale(1.1);
                    background: #0f172a;
                    color: white;
                }
            `}</style>
        </DashboardLayout>
    );
};

export default AdminDashboard;
