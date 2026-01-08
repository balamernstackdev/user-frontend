import { useState, useEffect } from 'react';
import ticketService from '../services/ticket.service';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Pagination from '../components/common/Pagination';
import SEO from '../components/common/SEO';
import { useSocket } from '../context/SocketContext';
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
                <div className="container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Support Tickets</h1>
                            <p style={{ color: '#6c757d' }}>Manage user support requests</p>
                        </div>
                    </div>

                    <div className="admin-listing-toolbar mb-4" style={{
                        backgroundColor: 'white',
                        padding: '15px 20px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                        border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            {/* Left Side: Date Filters */}
                            <div className="d-flex align-items-center gap-3">
                                <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>Filter Date:</span>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="input-group input-group-sm" style={{ width: '160px' }}>
                                        <span className="input-group-text bg-white border-end-0 text-muted pe-1">
                                            <i className="far fa-calendar-alt"></i>
                                        </span>
                                        <input
                                            type="date"
                                            className="form-control border-start-0 ps-2"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            style={{ borderColor: '#dee2e6', color: '#6c757d' }}
                                        />
                                    </div>
                                    <span className="text-muted small">to</span>
                                    <div className="input-group input-group-sm" style={{ width: '160px' }}>
                                        <span className="input-group-text bg-white border-end-0 text-muted pe-1">
                                            <i className="far fa-calendar-alt"></i>
                                        </span>
                                        <input
                                            type="date"
                                            className="form-control border-start-0 ps-2"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            style={{ borderColor: '#dee2e6', color: '#6c757d' }}
                                        />
                                    </div>
                                    {(startDate || endDate) && (
                                        <button
                                            className="btn btn-sm text-danger ms-1"
                                            onClick={() => { setStartDate(''); setEndDate(''); }}
                                            title="Clear Dates"
                                            style={{ background: 'none', border: 'none' }}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Right Side: Filters */}
                            <div className="d-flex align-items-center gap-3">
                                <select
                                    className="form-select form-select-sm"
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                    style={{ borderRadius: '6px', borderColor: '#e2e8f0', minWidth: '130px', height: '38px' }}
                                >
                                    <option value="">All Priorities</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>

                                <select
                                    className="form-select form-select-sm"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    style={{ borderRadius: '6px', borderColor: '#e2e8f0', minWidth: '130px', height: '38px' }}
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
                        <table className="listing-table">
                            <thead>
                                <tr>
                                    <th>Ticket ID</th>
                                    <th>Subject</th>
                                    <th>User</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Last Updated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" className="text-center">Loading...</td></tr>
                                ) : tickets.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center" style={{ padding: '50px' }}>No tickets found</td></tr>
                                ) : (
                                    tickets.map(ticket => (
                                        <tr key={ticket.id}>
                                            <td><span className="plan-name-text">#{ticket.ticket_number}</span></td>
                                            <td>{ticket.subject}</td>
                                            <td>
                                                <div className="plan-info-cell">
                                                    <span className="plan-name-text" style={{ fontSize: '14px' }}>{ticket.user_name}</span>
                                                    <span className="plan-slug-text">{ticket.user_email}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`plan-type-badge`} style={{
                                                    background: ticket.priority === 'high' ? '#ffebee' : ticket.priority === 'medium' ? '#fff3e0' : '#e3f2fd',
                                                    color: ticket.priority === 'high' ? '#c62828' : ticket.priority === 'medium' ? '#ef6c00' : '#1565c0'
                                                }}>
                                                    {ticket.priority}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="plan-type-badge" style={{
                                                    background: ticket.status === 'open' ? '#e8f5e9' : ticket.status === 'closed' ? '#eceff1' : '#e3f2fd',
                                                    color: ticket.status === 'open' ? '#2e7d32' : ticket.status === 'closed' ? '#546e7a' : '#1565c0'
                                                }}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td>{formatDate(ticket.updated_at)}</td>
                                            <td>
                                                <div className="actions-cell">
                                                    <Link to={`/tickets/${ticket.id}`} className="action-btn" title="View Ticket">
                                                        <i className="far fa-eye"></i>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {tickets.length > 0 && (
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={Math.ceil(pagination.total / pagination.limit)}
                                onPageChange={(newPage) => {
                                    setPagination(prev => ({ ...prev, page: newPage }));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminTickets;
