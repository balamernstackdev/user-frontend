import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import TutorialService from '../services/tutorial.service';
import './Tutorials.css';
import { toast } from 'react-toastify';

const Tutorials = () => {
    const { id } = useParams();
    const [tutorials, setTutorials] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedTutorial, setSelectedTutorial] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);

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
            // Filter out empty or invalid categories
            const validCategories = response.data.filter(cat =>
                cat.category &&
                cat.category.trim() !== '' &&
                cat.category !== '{}' &&
                cat.category !== 'null'
            );
            setCategories(validCategories);
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
            toast.error('Failed to load tutorials');
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
            toast.error('Failed to load tutorial');
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
                                <i className="fas fa-arrow-left"></i> Back to Tutorials
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
                                        {cat.category.replace(/([A-Z])/g, ' $1').trim()} ({cat.count})
                                    </button>
                                ))}
                            </div>

                            <div className="tutorials-grid">
                                {tutorials.length > 0 ? (
                                    tutorials.map((tutorial) => (
                                        <div
                                            key={tutorial.id}
                                            className="tutorial-card"
                                            onClick={() => handleTutorialClick(tutorial)}
                                        >
                                            <div className={`tutorial-thumbnail ${!tutorial.thumbnail_url ? 'placeholder' : ''}`}>
                                                {tutorial.thumbnail_url ? (
                                                    <img src={tutorial.thumbnail_url} alt={tutorial.title} />
                                                ) : (
                                                    <i className={tutorial.category === 'FAQ' ? "fas fa-question-circle" : "fas fa-photo-video"}></i>
                                                )}
                                            </div>
                                            <div className="tutorial-card-content">
                                                <span className="category-tag">{tutorial.category}</span>
                                                <h3>{tutorial.title}</h3>
                                                <p>{tutorial.description}</p>
                                                <button className="btn-link">Read More <i className="fas fa-arrow-right"></i></button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-tutorials">
                                        <div className="icon"><i className="fas fa-book-open"></i></div>
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
