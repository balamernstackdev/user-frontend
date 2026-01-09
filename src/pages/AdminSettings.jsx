import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/layout/DashboardLayout';
import settingsService from '../services/settings.service';
import { useSettings } from '../context/SettingsContext';
import SEO from '../components/common/SEO';
import { Settings, Wallet, Mail, Palette, Shield, CreditCard, Landmark, LineChart, TestTube, Send, Upload, Save, Check, Plug, UserSquare, Phone, MapPin, Globe, Clock, FileText } from 'lucide-react';

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
                        <div className="mb-2 p-2 border rounded bg-light d-inline-block shadow-sm overflow-hidden" style={{ maxWidth: '200px' }}>
                            <img
                                src={setting.value}
                                alt={setting.key}
                                style={{ maxHeight: '60px', width: 'auto', display: 'block', margin: '0 auto' }}
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
                                placeholder="Enter asset URL..."
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
                                title="Upload File"
                            >
                                {isUploading[setting.key] ? (
                                    <span className="spinner-border spinner-border-sm" role="status"></span>
                                ) : (
                                    <Upload size={16} />
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
        { id: 'general', label: 'General Settings', icon: Settings },
        { id: 'payments', label: 'Payments & Payouts', icon: Wallet },
        { id: 'email', label: 'Email (SMTP)', icon: Mail },
        { id: 'branding', label: 'Branding & SEO', icon: Palette },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'identity', label: 'Identity & Legal', icon: UserSquare }
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
                <div className="admin-container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>System Settings</h1>
                            <p className="text-muted mb-0">Global configuration & automation</p>
                        </div>
                    </div>

                    <div className="admin-listing-toolbar mb-4 overflow-hidden">
                        <div className="d-flex flex-nowrap align-items-center gap-3 overflow-auto pb-2 scrollbar-none" style={{ scrollSnapType: 'x mandatory' }}>
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`tj-btn ${activeTab === tab.id ? 'tj-btn-primary' : 'tj-btn-outline-primary'}`}
                                        style={{ whiteSpace: 'nowrap', minWidth: 'auto', padding: '0 24px', height: '44px', borderRadius: '50px', flex: '0 0 auto', scrollSnapAlign: 'start' }}
                                    >
                                        <Icon size={18} className="me-2" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="listing-table-container">
                        <div className="p-4">
                            <h4 className="fw-bold mb-4" style={{ color: '#1e293b' }}>
                                {tabs.find(t => t.id === activeTab)?.label}
                            </h4>

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
                                                    <div className="mb-4 pb-2 border-bottom d-flex align-items-center gap-2">
                                                        <CreditCard size={18} className="text-primary" />
                                                        <h6 className="mb-0 text-primary fw-bold text-uppercase small letter-spacing-1">
                                                            Payment Gateway (Customer Payments)
                                                        </h6>
                                                    </div>
                                                )}

                                                {activeTab === 'payments' && isRazorpayX && prevIsRazorpayX === false && (
                                                    <div className="mt-5 mb-4 pb-2 border-bottom d-flex align-items-center gap-2">
                                                        <Landmark size={18} className="text-primary" />
                                                        <h6 className="mb-0 text-primary fw-bold text-uppercase small letter-spacing-1">
                                                            RazorpayX Configuration (Vendor Payouts)
                                                        </h6>
                                                    </div>
                                                )}

                                                {activeTab === 'branding' && index === 0 && !isSEO && (
                                                    <div className="mb-4 pb-2 border-bottom d-flex align-items-center gap-2">
                                                        <Palette size={18} className="text-primary" />
                                                        <h6 className="mb-0 text-primary fw-bold text-uppercase small letter-spacing-1">
                                                            Visual Branding
                                                        </h6>
                                                    </div>
                                                )}

                                                {activeTab === 'branding' && isSEO && !prevIsSEO && (
                                                    <div className="mt-5 mb-4 pb-2 border-bottom d-flex align-items-center gap-2">
                                                        <LineChart size={18} className="text-primary" />
                                                        <h6 className="mb-0 text-primary fw-bold text-uppercase small letter-spacing-1">
                                                            SEO & Analytics
                                                        </h6>
                                                    </div>
                                                )}

                                                {activeTab === 'email' && index === 0 && (
                                                    <div className="mb-5 p-4 bg-light rounded-4 d-flex justify-content-between align-items-center border border-primary-subtle shadow-sm">
                                                        <div>
                                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                                <TestTube size={18} className="text-primary" />
                                                                <h6 className="mb-0 fw-bold text-primary">Test SMTP Configuration</h6>
                                                            </div>
                                                            <p className="small text-muted mb-0">Verify if your email settings are working correctly.</p>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="position-relative">
                                                                <input
                                                                    type="email"
                                                                    className="form-control"
                                                                    placeholder="Enter recipient email..."
                                                                    value={testEmail}
                                                                    onChange={(e) => setTestEmail(e.target.value)}
                                                                    style={{ width: '280px', height: '44px', paddingLeft: '15px' }}
                                                                />
                                                            </div>
                                                            <button
                                                                className="tj-btn tj-btn-primary"
                                                                onClick={handleTestSMTP}
                                                                disabled={isTestingSMTP}
                                                                style={{ height: '44px', padding: '0 25px' }}
                                                            >
                                                                {isTestingSMTP ? (
                                                                    <><span className="spinner-border spinner-border-sm me-2"></span>Testing...</>
                                                                ) : (
                                                                    <><Send size={16} className="me-2" /> Send Test Email</>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="mb-4 pb-4 border-bottom last-no-border">
                                                    <div className="row align-items-center">
                                                        <div className="col-lg-4 col-md-12 mb-3 mb-lg-0">
                                                            <label className="d-block fw-bold mb-1" style={{ fontSize: '14px', color: '#1e293b' }}>
                                                                {setting.key.replace(/_/g, ' ').toUpperCase()}
                                                            </label>
                                                            {setting.description && (
                                                                <div className="text-muted" style={{ fontSize: '11.5px', lineHeight: '1.5' }}>
                                                                    {setting.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="col-lg-6 col-md-9 col-sm-8 col-12">
                                                            <div className="setting-input-wrapper">
                                                                {renderInput(setting)}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-2 col-md-3 col-sm-4 col-12 text-end mt-3 mt-sm-0">
                                                            <button
                                                                className="tj-btn tj-btn-primary w-100"
                                                                style={{ height: '42px', borderRadius: '10px' }}
                                                                onClick={() => handleSave(setting.key)}
                                                                disabled={saving[setting.key]}
                                                            >
                                                                {saving[setting.key] ? (
                                                                    <span className="spinner-border spinner-border-sm" role="status"></span>
                                                                ) : (
                                                                    <><Save size={16} className="me-2" /> Save</>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })}

                                    <div className="mt-5 pt-4 border-top">
                                        <div className="d-flex align-items-center justify-content-between p-4 rounded-4 bg-light border border-dashed">
                                            <div className="d-flex align-items-start gap-3">
                                                <div className="p-3 bg-white rounded-circle shadow-sm">
                                                    <Plug size={24} className="text-primary" />
                                                </div>
                                                <div>
                                                    <h6 className="fw-bold mb-1">Verify Connector Status</h6>
                                                    <p className="mb-0 text-muted small" style={{ maxWidth: '400px' }}>Test if the provided RazorpayX Key ID and Secret are valid and can establish a secure connection.</p>
                                                </div>
                                            </div>
                                            <button
                                                className="tj-btn tj-btn-outline-primary"
                                                style={{ height: '48px', padding: '0 30px', borderRadius: '12px' }}
                                                onClick={handleValidateRazorpayX}
                                                disabled={isValidating}
                                            >
                                                {isValidating ? (
                                                    <><span className="spinner-border spinner-border-sm me-2"></span>Validating API...</>
                                                ) : (
                                                    <><Plug size={18} className="me-2" /> Test Gateway Connection</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
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
            `}</style>
        </DashboardLayout>
    );
};

export default AdminSettings;
