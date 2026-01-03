import { useState, useEffect } from 'react';
import adminService from '../services/admin.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import Pagination from '../components/common/Pagination';
import SEO from '../components/common/SEO';
import './AdminListings.css';

const AdminBATransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('success');
    const [baFilter, setBAFilter] = useState('');
    const [businessAssociates, setBusinessAssociates] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [stats, setStats] = useState({ totalAmount: 0, totalTransactions: 0 });

    const fetchBusinessAssociates = async () => {
        try {
            const response = await adminService.getBusinessAssociates({ status: 'active' });
            if (response.success) {
                setBusinessAssociates(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching business associates:', error);
        }
    };

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = {
                status: statusFilter,
                businessAssociateId: baFilter,
                limit: pagination.limit,
                offset: (pagination.page - 1) * pagination.limit
            };
            const response = await adminService.getBATransactions(params);
            if (response.success) {
                setTransactions(response.data.transactions || []);
                setPagination(prev => ({ ...prev, total: response.data.total || 0 }));
                setStats({
                    totalAmount: response.data.totalAmount || 0,
                    totalTransactions: response.data.total || 0
                });
            }
        } catch (error) {
            console.error('Error fetching BA transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBusinessAssociates();
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [pagination.page, statusFilter, baFilter]);

    return (
        <DashboardLayout>
            <SEO title="BA Transaction Tracking" description="Track business associate referral transactions" />
            <div className="admin-listing-page animate-fade-up">
                <div className="container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Business Associate Transactions</h1>
                            <p style={{ color: '#6c757d' }}>Track referral-based customer transactions and commissions</p>
                        </div>
                        <div className="header-actions">
                            <div className="filter-group" style={{ display: 'flex', gap: '10px' }}>
                                <select
                                    className="custom-select"
                                    value={baFilter}
                                    onChange={(e) => setBAFilter(e.target.value)}
                                    style={{ width: '250px' }}
                                >
                                    <option value="">All Business Associates</option>
                                    {businessAssociates.map(ba => (
                                        <option key={ba.id} value={ba.id}>
                                            {ba.company_name} ({ba.user_name})
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="custom-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    style={{ width: '150px' }}
                                >
                                    <option value="">All Status</option>
                                    <option value="success">Success</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <div style={{ color: '#6c757d', fontSize: '14px', marginBottom: '8px' }}>Total Transactions</div>
                            <div style={{ fontSize: '28px', fontWeight: '600', color: '#2c3e50' }}>{stats.totalTransactions}</div>
                        </div>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <div style={{ color: '#6c757d', fontSize: '14px', marginBottom: '8px' }}>Total Amount</div>
                            <div style={{ fontSize: '28px', fontWeight: '600', color: '#27ae60' }}>₹{stats.totalAmount.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="listing-table-container">
                        <table className="listing-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Business Associate</th>
                                    <th>Plan</th>
                                    <th>Amount</th>
                                    <th>Commission</th>
                                    <th>Transaction ID</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="8" className="text-center">Loading...</td></tr>
                                ) : transactions.length === 0 ? (
                                    <tr><td colSpan="8" className="text-center" style={{ padding: '50px' }}>No transactions found</td></tr>
                                ) : (
                                    transactions.map(txn => (
                                        <tr key={txn.id}>
                                            <td>
                                                <div className="plan-info-cell">
                                                    <span className="plan-name-text">{txn.customer_name}</span>
                                                    <span className="plan-slug-text">{txn.customer_email}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="plan-info-cell">
                                                    <span className="plan-name-text">{txn.ba_company_name}</span>
                                                    <span className="plan-slug-text">{txn.ba_name}</span>
                                                </div>
                                            </td>
                                            <td>{txn.plan_name || 'N/A'}</td>
                                            <td>
                                                <span className="plan-price-text">₹{txn.amount}</span>
                                            </td>
                                            <td>
                                                {txn.commission_amount ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontWeight: '600', color: '#6ab04c' }}>₹{txn.commission_amount}</span>
                                                        <span style={{ fontSize: '11px', color: txn.commission_status === 'paid' ? '#2e7d32' : '#f39c12' }}>{txn.commission_status}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted">-</span>
                                                )}
                                            </td>
                                            <td title={txn.id}>
                                                <span style={{ fontFamily: 'monospace' }}>{txn.id.substring(0, 8)}...</span>
                                            </td>
                                            <td>{new Date(txn.created_at).toLocaleDateString()} {new Date(txn.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                            <td>
                                                <span className="plan-type-badge" style={{
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

export default AdminBATransactions;
