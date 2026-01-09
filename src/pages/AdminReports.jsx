import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import SEO from '../components/common/SEO';
import { FileText, Download, Calendar, Users, Briefcase, CreditCard, DollarSign } from 'lucide-react';
import adminService from '../services/admin.service';
import { toast } from 'react-toastify';

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
        <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden stat-card-hover transition-base">
            <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle p-3 me-3" style={{ backgroundColor: `${color}15`, color: color }}>
                        <Icon size={24} />
                    </div>
                    <h5 className="card-title mb-0 fw-bold" style={{ color: '#1e293b' }}>{title}</h5>
                </div>
                <p className="card-text text-muted mb-4 small" style={{ minHeight: '40px' }}>{description}</p>

                <div className="d-flex gap-2">
                    <button
                        className="tj-btn tj-btn-outline-primary tj-btn-sm flex-grow-1"
                        onClick={() => handleExport(type, 'csv')}
                        disabled={loading}
                    >
                        <FileText size={16} className="me-2" />
                        CSV
                    </button>
                    {(type === 'marketers' || type === 'commissions') && (
                        <button
                            className="tj-btn tj-btn-outline-danger tj-btn-sm flex-grow-1"
                            onClick={() => handleExport(type, 'pdf')}
                            disabled={loading}
                        >
                            <Download size={16} className="me-2" />
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
                <div className="admin-container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Reports Center</h1>
                            <p className="text-muted mb-0">Generate comprehensive reports for system analysis and bookkeeping</p>
                        </div>
                    </div>

                    {/* Filter Section */}
                    <div className="admin-listing-toolbar">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div className="d-flex flex-wrap align-items-center gap-3">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <Calendar size={14} className="text-muted" />
                                        <span className="text-muted small fw-bold text-uppercase">Record Range:</span>
                                    </div>
                                    <input
                                        type="date"
                                        name="startDate"
                                        className="custom-select"
                                        style={{ height: '42px' }}
                                        value={dateRange.startDate}
                                        onChange={handleDateChange}
                                    />
                                    <span className="text-muted small">to</span>
                                    <input
                                        type="date"
                                        name="endDate"
                                        className="custom-select"
                                        style={{ height: '42px' }}
                                        value={dateRange.endDate}
                                        onChange={handleDateChange}
                                    />
                                    {(dateRange.startDate || dateRange.endDate) && (
                                        <button
                                            className="tj-btn tj-btn-sm tj-btn-outline-danger ms-2"
                                            onClick={clearFilters}
                                        >
                                            Reset Dates
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="text-muted small italic">
                                * Reports will be generated based on the selected date range.
                            </div>
                        </div>
                    </div>

                    {/* Reports Grid */}
                    <div className="row g-4 mt-2">
                        <div className="col-md-6 col-lg-3">
                            <ExportCard
                                title="Users Database"
                                description="Complete export of all registered users, including status and login history."
                                icon={Users}
                                type="users"
                                color="#3b82f6"
                            />
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <ExportCard
                                title="Financial Ledger"
                                description="Detailed log of all financial transactions, payments, and subscription events."
                                icon={CreditCard}
                                type="transactions"
                                color="#10b981"
                            />
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <ExportCard
                                title="Business Partners"
                                description="Performance data for associates, including active leads and conversion rates."
                                icon={Briefcase}
                                type="marketers"
                                color="#8b5cf6"
                            />
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <ExportCard
                                title="Revenue Payouts"
                                description="Summary of all paid and pending commissions for business associates."
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
