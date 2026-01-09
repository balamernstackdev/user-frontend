import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import paymentService from '../services/payment.service';
import './styles/MyPayments.css';
import { toast } from 'react-toastify';

const MyPayments = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await paymentService.getTransactions();
            const data = response.data || {};
            // Backend now returns { transactions, pagination }
            setTransactions(data.transactions || (Array.isArray(data) ? data : []));
        } catch (err) {
            toast.error('Failed to load transaction history');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount, currency = 'INR') => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <DashboardLayout>
            <section className="page-section">
                <div className="container">
                    <div className="page-header">
                        <h2>My Payments</h2>
                        <p style={{ color: '#6c757d' }}>View your payment history and transactions</p>
                    </div>

                    <div className="row">
                        <div className="col-lg-12">
                            {loading ? (
                                <div className="payment-card animate-fade-up">
                                    <div className="text-center p-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                </div>
                            ) : transactions.length > 0 ? (
                                <div className="payment-card animate-fade-up">
                                    <div className="table-responsive" style={{ overflowX: 'auto' }}>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Transaction ID</th>
                                                    <th>Date</th>
                                                    <th>Description</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions.map((txn) => (
                                                    <tr key={txn.id || Math.random()}>
                                                        <td>#{txn.id ? txn.id.slice(0, 8).toUpperCase() : 'N/A'}...</td>
                                                        <td>{formatDate(txn.created_at)}</td>
                                                        <td>{txn.plan_name || txn.description || 'Subscription Plan'}</td>
                                                        <td>{formatCurrency(txn.amount, txn.currency)}</td>
                                                        <td>
                                                            <span className={`payment-status ${txn.status || 'pending'}`}>
                                                                {txn.status || 'Pending'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <Link to={`/invoice/${txn.id}`} className="text-btn">View Invoice</Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="no-content-state mb-4">
                                    <div className="no-content-icon">
                                        <i className="fas fa-credit-card"></i>
                                    </div>
                                    <h3>No transactions found</h3>
                                    <p>You haven't made any transactions yet. Your payment history will appear here once you purchase a plan.</p>
                                    <Link to="/plans" className="tj-primary-btn" style={{ display: 'inline-flex' }}>
                                        <span className="btn-text"><span>Browse Plans</span></span>
                                        <span className="btn-icon"><i className="fas fa-arrow-right"></i></span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default MyPayments;
