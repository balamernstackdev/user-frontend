import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import commissionService from '../services/commission.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import Pagination from '../components/common/Pagination';
import SEO from '../components/common/SEO';
import StatCard from '../components/dashboard/StatCard';
import { List, IndianRupee, CheckCircle, Clock, Download, Calendar, Filter, Eye, Check, Banknote, User, Package, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService } from '../services/admin.service';
import './styles/AdminListings.css';

const AdminCommissions = () => {
    const [searchParams] = useSearchParams();
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'pending');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [stats, setStats] = useState({ total_commissions: 0, total_amount: 0, pending_amount: 0, paid_amount: 0 });
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

    const fetchCommissions = async () => {
        setLoading(true);
        try {
            const params = {
                status: statusFilter,
                startDate,
                endDate,
                limit: pagination.limit,
                offset: (pagination.page - 1) * pagination.limit
            };
            const response = await commissionService.getAllCommissions(params);
            if (response.data && response.data.pagination) {
                setCommissions(response.data.commissions);
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

                setCommissions(paginatedData);
                setPagination(prev => ({ ...prev, total: allData.length }));
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                // Fallback for wrapped array
                const allData = response.data.data;
                const startIndex = (pagination.page - 1) * pagination.limit;
                const endIndex = startIndex + pagination.limit;
                const paginatedData = allData.slice(startIndex, endIndex);

                setCommissions(paginatedData);
                setPagination(prev => ({ ...prev, total: allData.length }));
            }
        } catch (error) {
            console.error('Error fetching commissions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissions();
    }, [pagination.page, statusFilter, startDate, endDate]);

    const handleApprove = async (id) => {
        if (window.confirm('Approve this commission?')) {
            try {
                await commissionService.approveCommission(id);
                fetchCommissions();
                toast.success('Commission approved');
            } catch (error) {
                console.error('Error approving commission:', error);
                toast.error('Failed to approve commission');
            }
        }
    };

    const handleExport = async () => {
        try {
            const params = { startDate, endDate };
            const blob = await adminService.exportData('payouts', 'csv', params);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payouts_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('Payout export generated successfully!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to generate payout export.');
        }
    };

    const handleGeneralExport = async (format) => {
        try {
            const params = { startDate, endDate };
            const blob = await adminService.exportData('commissions', format, params);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `commissions_${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(`Commissions exported successfully!`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export commissions. Please try again.');
        }
    };

    return (
        <DashboardLayout>
            <SEO title="Commission Management" description="Manage business associate commissions" />
            <div className="admin-listing-page animate-fade-up">
                <div className="admin-container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Commission Payouts</h1>
                            <p className="text-muted mb-0">Manage and process Business Associate commissions</p>
                        </div>
                        <div className="header-actions">
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
                                            <button className="dropdown-item py-2" onClick={() => { handleGeneralExport('csv'); setShowExportDropdown(false); }}>
                                                Export as CSV
                                            </button>
                                        </li>
                                        <li>
                                            <button className="dropdown-item py-2" onClick={() => { handleGeneralExport('pdf'); setShowExportDropdown(false); }}>
                                                Export as PDF
                                            </button>
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-3">
                            <StatCard
                                label="Total Payouts"
                                value={stats.total_count || 0}
                                icon={List}
                                isLoading={loading}
                            />
                        </div>
                        <div className="col-md-3">
                            <StatCard
                                label="Total Amount"
                                value={`₹${(parseFloat(stats.total_amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                                icon={IndianRupee}
                                iconColor="#10b981"
                                iconBgColor="rgba(16, 185, 129, 0.1)"
                                isLoading={loading}
                            />
                        </div>
                        <div className="col-md-3">
                            <StatCard
                                label="Paid Amount"
                                value={`₹${(parseFloat(stats.paid_amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                                icon={CheckCircle}
                                iconColor="#6366f1"
                                iconBgColor="rgba(99, 102, 241, 0.1)"
                                isLoading={loading}
                            />
                        </div>
                        <div className="col-md-3">
                            <StatCard
                                label="Pending Amount"
                                value={`₹${(parseFloat(stats.pending_amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                                icon={Clock}
                                iconColor="#f59e0b"
                                iconBgColor="rgba(245, 158, 11, 0.1)"
                                isLoading={loading}
                            />
                        </div>
                    </div>

                    <div className="admin-listing-toolbar">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 w-100">
                            <div className="d-flex align-items-center gap-3">
                                <div className="d-flex align-items-center gap-2 text-muted small fw-bold text-uppercase">
                                    <Calendar size={14} /> <span>Filter Period:</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
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
                                    {(startDate || endDate) && (
                                        <button className="tj-btn tj-btn-sm tj-btn-outline-danger ms-2" onClick={() => { setStartDate(''); setEndDate(''); }}>
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="d-flex gap-2">
                                <div className="d-flex align-items-center gap-2">
                                    <Filter size={14} className="text-muted" />
                                    <select className="custom-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '160px' }}>
                                        <option value="all">All Payout Status</option>
                                        <option value="pending">Pending Approval</option>
                                        <option value="approved">Approved / Ready</option>
                                        <option value="paid">Settled / Paid</option>
                                        <option value="processing">Processing</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="listing-table-container">
                        <div className="table-responsive">
                            <table className="listing-table">
                                <thead>
                                    <tr>
                                        <th>Business Associate</th>
                                        <th>Amount</th>
                                        <th>Source</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="6" className="text-center py-5 text-muted">Synchronizing commission database...</td></tr>
                                    ) : commissions.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5">
                                                <div className="text-muted mb-2"><Banknote size={40} className="opacity-20" /></div>
                                                <p className="text-muted mb-0">No commission records found matching your filters</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        commissions.map(comm => (
                                            <tr key={comm.id}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="avatar-circle-sm" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }}>
                                                            {comm.marketer_name.charAt(0)}
                                                        </div>
                                                        <div className="d-flex flex-column">
                                                            <div className="fw-semibold text-dark">{comm.marketer_name}</div>
                                                            <div className="text-muted small d-flex align-items-center gap-1">
                                                                <Mail size={10} /> {comm.marketer_email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="fw-bold text-dark d-flex align-items-center gap-1">
                                                        <IndianRupee size={12} className="text-muted" />
                                                        {parseFloat(comm.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-column">
                                                        <div className="fw-medium text-dark d-flex align-items-center gap-1">
                                                            <User size={12} className="text-muted" /> {comm.user_name}
                                                        </div>
                                                        <div className="text-muted small d-flex align-items-center gap-1">
                                                            <Package size={10} /> {comm.plan_name}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-muted small d-flex align-items-center gap-1">
                                                        <Calendar size={12} />
                                                        {new Date(comm.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </div>
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
                                                    <div className="actions-cell justify-content-end">
                                                        {comm.status === 'pending' && (
                                                            <button className="action-btn" onClick={() => handleApprove(comm.id)} title="Approve Commission" style={{ color: '#10b981' }}>
                                                                <Check size={16} />
                                                            </button>
                                                        )}
                                                        {comm.status === 'approved' && (
                                                            <Link to={`/admin/commissions/${comm.id}/pay`} className="action-btn" title="Process Payout" style={{ color: '#6366f1' }}>
                                                                <Banknote size={16} />
                                                            </Link>
                                                        )}
                                                        <Link to={`/admin/commissions/${comm.id}`} className="action-btn" title="View Commission Details">
                                                            <Eye size={16} />
                                                        </Link>
                                                    </div>
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

        </DashboardLayout >
    );
};

export default AdminCommissions;
