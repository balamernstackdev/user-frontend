import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import commissionService from '../services/commission.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import './AdminListings.css';
import { toast } from 'react-toastify';

const AdminPayoutProcess = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [commission, setCommission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [payoutForm, setPayoutForm] = useState({
        transactionId: '',
        paymentDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const fetchCommission = async () => {
            try {
                setLoading(true);
                const response = await commissionService.getCommission(id);
                setCommission(response.data);
            } catch (err) {
                console.error("Failed to fetch commission:", err);
                setError('Failed to load commission details. It may not exist or you do not have permission.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCommission();
        }
    }, [id]);

    const handlePaySubmit = async (e) => {
        e.preventDefault();

        // Validation: Check if marketer has provided bank details or UPI ID
        const hasBankDetails = commission.marketer_bank_name && commission.marketer_account_number;
        const hasUpiDetails = commission.marketer_upi_id;

        if (!hasBankDetails && !hasUpiDetails) {
            toast.error('Cannot process payout. Business Associate has not provided valid bank details or UPI ID.');
            return;
        }

        try {
            setIsSubmitting(true);
            await commissionService.markAsPaid(id, {
                payoutReference: payoutForm.transactionId
            });
            toast.success('Commission marked as paid successfully');
            navigate('/admin/commissions');
        } catch (err) {
            console.error('Error paying commission:', err);
            toast.error('Failed to mark as paid. Check console for details.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="container py-5 text-center">
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
                        <i className="fas fa-exclamation-circle text-danger h1 mb-3"></i>
                        <h3>Error Loading Details</h3>
                        <p className="text-muted">{error || 'Commission not found'}</p>
                        <Link to="/admin/commissions" className="tj-btn tj-btn-primary mt-3">
                            <span className="btn-text"><span>Back to Commissions</span></span>
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Safety check for status
    if (commission.status === 'paid') {
        return (
            <DashboardLayout>
                <div className="container py-5 text-center">
                    <div className="success-state">
                        <i className="fas fa-check-circle text-success h1 mb-3"></i>
                        <h3>Already Paid</h3>
                        <p className="text-muted">This commission has already been marked as paid.</p>
                        <Link to="/admin/commissions" className="tj-btn tj-btn-primary mt-3">
                            <span className="btn-text"><span>Back to Commissions</span></span>
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="admin-listing-page animate-fade-up">
                <div className="container">
                    <div className="admin-listing-header mb-4">
                        <div className="header-title">
                            <Link to="/admin/commissions" className="text-decoration-none text-muted small mb-2 d-inline-block">
                                <i className="fas fa-arrow-left me-1"></i> Back to Commissions
                            </Link>
                            <h1>Process Payout</h1>
                            <p className="text-muted">Record transaction details for marketer commission</p>
                        </div>
                    </div>

                    <div className="row g-4">
                        <div className="col-lg-7">
                            <div className="listing-table-container">
                                <h4 className="mb-4">Payout Information</h4>

                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <label className="text-muted small">Business Associate Name</label>
                                        <div className="h5">{commission.marketer_name}</div>
                                        <div className="text-muted small">{commission.marketer_email}</div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="text-muted small">Payout Amount</label>
                                        <div className="h5 text-success">₹{Number(commission.amount).toLocaleString()}</div>
                                    </div>
                                </div>

                                <div className="p-4 rounded border bg-light">
                                    <h6 className="border-bottom pb-2 mb-3">Bank / UPI Details</h6>
                                    {commission.marketer_bank_name ? (
                                        <div className="row g-3">
                                            <div className="col-sm-6">
                                                <label className="text-muted small d-block">Bank Name</label>
                                                <span className="fw-bold">{commission.marketer_bank_name}</span>
                                            </div>
                                            <div className="col-sm-6">
                                                <label className="text-muted small d-block">Account Holder</label>
                                                <span className="fw-bold">{commission.marketer_account_holder}</span>
                                            </div>
                                            <div className="col-sm-6">
                                                <label className="text-muted small d-block">Account Number</label>
                                                <span className="fw-bold">{commission.marketer_account_number}</span>
                                            </div>
                                            <div className="col-sm-6">
                                                <label className="text-muted small d-block">IFSC Code</label>
                                                <span className="fw-bold">{commission.marketer_ifsc_code}</span>
                                            </div>
                                            {commission.marketer_upi_id && (
                                                <div className="col-12 mt-2">
                                                    <label className="text-muted small d-block">UPI ID</label>
                                                    <span className="fw-bold text-primary">{commission.marketer_upi_id}</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : commission.marketer_upi_id ? (
                                        <div className="col-12">
                                            <label className="text-muted small d-block">UPI ID</label>
                                            <span className="fw-bold text-primary h5">{commission.marketer_upi_id}</span>
                                        </div>
                                    ) : (
                                        <div className="alert alert-warning mb-0">
                                            <i className="fas fa-exclamation-triangle me-2"></i>
                                            Business Associate has not provided payout details yet.
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 pt-3 border-top">
                                    <label className="text-muted small">Commission for Transaction</label>
                                    <div className="small">
                                        User: <strong>{commission.user_name}</strong> |
                                        Plan: <strong>{commission.plan_name}</strong> |
                                        Date: <strong>{new Date(commission.created_at).toLocaleDateString()}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-5">
                            <div className="listing-table-container">
                                <h4 className="mb-4">Record Payment</h4>
                                <form onSubmit={handlePaySubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Transaction Reference / Reference ID <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            required
                                            value={payoutForm.transactionId}
                                            onChange={(e) => setPayoutForm({ ...payoutForm, transactionId: e.target.value })}
                                            placeholder="e.g. pay_Nabc123 or Bank Ref #"
                                        />
                                        <div className="form-text small">Enter the Razorpay Payout ID or Bank Transaction ID.</div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label">Payment Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={payoutForm.paymentDate}
                                            onChange={(e) => setPayoutForm({ ...payoutForm, paymentDate: e.target.value })}
                                        />
                                    </div>

                                    <div className="alert alert-info small mb-4">
                                        <i className="fas fa-info-circle me-1"></i>
                                        Marking this as paid will update the commission status and notify the marketer.
                                    </div>

                                    <button
                                        type="submit"
                                        className="tj-btn tj-btn-primary w-100 py-3"
                                        disabled={isSubmitting || (!commission.marketer_bank_name && !commission.marketer_upi_id)}
                                    >
                                        <span className="btn-text">
                                            <span>
                                                {isSubmitting ? 'Processing...' : `Confirm ₹${Number(commission.amount).toLocaleString()} Payout`}
                                            </span>
                                        </span>
                                    </button>

                                    <Link to="/admin/commissions" className="tj-btn tj-btn-secondary w-100 mt-3 border">
                                        Cancel
                                    </Link>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminPayoutProcess;
