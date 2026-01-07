import React from 'react';
import { Link } from 'react-router-dom';
import SkeletonLoader from './SkeletonLoader';
import {
    Activity, Settings, CreditCard, User, FileText, AlertCircle, CheckCircle, LogIn, Trash2, Edit
} from 'lucide-react';

const RecentActivityList = ({ logs, isLoading }) => {

    if (isLoading) {
        return (
            <div className="analytics-card h-100 chart-card">
                <div className="card-header d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0"><SkeletonLoader width="140px" height="24px" /></h4>
                    <SkeletonLoader width="60px" height="20px" />
                </div>
                <div className="activity-timeline px-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div className="activity-item d-flex gap-3 mb-4" key={i}>
                            <SkeletonLoader width="36px" height="36px" style={{ borderRadius: '50%' }} />
                            <div className="activity-content w-100">
                                <div className="d-flex justify-content-between mb-2">
                                    <SkeletonLoader width="120px" height="16px" />
                                    <SkeletonLoader width="50px" height="14px" />
                                </div>
                                <SkeletonLoader width="80%" height="14px" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const formatAction = (action) => {
        if (!action) return 'Unknown Action';
        return action
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const getActivityIcon = (log) => {
        const text = (log.description || log.action || '').toLowerCase();

        if (text.includes('setting')) return { icon: Settings, color: '#64748b', bg: '#f1f5f9' };
        if (text.includes('commission') || text.includes('pay')) return { icon: CreditCard, color: '#0ea5e9', bg: '#e0f2fe' };
        if (text.includes('user') || text.includes('profile')) return { icon: User, color: '#3b82f6', bg: '#eff6ff' };
        if (text.includes('plan') || text.includes('sub')) return { icon: FileText, color: '#8b5cf6', bg: '#f5f3ff' };
        if (text.includes('login')) return { icon: LogIn, color: '#10b981', bg: '#ecfdf5' };
        if (text.includes('delete') || text.includes('remove')) return { icon: Trash2, color: '#ef4444', bg: '#fef2f2' };
        if (text.includes('update') || text.includes('edit')) return { icon: Edit, color: '#f59e0b', bg: '#fffbeb' };

        // Default
        return { icon: Activity, color: '#94a3b8', bg: '#f8fafc' };
    };

    return (
        <div className="analytics-card h-100 chart-card">
            <div className="card-header d-flex justify-content-between align-items-center mb-4 border-0 p-0">
                <h4 className="mb-0" style={{ fontWeight: 700, color: '#1e293b' }}>Recent Activity</h4>
                <Link to="/admin/logs" className="text-primary fw-bold text-decoration-none" style={{ fontSize: '13px' }}>View All</Link>
            </div>

            <div className="activity-timeline position-relative px-2">
                {/* Vertical Line */}
                <div
                    style={{
                        position: 'absolute',
                        left: '26px',
                        top: '10px',
                        bottom: '20px',
                        width: '2px',
                        backgroundColor: '#f1f5f9',
                        zIndex: 0
                    }}
                />

                {logs.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="text-muted mb-3">
                            <Activity size={40} className="opacity-25" />
                        </div>
                        <p className="text-muted small mb-0 fw-medium">No recent activity found</p>
                    </div>
                ) : (
                    logs.map((log, index) => {
                        const { icon: Icon, color, bg } = getActivityIcon(log);
                        return (
                            <div className="activity-item d-flex gap-3 mb-4 position-relative" key={log.id} style={{ zIndex: 1, alignItems: 'flex-start' }}>
                                {/* Icon Bubble */}
                                <div
                                    className="d-flex align-items-center justify-content-center shadow-sm"
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        backgroundColor: 'white',
                                        border: `2px solid ${bg}`,
                                        color: color,
                                        flexShrink: 0
                                    }}
                                >
                                    <Icon size={16} strokeWidth={2.5} />
                                </div>

                                {/* Content */}
                                <div className="activity-content flex-grow-1 pt-1">
                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                        <div>
                                            <span className="d-block fw-bold text-dark" style={{ fontSize: '14px', lineHeight: '1.4' }}>
                                                {log.description || formatAction(log.action)}
                                            </span>
                                        </div>
                                        <span
                                            className="text-muted small fw-medium"
                                            style={{ fontSize: '11px', whiteSpace: 'nowrap', marginLeft: '10px' }}
                                        >
                                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <div
                                            className="d-flex align-items-center justify-content-center bg-light text-secondary rounded-circle"
                                            style={{ width: '20px', height: '20px', fontSize: '10px', fontWeight: 'bold' }}
                                        >
                                            {(log.user_name || 'S').charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-muted small" style={{ fontSize: '13px' }}>
                                            {log.user_name || 'System'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default RecentActivityList;
