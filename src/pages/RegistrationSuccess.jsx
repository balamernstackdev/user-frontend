import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';
import StoxzoLogo from '../assets/images/Stoxzo_Logo.svg';
import './RegistrationSuccess.css';

const RegistrationSuccess = () => {
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [resendStatus, setResendStatus] = useState(''); // 'sending', 'success', 'error'
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        }
    }, [location.state]);

    const handleResend = async () => {
        if (!email) return;

        setResendStatus('sending');
        setMessage('');

        try {
            const response = await authService.resendVerification(email);
            setResendStatus('success');
            setMessage(response.message || 'Verification email resent successfully.');
        } catch (error) {
            setResendStatus('error');
            setMessage(error.response?.data?.message || 'Failed to resend email. Please try again.');
        }
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

                    <div className="success-icon">
                        <i className="fas fa-envelope"></i>
                    </div>

                    <div className="success-title">
                        <h2>Please Verify Your Email</h2>
                        <p>We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.</p>
                    </div>

                    <div className="next-steps-box">
                        <div className="next-steps-title">
                            <i className="fas fa-info-circle"></i>
                            What to do next?
                        </div>
                        <ul className="next-steps-list">
                            <li>Check your email inbox (and spam folder if needed)</li>
                            <li>Click on the verification link in the email</li>
                            <li>You'll be redirected to complete your account setup</li>
                            <li>Once verified, you can log in to your account</li>
                        </ul>
                    </div>

                    {/* Resend Logic */}
                    <div className="resend-section">
                        <p className="resend-prompt">
                            Didn't receive the email? Check your spam folder or
                        </p>

                        {message && (
                            <div className={`alert alert-${resendStatus === 'error' ? 'danger' : 'success'}`} style={{ marginBottom: '20px', padding: '10px', borderRadius: '4px', fontSize: '14px' }}>
                                {message}
                            </div>
                        )}

                        {!email ? (
                            <div style={{ marginBottom: '20px' }}>
                                <input
                                    type="email"
                                    placeholder="Enter your email to resend"
                                    className="form-control"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '10px' }}
                                />
                            </div>
                        ) : null}

                        <div className="action-buttons">
                            <button
                                onClick={handleResend}
                                className="tj-primary-btn"
                                disabled={!email || resendStatus === 'sending'}
                            >
                                <span className="btn-text">
                                    <span>{resendStatus === 'sending' ? 'Sending...' : 'Resend Email'}</span>
                                </span>
                                <span className="btn-icon"><i className="fas fa-arrow-right"></i></span>
                            </button>

                            <Link to="/login" className="tj-secondary-btn">
                                Back to Login
                                <span className="btn-icon"><i className="fas fa-arrow-right"></i></span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RegistrationSuccess;
