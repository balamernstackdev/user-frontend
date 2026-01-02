import Header from './Header';
import Footer from './Footer';
import './DashboardLayout.css';
import { useState, useEffect } from 'react';
import bgImage from '../../assets/images/bg.png';

const DashboardLayout = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        if (user && user.id) {
            fetchNotificationCount();
        }
    }, [user.id]);

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
