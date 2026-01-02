import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email...');

    const isVerifying = React.useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided.');
            return;
        }

        // Prevent double execution (React Strict Mode workaround)
        if (isVerifying.current) return;
        isVerifying.current = true;

        const verify = async () => {
            try {
                const response = await api.get(`/auth/verify-email?token=${token}`);
                if (response.data.success) {
                    setStatus('success');
                    setMessage('Your email has been successfully verified! You can now log in.');
                } else {
                    setStatus('error');
                    setMessage(response.data.message || 'Verification failed.');
                }
            } catch (error) {
                setStatus('error');
                // Check if it's likely a double-invocation or already verified case
                const errorMsg = error.response?.data?.message || 'Verification failed or link expired.';
                setMessage(errorMsg);
            }
        };

        verify();
    }, [token]);

    return (
        <section className="verify-email-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f2f4f8', padding: '40px 20px' }}>
            <div className="verify-email-wrapper" style={{ maxWidth: '600px', width: '100%' }}>
                <div className="verify-email-card" style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '60px 50px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)', textAlign: 'center' }}>
                    <div className="verify-email-icon" style={{ width: '120px', height: '120px', background: status === 'success' ? '#e0f7fa' : '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}>
                        {status === 'verifying' && <i className="fas fa-spinner fa-spin" style={{ fontSize: '60px', color: '#13689e' }}></i>}
                        {status === 'success' && <i className="fas fa-check-circle" style={{ fontSize: '60px', color: '#13689e' }}></i>}
                        {status === 'error' && <i className="fas fa-circle-xmark" style={{ fontSize: '60px', color: '#ef4444' }}></i>}
                    </div>

                    <div className="verify-email-title" style={{ marginBottom: '30px' }}>
                        <h2 style={{ fontSize: '36px', marginBottom: '15px', color: '#000000' }}>
                            {status === 'verifying' && 'Verifying Email...'}
                            {status === 'success' && 'Email Verified!'}
                            {status === 'error' && 'Verification Failed'}
                        </h2>
                        <p style={{ color: '#6c757d', fontSize: '16px', lineHeight: '1.6' }}>{message}</p>
                    </div>

                    <div className="verify-email-actions" style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '30px' }}>
                        {status === 'success' ? (
                            <Link to="/login" className="tj-primary-btn" style={{ minWidth: '150px' }}>
                                <span className="btn-text"><span>Go to Login</span></span>
                            </Link>
                        ) : (
                            <Link to="/login" className="tj-primary-btn transparent-btn">
                                <span className="btn-text"><span>Back to Login</span></span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VerifyEmail;
