import { Link, useNavigate } from 'react-router-dom';

const ErrorPage = () => {
    const navigate = useNavigate();

    return (
        <div className="auth-container fade-in">
            <div className="auth-card text-center">
                <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>
                    ⚠️
                </div>
                <h1>Oops! Something went wrong</h1>
                <p className="text-muted mb-lg">
                    We encountered an unexpected error. Please try again.
                </p>
                <div className="flex gap-sm justify-center">
                    <button onClick={() => navigate(-1)} className="btn btn-primary">
                        Go Back
                    </button>
                    <Link to="/dashboard" className="btn btn-secondary">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;
