import { useState, useEffect } from 'react';
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
                        <div className="header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div className="btn-group" style={{ position: 'relative' }}>
                                <button
                                    className="tj-btn tj-btn-primary"
                                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                                    style={{ backgroundColor: '#13689e', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', height: '38px', borderRadius: '50px', padding: '0 20px' }}
                                >
                                    <i className="fas fa-file-export"></i>
                                    <span className="btn-text">Export Options</span>
                                </button>
                                {showExportDropdown && (
                                    <ul className="dropdown-menu show" style={{
                                        display: 'block',
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        zIndex: 1000,
                                        minWidth: '200px',
                                        padding: '8px 0',
                                        margin: '5px 0 0',
                                        fontSize: '14px',
                                        backgroundColor: '#fff',
                                        border: '1px solid rgba(0,0,0,.1)',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                    }}>

                                        <div style={{ height: '1px', backgroundColor: '#edf2f7', margin: '4px 0' }}></div>
                                        <li>
                                            <button
                                                className="dropdown-item"
                                                onClick={() => { handleGeneralExport('csv'); setShowExportDropdown(false); }}
                                                style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 20px', fontWeight: 400, color: '#475569', backgroundColor: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <i className="fas fa-file-csv" style={{ fontSize: '14px' }}></i>
                                                <span>Download All (CSV)</span>
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                className="dropdown-item"
                                                onClick={() => { handleGeneralExport('pdf'); setShowExportDropdown(false); }}
                                                style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 20px', fontWeight: 400, color: '#475569', backgroundColor: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <i className="fas fa-file-pdf" style={{ fontSize: '14px' }}></i>
                                                <span>Download All (PDF)</span>
                                            </button>
                                        </li>
                                    </ul>
                                )}
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    title="From Date"
                                    style={{ width: '120px', height: '38px', padding: '0 12px', fontSize: '13px', borderRadius: '50px', border: '1px solid #e2e8f0' }}
                                />
                                <span className="text-muted small">to</span>
                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    title="To Date"
                                    style={{ width: '120px', height: '38px', padding: '0 12px', fontSize: '13px', borderRadius: '50px', border: '1px solid #e2e8f0' }}
                                />
                                {(startDate || endDate) && (
                                    <button
                                        className="btn btn-sm btn-link text-danger p-0 ms-1"
                                        onClick={() => { setStartDate(''); setEndDate(''); }}
                                        title="Clear Dates"
                                    >
                                        <i className="fas fa-times-circle"></i>
                                    </button>
                                )}
                            </div>

                            <div className="filter-group">
                                <select
                                    className="custom-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    style={{ width: '160px', borderRadius: '50px' }}
                                >
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="paid">Paid</option>
                                    <option value="rejected">Rejected</option>
                                </select>
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
