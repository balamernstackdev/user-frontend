import { useState, useEffect } from 'react';
import { activityService } from '../services/activity.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import Pagination from '../components/common/Pagination';
import SEO from '../components/common/SEO';
import { ShieldCheck, Search, Filter, Calendar, Terminal, User, Globe, Activity, CheckCircle, XCircle } from 'lucide-react';
import './styles/AdminListings.css';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        actionType: '',
        userId: '',
        startDate: '',
        endDate: ''
    });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = {
                ...filters,
                limit: pagination.limit,
                offset: (pagination.page - 1) * pagination.limit
            };
            const response = await activityService.getAllLogs(params);
            if (response.data && response.data.pagination) {
                setLogs(response.data.logs);
                setPagination(prev => ({ ...prev, total: response.data.pagination.total }));
            } else if (Array.isArray(response.data)) {
                // Fallback for stale backend
                setLogs(response.data);
                setPagination(prev => ({ ...prev, total: response.data.length }));
            } else if (response.data && response.data.data) {
                setLogs(response.data.data);
                setPagination(prev => ({ ...prev, total: response.data.data.length || 0 }));
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchLogs();
        }, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [pagination.page, filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    return (
        <DashboardLayout>
            <SEO title="System Logs" description="View system activity logs" />

            <div className="admin-listing-page animate-fade-up">
                <div className="admin-container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>System Logs</h1>
                            <p className="text-muted mb-0">Monitor system activities and security events</p>
                        </div>
                    </div>

                    <div className="admin-listing-toolbar">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            {/* Date Filters */}
                            <div className="d-flex align-items-center gap-3">
                                <div className="d-flex align-items-center gap-2">
                                    <input
                                        type="date"
                                        className="custom-select"
                                        style={{ height: '42px' }}
                                        value={filters.startDate}
                                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    />
                                    <span className="text-muted">to</span>
                                    <input
                                        type="date"
                                        className="custom-select"
                                        style={{ height: '42px' }}
                                        value={filters.endDate}
                                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    />
                                    {(filters.startDate || filters.endDate || filters.userId || filters.actionType) && (
                                        <button
                                            className="tj-btn tj-btn-sm tj-btn-outline-danger"
                                            onClick={() => {
                                                setFilters({ actionType: '', userId: '', startDate: '', endDate: '' });
                                                setPagination(prev => ({ ...prev, page: 1 }));
                                            }}
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: '600px' }}>
                                <div className="search-box flex-grow-1">
                                    <Search size={18} className="search-icon" />
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search User ID or Email..."
                                        value={filters.userId}
                                        onChange={(e) => handleFilterChange('userId', e.target.value)}
                                    />
                                </div>

                                <select
                                    className="custom-select"
                                    value={filters.actionType}
                                    onChange={(e) => handleFilterChange('actionType', e.target.value)}
                                    style={{ width: '180px' }}
                                >
                                    <option value="">All Actions</option>
                                    <option value="auth">Auth Events</option>
                                    <option value="payment">Payment Activity</option>
                                    <option value="new_commission">Commissions</option>
                                    <option value="profile">Profile Updates</option>
                                    <option value="system">System Events</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="listing-table-container">
                        <div className="table-responsive">
                            <table className="listing-table">
                                <thead>
                                    <tr>
                                        <th>Timestamp</th>
                                        <th>User Details</th>
                                        <th>Action & Type</th>
                                        <th>Description</th>
                                        <th>Status & IP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="5" className="text-center py-5 text-muted">Loading activity logs...</td></tr>
                                    ) : logs.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5">
                                                <div className="text-muted mb-2"><Terminal size={40} className="opacity-20" /></div>
                                                <p className="text-muted mb-0">No logs found matching your filters</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map(log => (
                                            <tr key={log.id}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2 text-muted small">
                                                        <Calendar size={12} />
                                                        {new Date(log.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="avatar-circle-sm" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }}>
                                                            <User size={12} />
                                                        </div>
                                                        <div className="d-flex flex-column">
                                                            <span className="fw-semibold text-dark">{log.user_name || 'System'}</span>
                                                            <span className="text-muted small">{log.user_email || 'automated_event'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="premium-badge mb-1" style={{ background: '#f1f5f9', color: '#475569' }}>
                                                        <Terminal size={12} className="me-1" /> {log.action_type || 'SYSTEM'}
                                                    </span>
                                                    <div className="small fw-medium text-dark">{log.action || '-'}</div>
                                                </td>
                                                <td>
                                                    <div className="small text-muted text-wrap" style={{ maxWidth: '350px' }}>
                                                        {log.description}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-column gap-1">
                                                        <span className={`premium-badge ${log.status === 'success' ? 'premium-badge-success' : 'premium-badge-danger'}`}>
                                                            {log.status === 'success' ? <CheckCircle size={10} className="me-1" /> : <XCircle size={10} className="me-1" />}
                                                            {log.status}
                                                        </span>
                                                        <div className="small text-muted font-monospace d-flex align-items-center gap-1">
                                                            <Globe size={10} /> {log.ip_address || 'unknown'}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {pagination.total > 0 && (
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

export default AdminLogs;
