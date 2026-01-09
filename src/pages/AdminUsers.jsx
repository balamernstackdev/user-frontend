import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { userService } from '../services/user.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import Pagination from '../components/common/Pagination';
import SEO from '../components/common/SEO';
import { Users, UserCheck, UserX, UserPlus, Download, Plus, Edit, Trash, Check, Crown, Search, Calendar, Filter, Mail } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import { toast } from 'react-toastify';
import { adminService } from '../services/admin.service';
import './styles/AdminListings.css';

const AdminUsers = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(searchParams.get('filter') || 'all');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        pending: 0
    });
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showExportDropdown, setShowExportDropdown] = useState(false);
    const exportDropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
                setShowExportDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {
                limit: pagination.limit,
                offset: (pagination.page - 1) * pagination.limit,
                startDate,
                endDate
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
                if (responseData.data.summary) {
                    setStats(responseData.data.summary);
                }
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
    }, [pagination.page, filter, statusFilter, startDate, endDate]);

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

    const handleExport = async (format) => {
        try {
            const isMarketerExport = filter === 'business_associate';
            const type = isMarketerExport ? 'marketers' : 'users';

            const params = {
                startDate,
                endDate,
                role: isMarketerExport ? undefined : (filter !== 'all' ? filter : undefined),
                status: statusFilter || undefined
            };

            const blob = await adminService.exportData(type, format, params);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${type}_${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully!`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error(`Failed to export ${filter === 'business_associate' ? 'marketers' : 'users'}. Please try again.`);
        }
    };

    return (
        <DashboardLayout>
            <SEO title="User Management" description="Manage platform users and roles" />

            <div className="admin-listing-page animate-fade-up">
                <div className="admin-container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>User Management</h1>
                            <p className="text-muted mb-0">Manage platform users, marketers, and administrators</p>
                        </div>
                        <div className="header-actions">
                            <div className="btn-group" ref={exportDropdownRef}>
                                <button
                                    className="tj-btn tj-btn-outline-primary"
                                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                                >
                                    <Download size={18} className="me-2" /> Export
                                </button>
                                {showExportDropdown && (
                                    <ul className="dropdown-menu show shadow-sm border" style={{ display: 'block', position: 'absolute', top: '100%', right: 0, zIndex: 1000, minWidth: '140px' }}>
                                        <li>
                                            <button className="dropdown-item py-2" onClick={() => { handleExport('csv'); setShowExportDropdown(false); }}>
                                                Export as CSV
                                            </button>
                                        </li>
                                        <li>
                                            <button className="dropdown-item py-2" onClick={() => { handleExport('pdf'); setShowExportDropdown(false); }}>
                                                Export as PDF
                                            </button>
                                        </li>
                                    </ul>
                                )}
                            </div>
                            <button
                                className="tj-btn tj-btn-primary"
                                onClick={() => navigate('/admin/users/create')}
                            >
                                <Plus size={18} className="me-2" /> Add User
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-3">
                            <StatCard
                                label="Total Users"
                                value={stats.total}
                                icon={Users}
                                isLoading={loading}
                                active={statusFilter === ''}
                                onClick={() => setStatusFilter('')}
                            />
                        </div>
                        <div className="col-md-3">
                            <StatCard
                                label="Active Users"
                                value={stats.active}
                                icon={UserCheck}
                                iconColor="#10b981"
                                iconBgColor="rgba(16, 185, 129, 0.1)"
                                isLoading={loading}
                                active={statusFilter === 'active'}
                                onClick={() => setStatusFilter('active')}
                            />
                        </div>
                        <div className="col-md-3">
                            <StatCard
                                label="Inactive"
                                value={stats.inactive}
                                icon={UserX}
                                iconColor="#ffc107"
                                iconBgColor="rgba(255, 193, 7, 0.1)"
                                isLoading={loading}
                                active={statusFilter === 'inactive'}
                                onClick={() => setStatusFilter('inactive')}
                            />
                        </div>
                        <div className="col-md-3">
                            <StatCard
                                label="Pending"
                                value={stats.pending}
                                icon={UserPlus}
                                iconColor="#dc3545"
                                iconBgColor="rgba(220, 53, 69, 0.1)"
                                isLoading={loading}
                                active={statusFilter === 'pending'}
                                onClick={() => setStatusFilter('pending')}
                            />
                        </div>
                    </div>

                    <div className="admin-listing-toolbar">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div className="d-flex align-items-center gap-3">
                                <div className="d-flex align-items-center gap-2">
                                    <Calendar size={14} className="text-muted" />
                                    <span className="text-muted small fw-bold text-uppercase">Joined:</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <input
                                        type="date"
                                        className="custom-select"
                                        style={{ height: '42px' }}
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                    <span className="text-muted px-1">to</span>
                                    <input
                                        type="date"
                                        className="custom-select"
                                        style={{ height: '42px' }}
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                    {(startDate || endDate) && (
                                        <button className="tj-btn tj-btn-sm tj-btn-outline-danger ms-2" onClick={() => { setStartDate(''); setEndDate(''); }}>
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="d-flex gap-2 flex-grow-1 justify-content-end" style={{ maxWidth: '500px' }}>
                                <div className="d-flex align-items-center gap-2">
                                    <Filter size={14} className="text-muted" />
                                    <select className="custom-select" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: '160px' }}>
                                        <option value="all">All Roles</option>
                                        <option value="user">Users Only</option>
                                        <option value="business_associate">Associates</option>
                                        <option value="admin">Administrators</option>
                                    </select>
                                </div>
                                <select className="custom-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '130px' }}>
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="listing-table-container">
                        <div className="table-responsive">
                            <table className="listing-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Joined Date</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="6" className="text-center py-5 text-muted">Loading user database...</td></tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5">
                                                <div className="text-muted mb-2"><Users size={40} className="opacity-20" /></div>
                                                <p className="text-muted mb-0">No users found matching your filters</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map(user => (
                                            <tr key={user.id}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="avatar-circle-sm" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }}>
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div className="fw-semibold text-dark">{user.name}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-1 text-muted">
                                                        <Mail size={12} />
                                                        <span>{user.email}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`premium-badge ${user.role === 'admin' ? 'premium-badge-danger' : user.role === 'business_associate' ? 'premium-badge-warning' : 'premium-badge-success'}`}>
                                                        {user.role === 'business_associate' ? 'Associate' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`premium-badge ${(user.status === 'active' || user.status === 'approved') ? 'premium-badge-success' : user.status === 'pending' ? 'premium-badge-warning' : 'premium-badge-danger'}`}>
                                                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="text-muted small d-flex align-items-center gap-1">
                                                        <Calendar size={12} />
                                                        {new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </td>
                                                <td className="text-end">
                                                    <div className="actions-cell justify-content-end">
                                                        <button className="action-btn" onClick={() => navigate(`/admin/users/edit/${user.id}`)} title="Edit User">
                                                            <Edit size={16} />
                                                        </button>

                                                        {user.role === 'business_associate' && user.status === 'pending' && (
                                                            <button className="action-btn" onClick={() => handleStatusToggle(user, 'approved')} title="Approve Associate" style={{ color: '#10b981' }}>
                                                                <Check size={16} />
                                                            </button>
                                                        )}

                                                        {user.role === 'business_associate' && user.status === 'active' && (
                                                            <button
                                                                className={`action-btn ${user.is_vip ? 'active' : ''}`}
                                                                style={{ color: user.is_vip ? '#f59e0b' : 'inherit' }}
                                                                onClick={async () => {
                                                                    try {
                                                                        await userService.updateVipStatus(user.id, !user.is_vip);
                                                                        toast.success(`User marked as ${!user.is_vip ? 'VIP' : 'Standard'}`);
                                                                        fetchUsers();
                                                                    } catch (err) { toast.error('Failed to update VIP status'); }
                                                                }}
                                                                title={user.is_vip ? "Remove VIP" : "Make VIP"}
                                                            >
                                                                <Crown size={16} />
                                                            </button>
                                                        )}

                                                        <button className="action-btn delete" onClick={() => handleDeleteUser(user.id)} title="Delete User">
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
                        {pagination.total > pagination.limit && (
                            <div className="mt-4 p-4 border-top d-flex justify-content-center">
                                <Pagination
                                    currentPage={pagination.page}
                                    totalItems={pagination.total}
                                    itemsPerPage={pagination.limit}
                                    onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminUsers;
