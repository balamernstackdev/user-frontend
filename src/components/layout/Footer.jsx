import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react'; // Added useEffect
import { WOW } from '../../vendor/wow.js'; // Import WOW from fixed vendor file
import './Footer.css';

// Import Images
import pattern2 from '../../html/assets/images/pattern-2.svg';
import pattern3 from '../../html/assets/images/pattern-3.svg';
import blurShape2 from '../../html/assets/images/h10-footer-shape-blur-2.svg';
import award1 from '../../html/assets/images/award-logo-white-1.webp';
import award2 from '../../html/assets/images/award-logo-white-2.webp';

const Footer = () => {
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

    return (
        <footer className="tj-footer-section footer-2 h5-footer h10-footer section-gap-x" style={{ position: 'relative' }}>
            <div className="footer-main-area">
                <div className="container">
                    <div className="row justify-content-between">
                        <div className="col-xl-5 col-lg-4 col-md-6">
                            <div className="footer-widget footer-col-1">
                                <h2 className="h10-footer-title text-anim wow fadeInUp" data-wow-delay=".3s">Building Better Business from Together?
                                    <a className="text-btn wow fadeInUp" data-wow-delay=".3s" href="mailto:hello@stoxzo.com">
                                        <span className="btn-text"><span>hello@stoxzo.com</span></span>
                                    </a>
                                </h2>
                                <div className="bg-shape-widget wow fadeInUpBig" data-wow-delay=".7s"></div>
                            </div>
                        </div>
                        <div className="col-xl-2 col-lg-3 col-md-6">
                            <div className="footer-widget footer-col-2 widget-nav-menu wow fadeInUp" data-wow-delay=".3s">
                                <h5 className="title">Services</h5>
                                <ul>
                                    <li><Link to="/curated-analysis">Analysis</Link></li>
                                    <li><Link to="/subscription">Plans</Link></li>
                                    <li><Link to="/downloads">Downloads</Link></li>
                                    <li><Link to="/payments">Transactions</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-xl-2 col-lg-2 col-md-6">
                            <div className="footer-widget footer-col-3 widget-nav-menu wow fadeInUp" data-wow-delay=".5s">
                                <h5 className="title">Resources</h5>
                                <ul>
                                    <li><Link to="/tickets">Support Tickets</Link></li>
                                    <li><Link to="/faq">FAQs</Link></li>
                                    <li><Link to="/how-to-use">How to Use</Link></li>
                                    <li><Link to="/contact">Contact Us</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-3 col-md-6">
                            <div className="footer-widget widget-contact wow fadeInUp" data-wow-delay=".7s">
                                <h5 className="title">Our Office</h5>
                                <div className="footer-contact-info">
                                    <div className="contact-item">
                                        <span>993 Renner Burg, West Rond, MT 94251-030, USA.</span>
                                    </div>
                                    <div className="contact-item">
                                        <a href="tel:10095447818">P: +1 (009) 544-7818</a>
                                        <a href="mailto:support@stoxzo.com">M: support@stoxzo.com</a>
                                    </div>
                                    <div className="contact-item">
                                        <span><i className="far fa-clock"></i> Mon-Fri 10am-10pm</span>
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
                                    <p>© 2025 <Link to="/">Stoxzo</Link> All right reserved</p>
                                </div>
                                <div className="social-links style-3">
                                    <ul>
                                        <li><a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-facebook-f"></i></a></li>
                                        <li><a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-instagram"></i></a></li>
                                        <li><a href="https://x.com/" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-x-twitter"></i></a></li>
                                        <li><a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-linkedin-in"></i></a></li>
                                    </ul>
                                </div>
                                <div className="copyright-menu">
                                    <ul>
                                        <li><Link to="/privacy">Privacy Policy</Link></li>
                                        <li><Link to="/terms">Terms & Condition</Link></li>
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
