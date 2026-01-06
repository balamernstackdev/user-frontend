import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import EmailTemplateService from '../services/emailTemplate.service';
import { toast } from 'react-toastify';
import './AdminListings.css';

const AdminEmailTemplateEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        body: ''
    });

    useEffect(() => {
        fetchTemplate();
    }, [id]);

    const fetchTemplate = async () => {
        try {
            const response = await EmailTemplateService.getAllTemplates();
            if (response.success) {
                const found = response.data.find(t => t.id === parseInt(id));
                if (found) {
                    setTemplate(found);
                    setFormData({
                        subject: found.subject,
                        body: found.body
                    });
                } else {
                    toast.error('Template not found');
                    navigate('/admin/email-templates');
                }
            }
        } catch (error) {
            console.error('Error fetching template:', error);
            toast.error('Failed to load template');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await EmailTemplateService.updateTemplate(id, formData);
            if (response.success) {
                toast.success('Template updated successfully');
                navigate('/admin/email-templates');
            }
        } catch (error) {
            console.error('Error updating template:', error);
            toast.error('Failed to update template');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <section className="page-section">
                    <div className="container">
                        <div className="text-center py-5">
                            <span className="spinner-small"></span> Loading...
                        </div>
                    </div>
                </section>
            </DashboardLayout>
        );
    }

    if (!template) return null;

    return (
        <DashboardLayout>
            <div className="admin-listing-page animate-fade-up">
                <div className="container">
                    <div className="admin-listing-header mb-4">
                        <div>
                            <Link to="/admin/email-templates" className="back-link mb-2 d-inline-flex align-items-center text-decoration-none text-muted">
                                <i className="fas fa-arrow-left me-2"></i> Back to Templates
                            </Link>
                            <div className="header-title mt-2">
                                <h1>Edit Template: {template.name}</h1>
                                <p style={{ color: '#6c757d' }}>Customize the content and subject line for this email template.</p>
                            </div>
                        </div>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <div className="listing-table-container p-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>

                                <div className="mb-4 p-3 bg-light rounded-3 border border-light">
                                    <h6 className="d-flex align-items-center text-primary mb-3">
                                        <i className="fas fa-code me-2"></i> Available Variables
                                    </h6>
                                    <div className="d-flex flex-wrap gap-2">
                                        {template.variables && template.variables.map(v => (
                                            <span key={v} className="badge bg-white text-dark border px-3 py-2 fw-normal font-monospace">
                                                {`{{${v}}}`}
                                            </span>
                                        ))}
                                    </div>
                                    <small className="d-block mt-2 text-muted">
                                        Click to copy variables to your clipboard (optional feature idea) or just reference them.
                                    </small>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="form-group mb-4">
                                        <label htmlFor="subject" className="form-label fw-bold small text-uppercase text-muted">Subject Line</label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            className="form-control form-control-lg"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter email subject"
                                        />
                                    </div>

                                    <div className="form-group mb-4">
                                        <label htmlFor="body" className="form-label fw-bold small text-uppercase text-muted">Email Body (HTML)</label>
                                        <div className="border rounded-3 overflow-hidden">
                                            <textarea
                                                id="body"
                                                name="body"
                                                className="form-control border-0"
                                                value={formData.body}
                                                onChange={handleChange}
                                                rows="15"
                                                style={{ fontFamily: 'monospace', fontSize: '14px', resize: 'vertical' }}
                                                required
                                            />
                                        </div>
                                        <div className="form-text mt-2">
                                            <i className="fas fa-info-circle me-1"></i>
                                            Supports standard HTML tags. Use inline styles for best compatibility.
                                        </div>
                                    </div>

                                    <div className="d-flex gap-3 pt-3 border-top">
                                        <button
                                            type="button"
                                            className="btn btn-light px-4"
                                            onClick={() => navigate('/admin/email-templates')}
                                            disabled={saving}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary px-4"
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-save me-2"></i> Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminEmailTemplateEdit;
