import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import tutorialService from '../services/tutorial.service';
import './HowToUse.css';

const HowToUse = () => {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGuides();
    }, []);

    const fetchGuides = async () => {
        try {
            setLoading(true);
            const response = await tutorialService.getTutorialsByCategory('HowToUse');
            const data = Array.isArray(response) ? response : (response.data || []);
            setGuides(data);
        } catch (error) {
            console.error('Failed to fetch guides:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <section className="page-section">
                <div className="container">
                    <div className="page-header">
                        <h2>How to Use Stoxzo</h2>
                        <p style={{ color: '#6c757d' }}>Step-by-step guide to get started</p>
                    </div>

                    <div className="row">
                        <div className="col-lg-10 mx-auto">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : guides.length > 0 ? (
                                guides.map((guide, index) => (
                                    <div
                                        key={guide.id || index}
                                        className="step-card animate-fade-up"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="step-number">{guide.order_index || index + 1}</div>
                                        <h3 className="step-title">{guide.title}</h3>
                                        <div
                                            className="step-content"
                                            dangerouslySetInnerHTML={{ __html: guide.content }}
                                        />

                                        {guide.video_url && (
                                            <div className="video-container">
                                                <div className="video-placeholder">
                                                    <i className="fa-light fa-video"></i>
                                                    <p>Video: {guide.title}</p>
                                                    <a href={guide.video_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary mt-2">Watch Video</a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-5">
                                    <p>No guides available at the moment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default HowToUse;
