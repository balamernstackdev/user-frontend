import { Navigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 * Optionally checks for specific roles
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getUser();

    // Check authentication
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check role authorization if allowedRoles is specified
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        if (user.role === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
