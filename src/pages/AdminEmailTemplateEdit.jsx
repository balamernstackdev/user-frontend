import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import EmailTemplateService from '../services/emailTemplate.service';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './AdminListings.css';

const AdminEmailTemplateEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState('visual'); // visual or html
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

    const handleEditorChange = (content) => {
        setFormData(prev => ({ ...prev, body: content }));
    };

    const insertVariable = (variable) => {
        const variableTag = `{{${variable}}}`;

        if (viewMode === 'html') {
            // Insert at cursor position in textarea
            const textarea = document.getElementById('body');
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = formData.body;
            const newText = text.substring(0, start) + variableTag + text.substring(end);
            setFormData(prev => ({ ...prev, body: newText }));

            // Restore cursor position
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + variableTag.length;
                textarea.focus();
            }, 0);
        } else {
            // Insert in visual editor
            setFormData(prev => ({
                ...prev,
                body: prev.body + ' ' + variableTag + ' '
            }));
        }

        toast.success(`Inserted {{${variable}}}`);
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

    // Quill modules configuration
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['link'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'list', 'bullet',
        'align',
        'link'
    ];

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

                                {/* Variable Reference */}
                                <div className="mb-4 p-3 bg-light rounded-3 border border-light">
                                    <h6 className="d-flex align-items-center text-primary mb-3">
                                        <i className="fas fa-code me-2"></i> Available Variables - Click to Insert
                                    </h6>
                                    <div className="d-flex flex-wrap gap-2">
                                        {template.variables && template.variables.map(v => (
                                            <button
                                                key={v}
                                                type="button"
                                                onClick={() => insertVariable(v)}
                                                className="badge bg-white text-dark border px-3 py-2 fw-normal font-monospace"
                                                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                                onMouseOver={(e) => { e.target.style.background = '#13689e'; e.target.style.color = 'white'; }}
                                                onMouseOut={(e) => { e.target.style.background = 'white'; e.target.style.color = '#000'; }}
                                            >
                                                <i className="fas fa-plus-circle me-1"></i>
                                                {`{{${v}}}`}
                                            </button>
                                        ))}
                                    </div>
                                    <small className="d-block mt-2 text-muted">
                                        <i className="fas fa-info-circle me-1"></i>
                                        Click any variable to insert it into your email content. Variables will be automatically replaced with actual data when emails are sent.
                                    </small>
                                </div>

                                {/* Editor Mode Toggle */}
                                <div className="mb-3 d-flex gap-2 border-bottom pb-3">
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${viewMode === 'visual' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => setViewMode('visual')}
                                    >
                                        <i className="fas fa-eye me-1"></i> Visual Editor
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${viewMode === 'html' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => setViewMode('html')}
                                    >
                                        <i className="fas fa-code me-1"></i> HTML Editor
                                    </button>
                                    <small className="text-muted ms-auto align-self-center">
                                        {viewMode === 'visual' ? 'User-friendly visual editor' : 'Advanced HTML editing'}
                                    </small>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    {/* Subject Line */}
                                    <div className="form-group mb-4">
                                        <label htmlFor="subject" className="form-label fw-bold small text-uppercase text-muted">
                                            Subject Line
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            className="form-control form-control-lg"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter email subject (you can use variables here too)"
                                        />
                                    </div>

                                    {/* Email Body */}
                                    <div className="form-group mb-4">
                                        <label htmlFor="body" className="form-label fw-bold small text-uppercase text-muted">
                                            Email Body
                                        </label>

                                        {viewMode === 'visual' ? (
                                            <div className="border rounded-3 overflow-hidden" style={{ background: 'white' }}>
                                                <ReactQuill
                                                    theme="snow"
                                                    value={formData.body}
                                                    onChange={handleEditorChange}
                                                    modules={modules}
                                                    formats={formats}
                                                    style={{ minHeight: '400px' }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="border rounded-3 overflow-hidden">
                                                <textarea
                                                    id="body"
                                                    name="body"
                                                    className="form-control border-0"
                                                    value={formData.body}
                                                    onChange={handleChange}
                                                    rows="20"
                                                    style={{ fontFamily: 'monospace', fontSize: '14px', resize: 'vertical' }}
                                                    required
                                                />
                                            </div>
                                        )}

                                        <div className="form-text mt-2">
                                            <i className="fas fa-info-circle me-1"></i>
                                            {viewMode === 'visual'
                                                ? 'Use the toolbar above to format your email. Click variable badges to insert them.'
                                                : 'Supports standard HTML tags. Use inline styles for best email compatibility.'}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
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
