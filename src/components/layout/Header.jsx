import { Link } from 'react-router-dom';
import { useState } from 'react';
import StoxzoLogo from '../../assets/images/Stoxzo_Logo.svg';
import { authService } from '../../services/auth.service';
import './Header.css';

const Header = ({ notificationCount = 0 }) => {
    const [showSettings, setShowSettings] = useState(false);
    const [showMarketerMenu, setShowMarketerMenu] = useState(false);
    const [showAdminMenu, setShowAdminMenu] = useState(null); // 'manage', 'finance', 'support', 'system' or null
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const user = authService.getUser();
    const isAdmin = user?.role === 'admin';
    const isMarketer = user?.role === 'marketer';

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
                                        {isAdmin ? (
                                            // Admin Mobile Menu
                                            <>
                                                <li><Link to="/admin/dashboard" onClick={() => setShowMobileMenu(false)}>Admin Dashboard</Link></li>
                                                <li><Link to="/admin/plans" onClick={() => setShowMobileMenu(false)}>Manage Plans</Link></li>
                                                <li><Link to="/admin/files" onClick={() => setShowMobileMenu(false)}>Downloads</Link></li>
                                                <li><Link to="/admin/analysis" onClick={() => setShowMobileMenu(false)}>Market Analysis</Link></li>
                                                <li><Link to="/admin/transactions" onClick={() => setShowMobileMenu(false)}>Transactions</Link></li>
                                                <li><Link to="/admin/users" onClick={() => setShowMobileMenu(false)}>User Management</Link></li>
                                                <li><Link to="/admin/tickets" onClick={() => setShowMobileMenu(false)}>Support Tickets</Link></li>
                                                <li><Link to="/admin/logs" onClick={() => setShowMobileMenu(false)}>System Logs</Link></li>
                                                <li><Link to="/profile" onClick={() => setShowMobileMenu(false)}>My Profile</Link></li>
                                            </>
                                        ) : (
                                            // User/Marketer Mobile Menu
                                            <>
                                                <li><Link to="/dashboard" onClick={() => setShowMobileMenu(false)}>Dashboard</Link></li>
                                                <li><Link to="/profile" onClick={() => setShowMobileMenu(false)}>My Profile</Link></li>

                                                {isMarketer && (
                                                    <>
                                                        <li><Link to="/marketer/referrals" onClick={() => setShowMobileMenu(false)}>Referrals</Link></li>
                                                        <li><Link to="/marketer/commissions" onClick={() => setShowMobileMenu(false)}>Commissions</Link></li>
                                                    </>
                                                )}

                                                {!isMarketer && <li><Link to="/subscription" onClick={() => setShowMobileMenu(false)}>My Subscription</Link></li>}

                                                {isMarketer ? (
                                                    <li><Link to="/transactions" onClick={() => setShowMobileMenu(false)}>Transactions</Link></li>
                                                ) : (
                                                    <li><Link to="/payments" onClick={() => setShowMobileMenu(false)}>My Payments</Link></li>
                                                )}

                                                <li><Link to="/tickets" onClick={() => setShowMobileMenu(false)}>My Tickets</Link></li>

                                                {!isMarketer && <li><Link to="/downloads" onClick={() => setShowMobileMenu(false)}>My Downloads</Link></li>}
                                                <li><Link to="/curated-analysis" onClick={() => setShowMobileMenu(false)}>Market Analysis</Link></li>
                                                <li><Link to="/faq" onClick={() => setShowMobileMenu(false)}>FAQ</Link></li>
                                                <li><Link to="/how-to-use" onClick={() => setShowMobileMenu(false)}>How to Use</Link></li>
                                            </>
                                        )}
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
                                                {!isAdmin ? (
                                                    /* User & Marketer Navigation */
                                                    <>
                                                        <li><Link to="/dashboard">Dashboard</Link></li>

                                                        {isMarketer ? (
                                                            /* Marketer Navigation - Organized Dropdowns */
                                                            <>
                                                                <li
                                                                    className="has-dropdown"
                                                                    onMouseEnter={() => setShowMarketerMenu(true)}
                                                                    onMouseLeave={() => setShowMarketerMenu(false)}
                                                                >
                                                                    <Link to="#" onClick={(e) => e.preventDefault()}>
                                                                        Marketer <i className="fas fa-angle-down" style={{ fontSize: '12px', marginLeft: '5px' }}></i>
                                                                    </Link>
                                                                    {showMarketerMenu && (
                                                                        <ul className="sub-menu">
                                                                            <li><Link to="/marketer/referrals">Referrals</Link></li>
                                                                            <li><Link to="/marketer/commissions">Commissions</Link></li>
                                                                            <li><Link to="/curated-analysis">Analysis</Link></li>
                                                                        </ul>
                                                                    )}
                                                                </li>
                                                                <li
                                                                    className="has-dropdown"
                                                                    onMouseEnter={() => setShowSettings(true)}
                                                                    onMouseLeave={() => setShowSettings(false)}
                                                                >
                                                                    <Link to="#" onClick={(e) => e.preventDefault()}>
                                                                        My Account <i className="fas fa-angle-down" style={{ fontSize: '12px', marginLeft: '5px' }}></i>
                                                                    </Link>
                                                                    {showSettings && (
                                                                        <ul className="sub-menu">
                                                                            <li><Link to="/profile">My Profile</Link></li>
                                                                            <li><Link to="/transactions">Transactions</Link></li>
                                                                            <li><Link to="/tickets">Tickets</Link></li>
                                                                        </ul>
                                                                    )}
                                                                </li>
                                                            </>
                                                        ) : (
                                                            /* Regular User Navigation */
                                                            <li
                                                                className="has-dropdown"
                                                                onMouseEnter={() => setShowSettings(true)}
                                                                onMouseLeave={() => setShowSettings(false)}
                                                            >
                                                                <Link to="#" onClick={(e) => e.preventDefault()}>
                                                                    My Account <i className="fas fa-angle-down" style={{ fontSize: '12px', marginLeft: '5px' }}></i>
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
                                                        )}

                                                        <li><Link to="/faq">FAQ</Link></li>
                                                        <li><Link to="/how-to-use">How to Use</Link></li>
                                                        <li><Link to="/curated-analysis">Analysis</Link></li>
                                                    </>
                                                ) : (
                                                    /* Admin Navigation - All Links Exposed */
                                                    <>
                                                        <li><Link to="/admin/dashboard">Dashboard</Link></li>

                                                        {/* Management */}
                                                        <li
                                                            className="has-dropdown"
                                                            onMouseEnter={() => setShowAdminMenu('manage')}
                                                            onMouseLeave={() => setShowAdminMenu(null)}
                                                        >
                                                            <Link to="#" onClick={(e) => e.preventDefault()}>
                                                                Manage <i className="fas fa-angle-down" style={{ fontSize: '12px', marginLeft: '5px' }}></i>
                                                            </Link>
                                                            {showAdminMenu === 'manage' && (
                                                                <ul className="sub-menu">
                                                                    <li><Link to="/admin/users">Users</Link></li>
                                                                    <li><Link to="/admin/plans">Plans</Link></li>
                                                                    <li><Link to="/admin/files">Downloads</Link></li>
                                                                    <li><Link to="/admin/analysis">Analysis</Link></li>
                                                                </ul>
                                                            )}
                                                        </li>

                                                        {/* Finance */}
                                                        <li
                                                            className="has-dropdown"
                                                            onMouseEnter={() => setShowAdminMenu('finance')}
                                                            onMouseLeave={() => setShowAdminMenu(null)}
                                                        >
                                                            <Link to="#" onClick={(e) => e.preventDefault()}>
                                                                Finance <i className="fas fa-angle-down" style={{ fontSize: '12px', marginLeft: '5px' }}></i>
                                                            </Link>
                                                            {showAdminMenu === 'finance' && (
                                                                <ul className="sub-menu">
                                                                    <li><Link to="/admin/commissions">Commissions</Link></li>
                                                                    <li><Link to="/admin/transactions">Transactions</Link></li>
                                                                </ul>
                                                            )}
                                                        </li>

                                                        {/* Support & Content */}
                                                        <li
                                                            className="has-dropdown"
                                                            onMouseEnter={() => setShowAdminMenu('support')}
                                                            onMouseLeave={() => setShowAdminMenu(null)}
                                                        >
                                                            <Link to="#" onClick={(e) => e.preventDefault()}>
                                                                Support <i className="fas fa-angle-down" style={{ fontSize: '12px', marginLeft: '5px' }}></i>
                                                            </Link>
                                                            {showAdminMenu === 'support' && (
                                                                <ul className="sub-menu">
                                                                    <li><Link to="/admin/tickets">Tickets</Link></li>
                                                                    <li><Link to="/admin/faqs">FAQs</Link></li>
                                                                    <li><Link to="/admin/how-to-use">How To Use</Link></li>
                                                                </ul>
                                                            )}
                                                        </li>

                                                        {/* System */}
                                                        <li
                                                            className="has-dropdown"
                                                            onMouseEnter={() => setShowAdminMenu('system')}
                                                            onMouseLeave={() => setShowAdminMenu(null)}
                                                        >
                                                            <Link to="#" onClick={(e) => e.preventDefault()}>
                                                                System <i className="fas fa-angle-down" style={{ fontSize: '12px', marginLeft: '5px' }}></i>
                                                            </Link>
                                                            {showAdminMenu === 'system' && (
                                                                <ul className="sub-menu">
                                                                    <li><Link to="/admin/logs">Logs</Link></li>
                                                                    <li><Link to="/admin/settings">Settings</Link></li>
                                                                </ul>
                                                            )}
                                                        </li>
                                                    </>
                                                )}
                                            </ul>
                                        </nav>
                                    </div>

                                    {/* Header Right Info */}
                                    <div className="header-right-item d-none d-lg-inline-flex">
                                        <div className="header-notification" style={{ position: 'relative', marginRight: '20px' }}>
                                            <Link to="/notifications" style={{ position: 'relative', display: 'inline-block', color: 'var(--tj-color-heading-primary)', fontSize: '20px' }}>
                                                <i className="far fa-bell"></i>
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
            </header >
        </>
    );
};

export default Header;
