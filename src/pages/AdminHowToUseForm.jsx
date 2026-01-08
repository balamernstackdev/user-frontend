import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import tutorialService from '../services/tutorial.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import './styles/AdminForms.css';
import { toast } from 'react-toastify';

const AdminHowToUseForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

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

            // Append existing URLs if no new file (backend should handle this or ignored if key is videoUrl?)
            // Actually backend looks for `req.body.videoUrl` OR `req.files['video']`.
            // So I should append videoUrl from state if no file, or just let backend keep old one?
            // Existing backend logic:
            // let videoUrl = req.body.videoUrl; 
            // if (req.files && req.files['video']) videoUrl = req.files['video'][0].path;

            // So if I don't send file, I should send the existing URL so it doesn't get wiped if I update the model blindly?
            // Wait, Update logic:
            // const tutorialData = ...
            // if (videoUrl) tutorialData.video_url = videoUrl;
            // It only updates if `videoUrl` (from body or file) is truthy.
            // If I send nothing, it won't update.
            // But Create logic requires valid data.

            // Safe bet: append existing URL to body just in case (though backend reads it).
            data.append('videoUrl', formData.videoUrl || '');
            data.append('thumbnailUrl', formData.thumbnailUrl || '');

            if (videoFile) {
                data.append('video', videoFile);
            }
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

    return (
        <DashboardLayout>
            <div className="admin-form-page animate-fade-up">
                <div className="container">
                    <div className="admin-form-header">
                        <h1>{isEditMode ? 'Edit Guide' : 'Create New Guide'}</h1>
                    </div>

                    <div className="row">
                        <div className="col-lg-10 mx-auto">
                            <div className="admin-form-card">
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="title">Title</label>
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
                                        <label htmlFor="description">Short Description</label>
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

                                    <div className="form-group">
                                        <label htmlFor="content">Content / Steps</label>
                                        <textarea
                                            id="content"
                                            name="content"
                                            className="form-control"
                                            value={formData.content}
                                            onChange={handleChange}
                                            required
                                            rows="8"
                                            placeholder="Detailed steps or HTML content..."
                                        ></textarea>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="video">Upload Video</label>
                                                <input
                                                    type="file"
                                                    id="video"
                                                    name="video"
                                                    accept="video/*"
                                                    className="form-control"
                                                    onChange={(e) => setVideoFile(e.target.files[0])}
                                                />
                                                {formData.videoUrl && <small className="text-muted">Current: <a href={formData.videoUrl} target="_blank" rel="noreferrer">View Video</a></small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="thumbnail">Upload Thumbnail</label>
                                                <input
                                                    type="file"
                                                    id="thumbnail"
                                                    name="thumbnail"
                                                    accept="image/*"
                                                    className="form-control"
                                                    onChange={(e) => setThumbnailFile(e.target.files[0])}
                                                />
                                                {formData.thumbnailUrl && <small className="text-muted">Current: <a href={formData.thumbnailUrl} target="_blank" rel="noreferrer">View Thumbnail</a></small>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="orderIndex">Display Order</label>
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
                                        <label className="checkbox-container">
                                            <input
                                                type="checkbox"
                                                name="isPublished"
                                                checked={formData.isPublished}
                                                onChange={handleChange}
                                            />
                                            <span className="checkmark"></span>
                                            <span className="label-text">Publish immediately</span>
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
                                            <span className="btn-text">
                                                <span>{loading ? 'Saving...' : (isEditMode ? 'Update Guide' : 'Create Guide')}</span>
                                            </span>
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
