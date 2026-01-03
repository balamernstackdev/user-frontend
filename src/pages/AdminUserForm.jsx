import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { userService } from '../services/user.service';
import './AdminForms.css'; // Shared styles

import { toast } from 'react-toastify';

const AdminUserForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'user',
        status: 'active',
        password: '', // Only for creation
        referralCode: '' // Mandatory for 'user' role creation
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);

    useEffect(() => {
        if (isEditMode) {
            fetchUser();
        }
    }, [id]);

    const fetchUser = async () => {
        try {
            const response = await userService.getUserById(id);
            if (response.success) {
                const user = response.data;
                setFormData({
                    name: user.name,
                    email: user.email,
                    phone: user.phone || '',
                    role: user.role,
                    status: user.status,
                    referralCode: user.referralCode || ''
                });
            }
        } catch (err) {
            console.error('Failed to fetch user:', err);
            toast.error('Failed to load user data');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditMode) {
                // Remove email/password from update payload if usually immutable or handled separately
                const { password, email, referralCode, ...updateData } = formData;
                await userService.updateUser(id, updateData);
                toast.success('User updated successfully');
            } else {
                await userService.createUser(formData);
                toast.success('User created successfully');
            }
            navigate('/admin/users');
        } catch (err) {
            console.error('Operation failed:', err);
            const msg = err.response?.data?.message || 'Operation failed';
            toast.error(msg);
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
            <div className="admin-form-page animate-fade-up">
                <div className="container">
                    <div className="admin-form-header mb-4">
                        <h2>{isEditMode ? 'Edit User' : 'Add New User'}</h2>
                        <p>{isEditMode ? 'Update user details' : 'Create a new user account'}</p>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="admin-form-card">
                                <div className="card-body p-4">

                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label">Full Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Email Address</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                disabled={isEditMode} // Usually email is immutable or requires special process
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Phone Number</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Role</label>
                                                <select
                                                    className="form-select"
                                                    name="role"
                                                    value={formData.role}
                                                    onChange={handleChange}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="business_associate">Business Associate</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Status</label>
                                                <select
                                                    className="form-select"
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleChange}
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="suspended">Suspended</option>
                                                </select>
                                            </div>
                                        </div>

                                        {!isEditMode && (formData.role === 'user' || formData.role === 'marketer' || formData.role === 'business_associate') && (
                                            <div className="mb-3">
                                                <label className="form-label">Referral Code</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="referralCode"
                                                    value={formData.referralCode}
                                                    onChange={handleChange}
                                                    placeholder="Enter referral code"
                                                />
                                            </div>
                                        )}

                                        {!isEditMode && (
                                            <div className="mb-3">
                                                <label className="form-label">Password</label>
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    required
                                                    minLength="6"
                                                />
                                            </div>
                                        )}

                                        <div className="d-flex justify-content-end gap-2 mt-4">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => navigate('/admin/users')}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="tj-primary-btn"
                                                disabled={loading}
                                            >
                                                <span className="btn-text">
                                                    <span>{loading ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User')}</span>
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

export default AdminUserForm;

