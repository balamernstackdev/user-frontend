import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import announcementService from '../services/announcement.service';
import { authService } from '../services/auth.service';
import { toast } from 'react-toastify';
import SkeletonLoader from '../components/dashboard/SkeletonLoader';

const AdminAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'dashboard',
        target_role: 'all'
    });

    const user = authService.getUser();
    const isAdmin = user?.role === 'admin';
    const isSupport = user?.role === 'support_agent';

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            // Pass view='admin' for admin and support agents to see all announcements
            const params = (isAdmin || isSupport) ? { view: 'admin' } : {};
            const response = await announcementService.getAll(params);
            if (response.success) {
                setAnnouncements(response.data);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
            // toast.error('Failed to load announcements');
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
            const response = await announcementService.create(formData);
            if (response.success) {
                toast.success('Announcement created successfully');
                setFormData({
                    title: '',
                    content: '',
                    type: 'dashboard',
                    target_role: 'all'
                });
                fetchAnnouncements();
            }
        } catch (error) {
            console.error('Error creating announcement:', error);
            toast.error(error.response?.data?.message || 'Failed to create announcement');
        } finally {
            setSubmitting(false);
        }
    };



    return (
        <DashboardLayout>
            <section className="page-section">
                <div className="container">
                    <div className="page-header animate-fade-up">
                        <h1>Manage Announcements</h1>
                        <p>Broadcast messages to users via dashboard or email.</p>
                    </div>

                    <div className="row">
                        {/* Create Form */}
                        {isAdmin && (
                            <div className="col-lg-4 mb-4">
                                <div className="content-card animate-fade-up" style={{ animationDelay: '0.1s' }}>
                                    <h3 className="card-title">Create New</h3>
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
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="content">Content</label>
                                            <textarea
                                                id="content"
                                                name="content"
                                                className="form-control"
                                                value={formData.content}
                                                onChange={handleChange}
                                                rows="4"
                                                required
                                            ></textarea>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="type">Type</label>
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
                                        <div className="form-group">
                                            <label htmlFor="target_role">Target Audience</label>
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
                                        <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                                            {submitting ? 'Posting...' : 'Post Announcement'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* List */}
                        <div className={isAdmin ? "col-lg-8" : "col-lg-12"}>
                            {/* Admin View: Table */}
                            {isAdmin && (
                                <div className="content-card animate-fade-up" style={{ animationDelay: '0.2s' }}>
                                    <h3 className="card-title">Recent Announcements</h3>
                                    {loading ? (
                                        <SkeletonLoader type="table" count={3} />
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Title</th>
                                                        <th>Type</th>
                                                        <th>Audience</th>
                                                        <th>Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {announcements.length > 0 ? (
                                                        announcements.map((item) => (
                                                            <tr key={item.id}>
                                                                <td>
                                                                    <div style={{ fontWeight: 600 }}>{item.title}</div>
                                                                    <div style={{ fontSize: '12px', color: '#666', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.content}</div>
                                                                </td>
                                                                <td>
                                                                    <span className={`badge bg-${item.type === 'email' ? 'warning' : 'info'}`}>
                                                                        {item.type}
                                                                    </span>
                                                                </td>
                                                                <td>{item.target_role}</td>
                                                                <td>{new Date(item.created_at).toLocaleDateString()}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="4" className="text-center py-4">No announcements yet</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Support View: Cards */}
                            {!isAdmin && (
                                <div className="row">
                                    {loading ? (
                                        <div className="col-12"><SkeletonLoader type="card" count={3} /></div>
                                    ) : announcements.length > 0 ? (
                                        announcements.map((item, index) => (
                                            <div key={item.id} className="col-md-6 mb-4">
                                                <div className="content-card animate-fade-up h-100" style={{ animationDelay: `${index * 0.1}s` }}>
                                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                                        <span className={`badge bg-${item.type === 'email' ? 'warning' : 'info'}`}>
                                                            {item.type === 'dashboard' ? 'In-App' : item.type === 'email' ? 'Email' : 'All Channels'}
                                                        </span>
                                                        <small className="text-muted">{new Date(item.created_at).toLocaleDateString()}</small>
                                                    </div>
                                                    <h3 className="h5 mb-3">{item.title}</h3>
                                                    <p style={{ color: '#666', lineHeight: '1.6' }}>{item.content}</p>
                                                    <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
                                                        <small className="text-muted">Target: <span className="text-capitalize">{item.target_role.replace('_', ' ')}</span></small>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-12">
                                            <div className="content-card text-center py-5">
                                                <i className="fas fa-bullhorn mb-3" style={{ fontSize: '24px', color: '#ccc' }}></i>
                                                <p className="text-muted">No announcements found</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default AdminAnnouncements;
