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

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        if (user.role === 'support_agent') {
            return <Navigate to="/admin/tickets" replace />;
        }
        if (['admin', 'finance_manager'].includes(user.role)) {
            return <Navigate to="/admin/dashboard" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
