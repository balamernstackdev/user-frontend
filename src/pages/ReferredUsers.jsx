import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ReferralService from '../services/referral.service';
import './ReferredUsers.css';

const ReferredUsers = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
            setError('Failed to load referral data');
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
                    <div className="page-header">
                        <h2>My Referrals</h2>
                        <p style={{ color: '#6c757d' }}>Track users you've referred</p>
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
                                <div className="stats-grid animate-fade-up">
                                    <div className="stat-card">
                                        <div className="stat-icon"><i className="fa-light fa-users"></i></div>
                                        <div className="stat-info">
                                            <span className="stat-label">Total Referrals</span>
                                            <span className="stat-value">{stats.total_referrals || 0}</span>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon"><i className="fa-light fa-user-check"></i></div>
                                        <div className="stat-info">
                                            <span className="stat-label">Active Subscribers</span>
                                            <span className="stat-value">{stats.active_subscribers || 0}</span>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon"><i className="fa-light fa-sack-dollar"></i></div>
                                        <div className="stat-info">
                                            <span className="stat-label">Total Commissions</span>
                                            <span className="stat-value">₹{Number(stats.total_commissions || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon"><i className="fa-light fa-percent"></i></div>
                                        <div className="stat-info">
                                            <span className="stat-label">Conversion Rate</span>
                                            <span className="stat-value">
                                                {stats.total_referrals > 0
                                                    ? Math.round((Number(stats.active_subscribers || 0) / Number(stats.total_referrals)) * 100)
                                                    : 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && <div className="alert alert-error">{error}</div>}

                            <div className="users-table-container animate-fade-up">
                                <h2>Referred Users</h2>
                                {users.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="users-table">
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
                                                {users.map((user) => (
                                                    <tr key={user.user_id}>
                                                        <td>{user.name}</td>
                                                        <td>{user.email}</td>
                                                        <td>{formatDate(user.referred_at)}</td>
                                                        <td>
                                                            {user.subscription_status === 'active' && user.plan_name ? (
                                                                <span className="plan-badge">{user.plan_name}</span>
                                                            ) : (
                                                                <span className="text-muted" style={{ fontStyle: 'italic', color: '#6c757d' }}>No active plan</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <span className={`status-badge ${user.subscription_status || 'inactive'}`}>
                                                                {user.subscription_status || 'Inactive'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="no-data">
                                        <div className="icon"><i className="fa-light fa-users-slash"></i></div>
                                        <h3>No referrals yet</h3>
                                        <p style={{ color: '#6c757d' }}>Share your referral code to start earning commissions!</p>
                                        {stats && stats.referral_code && (
                                            <div className="referral-code-box">
                                                <span className="label">Your Referral Code:</span>
                                                <span className="code">{stats.referral_code}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </section>
        </DashboardLayout>
    );
};

export default ReferredUsers;
