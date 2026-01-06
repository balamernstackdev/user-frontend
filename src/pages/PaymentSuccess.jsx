import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout'; // Optional wrapping
import './PaymentSuccess.css';
import StoxzoLogo from '../assets/images/Stoxzo_Logo.svg';

const PaymentSuccess = () => {
    const location = useLocation();
    const { transaction } = location.state || {}; // Expecting transaction object from navigation state

    // If accessed directly without state, show generic message or redirect

    const formatDate = (dateString) => {
        if (!dateString) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <section className="success-section">
            <div className="success-wrapper">
                <div className="success-card">
                    <div className="success-logo">
                        <Link to="/">
                            <img src={StoxzoLogo} alt="Stoxzo Logo" />
                        </Link>
                    </div>

                    <div className="success-icon animate-fade-up">
                        <i className="fas fa-check-circle"></i>
                    </div>

                    <div className="success-title animate-fade-up" style={{ animationDelay: '0.1s' }}>
                        <h2>Payment Successful!</h2>
                        <p>Your payment has been processed successfully. Your subscription is now active.</p>
                    </div>

                    {transaction ? (
                        <div className="success-info animate-fade-up" style={{ animationDelay: '0.2s' }}>
                            <div className="info-row">
                                <span className="info-label">Transaction ID</span>
                                <span className="info-value">{transaction.id || transaction.transaction_id || 'N/A'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Amount Paid</span>
                                <span className="info-value">₹{transaction.amount}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Payment Date</span>
                                <span className="info-value">{formatDate(transaction.created_at)}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Plan</span>
                                <span className="info-value">{transaction.plan_name || 'Subscribed Plan'}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="success-info animate-fade-up" style={{ animationDelay: '0.2s' }}>
                            <p className="text-muted">Transaction details unavailable. Please check your email for confirmation.</p>
                        </div>
                    )}

                    <div className="success-actions animate-fade-up" style={{ animationDelay: '0.3s' }}>
                        <Link to="/dashboard" className="tj-primary-btn">
                            <span className="btn-text"><span>Go to Dashboard</span></span>
                            <span className="btn-icon"><i className="fas fa-arrow-right"></i></span>
                        </Link>
                        <button
                            onClick={async () => {
                                try {
                                    if (!transaction?.id) return;
                                    const blob = await import('../services/payment.service').then(m => m.default.downloadInvoice(transaction.id));
                                    const url = window.URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', `invoice_${transaction.id}.pdf`);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.parentNode.removeChild(link);
                                } catch (err) {
                                    console.error('Download failed', err);
                                    // You might want to import toast globally or pass it
                                }
                            }}
                            className="tj-primary-btn transparent-btn"
                        >
                            <span className="btn-text"><span>Download Invoice</span></span>
                            <span className="btn-icon"><i className="fas fa-file-invoice"></i></span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PaymentSuccess;
