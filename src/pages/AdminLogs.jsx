import { useState, useEffect } from 'react';
import { activityService } from '../services/activity.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import Pagination from '../components/common/Pagination';
import SEO from '../components/common/SEO';
import './AdminListings.css';

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
                <div className="container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>System Logs</h1>
                            <p style={{ color: '#6c757d' }}>Monitor system activities and security events</p>
                        </div>
                        <div className="header-actions">
                            <div className="filter-group" style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    placeholder="Search by User ID..."
                                    className="form-control"
                                    style={{ width: '180px' }}
                                    value={filters.userId}
                                    onChange={(e) => handleFilterChange('userId', e.target.value)}
                                />
                                <select
                                    className="custom-select"
                                    value={filters.actionType}
                                    onChange={(e) => handleFilterChange('actionType', e.target.value)}
                                    style={{ width: '150px' }}
                                >
                                    <option value="">All Actions</option>
                                    <option value="auth">Auth</option>
                                    <option value="payment">Payment</option>
                                    <option value="new_commission">Commission</option>
                                    <option value="admin_action">Admin Action</option>
                                </select>
                                <input
                                    type="date"
                                    className="form-control"
                                    style={{ width: '140px' }}
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                />
                                <input
                                    type="date"
                                    className="form-control"
                                    style={{ width: '140px' }}
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="listing-table-container">
                        <table className="listing-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>IP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center">Loading...</td></tr>
                                ) : logs.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center" style={{ padding: '50px' }}>No logs found</td></tr>
                                ) : (
                                    logs.map(log => (
                                        <tr key={log.id}>
                                            <td>{new Date(log.created_at).toLocaleString()}</td>
                                            <td>
                                                <div className="plan-info-cell">
                                                    <span className="plan-name-text" style={{ fontSize: '14px' }}>{log.user_name || 'System'}</span>
                                                    <span className="plan-slug-text">{log.user_email}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="plan-type-badge" style={{ background: '#f5f5f5', color: '#666' }}>{log.action_type}</span> <br />
                                                <small style={{ marginTop: '5px', display: 'block' }}>{log.action}</small>
                                            </td>
                                            <td style={{ maxWidth: '300px' }}>{log.description}</td>
                                            <td>
                                                <span className={`plan-type-badge`} style={{
                                                    background: log.status === 'success' ? '#e8f5e9' : '#ffebee',
                                                    color: log.status === 'success' ? '#2e7d32' : '#c62828'
                                                }}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td style={{ fontFamily: 'monospace' }}>{log.ip_address}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Pagination Buttons */}
                        {logs.length > 0 && (
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

export default AdminLogs;
