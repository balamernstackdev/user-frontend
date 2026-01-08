import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/auth.service';
import SEO from '../components/common/SEO';
import './styles/ResetPassword.css';
import Logo from '../assets/images/Stoxzo_Logo.svg';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState({
        new: false,
        confirm: false
    });

    const [loading, setLoading] = useState(false);

    const togglePassword = (field) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error('Invalid or missing reset token.');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        if (!validatePassword(formData.newPassword)) {
            toast.error('Password does not meet the requirements.');
            return;
        }

        setLoading(true);

        try {
            await authService.resetPassword(token, formData.newPassword);
            toast.success('Password reset successfully! You can now login.');
            navigate('/login');
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to reset password. Token may be expired.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="reset-password-section">
                <div className="reset-password-card" style={{ textAlign: 'center' }}>
                    <h3>Invalid Link</h3>
                    <p>The password reset link is missing a token.</p>
                    <Link to="/login" className="tj-primary-btn" style={{ marginTop: '20px', display: 'inline-block' }}>Back to Login</Link>
                </div>
            </div>
        )
    }

    return (
        <>
            <SEO title="Reset Password" description="Reset your account password." />

            <section className="reset-password-section">
                <div className="reset-password-wrapper">
                    <div className="reset-password-card">
                        <div className="reset-password-logo">
                            <Link to="/">
                                <img src={Logo} alt="Stoxzo Logo" />
                            </Link>
                        </div>
                        <div className="reset-password-title">
                            <h2>Reset Password</h2>
                            <p>Please enter your new password below.</p>
                        </div>

                        <div className="password-requirements">
                            <p>Password Requirements:</p>
                            <ul>
                                <li>At least 8 characters long</li>
                                <li>Contains at least one uppercase letter</li>
                                <li>Contains at least one lowercase letter</li>
                                <li>Contains at least one number</li>
                                <li>Contains at least one special character</li>
                            </ul>
                        </div>

                        <form className="reset-password-form" onSubmit={handleSubmit}>
                            <div className="form-input password-input">
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    type={showPassword.new ? "text" : "password"}
                                    id="newPassword"
                                    name="newPassword"
                                    placeholder="Enter new password"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => togglePassword('new')}
                                >
                                    <i className={`fas ${showPassword.new ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                                </button>
                            </div>

                            <div className="form-input password-input">
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                <input
                                    type={showPassword.confirm ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Confirm new password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => togglePassword('confirm')}
                                >
                                    <i className={`fas ${showPassword.confirm ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                                </button>
                            </div>

                            <div className="reset-btn-wrapper">
                                <button type="submit" className="tj-primary-btn" disabled={loading}>
                                    <span className="btn-text">
                                        {loading ? 'Reseting Password...' : 'Reset Password'}
                                    </span>
                                    {!loading && <span className="btn-icon"><i className="fas fa-arrow-right"></i></span>}
                                </button>
                            </div>
                        </form>

                        <div className="back-to-login">
                            <p>Remember your password? <Link to="/login">Back to Login</Link></p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ResetPassword;
