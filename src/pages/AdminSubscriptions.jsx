import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import subscriptionService from '../services/subscription.service';
import planService from '../services/plan.service';
import Pagination from '../components/common/Pagination';
import SEO from '../components/common/SEO';
import { toast } from 'react-toastify';
import './AdminListings.css';

const AdminSubscriptions = () => {
    const navigate = useNavigate();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

    // Delete Confirmation State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [subToDelete, setSubToDelete] = useState(null);

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const params = {
                status: statusFilter || undefined,
                search: searchQuery || undefined,
                limit: pagination.limit,
                offset: (pagination.page - 1) * pagination.limit
            };
            const response = await subscriptionService.getAllSubscriptions(params);
            if (response.success) {
                setSubscriptions(response.data.subscriptions);
                setPagination(prev => ({ ...prev, total: response.data.pagination.total }));
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            toast.error('Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, [pagination.page, statusFilter, debouncedSearch]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        // Triggered by debouncedSearch effect
    };

    const handleDeleteClick = (sub) => {
        setSubToDelete(sub);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!subToDelete) return;

        try {
            await subscriptionService.deleteSubscription(subToDelete.id);
            toast.success('Subscription deleted successfully');
            setShowDeleteModal(false);
            setSubToDelete(null);
            fetchSubscriptions(); // Refresh list
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete subscription');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return { bg: '#e8f5e9', color: '#2e7d32' };
            case 'expired': return { bg: '#ffebee', color: '#c62828' };
            case 'pending': return { bg: '#fff3e0', color: '#ff9800' };
            case 'cancelled': return { bg: '#eceff1', color: '#455a64' };
            default: return { bg: '#f5f5f5', color: '#616161' };
        }
    };

    return (
        <DashboardLayout>
            <SEO title="User Subscriptions" description="Manage user subscriptions" />
            <div className="admin-listing-page animate-fade-up">
                <div className="container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>User Subscriptions</h1>
                            <p style={{ color: '#6c757d' }}>Monitor and manage active user plans</p>
                        </div>
                        <div className="header-actions">
                            <form onSubmit={handleSearch} className="search-box">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type="submit" className="search-btn">
                                    <i className="fas fa-search"></i>
                                </button>
                            </form>
                            <div className="filter-group">
                                <select
                                    className="custom-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="expired">Expired</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <button
                                className="tj-primary-btn"
                                onClick={() => navigate('/admin/subscriptions/create')}
                            >
                                <span className="btn-text"><span>+ Add Subscription</span></span>
                            </button>
                        </div>
                    </div>

                    <div className="listing-table-container">
                        <table className="listing-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Plan</th>
                                    <th>Status</th>
                                    <th>Period</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center">Loading...</td></tr>
                                ) : subscriptions.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center" style={{ padding: '50px' }}>No subscriptions found</td></tr>
                                ) : (
                                    subscriptions.map(sub => (
                                        <tr key={sub.id}>
                                            <td>
                                                <div className="plan-info-cell">
                                                    <span className="plan-name-text">{sub.user_name}</span>
                                                    <span className="plan-slug-text">{sub.user_email}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="plan-info-cell">
                                                    <span className="plan-name-text">{sub.plan_name}</span>
                                                    <span className="plan-slug-text">{sub.plan_type}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="plan-type-badge" style={{
                                                    background: getStatusColor(sub.status).bg,
                                                    color: getStatusColor(sub.status).color
                                                }}>
                                                    {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '13px' }}>
                                                    <div>From: {sub.start_date ? new Date(sub.start_date).toLocaleDateString() : 'N/A'}</div>
                                                    <div>To: {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td>{new Date(sub.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <div className="actions-cell">
                                                    <button
                                                        className="action-btn"
                                                        onClick={() => navigate(`/admin/subscriptions/edit/${sub.id}`)}
                                                        title="Edit Subscription"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => handleDeleteClick(sub)}
                                                        title="Delete Subscription"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {subscriptions.length > 0 && (
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
            </div>
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>Confirm Delete</h2>
                            <button className="close-btn" onClick={() => setShowDeleteModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete this subscription for <strong>{subToDelete?.user_name}</strong>?</p>
                            <p className="text-muted small">This action cannot be undone.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className="tj-btn tj-btn-danger" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminSubscriptions;
