import React from 'react';
import { Link } from 'react-router-dom';
import SkeletonLoader from './SkeletonLoader';

const RecentActivityList = ({ logs, isLoading }) => {

    if (isLoading) {
        return (
            <div className="analytics-card h-100 chart-card">
                <div className="card-header d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0"><SkeletonLoader width="140px" height="24px" /></h4>
                    <SkeletonLoader width="60px" height="20px" />
                </div>
                <div className="activity-timeline">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div className="activity-item" key={i}>
                            <div className="activity-indicator">
                                <div className="indicator-dot bg-secondary-soft"></div>
                                {i !== 5 && <div className="indicator-line"></div>}
                            </div>
                            <div className="activity-content w-100">
                                <div className="d-flex justify-content-between mb-1">
                                    <SkeletonLoader width="100px" height="16px" />
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

    return (
        <div className="analytics-card h-100 chart-card">
            <div className="card-header d-flex justify-content-between align-items-center mb-4 border-0 p-0">
                <h4 className="mb-0">Recent Activity</h4>
                <Link to="/admin/logs" className="text-primary fw-semibold text-decoration-none" style={{ fontSize: '13px' }}>View All</Link>
            </div>
            <div className="activity-timeline">
                {logs.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="text-muted mb-2"><i className="fas fa-history fa-2x opacity-25"></i></div>
                        <p className="text-muted small mb-0">No recent activity found</p>
                    </div>
                ) : (
                    logs.map((log, index) => (
                        <div className="activity-item d-flex gap-3 mb-4" key={log.id}>
                            <div className="activity-indicator d-flex flex-column align-items-center" style={{ width: '20px' }}>
                                <div
                                    className={`rounded-circle d-flex align-items-center justify-content-center`}
                                    style={{
                                        width: '12px',
                                        height: '12px',
                                        backgroundColor: log.status === 'failure' ? '#ef4444' : '#10b981',
                                        flexShrink: 0
                                    }}
                                ></div>
                                {index !== logs.length - 1 && (
                                    <div style={{ width: '2px', flexGrow: 1, backgroundColor: '#f1f5f9', marginTop: '4px', marginBottom: '-20px' }}></div>
                                )}
                            </div>
                            <div className="activity-content flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                    <div>
                                        <span className="d-block fw-bold text-dark" style={{ fontSize: '14px' }}>
                                            {log.description || formatAction(log.action)}
                                        </span>
                                        <span className="text-muted small">
                                            by <span className="fw-medium text-dark">{log.user_name || 'System'}</span>
                                        </span>
                                    </div>
                                    <span className="text-muted small bg-light px-2 py-1 rounded" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RecentActivityList;
