import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import SEO from '../components/common/SEO';
import { FileText, Download, Calendar, Users, Briefcase, CreditCard, DollarSign } from 'lucide-react';
import adminService from '../services/admin.service';
import { toast } from 'react-toastify';
import './styles/AdminListings.css';

const AdminReports = () => {
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setDateRange({ startDate: '', endDate: '' });
    };

    const handleExport = async (type, format = 'csv') => {
        try {
            setLoading(true);
            let response;
            const params = {
                format,
                startDate: dateRange.startDate || undefined,
                endDate: dateRange.endDate || undefined
            };

            switch (type) {
                case 'transactions':
                    response = await adminService.exportTransactions(params);
                    break;
                case 'users':
                    response = await adminService.exportUsers(params);
                    break;
                case 'marketers':
                    if (format === 'pdf') {
                        response = await adminService.exportMarketersPDF(params);
                    } else {
                        response = await adminService.exportMarketersCSV(params);
                    }
                    break;
                case 'commissions':
                    response = await adminService.exportCommissions(params);
                    break;
                default:
                    throw new Error('Invalid export type');
            }

            // Create blob and download link
            const blob = new Blob([response.data], {
                type: format === 'pdf' ? 'application/pdf' : 'text/csv'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Generate filename with timestamp
            const dateStr = new Date().toISOString().split('T')[0];
            link.download = `${type}_report_${dateStr}.${format}`;

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded successfully`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error(`Failed to export ${type} report`);
        } finally {
            setLoading(false);
        }
    };

    const ExportCard = ({ title, description, icon: Icon, type, color }) => (
        <div className="card h-100 border-0 shadow-sm">
            <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle p-3 me-3" style={{ backgroundColor: `${color}20` }}>
                        <Icon size={24} color={color} />
                    </div>
                    <h5 className="card-title mb-0">{title}</h5>
                </div>
                <p className="card-text text-muted mb-4 small">{description}</p>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                        onClick={() => handleExport(type, 'csv')}
                        disabled={loading}
                    >
                        <FileText size={16} />
                        CSV
                    </button>
                    {(type === 'marketers' || type === 'commissions') && (
                        <button
                            className="btn btn-outline-danger btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                            onClick={() => handleExport(type, 'pdf')}
                            disabled={loading}
                        >
                            <Download size={16} />
                            PDF
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <SEO title="Admin Reports" description="Generate and download system reports" />
            <div className="admin-listing-page animate-fade-up">
                <div className="container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Reports Center</h1>
                            <p style={{ color: '#6c757d' }}>Generate comprehensive reports for system analysis</p>
                        </div>
                    </div>

                    {/* Filter Section */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body p-4">
                            <div className="row align-items-end g-3">
                                <div className="col-md-4">
                                    <label className="form-label small text-muted fw-bold">Start Date</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <Calendar size={18} className="text-muted" />
                                        </span>
                                        <input
                                            type="date"
                                            name="startDate"
                                            className="form-control border-start-0 ps-0"
                                            value={dateRange.startDate}
                                            onChange={handleDateChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small text-muted fw-bold">End Date</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <Calendar size={18} className="text-muted" />
                                        </span>
                                        <input
                                            type="date"
                                            name="endDate"
                                            className="form-control border-start-0 ps-0"
                                            value={dateRange.endDate}
                                            onChange={handleDateChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    {(dateRange.startDate || dateRange.endDate) && (
                                        <button
                                            className="btn btn-outline-secondary w-100"
                                            onClick={clearFilters}
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reports Grid */}
                    <div className="row g-4">
                        <div className="col-md-6 col-lg-3">
                            <ExportCard
                                title="Users Report"
                                description="Export detailed list of all registered users, primarily for regular user analysis."
                                icon={Users}
                                type="users"
                                color="#3b82f6"
                            />
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <ExportCard
                                title="Transactions"
                                description="Recent payment transactions and statuses. Useful for financial reconciliation."
                                icon={CreditCard}
                                type="transactions"
                                color="#10b981"
                            />
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <ExportCard
                                title="Business Associates"
                                description="Active marketers and their performance metrics. Includes referral codes."
                                icon={Briefcase}
                                type="marketers"
                                color="#8b5cf6"
                            />
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <ExportCard
                                title="Commissions"
                                description="Payout history and pending commissions for business associates."
                                icon={DollarSign}
                                type="commissions"
                                color="#f59e0b"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminReports;
