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
import CuratedAnalysis from './pages/CuratedAnalysis';
import HowToUse from './pages/HowToUse';
import FAQ from './pages/FAQ';
import NotificationDetails from './pages/NotificationDetails';
import Notifications from './pages/Notifications';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import Plans from './pages/Plans';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import RegistrationSuccess from './pages/RegistrationSuccess';
import VerifyEmail from './pages/VerifyEmail';
import Transactions from './pages/Transactions';
import Invoice from './pages/Invoice';
import Downloads from './pages/Downloads';
import SupportTickets from './pages/SupportTickets';
import Commissions from './pages/Commissions';
import CommissionDetail from './pages/CommissionDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminPlans from './pages/AdminPlans';
import AdminPlanForm from './pages/AdminPlanForm';
import AdminUsers from './pages/AdminUsers';
import AdminUserForm from './pages/AdminUserForm';
import AdminCommissions from './pages/AdminCommissions';
import AdminPayoutProcess from './pages/AdminPayoutProcess';
import AdminTransactions from './pages/AdminTransactions';
import AdminTickets from './pages/AdminTickets';
import AdminLogs from './pages/AdminLogs';
import AdminFAQs from './pages/AdminFAQs';
import AdminFAQForm from './pages/AdminFAQForm';
import AdminHowToUse from './pages/AdminHowToUse';
import AdminHowToUseForm from './pages/AdminHowToUseForm';
import AdminFiles from './pages/AdminFiles';
import AdminFileForm from './pages/AdminFileForm';
import AdminAnalysis from './pages/AdminAnalysis';
import AdminAnalysisForm from './pages/AdminAnalysisForm';
import AdminSettings from './pages/AdminSettings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import ContactUs from './pages/ContactUs';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import { authService } from './services/auth.service';
import ScrollToTop from './components/ScrollToTop';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const isAuthenticated = authService.isAuthenticated();

    return (
        <div className="App">
            <ToastContainer position="top-right" autoClose={1000} />
            <ScrollToTop />
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
                <Route path="/registration-success" element={<RegistrationSuccess />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/tutorials" element={<Tutorials />} />
                <Route path="/tutorials/:id" element={<Tutorials />} />
                <Route path="/how-to-use" element={<HowToUse />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/curated-analysis" element={<ProtectedRoute><CuratedAnalysis /></ProtectedRoute>} />
                <Route path="/curated-analysis/:id" element={<ProtectedRoute><CuratedAnalysis /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute allowedRoles={['user', 'marketer', 'admin']}><Notifications /></ProtectedRoute>} />
                <Route path="/notifications/:id" element={<ProtectedRoute allowedRoles={['user', 'marketer', 'admin']}><NotificationDetails /></ProtectedRoute>} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['user', 'marketer']}><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/subscription" element={<ProtectedRoute allowedRoles={['user', 'marketer']}><Subscription /></ProtectedRoute>} />
                <Route path="/payments" element={<ProtectedRoute allowedRoles={['user', 'marketer']}><MyPayments /></ProtectedRoute>} />
                <Route path="/invoice/:transactionId" element={<ProtectedRoute allowedRoles={['user', 'marketer']}><Invoice /></ProtectedRoute>} />
                <Route path="/referrals" element={<ProtectedRoute allowedRoles={['user', 'marketer']}><ReferredUsers /></ProtectedRoute>} />
                <Route path="/checkout/:planId" element={<ProtectedRoute allowedRoles={['user', 'marketer']}><Checkout /></ProtectedRoute>} />
                <Route path="/payment-success" element={<ProtectedRoute allowedRoles={['user', 'marketer']}><PaymentSuccess /></ProtectedRoute>} />
                <Route path="/payment-failed" element={<ProtectedRoute allowedRoles={['user', 'marketer']}><PaymentFailed /></ProtectedRoute>} />
                <Route path="/transactions" element={<ProtectedRoute allowedRoles={['user', 'marketer']}><Transactions /></ProtectedRoute>} />
                <Route path="/downloads" element={<ProtectedRoute allowedRoles={['user', 'marketer']}><Downloads /></ProtectedRoute>} />
                <Route path="/tickets" element={<ProtectedRoute allowedRoles={['user', 'marketer']}><SupportTickets /></ProtectedRoute>} />
                <Route path="/tickets/create" element={<ProtectedRoute allowedRoles={['user', 'marketer']}><CreateTicket /></ProtectedRoute>} />
                <Route path="/tickets/:id" element={<ProtectedRoute allowedRoles={['user', 'marketer', 'admin']}><TicketDetail /></ProtectedRoute>} />

                {/* Marketer Routes */}
                <Route path="/marketer/referrals" element={<ProtectedRoute allowedRoles={['marketer']}><ReferredUsers /></ProtectedRoute>} />
                <Route path="/marketer/commissions" element={<ProtectedRoute allowedRoles={['marketer']}><Commissions /></ProtectedRoute>} />
                <Route path="/marketer/commissions/:id" element={<ProtectedRoute allowedRoles={['marketer']}><CommissionDetail /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/plans/create" element={<ProtectedRoute allowedRoles={['admin']}><AdminPlanForm /></ProtectedRoute>} />
                <Route path="/admin/plans/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminPlanForm /></ProtectedRoute>} />
                <Route path="/admin/plans" element={<ProtectedRoute allowedRoles={['admin']}><AdminPlans /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/users/create" element={<ProtectedRoute allowedRoles={['admin']}><AdminUserForm /></ProtectedRoute>} />
                <Route path="/admin/users/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminUserForm /></ProtectedRoute>} />
                <Route path="/admin/commissions" element={<ProtectedRoute allowedRoles={['admin']}><AdminCommissions /></ProtectedRoute>} />
                <Route path="/admin/commissions/:id" element={<ProtectedRoute allowedRoles={['admin']}><CommissionDetail /></ProtectedRoute>} />
                <Route path="/admin/commissions/:id/pay" element={<ProtectedRoute allowedRoles={['admin']}><AdminPayoutProcess /></ProtectedRoute>} />
                <Route path="/admin/transactions" element={<ProtectedRoute allowedRoles={['admin']}><AdminTransactions /></ProtectedRoute>} />
                <Route path="/admin/tickets" element={<ProtectedRoute allowedRoles={['admin']}><AdminTickets /></ProtectedRoute>} />
                <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={['admin']}><AdminLogs /></ProtectedRoute>} />
                <Route path="/admin/files" element={<ProtectedRoute allowedRoles={['admin']}><AdminFiles /></ProtectedRoute>} />
                <Route path="/admin/files/create" element={<ProtectedRoute allowedRoles={['admin']}><AdminFileForm /></ProtectedRoute>} />
                <Route path="/admin/files/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminFileForm /></ProtectedRoute>} />

                {/* Admin Content Management */}
                <Route path="/admin/faqs" element={<ProtectedRoute allowedRoles={['admin']}><AdminFAQs /></ProtectedRoute>} />
                <Route path="/admin/faqs/create" element={<ProtectedRoute allowedRoles={['admin']}><AdminFAQForm /></ProtectedRoute>} />
                <Route path="/admin/faqs/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminFAQForm /></ProtectedRoute>} />
                <Route path="/admin/how-to-use" element={<ProtectedRoute allowedRoles={['admin']}><AdminHowToUse /></ProtectedRoute>} />
                <Route path="/admin/how-to-use/create" element={<ProtectedRoute allowedRoles={['admin']}><AdminHowToUseForm /></ProtectedRoute>} />
                <Route path="/admin/how-to-use/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminHowToUseForm /></ProtectedRoute>} />

                {/* Admin Curated Analysis */}
                <Route path="/admin/analysis" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalysis /></ProtectedRoute>} />
                <Route path="/admin/analysis/create" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalysisForm /></ProtectedRoute>} />
                <Route path="/admin/analysis/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalysisForm /></ProtectedRoute>} />

                <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />

                {/* Legal Pages */}
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsConditions />} />
                <Route path="/contact" element={<ContactUs />} />

                {/* Redirects for legacy/broken links */}
                <Route path="/commissions" element={<Navigate to="/marketer/commissions" replace />} />

                {/* Default Routes */}
                <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
}

export default App;
