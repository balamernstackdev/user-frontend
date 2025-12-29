import { Link } from 'react-router-dom';
import { useState } from 'react';
import StoxzoLogo from '../../assets/images/Stoxzo_Logo.svg';
import { authService } from '../../services/auth.service';
import './Header.css';

const Header = ({ notificationCount = 0 }) => {
    const [showSettings, setShowSettings] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleLogout = async () => {
        // Call logout API to clear cookies
        await authService.logout();
        // Clear local storage and redirect
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <>
            {/* Hamburger Menu Overlay */}
            {showMobileMenu && (
                <div className="hamburger-area d-lg-none active">
                    <div className="hamburger_bg" onClick={() => setShowMobileMenu(false)}></div>
                    <div className="hamburger_wrapper">
                        <div className="hamburger_inner">
                            <div className="hamburger_top">
                                <div className="hamburger_logo">
                                    <Link to="/" className="mobile_logo">
                                        <img src={StoxzoLogo} alt="Stoxzo Logo" />
                                    </Link>
                                </div>
                                <div className="hamburger_close">
                                    <button className="hamburger-close-btn" onClick={() => setShowMobileMenu(false)}>
                                        ×
                                    </button>
                                </div>
                            </div>
                            <div className="hamburger_menu">
                                <nav>
                                    <ul>
                                        <li><Link to="/dashboard" onClick={() => setShowMobileMenu(false)}>Dashboard</Link></li>
                                        <li><Link to="/profile" onClick={() => setShowMobileMenu(false)}>My Profile</Link></li>
                                        <li><Link to="/subscription" onClick={() => setShowMobileMenu(false)}>My Subscription</Link></li>
                                        <li><Link to="/payments" onClick={() => setShowMobileMenu(false)}>My Payments</Link></li>
                                        <li><Link to="/tickets" onClick={() => setShowMobileMenu(false)}>My Tickets</Link></li>
                                        <li><Link to="/downloads" onClick={() => setShowMobileMenu(false)}>My Downloads</Link></li>
                                        <li><Link to="/faq" onClick={() => setShowMobileMenu(false)}>FAQ</Link></li>
                                        <li><Link to="/how-to-use" onClick={() => setShowMobileMenu(false)}>How to Use</Link></li>
                                        <li><button onClick={handleLogout} className="mobile-logout-btn">Logout</button></li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="header-area header-3 h10-header header-absolute section-gap-x">
                <div className="header-bottom">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12">
                                <div className="header-wrapper">
                                    {/* Site Logo */}
                                    <div className="site_logo">
                                        <Link className="logo" to="/">
                                            <img src={StoxzoLogo} alt="Stoxzo" />
                                        </Link>
                                    </div>

                                    {/* Navigation */}
                                    <div className="menu-area d-none d-lg-inline-flex align-items-center">
                                        <nav className="mainmenu">
                                            <ul>
                                                <li><Link to="/dashboard">Dashboard</Link></li>
                                                <li
                                                    className="has-dropdown"
                                                    onMouseEnter={() => setShowSettings(true)}
                                                    onMouseLeave={() => setShowSettings(false)}
                                                >
                                                    <Link to="#" onClick={(e) => e.preventDefault()}>
                                                        Settings <i className="fa-light fa-angle-down" style={{ fontSize: '12px', marginLeft: '5px' }}></i>
                                                    </Link>
                                                    {showSettings && (
                                                        <ul className="sub-menu">
                                                            <li><Link to="/profile">My Profile</Link></li>
                                                            <li><Link to="/subscription">My Subscription</Link></li>
                                                            <li><Link to="/payments">My Payments</Link></li>
                                                            <li><Link to="/tickets">My Tickets</Link></li>
                                                            <li><Link to="/downloads">My Downloads</Link></li>
                                                        </ul>
                                                    )}
                                                </li>
                                                <li><Link to="/faq">FAQ</Link></li>
                                                <li><Link to="/how-to-use">How to Use</Link></li>
                                            </ul>
                                        </nav>
                                    </div>

                                    {/* Header Right Info */}
                                    <div className="header-right-item d-none d-lg-inline-flex">
                                        <div className="header-notification" style={{ position: 'relative', marginRight: '20px' }}>
                                            <Link to="/notifications" style={{ position: 'relative', display: 'inline-block', color: 'var(--tj-color-heading-primary)', fontSize: '20px' }}>
                                                <i className="fa-light fa-bell"></i>
                                                {notificationCount > 0 && (
                                                    <span className="notification-badge" style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ff0000', color: '#ffffff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}>
                                                        {notificationCount}
                                                    </span>
                                                )}
                                            </Link>
                                        </div>
                                        <div className="header-button">
                                            <button onClick={handleLogout} className="tj-primary-btn">
                                                <span className="btn-text"><span>Logout</span></span>
                                                <span className="btn-icon"><i className="tji-arrow-right-long"></i></span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mobile Menu Bar - Renamed to avoid main.js conflict */}
                                    <div className="hamburger-trigger d-lg-none" onClick={() => setShowMobileMenu(true)}>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
