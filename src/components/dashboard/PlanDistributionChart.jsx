import React from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';
import SkeletonLoader from './SkeletonLoader';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const PlanDistributionChart = ({ data, isLoading }) => {

    if (isLoading) {
        return (
            <div className="analytics-card h-100 chart-card">
                <h4 className="mb-1"><SkeletonLoader width="120px" height="24px" /></h4>
                <div className="mb-3"><SkeletonLoader width="180px" height="16px" /></div>
                <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SkeletonLoader width="200px" height="200px" variant="circle" />
                </div>
            </div>
        );
    }

    const total = data.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0);

    return (
        <div className="analytics-card h-100 chart-card">
            <h4 className="mb-1">Active Plans</h4>
            <p className="text-muted small mb-3">Current subscription distribution</p>
            <div className="d-flex flex-column align-items-center gap-4">
                {/* Chart Section */}
                <div style={{ height: '220px', width: '100%' }}>
                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    fill="#8884d8"
                                    dataKey="count"
                                    nameKey="plan_name"
                                    paddingAngle={5}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [value, 'Users']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="d-flex align-items-center justify-content-center h-100">
                            <p className="text-muted mb-0">No active plans</p>
                        </div>
                    )}
                </div>

                {/* Details List Section */}
                <div style={{ width: '100%' }}>
                    <div className="d-flex flex-column gap-2">
                        {data.map((entry, index) => {
                            const percentage = total > 0 ? ((entry.count / total) * 100).toFixed(1) : 0;
                            return (
                                <div key={index} className="d-flex align-items-center justify-content-between p-2 rounded hover-bg-light transition-all" style={{ minHeight: '60px' }}>
                                    <div className="d-flex align-items-center gap-3 flex-grow-1" style={{ minWidth: 0 }}>
                                        <div
                                            style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '4px',
                                                backgroundColor: COLORS[index % COLORS.length],
                                                flexShrink: 0
                                            }}
                                        />
                                        <div className="d-flex flex-column" style={{ minWidth: 0 }}>
                                            <h6 className="mb-0 text-dark fw-bold text-truncate" style={{ fontSize: '14px' }} title={entry.plan_name}>{entry.plan_name}</h6>
                                            <small className="text-muted text-truncate" style={{ fontSize: '12px' }}>{percentage}% of total</small>
                                        </div>
                                    </div>
                                    <div className="text-end d-flex flex-column align-items-end ps-2 flex-shrink-0">
                                        <h5 className="mb-0 fw-bold text-primary" style={{ lineHeight: '1' }}>{entry.count}</h5>
                                        <small className="text-muted text-uppercase" style={{ fontSize: '10px', fontWeight: '600' }}>Users</small>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanDistributionChart;
