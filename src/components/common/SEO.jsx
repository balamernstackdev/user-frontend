import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image }) => {
    const siteTitle = 'Stoxzo';
    const defaultDescription = 'Professional website for stock market analysis';
    const currentTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const currentDescription = description || defaultDescription;
    const currentUrl = window.location.href;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{currentTitle}</title>
            <meta name='description' content={currentDescription} />
            {keywords && <meta name='keywords' content={keywords} />}

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
        </Helmet>
    );
};

export default SEO;
