import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import paymentService from '../services/payment.service';
import { authService } from '../services/auth.service';
import './Invoice.css';

// Import logo directly if needed, or use the path
import logoUrl from '../assets/images/Stoxzo_Logo.svg';

const Invoice = () => {
    const { transactionId } = useParams();
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
            setError('Failed to load invoice details. Please try again.');
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

    if (error || !transaction) {
        return (
            <DashboardLayout>
                <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>
                    <div className="alert alert-error" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        {error || 'Invoice not found'}
                    </div>
                    <Link to="/payments" className="tj-primary-btn" style={{ marginTop: '20px' }}>
                        <span className="btn-text"><span>Back to Payments</span></span>
                    </Link>
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

    // Calculate tax/total if needed (assuming amount includes tax for now or 0 tax)
    const subtotal = Number(transaction.amount);
    const tax = 0;
    const total = subtotal + tax;

    return (
        <DashboardLayout>
            <section className="page-section">
                <div className="container">
                    <div className="invoice-card animate-fade-up">
                        <div className="invoice-header">
                            <div className="invoice-info">
                                <h2>Invoice</h2>
                                <p><strong>Invoice #:</strong> INV-{transaction.id.slice(0, 8).toUpperCase()}</p>
                                <p><strong>Date:</strong> {formatDate(transaction.created_at)}</p>
                                <p><strong>Transaction ID:</strong> {transaction.razorpay_payment_id || 'N/A'}</p>
                            </div>
                            <div className="invoice-info" style={{ textAlign: 'right' }}>
                                <img src={logoUrl} alt="Stoxzo" style={{ maxWidth: '150px', marginBottom: '15px' }} />
                                <p><strong>Stoxzo</strong></p>
                                <p>993 Renner Burg, West Rond</p>
                                <p>MT 94251-030, USA</p>
                                <p>support@stoxzo.com</p>
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
                                    <td style={{ textAlign: 'right' }}>₹{Number(transaction.amount)?.toFixed(2)}</td>
                                    <td style={{ textAlign: 'right' }}>₹{Number(transaction.amount)?.toFixed(2)}</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Subtotal:</td>
                                    <td style={{ textAlign: 'right' }}>₹{subtotal?.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Tax (0%):</td>
                                    <td style={{ textAlign: 'right' }}>₹{tax.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '18px', color: 'var(--tj-color-heading-primary)' }}>Total:</td>
                                    <td style={{ textAlign: 'right', fontSize: '18px', fontWeight: 'bold', color: 'var(--tj-color-heading-primary)' }}>₹{total?.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>

                        <div className="invoice-actions">
                            <button onClick={handlePrint} className="tj-primary-btn">
                                <span className="btn-text"><span>Print Invoice</span></span>
                                <span className="btn-icon"><i className="fa-light fa-print"></i></span>
                            </button>
                            <Link to="/payments" className="tj-primary-btn transparent-btn">
                                <span className="btn-text"><span>Back to Payments</span></span>
                                <span className="btn-icon"><i className="fa-light fa-arrow-left"></i></span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default Invoice;
