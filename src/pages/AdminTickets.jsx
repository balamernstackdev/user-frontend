import { useState, useEffect } from 'react';
import ticketService from '../services/ticket.service';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Pagination from '../components/common/Pagination';
import './AdminListings.css';

const AdminTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0 });

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const params = {
                status: statusFilter,
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
    }, [pagination.page, statusFilter]);

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
            <div className="admin-listing-page animate-fade-up">
                <div className="container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Support Tickets</h1>
                            <p style={{ color: '#6c757d' }}>Manage user support requests</p>
                        </div>
                        <div className="header-actions">
                            <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '200px' }}>
                                <option value="">All Status</option>
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
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
