import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import StoxzoLogo from '../assets/images/Stoxzo_Logo.svg';
import './ResetPassword.css';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate('/forgot-password');
        }
    }, [token, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(formData.password)) {
            newErrors.password = 'Password must contain an uppercase letter';
        } else if (!/[a-z]/.test(formData.password)) {
            newErrors.password = 'Password must contain a lowercase letter';
        } else if (!/\d/.test(formData.password)) {
            newErrors.password = 'Password must contain a number';
        } else if (!/[!@#$%^&*()]/.test(formData.password)) {
            newErrors.password = 'Password must contain a special character';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await authService.resetPassword(token, formData.password);
            if (response.success) {
                navigate('/login', {
                    state: { message: 'Password reset successful! Please login with your new password.' }
                });
            }
        } catch (err) {
            setErrors({
                general: err.response?.data?.message || 'Failed to reset password. The link may be expired.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="reset-password-section">
            <div className="reset-password-wrapper">
                <div className="reset-password-card">
                    <div className="reset-password-logo">
                        <Link to="/">
                            <img src={StoxzoLogo} alt="Stoxzo Logo" />
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

                    {errors.general && (
                        <div className="alert alert-danger" style={{ marginBottom: '20px' }} role="alert">
                            {errors.general}
                        </div>
                    )}

                    <form className="reset-password-form" onSubmit={handleSubmit}>
                        <div className="form-input password-input">
                            <label htmlFor="password">New Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="Enter new password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i className={`fa-light ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                            </button>
                            {errors.password && (
                                <span style={{ color: '#cf1322', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {errors.password}
                                </span>
                            )}
                        </div>

                        <div className="form-input password-input">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
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
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <i className={`fa-light ${showConfirmPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                            </button>
                            {errors.confirmPassword && (
                                <span style={{ color: '#cf1322', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {errors.confirmPassword}
                                </span>
                            )}
                        </div>

                        <div className="reset-btn-wrapper">
                            <button type="submit" className="tj-primary-btn" disabled={loading}>
                                <span className="btn-text">
                                    <span>{loading ? 'Resetting Password...' : 'Reset Password'}</span>
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

export default ResetPassword;
