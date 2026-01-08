import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import announcementService from '../services/announcement.service';
import { authService } from '../services/auth.service';
import { toast } from 'react-toastify';
import SkeletonLoader from '../components/dashboard/SkeletonLoader';
import SEO from '../components/common/SEO';
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
                // Optimistic update
                setAnnouncements(prev => prev.filter(a => a.id !== id));
                await announcementService.delete(id);
                toast.success('Announcement deleted successfully');
                fetchAnnouncements();
            } catch (error) {
                console.error('Error deleting announcement:', error);
                toast.error('Failed to delete announcement');
                fetchAnnouncements();
            }
        }
    };

    return (
        <DashboardLayout>
            <SEO title="Manage Announcements" description="Broadcast messages to users" />
            <div className="admin-listing-page animate-fade-up">
                <div className="container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Manage Announcements</h1>
                            <p style={{ color: '#6c757d' }}>Broadcast messages to users via dashboard or email.</p>
                        </div>
                        {(isAdmin || isSupport) && (
                            <button
                                className="tj-primary-btn"
                                onClick={() => navigate('/admin/announcements/create')}
                            >
                                <span className="btn-text">Add Announcement</span>
                                <span className="btn-icon">
                                    <i className="fas fa-arrow-right"></i>
                                </span>
                            </button>
                        )}
                    </div>

                    <div className="listing-table-container">
                        {loading ? (
                            <div className="p-4">
                                <SkeletonLoader type="table" count={3} />
                            </div>
                        ) : (
                            <>
                                {/* Staff View: Table */}
                                {(isAdmin || isSupport) && (
                                    <table className="listing-table">
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
                                                            <div className="fw-semibold text-dark">{item.title}</div>
                                                            <div className="text-muted small text-truncate" style={{ maxWidth: '300px' }}>{item.content}</div>
                                                        </td>
                                                        <td>
                                                            <span className={`badge rounded-pill fw-medium px-3 py-2 ${item.type === 'email' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-info-subtle text-info-emphasis'}`}>
                                                                {item.type === 'dashboard' ? 'In-App' : item.type === 'email' ? 'Email' : 'All Channels'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="badge bg-light text-secondary border fw-medium px-2 py-1 text-capitalize">
                                                                {item.target_role.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="text-muted fw-medium fs-7">
                                                            {new Date(item.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </td>
                                                        <td>
                                                            <div className="actions-cell">
                                                                <button
                                                                    className="action-btn"
                                                                    onClick={() => navigate(`/admin/announcements/edit/${item.id}`)}
                                                                    title="Edit"
                                                                >
                                                                    <i className="far fa-edit"></i>
                                                                </button>
                                                                <button
                                                                    className="action-btn delete"
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
                                                    <td colSpan="5" className="text-center py-5 text-muted">
                                                        <i className="fas fa-bullhorn mb-3 d-block opacity-25" style={{ fontSize: '24px' }}></i>
                                                        No announcements found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}

                                {/* Support View: Cards (if needed fallback, but admins usually see table) */}
                                {!isAdmin && !isSupport && (
                                    <div className="row p-3">
                                        {announcements.length > 0 ? (
                                            announcements.map((item, index) => (
                                                <div key={item.id} className="col-md-6 mb-4">
                                                    <div className="card h-100 border-0 shadow-sm rounded-4 animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                                        <div className="card-body p-4">
                                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                                <span className={`badge rounded-pill ${item.type === 'email' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-info-subtle text-info-emphasis'}`}>
                                                                    {item.type === 'dashboard' ? 'In-App' : item.type === 'email' ? 'Email' : 'All Channels'}
                                                                </span>
                                                                <small className="text-muted">{new Date(item.created_at).toLocaleDateString()}</small>
                                                            </div>
                                                            <h5 className="card-title fw-bold mb-2">{item.title}</h5>
                                                            <p className="card-text text-muted small">{item.content}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-12 text-center py-5">
                                                <p className="text-muted">No announcements available</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminAnnouncements;
