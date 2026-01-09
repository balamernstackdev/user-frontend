import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CommissionService from '../services/commission.service';
import SEO from '../components/common/SEO';
import './styles/Dashboard.css';
import './styles/Commissions.css';
import StatCard from '../components/dashboard/StatCard';
import { DollarSign, Clock, CheckCircle, CreditCard, Coins } from 'lucide-react';
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
                    <div className="welcome-header animate-fade-up mb-4">
                        <div>
                            <h2 className="section-title fw-bold mb-2">My Commissions</h2>
                            <p className="section-subtitle text-muted mb-0">Track your earnings from referrals</p>
                        </div>
                    </div>

                    {summary && (
                        <div className="admin-stats-grid stats-grid animate-fade-up">
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

                    <div className="card border-0 shadow-sm animate-fade-up" style={{ animationDelay: '0.1s' }}>
                        <div className="card-header bg-white border-0 py-3 px-4">
                            <div className="d-flex overflow-auto">
                                {['all', 'pending', 'approved', 'paid'].map((status) => (
                                    <button
                                        key={status}
                                        className={`btn btn-sm rounded-pill fw-medium me-2 px-3 ${filter === status ? 'btn-primary' : 'btn-light text-muted'}`}
                                        onClick={() => setFilter(status)}
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="card-body p-0">
                            {commissions.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="px-4 py-3 text-muted fw-semibold small text-uppercase">User</th>
                                                <th className="px-4 py-3 text-muted fw-semibold small text-uppercase">Amount</th>
                                                <th className="px-4 py-3 text-muted fw-semibold small text-uppercase">Date Earned</th>
                                                <th className="px-4 py-3 text-muted fw-semibold small text-uppercase">Status</th>
                                                <th className="px-4 py-3 text-muted fw-semibold small text-uppercase">Paid Date</th>
                                                <th className="px-4 py-3 text-muted fw-semibold small text-uppercase text-end">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {commissions.map((commission) => {
                                                const statusBadge = getStatusBadge(commission.status);
                                                return (
                                                    <tr key={commission.id}>
                                                        <td className="px-4 py-3">
                                                            <div>
                                                                <div className="fw-semibold text-dark">{commission.user_name}</div>
                                                                <div className="text-muted small">{commission.user_email}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="fw-bold text-dark">₹{commission.amount.toLocaleString()}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-muted small">{formatDate(commission.created_at)}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`badge rounded-pill fw-medium ${commission.status === 'approved' ? 'bg-success-subtle text-success' :
                                                                commission.status === 'paid' ? 'bg-info-subtle text-info-emphasis' :
                                                                    commission.status === 'rejected' ? 'bg-danger-subtle text-danger' :
                                                                        'bg-warning-subtle text-warning-emphasis'
                                                                }`}>
                                                                {statusBadge.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-muted small">
                                                            {commission.paid_at ? formatDate(commission.paid_at) : '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-end">
                                                            <Link to={`/business-associate/commissions/${commission.id}`} className="btn btn-sm btn-outline-primary rounded-pill px-3">
                                                                View
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <div className="mb-3 bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                                        <Coins size={32} className="text-muted opacity-50" />
                                    </div>
                                    <h5 className="text-dark fw-bold mb-1">No commissions found</h5>
                                    <p className="text-muted mb-0">
                                        {filter === 'all'
                                            ? "Start referring users to earn commission!"
                                            : `No ${filter} commissions found.`
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default Commissions;
