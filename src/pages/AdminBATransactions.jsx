import { useState, useEffect } from 'react';
import adminService from '../services/admin.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import Pagination from '../components/common/Pagination';
import SEO from '../components/common/SEO';
import { CreditCard, IndianRupee, Wallet, Clock, Search, Filter, Calendar, ExternalLink, CheckCircle, AlertCircle, XCircle, User, Briefcase } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import './styles/AdminListings.css';

const AdminBATransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [commissionStatus, setCommissionStatus] = useState('');
    const [baFilter, setBAFilter] = useState('');
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [businessAssociates, setBusinessAssociates] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0 });
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
                commissionStatus: commissionStatus,
                businessAssociateId: baFilter,
                search: search,
                startDate,
                endDate,
                limit: pagination.limit,
                offset: (pagination.page - 1) * pagination.limit
            };
            const response = await adminService.getBATransactions(params);
            if (response.success) {
                setTransactions(response.data.transactions || []);
                setPagination(prev => ({ ...prev, total: response.data.total || 0 }));
                setStats({
                    totalTransactions: response.data.total || 0,
                    totalRevenue: response.data.totalRevenue || 0,
                    totalCommission: response.data.totalCommission || 0,
                    totalPendingCommission: response.data.totalPendingCommission || 0
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
    }, [pagination.page, statusFilter, commissionStatus, baFilter, search, startDate, endDate]);

    const clearFilters = () => {
        setStatusFilter('');
        setCommissionStatus('');
        setBAFilter('');
        setSearch('');
        setStartDate('');
        setEndDate('');
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    return (
        <DashboardLayout>
            <SEO title="BA Transaction Tracking" description="Track business associate referral transactions" />
            <div className="admin-listing-page animate-fade-up">
                <div className="admin-container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>BA Transactions</h1>
                            <p className="text-muted mb-0">Track referral-based customer transactions and commissions</p>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-3">
                            <StatCard
                                label="Total Transactions"
                                value={stats.totalTransactions}
                                icon={CreditCard}
                                isLoading={loading}
                            />
                        </div>
                        <div className="col-md-3">
                            <StatCard
                                label="Total Revenue"
                                value={`₹${stats.totalRevenue?.toLocaleString() || '0'}`}
                                icon={IndianRupee}
                                iconColor="#10b981"
                                iconBgColor="rgba(16, 185, 129, 0.1)"
                                isLoading={loading}
                            />
                        </div>
                        <div className="col-md-3">
                            <StatCard
                                label="Total Commission"
                                value={`₹${stats.totalCommission?.toLocaleString() || '0'}`}
                                icon={Wallet}
                                iconColor="#8b5cf6"
                                iconBgColor="rgba(139, 92, 246, 0.1)"
                                isLoading={loading}
                            />
                        </div>
                        <div className="col-md-3">
                            <StatCard
                                label="Pending Commission"
                                value={`₹${stats.totalPendingCommission?.toLocaleString() || '0'}`}
                                icon={Clock}
                                iconColor="#f59e0b"
                                iconBgColor="rgba(245, 158, 11, 0.1)"
                                isLoading={loading}
                            />
                        </div>
                    </div>

                    {/* Standardized Toolbar */}
                    <div className="admin-listing-toolbar">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div className="d-flex align-items-center gap-3">
                                <div className="d-flex align-items-center gap-2">
                                    <input
                                        type="date"
                                        className="custom-select"
                                        style={{ height: '42px' }}
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                    <span className="text-muted">to</span>
                                    <input
                                        type="date"
                                        className="custom-select"
                                        style={{ height: '42px' }}
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                    {(startDate || endDate || baFilter || statusFilter || commissionStatus || search) && (
                                        <button
                                            className="tj-btn tj-btn-sm tj-btn-outline-danger"
                                            onClick={clearFilters}
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: '800px' }}>
                                <div className="search-box flex-grow-1">
                                    <Search size={18} className="search-icon" />
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search name, email or ID..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="custom-select"
                                    value={baFilter}
                                    onChange={(e) => setBAFilter(e.target.value)}
                                    style={{ width: '200px' }}
                                >
                                    <option value="">All BAs</option>
                                    {businessAssociates.map(ba => (
                                        <option key={ba.id} value={ba.id}>
                                            {ba.company_name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="custom-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    style={{ width: '150px' }}
                                >
                                    <option value="">Txn Status</option>
                                    <option value="success">Success</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                </select>
                                <select
                                    className="custom-select"
                                    value={commissionStatus}
                                    onChange={(e) => setCommissionStatus(e.target.value)}
                                    style={{ width: '160px' }}
                                >
                                    <option value="">Comm Status</option>
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="listing-table-container">
                        <div className="table-responsive">
                            <table className="listing-table">
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Business Associate</th>
                                        <th>Plan</th>
                                        <th>Amount</th>
                                        <th>Commission</th>
                                        <th>Txn Details</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="7" className="text-center py-5 text-muted">Loading transactions...</td></tr>
                                    ) : transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-5">
                                                <div className="text-muted mb-2"><CreditCard size={40} className="opacity-20" /></div>
                                                <p className="text-muted mb-0">No transactions found</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map(txn => (
                                            <tr key={txn.id}>
                                                <td>
                                                    <div className="d-flex flex-column">
                                                        <span className="fw-semibold text-dark">{txn.customer_name}</span>
                                                        <span className="text-muted small">{txn.customer_email}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-column">
                                                        <span className="fw-semibold text-dark">{txn.ba_company_name}</span>
                                                        <span className="text-muted small">{txn.ba_name}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="premium-badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                                                        {txn.plan_name || 'N/A'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="fw-bold text-dark">₹{txn.amount?.toLocaleString()}</span>
                                                </td>
                                                <td>
                                                    {txn.commission_amount ? (
                                                        <div className="d-flex flex-column">
                                                            <span className="fw-bold text-success">₹{txn.commission_amount?.toLocaleString()}</span>
                                                            <span className={`small text-uppercase fw-bold ${txn.commission_status === 'paid' ? 'text-success' : 'text-warning'}`} style={{ fontSize: '10px' }}>
                                                                {txn.commission_status}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-column">
                                                        <span className="small text-muted font-monospace">{txn.id.substring(0, 12)}...</span>
                                                        <span className="small text-muted">
                                                            <Calendar size={10} className="me-1" />
                                                            {new Date(txn.created_at).toLocaleDateString('en-GB')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`premium-badge ${txn.status === 'success' ? 'premium-badge-success' : txn.status === 'pending' ? 'premium-badge-warning' : 'premium-badge-danger'}`}>
                                                        {txn.status === 'success' ? <CheckCircle size={12} className="me-1" /> : txn.status === 'pending' ? <Clock size={12} className="me-1" /> : <XCircle size={12} className="me-1" />}
                                                        {txn.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {transactions.length > 0 && (
                            <div className="mt-4 p-4 border-top d-flex justify-content-center">
                                <Pagination
                                    currentPage={pagination.page}
                                    totalItems={pagination.total}
                                    itemsPerPage={pagination.limit}
                                    onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminBATransactions;
