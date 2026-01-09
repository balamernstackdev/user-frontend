import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import AnalysisService from '../services/analysis.service';
import SubscriptionService from '../services/subscription.service';
import SEO from '../components/common/SEO';
import './styles/CuratedAnalysis.css';
import { toast } from 'react-toastify';
import { authService } from '../services/auth.service';

const CuratedAnalysis = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [analyses, setAnalyses] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [categories, setCategories] = useState(['all']);
    const [hasAccess, setHasAccess] = useState(false);
    const user = authService.getUser();
    const userRole = (user?.role || '').toLowerCase().trim();
    const isStaff = userRole === 'admin' || userRole === 'support_agent' || userRole === 'business_associate' || userRole === 'finance_manager';

    useEffect(() => {
        if (id) {
            fetchAnalysisDetail();
        } else {
            fetchAnalyses();
            fetchCategories();
        }
        checkSubscription();
    }, [id, filter]);

    const fetchCategories = async () => {
        try {
            const response = await AnalysisService.getCategories();
            if (response.status === 'success') {
                const dynamicCats = response.data.map(c => c.category);
                setCategories(['all', ...dynamicCats]);
            }
        } catch (err) {
            console.error('Failed to fetch categories', err);
        }
    };

    const checkSubscription = async () => {
        if (isStaff) {
            setHasAccess(true);
            return;
        }

        try {
            const response = await SubscriptionService.getActiveSubscription();
            if (response.data && response.data.status === 'active') {
                setHasAccess(true);
            }
        } catch (err) {
            console.error('Subscription check failed', err);
            // Non-blocking, default to false
        }
    };

    const fetchAnalyses = async () => {
        try {
            setLoading(true);
            const response = await AnalysisService.getAnalyses(filter !== 'all' ? { category: filter } : {});
            setAnalyses(response.data);
        } catch (err) {
            toast.error('Failed to load market analyses');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalysisDetail = async () => {
        try {
            setLoading(true);
            const response = await AnalysisService.getAnalysis(id);
            setAnalysis(response.data);
        } catch (err) {
            if (err.response && err.response.status === 403) {
                // Access denied handled in render
                setAnalysis({ is_premium: true, restricted: true });
            } else {
                toast.error('Failed to load analysis details');
                navigate('/curated-analysis');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Render Loading State
    if (loading) {
        return (
            <DashboardLayout>
                <div className="text-center p-5" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Render Detail View
    if (id && analysis) {
        if (analysis.restricted || (analysis.is_premium && !hasAccess)) {
            return (
                <DashboardLayout>
                    <SEO title={analysis.title || 'Premium Content'} description="Exclusive market analysis for subscribers." />
                    <section className="page-section">
                        <div className="container">
                            <button className="back-btn" onClick={() => navigate('/curated-analysis')}>
                                <i className="fas fa-arrow-left"></i> Back to Analysis
                            </button>

                            <div className="premium-locked-overlay animate-fade-up">
                                <i className="fas fa-lock"></i>
                                <h2>Premium Content Locked</h2>
                                <p className="mb-4">This analysis is exclusive to our premium subscribers. Upgrade your plan to access professional market insights.</p>
                                <Link to="/plans" className="tj-primary-btn">
                                    <span className="btn-text"><span>Upgrade Now</span></span>
                                    <span className="btn-icon"><i className="fas fa-crown"></i></span>
                                </Link>
                            </div>
                        </div>
                    </section>
                </DashboardLayout>
            );
        }

        return (
            <DashboardLayout>
                <SEO title={analysis.title} description={analysis.description} />
                <div className="analysis-detail-page">
                    <div className="container">
                        <button className="back-btn" onClick={() => navigate('/curated-analysis')}>
                            <i className="fas fa-arrow-left"></i> Back to Analysis
                        </button>

                        <article className="analysis-viewer animate-fade-up">
                            {analysis.image_url && (
                                <div className="analysis-hero">
                                    <img src={analysis.image_url} alt={analysis.title} />
                                </div>
                            )}

                            <div className="analysis-header mb-4">
                                <div className="d-flex align-items-center gap-3 mb-2">
                                    <span className="badge bg-light text-primary">{analysis.category || 'Market Update'}</span>
                                    <span className="analysis-date"><i className="far fa-calendar-alt"></i> {formatDate(analysis.created_at)}</span>
                                </div>
                                <h1 className="mb-3" style={{ fontSize: '2rem', fontWeight: '700', color: '#000000' }}>{analysis.title}</h1>
                            </div>

                            <div className="analysis-content" dangerouslySetInnerHTML={{ __html: analysis.content }}></div>

                            {analysis.pdf_url && (
                                <div className="analysis-action-bar">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="pdf-icon text-danger" style={{ fontSize: '2rem' }}><i className="fas fa-file-pdf"></i></div>
                                        <div>
                                            <h5 className="m-0">Download Full Report</h5>
                                            <small className="text-muted">PDF Format</small>
                                        </div>
                                    </div>
                                    <a href={analysis.pdf_url} target="_blank" rel="noopener noreferrer" className="tj-secondary-btn py-2 ms-auto">
                                        <span className="btn-text"><span>Download PDF</span></span>
                                        <span className="btn-icon"><i className="fas fa-download"></i></span>
                                    </a>
                                </div>
                            )}
                        </article>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Render List View
    return (
        <DashboardLayout>
            <SEO title="Market Analysis" description="Expert curated market analysis and insights." />
            <section className="page-section">
                <div className="container">
                    <div className="page-header text-center mb-5">
                        <h2 className="tj-section-title">Curated Market Analysis</h2>
                        <p className="text-muted">Expert insights to guide your trading decisions</p>
                    </div>

                    <div className="category-filter">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`filter-btn ${filter === cat ? 'active' : ''}`}
                                onClick={() => setFilter(cat)}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="row">
                        {analyses.length > 0 ? (
                            analyses.map((item) => (
                                <div key={item.id} className="col-lg-4 col-md-6 mb-4">
                                    <Link to={`/curated-analysis/${item.id}`} style={{ textDecoration: 'none', height: '100%', display: 'block' }}>
                                        <div className="analysis-card">
                                            <div className="analysis-image">
                                                <img src={item.image_url || '/assets/images/placeholder-analysis.jpg'} alt={item.title} />
                                                {item.is_premium && (
                                                    <div className="premium-badge"><i className="fas fa-crown"></i> Premium</div>
                                                )}
                                                <div className="category-badge">{item.category}</div>
                                            </div>
                                            <div className="analysis-details">
                                                <h3>{item.title}</h3>
                                                <p>{item.description}</p>
                                                <div className="analysis-footer">
                                                    <span className="analysis-date"><i className="far fa-calendar"></i> {formatDate(item.created_at)}</span>
                                                    <span className="read-more text-primary fw-bold">Read More <i className="fas fa-arrow-right ms-1"></i></span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center py-5">
                                <i className="far fa-chart-bar mb-3 text-muted" style={{ fontSize: '3rem' }}></i>
                                <h3>No Analysis Found</h3>
                                <p className="text-muted">Check back later for new market updates.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default CuratedAnalysis;
