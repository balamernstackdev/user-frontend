import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import AnalysisService from '../services/analysis.service';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './AdminForms.css';
import { toast } from 'react-toastify';

const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image', 'clean'],
    ],
};

const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
];

const AdminAnalysisForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        category: '',
        image_url: '',
        pdf_url: '',
        is_premium: false,
        is_published: false
    });

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState({ image: false, pdf: false });

    const imageInputRef = useRef(null);
    const pdfInputRef = useRef(null);

    useEffect(() => {
        if (isEdit) {
            fetchAnalysis();
        }
    }, [id]);

    const fetchAnalysis = async () => {
        try {
            setLoading(true);
            const response = await AnalysisService.getAnalysis(id);
            const data = response.data;
            setFormData({
                title: data.title,
                description: data.description || '',
                content: data.content,
                category: data.category || '',
                image_url: data.image_url || '',
                pdf_url: data.pdf_url || '',
                is_premium: !!data.is_premium,
                is_published: !!data.is_published
            });
        } catch (err) {
            toast.error('Failed to load analysis details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleContentChange = (content) => {
        setFormData(prev => ({ ...prev, content }));
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(prev => ({ ...prev, [type]: true }));
            const response = await AnalysisService.uploadFile(file);

            if (response.status === 'success') {
                setFormData(prev => ({
                    ...prev,
                    [type === 'image' ? 'image_url' : 'pdf_url']: response.data.url
                }));
            }
        } catch (err) {
            console.error(`Failed to upload ${type}:`, err);
            toast.error(`Failed to upload ${type}. Please try again.`);
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    const removeFile = (type) => {
        setFormData(prev => ({
            ...prev,
            [type === 'image' ? 'image_url' : 'pdf_url']: ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);

            if (isEdit) {
                await AnalysisService.updateAnalysis(id, formData);
            } else {
                await AnalysisService.createAnalysis(formData);
            }

            toast.success(isEdit ? 'Analysis updated successfully' : 'Analysis created successfully');
            navigate('/admin/analysis');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save analysis');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <DashboardLayout><div className="text-center p-5">Loading...</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <section className="admin-form-page animate-fade-up">
                <div className="container">
                    <div className="form-header d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="tj-section-title">{isEdit ? 'Edit' : 'Create'} Market Analysis</h2>
                            <p className="text-muted">Fill in the details to publish expert market insights.</p>
                        </div>
                        <Link to="/admin/analysis" className="back-link">
                            <i className="fas fa-arrow-left"></i> Back to List
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            {/* Main Content Area */}
                            <div className="col-lg-8">
                                <div className="admin-card mb-4">
                                    <div className="form-group mb-4">
                                        <label className="form-label">Analysis Title*</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="e.g. BTC/USD Technical Outlook: Q4 2025"
                                            required
                                        />
                                    </div>

                                    <div className="form-group mb-4">
                                        <label className="form-label">Category*</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            placeholder="e.g. Technical, Fundamental, Crypto"
                                            required
                                        />
                                    </div>

                                    <div className="form-group mb-4">
                                        <label className="form-label">Short Description*</label>
                                        <textarea
                                            className="form-control"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Brief overview for the listing card..."
                                            rows="3"
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="form-group mb-0">
                                        <label className="form-label">Full Content (Professional Editor)*</label>
                                        <div className="editor-wrapper">
                                            <ReactQuill
                                                theme="snow"
                                                value={formData.content}
                                                onChange={handleContentChange}
                                                modules={quillModules}
                                                formats={quillFormats}
                                                placeholder="Write your analysis here..."
                                            />
                                        </div>
                                        <small className="text-muted mt-2 d-block">
                                            <i className="fas fa-magic mr-1"></i> Use the toolbar to align, style, and format your analysis professionally.
                                        </small>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Area */}
                            <div className="col-lg-4">
                                {/* Featured Image Upload */}
                                <div className="admin-card mb-4">
                                    <label className="form-label">Featured Image</label>
                                    <div
                                        className={`upload-container ${formData.image_url ? 'has-file' : ''}`}
                                        onClick={() => !uploading.image && imageInputRef.current.click()}
                                    >
                                        <input
                                            type="file"
                                            hidden
                                            ref={imageInputRef}
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, 'image')}
                                        />

                                        {uploading.image ? (
                                            <div className="upload-placeholder">
                                                <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                                                <p>Uploading Image...</p>
                                            </div>
                                        ) : formData.image_url ? (
                                            <div className="file-preview-area">
                                                <img src={formData.image_url} alt="Preview" className="image-preview" />
                                                <div className="file-info">
                                                    <span className="file-name text-truncate" style={{ maxWidth: '150px' }}>Image Uploaded</span>
                                                </div>
                                                <button type="button" className="btn-remove-file" onClick={(e) => { e.stopPropagation(); removeFile('image'); }}>
                                                    <i className="fas fa-times-circle"></i>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="upload-placeholder">
                                                <i className="fas fa-cloud-upload-alt"></i>
                                                <p>Click to upload image</p>
                                                <small className="text-muted">JPG, PNG allowed</small>
                                            </div>
                                        )}
                                        {uploading.image && <div className="upload-progress-bar" style={{ width: '60%' }}></div>}
                                    </div>
                                </div>

                                {/* PDF Report Upload */}
                                <div className="admin-card mb-4">
                                    <label className="form-label">Downloadable Report (PDF)</label>
                                    <div
                                        className={`upload-container ${formData.pdf_url ? 'has-file' : ''}`}
                                        onClick={() => !uploading.pdf && pdfInputRef.current.click()}
                                    >
                                        <input
                                            type="file"
                                            hidden
                                            ref={pdfInputRef}
                                            accept="application/pdf"
                                            onChange={(e) => handleFileUpload(e, 'pdf')}
                                        />

                                        {uploading.pdf ? (
                                            <div className="upload-placeholder">
                                                <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                                                <p>Uploading PDF...</p>
                                            </div>
                                        ) : formData.pdf_url ? (
                                            <div className="file-preview-area">
                                                <div className="file-icon-preview">
                                                    <i className="fas fa-file-pdf"></i>
                                                </div>
                                                <div className="file-info">
                                                    <span className="file-name text-truncate" style={{ maxWidth: '150px' }}>PDF Document</span>
                                                </div>
                                                <button type="button" className="btn-remove-file" onClick={(e) => { e.stopPropagation(); removeFile('pdf'); }}>
                                                    <i className="fas fa-times-circle"></i>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="upload-placeholder">
                                                <i className="fas fa-file-upload"></i>
                                                <p>Click to upload PDF</p>
                                                <small className="text-muted">Strategic report file</small>
                                            </div>
                                        )}
                                        {uploading.pdf && <div className="upload-progress-bar" style={{ width: '60%' }}></div>}
                                    </div>
                                </div>

                                {/* Settings Area */}
                                <div className="admin-card mb-4">
                                    <label className="form-label mb-3">Publication Settings</label>

                                    <div className="checkbox-group flex-column gap-3 p-0 bg-transparent border-0">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                name="is_premium"
                                                checked={formData.is_premium}
                                                onChange={handleChange}
                                            />
                                            <span>Premium Analysis</span>
                                        </label>

                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                name="is_published"
                                                checked={formData.is_published}
                                                onChange={handleChange}
                                            />
                                            <span>Published / Active</span>
                                        </label>
                                    </div>

                                    <hr className="my-4" />

                                    <div className="form-actions flex-column gap-2 border-0 p-0 mt-0">
                                        <button
                                            type="submit"
                                            className="tj-primary-btn w-100"
                                            disabled={submitting || uploading.image || uploading.pdf}
                                        >
                                            <span className="btn-text">
                                                <span>{submitting ? 'Saving...' : (isEdit ? <><i className="fas fa-save mr-2"></i> Update Analysis</> : <><i className="fas fa-plus mr-2"></i> Create Analysis</>)}</span>
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            className="tj-secondary-btn w-100"
                                            onClick={() => navigate('/admin/analysis')}
                                        >
                                            <span className="btn-text"><span>Cancel</span></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default AdminAnalysisForm;
