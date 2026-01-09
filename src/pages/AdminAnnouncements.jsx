import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import announcementService from '../services/announcement.service';
import { authService } from '../services/auth.service';
import { toast } from 'react-toastify';
import SkeletonLoader from '../components/dashboard/SkeletonLoader';
import SEO from '../components/common/SEO';
import { Megaphone, Mail, Layout, Users } from 'lucide-react';
import './styles/AdminListings.css';

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
                <div className="admin-container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Manage Announcements</h1>
                            <p className="text-muted mb-0">Broadcast messages to users via dashboard or email.</p>
                        </div>
                        {(isAdmin || isSupport) && (
                            <div className="header-actions">
                                <button
                                    className="tj-btn tj-btn-primary"
                                    onClick={() => navigate('/admin/announcements/create')}
                                >
                                    <i className="fas fa-plus me-2"></i> Add Announcement
                                </button>
                            </div>
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
                                    <div className="table-responsive">
                                        <table className="listing-table">
                                            <thead>
                                                <tr>
                                                    <th>Title & Content</th>
                                                    <th>Type</th>
                                                    <th>Audience</th>
                                                    <th>Date</th>
                                                    <th className="text-end">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {announcements.length > 0 ? (
                                                    announcements.map((item) => (
                                                        <tr key={item.id}>
                                                            <td>
                                                                <div className="fw-semibold text-dark">{item.title}</div>
                                                                <div className="text-muted small text-truncate" style={{ maxWidth: '400px' }}>{item.content}</div>
                                                            </td>
                                                            <td>
                                                                <span className={`premium-badge ${item.type === 'email' ? 'premium-badge-warning' : 'premium-badge-info'}`}>
                                                                    {item.type === 'email' ? <Mail size={12} className="me-1" /> : <Layout size={12} className="me-1" />}
                                                                    {item.type === 'dashboard' ? 'In-App' : item.type === 'email' ? 'Email' : 'All Channels'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className="premium-badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                                                                    <Users size={12} className="me-1" />
                                                                    {item.target_role.replace('_', ' ')}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div className="text-muted small">
                                                                    {new Date(item.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                                </div>
                                                            </td>
                                                            <td className="text-end">
                                                                <div className="actions-cell justify-content-end">
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
                                                        <td colSpan="5" className="text-center py-5">
                                                            <div className="text-muted mb-2"><Megaphone size={40} className="opacity-20" /></div>
                                                            <p className="text-muted mb-0">No announcements found</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Support View: Cards (Standard User View) */}
                                {!isAdmin && !isSupport && (
                                    <div className="row g-4 p-3">
                                        {announcements.length > 0 ? (
                                            announcements.map((item, index) => (
                                                <div key={item.id} className="col-md-6">
                                                    <div className="card h-100 border-0 shadow-sm rounded-4 animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                                        <div className="card-body p-4">
                                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                                <span className={`premium-badge ${item.type === 'email' ? 'premium-badge-warning' : 'premium-badge-info'}`}>
                                                                    {item.type === 'email' ? 'Email' : 'In-App'}
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
