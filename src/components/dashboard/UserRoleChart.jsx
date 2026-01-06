import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import SkeletonLoader from './SkeletonLoader';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const UserRoleChart = ({ data, isLoading }) => {

    if (isLoading) {
        return (
            <div className="analytics-card h-100 mb-4">
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

    return (
        <div className="analytics-card h-100 mb-4">
            <h4 className="mb-3">User Distribution</h4>
            <div className="chart-container" style={{ height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: 10, right: 40, top: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#e5e7eb" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="role"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 13, fill: '#374151', fontWeight: 500 }}
                            width={140}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            <LabelList dataKey="count" position="right" style={{ fill: '#374151', fontSize: '13px', fontWeight: '600' }} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default UserRoleChart;
