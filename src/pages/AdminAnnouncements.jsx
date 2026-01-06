import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import announcementService from '../services/announcement.service';
import { authService } from '../services/auth.service';
import { toast } from 'react-toastify';
import SkeletonLoader from '../components/dashboard/SkeletonLoader';
import './AdminListings.css';

const AdminAnnouncements = () => {
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

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
            if (response.success || Array.isArray(response.data)) {
                // Adjust based on if getAll returns { success: true, data: [] } or just []
                setAnnouncements(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
            // toast.error('Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            try {
                await announcementService.delete(id);
                toast.success('Announcement deleted successfully');
                fetchAnnouncements();
            } catch (error) {
                console.error('Error deleting announcement:', error);
                toast.error('Failed to delete announcement');
            }
        }
    };

    return (
        <DashboardLayout>
            <div className="admin-listing-page animate-fade-up">
                <div className="container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Manage Announcements</h1>
                            <p style={{ color: '#6c757d' }}>Broadcast messages to users via dashboard or email.</p>
                        </div>
                        {isAdmin && (
                            <button
                                className="tj-btn tj-btn-primary"
                                onClick={() => navigate('/admin/announcements/create')}
                            >
                                <i className="fas fa-plus"></i> Create New
                            </button>
                        )}
                    </div>

                    <div className="row">
                        <div className="col-12">
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
                                                        <th>Actions</th>
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
                                                                <td>
                                                                    <div className="d-flex gap-2">
                                                                        <button
                                                                            className="btn btn-sm btn-outline-primary"
                                                                            onClick={() => navigate(`/admin/announcements/edit/${item.id}`)}
                                                                            title="Edit"
                                                                        >
                                                                            <i className="fas fa-edit"></i>
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-sm btn-outline-danger"
                                                                            onClick={() => handleDelete(item.id)}
                                                                            title="Delete"
                                                                        >
                                                                            <i className="fas fa-trash"></i>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="5" className="text-center py-4">No announcements yet</td>
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
            </div>
        </DashboardLayout>
    );
};

export default AdminAnnouncements;
