import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="auth-container fade-in">
            <div className="auth-card text-center">
                <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>
                    404
                </div>
                <h1>Page Not Found</h1>
                <p className="text-muted mb-lg">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="flex gap-sm justify-center">
                    <Link to="/dashboard" className="btn btn-primary">
                        Go to Dashboard
                    </Link>
                    <Link to="/login" className="btn btn-secondary">
                        Go to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
