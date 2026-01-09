import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import subscriptionService from '../services/subscription.service';
import planService from '../services/plan.service';
import Pagination from '../components/common/Pagination';
import SEO from '../components/common/SEO';
import { toast } from 'react-toastify';
import { Plus, Search, Filter, Mail, Package, Calendar, Clock, Edit, Trash, AlertCircle, User, CreditCard } from 'lucide-react';
import './styles/AdminListings.css';

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
            case 'upgraded': return { bg: '#e3f2fd', color: '#1565c0' }; // Blue for upgraded
            case 'cancelled': return { bg: '#eceff1', color: '#455a64' };
            default: return { bg: '#f5f5f5', color: '#616161' };
        }
    };

    return (
        <DashboardLayout>
            <SEO title="User Subscriptions" description="Manage user subscriptions" />

            <div className="admin-listing-page animate-fade-up">
                <div className="admin-container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>User Subscriptions</h1>
                            <p className="text-muted mb-0">Monitor and manage active user plans and access</p>
                        </div>
                        <div className="header-actions">
                            <button
                                className="tj-btn tj-btn-primary"
                                onClick={() => navigate('/admin/subscriptions/create')}
                            >
                                <Plus size={18} className="me-2" /> Add Subscription
                            </button>
                        </div>
                    </div>

                    <div className="admin-listing-toolbar">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div className="search-box flex-grow-1" style={{ maxWidth: '400px' }}>
                                <Search size={18} className="search-icon" />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="d-flex gap-2">
                                <div className="d-flex align-items-center gap-2">
                                    <Filter size={14} className="text-muted" />
                                    <select
                                        className="custom-select"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        style={{ height: '42px', minWidth: '150px' }}
                                    >
                                        <option value="">All Status</option>
                                        <option value="active">Active Memberships</option>
                                        <option value="pending">Pending Payment</option>
                                        <option value="expired">Expired Access</option>
                                        <option value="upgraded">Upgraded Plans</option>
                                        <option value="cancelled">Terminated</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="listing-table-container">
                        <div className="table-responsive">
                            <table className="listing-table">
                                <thead>
                                    <tr>
                                        <th>User Details</th>
                                        <th>Plan Info</th>
                                        <th>Status</th>
                                        <th>Period</th>
                                        <th>Created At</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="6" className="text-center py-5 text-muted">Refreshing subscriptions...</td></tr>
                                    ) : subscriptions.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5">
                                                <div className="text-muted mb-2"><CreditCard size={40} className="opacity-20" /></div>
                                                <p className="text-muted mb-0">No subscriptions found matching your filters</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        subscriptions.map(sub => (
                                            <tr key={sub.id}>
                                                <td>
                                                    <div className="d-flex flex-column">
                                                        <span className="fw-semibold text-dark d-flex align-items-center gap-1">
                                                            <User size={12} className="text-muted" /> {sub.user_name}
                                                        </span>
                                                        <span className="text-muted small d-flex align-items-center gap-1">
                                                            <Mail size={10} /> {sub.user_email}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-column">
                                                        <span className="fw-semibold text-dark d-flex align-items-center gap-1">
                                                            <Package size={12} className="text-muted" /> {sub.plan_name}
                                                        </span>
                                                        <span className="text-muted small text-capitalize">{sub.plan_type} Tier</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`premium-badge ${sub.status === 'active' ? 'premium-badge-success' :
                                                        sub.status === 'expired' ? 'premium-badge-danger' :
                                                            sub.status === 'pending' ? 'premium-badge-warning' :
                                                                'premium-badge-info'
                                                        }`}>
                                                        {sub.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="text-muted small">
                                                        <div className="d-flex align-items-center gap-1">
                                                            <Clock size={10} /> <span className="fw-medium text-dark">Start:</span> {sub.start_date ? new Date(sub.start_date).toLocaleDateString('en-GB') : 'N/A'}
                                                        </div>
                                                        <div className="d-flex align-items-center gap-1">
                                                            <Calendar size={10} /> <span className="fw-medium text-dark">End:</span> {sub.end_date ? new Date(sub.end_date).toLocaleDateString('en-GB') : 'N/A'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-muted small d-flex align-items-center gap-1">
                                                        <Calendar size={12} />
                                                        {new Date(sub.created_at).toLocaleDateString('en-GB')}
                                                    </div>
                                                </td>
                                                <td className="text-end">
                                                    <div className="actions-cell justify-content-end">
                                                        <button
                                                            className="action-btn"
                                                            onClick={() => navigate(`/admin/subscriptions/edit/${sub.id}`)}
                                                            title="Edit Subscription"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            className="action-btn delete"
                                                            onClick={() => handleDeleteClick(sub)}
                                                            title="Terminate Subscription"
                                                        >
                                                            <Trash size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {subscriptions.length > 0 && (
                            <div className="p-4 border-top">
                                <Pagination
                                    currentPage={pagination.page}
                                    totalPages={Math.ceil(pagination.total / pagination.limit)}
                                    onPageChange={(newPage) => {
                                        setPagination(prev => ({ ...prev, page: newPage }));
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-scale-up" style={{ maxWidth: '450px' }}>
                        <div className="modal-header border-0 pb-0">
                            <h5 className="fw-bold mb-0">Confirm Delete</h5>
                            <button className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
                        </div>
                        <div className="modal-body py-4">
                            <p className="mb-2">Are you sure you want to delete this subscription for <strong>{subToDelete?.user_name}</strong>?</p>
                            <p className="text-muted small mb-0">This action will remove the plan access for the user and cannot be undone.</p>
                        </div>
                        <div className="modal-footer border-0 pt-0">
                            <button className="tj-btn tj-btn-sm tj-btn-outline-primary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className="tj-btn tj-btn-sm tj-btn-danger" onClick={confirmDelete}>Confirm Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminSubscriptions;
