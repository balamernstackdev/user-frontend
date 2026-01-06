import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSettings } from '../../context/SettingsContext';

const SEO = ({ title, description, keywords, image }) => {
    const { settings } = useSettings();
    const siteTitle = settings.site_name || 'Stoxzo';
    const defaultDescription = settings.meta_description || 'Professional website for stock market analysis';
    const defaultKeywords = settings.meta_keywords || 'trading, stocks, market analysis';

    const currentTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const currentDescription = description || defaultDescription;
    const currentKeywords = keywords || defaultKeywords;
    const currentUrl = window.location.href;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{currentTitle}</title>
            <meta name='description' content={currentDescription} />
            <meta name='keywords' content={currentKeywords} />

            {/* Favicon */}
            {settings.favicon_url && <link rel="icon" type="image/x-icon" href={settings.favicon_url} />}

            {/* Open Graph tags (Facebook, LinkedIn) */}
            <meta property='og:title' content={currentTitle} />
            <meta property='og:description' content={currentDescription} />
            <meta property='og:url' content={currentUrl} />
            <meta property='og:type' content='website' />
            {image && <meta property='og:image' content={image} />}

            {/* Twitter Card tags */}
            <meta name='twitter:card' content='summary_large_image' />
            <meta name='twitter:title' content={currentTitle} />
            <meta name='twitter:description' content={currentDescription} />
            {image && <meta name='twitter:image' content={image} />}

            {/* Analytics Scripts */}
            {settings.google_analytics_id && (
                <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`}></script>
            )}
            {settings.google_analytics_id && (
                <script>
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${settings.google_analytics_id}');
                    `}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
