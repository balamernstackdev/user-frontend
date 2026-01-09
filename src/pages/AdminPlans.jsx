import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import planService from '../services/plan.service';
import SEO from '../components/common/SEO';
import { Package, CheckCircle, XCircle, Plus, Edit, Trash, Search, Filter, Layers, DollarSign } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import { toast } from 'react-toastify';
import { useSettings } from '../context/SettingsContext';
import './styles/AdminListings.css';

const AdminPlans = () => {
    const { settings } = useSettings();
    const symbol = settings.currency_symbol || '₹';
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    // State for filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0
    });

    // Debounce search and refetch on filter changes
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPlans();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, statusFilter, typeFilter]);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const params = {
                search: searchQuery,
                status: statusFilter,
                planType: typeFilter
            };
            const response = await planService.getPlans(params);
            setPlans(response.data || []);
            if (response.summary) {
                setStats(response.summary);
            }
        } catch (err) {
            toast.error('Failed to load plans');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await planService.togglePlanStatus(id);
            // Refresh current view
            fetchPlans();
            toast.success('Plan status updated');
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this plan?')) {
            try {
                await planService.deletePlan(id);
                fetchPlans();
                toast.success('Plan deleted successfully');
            } catch (err) {
                toast.error('Failed to delete plan');
            }
        }
    };

    const formatPrice = (plan) => {
        if (plan.monthly_price) return `${symbol}${plan.monthly_price}/mo`;
        if (plan.yearly_price) return `${symbol}${plan.yearly_price}/yr`;
        if (plan.lifetime_price) return `${symbol}${plan.lifetime_price} (LT)`;
        return 'Free/Contact';
    };

    // No client-side filtering needed anymore
    const filteredPlans = plans;

    return (
        <DashboardLayout>
            <SEO title="Plan Management" description="Manage subscription plans" />

            <div className="admin-listing-page animate-fade-up">
                <div className="admin-container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Subscription Plans</h1>
                            <p className="text-muted mb-0">Manage your product pricing, tiers, and features</p>
                        </div>
                        <div className="header-actions">
                            <button
                                className="tj-btn tj-btn-primary"
                                onClick={() => navigate('/admin/plans/create')}
                            >
                                <Plus size={18} className="me-2" /> Add Plan
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-4">
                            <StatCard
                                label="Total Plans"
                                value={stats.total}
                                icon={Package}
                                isLoading={loading}
                                active={statusFilter === 'all' || statusFilter === ''}
                                onClick={() => setStatusFilter('all')}
                            />
                        </div>
                        <div className="col-md-4">
                            <StatCard
                                label="Active Plans"
                                value={stats.active}
                                icon={CheckCircle}
                                iconColor="#10b981"
                                iconBgColor="rgba(16, 185, 129, 0.1)"
                                isLoading={loading}
                                active={statusFilter === 'active'}
                                onClick={() => setStatusFilter('active')}
                            />
                        </div>
                        <div className="col-md-4">
                            <StatCard
                                label="Inactive"
                                value={stats.inactive}
                                icon={XCircle}
                                iconColor="#f59e0b"
                                iconBgColor="rgba(245, 158, 11, 0.1)"
                                isLoading={loading}
                                active={statusFilter === 'inactive'}
                                onClick={() => setStatusFilter('inactive')}
                            />
                        </div>
                    </div>

                    <div className="admin-listing-toolbar">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div className="search-box flex-grow-1" style={{ maxWidth: '400px' }}>
                                <Search size={18} className="search-icon" />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by name or slug..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="d-flex gap-2">
                                <div className="d-flex align-items-center gap-2">
                                    <Filter size={14} className="text-muted" />
                                    <select className="custom-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ width: '140px' }}>
                                        <option value="all">All Plan Types</option>
                                        <option value="MONTHLY">Monthly</option>
                                        <option value="YEARLY">Yearly</option>
                                        <option value="LIFETIME">Lifetime</option>
                                    </select>
                                </div>
                                <select className="custom-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '130px' }}>
                                    <option value="all">All Status</option>
                                    <option value="active">Active Tiers</option>
                                    <option value="inactive">Draft/Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="listing-table-container">
                        <div className="table-responsive">
                            <table className="listing-table">
                                <thead>
                                    <tr>
                                        <th>Plan Name</th>
                                        <th>Type</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                        <th>Features</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPlans.map((plan) => (
                                        <tr key={plan.id}>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="avatar-circle-sm" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                                                        <Package size={14} />
                                                    </div>
                                                    <div className="d-flex flex-column">
                                                        <span className="fw-semibold text-dark">{plan.name}</span>
                                                        <span className="text-muted small">{plan.slug}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="premium-badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                                                    <Layers size={10} className="me-1" /> {plan.plan_type}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="fw-bold text-dark d-flex align-items-center gap-1">
                                                    <DollarSign size={14} className="text-muted" />
                                                    {formatPrice(plan)}
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className={`premium-badge cursor-pointer ${plan.is_active ? 'premium-badge-success' : 'premium-badge-danger'}`}
                                                    onClick={() => handleToggleStatus(plan.id)}
                                                    title="Click to toggle status"
                                                >
                                                    {plan.is_active ? <CheckCircle size={10} className="me-1" /> : <XCircle size={10} className="me-1" />}
                                                    {plan.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="text-muted small d-flex align-items-center gap-1">
                                                    <CheckCircle size={12} />
                                                    {plan.features?.length || 0} features
                                                </div>
                                            </td>
                                            <td className="text-end">
                                                <div className="actions-cell justify-content-end">
                                                    <button className="action-btn" onClick={() => navigate(`/admin/plans/edit/${plan.id}`)} title="Edit Plan">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="action-btn delete" onClick={() => handleDelete(plan.id)} title="Delete Plan">
                                                        <Trash size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredPlans.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5">
                                                <p className="text-muted mb-0">No plans found matching your filters.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminPlans;
