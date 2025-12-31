import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorialService from '../services/tutorial.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import './AdminListings.css';
import { toast } from 'react-toastify';

const AdminHowToUse = () => {
    const navigate = useNavigate();
    const [tutorials, setTutorials] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTutorials = async () => {
        setLoading(true);
        try {
            // We fetch 'HowToUse' category. You might want to also fetch 'Basics' if legacy data uses that.
            // For now, let's assume new convention is 'HowToUse'
            const response = await tutorialService.getAdminTutorialsByCategory('HowToUse');
            const data = Array.isArray(response) ? response : (response.data || []);
            setTutorials(data);
        } catch (error) {
            console.error('Error fetching tutorials:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTutorials();
    }, []);

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
            <div className="admin-listing-page animate-fade-up">
                <div className="container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>How To Use Guides</h1>
                            <p style={{ color: '#6c757d' }}>Manage instructional guides and videos</p>
                        </div>
                        <div className="header-actions">
                            <button
                                className="tj-primary-btn"
                                onClick={() => navigate('/admin/how-to-use/create')}
                                style={{ padding: '8px 20px', fontSize: '14px' }}
                            >
                                <span className="btn-text"><span>+ Add Guide</span></span>
                            </button>
                        </div>
                    </div>

                    <div className="listing-table-container">
                        <table className="listing-table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Title</th>
                                    <th>Description</th>
                                    <th>Video</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center">Loading...</td></tr>
                                ) : tutorials.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center" style={{ padding: '50px' }}>No guides found</td></tr>
                                ) : (
                                    tutorials.map(tutorial => (
                                        <tr key={tutorial.id}>
                                            <td style={{ width: '60px', textAlign: 'center' }}>
                                                {tutorial.order_index}
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{tutorial.title}</div>
                                            </td>
                                            <td style={{ maxWidth: '300px' }}>
                                                <div className="text-truncate" style={{ color: '#6c757d' }}>
                                                    {tutorial.description}
                                                </div>
                                            </td>
                                            <td>
                                                {tutorial.video_url ? (
                                                    <span className="badge-success" style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Yes</span>
                                                ) : (
                                                    <span className="badge-warning" style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>No</span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleTogglePublish(tutorial.id, tutorial.is_published)}
                                                    className={`plan-type-badge`}
                                                    style={{
                                                        background: tutorial.is_published ? 'rgba(40, 167, 69, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                        color: tutorial.is_published ? '#28a745' : '#ef4444',
                                                        border: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {tutorial.is_published ? 'Published' : 'Draft'}
                                                </button>
                                            </td>
                                            <td>
                                                <div className="actions-cell">
                                                    <button className="action-btn" onClick={() => navigate(`/admin/how-to-use/edit/${tutorial.id}`)} title="Edit">
                                                        <i className="far fa-edit"></i>
                                                    </button>
                                                    <button className="action-btn delete" onClick={() => handleDelete(tutorial.id)} title="Delete">
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminHowToUse;
