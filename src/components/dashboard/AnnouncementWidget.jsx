import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import announcementService from '../../services/announcement.service';
import SkeletonLoader from './SkeletonLoader';

const AnnouncementWidget = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await announcementService.getActive();
            if (response.success) {
                setAnnouncements(response.data);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="content-card animate-fade-up">
                <SkeletonLoader type="text" count={3} />
            </div>
        );
    }

    if (announcements.length === 0) return null;

    return (
        <div className="content-card animate-fade-up mb-4 announcement-widget">
            <div className="d-flex align-items-center mb-4">
                <div className="icon-box" style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(255, 107, 0, 0.1)',
                    color: '#ff6b00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '15px'
                }}>
                    <i className="fas fa-bullhorn" style={{ fontSize: '18px' }}></i>
                </div>
                <div>
                    <h3 className="card-title mb-0" style={{ fontSize: '18px' }}>Announcements</h3>
                    <p className="text-muted mb-0" style={{ fontSize: '13px' }}>Latest updates from the team</p>
                </div>
            </div>

            <div className="announcement-list">
                {announcements.map((item) => (
                    <div key={item.id} className="announcement-item" style={{
                        padding: '20px',
                        borderRadius: '12px',
                        background: '#f8f9fa',
                        border: '1px solid #edf2f7',
                        marginBottom: '15px'
                    }}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: 'var(--tj-color-heading-primary)',
                                marginBottom: '0'
                            }}>{item.title}</h5>
                            <span style={{
                                fontSize: '12px',
                                color: '#666',
                                background: '#fff',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                border: '1px solid #eee'
                            }}>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        <p style={{
                            fontSize: '14px',
                            color: 'var(--tj-color-text-body)',
                            lineHeight: '1.6',
                            marginBottom: '0',
                            whiteSpace: 'pre-line'
                        }}>{item.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AnnouncementWidget;
