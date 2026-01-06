import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import announcementService from '../services/announcement.service';
import { toast } from 'react-toastify';

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
                <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <section className="page-section">
                <div className="container">
                    <div className="page-header animate-fade-up">
                        <h1>{isEditMode ? 'Edit Announcement' : 'Create Announcement'}</h1>
                        <p>{isEditMode ? 'Update existing announcement' : 'Create a new announcement for users'}</p>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="content-card animate-fade-up">
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group mb-3">
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
                                    <div className="form-group mb-3">
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

                                    <div className="d-flex gap-2 justify-content-end mt-4">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => navigate('/admin/announcements')}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                                            {submitting ? 'Saving...' : (isEditMode ? 'Update Announcement' : 'Post Announcement')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default AdminAnnouncementForm;
