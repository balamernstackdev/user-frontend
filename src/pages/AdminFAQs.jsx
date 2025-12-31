import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorialService from '../services/tutorial.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import './AdminListings.css'; // Reusing existing styles
import { toast } from 'react-toastify';

const AdminFAQs = () => {
    const navigate = useNavigate();
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFAQs = async () => {
        setLoading(true);
        try {
            const response = await tutorialService.getAdminTutorialsByCategory('FAQ');
            // Allow for array response or object with data property
            const data = Array.isArray(response) ? response : (response.data || []);
            setFaqs(data);
        } catch (error) {
            console.error('Error fetching FAQs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFAQs();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this FAQ?')) {
            try {
                await tutorialService.deleteTutorial(id);
                fetchFAQs();
            } catch (error) {
                console.error('Error deleting FAQ:', error);
                toast.error('Failed to delete FAQ');
            }
        }
    };

    const handleTogglePublish = async (id, currentStatus) => {
        try {
            await tutorialService.togglePublishStatus(id);
            fetchFAQs();
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
                            <h1>FAQ Management</h1>
                            <p style={{ color: '#6c757d' }}>Manage Frequently Asked Questions</p>
                        </div>
                        <div className="header-actions">
                            <button
                                className="tj-primary-btn"
                                onClick={() => navigate('/admin/faqs/create')}
                                style={{ padding: '8px 20px', fontSize: '14px' }}
                            >
                                <span className="btn-text"><span>+ Add FAQ</span></span>
                            </button>
                        </div>
                    </div>

                    <div className="listing-table-container">
                        <table className="listing-table">
                            <thead>
                                <tr>
                                    <th>Question</th>
                                    <th>Answer (Preview)</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" className="text-center">Loading...</td></tr>
                                ) : faqs.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center" style={{ padding: '50px' }}>No FAQs found</td></tr>
                                ) : (
                                    faqs.map(faq => (
                                        <tr key={faq.id}>
                                            <td style={{ maxWidth: '300px' }}>
                                                <div style={{ fontWeight: 600 }}>{faq.title}</div>
                                            </td>
                                            <td style={{ maxWidth: '400px' }}>
                                                <div className="text-truncate" style={{ color: '#6c757d' }}>
                                                    {(faq.content || '').substring(0, 100)}...
                                                </div>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleTogglePublish(faq.id, faq.is_published)}
                                                    className={`plan-type-badge`}
                                                    style={{
                                                        background: faq.is_published ? 'rgba(40, 167, 69, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                        color: faq.is_published ? '#28a745' : '#ef4444',
                                                        border: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {faq.is_published ? 'Published' : 'Draft'}
                                                </button>
                                            </td>
                                            <td>
                                                <div className="actions-cell">
                                                    <button className="action-btn" onClick={() => navigate(`/admin/faqs/edit/${faq.id}`)} title="Edit">
                                                        <i className="far fa-edit"></i>
                                                    </button>
                                                    <button className="action-btn delete" onClick={() => handleDelete(faq.id)} title="Delete">
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

export default AdminFAQs;
