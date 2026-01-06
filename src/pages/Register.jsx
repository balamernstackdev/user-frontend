import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { authService } from '../services/auth.service';
import { useSettings } from '../context/SettingsContext';
import SEO from '../components/common/SEO';
import StoxzoLogo from '../assets/images/Stoxzo_Logo.svg';
import './Register.css';
import bgImage from '../assets/images/bg.png';
import { toast } from 'react-toastify';

const Register = () => {
    const { settings } = useSettings();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        referralCode: '',
        agreeToTerms: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState(null);

    // Extract referral code from URL
    useEffect(() => {
        const refCode = searchParams.get('ref');
        if (refCode) {
            setFormData(prev => ({ ...prev, referralCode: refCode }));
        }
    }, [searchParams]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        // Clear field error on change
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleRecaptchaChange = (token) => {
        setRecaptchaToken(token);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else {
            // Backend requires: Upper, Lower, Number, Special, Min 8
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
            if (!passwordRegex.test(formData.password)) {
                newErrors.password = 'Password must be 8+ chars with Uppercase, Lowercase, Number, and Special char.';
            }
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the Terms & Conditions';
        }

        if (!formData.referralCode.trim()) {
            newErrors.referralCode = 'Referral code is required';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error('Please fix the errors in the form');
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const { firstName, lastName, confirmPassword, agreeToTerms, ...rest } = formData;
            const registrationData = {
                ...rest,
                name: `${firstName} ${lastName}`.trim(),
                role: 'user' // Default role
            };

            // Check reCAPTCHA if enabled
            if (settings.security_method === 'recaptcha') {
                if (!recaptchaToken) {
                    toast.error('Please complete the security check.');
                    setLoading(false);
                    return;
                }
                registrationData.recaptchaToken = recaptchaToken;
            }

            const response = await authService.register(registrationData);

            if (response.success) {
                navigate('/registration-success', {
                    state: { email: formData.email }
                });
            }
        } catch (err) {
            const apiErrors = {};
            if (err.response?.data?.errors) {
                err.response.data.errors.forEach((error) => {
                    apiErrors[error.field] = error.message;
                });
                setErrors(apiErrors);
                toast.error('Please correct the highlighted errors.');
            } else {
                const msg = err.response?.data?.message || 'Registration failed. Please try again.';
                setErrors({ general: msg });
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="register-section">
            <div className="register-bg-watermark" style={{ backgroundImage: `url(${bgImage})` }}></div>
            <SEO title="Register" description={`Create your ${settings.site_name || 'Stoxzo'} account to get started.`} />
            <div className="register-wrapper">
                <div className="register-card">
                    <div className="register-logo">
                        <Link to="/">
                            <img src={StoxzoLogo} alt={`${settings.site_name || 'Stoxzo'} Logo`} />
                        </Link>
                    </div>

                    <div className="register-title">
                        <h2>Create Account</h2>
                        <p>Sign up to get started with your account</p>
                    </div>

                    <form className="register-form" onSubmit={handleSubmit}>
                        {/* First Name & Last Name - 2 Column */}
                        <div className="form-row">
                            <div className="form-input">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    placeholder="Enter your first name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    autoComplete="given-name"
                                />
                                {errors.firstName && (
                                    <span style={{ color: '#cf1322', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                        {errors.firstName}
                                    </span>
                                )}
                            </div>
                            <div className="form-input">
                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    placeholder="Enter your last name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    autoComplete="family-name"
                                />
                                {errors.lastName && (
                                    <span style={{ color: '#cf1322', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                        {errors.lastName}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Email */}
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
                            {errors.email && (
                                <span style={{ color: '#cf1322', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {errors.email}
                                </span>
                            )}
                        </div>

                        {/* Password with Toggle */}
                        <div className="form-input password-input">
                            <label htmlFor="password">Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                            {errors.password && (
                                <span style={{ color: '#cf1322', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {errors.password}
                                </span>
                            )}
                        </div>

                        {/* Confirm Password with Toggle */}
                        <div className="form-input password-input">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                            {errors.confirmPassword && (
                                <span style={{ color: '#cf1322', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {errors.confirmPassword}
                                </span>
                            )}
                        </div>

                        {/* Referral Code (Mandatory) */}
                        <div className="form-input">
                            <label htmlFor="referralCode">Referral Code</label>
                            <input
                                type="text"
                                id="referralCode"
                                name="referralCode"
                                placeholder="Enter referral code"
                                value={formData.referralCode}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                            />
                            {errors.referralCode && (
                                <span style={{ color: '#cf1322', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {errors.referralCode}
                                </span>
                            )}
                        </div>

                        {/* Terms & Conditions Checkbox */}
                        <div className="terms-checkbox">
                            <input
                                type="checkbox"
                                id="agreeToTerms"
                                name="agreeToTerms"
                                checked={formData.agreeToTerms}
                                onChange={handleChange}
                            />
                            <label htmlFor="agreeToTerms">
                                I agree to the <Link to="/terms">Terms & Conditions</Link> and <Link to="/privacy">Privacy Policy</Link>
                            </label>
                        </div>
                        {errors.agreeToTerms && (
                            <span style={{ color: '#cf1322', fontSize: '12px', marginTop: '-20px', marginBottom: '20px', display: 'block' }}>
                                {errors.agreeToTerms}
                            </span>
                        )}

                        {/* Submit Button */}
                        <div className="register-btn-wrapper">
                            {settings.security_method === 'recaptcha' && settings.recaptcha_site_key && (
                                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                                    <ReCAPTCHA
                                        sitekey={settings.recaptcha_site_key}
                                        onChange={handleRecaptchaChange}
                                    />
                                </div>
                            )}
                            <button type="submit" className="tj-primary-btn" disabled={loading}>
                                <span className="btn-text">
                                    <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
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

                    {/* Login Link */}
                    <div className="login-link">
                        <p>
                            Already have an account? <Link to="/login">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Register;
