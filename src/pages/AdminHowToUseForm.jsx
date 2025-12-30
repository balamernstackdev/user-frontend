import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import tutorialService from '../services/tutorial.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import './AdminForms.css';

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            setError('Failed to load guide details');
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
        setError('');
        setLoading(true);

        try {
            const dataToSubmit = {
                ...formData,
                isPublished: formData.isPublished,
                orderIndex: parseInt(formData.orderIndex) // Ensure number
            };

            if (isEditMode) {
                await tutorialService.updateTutorial(id, dataToSubmit);
            } else {
                await tutorialService.createTutorial(dataToSubmit);
            }
            navigate('/admin/how-to-use');
        } catch (err) {
            console.error('Error saving guide:', err);
            setError(err.response?.data?.message || 'Failed to save guide');
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
                                {error && <div className="alert alert-error">{error}</div>}

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
                                                <label htmlFor="videoUrl">Video URL</label>
                                                <input
                                                    type="text"
                                                    id="videoUrl"
                                                    name="videoUrl"
                                                    className="form-control"
                                                    value={formData.videoUrl}
                                                    onChange={handleChange}
                                                    placeholder="YouTube/Vimeo Link"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
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
                                        </div>
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
