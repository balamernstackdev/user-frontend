import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import planService from '../services/plan.service';
import SEO from '../components/common/SEO';
import './AdminListings.css';
import { toast } from 'react-toastify';
import { useSettings } from '../context/SettingsContext';

const AdminPlans = () => {
    const { settings } = useSettings();
    const symbol = settings.currency_symbol || '₹';
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await planService.getPlans();
            setPlans(response.data || []);
        } catch (err) {
            toast.error('Failed to load plans');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await planService.togglePlanStatus(id);
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
                        <button
                            className="tj-primary-btn"
                            onClick={() => navigate('/admin/plans/create')}
                        >
                            <span className="btn-text">Add Plan</span>
                            <span className="btn-icon">
                                <i className="fas fa-arrow-right"></i>
                            </span>
                        </button>
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
                                {plans.map((plan) => (
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
                                {plans.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="6" className="text-center" style={{ padding: '80px' }}>
                                            <i className="fas fa-box-open" style={{ fontSize: '40px', display: 'block', marginBottom: '15px' }}></i>
                                            No plans found. Create your first plan to get started.
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
