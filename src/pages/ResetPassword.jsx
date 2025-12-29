import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';

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
        <div className="auth-container fade-in">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-logo">🔐</h1>
                    <h2>Reset Password</h2>
                    <p className="auth-subtitle">Enter your new password</p>
                </div>

                {errors.general && (
                    <div className="alert alert-error" role="alert">
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            New Password *
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className={`form-input ${errors.password ? 'error' : ''}`}
                            placeholder="Enter new password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {errors.password && (
                            <span className="form-error">{errors.password}</span>
                        )}
                        <small className="text-muted text-small">
                            Min 8 characters with uppercase, lowercase, number & special character
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            Confirm Password *
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                            placeholder="Confirm new password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                        {errors.confirmPassword && (
                            <span className="form-error">{errors.confirmPassword}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block mt-md"
                        disabled={loading}
                    >
                        {loading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                </form>

                <div className="auth-footer">
                    <Link to="/login">Back to login</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
