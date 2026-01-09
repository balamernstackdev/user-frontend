import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import tutorialService from '../services/tutorial.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import './styles/AdminForms.css';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { UploadCloud, FileVideo, Image as ImageIcon, X, Eye } from 'lucide-react';

const modules = {
    toolbar: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '-1' }],
        ['link', 'clean']
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link'
];

const AdminHowToUseForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    // Refs for file inputs
    const videoInputRef = useRef(null);
    const thumbnailInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        videoUrl: '',
        thumbnailUrl: '',
        orderIndex: 0,
        isPublished: true,
        category: 'HowToUse'
    });
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            fetchGuide();
        }
    }, [id]);

    const fetchGuide = async () => {
        try {
            setLoading(true);
            const response = await tutorialService.getTutorial(id);
            const data = response.data || response;
            setFormData({
                title: data.title,
                description: data.description || '',
                content: data.content,
                videoUrl: data.video_url || '',
                thumbnailUrl: data.thumbnail_url || '',
                orderIndex: data.order_index || 0,
                isPublished: data.is_published,
                category: data.category || 'HowToUse'
            });
        } catch (err) {
            console.error('Error fetching guide:', err);
            toast.error('Failed to load guide details');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'video') {
                setVideoFile(file);
            } else {
                setThumbnailFile(file);
            }
        }
    };

    const removeFile = (type) => {
        if (type === 'video') {
            setVideoFile(null);
            if (videoInputRef.current) videoInputRef.current.value = '';
        } else {
            setThumbnailFile(null);
            if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description || '');
            data.append('content', formData.content);
            data.append('orderIndex', formData.orderIndex);
            data.append('isPublished', formData.isPublished);
            data.append('category', formData.category);

            // Append existing URLs if no new file is selected, so backend can decide whether to keep them
            if (videoFile) {
                // If uploading a new file, explicitly clear the videoUrl so backend knows to prioritize the file 
                // (though backed logic prioritizes file, this is safer and cleaner).
                data.append('videoUrl', '');
                data.append('video', videoFile);
            } else {
                data.append('videoUrl', formData.videoUrl || '');
            }

            data.append('thumbnailUrl', formData.thumbnailUrl || '');
            if (thumbnailFile) {
                data.append('thumbnail', thumbnailFile);
            }

            if (isEditMode) {
                await tutorialService.updateTutorial(id, data);
                toast.success('Guide updated successfully');
            } else {
                await tutorialService.createTutorial(data);
                toast.success('Guide created successfully');
            }
            navigate('/admin/how-to-use');
        } catch (err) {
            console.error('Error saving guide:', err);
            toast.error(err.response?.data?.message || 'Failed to save guide');
        } finally {
            setLoading(false);
        }
    };

    // Helper component for file upload UI
    const renderFileUpload = (type, fileState, inputRef, currentUrl, label, accept) => {
        const isVideo = type === 'video';
        const Icon = isVideo ? FileVideo : ImageIcon;

        const hasExisting = !fileState && currentUrl;

        return (
            <div className="form-group upload-group">
                <label className="form-label">{label}</label>
                <input
                    type="file"
                    ref={inputRef}
                    accept={accept}
                    onChange={(e) => handleFileChange(e, type)}
                    style={{ display: 'none' }}
                />

                {/* 1. New File Selected */}
                {fileState && (
                    <div className="upload-container has-file">
                        <div className="file-preview-area">
                            <div className="file-icon-preview">
                                <Icon size={24} />
                            </div>
                            <div className="file-info">
                                <span className="file-name">{fileState.name}</span>
                                <small className="text-muted">New Upload - {(fileState.size / 1024 / 1024).toFixed(2)} MB</small>
                            </div>
                            <button
                                type="button"
                                className="btn-remove-file"
                                onClick={() => removeFile(type)}
                                title="Remove new file"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* 2. No New File, But Existing URL Present */}
                {hasExisting && (
                    <div className="upload-container has-file" style={{ borderColor: '#28a745', background: '#f8fff9' }}>
                        <div className="file-preview-area">
                            {/* For Thumbnail: Show Image Preview */}
                            {!isVideo ? (
                                <img
                                    src={currentUrl}
                                    alt="Current thumbnail"
                                    className="image-preview"
                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                                />
                            ) : (
                                /* For Video: Show Video Player */
                                <div className="video-preview-wrapper" style={{ width: '120px', height: 'auto' }}>
                                    <video
                                        controls
                                        style={{ width: '100%', borderRadius: '8px', maxHeight: '80px', objectFit: 'cover' }}
                                    >
                                        <source src={currentUrl.includes('cloudinary') ? currentUrl.replace(/\.[^/.]+$/, ".mp4") : currentUrl} />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            )}

                            <div className="file-info">
                                <span className="file-name" style={{ color: '#155724' }}>Current {isVideo ? 'Video' : 'Thumbnail'}</span>
                                <div className="d-flex align-items-center gap-2">
                                    <a
                                        href={currentUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-muted"
                                        style={{ fontSize: '0.85rem', textDecoration: 'none' }}
                                    >
                                        <Eye size={12} className="me-1" /> View
                                    </a>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="tj-secondary-btn py-1 px-3 h-auto"
                                style={{ fontSize: '0.85rem' }}
                                onClick={() => inputRef.current?.click()}
                            >
                                Change
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. Nothing Selected and No Existing (Empty State) */}
                {!fileState && !currentUrl && (
                    <div
                        className="upload-container"
                        onClick={() => inputRef.current?.click()}
                    >
                        <div className="upload-placeholder">
                            <UploadCloud />
                            <p>Click to upload {isVideo ? 'video' : 'thumbnail'}</p>
                            <small className="text-muted">
                                {isVideo ? 'MP4, WebM up to 50MB' : 'JPG, PNG up to 5MB'}
                            </small>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="admin-form-page animate-fade-up">
                <div className="container">
                    <div className="admin-form-header">
                        <h1>{isEditMode ? 'Edit Guide' : 'Create New Guide'}</h1>
                        <p>{isEditMode ? 'Update the content and media for this tutorial.' : 'Add a new tutorial guide to the Help Center.'}</p>
                    </div>

                    <div className="row">
                        <div className="col-lg-10 mx-auto">
                            <div className="admin-form-card">
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="title" className="form-label">Title</label>
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            className="form-control"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g., How to Create an Account"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="description" className="form-label">Short Description</label>
                                        <input
                                            type="text"
                                            id="description"
                                            name="description"
                                            className="form-control"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Brief summary used in listings"
                                        />
                                    </div>

                                    <div className="form-group quill-editor-container">
                                        <label htmlFor="content" className="form-label">Content / Steps</label>
                                        <div className="editor-wrapper">
                                            <ReactQuill
                                                theme="snow"
                                                value={formData.content}
                                                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                                                modules={modules}
                                                formats={formats}
                                                placeholder="Detailed steps or HTML content..."
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            {renderFileUpload(
                                                'video',
                                                videoFile,
                                                videoInputRef,
                                                formData.videoUrl,
                                                'Upload Video',
                                                'video/*'
                                            )}
                                        </div>
                                        <div className="col-md-6">
                                            {renderFileUpload(
                                                'thumbnail',
                                                thumbnailFile,
                                                thumbnailInputRef,
                                                formData.thumbnailUrl,
                                                'Upload Thumbnail',
                                                'image/*'
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="orderIndex" className="form-label">Display Order</label>
                                        <input
                                            type="number"
                                            id="orderIndex"
                                            name="orderIndex"
                                            className="form-control"
                                            value={formData.orderIndex}
                                            onChange={handleChange}
                                            min="0"
                                        />
                                    </div>

                                    <div className="form-group checkbox-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                name="isPublished"
                                                checked={formData.isPublished}
                                                onChange={handleChange}
                                            />
                                            Publish immediately
                                        </label>
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            className="tj-secondary-btn"
                                            onClick={() => navigate('/admin/how-to-use')}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="tj-primary-btn"
                                            disabled={loading}
                                        >
                                            {loading ? 'Saving...' : (isEditMode ? 'Update Guide' : 'Create Guide')}
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

export default AdminHowToUseForm;
