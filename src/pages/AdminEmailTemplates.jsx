import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import EmailTemplateService from '../services/emailTemplate.service';
import { toast } from 'react-toastify';
import SkeletonLoader from '../components/dashboard/SkeletonLoader';
import './styles/AdminListings.css';

const AdminEmailTemplates = () => {
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

    return (
        <DashboardLayout>
            <div className="admin-listing-page animate-fade-up">
                <div className="container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Email Templates</h1>
                            <p style={{ color: '#6c757d' }}>Manage dynamic email content for system notifications.</p>
                        </div>
                    </div>

                    <div className="listing-table-container animate-fade-up" style={{ animationDelay: '0.1s' }}>
                        {loading ? (
                            <SkeletonLoader type="table" count={5} />
                        ) : (
                            <div className="table-responsive">
                                <table className="listing-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Subject</th>
                                            <th>Last Updated</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {templates.length > 0 ? (
                                            templates.map((template) => (
                                                <tr key={template.id}>
                                                    <td className="plan-info-cell">
                                                        <div className="plan-name-text">{template.name}</div>
                                                        <div className="plan-slug-text">Slug: {template.slug}</div>
                                                    </td>
                                                    <td style={{ fontWeight: 600, color: '#475569' }}>{template.subject}</td>
                                                    <td>{new Date(template.updated_at).toLocaleDateString()}</td>
                                                    <td>
                                                        <Link to={`/admin/email-templates/${template.id}`} className="tj-btn-sm tj-btn-outline-primary" style={{ textDecoration: 'none' }}>
                                                            <i className="fas fa-edit me-1"></i> Edit
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-4">No templates found</td>
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
