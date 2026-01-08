import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { userService } from '../services/user.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import Pagination from '../components/common/Pagination';
import SEO from '../components/common/SEO';
import { Users, UserCheck, UserX, UserPlus } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import './styles/AdminListings.css';
import { toast } from 'react-toastify';
import { adminService } from '../services/admin.service';

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
                <div className="container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>User Management</h1>
                            <p style={{ color: '#6c757d' }}>Manage users, marketers, and admins</p>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="admin-stats-grid mb-4">
                        <StatCard
                            label="Total Users"
                            value={stats.total}
                            icon={Users}
                            isLoading={loading}
                            active={statusFilter === ''}
                            onClick={() => setStatusFilter('')}
                            className="card-users stat-card-hover"
                        />
                        <StatCard
                            label="Active Users"
                            value={stats.active}
                            icon={UserCheck}
                            iconColor="#10b981"
                            iconBgColor="rgba(16, 185, 129, 0.1)"
                            isLoading={loading}
                            active={statusFilter === 'active'}
                            onClick={() => setStatusFilter('active')}
                            className="card-active-marketers stat-card-hover"
                        />
                        <StatCard
                            label="Inactive Users"
                            value={stats.inactive}
                            icon={UserX}
                            iconColor="#ffc107"
                            iconBgColor="rgba(255, 193, 7, 0.1)"
                            isLoading={loading}
                            active={statusFilter === 'inactive'}
                            onClick={() => setStatusFilter('inactive')}
                            className="card-plans stat-card-hover"
                        />
                        <StatCard
                            label="Pending Approvals"
                            value={stats.pending}
                            icon={UserPlus}
                            iconColor="#dc3545"
                            iconBgColor="rgba(220, 53, 69, 0.1)"
                            isLoading={loading}
                            active={statusFilter === 'pending'}
                            onClick={() => setStatusFilter('pending')}
                            className="card-expiring stat-card-hover"
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
                            {/* Left Side: Date Filters */}
                            {/* Left Side: Date Filters */}
                            <div className="d-flex align-items-center gap-3">
                                <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>Filter Date:</span>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="input-group input-group-sm" style={{ width: '160px' }}>
                                        <span className="input-group-text bg-white border-end-0 text-muted pe-1">
                                            <i className="far fa-calendar-alt"></i>
                                        </span>
                                        <input
                                            type="date"
                                            className="form-control border-start-0 ps-2"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            style={{ borderColor: '#dee2e6', color: '#6c757d' }}
                                        />
                                    </div>
                                    <span className="text-muted small">to</span>
                                    <div className="input-group input-group-sm" style={{ width: '160px' }}>
                                        <span className="input-group-text bg-white border-end-0 text-muted pe-1">
                                            <i className="far fa-calendar-alt"></i>
                                        </span>
                                        <input
                                            type="date"
                                            className="form-control border-start-0 ps-2"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            style={{ borderColor: '#dee2e6', color: '#6c757d' }}
                                        />
                                    </div>
                                    {(startDate || endDate) && (
                                        <button
                                            className="btn btn-sm text-danger ms-1"
                                            onClick={() => { setStartDate(''); setEndDate(''); }}
                                            title="Clear Dates"
                                            style={{ background: 'none', border: 'none' }}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Right Side: Filters & Actions */}
                            <div className="d-flex align-items-center gap-3">
                                <div className="d-flex gap-2">
                                    <select
                                        className="form-select form-select-sm"
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                        style={{ borderRadius: '6px', borderColor: '#e2e8f0', minWidth: '130px' }}
                                    >
                                        <option value="all">All Roles</option>
                                        <option value="user">Users</option>
                                        <option value="business_associate">Business Associates</option>
                                        <option value="admin">Admins</option>
                                    </select>
                                    <select
                                        className="form-select form-select-sm"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        style={{ borderRadius: '6px', borderColor: '#e2e8f0', minWidth: '130px' }}
                                    >
                                        <option value="">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>

                                <div className="vr mx-1" style={{ color: '#e2e8f0' }}></div>

                                <div className="btn-group" style={{ position: 'relative' }} ref={exportDropdownRef}>
                                    <button
                                        className="tj-primary-btn"
                                        type="button"
                                        onClick={() => setShowExportDropdown(!showExportDropdown)}
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
                                        <i className="fas fa-download me-2"></i>
                                        <span className="btn-text">Export</span>
                                    </button>
                                    {showExportDropdown && (
                                        <ul className="dropdown-menu show shadow-sm" style={{ display: 'block', position: 'absolute', top: '100%', right: 0, zIndex: 1000, border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                                            <li>
                                                <button
                                                    className="dropdown-item d-flex align-items-center gap-2"
                                                    onClick={() => { handleExport('csv'); setShowExportDropdown(false); }}
                                                >
                                                    <i className="fas fa-file-csv text-success"></i> CSV
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className="dropdown-item d-flex align-items-center gap-2"
                                                    onClick={() => { handleExport('pdf'); setShowExportDropdown(false); }}
                                                >
                                                    <i className="fas fa-file-pdf text-danger"></i> PDF
                                                </button>
                                            </li>
                                        </ul>
                                    )}
                                </div>

                                <button
                                    className="tj-primary-btn"
                                    onClick={() => navigate('/admin/users/create')}
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
                                    <span className="btn-text">Add User</span>
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
                                            <td>{new Date(user.created_at).toLocaleDateString('en-GB')}</td>
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
