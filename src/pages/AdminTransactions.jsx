
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import paymentService from '../services/payment.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import Pagination from '../components/common/Pagination';
import SEO from '../components/common/SEO';
import { List, Clock, CheckCircle, XCircle } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import './styles/AdminListings.css';
import { toast } from 'react-toastify';
import { adminService } from '../services/admin.service';

const AdminTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const [statusFilter, setStatusFilter] = useState(''); // Changed default to empty for all
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState({ total_transactions: 0, total_amount: 0, total_revenue: 0 });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showExportDropdown, setShowExportDropdown] = useState(false);
    const exportDropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
                setShowExportDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Effect to handle URL query parameters
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const status = queryParams.get('status');
        if (status) {
            setStatusFilter(status);
        }
    }, [location.search]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = {
                status: statusFilter,
                search,
                limit: pagination.limit,
                offset: (pagination.page - 1) * pagination.limit,
                startDate,
                endDate
            };
            const response = await paymentService.getAllTransactions(params);
            if (response.success) {
                // Handle both new (paginated) and old (array) response formats
                if (response.data.pagination) {
                    setTransactions(response.data.transactions);
                    setPagination(prev => ({ ...prev, total: response.data.pagination.total }));
                    if (response.data.stats) {
                        setStats(response.data.stats);
                    }
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
    }, [pagination.page, statusFilter, search, startDate, endDate]);

    const handleExport = async (format) => {
        try {
            const params = { startDate, endDate };
            const blob = await adminService.exportData('transactions', format, params);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `transactions_${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(`Transactions exported successfully!`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export transactions. Please try again.');
        }
    };

    return (
        <DashboardLayout>
            <SEO title="Transaction History" description="View platform transactions" />
            <div className="admin-listing-page animate-fade-up">
                <div className="container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Customer Payments</h1>
                            <p style={{ color: '#6c757d' }}>View and manage all customer transactions</p>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="admin-stats-grid mb-4">
                        <StatCard
                            label="Total Transactions"
                            value={stats.total || 0}
                            icon={List}
                            isLoading={loading}
                            active={statusFilter === ''}
                            onClick={() => setStatusFilter('')}
                            className="card-users stat-card-hover"
                        />
                        <StatCard
                            label="Pending Amount"
                            value={`₹${(parseFloat(stats.total_pending) || 0).toLocaleString()}`}
                            icon={Clock}
                            iconColor="#ffc107"
                            iconBgColor="rgba(255, 193, 7, 0.1)"
                            isLoading={loading}
                            active={statusFilter === 'pending'}
                            onClick={() => setStatusFilter('pending')}
                            className="card-plans stat-card-hover"
                        />
                        <StatCard
                            label="Paid Amount"
                            value={`₹${(parseFloat(stats.total_revenue) || 0).toLocaleString()}`}
                            icon={CheckCircle}
                            iconColor="#10b981"
                            iconBgColor="rgba(16, 185, 129, 0.1)"
                            isLoading={loading}
                            active={statusFilter === 'success'}
                            onClick={() => setStatusFilter('success')}
                            className="card-active-marketers stat-card-hover"
                        />
                        <StatCard
                            label="Failed Amount"
                            value={`₹${(parseFloat(stats.total_failed) || 0).toLocaleString()}`}
                            icon={XCircle}
                            iconColor="#ef4444"
                            iconBgColor="rgba(239, 68, 68, 0.1)"
                            isLoading={loading}
                            active={statusFilter === 'failed'}
                            onClick={() => setStatusFilter('failed')}
                            className="card-expiring stat-card-hover"
                        />
                    </div>

                    <div className="admin-listing-toolbar mb-4" style={{
                        backgroundColor: 'white',
                        padding: '15px 20px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                        border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            {/* Left Side: Date Filters */}
                            <div className="d-flex align-items-center gap-3">
                                <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>Filter Date:</span>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="input-group input-group-sm" style={{ width: '160px' }}>
                                        <span className="input-group-text bg-white border-end-0 text-muted pe-1">
                                            <i className="far fa-calendar-alt"></i>
                                        </span>
                                        <input
                                            type="date"
                                            className="form-control border-start-0 ps-2"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            style={{ borderColor: '#dee2e6', color: '#6c757d' }}
                                        />
                                    </div>
                                    <span className="text-muted small">to</span>
                                    <div className="input-group input-group-sm" style={{ width: '160px' }}>
                                        <span className="input-group-text bg-white border-end-0 text-muted pe-1">
                                            <i className="far fa-calendar-alt"></i>
                                        </span>
                                        <input
                                            type="date"
                                            className="form-control border-start-0 ps-2"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            style={{ borderColor: '#dee2e6', color: '#6c757d' }}
                                        />
                                    </div>
                                    {(startDate || endDate) && (
                                        <button
                                            className="btn btn-sm text-danger ms-1"
                                            onClick={() => { setStartDate(''); setEndDate(''); }}
                                            title="Clear Dates"
                                            style={{ background: 'none', border: 'none' }}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Right Side: Filters & Actions */}
                            <div className="d-flex align-items-center gap-3">
                                <div className="input-group input-group-sm" style={{ minWidth: '250px' }}>
                                    <span className="input-group-text bg-white border-end-0 text-muted ps-2">
                                        <i className="fas fa-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        placeholder="Search by name, email or ID..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        style={{ borderColor: '#e2e8f0', boxShadow: 'none' }}
                                    />
                                </div>
                                <select
                                    className="form-select form-select-sm"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    style={{ borderRadius: '6px', borderColor: '#e2e8f0', minWidth: '130px', height: '38px' }}
                                >
                                    <option value="">All Status</option>
                                    <option value="success">Success</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                </select>

                                <div className="vr mx-1" style={{ color: '#e2e8f0' }}></div>

                                <div className="position-relative" ref={exportDropdownRef}>
                                    <button
                                        className="tj-primary-btn"
                                        onClick={() => setShowExportDropdown(!showExportDropdown)}
                                        style={{
                                            height: '38px',
                                            borderRadius: '6px',
                                            padding: '0 20px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            fontSize: '14px',
                                            fontWeight: 500
                                        }}
                                    >
                                        <i className="fas fa-file-export me-2"></i>
                                        <span className="btn-text">Export Options</span>
                                    </button>

                                    {showExportDropdown && (
                                        <ul className="dropdown-menu show shadow" style={{
                                            display: 'block',
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            zIndex: 1000,
                                            minWidth: '200px',
                                            padding: '8px',
                                            border: '1px solid #eef2f6',
                                            borderRadius: '12px',
                                            marginTop: '8px'
                                        }}>
                                            <li>
                                                <button
                                                    className="dropdown-item rounded-2"
                                                    onClick={() => { handleExport('csv'); setShowExportDropdown(false); }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', transition: 'all 0.2s' }}
                                                >
                                                    <i className="fas fa-file-csv text-primary" style={{ fontSize: '18px' }}></i>
                                                    <span>Download CSV</span>
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className="dropdown-item rounded-2"
                                                    onClick={() => { handleExport('pdf'); setShowExportDropdown(false); }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', transition: 'all 0.2s' }}
                                                >
                                                    <i className="fas fa-file-pdf text-danger" style={{ fontSize: '18px' }}></i>
                                                    <span>Download PDF</span>
                                                </button>
                                            </li>
                                        </ul>
                                    )}
                                </div>
                            </div>
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
                                            <td>{new Date(txn.created_at).toLocaleDateString('en-GB')} {new Date(txn.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
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
