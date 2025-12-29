import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import ticketService from '../services/ticket.service';
import './SupportTickets.css';

const SupportTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchTickets();
    }, [filter]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { status: filter } : {};
            const response = await ticketService.getMyTickets(params);
            setTickets(response.data);
        } catch (err) {
            setError('Failed to load tickets');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        const map = {
            'open': 'open',
            'in_progress': 'pending',
            'resolved': 'closed',
            'closed': 'closed'
        };
        return map[status] || 'pending';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <DashboardLayout>
            <section className="page-section">
                <div className="container">
                    <div className="page-header">
                        <div>
                            <h2>My Tickets</h2>
                            <p style={{ color: '#6c757d' }}>Manage your support tickets</p>
                        </div>
                        <Link to="/tickets/create" className="tj-primary-btn">
                            <span className="btn-text"><span>Create Ticket</span></span>
                            <span className="btn-icon"><i className="tji-arrow-right-long"></i></span>
                        </Link>
                    </div>

                    <div className="filter-bar">
                        {['all', 'open', 'in_progress', 'resolved', 'closed'].map(status => (
                            <button
                                key={status}
                                className={`filter-btn ${filter === status ? 'active' : ''}`}
                                onClick={() => setFilter(status)}
                            >
                                {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="row">
                        <div className="col-lg-12">
                            {loading ? (
                                <div className="text-center p-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="alert alert-error">{error}</div>
                            ) : tickets.length > 0 ? (
                                tickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        className={`ticket-card ${getStatusClass(ticket.status)}`}
                                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                                    >
                                        <div className="ticket-header">
                                            <div>
                                                <div className="ticket-id">#{ticket.ticket_number || ticket.id.slice(0, 8).toUpperCase()}</div>
                                                <div className="ticket-subject">{ticket.subject}</div>
                                            </div>
                                            <span className={`ticket-status ${getStatusClass(ticket.status)}`}>
                                                {ticket.status === 'in_progress' ? 'In Progress' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="ticket-description">
                                            {ticket.message_preview || ticket.description || 'No description available.'}
                                        </div>
                                        <div className="ticket-meta">
                                            <span><i className="fa-light fa-calendar"></i> Created: {formatDate(ticket.created_at)}</span>
                                            <span><i className="fa-light fa-clock"></i> Last Updated: {formatDate(ticket.updated_at)}</span>
                                            <span><i className="fa-light fa-user"></i> {ticket.category || 'General'}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center p-5" style={{ backgroundColor: '#fff', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎫</div>
                                    <h3>No support tickets</h3>
                                    <p style={{ color: '#6c757d' }}>You haven't created any support tickets yet.</p>
                                    <Link to="/tickets/create" className="tj-primary-btn" style={{ display: 'inline-flex', marginTop: '20px' }}>
                                        <span className="btn-text"><span>Create Your First Ticket</span></span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default SupportTickets;
