import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useSettings } from '../context/SettingsContext';
import SEO from '../components/common/SEO';
import StoxzoLogo from '../assets/images/Stoxzo_Logo.svg';
import './Login.css';
import bgImage from '../assets/images/bg.png';
import { toast } from 'react-toastify';

const Login = () => {
    const { settings } = useSettings();
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false,
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (location.state?.message) {
            toast.success(location.state.message);
            // Clear state to prevent toast on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            const { remember, ...loginData } = formData;
            const response = await authService.login(loginData);

            if (response.success) {
                // Optional: Handle "remember me" functionality
                if (remember) {
                    localStorage.setItem('rememberMe', 'true');
                }

                // Redirect based on role
                const userRole = response.data.user.role;
                if (userRole === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="login-section">
            <div className="login-bg-watermark" style={{ backgroundImage: `url(${bgImage})` }}></div>
            <SEO title="Login" description={`Login to your ${settings.site_name || 'Stoxzo'} account.`} />
            <div className="login-wrapper">
                <div className="login-card">
                    <div className="login-logo">
                        <Link to="/">
                            <img src={StoxzoLogo} alt={`${settings.site_name || 'Stoxzo'} Logo`} />
                        </Link>
                    </div>

                    <div className="login-title">
                        <h2>Welcome Back</h2>
                        <p>Sign in to your account to continue</p>
                    </div>

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
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-input">
                            <label htmlFor="password">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={togglePasswordVisibility}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    )}
                                </button>
                            </div>
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
                                        <i className="fas fa-arrow-right"></i>
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="signup-link">
                        <p>
                            Don't have an account? <Link to="/register">Sign Up</Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Login;
