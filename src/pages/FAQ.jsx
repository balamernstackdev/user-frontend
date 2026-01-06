import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import tutorialService from '../services/tutorial.service';
import './FAQ.css';

const FAQ = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        try {
            setLoading(true);
            // Fetch tutorials with category 'FAQ'
            // We might need to ensure the service and backend support this exact string
            const response = await tutorialService.getTutorialsByCategory('FAQ');
            if (response.success) {
                // Map the tutorial data to the expected format if necessary
                // Tutorial: { title (Question), content (Answer), ... }
                setFaqs(response.data.map(t => ({
                    question: t.title,
                    answer: t.content,
                    id: t.id
                })));
            }
        } catch (error) {
            console.error('Failed to fetch FAQs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredFAQs = faqs.filter(item =>
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleAccordion = (index) => {
        if (activeIndex === index) {
            setActiveIndex(null);
        } else {
            setActiveIndex(index);
        }
    };

    return (
        <DashboardLayout>
            <section className="page-section">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="page-header text-center mb-5 animate-fade-up">
                                <h2>Frequently Asked Questions</h2>
                                <p style={{ color: 'var(--tj-color-text-body-3)' }}>Find answers to common questions</p>
                            </div>

                            <div className="search-box animate-fade-up mb-5" style={{ animationDelay: '0.1s' }}>
                                <i className="fas fa-search"></i>
                                <input
                                    type="text"
                                    placeholder="Search for questions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : filteredFAQs.length > 0 ? (
                                <div className="faq-list">
                                    {filteredFAQs.map((item, index) => (
                                        <div
                                            key={item.id || index}
                                            className={`faq-item animate-fade-up ${activeIndex === index ? 'active' : ''}`}
                                            style={{ animationDelay: `${0.2 + (index * 0.05)}s` }}
                                        >
                                            <div
                                                className="faq-question"
                                                onClick={() => toggleAccordion(index)}
                                            >
                                                <span>{item.question}</span>
                                                <i className="fas fa-chevron-down"></i>
                                            </div>
                                            <div className="faq-answer">
                                                {item.answer}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-results animate-fade-up text-center">
                                    <i className="fas fa-question-circle"></i>
                                    <h3>No questions found</h3>
                                    <p>Try searching for something else or contact support.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default FAQ;
