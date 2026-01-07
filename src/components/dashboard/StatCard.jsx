import React from 'react';
import { Link } from 'react-router-dom';
import SkeletonLoader from './SkeletonLoader';

const StatCard = ({
    label,
    value,
    icon: Icon,
    iconColor,
    iconBgColor,
    link,
    isLoading,
    className = '',
    ...rest
}) => {

    // Helper to render the Inner content
    const CardContent = () => (
        <>
            <div className="stat-icon-wrapper">
                <div
                    className="stat-icon"
                    style={{
                        color: iconColor,
                        backgroundColor: iconBgColor
                    }}
                >
                    {Icon ? <Icon size={24} /> : null}
                </div>
            </div>
            <div className="stat-info">
                <span className="stat-label">{label}</span>
                <span className="stat-value">
                    {isLoading ? (
                        <SkeletonLoader width="80px" height="28px" className="mt-1" />
                    ) : (
                        value
                    )}
                </span>
            </div>
        </>
    );

    const cardClasses = `stat-card ${className}`;
    // Common styles for the link wrapper to match the div structure
    const linkStyles = {
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        gap: '20px'
    };

    if (link) {
        return (
            <Link to={link} className={cardClasses} style={linkStyles} {...rest}>
                <CardContent />
            </Link>
        );
    }

    return (
        <div className={cardClasses} {...rest}>
            {/* Mimic the flex behavior of the link for consistency if not a link */}
            <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '20px' }}>
                <CardContent />
            </div>
        </div>
    );
};

export default StatCard;
