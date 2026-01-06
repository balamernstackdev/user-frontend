import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react'; // Added useEffect
import { useSettings } from '../../context/SettingsContext';
import { WOW } from '../../vendor/wow.js'; // Import WOW from fixed vendor file
import './Footer.css';

// Import Images
import pattern2 from '../../html/assets/images/pattern-2.svg';
import pattern3 from '../../html/assets/images/pattern-3.svg';
import blurShape2 from '../../html/assets/images/h10-footer-shape-blur-2.svg';
import award1 from '../../html/assets/images/award-logo-white-1.webp';
import award2 from '../../html/assets/images/award-logo-white-2.webp';

// ... relevant imports ...

const Footer = () => {
    const { settings } = useSettings();
    const [email, setEmail] = useState('');
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    useEffect(() => {
        if (WOW) {
            const wow = new WOW({
                live: true,
                boxClass: 'wow',
                animateClass: 'animated',
                offset: 0,
                mobile: true
            });
            wow.init();

            // Sync after a short delay to ensure elements are ready
            setTimeout(() => {
                wow.sync();
            }, 500);
        }
    }, []);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email && agreeToTerms) {
            console.log('Subscribing:', email);
            setEmail('');
            setAgreeToTerms(false);
        }
    };

    const storedData = JSON.parse(localStorage.getItem('user') || '{}');
    // Handle both potential structures: nested user object or direct properties
    const userRole = storedData?.user?.role || storedData?.role;
    const role = userRole?.toLowerCase();

    const renderServicesLinks = () => {
        if (role === 'admin') {
            return (
                <ul>
                    <li><Link to="/admin/dashboard">Dashboard</Link></li>
                    <li><Link to="/admin/users">User Management</Link></li>
                    <li><Link to="/admin/commissions">Commissions</Link></li>
                    <li><Link to="/admin/settings">Settings</Link></li>
                </ul>
            );
        } else if (role === 'business_associate') {
            return (
                <ul>
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/referrals">My Referrals</Link></li>
                    <li><Link to="/business-associate/commissions">My Commissions</Link></li>
                </ul>
            );
        } else {
            // Default User
            return (
                <ul>
                    <li><Link to="/curated-analysis">Analysis</Link></li>
                    <li><Link to="/subscription">Plans</Link></li>
                    <li><Link to="/downloads">Downloads</Link></li>
                    <li><Link to="/payments">Transactions</Link></li>
                </ul>
            );
        }
    };

    const renderResourcesLinks = () => {
        if (role === 'admin') {
            return (
                <ul>
                    <li><Link to="/admin/tickets">Support Tickets</Link></li>
                    <li><Link to="/admin/logs">System Logs</Link></li>
                    <li><Link to="/admin/files">File Manager</Link></li>
                    <li><Link to="/admin/analysis">Analyses</Link></li>
                </ul>
            );
        } else {
            // User & Business Associate share similar resources
            return (
                <ul>
                    <li><Link to="/tickets">Support Tickets</Link></li>
                    <li><Link to="/faq">FAQs</Link></li>
                    <li><Link to="/how-to-use">How to Use</Link></li>
                    <li><Link to="/contact">Contact Us</Link></li>
                </ul>
            );
        }
    }

    return (
        <footer className="tj-footer-section footer-2 h5-footer h10-footer section-gap-x" style={{ position: 'relative' }}>
            <div className="footer-main-area">
                <div className="container">
                    <div className="row justify-content-between">
                        <div className="col-xl-5 col-lg-4 col-md-6">
                            <div className="footer-widget footer-col-1">
                                <h2 className="h10-footer-title text-anim wow fadeInUp" data-wow-delay=".3s">{settings.footer_heading || 'Building Better Business together'}
                                    <a className="text-btn wow fadeInUp" data-wow-delay=".3s" href={`mailto:${settings.contact_email}`}>
                                        <span className="btn-text"><span>{settings.contact_email}</span></span>
                                    </a>
                                </h2>
                                <div className="bg-shape-widget wow fadeInUpBig" data-wow-delay=".7s"></div>
                            </div>
                        </div>
                        <div className="col-xl-2 col-lg-3 col-md-6">
                            <div className="footer-widget footer-col-2 widget-nav-menu wow fadeInUp" data-wow-delay=".3s">
                                <h5 className="title">Services</h5>
                                {renderServicesLinks()}
                            </div>
                        </div>
                        <div className="col-xl-2 col-lg-2 col-md-6">
                            <div className="footer-widget footer-col-3 widget-nav-menu wow fadeInUp" data-wow-delay=".5s">
                                <h5 className="title">Resources</h5>
                                {renderResourcesLinks()}
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-3 col-md-6">
                            <div className="footer-widget widget-contact wow fadeInUp" data-wow-delay=".7s">
                                <h5 className="title">Our Office</h5>
                                <div className="footer-contact-info">
                                    <div className="contact-item">
                                        <span><i className="fas fa-map-marker-alt"></i> {settings.office_address}</span>
                                    </div>
                                    <div className="contact-item">
                                        <a href={`tel:${(settings.contact_phone || '').replace(/\D/g, '')}`}><i className="fas fa-phone"></i> {settings.contact_phone}</a>
                                        <a href={`mailto:${settings.support_email}`}><i className="fas fa-envelope"></i> {settings.support_email}</a>
                                    </div>
                                    <div className="contact-item">
                                        <span><i className="far fa-clock"></i> {settings.office_hours}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subscription Section Removed to match reference */}
            {/* 
            <div className="h10-footer-subscribe-wrapper wow fadeInUp" data-wow-delay=".5s">
               ...
            </div> 
            */}

            <div className="tj-copyright-area-2 h5-footer-copyright">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="copyright-content-area">
                                <div className="copyright-text">
                                    <p>© {new Date().getFullYear()} {settings.site_name || 'Stoxzo'} All right reserved</p>
                                </div>
                                <div className="social-links style-3">
                                    <ul>
                                        <li><a href={settings.facebook_url || "https://www.facebook.com/"} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-facebook-f"></i></a></li>
                                        <li><a href={settings.instagram_url || "https://www.instagram.com/"} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-instagram"></i></a></li>
                                        <li><a href={settings.twitter_url || "https://x.com/"} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-x-twitter"></i></a></li>
                                        <li><a href={settings.linkedin_url || "https://www.linkedin.com/"} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-linkedin-in"></i></a></li>
                                    </ul>
                                </div>
                                <div className="copyright-menu">
                                    <ul>
                                        <li><Link to={settings.privacy_policy_url || "/privacy"}>Privacy Policy</Link></li>
                                        <li><Link to={settings.terms_conditions_url || "/terms"}>Terms & Condition</Link></li>
                                        {settings.refund_policy_url && <li><Link to={settings.refund_policy_url}>Refund Policy</Link></li>}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-shape-1">
                <img src={pattern2} alt="" />
            </div>
            <div className="bg-shape-2">
                <img src={pattern3} alt="" />
            </div>
            <div className="bg-shape-4 wow fadeInUpBig" data-wow-delay=".8s">
                <img src={blurShape2} alt="" />
            </div>
        </footer>
    );
};

export default Footer;
