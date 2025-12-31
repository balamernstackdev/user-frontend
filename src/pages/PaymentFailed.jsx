import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout'; // Optional wrapping
import './PaymentFailed.css';
import StoxzoLogo from '../assets/images/Stoxzo_Logo.svg';

const PaymentFailed = () => {
    const location = useLocation();
    const { error, code } = location.state || {}; // Expecting error details state

    return (
        <section className="failure-section">
            <div className="failure-wrapper">
                <div className="failure-card">
                    <div className="success-logo">
                        <Link to="/">
                            <img src={StoxzoLogo} alt="Stoxzo Logo" />
                        </Link>
                    </div>

                    <div className="failure-icon animate-fade-up">
                        <i className="fas fa-circle-xmark"></i>
                    </div>

                    <div className="failure-title animate-fade-up" style={{ animationDelay: '0.1s' }}>
                        <h2>Payment Failed</h2>
                        <p>We couldn't process your payment. Please try again or use a different payment method.</p>
                        {error && <p style={{ color: '#dc3545', marginTop: '10px', fontSize: '14px' }}>Error: {error} {code ? `(${code})` : ''}</p>}
                    </div>

                    <div className="failure-info animate-fade-up" style={{ animationDelay: '0.2s' }}>
                        <p>Possible reasons for payment failure:</p>
                        <ul>
                            <li>Insufficient funds in your account</li>
                            <li>Incorrect card details entered</li>
                            <li>Card expired or blocked</li>
                            <li>Bank declined the transaction</li>
                            <li>Network connectivity issues</li>
                        </ul>
                    </div>

                    <div className="failure-actions animate-fade-up" style={{ animationDelay: '0.3s' }}>
                        <Link to="/plans" className="tj-primary-btn">
                            <span className="btn-text"><span>Try Again</span></span>
                            <span className="btn-icon"><i className="fas fa-arrow-right"></i></span>
                        </Link>
                        {/* 
                        <Link to="/checkout" className="tj-primary-btn transparent-btn">
                            <span className="btn-text"><span>Change Payment Method</span></span>
                            <span className="btn-icon"><i className="tji-arrow-right-long"></i></span>
                        </Link>
                        */}
                    </div>

                    <div className="support-link animate-fade-up" style={{ animationDelay: '0.4s' }}>
                        <p>
                            Need help? Contact our support team at <a href="mailto:support@stoxzo.com">support@stoxzo.com</a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PaymentFailed;
