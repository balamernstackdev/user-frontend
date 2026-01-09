import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CommissionService from '../services/commission.service';
import SEO from '../components/common/SEO';
import './styles/Dashboard.css';
import './styles/Commissions.css';
import StatCard from '../components/dashboard/StatCard';
import { DollarSign, Clock, CheckCircle, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';

import DashboardLayout from '../components/layout/DashboardLayout';

const Commissions = () => {
    // ... state and effects ...
    const [commissions, setCommissions] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchCommissions();
    }, [filter]);

    const fetchCommissions = async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { status: filter } : {};
            const response = await CommissionService.getMyCommissions(params);
            setCommissions(response.data.commissions || []);
            setSummary(response.data.summary);
        } catch (err) {
            toast.error('Failed to load commission data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { class: 'badge-warning', label: 'Pending' },
            approved: { class: 'badge-success', label: 'Approved' },
            paid: { class: 'badge-info', label: 'Paid' },
            rejected: { class: 'badge-error', label: 'Rejected' }
        };
        return badges[status] || badges.pending;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <SEO title="My Commissions" description="Track your affiliate earnings and payouts." />
            <section className="page-section">
                <div className="container">
                    <div className="page-header">
                        <h2>My Commissions</h2>
                        <p style={{ color: '#6c757d' }}>Track your earnings from referrals</p>
                    </div>

                    {summary && (
                        <div className="admin-stats-grid stats-grid">
                            <StatCard
                                label="Total Earned"
                                value={`₹${summary.total_commissions ? summary.total_commissions.toLocaleString() : '0'}`}
                                icon={DollarSign}
                                iconColor="#ffc107"
                                iconBgColor="rgba(255, 193, 7, 0.1)"
                                isLoading={loading}
                            />
                            <StatCard
                                label="Pending Approval"
                                value={`₹${summary.pending_commissions ? summary.pending_commissions.toLocaleString() : '0'}`}
                                icon={Clock}
                                iconColor="#fd7e14"
                                iconBgColor="rgba(253, 126, 20, 0.1)"
                                isLoading={loading}
                            />
                            <StatCard
                                label="Approved"
                                value={`₹${summary.approved_commissions ? summary.approved_commissions.toLocaleString() : '0'}`}
                                icon={CheckCircle}
                                iconColor="#28a745"
                                iconBgColor="rgba(40, 167, 69, 0.1)"
                                isLoading={loading}
                            />
                            <StatCard
                                label="Paid Out"
                                value={`₹${summary.paid_commissions ? summary.paid_commissions.toLocaleString() : '0'}`}
                                icon={CreditCard}
                                iconColor="#17a2b8"
                                iconBgColor="rgba(23, 162, 184, 0.1)"
                                isLoading={loading}
                            />
                        </div>
                    )}

                    <div className="filter-bar">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                            onClick={() => setFilter('pending')}
                        >
                            Pending
                        </button>
                        <button
                            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
                            onClick={() => setFilter('approved')}
                        >
                            Approved
                        </button>
                        <button
                            className={`filter-btn ${filter === 'paid' ? 'active' : ''}`}
                            onClick={() => setFilter('paid')}
                        >
                            Paid
                        </button>
                    </div>

                    {commissions.length > 0 ? (
                        <div className="commissions-container">
                            <h2>Commission History</h2>
                            <div className="table-responsive">
                                <table className="commissions-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Amount</th>
                                            <th>Date Earned</th>
                                            <th>Status</th>
                                            <th>Paid Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {commissions.map((commission) => {
                                            const statusBadge = getStatusBadge(commission.status);
                                            return (
                                                <tr key={commission.id}>
                                                    <td>
                                                        <div className="user-info">
                                                            <span className="name">{commission.user_name}</span>
                                                            <span className="email">{commission.user_email}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="amount">₹{commission.amount.toLocaleString()}</span>
                                                    </td>
                                                    <td>{formatDate(commission.created_at)}</td>
                                                    <td>
                                                        <span className={`badge ${statusBadge.class}`}>
                                                            {statusBadge.label}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {commission.paid_at ? formatDate(commission.paid_at) : '-'}
                                                    </td>
                                                    <td>
                                                        <Link to={`/business-associate/commissions/${commission.id}`} className="view-btn">
                                                            View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="no-content-state mb-4">
                            <div className="no-content-icon">
                                <i className="fas fa-coins"></i>
                            </div>
                            <h3>No commissions yet</h3>
                            <p>Start referring users to earn commission! Your earnings will appear here once your referrals make successful payments.</p>
                        </div>
                    )}
                </div>
            </section>
        </DashboardLayout>
    );
};

export default Commissions;
