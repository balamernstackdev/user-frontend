import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { userService } from '../services/user.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import Pagination from '../components/common/Pagination';
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
            if (response.data && response.data.pagination) {
                setUsers(response.data.users);
                setPagination(prev => ({ ...prev, total: response.data.pagination.total }));
            } else if (Array.isArray(response.data)) {
                // Fallback for stale backend
                const allData = response.data;
                const startIndex = (pagination.page - 1) * pagination.limit;
                const endIndex = startIndex + pagination.limit;
                const paginatedData = allData.slice(startIndex, endIndex);

                setUsers(paginatedData);
                setPagination(prev => ({ ...prev, total: allData.length }));
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                // Fallback for wrapped array
                const allData = response.data.data;
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
            <div className="admin-listing-page animate-fade-up">
                <div className="container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>User Management</h1>
                            <p style={{ color: '#6c757d' }}>Manage users, marketers, and admins</p>
                        </div>
                        <div className="header-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                className="tj-primary-btn"
                                onClick={() => navigate('/admin/users/create')}
                                style={{ padding: '8px 20px', fontSize: '14px' }}
                            >
                                <span className="btn-text"><span>+ Add User</span></span>
                            </button>
                            <select className="form-control" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: '150px' }}>
                                <option value="all">All Roles</option>
                                <option value="user">Users</option>
                                <option value="marketer">Marketers</option>
                                <option value="admin">Admins</option>
                            </select>
                            <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '150px' }}>
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="pending">Pending</option>
                            </select>
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
                                                    background: user.role === 'admin' ? '#ffebee' : user.role === 'marketer' ? '#e3f2fd' : '#e8f5e9',
                                                    color: user.role === 'admin' ? '#c62828' : user.role === 'marketer' ? '#1565c0' : '#2e7d32'
                                                }}>
                                                    {user.role}
                                                </span>
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

                                                    {user.role === 'marketer' && user.status === 'pending' && (
                                                        <button className="action-btn" onClick={() => handleStatusToggle(user, 'approved')} title="Approve" style={{ color: '#28a745', borderColor: '#28a745' }}>
                                                            <i className="fas fa-check"></i>
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
