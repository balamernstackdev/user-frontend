import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth.service';

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
        <div className="auth-container fade-in">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-logo">🔒</h1>
                    <h2>Forgot Password</h2>
                    <p className="auth-subtitle">
                        Enter your email and we'll send you a reset link
                    </p>
                </div>

                {message && (
                    <div className="alert alert-success" role="alert">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="alert alert-error" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="auth-footer">
                    Remember your password?{' '}
                    <Link to="/login">Sign in here</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
