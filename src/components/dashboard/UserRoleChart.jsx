import React from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import SkeletonLoader from './SkeletonLoader';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const UserRoleChart = ({ data, isLoading }) => {

    if (isLoading) {
        return (
            <div className="analytics-card h-100 mb-4 chart-card">
                <h4 className="mb-3"><SkeletonLoader width="150px" height="24px" /></h4>
                <div style={{ height: '220px' }}>
                    <SkeletonLoader width="100%" height="220px" style={{ borderRadius: '50%' }} />
                </div>
            </div>
        );
    }

    const formatRole = (role) => {
        return role.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <div className="analytics-card h-100 mb-4 chart-card">
            <h4 className="mb-4" style={{ fontWeight: 700, color: '#1e293b' }}>User Distribution</h4>
            <div className="chart-container" style={{ height: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="45%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="count"
                            nameKey="role"
                            stroke="none"
                            isAnimationActive={true}
                            animationBegin={0}
                            animationDuration={1500}
                            animationEasing="ease-out"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' }}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '12px',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                                color: '#fff'
                            }}
                            itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}
                            formatter={(value) => [value, 'Users']}
                            labelFormatter={(label) => formatRole(label)}
                        />
                        <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            formatter={(value, entry) => (
                                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 500, marginRight: '10px' }}>
                                    {formatRole(value)}
                                </span>
                            )}
                            wrapperStyle={{ paddingTop: '20px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default UserRoleChart;
