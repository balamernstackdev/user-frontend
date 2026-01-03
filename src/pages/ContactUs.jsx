import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import SEO from '../components/common/SEO';
import './ContactUs.css';

const ContactUs = () => {
    const { settings } = useSettings();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus({ type: '', message: '' });

        // Simulate API call
        setTimeout(() => {
            console.log('Form Submitted:', formData);
            setStatus({ type: 'success', message: 'Thank you for contacting us! We will get back to you shortly.' });
            setFormData({ name: '', email: '', subject: '', message: '' });
            setSubmitting(false);
        }, 1500);
    };

    return (
        <DashboardLayout>
            <SEO title="Contact Us" description={`Have questions? Get in touch with the ${settings.site_name || 'Stoxzo'} support team.`} />

            <section className="contact-hero-section">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8 text-center">
                            <div className="contact-hero-content animate-fade-up">
                                <span className="sub-title">Get In Touch</span>
                                <h1 className="hero-title">We're Here to Help</h1>
                                <p className="hero-text">
                                    Have questions about our services or need assistance? Reach out to us and we'll be happy to help you navigate your financial journey.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="contact-form-section">
                <div className="container">
                    <div className="row">
                        {/* Contact Form */}
                        <div className="col-lg-7 mb-5 mb-lg-0">
                            <div className="contact-form-wrapper animate-fade-up">
                                <h3>Send us a Message</h3>
                                {status.message && (
                                    <div className={`alert alert-${status.type === 'success' ? 'success' : 'danger'}`}>
                                        {status.message}
                                    </div>
                                )}
                                <form onSubmit={handleSubmit} className="contact-form">
                                    <div className="form-group">
                                        <label htmlFor="name">Full Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            className="form-control"
                                            placeholder="Your Name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Email Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            className="form-control"
                                            placeholder="name@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="subject">Subject</label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            className="form-control"
                                            placeholder="How can we help?"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="message">Message</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            className="form-control"
                                            placeholder="Tell us more..."
                                            rows="5"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="tj-primary-btn" disabled={submitting}>
                                        <span className="btn-text">
                                            <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                                        </span>
                                        <span className="btn-icon"><i className="fas fa-paper-plane"></i></span>
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="col-lg-5">
                            <div className="contact-info-wrapper animate-fade-up" style={{ animationDelay: '0.2s' }}>
                                <div className="info-card">
                                    <h3>Contact Information</h3>
                                    <p>Find us at the office or connect with us through our channels.</p>

                                    <div className="info-item">
                                        <div className="icon">
                                            <i className="fas fa-map-marker-alt"></i>
                                        </div>
                                        <div className="details">
                                            <h4>Our Location</h4>
                                            <p>{settings.office_address || '993 Renner Burg, West Rond, MT 94251-030, USA'}</p>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <div className="icon">
                                            <i className="fas fa-phone-alt"></i>
                                        </div>
                                        <div className="details">
                                            <h4>Phone Number</h4>
                                            <p><a href={`tel:${(settings.contact_phone || '+1 (009) 544-7818').replace(/\D/g, '')}`}>{settings.contact_phone || '+1 (009) 544-7818'}</a></p>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <div className="icon">
                                            <i className="fas fa-envelope"></i>
                                        </div>
                                        <div className="details">
                                            <h4>Email Address</h4>
                                            <p><a href={`mailto:${settings.support_email || 'support@stoxzo.com'}`}>{settings.support_email || 'support@stoxzo.com'}</a></p>
                                        </div>
                                    </div>

                                    <div className="social-connect">
                                        <h4>Follow Us</h4>
                                        <div className="social-links">
                                            <a href={settings.facebook_url || "#"} className="social-btn"><i className="fa-brands fa-facebook-f"></i></a>
                                            <a href={settings.twitter_url || "#"} className="social-btn"><i className="fa-brands fa-x-twitter"></i></a>
                                            <a href={settings.instagram_url || "#"} className="social-btn"><i className="fa-brands fa-instagram"></i></a>
                                            <a href={settings.linkedin_url || "#"} className="social-btn"><i className="fa-brands fa-linkedin-in"></i></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default ContactUs;
