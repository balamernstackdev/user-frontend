import { useState, useEffect } from 'react';
import ticketService from '../services/ticket.service';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Pagination from '../components/common/Pagination';
import SEO from '../components/common/SEO';
import { useSocket } from '../context/SocketContext';
import { LifeBuoy, Calendar, X, Eye, Ticket, AlertCircle, Clock, CheckCircle, Lock } from 'lucide-react';
import './styles/AdminListings.css';

const AdminTickets = () => {
    const { socket } = useSocket();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const params = {
                status: statusFilter,
                priority: priorityFilter,
                startDate,
                endDate,
                limit: pagination.limit,
                offset: (pagination.page - 1) * pagination.limit
            };
            const response = await ticketService.getAllTickets(params);
            if (response.data && response.data.pagination) {
                setTickets(response.data.tickets);
                setPagination(prev => ({ ...prev, total: response.data.pagination.total }));
            } else if (Array.isArray(response.data)) {
                // Fallback for stale backend
                const allData = response.data;
                const startIndex = (pagination.page - 1) * pagination.limit;
                const endIndex = startIndex + pagination.limit;
                const paginatedData = allData.slice(startIndex, endIndex);

                setTickets(paginatedData);
                setPagination(prev => ({ ...prev, total: allData.length }));
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                // Fallback for wrapped array
                const allData = response.data.data;
                const startIndex = (pagination.page - 1) * pagination.limit;
                const endIndex = startIndex + pagination.limit;
                const paginatedData = allData.slice(startIndex, endIndex);

                setTickets(paginatedData);
                setPagination(prev => ({ ...prev, total: allData.length }));
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();

        if (socket) {
            socket.on('new_notification', (notification) => {
                if (notification.type === 'info' && notification.title.includes('Ticket')) {
                    fetchTickets();
                }
            });

            return () => socket.off('new_notification');
        }
    }, [pagination.page, statusFilter, priorityFilter, startDate, endDate, socket]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const dateStr = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <DashboardLayout>
            <SEO title="Support Management" description="Manage support tickets" />
            <div className="admin-listing-page animate-fade-up">
                <div className="admin-container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Support Tickets</h1>
                            <p className="text-muted mb-0">Manage user support requests and inquiries</p>
                        </div>
                    </div>

                    <div className="admin-listing-toolbar">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 w-100">
                            {/* Left Side: Date Filters */}
                            <div className="d-flex align-items-center gap-3">
                                <span className="text-muted small fw-bold text-uppercase">Filter Date:</span>
                                <div className="d-flex align-items-center gap-2">
                                    <input
                                        type="date"
                                        className="custom-select"
                                        style={{ height: '42px' }}
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                    <span className="text-muted">to</span>
                                    <input
                                        type="date"
                                        className="custom-select"
                                        style={{ height: '42px' }}
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                    {(startDate || endDate) && (
                                        <button
                                            className="tj-btn tj-btn-sm tj-btn-outline-danger"
                                            onClick={() => { setStartDate(''); setEndDate(''); }}
                                            title="Clear Dates"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Right Side: Filters */}
                            <div className="d-flex align-items-center gap-2">
                                <select
                                    className="custom-select"
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                >
                                    <option value="">All Priorities</option>
                                    <option value="high">High Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="low">Low Priority</option>
                                </select>

                                <select
                                    className="custom-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="listing-table-container">
                        <div className="table-responsive">
                            <table className="listing-table">
                                <thead>
                                    <tr>
                                        <th>Ticket ID</th>
                                        <th>Subject</th>
                                        <th>User Details</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Last Updated</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="7" className="text-center py-5 text-muted">Loading tickets...</td></tr>
                                    ) : tickets.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-5">
                                                <div className="d-flex flex-column align-items-center">
                                                    <div className="mb-2"><LifeBuoy size={40} className="text-muted opacity-20" /></div>
                                                    <p className="text-muted mb-0">No tickets found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        tickets.map(ticket => (
                                            <tr key={ticket.id}>
                                                <td>
                                                    <span className="fw-medium text-primary">#{ticket.ticket_number}</span>
                                                </td>
                                                <td>
                                                    <span className="fw-medium text-dark">{ticket.subject}</span>
                                                </td>
                                                <td>
                                                    <div className="fw-semibold text-dark">{ticket.user_name}</div>
                                                    <div className="text-muted small">{ticket.user_email}</div>
                                                </td>
                                                <td>
                                                    <span className={`premium-badge ${ticket.priority === 'high' ? 'premium-badge-danger' :
                                                        ticket.priority === 'medium' ? 'premium-badge-warning' :
                                                            'premium-badge-info'
                                                        }`}>
                                                        {ticket.priority === 'high' && <AlertCircle size={12} className="me-1" />}
                                                        {ticket.priority}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`premium-badge ${ticket.status === 'open' ? 'premium-badge-success' :
                                                        ticket.status === 'closed' ? 'premium-badge-secondary' :
                                                            ticket.status === 'resolved' ? 'premium-badge-info' : 'premium-badge-primary'
                                                        }`}>
                                                        {ticket.status === 'open' ? <CheckCircle size={12} className="me-1" /> :
                                                            ticket.status === 'closed' ? <Lock size={12} className="me-1" /> :
                                                                <Clock size={12} className="me-1" />}
                                                        {ticket.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="text-muted small">{formatDate(ticket.updated_at)}</td>
                                                <td className="text-end">
                                                    <div className="actions-cell justify-content-end">
                                                        <Link to={`/admin/tickets/${ticket.id}`} className="action-btn" title="View Ticket">
                                                            <Eye size={16} />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {pagination.total > pagination.limit && (
                            <div className="mt-4 p-4 border-top d-flex justify-content-center">
                                <Pagination
                                    currentPage={pagination.page}
                                    totalItems={pagination.total}
                                    itemsPerPage={pagination.limit}
                                    onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminTickets;
