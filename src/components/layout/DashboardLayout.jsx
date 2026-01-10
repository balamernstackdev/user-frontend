import Header from './Header';
import Footer from './Footer';
import './DashboardLayout.css';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { authService } from '../../services/auth.service';
import bgImage from '../../assets/images/bg.png';

const DashboardLayout = ({ children }) => {
    const user = authService.getUser();
    const [notificationCount, setNotificationCount] = useState(0);

    const { socket } = useSocket();
    const location = useLocation();

    useEffect(() => {
        // Listen for custom event to refresh count
        const handleCountUpdate = () => {
            fetchNotificationCount();
        };
        window.addEventListener('notification_count_update', handleCountUpdate);

        if (user && user.id) {
            fetchNotificationCount();
        }

        return () => {
            window.removeEventListener('notification_count_update', handleCountUpdate);
        };
    }, [user?.id, location.pathname]);

    useEffect(() => {
        if (socket) {
            socket.on('new_notification', () => {
                setNotificationCount(prev => prev + 1);
            });

            return () => {
                socket.off('new_notification');
            };
        }
    }, [socket]);

    const fetchNotificationCount = async () => {
        try {
            const { notificationService } = await import('../../services/notification.service');
            const response = await notificationService.getUnreadCount();
            if (response.success) {
                setNotificationCount(response.data.count);
            }
        } catch (error) {
            console.error('Failed to fetch notification count:', error);
        }
    };

    return (
        <div className="dashboard-layout">
            <div className="dashboard-bg-watermark" style={{ backgroundImage: `url(${bgImage})` }}></div>
            <Header notificationCount={notificationCount} />
            <main className="main-content">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default DashboardLayout;
