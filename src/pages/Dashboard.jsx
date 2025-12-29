import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import './Dashboard.css';

const Dashboard = () => {
    const [user, setUser] = useState({ name: 'User' });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Error parsing user data', e);
            }
        }
    }, []);

    const quickLinks = [
        { title: 'My Profile', icon: 'tji-user', link: '/profile' },
        { title: 'Services', icon: 'tji-service-1', link: '/services' },
        { title: 'Analytics', icon: 'tji-chart', link: '/analytics' },
        { title: 'Messages', icon: 'tji-envelop', link: '/messages' },
        { title: 'Calendar', icon: 'tji-calendar', link: '/calendar' },
        { title: 'Settings', icon: 'tji-window', link: '/settings' },
    ];

    return (
        <DashboardLayout>
            <section className="welcome-section">
                <div className="container">
                    <div className="welcome-content">
                        {/* Welcome Card */}
                        <div className="welcome-card animate-fade-up">
                            <div className="welcome-icon">
                                <i className="fa-light fa-circle-check"></i>
                            </div>
                            <div className="welcome-title">
                                <h1>Welcome Back, {user.name}!</h1>
                                <p>You have successfully logged in to your account. We're excited to have you here!</p>
                            </div>
                            <div className="welcome-actions">
                                <Link to="/" className="tj-primary-btn">
                                    <span className="btn-text"><span>Explore Home</span></span>
                                    <span className="btn-icon"><i className="tji-arrow-right-long"></i></span>
                                </Link>
                                <Link to="/dashboard" className="tj-primary-btn transparent-btn">
                                    <span className="btn-text"><span>View Dashboard</span></span>
                                    <span className="btn-icon"><i className="tji-arrow-right-long"></i></span>
                                </Link>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="quick-links animate-fade-up" style={{ animationDelay: '0.2s' }}>
                            <h3>Quick Links</h3>
                            <div className="quick-links-grid">
                                {quickLinks.map((item, index) => (
                                    <Link to={item.link} className="quick-link-item" key={index}>
                                        <div className="quick-link-icon">
                                            <i className={item.icon}></i>
                                        </div>
                                        <div className="quick-link-title">{item.title}</div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default Dashboard;
