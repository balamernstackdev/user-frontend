import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { notificationService } from '../services/notification.service';
import './NotificationDetails.css';
import { toast } from 'react-toastify';

const NotificationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotification = async () => {
            try {
                setLoading(true);
                const response = await notificationService.getNotification(id);
                if (response.success) {
                    setNotification(response.data);

                    // Auto mark as read when viewing details
                    if (!response.data.is_read) {
                        await notificationService.markAsRead(id);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch notification:', error);
                // navigate('/notifications'); // Optional: redirect on error
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchNotification();
        }
    }, [id]);

    const handleMarkAsRead = async () => {
        if (!notification) return;
        try {
            await notificationService.markAsRead(id);
            setNotification(prev => ({ ...prev, is_read: true }));
            toast.success('Notification marked as read');
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleDelete = async () => {
        // Assuming delete functionality exists or just redirect
        if (window.confirm('Are you sure you want to delete this notification?')) {
            // await notificationService.delete(id);
            navigate('/notifications');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!notification) {
        return (
            <DashboardLayout>
                <div className="container py-5 text-center">
                    <h3>Notification not found</h3>
                    <Link to="/notifications" className="tj-primary-btn mt-3">
                        <span className="btn-text"><span>Back to Notifications</span></span>
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <section className="page-section">
                <div className="container">
                    <div className="notification-detail-card animate-fade-up">
                        <Link to="/notifications" className="back-button">
                            <i className="fas fa-arrow-left"></i>
                            <span>Back to Notifications</span>
                        </Link>

                        <div className="notification-header">
                            <div className="notification-header-left">
                                <h1 className="notification-title-detail">{notification.title}</h1>
                                <div className="notification-meta">
                                    <span className="meta-item">
                                        <i className="far fa-clock"></i>
                                        <span>{getTimeAgo(notification.created_at)}</span>
                                    </span>
                                    <span className="meta-item">
                                        <i className="far fa-calendar"></i>
                                        <span>{formatDate(notification.created_at)}</span>
                                    </span>
                                    <span className="meta-item">
                                        <i className="fas fa-tag"></i>
                                        <span style={{ textTransform: 'capitalize' }}>{notification.type}</span>
                                    </span>
                                </div>
                            </div>
                            <span className={`notification-status ${notification.is_read ? 'status-read' : 'status-unread'}`}>
                                {notification.is_read ? 'Read' : 'Unread'}
                            </span>
                        </div>

                        <div className="notification-content">
                            <div className="notification-content-body">
                                <p>{notification.message}</p>
                            </div>

                            {/* Dynamic Metadata Rendering */}
                            {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                                <div className="notification-details">
                                    {Object.entries(notification.metadata).map(([key, value]) => {
                                        // Helper to format keys
                                        const formatKey = (k) => {
                                            if (k === 'razorpay_payment_id') return 'Payment ID';
                                            if (k === 'razorpay_order_id') return 'Order ID';
                                            if (k.endsWith('_id')) return k.replace(/_/g, ' ').replace('id', 'ID').replace(/\b\w/g, l => l.toUpperCase());
                                            return k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                        };

                                        // Helper to format values
                                        const formatValue = (k, v) => {
                                            if (typeof v === 'object') return JSON.stringify(v);

                                            // Handle Dates
                                            if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
                                                const date = new Date(v);
                                                if (!isNaN(date.getTime())) {
                                                    return date.toLocaleString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    });
                                                }
                                            }

                                            // Handle Currency
                                            if (k.includes('amount') || k.includes('price')) {
                                                // Assuming INR based on context, or use currency symbol if stored
                                                return `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
                                            }

                                            return String(v);
                                        };

                                        return (
                                            <div className="notification-detail-row" key={key}>
                                                <span className="notification-detail-label">
                                                    {formatKey(key)}
                                                </span>
                                                <span className="notification-detail-value">
                                                    {formatValue(key, value)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="notification-actions-section">
                            <div className="action-links">
                                {notification.link && (
                                    <Link to={notification.link} className="action-link">
                                        <i className="fas fa-link"></i>
                                        <span>View Related Resource</span>
                                    </Link>
                                )}
                            </div>

                            <div className="notification-actions">
                                {!notification.is_read && (
                                    <button className="tj-primary-btn transparent-btn" onClick={handleMarkAsRead}>
                                        <span className="btn-text"><span>Mark as Read</span></span>
                                    </button>
                                )}
                                <Link to="/notifications" className="tj-primary-btn">
                                    <span className="btn-text"><span>Back to Notifications</span></span>
                                    <span className="btn-icon"><i className="fas fa-arrow-right"></i></span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default NotificationDetails;
