
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import tutorialService from '../services/tutorial.service';
import SEO from '../components/common/SEO';
import { Video, HelpCircle, BookOpen, ChevronDown } from 'lucide-react';
import './styles/AdminListings.css';
// We will rely on inline styles or basic admin styles for now to ensure cleaner implementation, 
// as importing multiple conflicting CSS files might cause issues.
// But we will re-implement the specific card/accordion styles needed.

const Tutorials = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') === 'faq' ? 'faq' : 'how_to_use';

    // Convert 'how_to_use' -> 'HowToUse' for API, 'faq' -> 'FAQ'
    const getCategoryFromTab = (tab) => tab === 'faq' ? 'FAQ' : 'HowToUse';

    const [activeTab, setActiveTab] = useState(initialTab);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeAccordion, setActiveAccordion] = useState(null);

    useEffect(() => {
        // Update URL when tab changes without reloading
        const newParams = new URLSearchParams(searchParams);
        newParams.set('tab', activeTab);
        setSearchParams(newParams);

        fetchContent(activeTab);
    }, [activeTab, searchParams, setSearchParams]); // Added searchParams and setSearchParams to dependencies

    const fetchContent = async (tab) => {
        try {
            setLoading(true);
            const category = getCategoryFromTab(tab);
            const response = await tutorialService.getTutorialsByCategory(category);
            const data = Array.isArray(response) ? response : (response.data || []);
            setItems(data);
        } catch (error) {
            console.error('Failed to fetch tutorials:', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleAccordion = (index) => {
        setActiveAccordion(activeAccordion === index ? null : index);
    };

    return (
        <DashboardLayout>
            <SEO title="Help Center" description="Tutorials and Frequently Asked Questions." />

            <div className="admin-listing-page animate-fade-up">
                <div className="admin-container">

                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Help Center</h1>
                            <p className="text-muted mb-0">Learn how to use the platform and find answers to common questions</p>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="admin-listing-toolbar mb-4">
                        <div className="d-flex align-items-center gap-2">
                            <button
                                className={`tj-btn ${activeTab === 'how_to_use' ? 'tj-btn-primary' : 'tj-btn-secondary'}`}
                                onClick={() => setActiveTab('how_to_use')}
                            >
                                <Video size={16} />
                                How to Use
                            </button>
                            <button
                                className={`tj-btn ${activeTab === 'faq' ? 'tj-btn-primary' : 'tj-btn-secondary'}`}
                                onClick={() => setActiveTab('faq')}
                            >
                                <HelpCircle size={16} />
                                FAQ
                            </button>
                        </div>
                    </div>

                    <div className="content-area">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-5">
                                <div className="mb-3 bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                                    <BookOpen size={32} className="text-muted opacity-50" />
                                </div>
                                <h5 className="text-dark fw-bold mb-1">No content found</h5>
                                <p className="text-muted">Check back later for updates in this section.</p>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'how_to_use' && (
                                    <div className="row justify-content-center">
                                        <div className="col-lg-10">
                                            {items.map((guide, index) => (
                                                <div key={guide.id || index} className="card border-0 shadow-sm mb-4 position-relative overflow-hidden">
                                                    <div className="card-body p-4 pt-5">
                                                        {/* Step Number Badge */}
                                                        <div className="position-absolute top-0 start-0 m-4 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm z-index-1"
                                                            style={{ width: '40px', height: '40px', fontWeight: 'bold', fontSize: '18px', zIndex: 1 }}>
                                                            {guide.order_index || index + 1}
                                                        </div>

                                                        {/* Content Wrapper with padding to clear badge */}
                                                        <div style={{ paddingLeft: '60px' }}>
                                                            <h3 className="fw-bold text-dark mb-3">{guide.title}</h3>

                                                            <div className="text-muted mb-4 tutorial-content"
                                                                dangerouslySetInnerHTML={{ __html: guide.content }} />

                                                            {guide.video_url && (
                                                                <div className="ratio ratio-16x9 rounded overflow-hidden bg-dark shadow-sm">
                                                                    {(guide.video_url.match(/\.(mp4|webm|ogg|mov|avi)$/i) || guide.video_url.includes('cloudinary')) ? (
                                                                        <video controls poster={guide.thumbnail_url}>
                                                                            <source src={guide.video_url.includes('cloudinary') ? guide.video_url.replace(/\.[^/.]+$/, ".mp4") : guide.video_url} />
                                                                            Your browser does not support the video tag.
                                                                        </video>
                                                                    ) : (
                                                                        <iframe
                                                                            src={guide.video_url}
                                                                            title={guide.title}
                                                                            allowFullScreen
                                                                        ></iframe>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {!guide.video_url && guide.thumbnail_url && (
                                                                <img
                                                                    src={guide.thumbnail_url}
                                                                    alt={guide.title}
                                                                    className="img-fluid rounded shadow-sm mt-3"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Styles for HTML Content */}
                                            <style>{`
                                                .tutorial-content ul {
                                                    padding-left: 20px;
                                                    margin-bottom: 1rem;
                                                    list-style-type: disc;
                                                }
                                                .tutorial-content li {
                                                    margin-bottom: 0.5rem;
                                                }
                                                .tutorial-content p {
                                                    margin-bottom: 1rem;
                                                }
                                            `}</style>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'faq' && (
                                    <div className="row justify-content-center">
                                        <div className="col-12">
                                            <div className="listing-table-container">
                                                <div className="accordion" id="faqAccordion">
                                                    {items.map((faq, index) => (
                                                        <div key={faq.id || index} className={`border-bottom ${index === items.length - 1 ? 'border-0' : ''}`}>
                                                            <div
                                                                className={`p-4 d-flex align-items-center justify-content-between cursor-pointer ${activeAccordion === index ? 'text-primary bg-light' : 'text-dark hover-bg-light'}`}
                                                                onClick={() => toggleAccordion(index)}
                                                                style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                                                            >
                                                                <h5 className="mb-0 fw-bold fs-6">{faq.title}</h5>
                                                                <ChevronDown
                                                                    size={20}
                                                                    className={`transition-transform duration-300 ${activeAccordion === index ? 'rotate-180 text-primary' : 'text-muted'}`}
                                                                    style={{ transform: activeAccordion === index ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
                                                                />
                                                            </div>
                                                            <div className={`collapse ${activeAccordion === index ? 'show' : ''}`}>
                                                                <div className="px-4 pb-4 pt-0 text-muted">
                                                                    <div className="pt-2">
                                                                        {faq.content}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default Tutorials;
