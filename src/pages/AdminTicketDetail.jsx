import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import ticketService from '../services/ticket.service';
import { authService } from '../services/auth.service';
import { toast } from 'react-toastify';
import { useSocket } from '../context/SocketContext';
import {
    ArrowLeft,
    MessageSquare,
    User,
    Calendar,
    Tag,
    Hash,
    Send,
    Paperclip,
    X,
    Clock,
    CheckCircle,
    AlertCircle,
    Lock,
    UserCheck,
    Briefcase
} from 'lucide-react';
import SEO from '../components/common/SEO';
import './styles/TicketDetail.css';
import './styles/AdminListings.css';

const AdminTicketDetail = () => {
    const { socket } = useSocket();
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [updating, setUpdating] = useState(false);
    const user = authService.getUser();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchTicketDetails();

        if (socket) {
            socket.emit('join_chat', id);

            socket.on('new_message', (message) => {
                setMessages(prev => {
                    if (prev.some(m => m.id === message.id || m._id === message._id)) return prev;
                    return [...prev, message];
                });
                setTimeout(scrollToBottom, 100);
            });

            return () => {
                socket.off('new_message');
            };
        }
    }, [id, socket]);

    useEffect(() => {
        if (!loading) {
            scrollToBottom();
        }
    }, [messages, loading]);

    const fetchTicketDetails = async () => {
        try {
            setLoading(true);
            const response = await ticketService.getTicket(id);
            if (response.success) {
                setTicket(response.data);
                setMessages(response.data.messages || []);
            } else {
                toast.error('Ticket not found');
            }
        } catch (err) {
            toast.error('Failed to load ticket details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            setSending(true);
            const response = await ticketService.addMessage(id, newMessage);
            if (response.success) {
                setNewMessage('');
                // The socket will handle adding the message to the list usually, 
                // but let's refresh to be sure or depend on socket
                await fetchTicketDetails();
                toast.success('Reply sent successfully');
            }
        } catch (err) {
            toast.error('Failed to send reply');
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            setUpdating(true);
            const response = await ticketService.updateStatus(id, newStatus);
            if (response.success) {
                setTicket(prev => ({ ...prev, status: newStatus }));
                toast.success(`Ticket status updated to ${newStatus.replace('_', ' ')}`);
            }
        } catch (err) {
            toast.error('Failed to update status');
            console.error(err);
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (dateString, withTime = true) => {
        if (!dateString) return 'N/A';
        const dateStr = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
        const date = new Date(dateStr);
        return date.toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...(withTime && { hour: '2-digit', minute: '2-digit' })
        });
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'open': return 'premium-badge-success';
            case 'in_progress': return 'premium-badge-primary';
            case 'resolved': return 'premium-badge-info';
            case 'closed': return 'premium-badge-secondary';
            default: return 'premium-badge-secondary';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'open': return <CheckCircle size={14} className="me-1" />;
            case 'in_progress': return <Clock size={14} className="me-1" />;
            case 'resolved': return <CheckCircle size={14} className="me-1" />;
            case 'closed': return <Lock size={14} className="me-1" />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="admin-listing-page">
                    <div className="admin-container">
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!ticket) {
        return (
            <DashboardLayout>
                <div className="admin-listing-page">
                    <div className="admin-container">
                        <div className="text-center py-5">
                            <AlertCircle size={48} className="text-danger mb-3" />
                            <h2>Ticket not found</h2>
                            <Link to="/admin/tickets" className="tj-btn tj-btn-primary mt-3">
                                Back to Tickets
                            </Link>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <SEO title={`Ticket #${ticket.ticket_number || id.substring(0, 8)}`} />
            <div className="admin-listing-page animate-fade-up">
                <div className="admin-container">
                    {/* Header */}
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <div className="d-flex align-items-center gap-3">
                                <Link to="/admin/tickets" className="action-btn">
                                    <ArrowLeft size={18} />
                                </Link>
                                <div>
                                    <h1 className="mb-0">Ticket Details</h1>
                                    <p className="text-muted mb-0">Managing support request #{ticket.ticket_number || ticket._id?.substring(0, 8).toUpperCase()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="header-actions">
                            <select
                                className="custom-select"
                                value={ticket.status}
                                onChange={(e) => handleUpdateStatus(e.target.value)}
                                disabled={updating}
                            >
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    <div className="row g-4">
                        {/* Left Column: Ticket Content & Chat */}
                        <div className="col-lg-8">
                            <div className="listing-table-container mb-4">
                                <div className="ticket-main-content">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h2 className="h4 fw-bold mb-0">{ticket.subject}</h2>
                                        <span className={`premium-badge ${getStatusBadgeClass(ticket.status)}`}>
                                            {getStatusIcon(ticket.status)}
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="ticket-description bg-light p-3 rounded-3 mb-4">
                                        <p className="mb-0 text-dark" style={{ whiteSpace: 'pre-wrap' }}>
                                            {ticket.message || ticket.description}
                                        </p>
                                    </div>

                                    {ticket.attachments && ticket.attachments.length > 0 && (
                                        <div className="ticket-attachments mb-2">
                                            <div className="small fw-bold text-muted text-uppercase mb-2">Attachments</div>
                                            <div className="d-flex flex-wrap gap-2">
                                                {ticket.attachments.map((att, idx) => (
                                                    <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer" className="attachment-pill">
                                                        <Paperclip size={14} className="me-1" />
                                                        <span className="small">{att.name}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="listing-table-container">
                                <div className="d-flex align-items-center gap-2 mb-4">
                                    <MessageSquare size={20} className="text-primary" />
                                    <h3 className="h5 fw-bold mb-0">Conversation History</h3>
                                </div>

                                <div className="admin-chat-container" style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
                                    {messages.map((msg, index) => (
                                        <div key={index} className={`chat-message ${msg.is_admin_reply ? 'admin-reply' : 'user-reply'} mb-4`}>
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <span className="fw-bold small text-dark">
                                                    {msg.is_admin_reply ? 'Support Team' : (ticket.user_name || 'User')}
                                                </span>
                                                <span className="text-muted small" style={{ fontSize: '11px' }}>
                                                    {formatDate(msg.created_at)}
                                                </span>
                                            </div>
                                            <div className={`message-bubble p-3 rounded-3 ${msg.is_admin_reply ? 'bg-primary-subtle text-dark border-start border-primary border-4' : 'bg-light text-dark'}`}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    ))}
                                    {messages.length === 0 && (
                                        <div className="text-center py-4 text-muted small">
                                            No messages yet.
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {ticket.status !== 'closed' && (
                                    <div className="reply-form-container mt-4 pt-4 border-top">
                                        <form onSubmit={handleSendMessage}>
                                            <div className="form-group mb-3">
                                                <label className="small fw-bold text-uppercase text-muted">Post a Reply</label>
                                                <textarea
                                                    className="form-control"
                                                    rows="4"
                                                    placeholder="Type your response here..."
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    required
                                                    style={{ resize: 'none', borderRadius: '12px' }}
                                                ></textarea>
                                            </div>
                                            <div className="d-flex justify-content-end">
                                                <button
                                                    type="submit"
                                                    className="tj-btn tj-btn-primary"
                                                    disabled={sending || !newMessage.trim()}
                                                >
                                                    <Send size={16} className="me-2" />
                                                    {sending ? 'Sending...' : 'Send Reply'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {ticket.status === 'closed' && (
                                    <div className="alert alert-secondary mt-4 mb-0 d-flex align-items-center gap-2 rounded-3">
                                        <Lock size={16} />
                                        <span className="small">This ticket is closed. Re-open to send more messages.</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Sidebar Info */}
                        <div className="col-lg-4">
                            <div className="listing-table-container mb-4">
                                <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                                    <User size={18} className="text-primary" />
                                    <h4 className="h6 fw-bold mb-0">User Information</h4>
                                </div>
                                <div className="user-details">
                                    <div className="d-flex flex-column gap-3">
                                        <div className="detail-item">
                                            <div className="text-muted small mb-0">Full Name</div>
                                            <div className="fw-bold text-dark">{ticket.user_name || 'Unknown'}</div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="text-muted small mb-0">Email Address</div>
                                            <div className="fw-bold text-dark">{ticket.user_email || 'N/A'}</div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="text-muted small mb-0">User ID</div>
                                            <div className="text-muted small font-monospace">{ticket.user_id || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="listing-table-container">
                                <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                                    <Tag size={18} className="text-primary" />
                                    <h4 className="h6 fw-bold mb-0">Ticket Information</h4>
                                </div>
                                <div className="ticket-details">
                                    <div className="d-flex flex-column gap-3">
                                        <div className="detail-item">
                                            <div className="text-muted small mb-1">Ticket ID</div>
                                            <div className="d-flex align-items-center gap-2">
                                                <Hash size={14} className="text-primary" />
                                                <span className="fw-bold text-primary">#{ticket.ticket_number || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="text-muted small mb-1">Created Date</div>
                                            <div className="d-flex align-items-center gap-2">
                                                <Calendar size={14} className="text-muted" />
                                                <span className="text-dark fw-medium">{formatDate(ticket.created_at)}</span>
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="text-muted small mb-1">Category</div>
                                            <div className="d-flex align-items-center gap-2">
                                                <Briefcase size={14} className="text-muted" />
                                                <span className="text-dark fw-medium text-capitalize">{ticket.category || 'General'}</span>
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="text-muted small mb-1">Priority</div>
                                            <span className={`premium-badge ${ticket.priority === 'high' ? 'premium-badge-danger' :
                                                    ticket.priority === 'medium' ? 'premium-badge-warning' :
                                                        'premium-badge-info'
                                                }`}>
                                                {ticket.priority || 'Medium'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .chat-message .message-bubble {
                    line-height: 1.6;
                    font-size: 14px;
                }
                .admin-reply .message-bubble {
                    background-color: #f0f7ff;
                    border-left: 4px solid #13689e;
                }
                .user-reply .message-bubble {
                    background-color: #f8fafc;
                    border-left: 4px solid #cbd5e1;
                }
                .attachment-pill {
                    display: inline-flex;
                    align-items: center;
                    padding: 4px 12px;
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    border-radius: 50px;
                    color: #475569;
                    text-decoration: none;
                    transition: all 0.2s;
                }
                .attachment-pill:hover {
                    background: #e2e8f0;
                    color: #1e293b;
                }
                .detail-item .fw-bold {
                    font-size: 14px;
                }
            `}</style>
        </DashboardLayout>
    );
};

export default AdminTicketDetail;
