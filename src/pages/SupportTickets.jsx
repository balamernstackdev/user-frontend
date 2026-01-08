import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Pagination from '../components/common/Pagination';
import SEO from '../components/common/SEO';
import ticketService from '../services/ticket.service';
import './styles/SupportTickets.css';
import { toast } from 'react-toastify';

const SupportTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const LIMIT = 5;
    const navigate = useNavigate();

    useEffect(() => {
        fetchTickets();
    }, [filter, page]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const offset = (page - 1) * LIMIT;
            const params = {
                limit: LIMIT,
                offset,
                ...(filter !== 'all' && { status: filter })
            };
            const response = await ticketService.getMyTickets(params);
            if (response.pagination) {
                setTickets(response.data);
                setTotalPages(response.pagination.pages);
            } else if (Array.isArray(response.data)) {
                // Fallback for stale backend
                const allData = response.data;
                const startIndex = (page - 1) * LIMIT;
                const endIndex = startIndex + LIMIT;
                const paginatedData = allData.slice(startIndex, endIndex);

                setTickets(paginatedData);
                setTotalPages(Math.ceil(allData.length / LIMIT));
            } else {
                setTickets(response.data);
            }
        } catch (err) {
            toast.error('Failed to load tickets');
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
        // Ensure date is treated as UTC if it lacks timezone info
        const dateStr = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <DashboardLayout>
            <SEO title="Support Tickets" description="View and manage your support tickets." />
            <section className="page-section">
                <div className="container">
                    <div className="page-header">
                        <div>
                            <h2>My Tickets</h2>
                            <p style={{ color: '#6c757d' }}>Manage your support tickets</p>
                        </div>
                        <Link to="/tickets/create" className="tj-primary-btn">
                            <span className="btn-text"><span>Create Ticket</span></span>
                            <span className="btn-icon"><i className="fas fa-arrow-right"></i></span>
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
                            ) : tickets.length > 0 ? (
                                <div className="bg-white rounded-4 shadow-sm overflow-hidden border-0">
                                    {tickets.map((ticket, index) => {
                                        const statusConfig = {
                                            'open': { border: '#0d6efd', badge: 'bg-primary-subtle text-primary' },
                                            'in_progress': { border: '#0dcaf0', badge: 'bg-info-subtle text-info-emphasis' },
                                            'resolved': { border: '#198754', badge: 'bg-success-subtle text-success' },
                                            'closed': { border: '#6c757d', badge: 'bg-secondary-subtle text-secondary' }
                                        };
                                        const config = statusConfig[ticket.status] || statusConfig['open'];

                                        return (
                                            <div
                                                key={ticket.id}
                                                className={`p-4 ${index !== tickets.length - 1 ? 'border-bottom' : ''}`}
                                                onClick={() => navigate(`/tickets/${ticket.id}`)}
                                                style={{ cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: `4px solid ${config.border}` }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                                            >
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <span className="badge bg-light text-secondary border mb-2 font-monospace">#{ticket.ticket_number || ticket.id.slice(0, 8).toUpperCase()}</span>
                                                        <h5 className="mb-1 fw-bold text-dark">{ticket.subject}</h5>
                                                    </div>
                                                    <span className={`badge rounded-pill ${config.badge}`}>
                                                        {ticket.status === 'in_progress' ? 'In Progress' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                                                    </span>
                                                </div>
                                                <p className="text-muted mb-3 small text-truncate" style={{ maxWidth: '800px' }}>
                                                    {ticket.message_preview || ticket.description || 'No description available.'}
                                                </p>
                                                <div className="d-flex flex-wrap gap-3 text-muted small">
                                                    <span><i className="far fa-calendar-alt me-1"></i> {formatDate(ticket.created_at)}</span>
                                                    <span><i className="fas fa-tag me-1"></i> {ticket.category || 'General'}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
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
                        {/* Pagination */}
                        {!loading && tickets.length > 0 && (
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={(newPage) => {
                                    setPage(newPage);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            />
                        )}
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default SupportTickets;
