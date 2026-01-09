import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import paymentService from '../services/payment.service';
import { authService } from '../services/auth.service';
import { useSettings } from '../context/SettingsContext';
import './styles/Invoice.css';
import { toast } from 'react-toastify';

// Import logo directly if needed, or use the path
import logoUrl from '../assets/images/Stoxzo_Logo.svg';

const Invoice = () => {
    const { settings } = useSettings();
    const location = useLocation();
    const { transactionId } = useParams();
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = authService.getUser();

    useEffect(() => {
        fetchTransactionDetails();
    }, [transactionId]);

    const fetchTransactionDetails = async () => {
        try {
            setLoading(true);
            const response = await paymentService.getTransaction(transactionId);
            setTransaction(response.data);
        } catch (err) {
            console.error('Error fetching invoice:', err);
            toast.error('Failed to load invoice details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Set document title for PDF filename
    useEffect(() => {
        if (transaction) {
            const invoiceNo = `INV-${transaction.id.slice(0, 8).toUpperCase()}`;
            const date = new Date().toISOString().split('T')[0];
            const originalTitle = document.title;
            document.title = `${invoiceNo}_${date}`;

            return () => {
                document.title = originalTitle;
            };
        }
    }, [transaction]);

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!transaction) {
        return (
            <DashboardLayout>
                <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>
                    <div style={{ padding: '40px', background: '#f8f9fa', borderRadius: '8px', maxWidth: '600px', margin: '0 auto' }}>
                        <i className="fas fa-file-invoice" style={{ fontSize: '48px', color: '#dc3545', marginBottom: '20px' }}></i>
                        <h3>Invoice Not Found</h3>
                        <p className="text-muted">The invoice you are looking for does not exist or you do not have permission to view it.</p>
                        <Link to="/payments" className="tj-primary-btn" style={{ marginTop: '20px' }}>
                            <span className="btn-text"><span>Back to Payments</span></span>
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Helper to determine status class
    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'success': return 'status-paid';
            case 'paid': return 'status-paid';
            case 'pending': return 'status-pending';
            case 'failed': return 'status-failed';
            default: return '';
        }
    };

    // Calculate tax/total (Amount INCLUDES tax - extract base and tax)
    const totalAmount = Number(transaction.amount); // This is the final total WITH tax
    const taxRate = Number(settings.tax_rate) || 0;

    let baseAmount = totalAmount;
    let tax = 0;

    if (taxRate > 0) {
        // Extract base amount from total (reverse calculation)
        baseAmount = totalAmount / (1 + (taxRate / 100));
        tax = totalAmount - baseAmount;
    }

    const finalTotal = totalAmount; // Use the actual transaction amount as total

    return (
        <DashboardLayout>
            <section className="page-section">
                <div className="container">
                    <div className="invoice-card animate-fade-up">
                        {/* ... existing header ... */}
                        {/* ... existing details ... */}

                        <div className="invoice-header">
                            <div className="invoice-info">
                                <h2>Invoice</h2>
                                <p><strong>Invoice #:</strong> INV-{transaction.id.slice(0, 8).toUpperCase()}</p>
                                <p><strong>Date:</strong> {formatDate(transaction.created_at)}</p>
                                <p><strong>Transaction ID:</strong> {transaction.razorpay_payment_id || 'N/A'}</p>
                            </div>
                            <div className="invoice-info" style={{ textAlign: 'right' }}>
                                <img src={logoUrl} alt="Stoxzo" style={{ maxWidth: '150px', marginBottom: '15px' }} />
                                <p><strong>{settings.site_name}</strong></p>
                                <p>{settings.office_address}</p>
                                <p>{settings.support_email}</p>
                            </div>
                        </div>

                        <div className="invoice-details">
                            <div className="detail-section">
                                <h4>Bill To:</h4>
                                <p><strong>{transaction.user_name || user.name || 'Valued Customer'}</strong></p>
                                <p>{transaction.user_email || user.email}</p>
                            </div>
                            <div className="detail-section">
                                <h4>Payment Details:</h4>
                                <p><strong>Payment Method:</strong> {transaction.payment_method || 'Online Payment'}</p>
                                <p className="status-row"><strong>Status:</strong> <span className={getStatusClass(transaction.status)}>{transaction.status?.toUpperCase()}</span></p>
                                {transaction.payment_date && (
                                    <p><strong>Paid On:</strong> {formatDate(transaction.payment_date)}</p>
                                )}
                            </div>
                        </div>

                        <table className="invoice-table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Quantity</th>
                                    <th style={{ textAlign: 'right' }}>Unit Price</th>
                                    <th style={{ textAlign: 'right' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        {transaction.plan_name || 'Subscription Plan'}
                                        {transaction.plan_type && ` - ${transaction.plan_type.charAt(0).toUpperCase() + transaction.plan_type.slice(1)}`}
                                    </td>
                                    <td>1</td>
                                    <td style={{ textAlign: 'right' }}>₹{baseAmount?.toFixed(2)}</td>
                                    <td style={{ textAlign: 'right' }}>₹{baseAmount?.toFixed(2)}</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Subtotal (Taxable):</td>
                                    <td style={{ textAlign: 'right' }}>₹{baseAmount?.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Tax ({taxRate}%):</td>
                                    <td style={{ textAlign: 'right' }}>₹{tax.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '18px', color: 'var(--tj-color-heading-primary)' }}>Total:</td>
                                    <td style={{ textAlign: 'right', fontSize: '18px', fontWeight: 'bold', color: 'var(--tj-color-heading-primary)' }}>₹{finalTotal?.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>

                        <div className="invoice-actions">
                            <button onClick={handlePrint} className="tj-primary-btn">
                                <span className="btn-text"><span>Print Invoice</span></span>
                                <span className="btn-icon"><i className="fas fa-print"></i></span>
                            </button>

                            <Link to="/payments" className="tj-primary-btn transparent-btn">
                                <span className="btn-text"><span>Back to Payments</span></span>
                                <span className="btn-icon"><i className="fas fa-arrow-left"></i></span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default Invoice;
