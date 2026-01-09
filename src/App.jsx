import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { authService } from './services/auth.service';
import { useSettings } from './context/SettingsContext';
import ScrollToTop from './components/ScrollToTop';
import LoadingSpinner from './components/LoadingSpinner';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Lazy Load Pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Subscription = lazy(() => import('./pages/Subscription'));
const MyPayments = lazy(() => import('./pages/MyPayments'));
const ReferredUsers = lazy(() => import('./pages/ReferredUsers'));
const Tutorials = lazy(() => import('./pages/Tutorials'));
const CuratedAnalysis = lazy(() => import('./pages/CuratedAnalysis'));
const HowToUse = lazy(() => import('./pages/HowToUse'));
const FAQ = lazy(() => import('./pages/FAQ'));
const NotificationDetails = lazy(() => import('./pages/NotificationDetails'));
const Notifications = lazy(() => import('./pages/Notifications'));
const CreateTicket = lazy(() => import('./pages/CreateTicket'));
const TicketDetail = lazy(() => import('./pages/TicketDetail'));
const Plans = lazy(() => import('./pages/Plans'));
const Checkout = lazy(() => import('./pages/Checkout'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentFailed = lazy(() => import('./pages/PaymentFailed'));
const RegistrationSuccess = lazy(() => import('./pages/RegistrationSuccess'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Invoice = lazy(() => import('./pages/Invoice'));
const Downloads = lazy(() => import('./pages/Downloads'));
const SupportTickets = lazy(() => import('./pages/SupportTickets'));
const Commissions = lazy(() => import('./pages/Commissions'));
const CommissionDetail = lazy(() => import('./pages/CommissionDetail'));

// Business Associate
const BusinessAssociateDashboard = lazy(() => import('./pages/BusinessAssociateDashboard'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminPlans = lazy(() => import('./pages/AdminPlans'));
const AdminPlanForm = lazy(() => import('./pages/AdminPlanForm'));
const AdminSubscriptions = lazy(() => import('./pages/AdminSubscriptions'));
const AdminSubscriptionForm = lazy(() => import('./pages/AdminSubscriptionForm'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminUserForm = lazy(() => import('./pages/AdminUserForm'));
const AdminCommissions = lazy(() => import('./pages/AdminCommissions'));
const AdminPayoutProcess = lazy(() => import('./pages/AdminPayoutProcess'));
const AdminTransactions = lazy(() => import('./pages/AdminTransactions'));
const AdminTickets = lazy(() => import('./pages/AdminTickets'));
const AdminLogs = lazy(() => import('./pages/AdminLogs'));
const AdminBATransactions = lazy(() => import('./pages/AdminBATransactions'));
const AdminFAQs = lazy(() => import('./pages/AdminFAQs'));
const AdminFAQForm = lazy(() => import('./pages/AdminFAQForm'));
const AdminHowToUse = lazy(() => import('./pages/AdminHowToUse'));
const AdminHowToUseForm = lazy(() => import('./pages/AdminHowToUseForm'));
const AdminFiles = lazy(() => import('./pages/AdminFiles'));
const AdminFileForm = lazy(() => import('./pages/AdminFileForm'));
const AdminReports = lazy(() => import('./pages/AdminReports'));
const AdminAnalysis = lazy(() => import('./pages/AdminAnalysis'));
const AdminAnalysisForm = lazy(() => import('./pages/AdminAnalysisForm'));
const AdminEmailTemplates = lazy(() => import('./pages/AdminEmailTemplates'));
const AdminEmailTemplateEdit = lazy(() => import('./pages/AdminEmailTemplateEdit'));
const AdminAnnouncements = lazy(() => import('./pages/AdminAnnouncements'));
const AdminAnnouncementForm = lazy(() => import('./pages/AdminAnnouncementForm'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminTicketDetail = lazy(() => import('./pages/AdminTicketDetail'));

// Legal & Misc
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getUser();
    const { settings } = useSettings();

    // Check for Maintenance Mode
    const isMaintenanceMode = settings.maintenance_mode === 'true' || settings.maintenance_mode === true;
    const isAdmin = user?.role === 'admin';

    if (isMaintenanceMode && !isAdmin) {
        return <Maintenance />;
    }

    return (
        <div className="App">
            <ToastContainer position="top-right" autoClose={1000} />
            <ScrollToTop />
            <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
                    <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
                    <Route path="/registration-success" element={<RegistrationSuccess />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/plans" element={<Plans />} />
                    <Route path="/tutorials" element={<Tutorials />} />
                    <Route path="/tutorials/:id" element={<Tutorials />} />
                    <Route path="/how-to-use" element={<HowToUse />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/curated-analysis" element={<ProtectedRoute allowedRoles={['user', 'admin']}><CuratedAnalysis /></ProtectedRoute>} />
                    <Route path="/curated-analysis/:id" element={<ProtectedRoute allowedRoles={['user', 'admin']}><CuratedAnalysis /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute allowedRoles={['user', 'business_associate', 'admin', 'support_agent']}><Notifications /></ProtectedRoute>} />
                    <Route path="/notifications/:id" element={<ProtectedRoute allowedRoles={['user', 'business_associate', 'admin', 'support_agent']}><NotificationDetails /></ProtectedRoute>} />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['user', 'business_associate']}><Dashboard /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/subscription" element={<ProtectedRoute allowedRoles={['user', 'business_associate']}><Subscription /></ProtectedRoute>} />
                    <Route path="/payments" element={<ProtectedRoute allowedRoles={['user', 'business_associate']}><MyPayments /></ProtectedRoute>} />
                    <Route path="/invoice/:transactionId" element={<ProtectedRoute allowedRoles={['user', 'business_associate']}><Invoice /></ProtectedRoute>} />
                    <Route path="/referrals" element={<ProtectedRoute allowedRoles={['user', 'business_associate']}><ReferredUsers /></ProtectedRoute>} />
                    <Route path="/checkout/:planId" element={<ProtectedRoute allowedRoles={['user', 'business_associate']}><Checkout /></ProtectedRoute>} />
                    <Route path="/payment-success" element={<ProtectedRoute allowedRoles={['user', 'business_associate']}><PaymentSuccess /></ProtectedRoute>} />
                    <Route path="/payment-failed" element={<ProtectedRoute allowedRoles={['user', 'business_associate']}><PaymentFailed /></ProtectedRoute>} />
                    <Route path="/transactions" element={<ProtectedRoute allowedRoles={['user', 'business_associate']}><Transactions /></ProtectedRoute>} />
                    <Route path="/downloads" element={<ProtectedRoute allowedRoles={['user', 'business_associate']}><Downloads /></ProtectedRoute>} />
                    <Route path="/tickets" element={<ProtectedRoute allowedRoles={['user', 'business_associate']}><SupportTickets /></ProtectedRoute>} />
                    <Route path="/tickets/create" element={<ProtectedRoute allowedRoles={['user', 'business_associate']}><CreateTicket /></ProtectedRoute>} />
                    <Route path="/tickets/:id" element={<ProtectedRoute allowedRoles={['user', 'business_associate', 'admin', 'support_agent']}><TicketDetail /></ProtectedRoute>} />

                    {/* Business Associate Routes */}
                    <Route path="/business-associate/dashboard" element={<ProtectedRoute allowedRoles={['business_associate']}><BusinessAssociateDashboard /></ProtectedRoute>} />
                    <Route path="/business-associate/referrals" element={<ProtectedRoute allowedRoles={['business_associate']}><ReferredUsers /></ProtectedRoute>} />
                    <Route path="/business-associate/commissions" element={<ProtectedRoute allowedRoles={['business_associate']}><Commissions /></ProtectedRoute>} />
                    <Route path="/business-associate/commissions/:id" element={<ProtectedRoute allowedRoles={['business_associate']}><CommissionDetail /></ProtectedRoute>} />

                    {/* Admin Routes */}
                    <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'finance_manager']}><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/plans/create" element={<ProtectedRoute allowedRoles={['admin']}><AdminPlanForm /></ProtectedRoute>} />
                    <Route path="/admin/plans/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminPlanForm /></ProtectedRoute>} />
                    <Route path="/admin/plans" element={<ProtectedRoute allowedRoles={['admin']}><AdminPlans /></ProtectedRoute>} />
                    <Route path="/admin/subscriptions" element={<ProtectedRoute allowedRoles={['admin', 'finance_manager']}><AdminSubscriptions /></ProtectedRoute>} />
                    <Route path="/admin/subscriptions/create" element={<ProtectedRoute allowedRoles={['admin', 'finance_manager']}><AdminSubscriptionForm /></ProtectedRoute>} />
                    <Route path="/admin/subscriptions/edit/:id" element={<ProtectedRoute allowedRoles={['admin', 'finance_manager']}><AdminSubscriptionForm /></ProtectedRoute>} />
                    <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
                    <Route path="/admin/users/create" element={<ProtectedRoute allowedRoles={['admin']}><AdminUserForm /></ProtectedRoute>} />
                    <Route path="/admin/users/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminUserForm /></ProtectedRoute>} />
                    <Route path="/admin/commissions" element={<ProtectedRoute allowedRoles={['admin', 'finance_manager']}><AdminCommissions /></ProtectedRoute>} />
                    <Route path="/admin/commissions/:id" element={<ProtectedRoute allowedRoles={['admin', 'finance_manager']}><CommissionDetail /></ProtectedRoute>} />
                    <Route path="/admin/commissions/:id/pay" element={<ProtectedRoute allowedRoles={['admin', 'finance_manager']}><AdminPayoutProcess /></ProtectedRoute>} />
                    <Route path="/admin/transactions" element={<ProtectedRoute allowedRoles={['admin', 'finance_manager']}><AdminTransactions /></ProtectedRoute>} />
                    <Route path="/admin/ba-transactions" element={<ProtectedRoute allowedRoles={['admin', 'finance_manager']}><AdminBATransactions /></ProtectedRoute>} />
                    <Route path="/admin/tickets" element={<ProtectedRoute allowedRoles={['admin', 'support_agent']}><AdminTickets /></ProtectedRoute>} />
                    <Route path="/admin/tickets/:id" element={<ProtectedRoute allowedRoles={['admin', 'support_agent']}><AdminTicketDetail /></ProtectedRoute>} />
                    <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={['admin']}><AdminLogs /></ProtectedRoute>} />
                    <Route path="/admin/files" element={<ProtectedRoute allowedRoles={['admin']}><AdminFiles /></ProtectedRoute>} />
                    <Route path="/admin/files/create" element={<ProtectedRoute allowedRoles={['admin']}><AdminFileForm /></ProtectedRoute>} />
                    <Route path="/admin/files/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminFileForm /></ProtectedRoute>} />

                    {/* Admin Reports */}
                    <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />

                    {/* Admin Content Management */}
                    <Route path="/admin/faqs" element={<ProtectedRoute allowedRoles={['admin', 'support_agent']}><AdminFAQs /></ProtectedRoute>} />
                    <Route path="/admin/faqs/create" element={<ProtectedRoute allowedRoles={['admin', 'support_agent']}><AdminFAQForm /></ProtectedRoute>} />
                    <Route path="/admin/faqs/edit/:id" element={<ProtectedRoute allowedRoles={['admin', 'support_agent']}><AdminFAQForm /></ProtectedRoute>} />
                    <Route path="/admin/how-to-use" element={<ProtectedRoute allowedRoles={['admin', 'support_agent']}><AdminHowToUse /></ProtectedRoute>} />
                    <Route path="/admin/how-to-use/create" element={<ProtectedRoute allowedRoles={['admin', 'support_agent']}><AdminHowToUseForm /></ProtectedRoute>} />
                    <Route path="/admin/how-to-use/edit/:id" element={<ProtectedRoute allowedRoles={['admin', 'support_agent']}><AdminHowToUseForm /></ProtectedRoute>} />

                    {/* Admin Curated Analysis */}
                    <Route path="/admin/analysis" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalysis /></ProtectedRoute>} />
                    <Route path="/admin/analysis/create" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalysisForm /></ProtectedRoute>} />
                    <Route path="/admin/analysis/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalysisForm /></ProtectedRoute>} />

                    <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
                    <Route path="/admin/email-templates" element={<ProtectedRoute allowedRoles={['admin']}><AdminEmailTemplates /></ProtectedRoute>} />
                    <Route path="/admin/email-templates/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminEmailTemplateEdit /></ProtectedRoute>} />
                    <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={['admin', 'support_agent']}><AdminAnnouncements /></ProtectedRoute>} />
                    <Route path="/admin/announcements/create" element={<ProtectedRoute allowedRoles={['admin', 'support_agent']}><AdminAnnouncementForm /></ProtectedRoute>} />
                    <Route path="/admin/announcements/edit/:id" element={<ProtectedRoute allowedRoles={['admin', 'support_agent']}><AdminAnnouncementForm /></ProtectedRoute>} />

                    {/* Legal Pages */}
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsConditions />} />
                    <Route path="/contact" element={<ContactUs />} />

                    {/* Redirects for legacy/broken links */}
                    <Route path="/commissions" element={<Navigate to="/business-associate/commissions" replace />} />

                    {/* Default Routes */}
                    <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </div>
    );
}

export default App;
