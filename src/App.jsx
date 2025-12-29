import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import MyPayments from './pages/MyPayments';
import ReferredUsers from './pages/ReferredUsers';
import Tutorials from './pages/Tutorials';
import HowToUse from './pages/HowToUse';
import FAQ from './pages/FAQ';
import Notifications from './pages/Notifications';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import Plans from './pages/Plans';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import Transactions from './pages/Transactions';
import Downloads from './pages/Downloads';
import SupportTickets from './pages/SupportTickets';
import Commissions from './pages/Commissions';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import { authService } from './services/auth.service';

function App() {
    const isAuthenticated = authService.isAuthenticated();

    return (
        <div className="App">
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/tutorials" element={<Tutorials />} />
                <Route path="/tutorials/:id" element={<Tutorials />} />
                <Route path="/how-to-use" element={<HowToUse />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/create-ticket" element={<CreateTicket />} />
                <Route path="/tickets/:id" element={<TicketDetail />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/checkout/:planId" element={<Checkout />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-failed" element={<PaymentFailed />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
                <Route path="/payments" element={<ProtectedRoute><MyPayments /></ProtectedRoute>} />
                <Route path="/referrals" element={<ProtectedRoute><ReferredUsers /></ProtectedRoute>} />
                <Route path="/checkout/:planId" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
                <Route path="/payment-failed" element={<ProtectedRoute><PaymentFailed /></ProtectedRoute>} />
                <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
                <Route path="/downloads" element={<ProtectedRoute><Downloads /></ProtectedRoute>} />
                <Route path="/tickets" element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} />
                <Route path="/tickets/create" element={<ProtectedRoute><CreateTicket /></ProtectedRoute>} />
                <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />

                {/* Marketer Routes */}
                <Route path="/marketer/referrals" element={<ProtectedRoute allowedRoles={['marketer']}><ReferredUsers /></ProtectedRoute>} />
                <Route path="/marketer/commissions" element={<ProtectedRoute allowedRoles={['marketer']}><Commissions /></ProtectedRoute>} />

                {/* Default Routes */}
                <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
}

export default App;
