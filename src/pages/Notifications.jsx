import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { notificationService } from '../services/notification.service';
import Pagination from '../components/common/Pagination';
import SEO from '../components/common/SEO';
import './styles/Notifications.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const LIMIT = 5;

    useEffect(() => {
        fetchNotifications();
    }, [page]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const offset = (page - 1) * LIMIT;
            const response = await notificationService.getNotifications({ limit: LIMIT, offset });
            if (response.success) {
                if (response.pagination) {
                    setNotifications(response.data);
                    setTotalPages(response.pagination.pages);
                } else if (Array.isArray(response.data)) {
                    // Fallback for stale backend
                    const allData = response.data;
                    const startIndex = (page - 1) * LIMIT;
                    const endIndex = startIndex + LIMIT;
                    const paginatedData = allData.slice(startIndex, endIndex);

                    setNotifications(paginatedData);
                    setTotalPages(Math.ceil(allData.length / LIMIT));
                } else {
                    setNotifications(response.data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            const updated = notifications.map(n => ({ ...n, is_read: true }));
            setNotifications(updated);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);

        // Fix for PG timestamp mismatch: adjusting for local timezone offset
        // If the server sent a UTC time that was originally read as local, we need to shift it back.
        const correctedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

        const now = new Date();
        const diffInSeconds = Math.floor((now - correctedDate) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    return (
        <DashboardLayout>
            <SEO title="Notifications" description="Stay updated with your account activity." />
            <section className="page-section">
                <div className="container">
                    <div className="page-header animate-fade-up">
                        <h2>Notifications</h2>
                        <p style={{ color: 'var(--tj-color-text-body-3)' }}>Stay updated with all your account activities</p>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : notifications.length > 0 ? (
                        <>
                            <div className="mark-all-read animate-fade-up">
                                <a href="#" className="tj-primary-btn transparent-btn" onClick={(e) => { e.preventDefault(); markAllRead(); }}>
                                    <span className="btn-text"><span>Mark All as Read</span></span>
                                </a>
                            </div>

                            <div className="notification-list">
                                {notifications.map((notification, index) => (
                                    <div
                                        key={notification.id}
                                        className={`notification-card animate-fade-up ${!notification.is_read ? 'unread' : ''}`}
                                        style={{ animationDelay: `${0.1 + (index * 0.05)}s` }}
                                    >
                                        <div className="notification-header">
                                            <h4 className="notification-title">
                                                <Link to={`/notifications/${notification.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                    {notification.title}
                                                </Link>
                                            </h4>
                                            <span className="notification-time">{getTimeAgo(notification.created_at)}</span>
                                        </div>
                                        <div className="notification-content">
                                            {notification.message}
                                        </div>
                                        <div className="notification-actions">
                                            <Link to={`/notifications/${notification.id}`} className="text-btn" style={{ fontSize: '14px' }}>
                                                View Details
                                            </Link>
                                            {notification.link && (
                                                <Link to={notification.link} className="text-btn" style={{ fontSize: '14px', marginLeft: '15px' }}>
                                                    {notification.type === 'payment' ? 'View Payment' :
                                                        notification.type === 'download' ? 'View Downloads' :
                                                            'View Link'}
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={(newPage) => {
                                    setPage(newPage);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            />
                        </>
                    ) : (
                        <div className="empty-state animate-fade-up">
                            <div className="no-content-icon"><i className="fas fa-bell-slash"></i></div>
                            <h3>No notifications</h3>
                            <p>You're all caught up! Check back later for updates.</p>
                        </div>
                    )}
                </div>
            </section>
        </DashboardLayout>
    );
};

export default Notifications;
