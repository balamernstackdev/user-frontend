import React from 'react';
import { Link } from 'react-router-dom';
import SkeletonLoader from './SkeletonLoader';

const RecentActivityList = ({ logs, isLoading }) => {

    if (isLoading) {
        return (
            <div className="analytics-card h-100">
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

    return (
        <div className="analytics-card h-100">
            <div className="card-header d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Recent Activity</h4>
                <Link to="/admin/logs" className="btn-link">View All</Link>
            </div>
            <div className="activity-timeline">
                {logs.length === 0 ? (
                    <div className="text-center py-4 text-muted">No recent activity</div>
                ) : (
                    logs.map((log, index) => (
                        <div className="activity-item" key={log.id}>
                            <div className="activity-indicator">
                                <div className={`indicator-dot ${log.status === 'success' ? 'bg-success' : 'bg-danger'}`}></div>
                                {index !== logs.length - 1 && <div className="indicator-line"></div>}
                            </div>
                            <div className="activity-content">
                                <div className="d-flex justify-content-between mb-1">
                                    <span className="activity-user fw-bold">{log.user_name || 'System'}</span>
                                    <span className="activity-time">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="activity-desc mb-0">{log.description || log.action}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RecentActivityList;
