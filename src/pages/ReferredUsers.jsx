import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ReferralService from '../services/referral.service';
import { toast } from 'react-toastify';
import StatCard from '../components/dashboard/StatCard';
import { Users, UserCheck, DollarSign, Percent, UserX, Copy, Calendar, Mail, User } from 'lucide-react';
import './styles/AdminListings.css'; // Use shared admin styles

const ReferredUsers = () => {
    const [stats, setStats] = useState({
        total_referrals: 0,
        active_subscribers: 0,
        total_commissions: 0,
        referral_code: ''
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes] = await Promise.all([
                ReferralService.getStats(),
                ReferralService.getReferredUsers()
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
        } catch (err) {
            toast.error('Failed to load referral data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const calculateConversionRate = () => {
        if (!stats.total_referrals) return 0;
        return Math.round((Number(stats.active_subscribers || 0) / Number(stats.total_referrals)) * 100);
    };

    return (
        <DashboardLayout>
            <div className="admin-listing-page animate-fade-up">
                <div className="admin-container">

                    {/* Header */}
                    <div className="admin-listing-header text-center justify-content-center flex-column mb-5">
                        <div className="header-title text-center">
                            <h1>My Referrals</h1>
                            <p className="text-muted mb-0">Track users you've referred</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="row g-4 mb-5">
                        <div className="col-md-3">
                            <StatCard
                                label="Total Humans Referred"
                                value={stats.total_referrals || 0}
                                icon={Users}
                                iconColor="#3b82f6"
                                iconBgColor="rgba(59, 130, 246, 0.1)"
                                isLoading={loading}
                            />
                        </div>
                        <div className="col-md-3">
                            <StatCard
                                label="Active Subscribers"
                                value={stats.active_subscribers || 0}
                                icon={UserCheck}
                                iconColor="#10b981"
                                iconBgColor="rgba(16, 185, 129, 0.1)"
                                isLoading={loading}
                            />
                        </div>
                        <div className="col-md-3">
                            <StatCard
                                label="Total Commissions"
                                value={`₹${Number(stats.total_commissions || 0).toLocaleString()}`}
                                icon={DollarSign}
                                iconColor="#f59e0b"
                                iconBgColor="rgba(245, 158, 11, 0.1)"
                                isLoading={loading}
                            />
                        </div>
                        <div className="col-md-3">
                            <StatCard
                                label="Conversion Rate"
                                value={`${calculateConversionRate()}%`}
                                icon={Percent}
                                iconColor="#06b6d4"
                                iconBgColor="rgba(6, 182, 212, 0.1)"
                                isLoading={loading}
                            />
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="listing-table-container">
                        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-0 px-3 pt-3">
                            <h5 className="mb-0 fw-bold text-dark">Referred Users</h5>
                            {stats.referral_code && (
                                <div className="text-muted small d-flex align-items-center gap-2">
                                    Ref Code:
                                    <span className="font-monospace fw-bold text-primary bg-primary-subtle px-2 py-1 rounded d-flex align-items-center gap-2">
                                        {stats.referral_code}
                                        <Copy
                                            size={14}
                                            className="cursor-pointer hover-text-dark"
                                            onClick={() => { navigator.clipboard.writeText(stats.referral_code); toast.success('Code copied!'); }}
                                            title="Copy Code"
                                        />
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="table-responsive">
                            <table className="listing-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Join Date</th>
                                        <th>Subscription</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="5" className="text-center py-5 text-muted">Loading referrals...</td></tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5">
                                                <div className="text-muted mb-2"><UserX size={40} className="opacity-20" /></div>
                                                <p className="text-muted mb-0">No referrals found</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.user_id}>
                                                <td>
                                                    <div className="fw-semibold text-dark">{user.name}</div>
                                                </td>
                                                <td>
                                                    <div className="text-muted small">{user.email}</div>
                                                </td>
                                                <td>
                                                    <div className="text-muted small">
                                                        {formatDate(user.referred_at)}
                                                    </div>
                                                </td>
                                                <td>
                                                    {user.subscription_status === 'active' && user.plan_name ? (
                                                        <span className="premium-badge premium-badge-primary">
                                                            {user.plan_name.toUpperCase()}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted small fst-italic">-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`premium-badge ${user.subscription_status === 'active'
                                                        ? 'premium-badge-success'
                                                        : 'premium-badge-secondary'
                                                        }`}>
                                                        {user.subscription_status ? user.subscription_status.toUpperCase() : 'INACTIVE'}
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
        </DashboardLayout>
    );
};

export default ReferredUsers;
