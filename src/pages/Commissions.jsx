import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CommissionService from '../services/commission.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import Pagination from '../components/common/Pagination';
import SEO from '../components/common/SEO';
import StatCard from '../components/dashboard/StatCard';
import { List, IndianRupee, CheckCircle, Clock, Calendar, Filter, Eye, Banknote, User, Package, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import './styles/AdminListings.css'; // Use shared admin styles for consistency

const Commissions = () => {
    const [searchParams] = useSearchParams();
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [summary, setSummary] = useState({
        total_commissions: 0,
        pending_commissions: 0,
        approved_commissions: 0,
        paid_commissions: 0
    });

    useEffect(() => {
        fetchCommissions();
    }, [pagination.page, statusFilter, startDate, endDate]);

    const fetchCommissions = async () => {
        try {
            setLoading(true);
            const params = {
                status: statusFilter !== 'all' ? statusFilter : '',
                startDate,
                endDate,
                limit: pagination.limit,
                offset: (pagination.page - 1) * pagination.limit
            };

            const response = await CommissionService.getMyCommissions(params);

            // Handle response - adapt based on actual API structure
            if (response.data && response.data.commissions) {
                setCommissions(response.data.commissions);
                if (response.data.pagination) {
                    setPagination(prev => ({ ...prev, total: response.data.pagination.total }));
                } else {
                    // Fallback pagination if backend doesn't provide it
                    setPagination(prev => ({ ...prev, total: response.data.commissions.length }));
                }

                if (response.data.summary) {
                    setSummary(response.data.summary);
                }
            } else if (Array.isArray(response.data)) {
                // Fallback for flat array response
                // manually filter if backend doesn't support params yet
                let data = response.data;
                if (statusFilter && statusFilter !== 'all') {
                    data = data.filter(c => c.status === statusFilter);
                }
                setCommissions(data);
                setPagination(prev => ({ ...prev, total: data.length }));
            }

        } catch (err) {
            toast.error('Failed to load commission data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        // Implement export functionality if available for BA
        toast.info('Export functionality coming soon!');
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
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
            <SEO title="Earnings History" description="Track your affiliate earnings and payouts." />

            <div className="admin-listing-page animate-fade-up">
                <div className="admin-container">

                    {/* Header */}
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Earnings History</h1>
                            <p className="text-muted mb-0">View all your commission earnings</p>
                        </div>
                        {/* 
                        <div className="header-actions">
                            <button className="tj-btn tj-btn-outline-primary" onClick={handleExport}>
                                <Download size={18} className="me-2" /> Export
                            </button>
                        </div>
                        */}
                    </div>

                    {/* Summary Cards */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-3">
                            <StatCard
                                label="Total Earned"
                                value={`₹${(summary.total_commissions || 0).toLocaleString('en-IN')}`}
                                icon={IndianRupee}
                                iconColor="#13689e"
                                iconBgColor="rgba(19, 104, 158, 0.1)"
                                isLoading={loading}
                                active={statusFilter === '' || statusFilter === 'all'}
                                onClick={() => setStatusFilter('')}
                            />
                        </div>
                        <div className="col-md-3">
                            <StatCard
                                label="Paid Amount"
                                value={`₹${(summary.paid_commissions || 0).toLocaleString('en-IN')}`}
                                icon={CheckCircle}
                                iconColor="#10b981"
                                iconBgColor="rgba(16, 185, 129, 0.1)"
                                isLoading={loading}
                                active={statusFilter === 'paid'}
                                onClick={() => setStatusFilter('paid')}
                            />
                        </div>
                        <div className="col-md-3">
                            <StatCard
                                label="Pending Approval"
                                value={`₹${(summary.pending_commissions || 0).toLocaleString('en-IN')}`}
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
                                label="Approved"
                                value={`₹${(summary.approved_commissions || 0).toLocaleString('en-IN')}`}
                                icon={Banknote}
                                iconColor="#6366f1"
                                iconBgColor="rgba(99, 102, 241, 0.1)"
                                isLoading={loading}
                                active={statusFilter === 'approved'}
                                onClick={() => setStatusFilter('approved')}
                            />
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="admin-listing-toolbar">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 w-100">

                            {/* Tabs / Filter Pills - Matching User Sreenshot 1 */}
                            <div className="d-flex align-items-center gap-2">
                                <button
                                    className={`status-toggle ${statusFilter === '' || statusFilter === 'all' ? 'active' : 'inactive bg-white border'}`}
                                    onClick={() => setStatusFilter('')}
                                >
                                    All
                                </button>
                                <button
                                    className={`status-toggle ${statusFilter === 'paid' ? 'active' : 'inactive bg-white border'}`}
                                    onClick={() => setStatusFilter('paid')}
                                >
                                    Paid
                                </button>
                                <button
                                    className={`status-toggle ${statusFilter === 'pending' ? 'active' : 'inactive bg-white border'}`}
                                    onClick={() => setStatusFilter('pending')}
                                >
                                    Pending
                                </button>
                                <button
                                    className={`status-toggle ${statusFilter === 'rejected' ? 'active' : 'inactive bg-white border'}`}
                                    onClick={() => setStatusFilter('rejected')}
                                >
                                    Rejected
                                </button>
                            </div>

                            <div className="d-flex align-items-center gap-3">
                                {/* Date Filter */}
                                <div className="d-flex align-items-center gap-2">
                                    <input
                                        type="date"
                                        className="custom-select"
                                        style={{ height: '38px' }}
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                    <span className="text-muted small">to</span>
                                    <input
                                        type="date"
                                        className="custom-select"
                                        style={{ height: '38px' }}
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                    {(startDate || endDate) && (
                                        <button className="tj-btn tj-btn-sm tj-btn-outline-danger ms-2" onClick={() => { setStartDate(''); setEndDate(''); }}>
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
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
                                        <tr><td colSpan="5" className="text-center py-5 text-muted">Loading your earnings history...</td></tr>
                                    ) : commissions.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5">
                                                <div className="text-muted mb-2"><Banknote size={40} className="opacity-20" /></div>
                                                <p className="text-muted mb-0">No commission records found</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        commissions.map(comm => (
                                            <tr key={comm.id}>
                                                <td>
                                                    <div className="d-flex flex-column">
                                                        <span className="fw-bold text-dark mb-1">Commission from {comm.user_name}</span>
                                                        <div className="text-muted small d-flex align-items-center gap-2 font-monospace">
                                                            ID: {comm.id.substring(0, 8)}...
                                                            {comm.plan_name && (
                                                                <span className="badge bg-light text-secondary border d-inline-flex align-items-center gap-1">
                                                                    <Package size={10} /> {comm.plan_name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="fw-bold text-dark d-flex align-items-center gap-1">
                                                        <IndianRupee size={12} className="text-muted" />
                                                        {parseFloat(comm.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="text-muted small">
                                                        {formatDate(comm.created_at)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`premium-badge ${comm.status === 'paid' ? 'premium-badge-success' :
                                                        comm.status === 'approved' ? 'premium-badge-primary' :
                                                            comm.status === 'pending' ? 'premium-badge-warning' :
                                                                'premium-badge-danger'
                                                        }`}>
                                                        {comm.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <Link
                                                        to={`/business-associate/commissions/${comm.id}`}
                                                        className="action-btn ms-auto"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </Link>
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

export default Commissions;
