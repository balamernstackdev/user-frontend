import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/layout/DashboardLayout';
import settingsService from '../services/settings.service';
import { useSettings } from '../context/SettingsContext';
import SEO from '../components/common/SEO';
import './AdminListings.css';

const AdminSettings = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({});
    const [isValidating, setIsValidating] = useState(false);
    const [isUploading, setIsUploading] = useState({});
    const [testEmail, setTestEmail] = useState('');
    const [isTestingSMTP, setIsTestingSMTP] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const { fetchSettings: refreshGlobalSettings } = useSettings();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await settingsService.getAll();
            const fetchedSettings = response.data.data || [];

            // Ensure Google Auth keys exist
            const requiredKeys = [
                { key: 'google_client_id', value: '', description: 'Google OAuth Client ID from Google Cloud Console', type: 'string' },
                { key: 'google_client_secret', value: '', description: 'Google OAuth Client Secret', type: 'password' }
            ];

            const mergedSettings = [...fetchedSettings];
            requiredKeys.forEach(req => {
                if (!mergedSettings.find(s => s.key === req.key)) {
                    mergedSettings.push(req);
                }
            });

            setSettings(mergedSettings);
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleTestSMTP = async () => {
        if (!testEmail) {
            toast.error('Please enter a test recipient email');
            return;
        }

        setIsTestingSMTP(true);
        try {
            const response = await settingsService.testSMTP(testEmail);
            toast.success(response.message || 'Test email sent successfully');
        } catch (error) {
            console.error('SMTP test error:', error);
            toast.error(error.response?.data?.message || 'Failed to send test email');
        } finally {
            setIsTestingSMTP(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => prev.map(s => s.key === key ? { ...s, value: value } : s));
    };

    const handleSave = async (key) => {
        setSaving(prev => ({ ...prev, [key]: true }));

        try {
            const setting = settings.find(s => s.key === key);
            await settingsService.update(key, setting.value);
            toast.success(`Saved ${key.replace(/_/g, ' ').toUpperCase()}`);
            refreshGlobalSettings(true);
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            toast.error(`Failed to save ${key}`);
        } finally {
            setSaving(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleFileUpload = async (key, file) => {
        if (!file) return;

        setIsUploading(prev => ({ ...prev, [key]: true }));
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await settingsService.uploadBranding(formData);
            const url = response.data.url;
            handleChange(key, url);
            await settingsService.update(key, url);
            toast.success(`${key.replace(/_/g, ' ').toUpperCase()} uploaded successfully`);
            refreshGlobalSettings(true);
        } catch (error) {
            console.error(`Upload error for ${key}:`, error);
            toast.error(`Failed to upload ${key.replace(/_/g, ' ')}`);
        } finally {
            setIsUploading(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleValidateRazorpayX = async () => {
        setIsValidating(true);
        const keyId = settings.find(s => s.key === 'razorpay_x_key_id')?.value;
        const keySecret = settings.find(s => s.key === 'razorpay_x_key_secret')?.value;

        if (!keyId || !keySecret) {
            toast.error('Please enter both Key ID and Key Secret before testing.');
            setIsValidating(false);
            return;
        }

        try {
            const response = await settingsService.validateRazorpayX({ keyId, keySecret });
            toast.success(response.data.message || 'RazorpayX keys are valid!');
        } catch (error) {
            console.error('Validation error:', error);
            const errorMsg = error.response?.data?.message || 'Invalid credentials or connection error.';
            toast.error(`Validation Failed: ${errorMsg}`);
        } finally {
            setIsValidating(false);
        }
    };

    const renderInput = (setting) => {
        if (setting.key === 'security_method') {
            return (
                <select
                    className="form-select"
                    value={setting.value}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                >
                    <option value="none">None (Disabled)</option>
                    <option value="recaptcha">Google reCAPTCHA v3</option>
                    <option value="turnstile">Cloudflare Turnstile (Coming Soon)</option>
                    <option value="math_captcha">Simple Math Captcha (Coming Soon)</option>
                </select>
            );
        }

        if (setting.type === 'boolean' || setting.key === 'maintenance_mode') {
            return (
                <div className="form-check form-switch p-0 m-0 d-flex align-items-center" style={{ minHeight: '38px' }}>
                    <input
                        className="form-check-input ms-0"
                        type="checkbox"
                        role="switch"
                        checked={setting.value === 'true' || setting.value === true}
                        onChange={(e) => handleChange(setting.key, e.target.checked ? 'true' : 'false')}
                        style={{ width: '40px', height: '20px', cursor: 'pointer' }}
                    />
                    <label className="form-check-label ms-2 fw-medium" style={{ fontSize: '14px' }}>
                        {setting.value === 'true' ? 'Enabled' : 'Disabled'}
                    </label>
                </div>
            );
        }

        if (setting.key === 'logo_url' || setting.key === 'favicon_url') {
            return (
                <div className="d-flex flex-column gap-2">
                    {setting.value && (
                        <div className="mb-2 p-2 border rounded bg-light d-inline-block shadow-sm" style={{ maxWidth: '200px' }}>
                            <img
                                src={setting.value}
                                alt={setting.key}
                                style={{ maxHeight: '60px', maxWidth: '100%', display: 'block', margin: '0 auto' }}
                            />
                        </div>
                    )}
                    <div className="d-flex align-items-center gap-2">
                        <div className="flex-grow-1">
                            <input
                                type="text"
                                className="form-control"
                                value={setting.value || ''}
                                onChange={(e) => handleChange(setting.key, e.target.value)}
                                placeholder="Asset URL"
                                style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', fontSize: '12px' }}
                            />
                        </div>
                        <div className="position-relative">
                            <input
                                type="file"
                                id={`file-${setting.key}`}
                                className="d-none"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(setting.key, e.target.files[0])}
                                disabled={isUploading[setting.key]}
                            />
                            <label
                                htmlFor={`file-${setting.key}`}
                                className="btn btn-outline-primary m-0 d-flex align-items-center justify-content-center"
                                style={{ height: '38px', width: '38px', borderRadius: '8px', cursor: 'pointer', padding: 0 }}
                                title="Upload Image"
                            >
                                {isUploading[setting.key] ? (
                                    <span className="spinner-border spinner-border-sm" role="status"></span>
                                ) : (
                                    <i className="fas fa-upload"></i>
                                )}
                            </label>
                        </div>
                    </div>
                </div>
            );
        }

        if (setting.key === 'brand_color') {
            return (
                <div className="d-flex align-items-center gap-3">
                    <input
                        type="color"
                        className="form-control form-control-color"
                        value={setting.value || '#13689e'}
                        onChange={(e) => handleChange(setting.key, e.target.value)}
                        style={{ width: '60px', height: '38px', cursor: 'pointer' }}
                    />
                    <input
                        type="text"
                        className="form-control"
                        value={setting.value || ''}
                        onChange={(e) => handleChange(setting.key, e.target.value)}
                        placeholder="#13689e"
                        style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                    />
                </div>
            );
        }

        const isSecret = setting.key.includes('secret') || setting.key.includes('password') || setting.key.includes('pass') || setting.key.includes('key');

        return (
            <input
                type={isSecret ? "password" : "text"}
                className="form-control"
                value={setting.value || ''}
                onChange={(e) => handleChange(setting.key, e.target.value)}
                style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
            />
        );
    };

    const tabs = [
        { id: 'general', label: 'General Settings', icon: 'fas fa-cog' },
        { id: 'payments', label: 'Payments & Payouts', icon: 'fas fa-wallet' },
        { id: 'email', label: 'Email (SMTP)', icon: 'fas fa-envelope' },
        { id: 'branding', label: 'Branding & SEO', icon: 'fas fa-palette' },
        { id: 'security', label: 'Security', icon: 'fas fa-shield-alt' },
        { id: 'identity', label: 'Identity & Legal', icon: 'fas fa-address-card' }
    ];

    const filteredSettings = settings.filter(s => {
        if (activeTab === 'payments') {
            return (s.key.includes('payout') || s.key.includes('razorpay')) && !s.key.includes('commission');
        }
        if (activeTab === 'email') {
            return s.key.startsWith('smtp_');
        }
        if (activeTab === 'branding') {
            return ['logo_url', 'favicon_url', 'brand_color', 'meta_description', 'meta_keywords', 'google_analytics_id', 'facebook_pixel_id'].includes(s.key);
        }
        if (activeTab === 'security') {
            return s.key.startsWith('recaptcha_') || s.key.startsWith('google_client_') || s.key === 'security_method';
        }
        if (activeTab === 'identity') {
            return ['contact_email', 'contact_phone', 'office_address', 'facebook_url', 'instagram_url', 'twitter_url', 'linkedin_url', 'footer_heading', 'office_hours', 'privacy_policy_url', 'terms_conditions_url', 'refund_policy_url'].includes(s.key);
        }
        if (activeTab === 'general') {
            return [
                'site_name', 'support_email', 'maintenance_mode',
                'currency_code', 'currency_symbol', 'tax_rate',
                'marketer_commission_default', 'marketer_commission_tier2', 'marketer_commission_tier3'
            ].includes(s.key) || s.key.includes('commission');
        }
        return false;
    }).sort((a, b) => {
        if (activeTab === 'payments') {
            const isARX = a.key.startsWith('razorpay_x');
            const isBRX = b.key.startsWith('razorpay_x');
            if (!isARX && isBRX) return -1;
            if (isARX && !isBRX) return 1;
        }
        return 0;
    });

    return (
        <DashboardLayout>
            <SEO title="System Settings" description="Global platform configuration" />
            <div className="admin-listing-page animate-fade-up">
                <div className="container">
                    <div className="admin-listing-header mb-4">
                        <div className="header-title">
                            <h1 style={{ color: '#000000', fontSize: '32px', fontWeight: 700 }}>System Settings</h1>
                            <p style={{ color: '#000000', fontSize: '14px' }}>Global configuration & automation</p>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12 mb-4">
                            <div className="d-flex overflow-auto pb-2" style={{ gap: '10px' }}>
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`btn px-4 py-2 rounded-pill d-flex align-items-center justify-content-center transition-all ${activeTab === tab.id ? 'btn-primary' : 'btn-light'}`}
                                        style={{ whiteSpace: 'nowrap', fontWeight: 600, fontSize: '14px', gap: '8px' }}
                                    >
                                        <i className={`${tab.icon}`} style={{ fontSize: '1.1em', marginTop: '1px' }}></i>
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="col-12">
                            <div className="listing-table-container shadow-sm border-0 p-4 bg-white rounded-3">
                                <h5 className="mb-4 d-flex align-items-center" style={{ fontWeight: 700, color: '#000000' }}>
                                    {tabs.find(t => t.id === activeTab)?.label}
                                </h5>

                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status"></div>
                                        <p className="mt-2 text-muted">Loading settings...</p>
                                    </div>
                                ) : filteredSettings.length === 0 ? (
                                    <div className="text-center py-5">
                                        <p className="text-muted">No settings found for this category.</p>
                                    </div>
                                ) : (
                                    <div className="settings-list">
                                        {filteredSettings.map((setting, index) => {
                                            const isRazorpayX = setting.key.startsWith('razorpay_x');
                                            const prevIsRazorpayX = index > 0 ? filteredSettings[index - 1].key.startsWith('razorpay_x') : null;

                                            const isSEO = ['meta_description', 'meta_keywords', 'google_analytics_id', 'facebook_pixel_id'].includes(setting.key);
                                            const prevIsSEO = index > 0 ? ['meta_description', 'meta_keywords', 'google_analytics_id', 'facebook_pixel_id'].includes(filteredSettings[index - 1].key) : false;

                                            return (
                                                <React.Fragment key={setting.key}>
                                                    {activeTab === 'payments' && index === 0 && !isRazorpayX && (
                                                        <div className="mb-4 pb-2 border-bottom">
                                                            <h6 className="mb-0 text-primary fw-bold" style={{ fontSize: '15px' }}>
                                                                <i className="fas fa-credit-card me-2"></i>
                                                                Payment Gateway (Customer Payments)
                                                            </h6>
                                                        </div>
                                                    )}

                                                    {activeTab === 'payments' && isRazorpayX && prevIsRazorpayX === false && (
                                                        <div className="mt-5 mb-4 pb-2 border-bottom">
                                                            <h6 className="mb-0 text-primary fw-bold" style={{ fontSize: '15px' }}>
                                                                <i className="fas fa-university me-2"></i>
                                                                RazorpayX Configuration (Vendor Payouts)
                                                            </h6>
                                                        </div>
                                                    )}

                                                    {activeTab === 'branding' && index === 0 && !isSEO && (
                                                        <div className="mb-4 pb-2 border-bottom">
                                                            <h6 className="mb-0 text-primary fw-bold" style={{ fontSize: '15px' }}>
                                                                <i className="fas fa-paint-brush me-2"></i>
                                                                Visual Branding
                                                            </h6>
                                                        </div>
                                                    )}

                                                    {activeTab === 'branding' && isSEO && !prevIsSEO && (
                                                        <div className="mt-5 mb-4 pb-2 border-bottom">
                                                            <h6 className="mb-0 text-primary fw-bold" style={{ fontSize: '15px' }}>
                                                                <i className="fas fa-chart-line me-2"></i>
                                                                SEO & Analytics
                                                            </h6>
                                                        </div>
                                                    )}

                                                    {activeTab === 'email' && index === 0 && (
                                                        <div className="mb-4 p-3 bg-light rounded-3 d-flex justify-content-between align-items-center animate-fade-up shadow-sm border border-primary-subtle">
                                                            <div>
                                                                <h6 className="mb-1 fw-bold text-primary"><i className="fas fa-vial me-2"></i>Test SMTP Configuration</h6>
                                                                <p className="small text-muted mb-0">Verify if your email settings are working correctly.</p>
                                                            </div>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <input
                                                                    type="email"
                                                                    className="form-control form-control-sm"
                                                                    placeholder="Recipient email"
                                                                    value={testEmail}
                                                                    onChange={(e) => setTestEmail(e.target.value)}
                                                                    style={{ width: '200px', backgroundColor: '#fff' }}
                                                                />
                                                                <button
                                                                    className="btn btn-primary btn-sm px-3"
                                                                    onClick={handleTestSMTP}
                                                                    disabled={isTestingSMTP}
                                                                    style={{ borderRadius: '6px' }}
                                                                >
                                                                    {isTestingSMTP ? (
                                                                        <><span className="spinner-border spinner-border-sm me-1"></span>Testing...</>
                                                                    ) : (
                                                                        <><i className="fas fa-paper-plane me-1"></i> Send Test</>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="mb-4 pb-4 border-bottom last-no-border">
                                                        <div className="row align-items-center">
                                                            <div className="col-lg-4 col-md-12 mb-2 mb-lg-0">
                                                                <label className="form-label d-block fw-bold mb-1" style={{ fontSize: '13px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                                    {setting.key.replace(/_/g, ' ').replace(/marketer/i, 'Business Associate')}
                                                                </label>
                                                                {setting.description && (
                                                                    <div className="text-muted" style={{ fontSize: '11px', lineHeight: '1.4' }}>
                                                                        {setting.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="col-lg-6 col-md-9 col-8">
                                                                {renderInput(setting)}
                                                            </div>
                                                            <div className="col-lg-2 col-md-3 col-4 text-end">
                                                                <button
                                                                    className="tj-primary-btn w-100"
                                                                    style={{ height: '40px', padding: '0 20px', fontSize: '14px', borderRadius: '50px' }}
                                                                    onClick={() => handleSave(setting.key)}
                                                                    disabled={saving[setting.key]}
                                                                >
                                                                    <span className="btn-text">
                                                                        {saving[setting.key] ? (
                                                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                                                        ) : 'Save'}
                                                                    </span>
                                                                    {!saving[setting.key] && (
                                                                        <span className="btn-icon">
                                                                            <i className="fas fa-arrow-right"></i>
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            );
                                        })}

                                        {activeTab === 'payments' && settings.some(s => s.key.startsWith('razorpay_x')) && (
                                            <div className="mt-4 pt-4 border-top">
                                                <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                                                    <div>
                                                        <h6 className="mb-1" style={{ fontWeight: 700, fontSize: '14px' }}>Verify Connection</h6>
                                                        <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>Test if the provided Key ID and Secret are valid and connected to Razorpay.</p>
                                                    </div>
                                                    <button
                                                        className="tj-primary-btn px-4"
                                                        style={{ fontWeight: 600, fontSize: '14px', borderRadius: '50px', height: '40px' }}
                                                        onClick={handleValidateRazorpayX}
                                                        disabled={isValidating}
                                                    >
                                                        <span className="btn-text">
                                                            {isValidating ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                                    Validating...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="fas fa-plug me-2"></i>
                                                                    Test Connection
                                                                </>
                                                            )}
                                                        </span>
                                                        {!isValidating && (
                                                            <span className="btn-icon">
                                                                <i className="fas fa-arrow-right"></i>
                                                            </span>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .last-no-border:last-child {
                    border-bottom: none !important;
                    margin-bottom: 0 !important;
                    padding-bottom: 0 !important;
                }
                .transition-all {
                    transition: all 0.2s ease-in-out;
                }
                .btn-primary {
                    background-color: #13689e !important;
                    border-color: #13689e !important;
                }
                .btn-light {
                    background-color: #f3f4f6;
                    border: none;
                }
                .btn-light:hover {
                    background-color: #e5e7eb;
                }
            `}</style>
        </DashboardLayout>
    );
};

export default AdminSettings;
