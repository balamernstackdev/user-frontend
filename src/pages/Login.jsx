import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';
import StoxzoLogo from '../assets/images/Stoxzo_Logo.svg';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false,
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        setError(''); // Clear error on input change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const { remember, ...loginData } = formData;
            const response = await authService.login(loginData);

            if (response.success) {
                // Optional: Handle "remember me" functionality
                if (remember) {
                    localStorage.setItem('rememberMe', 'true');
                }

                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="login-section">
            <div className="login-wrapper">
                <div className="login-card">
                    <div className="login-logo">
                        <Link to="/">
                            <img src={StoxzoLogo} alt="Stoxzo Logo" />
                        </Link>
                    </div>

                    <div className="login-title">
                        <h2>Welcome Back</h2>
                        <p>Sign in to your account to continue</p>
                    </div>

                    {error && (
                        <div className="login-alert alert-error" role="alert">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="login-alert alert-success" role="alert">
                            {successMessage}
                        </div>
                    )}

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-input">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-input">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-options">
                            <div className="remember-me">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    name="remember"
                                    checked={formData.remember}
                                    onChange={handleChange}
                                />
                                <label htmlFor="remember">Remember me</label>
                            </div>
                            <Link to="/forgot-password" className="forgot-password-link">
                                Forgot Password?
                            </Link>
                        </div>

                        <div className="login-btn-wrapper">
                            <button type="submit" className="tj-primary-btn" disabled={loading}>
                                <span className="btn-text">
                                    <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                                </span>
                                {loading ? (
                                    <span className="btn-icon">
                                        <span className="spinner-icon"></span>
                                    </span>
                                ) : (
                                    <span className="btn-icon">
                                        <i className="tji-arrow-right-long">→</i>
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="signup-link">
                        <p>
                            Don't have an account?
                            <Link to="/register">Sign Up</Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Login;
