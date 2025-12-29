import { useState, useEffect } from 'react';
import paymentService from '../services/payment.service';
import './Transactions.css';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchTransactions();
    }, [filter]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { status: filter } : {};
            const response = await paymentService.getTransactions(params);
            setTransactions(response.data);
        } catch (err) {
            setError('Failed to load transactions');
            console.error(err);
        } finally {
            setLoading(false);
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
            <div className="container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading transactions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="transactions-page">
            <div className="container">
                <div className="page-header">
                    <h1>Transaction History</h1>
                    <p>View all your payment transactions</p>
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
                        onClick={() => setFilter('success')}
                    >
                        Success
                    </button>
                    <button
                        className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={`filter-btn ${filter === 'failed' ? 'active' : ''}`}
                        onClick={() => setFilter('failed')}
                    >
                        Failed
                    </button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

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
                            <h3>No transactions found</h3>
                            <p>You haven't made any transactions yet.</p>
                            <button className="btn btn-primary" onClick={() => window.location.href = '/plans'}>
                                Browse Plans
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Transactions;
