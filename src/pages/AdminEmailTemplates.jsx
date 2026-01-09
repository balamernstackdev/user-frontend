import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import EmailTemplateService from '../services/emailTemplate.service';
import { toast } from 'react-toastify';
import SkeletonLoader from '../components/dashboard/SkeletonLoader';
import SEO from '../components/common/SEO';
import {
    Mail,
    Edit,
    Clock,
    Tag,
    ChevronRight,
    AlertTriangle,
    RefreshCcw,
    Ticket,
    MessageSquare,
    CheckCircle,
    UserPlus,
    IndianRupee,
    Wallet,
    FileText,
    Bell,
    Sparkles
} from 'lucide-react';
import './styles/AdminListings.css';

const AdminEmailTemplates = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await EmailTemplateService.getAllTemplates();
            if (response.success) {
                setTemplates(response.data);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
            toast.error('Failed to load email templates');
        } finally {
            setLoading(false);
        }
    };

    const getTemplateStyle = (slug) => {
        switch (slug) {
            case 'subscription-expired':
            case 'subscription-expiring':
                return { icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
            case 'subscription-renewed':
                return { icon: RefreshCcw, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
            case 'ticket-created':
                return { icon: Ticket, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
            case 'ticket-reply':
                return { icon: MessageSquare, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' };
            case 'ticket-resolved':
                return { icon: CheckCircle, color: '#059669', bg: 'rgba(5, 150, 105, 0.1)' };
            case 'referral-signup':
                return { icon: UserPlus, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
            case 'commission-earned':
                return { icon: IndianRupee, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
            case 'payout-processed':
                return { icon: Wallet, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' };
            case 'file-available':
                return { icon: FileText, color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' };
            case 'new-announcement':
            case 'announcement-created':
                return { icon: Bell, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
            case 'welcome-email':
                return { icon: Sparkles, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' };
            default:
                return { icon: Mail, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
        }
    };

    return (
        <DashboardLayout>
            <SEO title="Email Templates" description="Manage dynamic email content for system notifications" />
            <div className="admin-listing-page animate-fade-up">
                <div className="admin-container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Email Templates</h1>
                            <p className="text-muted mb-0">Manage dynamic email content for system notifications</p>
                        </div>
                    </div>

                    <div className="listing-table-container">
                        {loading ? (
                            <div className="p-4">
                                <SkeletonLoader type="table" count={5} />
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="listing-table">
                                    <thead>
                                        <tr>
                                            <th>Template Details</th>
                                            <th>Subject Line</th>
                                            <th>Last Updated</th>
                                            <th className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {templates.length > 0 ? (
                                            templates.map((template) => (
                                                <tr key={template.id}>
                                                    <td>
                                                        {(() => {
                                                            const style = getTemplateStyle(template.slug);
                                                            const Icon = style.icon;
                                                            return (
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <div
                                                                        className="avatar-circle-sm"
                                                                        style={{
                                                                            background: style.bg,
                                                                            border: `1px solid ${style.bg}`,
                                                                            color: style.color
                                                                        }}
                                                                    >
                                                                        <Icon size={16} />
                                                                    </div>
                                                                    <div className="d-flex flex-column">
                                                                        <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>{template.name}</span>
                                                                        <div className="d-flex align-items-center gap-1 text-muted small" style={{ fontSize: '11px' }}>
                                                                            <Tag size={10} /> {template.slug}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td>
                                                        <div className="text-dark small fw-medium" style={{ maxWidth: '350px' }}>
                                                            {template.subject}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-1 text-muted small">
                                                            <Clock size={12} />
                                                            {new Date(template.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </div>
                                                    </td>
                                                    <td className="text-end">
                                                        <div className="actions-cell justify-content-end">
                                                            <button
                                                                className="action-btn"
                                                                onClick={() => navigate(`/admin/email-templates/${template.id}`)}
                                                                title="Edit Template"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-5">
                                                    <div className="text-muted mb-2"><Mail size={40} className="opacity-20" /></div>
                                                    <p className="text-muted mb-0">No email templates found</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminEmailTemplates;
