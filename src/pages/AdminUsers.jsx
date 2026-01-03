import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { userService } from '../services/user.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import Pagination from '../components/common/Pagination';
import SEO from '../components/common/SEO';
import './AdminListings.css';
import { toast } from 'react-toastify';

const AdminUsers = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(searchParams.get('filter') || 'all');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
    const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0 });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {
                limit: pagination.limit,
                offset: (pagination.page - 1) * pagination.limit
            };
            if (filter !== 'all') params.role = filter;
            if (statusFilter) params.status = statusFilter;

            const response = await userService.getAllUsers(params);

            // Check for correct response structure: { data: { data: { users, pagination } } } (Axios + Backend wrapper)
            // Or if interceptor handles it: { success: true, data: { users, pagination } }

            // Assuming userService.getAllUsers returns the Axios response object as defined in my added method: return response;
            // Axios response structure: { data: { success: true, data: { users, pagination } }, ... }

            const responseData = response.data; // The backend JSON response

            if (responseData.success && responseData.data && responseData.data.pagination) {
                setUsers(responseData.data.users);
                setPagination(prev => ({ ...prev, total: responseData.data.pagination.total }));
            } else if (responseData && responseData.pagination) {
                // Formatting fallback 1
                setUsers(responseData.users);
                setPagination(prev => ({ ...prev, total: responseData.pagination.total }));
            } else if (Array.isArray(responseData)) {
                // Fallback for stale backend
                const allData = responseData;
                const startIndex = (pagination.page - 1) * pagination.limit;
                const endIndex = startIndex + pagination.limit;
                const paginatedData = allData.slice(startIndex, endIndex);

                setUsers(paginatedData);
                setPagination(prev => ({ ...prev, total: allData.length }));
            } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
                // Fallback for wrapped array
                const allData = responseData.data;
                const startIndex = (pagination.page - 1) * pagination.limit;
                const endIndex = startIndex + pagination.limit;
                const paginatedData = allData.slice(startIndex, endIndex);

                setUsers(paginatedData);
                setPagination(prev => ({ ...prev, total: allData.length }));
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, filter, statusFilter]);

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                // Optimistic update: Remove from UI immediately
                setUsers(prevUsers => prevUsers.filter(user => user.id !== id));

                await userService.deleteUser(id);
                // No need to fetchUsers() immediately if we trust the optimistic update,
                // but fetching ensures sync with server.
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user');
                // Revert or re-fetch on error
                fetchUsers();
            }
        }
    };

    const handleStatusToggle = async (user, newStatus) => {
        try {
            await userService.updateUser(user.id, { status: newStatus });
            fetchUsers();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    return (
        <DashboardLayout>
            <SEO title="User Management" description="Manage platform users and roles" />
            <div className="admin-listing-page animate-fade-up">
                <div className="container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>User Management</h1>
                            <p style={{ color: '#6c757d' }}>Manage users, marketers, and admins</p>
                        </div>
                        <div className="header-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <div className="filter-group">
                                <select
                                    className="custom-select"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                >
                                    <option value="all">All Roles</option>
                                    <option value="user">Users</option>
                                    <option value="business_associate">Business Associates</option>
                                    <option value="admin">Admins</option>
                                </select>
                                <select
                                    className="custom-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                            <button
                                className="tj-btn tj-btn-primary"
                                onClick={() => navigate('/admin/users/create')}
                                style={{ padding: '8px 20px', fontSize: '14px' }}
                            >
                                <span className="btn-text"><span>+ Add User</span></span>
                            </button>
                        </div>
                    </div>

                    <div className="listing-table-container">
                        <table className="listing-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center">Loading...</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center" style={{ padding: '50px' }}>No users found</td></tr>
                                ) : (
                                    users.map(user => (
                                        <tr key={user.id}>
                                            <td><span className="plan-name-text">{user.name}</span></td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`plan-type-badge`} style={{
                                                    background: user.role === 'admin' ? '#ffebee' : user.role === 'business_associate' ? '#e3f2fd' : '#e8f5e9',
                                                    color: user.role === 'admin' ? '#c62828' : user.role === 'business_associate' ? '#1565c0' : '#2e7d32'
                                                }}>
                                                    {user.role}
                                                </span>
                                                {user.is_vip && (
                                                    <span className="ms-2 badge rounded-pill bg-warning text-dark" style={{ fontSize: '11px', verticalAlign: 'middle' }}>
                                                        <i className="fas fa-crown me-1"></i>VIP
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`plan-type-badge`} style={{
                                                    background: (user.status === 'active' || user.status === 'approved') ? 'rgba(40, 167, 69, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: (user.status === 'active' || user.status === 'approved') ? '#28a745' : '#ef4444'
                                                }}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <div className="actions-cell">
                                                    <button className="action-btn" onClick={() => navigate(`/admin/users/edit/${user.id}`)} title="Edit">
                                                        <i className="far fa-edit"></i>
                                                    </button>

                                                    {user.role === 'business_associate' && user.status === 'pending' && (
                                                        <button className="action-btn" onClick={() => handleStatusToggle(user, 'approved')} title="Approve" style={{ color: '#28a745', borderColor: '#28a745' }}>
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                    )}

                                                    {user.role === 'business_associate' && user.status === 'active' && (
                                                        <button
                                                            className="action-btn"
                                                            onClick={async () => {
                                                                try {
                                                                    await userService.updateVipStatus(user.id, !user.is_vip);
                                                                    toast.success(`User marked as ${!user.is_vip ? 'VIP' : 'Standard'}`);
                                                                    fetchUsers();
                                                                } catch (err) {
                                                                    console.error('VIP Update Error:', err);
                                                                    toast.error('Failed to update VIP status');
                                                                }
                                                            }}
                                                            title={user.is_vip ? "Remove VIP Status" : "Make VIP"}
                                                            style={{
                                                                color: user.is_vip ? '#f59e0b' : '#94a3b8',
                                                                borderColor: user.is_vip ? '#f59e0b' : '#cbd5e1',
                                                                background: user.is_vip ? '#fffbeb' : 'white'
                                                            }}
                                                        >
                                                            <i className="fas fa-crown"></i>
                                                        </button>
                                                    )}

                                                    <button className="action-btn delete" onClick={() => handleDeleteUser(user.id)} title="Delete">
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {users.length > 0 && (
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
        </DashboardLayout>
    );
};

export default AdminUsers;
