import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import subscriptionService from '../services/subscription.service';
import planService from '../services/plan.service';
import { userService } from '../services/user.service';
import SEO from '../components/common/SEO';
import { toast } from 'react-toastify';
import './AdminForms.css';

const AdminSubscriptionForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        user_id: '',
        plan_id: '',
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        auto_renew: true
    });

    const [users, setUsers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);

    useEffect(() => {
        fetchPlans();
        if (!isEditMode) {
            fetchUsers();
        } else {
            fetchSubscription();
        }
    }, [id]);

    const fetchPlans = async () => {
        try {
            const response = await planService.getPlans();
            if (response.success) {
                setPlans(response.data.plans || response.data);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
            toast.error('Failed to load plans');
        }
    };

    const fetchUsers = async () => {
        try {
            // Fetch users for the dropdown (limit to a reasonable number or use search)
            const response = await userService.getAllUsers({ limit: 1000 });
            if (response.data && response.data.success) {
                setUsers(response.data.data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchSubscription = async () => {
        try {
            const response = await subscriptionService.getSubscription(id);
            if (response.success) {
                const sub = response.data;
                setSubscription(sub);
                setFormData({
                    user_id: sub.user_id,
                    plan_id: sub.plan_id,
                    status: sub.status,
                    start_date: sub.start_date ? new Date(sub.start_date).toISOString().split('T')[0] : '',
                    end_date: sub.end_date ? new Date(sub.end_date).toISOString().split('T')[0] : '',
                    auto_renew: sub.auto_renew
                });
            }
        } catch (err) {
            console.error('Failed to fetch subscription:', err);
            toast.error('Failed to load subscription data');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditMode) {
                await subscriptionService.updateSubscription(id, formData);
                toast.success('Subscription updated successfully');
            } else {
                await subscriptionService.createSubscription(formData);
                toast.success('Subscription created successfully');
            }
            navigate('/admin/subscriptions');
        } catch (err) {
            console.error('Operation failed:', err);
            toast.error(err.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <DashboardLayout>
                <div className="container py-5 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <SEO title={isEditMode ? "Edit Subscription" : "Add Subscription"} description="Manage user subscription" />
            <div className="admin-form-page animate-fade-up">
                <div className="container">
                    <div className="admin-form-header mb-4">
                        <h2>{isEditMode ? 'Edit Subscription' : 'Add New Subscription'}</h2>
                        <p>{isEditMode ? 'Update user subscription details' : 'Create a new manual subscription'}</p>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="admin-form-card">
                                <div className="card-body p-4">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label">User</label>
                                            {isEditMode ? (
                                                <div className="user-summary bg-light p-3 rounded">
                                                    <div className="fw-bold text-primary">{subscription?.user_name}</div>
                                                    <div className="small text-muted">{subscription?.user_email}</div>
                                                </div>
                                            ) : (
                                                <select
                                                    className="form-select"
                                                    name="user_id"
                                                    value={formData.user_id}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="">Select a user</option>
                                                    {users.map(user => (
                                                        <option key={user.id} value={user.id}>
                                                            {user.name} ({user.email})
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Plan</label>
                                                <select
                                                    className="form-select"
                                                    name="plan_id"
                                                    value={formData.plan_id}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="">Select a plan</option>
                                                    {plans.map(plan => (
                                                        <option key={plan.id} value={plan.id}>
                                                            {plan.name} ({plan.plan_type})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Status</label>
                                                <select
                                                    className="form-select"
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="active">Active</option>
                                                    <option value="expired">Expired</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Start Date</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    name="start_date"
                                                    value={formData.start_date}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Expiry Date</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    name="end_date"
                                                    value={formData.end_date}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    name="auto_renew"
                                                    id="autoRenewSwitch"
                                                    checked={formData.auto_renew}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label" htmlFor="autoRenewSwitch">
                                                    Auto-renew Subscription
                                                </label>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-end gap-2 mt-4">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => navigate('/admin/subscriptions')}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="tj-primary-btn"
                                                disabled={loading}
                                            >
                                                <span className="btn-text">
                                                    <span>{loading ? 'Saving...' : (isEditMode ? 'Update Subscription' : 'Create Subscription')}</span>
                                                </span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminSubscriptionForm;
