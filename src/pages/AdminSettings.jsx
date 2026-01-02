import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/layout/DashboardLayout';
import settingsService from '../services/settings.service';
import './AdminListings.css';

const AdminSettings = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({});
    const [isValidating, setIsValidating] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await settingsService.getAll();
            setSettings(response.data.data || []);
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, newValue) => {
        setSettings(prev => prev.map(s => s.key === key ? { ...s, value: newValue } : s));
    };

    const handleSave = async (key) => {
        setSaving(prev => ({ ...prev, [key]: true }));

        try {
            const setting = settings.find(s => s.key === key);
            await settingsService.update(key, setting.value);
            toast.success(`Saved ${key.replace(/_/g, ' ').toUpperCase()}`);
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            toast.error(`Failed to save ${key}`);
        } finally {
            setSaving(prev => ({ ...prev, [key]: false }));
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
        if (setting.type === 'boolean') {
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

        const isSecret = setting.key.includes('secret') || setting.key.includes('password') || setting.key.includes('key');

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
        { id: 'razorpay', label: 'RazorpayX Config', icon: 'fas fa-university' }
    ];

    const filteredSettings = settings.filter(s => {
        if (activeTab === 'razorpay') return s.key.startsWith('razorpay_x');
        if (activeTab === 'payments') return (s.key.includes('payout') || (s.key.includes('razorpay') && !s.key.startsWith('razorpay_x'))) && !s.key.includes('commission');
        if (activeTab === 'general') return !s.key.startsWith('razorpay_x') && !s.key.includes('payout') && (!s.key.includes('razorpay') || s.key.includes('commission'));
        return false;
    });

    return (
        <DashboardLayout>
            <div className="admin-listing-page animate-fade-up">
                <div className="container">
                    <div className="admin-listing-header mb-4">
                        <div className="header-title">
                            <h1 style={{ color: '#000000', fontSize: '32px', fontWeight: 700 }}>System Settings</h1>
                            <p style={{ color: '#000000', fontSize: '14px' }}>Global configuration & automation</p>
                        </div>
                    </div>

                    <div className="row">
                        {/* Tab Navigation */}
                        <div className="col-12 mb-4">
                            <div className="d-flex overflow-auto pb-2" style={{ gap: '10px' }}>
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`btn px-4 py-2 rounded-pill d-flex align-items-center transition-all ${activeTab === tab.id ? 'btn-primary' : 'btn-light'}`}
                                        style={{ whiteSpace: 'nowrap', fontWeight: 600, fontSize: '14px' }}
                                    >
                                        <i className={`${tab.icon} me-2`}></i>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Settings Content */}
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
                                        {filteredSettings.map(setting => (
                                            <div key={setting.key} className="mb-4 pb-4 border-bottom last-no-border">
                                                <div className="row align-items-center">
                                                    <div className="col-lg-4 col-md-12 mb-2 mb-lg-0">
                                                        <label className="form-label d-block fw-bold mb-1" style={{ fontSize: '13px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                            {setting.key.replace(/_/g, ' ')}
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
                                                            style={{ height: '40px', padding: '0 20px', fontSize: '14px', borderRadius: '8px' }}
                                                            onClick={() => handleSave(setting.key)}
                                                            disabled={saving[setting.key]}
                                                        >
                                                            {saving[setting.key] ? (
                                                                <span className="spinner-border spinner-border-sm" role="status"></span>
                                                            ) : 'Save'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {activeTab === 'razorpay' && (
                                            <div className="mt-4 pt-4 border-top">
                                                <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                                                    <div>
                                                        <h6 className="mb-1" style={{ fontWeight: 700, fontSize: '14px' }}>Verify Connection</h6>
                                                        <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>Test if the provided Key ID and Secret are valid and connected to Razorpay.</p>
                                                    </div>
                                                    <button
                                                        className="btn btn-outline-primary px-4"
                                                        style={{ fontWeight: 600, fontSize: '14px', borderRadius: '8px' }}
                                                        onClick={handleValidateRazorpayX}
                                                        disabled={isValidating}
                                                    >
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
