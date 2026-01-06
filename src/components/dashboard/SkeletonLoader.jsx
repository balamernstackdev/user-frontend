import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ width, height, variant = 'text', className = '', style = {} }) => {
    const styles = {
        width,
        height,
        ...style,
    };

    return (
        <div
            className={`skeleton-loader skeleton-${variant} ${className}`}
            style={styles}
            aria-hidden="true"
        />
    );
};

export default SkeletonLoader;
