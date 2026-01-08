import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import commissionService from '../services/commission.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import Pagination from '../components/common/Pagination';
import SEO from '../components/common/SEO';
import './AdminListings.css';
import { toast } from 'react-toastify';
import { adminService } from '../services/admin.service';

const AdminCommissions = () => {
    const [searchParams] = useSearchParams();
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'pending');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
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
                <div className="container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Commission Payouts</h1>
                            <p style={{ color: '#6c757d' }}>Manage and process business associate commissions</p>
                        </div>
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
                                <select
                                    className="form-select form-select-sm"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    style={{ borderRadius: '6px', borderColor: '#e2e8f0', minWidth: '130px', height: '38px' }}
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="processing">Processing</option>
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
                                                    onClick={() => { handleGeneralExport('csv'); setShowExportDropdown(false); }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', transition: 'all 0.2s' }}
                                                >
                                                    <i className="fas fa-file-csv text-primary" style={{ fontSize: '18px' }}></i>
                                                    <span>Download CSV</span>
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className="dropdown-item rounded-2"
                                                    onClick={() => { handleGeneralExport('pdf'); setShowExportDropdown(false); }}
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
                                    <th>Business Associate</th>
                                    <th>Amount</th>
                                    <th>Source</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center">Loading...</td></tr>
                                ) : commissions.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center" style={{ padding: '50px' }}>No commissions found</td></tr>
                                ) : (
                                    commissions.map(comm => (
                                        <tr key={comm.id}>
                                            <td>
                                                <div className="plan-info-cell">
                                                    <span className="plan-name-text">{comm.marketer_name}</span>
                                                    <span className="plan-slug-text">{comm.marketer_email}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="plan-price-text">₹{comm.amount}</span>
                                            </td>
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <span style={{ fontWeight: 500 }}>{comm.user_name}</span>
                                                    <span style={{ fontSize: '12px', color: '#6c757d' }}>{comm.plan_name}</span>
                                                </div>
                                            </td>
                                            <td>{new Date(comm.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`plan-type-badge`} style={{
                                                    background: comm.status === 'paid' ? '#e8f5e9' : comm.status === 'approved' ? '#e3f2fd' : comm.status === 'pending' ? '#fff3e0' : '#ffebee',
                                                    color: comm.status === 'paid' ? '#2e7d32' : comm.status === 'approved' ? '#1565c0' : comm.status === 'pending' ? '#ff9800' : '#c62828'
                                                }}>
                                                    {comm.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="actions-cell">
                                                    {comm.status === 'pending' && (
                                                        <button className="action-btn" onClick={() => handleApprove(comm.id)} title="Approve" style={{ color: '#28a745', borderColor: '#28a745' }}>
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                    )}
                                                    {comm.status === 'approved' && (
                                                        <Link to={`/admin/commissions/${comm.id}/pay`} className="action-btn" title="Mark Paid" style={{ color: '#28a745', borderColor: '#28a745' }}>
                                                            <i className="fas fa-money-bill-wave"></i>
                                                        </Link>
                                                    )}
                                                    {/* Always allow viewing details */}
                                                    <Link to={`/admin/commissions/${comm.id}`} className="action-btn" title="View Details" style={{ color: '#007bff', borderColor: '#007bff' }}>
                                                        <i className="fas fa-eye"></i>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {commissions.length > 0 && (
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

        </DashboardLayout >
    );
};

export default AdminCommissions;
