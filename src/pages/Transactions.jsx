import { useState, useEffect } from 'react';
import paymentService from '../services/payment.service';
import CommissionService from '../services/commission.service';
import { authService } from '../services/auth.service';
import SEO from '../components/common/SEO';
import './Transactions.css';
import { toast } from 'react-toastify';

import DashboardLayout from '../components/layout/DashboardLayout';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const user = authService.getUser();
    const isBusinessAssociate = user?.role === 'business_associate';

    useEffect(() => {
        fetchTransactions();
    }, [filter]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { status: filter } : {};

            if (isBusinessAssociate) {
                // For marketers, fetch commissions and map to transaction format
                const response = await CommissionService.getMyCommissions(params);
                const commissions = response.data.commissions || [];

                const mappedTransactions = commissions.map(comm => ({
                    id: comm.id,
                    plan_name: `Commission from ${comm.user_name}`,
                    amount: comm.amount,
                    status: mapCommissionStatus(comm.status),
                    created_at: comm.created_at,
                    payment_date: comm.paid_at,
                    razorpay_payment_id: null, // Commissions don't have this in the same way
                    error_message: null
                }));

                setTransactions(mappedTransactions);
            } else {
                // For regular users, fetch actual transactions
                const response = await paymentService.getTransactions(params);
                setTransactions(response.data);
            }
        } catch (err) {
            toast.error(isBusinessAssociate ? 'Failed to load commission history' : 'Failed to load transactions');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const mapCommissionStatus = (status) => {
        // Map commission status to transaction status for consistency
        switch (status) {
            case 'paid': return 'success';
            case 'approved': return 'pending'; // Approved but not paid is effectively pending payout
            case 'pending': return 'pending';
            case 'rejected': return 'failed';
            default: return status;
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            success: 'badge-success',
            pending: 'badge-warning',
            failed: 'badge-error'
        };
        return badges[status] || 'badge-default';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
            <SEO title="Transaction History" description="View your payment history and commission earnings." />
            <section className="page-section">
                <div className="container">
                    <div className="page-header">
                        <h2>{isBusinessAssociate ? 'Earnings History' : 'Transaction History'}</h2>
                        <p style={{ color: '#6c757d' }}>
                            {isBusinessAssociate ? 'View all your commission earnings' : 'View all your payment transactions'}
                        </p>
                    </div>

                    <div className="filter-bar">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn ${filter === 'success' ? 'active' : ''}`}
                            onClick={() => setFilter(isBusinessAssociate ? 'paid' : 'success')}
                        >
                            {isBusinessAssociate ? 'Paid' : 'Success'}
                        </button>
                        <button
                            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                            onClick={() => setFilter(isBusinessAssociate ? 'pending' : 'pending')}
                        >
                            Pending
                        </button>
                        <button
                            className={`filter-btn ${filter === 'failed' ? 'active' : ''}`}
                            onClick={() => setFilter(isBusinessAssociate ? 'rejected' : 'failed')}
                        >
                            Failed
                        </button>
                    </div>

                    <div className="transactions-list">
                        {transactions.length > 0 ? (
                            transactions.map((transaction) => (
                                <div key={transaction.id} className="transaction-card">
                                    <div className="transaction-header">
                                        <div className="transaction-info">
                                            <h3>{transaction.plan_name || 'Plan Purchase'}</h3>
                                            <p className="transaction-id">ID: {transaction.id.slice(0, 8)}...</p>
                                        </div>
                                        <div className="transaction-amount">
                                            <span className="amount">₹{transaction.amount.toLocaleString()}</span>
                                            <span className={`badge ${getStatusBadge(transaction.status)}`}>
                                                {transaction.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="transaction-details">
                                        <div className="detail-item">
                                            <span className="label">Date:</span>
                                            <span className="value">{formatDate(transaction.created_at)}</span>
                                        </div>
                                        {transaction.razorpay_payment_id && (
                                            <div className="detail-item">
                                                <span className="label">Payment ID:</span>
                                                <span className="value">{transaction.razorpay_payment_id}</span>
                                            </div>
                                        )}
                                        {transaction.payment_date && (
                                            <div className="detail-item">
                                                <span className="label">Paid on:</span>
                                                <span className="value">{formatDate(transaction.payment_date)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {transaction.error_message && (
                                        <div className="error-message">
                                            <strong>Error:</strong> {transaction.error_message}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="no-transactions">
                                <div className="empty-icon">💳</div>
                                <h3>{isBusinessAssociate ? 'No earnings found' : 'No transactions found'}</h3>
                                <p>{isBusinessAssociate ? "You haven't earned any commissions yet." : "You haven't made any transactions yet."}</p>
                                {!isBusinessAssociate && (
                                    <button className="btn btn-primary" onClick={() => window.location.href = '/plans'}>
                                        Browse Plans
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default Transactions;
