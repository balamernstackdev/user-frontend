import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import StoxzoLogo from '../assets/images/Stoxzo_Logo.svg';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await authService.forgotPassword(email);
            if (response.success) {
                setMessage(response.message);
                setEmail(''); // Clear form
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="forgot-password-section">
            <div className="forgot-password-wrapper">
                <div className="forgot-password-card">
                    <div className="forgot-password-logo">
                        <Link to="/">
                            <img src={StoxzoLogo} alt="Stoxzo Logo" />
                        </Link>
                    </div>
                    <div className="forgot-password-title">
                        <h2>Forgot Password?</h2>
                        <p>No worries! Enter your email address and we'll send you a link to reset your password.</p>
                    </div>

                    <div className="info-box">
                        <p>
                            <i className="fa-light fa-info-circle"></i>
                            You will receive a password reset link via email if the account exists.
                        </p>
                    </div>

                    {message && (
                        <div className="alert alert-success" style={{ marginBottom: '20px' }} role="alert">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger" style={{ marginBottom: '20px' }} role="alert">
                            {error}
                        </div>
                    )}

                    <form className="forgot-password-form" onSubmit={handleSubmit}>
                        <div className="form-input">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="reset-btn-wrapper">
                            <button type="submit" className="tj-primary-btn" disabled={loading}>
                                <span className="btn-text">
                                    <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
                                </span>
                                <span className="btn-icon"><i className="tji-arrow-right-long"></i></span>
                            </button>
                        </div>
                    </form>
                    <div className="back-to-login">
                        <p>Remember your password? <Link to="/login">Back to Login</Link></p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ForgotPassword;
