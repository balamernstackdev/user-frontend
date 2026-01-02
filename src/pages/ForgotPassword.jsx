import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import SEO from '../components/common/SEO';
import StoxzoLogo from '../assets/images/Stoxzo_Logo.svg';
import './ForgotPassword.css';
import bgImage from '../assets/images/bg.png';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authService.forgotPassword(email);
            if (response.success) {
                toast.success(response.message || 'Password reset link sent to your email.');
                setEmail('');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="forgot-password-section">
            <div className="forgot-password-bg-watermark" style={{ backgroundImage: `url(${bgImage})` }}></div>
            <SEO title="Forgot Password" description="Reset your Stoxzo account password." />
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
                                <span className="btn-icon"><i className="fas fa-arrow-right"></i></span>
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
