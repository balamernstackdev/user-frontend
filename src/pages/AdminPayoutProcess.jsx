import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import commissionService from '../services/commission.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import { ArrowLeft, Landmark, Wallet, CheckCircle, AlertCircle, Info, Send, Calendar, User, FileText, ChevronRight } from 'lucide-react';
import './styles/AdminListings.css';

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
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
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
                    <div className="error-state p-5 bg-white rounded-4 shadow-sm">
                        <AlertCircle size={64} className="text-danger mb-4" />
                        <h3 className="fw-bold">Error Loading Details</h3>
                        <p className="text-muted">{error || 'The requested commission record could not be found.'}</p>
                        <Link to="/admin/commissions" className="tj-btn tj-btn-primary mt-4">
                            <ArrowLeft size={18} className="me-2" /> Back to List
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
                    <div className="success-state p-5 bg-white rounded-4 shadow-sm">
                        <CheckCircle size={64} className="text-success mb-4" />
                        <h3 className="fw-bold text-dark">Already Processed</h3>
                        <p className="text-muted">This commission has already been paid out and marked as complete.</p>
                        <Link to="/admin/commissions" className="tj-btn tj-btn-primary mt-4">
                            <ArrowLeft size={18} className="me-2" /> View Commissions
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="admin-listing-page animate-fade-up">
                <div className="admin-container">
                    <div className="admin-listing-header mb-4">
                        <div className="header-title">
                            <Link to="/admin/commissions" className="text-decoration-none text-muted small mb-3 d-flex align-items-center gap-1 hover-primary-text">
                                <ArrowLeft size={14} /> Back to Commissions
                            </Link>
                            <h1>Process Payout</h1>
                            <p className="text-muted mb-0">Record transaction details for Associate commission</p>
                        </div>
                    </div>

                    <div className="row g-4">
                        <div className="col-lg-7">
                            <div className="listing-table-container p-4">
                                <div className="d-flex align-items-center gap-2 mb-4">
                                    <Info size={20} className="text-primary" />
                                    <h4 className="fw-bold mb-0">Payout Recipient</h4>
                                </div>

                                <div className="row mb-5 g-4">
                                    <div className="col-md-6 border-end">
                                        <label className="text-muted small text-uppercase fw-bold mb-2 d-block letter-spacing-1">Business Associate</label>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="avatar-circle" style={{ background: '#f8fafc', color: '#64748b', fontSize: '1.2rem' }}>
                                                {commission.marketer_name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="h5 fw-bold mb-1 text-dark">{commission.marketer_name}</div>
                                                <div className="text-muted small">{commission.marketer_email}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 ps-md-4">
                                        <label className="text-muted small text-uppercase fw-bold mb-2 d-block letter-spacing-1">Amount to Transfer</label>
                                        <div className="h2 fw-bold text-success mb-0 d-flex align-items-center gap-1">
                                            <span className="fs-4">₹</span>{Number(commission.amount).toLocaleString()}
                                        </div>
                                        <div className="text-muted small">Generated on {new Date(commission.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-4 border-0 bg-light-soft" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                    <div className="d-flex align-items-center gap-2 mb-4 pb-2 border-bottom">
                                        <Landmark size={18} className="text-primary" />
                                        <h6 className="fw-bold mb-0">Bank & Payment Details</h6>
                                    </div>
                                    {commission.marketer_bank_name ? (
                                        <div className="row g-4">
                                            <div className="col-sm-6">
                                                <label className="text-muted small d-block mb-1">Bank Institution</label>
                                                <span className="fw-bold text-dark">{commission.marketer_bank_name}</span>
                                            </div>
                                            <div className="col-sm-6">
                                                <label className="text-muted small d-block mb-1">Beneficiary Name</label>
                                                <span className="fw-bold text-dark">{commission.marketer_account_holder}</span>
                                            </div>
                                            <div className="col-sm-6">
                                                <label className="text-muted small d-block mb-1">Account Number</label>
                                                <span className="fw-bold text-dark font-monospace">{commission.marketer_account_number}</span>
                                            </div>
                                            <div className="col-sm-6">
                                                <label className="text-muted small d-block mb-1">IFSC Routing Code</label>
                                                <span className="fw-bold text-dark font-monospace">{commission.marketer_ifsc_code}</span>
                                            </div>
                                            {commission.marketer_upi_id && (
                                                <div className="col-12 mt-4 pt-3 border-top">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <Wallet size={16} className="text-primary" />
                                                        <label className="text-muted small mb-0">Alternative UPI ID</label>
                                                    </div>
                                                    <span className="fw-bold text-primary d-block mt-1 font-monospace">{commission.marketer_upi_id}</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : commission.marketer_upi_id ? (
                                        <div className="col-12">
                                            <label className="text-muted small d-block mb-1">Primary UPI ID</label>
                                            <span className="fw-bold text-primary h5 mb-0 font-monospace">{commission.marketer_upi_id}</span>
                                        </div>
                                    ) : (
                                        <div className="alert alert-warning border-0 rounded-4 mb-0 d-flex align-items-center gap-3">
                                            <AlertCircle size={20} />
                                            <div>
                                                <div className="fw-bold small">Missing Details</div>
                                                <div className="small">Associate has not provided payout destinations yet.</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-5 pt-4 border-top">
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <FileText size={16} className="text-muted" />
                                        <label className="text-muted small text-uppercase fw-bold mb-0 letter-spacing-1">Related Sale Instance</label>
                                    </div>
                                    <div className="bg-white p-3 rounded-4 border">
                                        <div className="row align-items-center g-2">
                                            <div className="col-sm-4 d-flex align-items-center gap-2">
                                                <User size={14} className="text-muted" />
                                                <span className="small">User: <strong className="text-dark">{commission.user_name}</strong></span>
                                            </div>
                                            <div className="col-sm-4 d-flex align-items-center gap-2">
                                                <Info size={14} className="text-muted" />
                                                <span className="small">Plan: <strong className="text-dark">{commission.plan_name}</strong></span>
                                            </div>
                                            <div className="col-sm-4 d-flex align-items-center gap-2">
                                                <Calendar size={14} className="text-muted" />
                                                <span className="small">Date: <strong className="text-dark">{new Date(commission.created_at).toLocaleDateString()}</strong></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-5">
                            <div className="listing-table-container p-4">
                                <div className="d-flex align-items-center gap-2 mb-4">
                                    <Send size={20} className="text-primary" />
                                    <h4 className="fw-bold mb-0">Complete Transfer</h4>
                                </div>
                                <form onSubmit={handlePaySubmit}>
                                    <div className="mb-4">
                                        <label className="form-label fw-bold small text-muted text-uppercase mb-2">Transaction Reference <span className="text-danger">*</span></label>
                                        <div className="position-relative">
                                            <input
                                                type="text"
                                                className="form-control ps-4"
                                                style={{ height: '54px', borderRadius: '12px' }}
                                                required
                                                value={payoutForm.transactionId}
                                                onChange={(e) => setPayoutForm({ ...payoutForm, transactionId: e.target.value })}
                                                placeholder="Enter Payout ID or Ref #"
                                            />
                                        </div>
                                        <div className="form-text small mt-2 d-flex align-items-start gap-2">
                                            <Info size={14} className="mt-0.5 text-muted" />
                                            <span>Enter the payment gateway Ref ID or Bank reference number for internal tracking.</span>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-bold small text-muted text-uppercase mb-2">Transfer Date</label>
                                        <div className="position-relative">
                                            <input
                                                type="date"
                                                className="form-control ps-4"
                                                style={{ height: '54px', borderRadius: '12px' }}
                                                value={payoutForm.paymentDate}
                                                onChange={(e) => setPayoutForm({ ...payoutForm, paymentDate: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="alert alert-info border-0 rounded-4 small p-3 mb-5 d-flex align-items-start gap-2">
                                        <Info size={18} className="mt-0.5 flex-shrink-0" />
                                        <span>Confirming this payout will immediately update the associate's ledger and send an automated email notification.</span>
                                    </div>

                                    <button
                                        type="submit"
                                        className="tj-btn tj-btn-primary w-100 py-3 mb-3 d-flex align-items-center justify-content-center gap-2"
                                        disabled={isSubmitting || (!commission.marketer_bank_name && !commission.marketer_upi_id)}
                                        style={{ height: '56px', borderRadius: '12px', fontSize: '1.1rem' }}
                                    >
                                        {isSubmitting ? (
                                            <><span className="spinner-border spinner-border-sm"></span> Processing...</>
                                        ) : (
                                            <><CheckCircle size={20} /> Confirm ₹{Number(commission.amount).toLocaleString()} Payout</>
                                        )}
                                    </button>

                                    <Link to="/admin/commissions" className="tj-btn tj-btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2" style={{ height: '56px', borderRadius: '12px' }}>
                                        Discard Changes
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
