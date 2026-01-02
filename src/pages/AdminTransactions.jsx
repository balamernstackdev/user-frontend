
import { useState, useEffect } from 'react';
import paymentService from '../services/payment.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import Pagination from '../components/common/Pagination';
import './AdminListings.css';

const AdminTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('success'); // success, pending, failed
    const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0 });

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = {
                status: statusFilter,
                limit: pagination.limit,
                offset: (pagination.page - 1) * pagination.limit
            };
            const response = await paymentService.getAllTransactions(params);
            if (response.success) {
                // Handle both new (paginated) and old (array) response formats
                if (response.data.pagination) {
                    setTransactions(response.data.transactions);
                    setPagination(prev => ({ ...prev, total: response.data.pagination.total }));
                } else if (Array.isArray(response.data)) {
                    // Fallback for stale backend
                    const allData = response.data;
                    const startIndex = (pagination.page - 1) * pagination.limit;
                    const endIndex = startIndex + pagination.limit;
                    const paginatedData = allData.slice(startIndex, endIndex);

                    setTransactions(paginatedData);
                    setPagination(prev => ({ ...prev, total: allData.length }));
                }
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [pagination.page, statusFilter]);

    return (
        <DashboardLayout>
            <div className="admin-listing-page animate-fade-up">
                <div className="container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Customer Payments</h1>
                            <p style={{ color: '#6c757d' }}>View and manage all customer transactions</p>
                        </div>
                        <div className="header-actions">
                            <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '200px' }}>
                                <option value="">All Status</option>
                                <option value="success">Success</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>

                    <div className="listing-table-container">
                        <table className="listing-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Plan</th>
                                    <th>Amount</th>
                                    <th>Transaction ID</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center">Loading...</td></tr>
                                ) : transactions.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center" style={{ padding: '50px' }}>No transactions found</td></tr>
                                ) : (
                                    transactions.map(txn => (
                                        <tr key={txn.id}>
                                            <td>
                                                <div className="plan-info-cell">
                                                    <span className="plan-name-text">{txn.user_name}</span>
                                                    <span className="plan-slug-text">{txn.user_email}</span>
                                                </div>
                                            </td>
                                            <td>{txn.plan_name || 'N/A'}</td>
                                            <td>
                                                <span className="plan-price-text">₹{txn.amount}</span>
                                            </td>
                                            <td title={txn.id}>
                                                <span style={{ fontFamily: 'monospace' }}>{txn.id.substring(0, 8)}...</span>
                                            </td>
                                            <td>{new Date(txn.created_at).toLocaleDateString()} {new Date(txn.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                            <td>
                                                <span className={`plan-type-badge`} style={{
                                                    background: txn.status === 'success' ? '#e8f5e9' : txn.status === 'pending' ? '#fff3e0' : '#ffebee',
                                                    color: txn.status === 'success' ? '#2e7d32' : txn.status === 'pending' ? '#ff9800' : '#c62828'
                                                }}>
                                                    {txn.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {transactions.length > 0 && (
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={Math.ceil(pagination.total / pagination.limit)}
                                onPageChange={(newPage) => {
                                    setPagination(prev => ({ ...prev, page: newPage }));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminTransactions;
