import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import SkeletonLoader from './SkeletonLoader';

const RevenueChart = ({
    data,
    dateRange,
    onDateChange,
    onClearFilters,
    isLoading
}) => {

    if (isLoading) {
        return (
            <div className="analytics-card h-100 chart-card">
                <div className="card-header d-flex justify-content-between mb-4">
                    <div>
                        <SkeletonLoader width="150px" height="24px" className="mb-2" />
                        <SkeletonLoader width="200px" height="16px" />
                    </div>
                    <div className="d-flex gap-2">
                        <SkeletonLoader width="140px" height="32px" />
                        <SkeletonLoader width="140px" height="32px" />
                    </div>
                </div>
                <div style={{ height: '350px' }}>
                    <SkeletonLoader width="100%" height="100%" />
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-card h-100 chart-card">
            <div className="card-header d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h4 className="mb-0">Revenue Overview</h4>
                    <p className="text-muted small mb-0">Financial performance over selected period</p>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <input
                        type="date"
                        name="startDate"
                        className="form-control form-control-sm"
                        value={dateRange.startDate}
                        onChange={onDateChange}
                        placeholder="Start Date"
                        style={{ width: '140px', fontSize: '13px', borderRadius: '6px' }}
                    />
                    <span className="text-muted" style={{ fontSize: '13px' }}>—</span>
                    <input
                        type="date"
                        name="endDate"
                        className="form-control form-control-sm"
                        value={dateRange.endDate}
                        onChange={onDateChange}
                        placeholder="End Date"
                        style={{ width: '140px', fontSize: '13px', borderRadius: '6px' }}
                    />
                    {(dateRange.startDate || dateRange.endDate) && (
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={onClearFilters}
                            title="Clear Filters"
                            style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px' }}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>
            <div className="chart-container" style={{ height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            angle={-45}
                            textAnchor="end"
                            height={70}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            tickFormatter={(value) => `₹${value}`}
                            width={70}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                            }}
                            formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3b82f6"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#3b82f6' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RevenueChart;
