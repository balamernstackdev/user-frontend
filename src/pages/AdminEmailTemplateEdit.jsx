import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import EmailTemplateService from '../services/emailTemplate.service';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
    ArrowLeft,
    Save,
    X,
    Code,
    Eye,
    Info,
    PlusCircle,
    FileEdit,
    Tag
} from 'lucide-react';
import './styles/AdminListings.css';

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
            const textarea = document.getElementById('body');
            if (textarea) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const text = formData.body;
                const newText = text.substring(0, start) + variableTag + text.substring(end);
                setFormData(prev => ({ ...prev, body: newText }));

                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + variableTag.length;
                    textarea.focus();
                }, 0);
            }
        } else {
            setFormData(prev => ({
                ...prev,
                body: prev.body + ' ' + variableTag + ' '
            }));
        }

        toast.success(`Inserted {{${variable}}}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.subject.trim()) {
            toast.error('Subject line is required');
            return;
        }

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
                <div className="container py-5 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!template) return null;

    return (
        <DashboardLayout>
            <div className="admin-listing-page animate-fade-up">
                <div className="admin-container">
                    <div className="admin-listing-header mb-4">
                        <div className="header-title">
                            <Link to="/admin/email-templates" className="text-decoration-none text-muted small mb-3 d-flex align-items-center gap-1 hover-primary-text">
                                <ArrowLeft size={14} /> Back to Templates
                            </Link>
                            <h1>Edit Template</h1>
                            <p className="text-muted mb-0">Customize content for system notification emails</p>
                        </div>
                    </div>

                    <div className="row g-4 justify-content-center">
                        <div className="col-lg-12">
                            <div className="listing-table-container p-4">
                                <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                                    <div className="d-flex align-items-center gap-2">
                                        <FileEdit size={20} className="text-primary" />
                                        <h4 className="fw-bold mb-0">{template.name}</h4>
                                        <span className="badge bg-light text-muted border px-2 py-1 ms-2 font-monospace" style={{ fontSize: '11px' }}>
                                            <Tag size={10} className="me-1" /> {template.slug}
                                        </span>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button
                                            type="button"
                                            className={`tj-btn ${viewMode === 'visual' ? 'tj-btn-primary' : 'tj-btn-secondary'}`}
                                            onClick={() => setViewMode('visual')}
                                            style={{ height: '36px' }}
                                        >
                                            <Eye size={16} className="me-1" /> Visual
                                        </button>
                                        <button
                                            type="button"
                                            className={`tj-btn ${viewMode === 'html' ? 'tj-btn-primary' : 'tj-btn-secondary'}`}
                                            onClick={() => setViewMode('html')}
                                            style={{ height: '36px' }}
                                        >
                                            <Code size={16} className="me-1" /> HTML
                                        </button>
                                    </div>
                                </div>

                                <div className="row g-4">
                                    <div className="col-lg-8">
                                        <form onSubmit={handleSubmit}>
                                            <div className="form-group mb-4">
                                                <label className="form-label fw-bold small text-muted text-uppercase mb-2">Subject Line</label>
                                                <input
                                                    type="text"
                                                    name="subject"
                                                    className="form-control"
                                                    style={{ height: '54px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '600' }}
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Enter email subject..."
                                                />
                                            </div>

                                            <div className="form-group mb-4">
                                                <label className="form-label fw-bold small text-muted text-uppercase mb-2">Email Content</label>
                                                {viewMode === 'visual' ? (
                                                    <div className="border rounded-4 overflow-hidden shadow-sm" style={{ background: 'white' }}>
                                                        <ReactQuill
                                                            theme="snow"
                                                            value={formData.body}
                                                            onChange={handleEditorChange}
                                                            modules={modules}
                                                            formats={formats}
                                                            style={{ minHeight: '450px' }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="border rounded-4 overflow-hidden shadow-sm">
                                                        <textarea
                                                            id="body"
                                                            name="body"
                                                            className="form-control border-0 font-monospace"
                                                            value={formData.body}
                                                            onChange={handleChange}
                                                            rows="20"
                                                            style={{ fontSize: '14px', resize: 'vertical', background: '#f8fafc', padding: '20px' }}
                                                            required
                                                        />
                                                    </div>
                                                )}
                                                <div className="form-text small mt-3 d-flex align-items-center gap-2 text-muted">
                                                    <Info size={14} />
                                                    <span>{viewMode === 'visual' ? 'Visual preview of the email content.' : 'Direct HTML editing for precise control.'}</span>
                                                </div>
                                            </div>

                                            <div className="d-flex gap-3 pt-4 border-top">
                                                <button
                                                    type="submit"
                                                    className="tj-btn tj-btn-primary px-5 py-3 h-auto"
                                                    disabled={saving}
                                                    style={{ borderRadius: '12px', fontSize: '1rem' }}
                                                >
                                                    {saving ? (
                                                        <><span className="spinner-border spinner-border-sm me-2"></span> Saving Changes...</>
                                                    ) : (
                                                        <><Save size={20} className="me-2" /> Save Template Changes</>
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="tj-btn tj-btn-secondary px-4 py-3 h-auto"
                                                    onClick={() => navigate('/admin/email-templates')}
                                                    style={{ borderRadius: '12px' }}
                                                >
                                                    <X size={20} className="me-2" /> Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    <div className="col-lg-4">
                                        <div className="p-4 rounded-4 bg-light border sticky-top" style={{ top: '20px' }}>
                                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                                <PlusCircle size={18} className="text-primary" /> Template Variables
                                            </h6>
                                            <p className="text-muted small mb-4">Click any variable below to insert it at your cursor position.</p>

                                            <div className="d-flex flex-wrap gap-2">
                                                {template.variables && template.variables.map(v => (
                                                    <button
                                                        key={v}
                                                        type="button"
                                                        onClick={() => insertVariable(v)}
                                                        className="badge bg-white text-dark border px-3 py-2 fw-medium font-monospace hover-primary-btn"
                                                        style={{ cursor: 'pointer', transition: 'all 0.2s', borderRadius: '8px' }}
                                                    >
                                                        {`{{${v}}}`}
                                                    </button>
                                                ))}
                                            </div>

                                            {(!template.variables || template.variables.length === 0) && (
                                                <div className="text-center py-4 bg-white rounded-3 border-dashed">
                                                    <span className="text-muted small italic">No variables available</span>
                                                </div>
                                            )}

                                            <div className="mt-4 pt-4 border-top">
                                                <div className="alert alert-info border-0 rounded-3 small mb-0 py-3">
                                                    <div className="d-flex gap-2">
                                                        <Info size={18} className="flex-shrink-0" />
                                                        <span>These variables will be dynamically replaced with user-specific data at the time of sending.</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .hover-primary-btn:hover {
                    border-color: #13689e !important;
                    color: #13689e !important;
                    background: rgba(19, 104, 158, 0.05) !important;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                }
                .hover-primary-text:hover {
                    color: #13689e !important;
                }
                .quill {
                    border: none !important;
                }
                .ql-toolbar {
                    border: none !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                    background: #f8fafc;
                }
                .ql-container {
                    border: none !important;
                    font-family: 'Inter', sans-serif !important;
                    font-size: 15px !important;
                }
                .ql-editor {
                    min-height: 450px;
                    padding: 20px !important;
                }
            `}</style>
        </DashboardLayout>
    );
};

export default AdminEmailTemplateEdit;
