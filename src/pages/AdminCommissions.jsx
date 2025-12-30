import { useState, useEffect } from 'react';
import commissionService from '../services/commission.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import './AdminListings.css';

const AdminCommissions = () => {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending'); // pending, approved, paid
    const [pagination, setPagination] = useState({ page: 1, limit: 20 });

    const fetchCommissions = async () => {
        setLoading(true);
        try {
            const params = {
                status: statusFilter,
                limit: pagination.limit,
                offset: (pagination.page - 1) * pagination.limit
            };
            const response = await commissionService.getAllCommissions(params);
            setCommissions(response.data);
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
                alert('Commission approved');
            } catch (error) {
                console.error('Error approving commission:', error);
                alert('Failed to approve commission');
            }
        }
    };

    const handlePay = async (id) => {
        if (window.confirm('Mark this commission as paid?')) {
            try {
                await commissionService.markAsPaid(id);
                fetchCommissions();
                alert('Commission marked as paid');
            } catch (error) {
                console.error('Error paying commission:', error);
                alert('Failed to mark as paid');
            }
        }
    };

    return (
        <DashboardLayout>
            <div className="admin-listing-page animate-fade-up">
                <div className="container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Commission Payouts</h1>
                            <p style={{ color: '#6c757d' }}>Manage and process marketer commissions</p>
                        </div>
                        <div className="header-actions">
                            <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '200px' }}>
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="paid">Paid</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <div className="listing-table-container">
                        <table className="listing-table">
                            <thead>
                                <tr>
                                    <th>Marketer</th>
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
                                            <td>{comm.source_type}</td>
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
                                                            <i className="fa-light fa-check"></i>
                                                        </button>
                                                    )}
                                                    {comm.status === 'approved' && (
                                                        <button className="action-btn" onClick={() => handlePay(comm.id)} title="Mark Paid" style={{ color: '#28a745', borderColor: '#28a745' }}>
                                                            <i className="fa-light fa-money-bill-wave"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminCommissions;
