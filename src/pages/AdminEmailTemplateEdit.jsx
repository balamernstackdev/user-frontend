import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import EmailTemplateService from '../services/emailTemplate.service';
import { toast } from 'react-toastify';

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
            <section className="page-section">
                <div className="container">
                    <div className="page-header animate-fade-up">
                        <Link to="/admin/email-templates" className="back-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#6c757d', textDecoration: 'none', marginBottom: '20px' }}>
                            <i className="fas fa-arrow-left"></i> Back to Templates
                        </Link>
                        <h1>Edit Template: {template.name}</h1>
                    </div>

                    <div className="content-card animate-fade-up" style={{ animationDelay: '0.1s' }}>
                        <div className="alert alert-info" style={{ marginBottom: '20px' }}>
                            <strong>Available Variables:</strong>
                            <div style={{ marginTop: '5px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {template.variables && template.variables.map(v => (
                                    <code key={v} style={{ background: '#e9ecef', padding: '2px 6px', borderRadius: '4px' }}>
                                        {`{{${v}}}`}
                                    </code>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="subject">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    className="form-control"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="body">Body (HTML)</label>
                                <textarea
                                    id="body"
                                    name="body"
                                    className="form-control"
                                    value={formData.body}
                                    onChange={handleChange}
                                    rows="15"
                                    style={{ fontFamily: 'monospace', fontSize: '14px' }}
                                    required
                                />
                                <small className="text-muted">You can use standard HTML tags.</small>
                            </div>

                            <div className="form-actions" style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => navigate('/admin/email-templates')}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default AdminEmailTemplateEdit;
