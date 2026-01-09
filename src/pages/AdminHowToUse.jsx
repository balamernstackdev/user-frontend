import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorialService from '../services/tutorial.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import Pagination from '../components/common/Pagination';
import SEO from '../components/common/SEO';
import { BookOpen, Plus, Edit, Trash, Globe, Lock, Video, VideoOff, Hash } from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '../services/auth.service';
import './styles/AdminListings.css';

const AdminHowToUse = () => {
    const navigate = useNavigate();
    const [tutorials, setTutorials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0 });

    const fetchTutorials = async () => {
        setLoading(true);
        try {
            const params = {
                limit: pagination.limit,
                offset: (pagination.page - 1) * pagination.limit
            };
            const response = await tutorialService.getAdminTutorialsByCategory('HowToUse', params);

            if (response.data && response.data.pagination) {
                setTutorials(response.data.tutorials);
                setPagination(prev => ({ ...prev, total: response.data.pagination.total }));
            } else if (Array.isArray(response.data)) {
                // Fallback for wrapped array { data: [...] }
                const allData = response.data;
                const startIndex = (pagination.page - 1) * pagination.limit;
                const endIndex = startIndex + pagination.limit;
                const paginatedData = allData.slice(startIndex, endIndex);

                setTutorials(paginatedData);
                setPagination(prev => ({ ...prev, total: allData.length }));
            } else if (Array.isArray(response)) {
                // Fallback for raw array response [...]
                const allData = response;
                const startIndex = (pagination.page - 1) * pagination.limit;
                const endIndex = startIndex + pagination.limit;
                const paginatedData = allData.slice(startIndex, endIndex);

                setTutorials(paginatedData);
                setPagination(prev => ({ ...prev, total: allData.length }));
            } else {
                setTutorials(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching tutorials:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTutorials();
    }, [pagination.page]);

    const user = authService.getUser();
    const userRole = (user?.role || '').toLowerCase().trim();
    const isAdmin = userRole === 'admin';
    const isSupport = userRole === 'support_agent' || isAdmin;
    const isAllowed = isSupport;

    console.log('AdminHowToUse Debug:', { user, role: user?.role, userRole, isAllowed });

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this guide?')) {
            try {
                await tutorialService.deleteTutorial(id);
                fetchTutorials();
            } catch (error) {
                console.error('Error deleting tutorial:', error);
                toast.error('Failed to delete guide');
            }
        }
    };

    const handleTogglePublish = async (id, currentStatus) => {
        try {
            await tutorialService.togglePublishStatus(id);
            fetchTutorials();
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Failed to update status');
        }
    };

    return (
        <DashboardLayout>
            <SEO title="How To Use Guides" description="Manage instructional guides and videos" />
            <div className="admin-listing-page animate-fade-up">
                <div className="admin-container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>How To Use Guides</h1>
                            <p className="text-muted mb-0">Manage instructional guides and videos for users</p>
                        </div>
                        {isAllowed && (
                            <div className="header-actions">
                                <button
                                    className="tj-btn tj-btn-primary"
                                    onClick={() => navigate('/admin/how-to-use/create')}
                                >
                                    <Plus size={18} className="me-2" /> Add Guide
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="listing-table-container">
                        <div className="table-responsive">
                            <table className="listing-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '80px' }}><Hash size={14} /></th>
                                        <th>Title & Description</th>
                                        <th>Video</th>
                                        <th>Status</th>
                                        {isAllowed && <th className="text-end">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={isAllowed ? "5" : "4"} className="text-center py-5 text-muted">Loading guides...</td></tr>
                                    ) : tutorials.length === 0 ? (
                                        <tr>
                                            <td colSpan={isAllowed ? "5" : "4"} className="text-center py-5">
                                                <div className="text-muted mb-2"><BookOpen size={40} className="opacity-20" /></div>
                                                <p className="text-muted mb-0">No guides found</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        tutorials.map(tutorial => (
                                            <tr key={tutorial.id}>
                                                <td className="text-center fw-bold text-muted">
                                                    #{tutorial.order_index}
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-column">
                                                        <span className="fw-semibold text-dark">{tutorial.title}</span>
                                                        <span className="text-muted small text-truncate" style={{ maxWidth: '500px' }}>
                                                            {tutorial.description}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    {tutorial.video_url ? (
                                                        <span className="premium-badge premium-badge-info">
                                                            <Video size={12} className="me-1" /> Video
                                                        </span>
                                                    ) : (
                                                        <span className="premium-badge" style={{ background: '#f1f5f9', color: '#64748b' }}>
                                                            <VideoOff size={12} className="me-1" /> No Video
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`premium-badge ${tutorial.is_published ? 'premium-badge-success' : 'premium-badge-warning'} ${isAllowed ? 'cursor-pointer' : ''}`}
                                                        onClick={() => isAllowed && handleTogglePublish(tutorial.id, tutorial.is_published)}
                                                        title={isAllowed ? "Click to toggle status" : ""}
                                                    >
                                                        {tutorial.is_published ? <Globe size={12} className="me-1" /> : <Lock size={12} className="me-1" />}
                                                        {tutorial.is_published ? 'Published' : 'Draft'}
                                                    </span>
                                                </td>
                                                {isAllowed && (
                                                    <td className="text-end">
                                                        <div className="actions-cell justify-content-end">
                                                            <button
                                                                className="action-btn"
                                                                onClick={() => navigate(`/admin/how-to-use/edit/${tutorial.id}`)}
                                                                title="Edit"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                className="action-btn delete"
                                                                onClick={() => handleDelete(tutorial.id)}
                                                                title="Delete"
                                                            >
                                                                <Trash size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {tutorials.length > 0 && (
                            <div className="mt-4 p-4 border-top d-flex justify-content-center">
                                <Pagination
                                    currentPage={pagination.page}
                                    totalItems={pagination.total}
                                    itemsPerPage={pagination.limit}
                                    onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminHowToUse;
