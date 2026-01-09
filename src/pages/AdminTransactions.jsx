import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import paymentService from '../services/payment.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import Pagination from '../components/common/Pagination';
import SEO from '../components/common/SEO';
import { List, Clock, CheckCircle, XCircle, Search, Calendar, Filter, FileText, Download, User, Package, IndianRupee, Hash } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import { toast } from 'react-toastify';
import { adminService } from '../services/admin.service';
import './styles/AdminListings.css';

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
                <div className="admin-container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Customer Payments</h1>
                            <p className="text-muted mb-0">Monitor and reconcile all platform financial transactions</p>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-3">
                            <StatCard
                                label="Total Transactions"
                                value={stats.total || 0}
                                icon={List}
                                isLoading={loading}
                                active={statusFilter === ''}
                                onClick={() => setStatusFilter('')}
                            />
                        </div>
                        <div className="col-md-3">
                            <StatCard
                                label="Pending Amount"
                                value={`₹${(parseFloat(stats.total_pending) || 0).toLocaleString()}`}
                                icon={Clock}
                                iconColor="#f59e0b"
                                iconBgColor="rgba(245, 158, 11, 0.1)"
                                isLoading={loading}
                                active={statusFilter === 'pending'}
                                onClick={() => setStatusFilter('pending')}
                            />
                        </div>
                        <div className="col-md-3">
                            <StatCard
                                label="Total Revenue"
                                value={`₹${(parseFloat(stats.total_revenue) || 0).toLocaleString()}`}
                                icon={CheckCircle}
                                iconColor="#10b981"
                                iconBgColor="rgba(16, 185, 129, 0.1)"
                                isLoading={loading}
                                active={statusFilter === 'success'}
                                onClick={() => setStatusFilter('success')}
                            />
                        </div>
                        <div className="col-md-3">
                            <StatCard
                                label="Failed Amount"
                                value={`₹${(parseFloat(stats.total_failed) || 0).toLocaleString()}`}
                                icon={XCircle}
                                iconColor="#ef4444"
                                iconBgColor="rgba(239, 68, 68, 0.1)"
                                isLoading={loading}
                                active={statusFilter === 'failed'}
                                onClick={() => setStatusFilter('failed')}
                            />
                        </div>
                    </div>

                    <div className="admin-listing-toolbar">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div className="d-flex flex-wrap align-items-center gap-3 flex-grow-1">
                                <div className="search-box" style={{ maxWidth: '350px' }}>
                                    <Search size={18} className="search-icon" />
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search name, email or ID..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                <div className="d-flex align-items-center gap-2">
                                    <Calendar size={14} className="text-muted" />
                                    <input
                                        type="date"
                                        className="custom-select"
                                        style={{ height: '42px' }}
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                    <span className="text-muted small">to</span>
                                    <input
                                        type="date"
                                        className="custom-select"
                                        style={{ height: '42px' }}
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>

                                <div className="d-flex align-items-center gap-2">
                                    <Filter size={14} className="text-muted" />
                                    <select
                                        className="custom-select"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        style={{ height: '42px', minWidth: '130px' }}
                                    >
                                        <option value="">All Status</option>
                                        <option value="success">Successful</option>
                                        <option value="pending">Awaiting</option>
                                        <option value="failed">Declined</option>
                                    </select>
                                </div>

                                {(startDate || endDate) && (
                                    <button
                                        className="tj-btn tj-btn-sm tj-btn-outline-danger ms-2"
                                        onClick={() => { setStartDate(''); setEndDate(''); }}
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            <div className="btn-group" ref={exportDropdownRef}>
                                <button
                                    className="tj-btn tj-btn-outline-primary"
                                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                                >
                                    <Download size={18} className="me-2" /> Export
                                </button>

                                {showExportDropdown && (
                                    <ul className="dropdown-menu show shadow-sm border" style={{ display: 'block', position: 'absolute', top: '100%', right: 0, zIndex: 1000, minWidth: '140px' }}>
                                        <li>
                                            <button className="dropdown-item py-2" onClick={() => { handleExport('csv'); setShowExportDropdown(false); }}>
                                                Export as CSV
                                            </button>
                                        </li>
                                        <li>
                                            <button className="dropdown-item py-2" onClick={() => { handleExport('pdf'); setShowExportDropdown(false); }}>
                                                Export as PDF
                                            </button>
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="listing-table-container">
                        <div className="table-responsive">
                            <table className="listing-table">
                                <thead>
                                    <tr>
                                        <th>User Details</th>
                                        <th>Plan</th>
                                        <th>Amount</th>
                                        <th>Transaction ID</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="6" className="text-center py-5 text-muted">Synchronizing with payment gateway...</td></tr>
                                    ) : transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5">
                                                <div className="text-muted mb-2"><FileText size={40} className="opacity-20" /></div>
                                                <p className="text-muted mb-0">No transaction records found matching your filters</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map(txn => (
                                            <tr key={txn.id}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="avatar-circle-sm" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }}>
                                                            {txn.user_name.charAt(0)}
                                                        </div>
                                                        <div className="d-flex flex-column">
                                                            <span className="fw-semibold text-dark d-flex align-items-center gap-1">
                                                                <User size={12} className="text-muted" /> {txn.user_name}
                                                            </span>
                                                            <span className="text-muted small"> {txn.user_email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="premium-badge d-inline-flex align-items-center gap-1" style={{ background: '#f1f5f9', color: '#475569' }}>
                                                        <Package size={12} /> {txn.plan_name || 'System Add-on'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="fw-bold text-dark d-flex align-items-center gap-1">
                                                        <IndianRupee size={12} className="text-muted" />
                                                        {parseFloat(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-1 text-muted border px-2 py-1 rounded bg-light" style={{ width: 'fit-content' }}>
                                                        <Hash size={10} />
                                                        <code className="small" title={txn.id}>{txn.id.substring(0, 12)}...</code>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-muted small d-flex align-items-center gap-1">
                                                        <Calendar size={12} />
                                                        {new Date(txn.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`premium-badge ${txn.status === 'success' ? 'premium-badge-success' :
                                                        txn.status === 'pending' ? 'premium-badge-warning' :
                                                            'premium-badge-danger'
                                                        }`}>
                                                        {txn.status.toUpperCase()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {transactions.length > 0 && (
                            <div className="p-4 border-top">
                                <Pagination
                                    currentPage={pagination.page}
                                    totalPages={Math.ceil(pagination.total / pagination.limit)}
                                    onPageChange={(newPage) => {
                                        setPagination(prev => ({ ...prev, page: newPage }));
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminTransactions;
