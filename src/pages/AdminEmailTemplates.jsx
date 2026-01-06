import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import EmailTemplateService from '../services/emailTemplate.service';
import { toast } from 'react-toastify';
import SkeletonLoader from '../components/dashboard/SkeletonLoader';

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
            <section className="page-section">
                <div className="container">
                    <div className="page-header animate-fade-up">
                        <h1>Email Templates</h1>
                        <p>Manage dynamic email content for system notifications.</p>
                    </div>

                    <div className="content-card animate-fade-up" style={{ animationDelay: '0.1s' }}>
                        {loading ? (
                            <SkeletonLoader type="table" count={5} />
                        ) : (
                            <div className="table-responsive">
                                <table className="table">
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
                                                    <td>
                                                        <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{template.name}</div>
                                                        <div style={{ fontSize: '12px', color: '#6c757d' }}>Slug: {template.slug}</div>
                                                    </td>
                                                    <td>{template.subject}</td>
                                                    <td>{new Date(template.updated_at).toLocaleDateString()}</td>
                                                    <td>
                                                        <Link to={`/admin/email-templates/${template.id}`} className="btn btn-sm btn-outline-primary">
                                                            <i className="fas fa-edit"></i> Edit
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
            </section>
        </DashboardLayout>
    );
};

export default AdminEmailTemplates;
