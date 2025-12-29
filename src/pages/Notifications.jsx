import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import './Notifications.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: "Payment Successful",
            time: "2 hours ago",
            content: "Your payment of $99.00 for Premium Plan has been processed successfully. Your subscription is now active.",
            isUnread: true,
            actions: [
                { label: "View Details", link: "#" },
                { label: "View Payment", link: "/payment-success" }
            ]
        },
        {
            id: 2,
            title: "New Download Available",
            time: "5 hours ago",
            content: "A new resource has been added to your downloads. Check it out in your downloads section.",
            isUnread: true,
            actions: [
                { label: "View Details", link: "#" },
                { label: "View Downloads", link: "/downloads" }
            ]
        },
        {
            id: 3,
            title: "Subscription Renewal Reminder",
            time: "1 day ago",
            content: "Your subscription will renew on January 15, 2025. Make sure your payment method is up to date.",
            isUnread: false,
            actions: [
                { label: "View Details", link: "#" },
                { label: "Renew Now", link: "/plans" }
            ]
        },
        {
            id: 4,
            title: "Welcome to Stoxzo!",
            time: "3 days ago",
            content: "Thank you for joining us! Explore our features and get started with your account.",
            isUnread: false,
            actions: [
                { label: "View Details", link: "#" }
            ]
        }
    ]);

    const markAllRead = () => {
        const updatedNotifications = notifications.map(notif => ({
            ...notif,
            isUnread: false
        }));
        setNotifications(updatedNotifications);
        // Ideally call API here
    };

    return (
        <DashboardLayout>
            <section className="page-section">
                <div className="container">
                    <div className="page-header animate-fade-up">
                        <h2>Notifications</h2>
                        <p style={{ color: '#6c757d' }}>Stay updated with all your account activities</p>
                    </div>

                    {notifications.length > 0 ? (
                        <>
                            <div className="mark-all-read animate-fade-up" style={{ animationDelay: '0.1s' }}>
                                <button className="tj-primary-btn" onClick={markAllRead} style={{ background: 'transparent', border: '1px solid #1e8a8a', color: '#1e8a8a' }}>
                                    <span className="btn-text"><span>Mark All as Read</span></span>
                                </button>
                            </div>

                            <div className="notification-list">
                                {notifications.map((notification, index) => (
                                    <div
                                        key={notification.id}
                                        className={`notification-card animate-fade-up ${notification.isUnread ? 'unread' : ''}`}
                                        style={{ animationDelay: `${0.2 + (index * 0.1)}s` }}
                                    >
                                        <div className="notification-header">
                                            <h4 className="notification-title">
                                                <Link to="#" style={{ color: 'inherit', textDecoration: 'none' }}>{notification.title}</Link>
                                            </h4>
                                            <span className="notification-time">{notification.time}</span>
                                        </div>
                                        <div className="notification-content">
                                            {notification.content}
                                        </div>
                                        <div className="notification-actions">
                                            {notification.actions.map((action, idx) => (
                                                <Link key={idx} to={action.link} className="text-btn">
                                                    {action.label}
                                                </Link>
                                            ))}
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
