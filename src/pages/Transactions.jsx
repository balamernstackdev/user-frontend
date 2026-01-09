import { useState, useEffect } from 'react';
import paymentService from '../services/payment.service';
import CommissionService from '../services/commission.service';
import { authService } from '../services/auth.service';
import SEO from '../components/common/SEO';
import './styles/Transactions.css';
import './styles/Dashboard.css';
import { toast } from 'react-toastify';
import { Coins, CreditCard } from 'lucide-react';

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
                setTransactions(response.data.transactions || response.data || []);
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
                    <div className="welcome-header animate-fade-up mb-4">
                        <div>
                            <h2 className="section-title fw-bold mb-2">{isBusinessAssociate ? 'Earnings History' : 'Transaction History'}</h2>
                            <p className="section-subtitle text-muted mb-0">
                                {isBusinessAssociate ? 'View all your commission earnings' : 'View all your payment transactions'}
                            </p>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm animate-fade-up" style={{ animationDelay: '0.1s' }}>
                        <div className="card-header bg-white border-0 py-3 px-4">
                            <div className="d-flex overflow-auto">
                                <button
                                    className={`btn btn-sm rounded-pill fw-medium me-2 px-3 ${filter === 'all' ? 'btn-primary' : 'btn-light text-muted'}`}
                                    onClick={() => setFilter('all')}
                                >
                                    All
                                </button>
                                <button
                                    className={`btn btn-sm rounded-pill fw-medium me-2 px-3 ${filter === (isBusinessAssociate ? 'paid' : 'success') ? 'btn-primary' : 'btn-light text-muted'}`}
                                    onClick={() => setFilter(isBusinessAssociate ? 'paid' : 'success')}
                                >
                                    {isBusinessAssociate ? 'Paid' : 'Success'}
                                </button>
                                <button
                                    className={`btn btn-sm rounded-pill fw-medium me-2 px-3 ${filter === 'pending' ? 'btn-primary' : 'btn-light text-muted'}`}
                                    onClick={() => setFilter('pending')}
                                >
                                    Pending
                                </button>
                                <button
                                    className={`btn btn-sm rounded-pill fw-medium me-2 px-3 ${filter === (isBusinessAssociate ? 'rejected' : 'failed') ? 'btn-primary' : 'btn-light text-muted'}`}
                                    onClick={() => setFilter(isBusinessAssociate ? 'rejected' : 'failed')}
                                >
                                    {isBusinessAssociate ? 'Rejected' : 'Failed'}
                                </button>
                            </div>
                        </div>

                        <div className="card-body p-0">
                            {transactions.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="px-4 py-3 text-muted fw-semibold small text-uppercase">Description</th>
                                                <th className="px-4 py-3 text-muted fw-semibold small text-uppercase">Amount</th>
                                                <th className="px-4 py-3 text-muted fw-semibold small text-uppercase">Date</th>
                                                <th className="px-4 py-3 text-muted fw-semibold small text-uppercase">Status</th>
                                                <th className="px-4 py-3 text-muted fw-semibold small text-uppercase text-end">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map((transaction) => (
                                                <tr key={transaction.id}>
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <div className="fw-semibold text-dark">{transaction.plan_name || 'Plan Purchase'}</div>
                                                            <div className="text-muted small font-monospace">ID: {transaction.id.slice(0, 8)}...</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="fw-bold text-dark">₹{transaction.amount.toLocaleString()}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted small">
                                                        {formatDate(transaction.created_at)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`badge rounded-pill fw-medium ${transaction.status === 'success' || transaction.status === 'paid' ? 'bg-success-subtle text-success' :
                                                            transaction.status === 'pending' ? 'bg-warning-subtle text-warning-emphasis' :
                                                                'bg-danger-subtle text-danger'
                                                            }`}>
                                                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-end">
                                                        {transaction.razorpay_payment_id && (
                                                            <div className="small text-muted">
                                                                Pay ID: {transaction.razorpay_payment_id}
                                                            </div>
                                                        )}
                                                        {transaction.payment_date && (
                                                            <div className="small text-muted">
                                                                Paid: {formatDate(transaction.payment_date)}
                                                            </div>
                                                        )}
                                                        {transaction.error_message && (
                                                            <div className="small text-danger" title={transaction.error_message}>
                                                                Error details
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <div className="mb-3 bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                                        {isBusinessAssociate ? (
                                            <Coins size={32} className="text-muted opacity-50" />
                                        ) : (
                                            <CreditCard size={32} className="text-muted opacity-50" />
                                        )}
                                    </div>
                                    <h5 className="text-dark fw-bold mb-1">
                                        {isBusinessAssociate ? 'No earnings found' : 'No transactions found'}
                                    </h5>
                                    <p className="text-muted mb-3">
                                        {filter === 'all'
                                            ? (isBusinessAssociate ? "You haven't earned any commissions yet." : "You haven't made any transactions yet.")
                                            : `No ${filter} records found.`
                                        }
                                    </p>
                                    {!isBusinessAssociate && filter === 'all' && (
                                        <button className="btn btn-primary rounded-pill px-4" onClick={() => window.location.href = '/plans'}>
                                            Browse Plans
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default Transactions;
