import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import tutorialService from '../services/tutorial.service';
import './styles/HowToUse.css';

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

                                        {guide.video_url ? (
                                            <div className="video-container">
                                                {(guide.video_url.match(/\.(mp4|webm|ogg|mov|avi)$/i) || guide.video_url.includes('cloudinary')) ? (
                                                    <video controls poster={guide.thumbnail_url}>
                                                        {/* Force mp4 extension for Cloudinary to ensure auto-transcoding of AVI/MOV files */}
                                                        <source src={guide.video_url.includes('cloudinary') ? guide.video_url.replace(/\.[^/.]+$/, ".mp4") : guide.video_url} />
                                                        Your browser does not support the video tag.
                                                    </video>
                                                ) : (
                                                    <div className="video-placeholder">
                                                        {/* If it's an external link (youtube) and we have a thumbnail, maybe show it? 
                                                            Standard YouTube embeds handle their own thumbnails usually, but here we just have a link button.
                                                            Let's show the thumbnail if available behind the button or above it? 
                                                            For now, let's keep it simple or maybe render an img above the button.
                                                        */}
                                                        {guide.thumbnail_url && (
                                                            <img
                                                                src={guide.thumbnail_url}
                                                                alt={guide.title}
                                                                style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', marginBottom: '1rem' }}
                                                            />
                                                        )}
                                                        <div className={guide.thumbnail_url ? "mt-2" : ""}>
                                                            <i className="fas fa-video mb-2"></i>
                                                            <p>Watch: {guide.title}</p>
                                                            <a href={guide.video_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">Watch on External Site</a>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : guide.thumbnail_url ? (
                                            <div className="image-container mt-3">
                                                <img
                                                    src={guide.thumbnail_url}
                                                    alt={guide.title}
                                                    className="img-fluid rounded"
                                                    style={{ maxHeight: '400px', width: 'auto' }}
                                                />
                                            </div>
                                        ) : null}
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
