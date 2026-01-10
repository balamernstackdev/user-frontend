import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ReferralService from '../services/referral.service';
import './styles/ReferredUsers.css';
import { toast } from 'react-toastify';
import { Users, UserCheck, DollarSign, Percent, UserX, Copy } from 'lucide-react';

const ReferredUsers = () => {
    const [stats, setStats] = useState(null);
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
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <DashboardLayout>
            <section className="page-section">
                <div className="container">
                    <div className="page-header mb-4">
                        <h2 className="fw-bold text-dark">My Referrals</h2>
                        <p className="text-muted mb-0">Track users you've referred</p>
                    </div>

                    {loading ? (
                        <div className="text-center p-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {stats && (
                                <div className="row g-4 mb-4 animate-fade-up">
                                    <div className="col-md-6 col-lg-3">
                                        <div className="card h-100 border-0 shadow-sm hover-lift transition-all">
                                            <div className="card-body p-4">
                                                <div className="d-flex align-items-center mb-3">
                                                    <div className="p-2 rounded-3 bg-primary-subtle text-primary">
                                                        <Users size={24} />
                                                    </div>
                                                </div>
                                                <h3 className="fw-bold text-dark mb-1">{stats.total_referrals || 0}</h3>
                                                <p className="text-muted small mb-0">Total Humans Referred</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 col-lg-3">
                                        <div className="card h-100 border-0 shadow-sm hover-lift transition-all">
                                            <div className="card-body p-4">
                                                <div className="d-flex align-items-center mb-3">
                                                    <div className="p-2 rounded-3 bg-success-subtle text-success">
                                                        <UserCheck size={24} />
                                                    </div>
                                                </div>
                                                <h3 className="fw-bold text-dark mb-1">{stats.active_subscribers || 0}</h3>
                                                <p className="text-muted small mb-0">Active Subscribers</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 col-lg-3">
                                        <div className="card h-100 border-0 shadow-sm hover-lift transition-all">
                                            <div className="card-body p-4">
                                                <div className="d-flex align-items-center mb-3">
                                                    <div className="p-2 rounded-3 bg-warning-subtle text-warning-emphasis">
                                                        <DollarSign size={24} />
                                                    </div>
                                                </div>
                                                <h3 className="fw-bold text-dark mb-1 font-monospace">₹{Number(stats.total_commissions || 0).toLocaleString()}</h3>
                                                <p className="text-muted small mb-0">Total Commissions</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 col-lg-3">
                                        <div className="card h-100 border-0 shadow-sm hover-lift transition-all">
                                            <div className="card-body p-4">
                                                <div className="d-flex align-items-center mb-3">
                                                    <div className="p-2 rounded-3 bg-info-subtle text-info-emphasis">
                                                        <Percent size={24} />
                                                    </div>
                                                </div>
                                                <h3 className="fw-bold text-dark mb-1">
                                                    {stats.total_referrals > 0
                                                        ? Math.round((Number(stats.active_subscribers || 0) / Number(stats.total_referrals)) * 100)
                                                        : 0}%
                                                </h3>
                                                <p className="text-muted small mb-0">Conversion Rate</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="card border-0 shadow-sm animate-fade-up" style={{ animationDelay: '0.1s' }}>
                                <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 fw-bold text-dark">Referred Users</h5>
                                    {stats && stats.referral_code && (
                                        <div className="d-none d-md-block text-muted small">
                                            Ref Code: <span className="font-monospace fw-bold text-primary ms-2">{stats.referral_code}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="card-body p-0">
                                    {users.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle mb-0">
                                                <thead className="bg-light">
                                                    <tr>
                                                        <th className="px-4 py-3 text-muted fw-semibold small text-uppercase">Name</th>
                                                        <th className="px-4 py-3 text-muted fw-semibold small text-uppercase">Email</th>
                                                        <th className="px-4 py-3 text-muted fw-semibold small text-uppercase">Join Date</th>
                                                        <th className="px-4 py-3 text-muted fw-semibold small text-uppercase">Subscription</th>
                                                        <th className="px-4 py-3 text-muted fw-semibold small text-uppercase">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {users.map((user) => (
                                                        <tr key={user.user_id}>
                                                            <td className="px-4 py-3 fw-medium text-dark">{user.name}</td>
                                                            <td className="px-4 py-3 text-muted">{user.email}</td>
                                                            <td className="px-4 py-3 text-muted small">{formatDate(user.referred_at)}</td>
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
                                                                <span className={`badge rounded-pill fw-medium ${user.subscription_status === 'active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                                                                    {user.subscription_status ? user.subscription_status.charAt(0).toUpperCase() + user.subscription_status.slice(1) : 'Inactive'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <div className="mb-3 bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                                                <UserX size={32} className="text-muted opacity-50" />
                                            </div>
                                            <h5 className="text-dark fw-bold mb-1">No referrals yet</h5>
                                            <p className="text-muted mb-3">Share your referral code to start earning commissions!</p>
                                            {stats && stats.referral_code && (
                                                <div className="p-3 bg-light rounded-3 d-inline-block border">
                                                    <span className="text-muted small me-2">Your Code:</span>
                                                    <span className="font-monospace fw-bold text-primary fs-5 d-flex align-items-center gap-2">
                                                        {stats.referral_code}
                                                        <Copy size={16} className="cursor-pointer" onClick={() => { navigator.clipboard.writeText(stats.referral_code); toast.success('Code copied!'); }} />
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </DashboardLayout>
    );
};

export default ReferredUsers;
