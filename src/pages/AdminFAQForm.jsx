import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import tutorialService from '../services/tutorial.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import './AdminForms.css'; // Assuming this exists or using generic styles

const AdminFAQForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        isPublished: true,
        category: 'FAQ'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchFAQ();
        }
    }, [id]);

    const fetchFAQ = async () => {
        try {
            setLoading(true);
            const response = await tutorialService.getTutorial(id);
            const data = response.data || response;
            setFormData({
                title: data.title,
                content: data.content,
                isPublished: data.is_published,
                category: 'FAQ'
            });
        } catch (err) {
            console.error('Error fetching FAQ:', err);
            setError('Failed to load FAQ details');
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
                isPublished: formData.isPublished
            };
            console.log('Submitting FAQ data:', dataToSubmit);

            if (isEditMode) {
                await tutorialService.updateTutorial(id, dataToSubmit);
            } else {
                await tutorialService.createTutorial(dataToSubmit);
            }
            navigate('/admin/faqs');
        } catch (err) {
            console.error('Error saving FAQ:', err);
            setError(err.response?.data?.message || 'Failed to save FAQ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="admin-form-page animate-fade-up">
                <div className="container">
                    <div className="admin-form-header">
                        <h1>{isEditMode ? 'Edit FAQ' : 'Create New FAQ'}</h1>
                    </div>

                    <div className="row">
                        <div className="col-lg-10 mx-auto">
                            <div className="admin-form-card">
                                {error && <div className="alert alert-error">{error}</div>}

                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="title">Question</label>
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            className="form-control"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g., How do I reset my password?"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="content">Answer</label>
                                        <textarea
                                            id="content"
                                            name="content"
                                            className="form-control"
                                            value={formData.content}
                                            onChange={handleChange}
                                            required
                                            rows="6"
                                            placeholder="Enter the detailed answer..."
                                        ></textarea>
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
                                            onClick={() => navigate('/admin/faqs')}
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
                                                <span>{loading ? 'Saving...' : (isEditMode ? 'Update Question' : 'Create Question')}</span>
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

export default AdminFAQForm;
