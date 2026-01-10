import { useState, useEffect } from 'react';
import paymentService from '../services/payment.service';
import CommissionService from '../services/commission.service';
import { authService } from '../services/auth.service';
import SEO from '../components/common/SEO';
import './styles/AdminListings.css'; // Use shared admin styles
import { toast } from 'react-toastify';
import { Coins, CreditCard, Eye, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import Pagination from '../components/common/Pagination';

import DashboardLayout from '../components/layout/DashboardLayout';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0 });
    // Standard 'all' filter default
    const [filter, setFilter] = useState('all');

    const user = authService.getUser();
    const isBusinessAssociate = user?.role === 'business_associate';

    useEffect(() => {
        fetchTransactions();
    }, [filter, pagination.page]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { status: filter } : {};

            if (isBusinessAssociate) {
                // For marketers, fetch commissions and map to transaction format
                // Add pagination params if API supports it, or slice locally
                const commissionParams = { ...params, limit: pagination.limit, offset: (pagination.page - 1) * pagination.limit };
                const response = await CommissionService.getMyCommissions(commissionParams);

                let commissions = response.data.commissions || [];
                let total = response.data.pagination?.total || commissions.length;

                // Fallback for local slicing if API returns all
                if (!response.data.pagination && commissions.length > pagination.limit) {
                    total = commissions.length;
                    const start = (pagination.page - 1) * pagination.limit;
                    commissions = commissions.slice(start, start + pagination.limit);
                }

                const mappedTransactions = commissions.map(comm => ({
                    id: comm.id,
                    plan_name: `Commission from ${comm.user_name}`,
                    amount: comm.amount,
                    status: mapCommissionStatus(comm.status),
                    created_at: comm.created_at,
                    payment_date: comm.paid_at,
                    razorpay_payment_id: null,
                    error_message: null
                }));

                setTransactions(mappedTransactions);
                setPagination(prev => ({ ...prev, total: total }));
            } else {
                // For regular users, fetch actual transactions
                const txParams = { ...params, limit: pagination.limit, offset: (pagination.page - 1) * pagination.limit };
                const response = await paymentService.getTransactions(txParams);

                let txs = response.data.transactions || response.data || [];
                let total = response.data.pagination?.total || txs.length;

                // Fallback local slice if needed
                if (!response.data.pagination && txs.length > pagination.limit) {
                    total = txs.length;
                    const start = (pagination.page - 1) * pagination.limit;
                    txs = txs.slice(start, start + pagination.limit);
                }

                setTransactions(txs);
                setPagination(prev => ({ ...prev, total: total }));
            }
        } catch (err) {
            toast.error(isBusinessAssociate ? 'Failed to load commission history' : 'Failed to load transactions');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const mapCommissionStatus = (status) => {
        switch (status) {
            case 'paid': return 'success';
            case 'approved': return 'approved';
            case 'pending': return 'pending';
            case 'rejected': return 'failed';
            default: return status;
        }
    };

    const getStatusLabel = (status) => {
        if (!status) return 'UNKNOWN';
        if (isBusinessAssociate) {
            if (status === 'success') return 'PAID';
            if (status === 'failed') return 'REJECTED';
            return status.toUpperCase();
        }
        return status.toUpperCase();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <DashboardLayout>
            <SEO title={isBusinessAssociate ? "Earnings History" : "Transaction History"} description="View your financial history." />

            <div className="admin-listing-page animate-fade-up">
                <div className="admin-container">

                    {/* Header */}
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>{isBusinessAssociate ? 'Earnings History' : 'Transaction History'}</h1>
                            <p className="text-muted mb-0">
                                {isBusinessAssociate ? 'View all your commission earnings' : 'View all your payment transactions'}
                            </p>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="admin-listing-toolbar">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 w-100">
                            {/* Tabs / Filter Pills */}
                            <div className="d-flex align-items-center gap-2">
                                <button
                                    className={`status-toggle ${filter === 'all' ? 'active' : 'inactive bg-white border'}`}
                                    onClick={() => setFilter('all')}
                                >
                                    All
                                </button>
                                <button
                                    className={`status-toggle ${(filter === 'success' || filter === 'paid') ? 'active' : 'inactive bg-white border'}`}
                                    onClick={() => setFilter(isBusinessAssociate ? 'paid' : 'success')}
                                >
                                    {isBusinessAssociate ? 'Paid' : 'Success'}
                                </button>
                                {isBusinessAssociate && (
                                    <button
                                        className={`status-toggle ${filter === 'approved' ? 'active' : 'inactive bg-white border'}`}
                                        onClick={() => setFilter('approved')}
                                    >
                                        Approved
                                    </button>
                                )}
                                <button
                                    className={`status-toggle ${filter === 'pending' ? 'active' : 'inactive bg-white border'}`}
                                    onClick={() => setFilter('pending')}
                                >
                                    Pending
                                </button>
                                <button
                                    className={`status-toggle ${(filter === 'failed' || filter === 'rejected') ? 'active' : 'inactive bg-white border'}`}
                                    onClick={() => setFilter(isBusinessAssociate ? 'rejected' : 'failed')}
                                >
                                    {isBusinessAssociate ? 'Rejected' : 'Failed'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="listing-table-container">
                        <div className="table-responsive">
                            <table className="listing-table">
                                <thead>
                                    <tr>
                                        <th>Description</th>
                                        <th>Amount</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th className="text-end">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="5" className="text-center py-5 text-muted">Loading history...</td></tr>
                                    ) : transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5">
                                                <div className="text-muted mb-2">
                                                    {isBusinessAssociate ? <Coins size={40} className="opacity-20" /> : <CreditCard size={40} className="opacity-20" />}
                                                </div>
                                                <p className="text-muted mb-0">No records found</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map((tx) => (
                                            <tr key={tx.id}>
                                                <td>
                                                    <div className="d-flex flex-column">
                                                        <span className="fw-bold text-dark mb-1">{tx.plan_name || 'Transaction'}</span>
                                                        <div className="text-muted small font-monospace">ID: {tx.id.substring(0, 8)}...</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`fw-bold d-flex align-items-center gap-1 ${isBusinessAssociate ? 'text-success' : 'text-dark'}`}>
                                                        {isBusinessAssociate ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} className="text-muted" />}
                                                        ₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="text-muted small">
                                                        {formatDate(tx.created_at)}
                                                    </span>
                                                </td>
                                                <td>
                                                    {(() => {
                                                        const status = tx.status || tx.payment_status || 'unknown';
                                                        return (
                                                            <span className={`premium-badge ${(status === 'success' || status === 'paid' || status === 'captured') ? 'premium-badge-success' :
                                                                (status === 'approved') ? 'premium-badge-primary' :
                                                                    (status === 'pending' || status === 'created' || status === 'authorized') ? 'premium-badge-warning' :
                                                                        'premium-badge-danger'
                                                                }`}>
                                                                {getStatusLabel(status)}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="text-end">
                                                    {tx.razorpay_payment_id && (
                                                        <span className="badge bg-light text-secondary border font-monospace small">
                                                            Pays ID: {tx.razorpay_payment_id.substring(0, 10)}...
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {pagination.total > pagination.limit && (
                            <div className="mt-4 p-4 border-top d-flex justify-content-center">
                                <Pagination
                                    currentPage={pagination.page}
                                    totalItems={pagination.total}
                                    itemsPerPage={pagination.limit}
                                    onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                                />
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default Transactions;
