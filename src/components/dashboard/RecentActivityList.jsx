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
                <div className="card-header d-flex justify-content-between align-items-center mb-4 border-0 pb-0">
                    <h5 className="mb-0 fw-bold"><SkeletonLoader width="140px" height="24px" /></h5>
                    <SkeletonLoader width="60px" height="20px" />
                </div>
                <div className="activity-timeline px-2 pt-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div className="activity-item d-flex gap-3 mb-4" key={i}>
                            <SkeletonLoader width="40px" height="40px" style={{ borderRadius: '50%' }} />
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

        // More vibrant and distinct color palette
        if (text.includes('setting')) return { icon: Settings, color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' };
        if (text.includes('commission') || text.includes('pay')) return { icon: CreditCard, color: '#0284c7', bg: '#e0f2fe', border: '#bae6fd' };
        if (text.includes('user') || text.includes('profile')) return { icon: User, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' };
        if (text.includes('plan') || text.includes('sub')) return { icon: FileText, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' };
        if (text.includes('login')) return { icon: LogIn, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' };
        if (text.includes('delete') || text.includes('remove')) return { icon: Trash2, color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
        if (text.includes('update') || text.includes('edit')) return { icon: Edit, color: '#d97706', bg: '#fffbeb', border: '#fde68a' };

        // Default
        return { icon: Activity, color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' };
    };

    return (
        <div className="analytics-card h-100 chart-card bg-white rounded-4 shadow-sm border-0">
            <div className="card-header d-flex justify-content-between align-items-center mb-4 border-0 pb-0 pt-4 px-4 bg-transparent">
                <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                    <Activity size={20} className="text-primary" />
                    Recent Activity
                </h5>
                <Link
                    to="/admin/logs"
                    className="btn btn-light btn-sm rounded-pill px-3 fw-semibold text-primary bg-primary-subtle border-0"
                    style={{ fontSize: '12px' }}
                >
                    View All
                </Link>
            </div>

            <div className="card-body px-4 pt-0 pb-4">
                <div className="activity-timeline position-relative">
                    {/* Vertical Timeline Line */}
                    <div
                        style={{
                            position: 'absolute',
                            left: '19px',
                            top: '10px',
                            bottom: '30px',
                            width: '2px',
                            backgroundColor: '#e2e8f0',
                            zIndex: 0
                        }}
                    />

                    {logs.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="mb-3 d-inline-flex align-items-center justify-content-center bg-light rounded-circle" style={{ width: '64px', height: '64px' }}>
                                <Activity size={32} className="text-muted opacity-50" />
                            </div>
                            <h6 className="text-dark fw-semibold mb-1">No recent activity</h6>
                            <p className="text-muted small mb-0">Activities will appear here as they happen.</p>
                        </div>
                    ) : (
                        logs.map((log, index) => {
                            const { icon: Icon, color, bg, border } = getActivityIcon(log);
                            return (
                                <div className="activity-item d-flex gap-3 mb-4 position-relative group" key={log.id} style={{ zIndex: 1 }}>
                                    {/* Icon Bubble */}
                                    <div
                                        className="d-flex align-items-center justify-content-center flex-shrink-0 transition-all"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: bg,
                                            border: `1px solid ${border}`,
                                            color: color,
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                        }}
                                    >
                                        <Icon size={18} strokeWidth={2} />
                                    </div>

                                    {/* Content */}
                                    <div className="activity-content flex-grow-1 pt-1">
                                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-1 mb-1">
                                            <span className="fw-semibold text-dark text-truncate" style={{ fontSize: '14px', maxWidth: '100%' }}>
                                                {log.description || formatAction(log.action)}
                                            </span>
                                            <span
                                                className="text-muted small fw-medium text-nowrap"
                                                style={{ fontSize: '11px' }}
                                            >
                                                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <div className="d-flex align-items-center gap-2 mt-1">
                                            <div
                                                className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 text-white fw-bold"
                                                style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    fontSize: '10px',
                                                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                                                }}
                                            >
                                                {(log.user_name || 'S').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-muted small" style={{ fontSize: '12px' }}>
                                                <span className="fw-medium text-dark">{log.user_name || 'System'}</span> performed this action
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecentActivityList;
