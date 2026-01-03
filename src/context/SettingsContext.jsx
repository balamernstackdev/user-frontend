import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsService } from '../services/settings.service';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        site_name: 'Stoxzo', // Default fallback
        support_email: 'support@stoxzo.com',
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

    return (
        <SettingsContext.Provider value={{ settings, loading, fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
