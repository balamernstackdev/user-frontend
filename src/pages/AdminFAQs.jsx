import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorialService from '../services/tutorial.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import Pagination from '../components/common/Pagination';
import './AdminListings.css'; // Reusing existing styles
import { toast } from 'react-toastify';
import { authService } from '../services/auth.service';

const AdminFAQs = () => {
    const navigate = useNavigate();
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0 });

    const fetchFAQs = async () => {
        setLoading(true);
        try {
            const params = {
                limit: pagination.limit,
                offset: (pagination.page - 1) * pagination.limit
            };
            const response = await tutorialService.getAdminTutorialsByCategory('FAQ', params);

            // Allow for array response or object with data property and pagination
            // Allow for array response or object with data property and pagination
            if (response.data && response.data.pagination) {
                setFaqs(response.data.tutorials);
                setPagination(prev => ({ ...prev, total: response.data.pagination.total }));
            } else if (Array.isArray(response.data)) {
                // Fallback for wrapped array { data: [...] }
                const allData = response.data;
                const startIndex = (pagination.page - 1) * pagination.limit;
                const endIndex = startIndex + pagination.limit;
                // If backend ignores limit, we slice. If it respected limit but didn't send pagination, slice is safe (slice on smaller array is fine or empty)
                // But wait, if backend respected limit, allData is already sliced? 
                // Old backend returned ALL. So we must slice.
                const paginatedData = allData.slice(startIndex, endIndex);

                setFaqs(paginatedData);
                setPagination(prev => ({ ...prev, total: allData.length }));
            } else if (Array.isArray(response)) {
                // Fallback for raw array response [...]
                const allData = response;
                const startIndex = (pagination.page - 1) * pagination.limit;
                const endIndex = startIndex + pagination.limit;
                const paginatedData = allData.slice(startIndex, endIndex);

                setFaqs(paginatedData);
                setPagination(prev => ({ ...prev, total: allData.length }));
            } else {
                setFaqs(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching FAQs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFAQs();
    }, [pagination.page]);

    const user = authService.getUser();
    const userRole = (user?.role || '').toLowerCase().trim();
    const isAdmin = userRole === 'admin';
    const isSupport = userRole === 'support_agent' || isAdmin;
    const isAllowed = isSupport;

    console.log('AdminFAQs Debug:', { user, role: user?.role, userRole, isAllowed });

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
                            {isAllowed && (
                                <button
                                    className="tj-primary-btn"
                                    onClick={() => navigate('/admin/faqs/create')}
                                >
                                    <span className="btn-text">Add FAQ</span>
                                    <span className="btn-icon">
                                        <i className="fas fa-arrow-right"></i>
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="listing-table-container">
                        <table className="listing-table">
                            <thead>
                                <tr>
                                    <th>Question</th>
                                    <th>Answer (Preview)</th>
                                    <th>Status</th>
                                    {isAllowed && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={isAllowed ? "4" : "3"} className="text-center">Loading...</td></tr>
                                ) : faqs.length === 0 ? (
                                    <tr><td colSpan={isAllowed ? "4" : "3"} className="text-center" style={{ padding: '50px' }}>No FAQs found</td></tr>
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
                                                    onClick={() => isAllowed && handleTogglePublish(faq.id, faq.is_published)}
                                                    className={`plan-type-badge`}
                                                    style={{
                                                        background: faq.is_published ? 'rgba(40, 167, 69, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                        color: faq.is_published ? '#28a745' : '#ef4444',
                                                        border: 'none',
                                                        cursor: isAllowed ? 'pointer' : 'default',
                                                        opacity: isAllowed ? 1 : 0.8
                                                    }}
                                                    disabled={!isAllowed}
                                                >
                                                    {faq.is_published ? 'Published' : 'Draft'}
                                                </button>
                                            </td>
                                            {isAllowed && (
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
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {faqs.length > 0 && (
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={Math.ceil(pagination.total / pagination.limit)}
                            onPageChange={(newPage) => {
                                setPagination(prev => ({ ...prev, page: newPage }));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminFAQs;
