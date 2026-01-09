import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorialService from '../services/tutorial.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import Pagination from '../components/common/Pagination';
import { toast } from 'react-toastify';
import { authService } from '../services/auth.service';
import { HelpCircle, Plus, Edit, Trash, Globe, Lock, Search } from 'lucide-react';
import SEO from '../components/common/SEO';
import './styles/AdminListings.css';

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
            <SEO title="FAQ Management" description="Manage frequently asked questions" />
            <div className="admin-listing-page animate-fade-up">
                <div className="admin-container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>FAQ Management</h1>
                            <p className="text-muted mb-0">Manage Frequently Asked Questions for users</p>
                        </div>
                        {isAllowed && (
                            <div className="header-actions">
                                <button
                                    className="tj-btn tj-btn-primary"
                                    onClick={() => navigate('/admin/faqs/create')}
                                >
                                    <Plus size={18} className="me-2" /> Add FAQ
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="listing-table-container">
                        <div className="table-responsive">
                            <table className="listing-table">
                                <thead>
                                    <tr>
                                        <th>Question & Answer</th>
                                        <th>Status</th>
                                        {isAllowed && <th className="text-end">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={isAllowed ? "3" : "2"} className="text-center py-5 text-muted">Loading FAQs...</td></tr>
                                    ) : faqs.length === 0 ? (
                                        <tr>
                                            <td colSpan={isAllowed ? "3" : "2"} className="text-center py-5">
                                                <div className="text-muted mb-2"><HelpCircle size={40} className="opacity-20" /></div>
                                                <p className="text-muted mb-0">No FAQs found</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        faqs.map(faq => (
                                            <tr key={faq.id}>
                                                <td>
                                                    <div className="d-flex flex-column">
                                                        <span className="fw-semibold text-dark">{faq.title}</span>
                                                        <span className="text-muted small text-truncate" style={{ maxWidth: '600px' }}>
                                                            {faq.content?.replace(/<[^>]*>?/gm, '').substring(0, 120)}...
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`premium-badge ${faq.is_published ? 'premium-badge-success' : 'premium-badge-warning'} ${isAllowed ? 'cursor-pointer' : ''}`}
                                                        onClick={() => isAllowed && handleTogglePublish(faq.id, faq.is_published)}
                                                        title={isAllowed ? "Click to toggle status" : ""}
                                                    >
                                                        {faq.is_published ? <Globe size={12} className="me-1" /> : <Lock size={12} className="me-1" />}
                                                        {faq.is_published ? 'Published' : 'Draft'}
                                                    </span>
                                                </td>
                                                {isAllowed && (
                                                    <td className="text-end">
                                                        <div className="actions-cell justify-content-end">
                                                            <button
                                                                className="action-btn"
                                                                onClick={() => navigate(`/admin/faqs/edit/${faq.id}`)}
                                                                title="Edit"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                className="action-btn delete"
                                                                onClick={() => handleDelete(faq.id)}
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
                        {faqs.length > 0 && (
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

export default AdminFAQs;
