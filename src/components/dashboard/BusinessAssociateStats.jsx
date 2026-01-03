import React from 'react';

const BusinessAssociateStats = ({ stats }) => {
    if (!stats) return null;

    const statItems = [
        {
            label: 'Total Referrals',
            value: stats.total_referrals,
            icon: 'fas fa-users',
            color: '#13689e'
        },
        {
            label: 'Active Subscribers',
            value: stats.active_subscribers || 0,
            icon: 'fas fa-user-check',
            color: '#28a745'
        },
        {
            label: 'Total Commissions',
            value: `₹${(stats.total_commissions || 0).toLocaleString()}`,
            icon: 'fas fa-wallet',
            color: '#ffc107'
        },
        {
            label: 'Conversion Rate',
            value: `${(stats.total_referrals || 0) > 0
                ? Math.round(((stats.active_subscribers || 0) / (stats.total_referrals || 0)) * 100)
                : 0}%`,
            icon: 'fas fa-chart-line',
            color: '#17a2b8'
        }
    ];

    return (
        <div className="stats-grid marketer-stats-grid">
            {statItems.map((item, index) => (
                <div className="stat-card" key={index}>
                    <div className="stat-icon" style={{ color: item.color, backgroundColor: `${item.color}15` }}>
                        <i className={item.icon}></i>
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">{item.label}</span>
                        <span className="stat-value">{item.value}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BusinessAssociateStats;
