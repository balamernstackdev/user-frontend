import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import commissionService from '../services/commission.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import Pagination from '../components/common/Pagination';
import SEO from '../components/common/SEO';
import './AdminListings.css';
import { toast } from 'react-toastify';

const AdminCommissions = () => {
    const [searchParams] = useSearchParams();
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'pending');
    const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0 });

    const fetchCommissions = async () => {
        setLoading(true);
        try {
            const params = {
                status: statusFilter,
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
    }, [pagination.page, statusFilter]);

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

    const handleExport = () => {
        const approvedCommissions = commissions.filter(c => c.status === 'approved');
        if (approvedCommissions.length === 0) {
            toast.warn('No approved commissions to export. Please filter by "Approved" or ensure there are approved records.');
            return;
        }

        const headers = [
            'Business Associate Name', 'Business Associate Email', 'Amount', 'Bank Name', 'Account Number',
            'IFSC Code', 'Holder Name', 'UPI ID', 'Earned Date'
        ];

        const csvRows = approvedCommissions.map(c => [
            `"${c.marketer_name}"`, `"${c.marketer_email}"`, c.amount, `"${c.marketer_bank_name || ''}"`,
            `"${c.marketer_account_number || ''}"`, `"${c.marketer_ifsc_code || ''}"`,
            `"${c.marketer_account_holder || ''}"`, `"${c.marketer_upi_id || ''}"`,
            `"${new Date(c.created_at).toLocaleDateString()}"`
        ]);

        const csvContent = [headers, ...csvRows].map(e => e.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `payouts_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
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
                            <button className="tj-btn tj-btn-primary tj-btn-sm add-btn" onClick={handleExport} style={{ backgroundColor: '#13689e', color: 'white' }}>
                                <span className="btn-text"><span>Export for Payout</span></span>
                            </button>
                            <div className="filter-group">
                                <select
                                    className="custom-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    style={{ width: '200px' }}
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
