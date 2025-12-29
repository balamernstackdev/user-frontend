import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import TutorialService from '../services/tutorial.service';
import './Tutorials.css';

const Tutorials = () => {
    const { id } = useParams();
    const [tutorials, setTutorials] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedTutorial, setSelectedTutorial] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCategories();
        if (id) {
            fetchSingleTutorial(id);
        } else {
            fetchTutorials();
        }
    }, [id, selectedCategory]);

    const fetchCategories = async () => {
        try {
            const response = await TutorialService.getCategories();
            setCategories(response.data);
        } catch (err) {
            console.error('Failed to load categories', err);
        }
    };

    const fetchTutorials = async () => {
        try {
            setLoading(true);
            const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
            const response = await TutorialService.getTutorials(params);
            setTutorials(response.data);
        } catch (err) {
            setError('Failed to load tutorials');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSingleTutorial = async (tutorialId) => {
        try {
            setLoading(true);
            const response = await TutorialService.getTutorial(tutorialId);
            setSelectedTutorial(response.data);
        } catch (err) {
            setError('Failed to load tutorial');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTutorialClick = (tutorial) => {
        setSelectedTutorial(tutorial);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBackToList = () => {
        setSelectedTutorial(null);
        window.history.pushState({}, '', '/tutorials');
    };

    return (
        <DashboardLayout>
            <section className="page-section">
                <div className="container">
                    {loading ? (
                        <div className="text-center p-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : selectedTutorial ? (
                        // Single Tutorial View
                        <div className="tutorial-viewer animate-fade-up">
                            <button className="back-btn" onClick={handleBackToList}>
                                <i className="tji-arrow-left"></i> Back to Tutorials
                            </button>

                            <div className="tutorial-content">
                                <div className="tutorial-header">
                                    <span className="category-badge">{selectedTutorial.category}</span>
                                    <h1>{selectedTutorial.title}</h1>
                                    <p className="tutorial-description">{selectedTutorial.description}</p>
                                </div>

                                <div className="tutorial-body" dangerouslySetInnerHTML={{ __html: selectedTutorial.content }} />

                                {selectedTutorial.video_url && (
                                    <div className="tutorial-media">
                                        <h3>Video Tutorial</h3>
                                        <div className="video-container">
                                            <iframe
                                                src={selectedTutorial.video_url}
                                                title={selectedTutorial.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Tutorials List View
                        <div className="animate-fade-up">
                            <div className="page-header">
                                <h2>Tutorials & Guides</h2>
                                <p style={{ color: '#6c757d' }}>Learn how to make the most of our platform</p>
                            </div>

                            <div className="category-filter">
                                <button
                                    className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory('all')}
                                >
                                    All
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.category}
                                        className={`filter-btn ${selectedCategory === cat.category ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat.category)}
                                    >
                                        {cat.category} ({cat.count})
                                    </button>
                                ))}
                            </div>

                            {error && <div className="alert alert-error">{error}</div>}

                            <div className="tutorials-grid">
                                {tutorials.length > 0 ? (
                                    tutorials.map((tutorial) => (
                                        <div
                                            key={tutorial.id}
                                            className="tutorial-card"
                                            onClick={() => handleTutorialClick(tutorial)}
                                        >
                                            <div className="tutorial-thumbnail">
                                                {tutorial.thumbnail_url ? (
                                                    <img src={tutorial.thumbnail_url} alt={tutorial.title} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                                                        <i className="fa-light fa-image" style={{ fontSize: '48px' }}></i>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="tutorial-card-content">
                                                <span className="category-tag">{tutorial.category}</span>
                                                <h3>{tutorial.title}</h3>
                                                <p>{tutorial.description}</p>
                                                <button className="btn-link">Read More <i className="tji-arrow-right"></i></button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-tutorials">
                                        <div className="icon"><i className="fa-light fa-book-open"></i></div>
                                        <h3>No tutorials found</h3>
                                        <p>Check back later for new content!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </DashboardLayout>
    );
};

export default Tutorials;
