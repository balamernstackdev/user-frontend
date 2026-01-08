import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import planService from '../services/plan.service';
import SEO from '../components/common/SEO';
import { Package, CheckCircle, XCircle } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import './styles/AdminListings.css';
import { toast } from 'react-toastify';
import { useSettings } from '../context/SettingsContext';

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
                <div className="container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Subscription Plans</h1>
                            <p style={{ color: '#6c757d' }}>Manage your product pricing and features</p>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="admin-stats-grid mb-4">
                        <StatCard
                            label="Total Plans"
                            value={stats.total}
                            icon={Package}
                            isLoading={loading}
                            active={statusFilter === 'all' || statusFilter === ''}
                            onClick={() => setStatusFilter('all')}
                            className="card-plans stat-card-hover"
                        />
                        <StatCard
                            label="Active Plans"
                            value={stats.active}
                            icon={CheckCircle}
                            iconColor="#10b981"
                            iconBgColor="rgba(16, 185, 129, 0.1)"
                            isLoading={loading}
                            active={statusFilter === 'active'}
                            onClick={() => setStatusFilter('active')}
                            className="card-active-marketers stat-card-hover"
                        />
                        <StatCard
                            label="Inactive Plans"
                            value={stats.inactive}
                            icon={XCircle}
                            iconColor="#f59e0b"
                            iconBgColor="rgba(245, 158, 11, 0.1)"
                            isLoading={loading}
                            active={statusFilter === 'inactive'}
                            onClick={() => setStatusFilter('inactive')}
                            className="card-pending stat-card-hover"
                        />
                    </div>

                    <div className="admin-listing-toolbar mb-4" style={{
                        backgroundColor: 'white',
                        padding: '15px 20px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                        border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            {/* Left Side: Search */}
                            <div className="flex-grow-1" style={{ maxWidth: '400px' }}>
                                <div className="position-relative">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm ps-4"
                                        placeholder="Search plans..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ borderRadius: '6px', borderColor: '#e2e8f0', height: '38px' }}
                                    />
                                    <i className="fas fa-search position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}></i>
                                </div>
                            </div>

                            {/* Right Side: Filters & Actions */}
                            <div className="d-flex align-items-center gap-3">
                                <select
                                    className="form-select form-select-sm"
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    style={{ borderRadius: '6px', borderColor: '#e2e8f0', minWidth: '130px', height: '38px' }}
                                >
                                    <option value="all">All Types</option>
                                    <option value="MONTHLY">Monthly</option>
                                    <option value="YEARLY">Yearly</option>
                                    <option value="LIFETIME">Lifetime</option>
                                </select>

                                <select
                                    className="form-select form-select-sm"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    style={{ borderRadius: '6px', borderColor: '#e2e8f0', minWidth: '130px', height: '38px' }}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>

                                <button
                                    className="tj-primary-btn"
                                    onClick={() => navigate('/admin/plans/create')}
                                    style={{
                                        height: '38px',
                                        borderRadius: '6px',
                                        padding: '0 20px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        fontSize: '14px',
                                        fontWeight: 500
                                    }}
                                >
                                    <span className="btn-text">Add Plan</span>
                                    <span className="btn-icon">
                                        <i className="fas fa-arrow-right"></i>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="listing-table-container">
                        <table className="listing-table">
                            <thead>
                                <tr>
                                    <th>Plan Name</th>
                                    <th>Type</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Features</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPlans.map((plan) => (
                                    <tr key={plan.id}>
                                        <td>
                                            <div className="plan-info-cell">
                                                <span className="plan-name-text">{plan.name}</span>
                                                <span className="plan-slug-text">{plan.slug}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="plan-type-badge">{plan.plan_type}</span>
                                        </td>
                                        <td>
                                            <span className="plan-price-text">{formatPrice(plan)}</span>
                                        </td>
                                        <td>
                                            <div
                                                className={`status-toggle ${plan.is_active ? 'active' : 'inactive'}`}
                                                onClick={() => handleToggleStatus(plan.id)}
                                                title="Click to toggle"
                                            >
                                                <i className={`fas ${plan.is_active ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                                                {plan.is_active ? 'Active' : 'Inactive'}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-muted" style={{ fontSize: '13px' }}>
                                                {plan.features?.length || 0} features
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                <button className="action-btn" onClick={() => navigate(`/admin/plans/edit/${plan.id}`)} title="Edit Plan">
                                                    <i className="far fa-edit"></i>
                                                </button>
                                                <button className="action-btn delete" onClick={() => handleDelete(plan.id)} title="Delete Plan">
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredPlans.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="6" className="text-center" style={{ padding: '80px' }}>
                                            <i className="fas fa-box-open" style={{ fontSize: '40px', display: 'block', marginBottom: '15px' }}></i>
                                            No plans found matching your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminPlans;
