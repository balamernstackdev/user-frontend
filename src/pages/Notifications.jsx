import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { notificationService } from '../services/notification.service';
import './Notifications.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationService.getNotifications();
            if (response.success) {
                setNotifications(response.data);
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
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    return (
        <DashboardLayout>
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
                        </>
                    ) : (
                        <div className="empty-state animate-fade-up">
                            <div className="no-content-icon"><i className="fa-light fa-bell-slash"></i></div>
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
