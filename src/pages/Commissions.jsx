import { useState, useEffect } from 'react';
import CommissionService from '../services/commission.service';
import './Commissions.css';

const Commissions = () => {
    const [commissions, setCommissions] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
            setError('Failed to load commission data');
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
            <div className="container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading commissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="commissions-page">
            <div className="container">
                <div className="page-header">
                    <h1>My Commissions</h1>
                    <p>Track your earnings from referrals</p>
                </div>

                {summary && (
                    <div className="summary-grid">
                        <div className="summary-card total">
                            <div className="card-icon">💰</div>
                            <div className="card-info">
                                <span className="label">Total Earned</span>
                                <span className="value">₹{summary.total_commissions ? summary.total_commissions.toLocaleString() : '0'}</span>
                            </div>
                        </div>
                        <div className="summary-card pending">
                            <div className="card-icon">⏳</div>
                            <div className="card-info">
                                <span className="label">Pending Approval</span>
                                <span className="value">₹{summary.pending_commissions ? summary.pending_commissions.toLocaleString() : '0'}</span>
                            </div>
                        </div>
                        <div className="summary-card approved">
                            <div className="card-icon">✅</div>
                            <div className="card-info">
                                <span className="label">Approved</span>
                                <span className="value">₹{summary.approved_commissions ? summary.approved_commissions.toLocaleString() : '0'}</span>
                            </div>
                        </div>
                        <div className="summary-card paid">
                            <div className="card-icon">💸</div>
                            <div className="card-info">
                                <span className="label">Paid Out</span>
                                <span className="value">₹{summary.paid_commissions ? summary.paid_commissions.toLocaleString() : '0'}</span>
                            </div>
                        </div>
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

                {error && <div className="alert alert-error">{error}</div>}

                <div className="commissions-container">
                    <h2>Commission History</h2>
                    {commissions.length > 0 ? (
                        <div className="table-responsive">
                            <table className="commissions-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Amount</th>
                                        <th>Date Earned</th>
                                        <th>Status</th>
                                        <th>Paid Date</th>
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
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="no-data">
                            <div className="icon">💰</div>
                            <h3>No commissions yet</h3>
                            <p>Start referring users to earn commission!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Commissions;
