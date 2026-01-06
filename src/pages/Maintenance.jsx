import React from 'react';
import { useSettings } from '../context/SettingsContext';
import SEO from '../components/common/SEO';
import StoxzoLogo from '../assets/images/Stoxzo_Logo.svg';

const Maintenance = () => {
    const { settings } = useSettings();

    return (
        <div className="maintenance-page d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <SEO title="Maintenance Mode" description="Site is currently under maintenance" />
            <div className="container text-center">
                <div className="maintenance-card p-5 bg-white rounded-4 shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
                    <div className="mb-4">
                        <img src={settings.logo_url || StoxzoLogo} alt={settings.site_name || "Logo"} style={{ maxHeight: '80px' }} />
                    </div>
                    <div className="mb-4">
                        <i className="fas fa-tools text-primary" style={{ fontSize: '64px' }}></i>
                    </div>
                    <h1 className="fw-bold mb-3" style={{ color: '#1e293b' }}>Under Maintenance</h1>
                    <p className="text-muted mb-4 fs-5">
                        We are currently performing some scheduled maintenance to improve our services.
                        We'll be back online shortly. Thank you for your patience!
                    </p>
                    <div className="border-top pt-4 mt-2">
                        <p className="small text-muted mb-0">
                            Need urgent support? Contact us at: <br />
                            <a href={`mailto:${settings.support_email}`} className="text-primary fw-medium text-decoration-none">
                                {settings.support_email}
                            </a>
                        </p>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .maintenance-page {
                    animation: fadeIn 0.5s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Maintenance;
