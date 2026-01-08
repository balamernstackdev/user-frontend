import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import announcementService from '../services/announcement.service';
import { toast } from 'react-toastify';
import './AdminForms.css';

const AdminAnnouncementForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(isEditMode);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'dashboard',
        target_role: 'all'
    });

    useEffect(() => {
        if (isEditMode) {
            fetchAnnouncement();
        }
    }, [id]);

    const fetchAnnouncement = async () => {
        try {
            const response = await announcementService.getById(id);
            if (response.success || response.data) {
                // Adjust depending on API response structure
                const data = response.data || response;
                setFormData({
                    title: data.title,
                    content: data.content,
                    type: data.type,
                    target_role: data.target_role
                });
            }
        } catch (error) {
            console.error('Error fetching announcement:', error);
            toast.error('Failed to load announcement details');
            navigate('/admin/announcements');
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
        setSubmitting(true);
        try {
            if (isEditMode) {
                await announcementService.update(id, formData);
                toast.success('Announcement updated successfully');
            } else {
                await announcementService.create(formData);
                toast.success('Announcement created successfully');
            }
            navigate('/admin/announcements');
        } catch (error) {
            console.error('Error saving announcement:', error);
            toast.error(error.response?.data?.message || 'Failed to save announcement');
        } finally {
            setSubmitting(false);
        }
    };

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

    return (
        <DashboardLayout>
            <div className="admin-form-page animate-fade-up">
                <div className="container">
                    <div className="admin-form-header mb-4">
                        <h2>{isEditMode ? 'Edit Announcement' : 'Create Announcement'}</h2>
                        <p>{isEditMode ? 'Update existing announcement' : 'Create a new announcement for users'}</p>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="admin-form-card">
                                <div className="card-body p-4">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label htmlFor="title" className="form-label">Title</label>
                                            <input
                                                type="text"
                                                id="title"
                                                name="title"
                                                className="form-control"
                                                value={formData.title}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="content" className="form-label">Content</label>
                                            <textarea
                                                id="content"
                                                name="content"
                                                className="form-control"
                                                value={formData.content}
                                                onChange={handleChange}
                                                rows="6"
                                                required
                                            ></textarea>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="type" className="form-label">Type</label>
                                                    <select
                                                        id="type"
                                                        name="type"
                                                        className="form-control"
                                                        value={formData.type}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="dashboard">Dashboard Only</option>
                                                        <option value="email">Email Only</option>
                                                        <option value="both">Both</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="target_role" className="form-label">Target Audience</label>
                                                    <select
                                                        id="target_role"
                                                        name="target_role"
                                                        className="form-control"
                                                        value={formData.target_role}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="all">All Users</option>
                                                        <option value="user">Regular Users</option>
                                                        <option value="business_associate">Business Associates</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-end gap-2 mt-4">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => navigate('/admin/announcements')}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="tj-primary-btn"
                                                disabled={submitting}
                                            >
                                                <span className="btn-text">
                                                    {submitting ? 'Saving...' : (isEditMode ? 'Update Announcement' : 'Post Announcement')}
                                                </span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminAnnouncementForm;
