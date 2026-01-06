import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import SkeletonLoader from './SkeletonLoader';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const UserRoleChart = ({ data, isLoading }) => {

    if (isLoading) {
        return (
            <div className="analytics-card h-100 mb-4 chart-card">
                <h4 className="mb-3"><SkeletonLoader width="150px" height="24px" /></h4>
                <div style={{ height: '220px' }}>
                    <SkeletonLoader width="100%" height="40px" className="mb-2" />
                    <SkeletonLoader width="100%" height="40px" className="mb-2" />
                    <SkeletonLoader width="100%" height="40px" className="mb-2" />
                    <SkeletonLoader width="100%" height="40px" />
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
            <h4 className="mb-3">User Distribution</h4>
            <div className="chart-container" style={{ height: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: 0, right: 30, top: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={false} stroke="#e5e7eb" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="role"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 13, fill: '#475569', fontWeight: 600 }}
                            width={130}
                            tickFormatter={formatRole}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                            }}
                            formatter={(value, name) => [value, 'Users']}
                            labelFormatter={formatRole}
                        />
                        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            <LabelList
                                dataKey="count"
                                position="right"
                                style={{ fill: '#334155', fontSize: '13px', fontWeight: '700' }}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default UserRoleChart;
