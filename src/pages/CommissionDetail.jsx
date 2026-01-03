import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CommissionService from '../services/commission.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import { authService } from '../services/auth.service';
import './CommissionDetail.css';
import { toast } from 'react-toastify';

const CommissionDetail = () => {
    const { id } = useParams();
    const user = authService.getUser();
    const isAdmin = user?.role === 'admin';
    const [commission, setCommission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchCommission = async () => {
        try {
            setLoading(true);
            const response = await CommissionService.getCommission(id);
            setCommission(response.data);
        } catch (err) {
            console.error("Failed to fetch commission:", err);
            setError('Failed to load commission details. It may not exist or you do not have permission.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchCommission();
        }
    }, [id]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { class: 'badge-warning', label: 'Pending' },
            approved: { class: 'badge-success', label: 'Approved' },
            paid: { class: 'badge-info', label: 'Paid' },
            rejected: { class: 'badge-error', label: 'Rejected' }
        };
        return badges[status] || badges.pending;
    };

    const handleApprove = async () => {
        if (window.confirm('Approve this commission?')) {
            try {
                setIsProcessing(true);
                await CommissionService.approveCommission(id);
                await fetchCommission();
                toast.success('Commission approved');
            } catch (err) {
                console.error('Error approving commission:', err);
                toast.error('Failed to approve commission');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="loading-container">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !commission) {
        return (
            <DashboardLayout>
                <div className="container py-5 text-center">
                    <div className="error-state">
                        <i className="fas fa-exclamation-circle text-danger" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
                        <h3>Error Loading Details</h3>
                        <p className="text-muted">{error || 'Commission not found'}</p>
                        <Link to={isAdmin ? "/admin/commissions" : "/business-associate/commissions"} className="tj-primary-btn mt-3">
                            <span className="btn-text"><span>Back to Commissions</span></span>
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const statusBadge = getStatusBadge(commission.status);

    return (
        <DashboardLayout>
            <section className="page-section">
                <div className="container">
                    <div className="detail-header animate-fade-up">
                        <Link to={isAdmin ? "/admin/commissions" : "/business-associate/commissions"} className="back-link">
                            <i className="fas fa-arrow-left"></i> Back to Commissions
                        </Link>
                        <div className="header-content">
                            <h2 className="page-title">Commission Details</h2>
                            <div className="d-flex align-items-center gap-2">
                                <span className={`status-badge ${statusBadge.class}`}>{statusBadge.label}</span>
                                {isAdmin && commission.status === 'pending' && (
                                    <button className="tj-primary-btn btn-sm" onClick={handleApprove} disabled={isProcessing}>
                                        <span className="btn-text"><span>Approve</span></span>
                                    </button>
                                )}
                                {isAdmin && commission.status === 'approved' && (
                                    <Link to={`/admin/commissions/${id}/pay`} className="tj-primary-btn btn-sm" style={{ backgroundColor: '#28a745', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                                        <span className="btn-text"><span>Mark Paid</span></span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="row g-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                        {/* Main Info Card */}
                        <div className="col-lg-8">
                            <div className="detail-card">
                                <div className="card-header-custom">
                                    <h4 className="card-title">Earning Information</h4>
                                </div>
                                <div className="card-body-custom">
                                    {/* Top Row: Amount & Rate */}
                                    <div className="detail-grid-3 mb-4">
                                        <div className="detail-group">
                                            <label>Amount Earned</label>
                                            <div className="detail-value amount" style={{ color: 'var(--success)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                                ₹{Number(commission.amount).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="detail-group">
                                            <label>Commission Rate</label>
                                            <div className="detail-value">{commission.commission_rate}%</div>
                                        </div>
                                    </div>

                                    <div className="divider"></div>

                                    {/* Bottom Row: Dates & ID */}
                                    <div className="detail-grid-3">
                                        <div className="detail-group">
                                            <label>Earned Date</label>
                                            <div className="detail-value">{formatDate(commission.created_at)}</div>
                                        </div>
                                        <div className="detail-group">
                                            <label>Paid Date</label>
                                            <div className="detail-value">{formatDate(commission.paid_at)}</div>
                                        </div>
                                        <div className="detail-group">
                                            <label>Commission ID</label>
                                            <div className="detail-value mono">{commission.id}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Marketer Details (Admin Only) */}
                            {isAdmin && (
                                <div className="detail-card mt-4">
                                    <div className="card-header-custom d-flex justify-content-between align-items-center">
                                        <h4 className="card-title">Business Associate Payout Information</h4>
                                    </div>
                                    <div className="card-body-custom">
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="text-muted small">Business Associate Name</label>
                                                <div className="fw-bold">{commission.marketer_name}</div>
                                                <div className="text-muted small">{commission.marketer_email}</div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                {commission.marketer_bank_name ? (
                                                    <>
                                                        <label className="text-muted small">Bank Details</label>
                                                        <div className="small">
                                                            <div><strong>Bank:</strong> {commission.marketer_bank_name}</div>
                                                            <div><strong>A/C No:</strong> {commission.marketer_account_number}</div>
                                                            <div><strong>IFSC:</strong> {commission.marketer_ifsc_code}</div>
                                                            <div><strong>Holder:</strong> {commission.marketer_account_holder}</div>
                                                            {commission.marketer_upi_id && <div><strong>UPI ID:</strong> {commission.marketer_upi_id}</div>}
                                                        </div>
                                                    </>
                                                ) : commission.marketer_upi_id ? (
                                                    <>
                                                        <label className="text-muted small">UPI Detail</label>
                                                        <div className="fw-bold">{commission.marketer_upi_id}</div>
                                                    </>
                                                ) : (
                                                    <div className="text-danger small">
                                                        <i className="fas fa-exclamation-triangle me-1"></i>
                                                        No payout details provided by marketer.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Transaction Details */}
                            <div className="detail-card mt-4">
                                <div className="card-header-custom">
                                    <h4 className="card-title">Transaction Details</h4>
                                </div>
                                <div className="card-body-custom">
                                    <div className="detail-grid-3">
                                        <div className="detail-group">
                                            <label>Customer Name</label>
                                            <div className="detail-value">{commission.user_name}</div>
                                        </div>
                                        <div className="detail-group">
                                            <label>Plan Purchased</label>
                                            <div className="detail-value">{commission.plan_name || 'N/A'}</div>
                                        </div>
                                        <div className="detail-group">
                                            <label>Transaction Amount</label>
                                            <div className="detail-value">₹{Number(commission.transaction_amount || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="detail-group">
                                            <label>Payment Method</label>
                                            <div className="detail-value text-capitalize">{commission.payment_method || 'Online'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div className="col-lg-4">
                            <div className="detail-card">
                                <div className="card-header-custom">
                                    <h4 className="card-title">Help & Support</h4>
                                </div>
                                <div className="card-body-custom">
                                    <p className="sidebar-text">
                                        If you have questions about this commission or believe there is a discrepancy, please contact support with the Commission ID.
                                    </p>
                                    <Link to="/tickets/create" className="tj-primary-btn w-100">
                                        <span className="btn-text"><span>Contact Support</span></span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default CommissionDetail;
