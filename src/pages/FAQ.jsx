import { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import './FAQ.css';

const FAQ = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeIndex, setActiveIndex] = useState(0); // First item active by default

    const faqData = [
        {
            question: "How do I update my subscription plan?",
            answer: "You can update your subscription plan at any time by visiting the 'My Subscription' page. Click on 'Change Plan' and select your preferred plan. The changes will take effect immediately, and we'll prorate any charges."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and payments through Razorpay. You can manage your payment methods in the 'My Payments' section."
        },
        {
            question: "How can I cancel my subscription?",
            answer: "To cancel your subscription, go to 'My Subscription' page and click on 'Cancel Subscription'. You'll continue to have access until the end of your current billing period. No refunds are provided for partial months."
        },
        {
            question: "How do I download my purchased items?",
            answer: "All your purchased items are available in the 'My Downloads' section. Simply click on the download button next to any item to download it. Downloads are available for the duration of your active subscription."
        },
        {
            question: "What should I do if a payment fails?",
            answer: "If a payment fails, you'll receive a notification. Go to 'My Payments' to update your payment method. You can retry the payment or add a new payment method. Your subscription will remain active for a grace period."
        },
        {
            question: "How do I contact support?",
            answer: "You can contact our support team by creating a ticket in the 'My Tickets' section, or by emailing us at support@stoxzo.com. Our support team is available Monday through Friday, 10am to 10pm."
        },
        {
            question: "Can I get a refund?",
            answer: "Refund policies vary based on your subscription plan and the specific service. Generally, refunds are available within 30 days of purchase if you haven't used the service extensively. Please contact support for specific refund requests."
        },
        {
            question: "How secure is my payment information?",
            answer: "We use industry-standard encryption and secure payment processors (Razorpay) to protect your payment information. We never store your full credit card details on our servers. All transactions are processed through PCI-DSS compliant payment gateways."
        }
    ];

    const filteredFAQs = faqData.filter(item =>
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
                    <div className="page-header animate-fade-up">
                        <h2>Frequently Asked Questions</h2>
                        <p style={{ color: '#6c757d' }}>Find answers to common questions</p>
                    </div>

                    <div className="search-box animate-fade-up" style={{ animationDelay: '0.1s' }}>
                        <i className="fa-light fa-search"></i>
                        <input
                            type="text"
                            placeholder="Search for questions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="row">
                        <div className="col-lg-10 mx-auto">
                            {filteredFAQs.length > 0 ? (
                                filteredFAQs.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`faq-item animate-fade-up ${activeIndex === index ? 'active' : ''}`}
                                        style={{ animationDelay: `${0.2 + (index * 0.05)}s` }}
                                    >
                                        <div
                                            className="faq-question"
                                            onClick={() => toggleAccordion(index)}
                                        >
                                            <span>{item.question}</span>
                                            <i className="fa-light fa-chevron-down"></i>
                                        </div>
                                        <div className="faq-answer">
                                            {item.answer}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-results animate-fade-up">
                                    <i className="fa-light fa-question-circle"></i>
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
