import React, { createContext, useContext, useState, useEffect } from 'react';
import settingsService from '../services/settings.service';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        // Basic Site Info
        site_name: 'Stoxzo',
        support_email: 'support@stoxzo.com',

        // System
        maintenance_mode: 'false',

        // SMTP
        smtp_host: '',
        smtp_port: '587',
        smtp_user: '',
        smtp_pass: '',
        smtp_encryption: 'tls',
        smtp_from_name: 'Stoxzo',

        // Branding
        logo_url: '',
        favicon_url: '',
        brand_color: '#13689e',

        // SEO
        meta_description: 'Empowering traders with premium market insights',
        meta_keywords: 'trading, stocks, market analysis',
        google_analytics_id: '',
        facebook_pixel_id: '',

        // Security
        recaptcha_site_key: '',
        recaptcha_secret_key: '',

        // Financial
        currency_code: 'INR',
        currency_symbol: '₹',
        tax_rate: '0',

        // Legal
        privacy_policy_url: '/privacy-policy',
        terms_conditions_url: '/terms-conditions',
        refund_policy_url: '/refund-policy',

        // Contact & Identity
        contact_email: 'hello@stoxzo.com',
        contact_phone: '+1 (009) 544-7818',
        office_address: '993 Renner Burg, West Rond, MT 94251-030, USA.',
        facebook_url: 'https://www.facebook.com/',
        instagram_url: 'https://www.instagram.com/',
        twitter_url: 'https://x.com/',
        linkedin_url: 'https://www.linkedin.com/',
        footer_heading: 'Building Better Business together',
        office_hours: 'Mon-Fri 10am-10pm'
    });
    const [loading, setLoading] = useState(true);

    const fetchSettings = async (forceAll = false) => {
        try {
            const response = forceAll ? await settingsService.getAll() : await settingsService.getPublic();
            if (response.data && response.data.data) {
                // Convert array of settings to object
                const settingsMap = response.data.data.reduce((acc, curr) => {
                    acc[curr.key] = curr.value;
                    return acc;
                }, {});

                setSettings(prev => ({ ...prev, ...settingsMap }));
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        if (settings.brand_color) {
            document.documentElement.style.setProperty('--tj-theme-primary', settings.brand_color);
            document.documentElement.style.setProperty('--tj-color-theme-primary', settings.brand_color);

            // Generate a subtle variant for backgrounds (10% opacity)
            const r = parseInt(settings.brand_color.slice(1, 3), 16);
            const g = parseInt(settings.brand_color.slice(3, 5), 16);
            const b = parseInt(settings.brand_color.slice(5, 7), 16);
            document.documentElement.style.setProperty('--tj-color-theme-primary-rgb', `${r}, ${g}, ${b}`);
        }
    }, [settings.brand_color]);

    return (
        <SettingsContext.Provider value={{ settings, loading, fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
