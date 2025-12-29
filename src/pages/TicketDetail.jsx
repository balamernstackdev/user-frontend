import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import ticketService from '../services/ticket.service';
import { authService } from '../services/auth.service';
import './TicketDetail.css';

const TicketDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [replyFiles, setReplyFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const user = authService.getUser();
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchTicketDetails();
    }, [id]);

    const fetchTicketDetails = async () => {
        try {
            setLoading(true);
            const response = await ticketService.getTicket(id);
            setTicket(response.data);
            setMessages(response.data.messages || []);
        } catch (err) {
            setError('Failed to load ticket details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const validFiles = files.filter(file => {
                if (file.size > 10 * 1024 * 1024) {
                    alert(`File ${file.name} is too large. Maximum size is 10MB.`);
                    return false;
                }
                return true;
            });
            setReplyFiles(prev => [...prev, ...validFiles]);
        }
    };

    const handleRemoveFile = (fileName) => {
        setReplyFiles(prev => prev.filter(file => file.name !== fileName));
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && replyFiles.length === 0) return;

        try {
            setSending(true);
            // Assuming addMessage supports attachments, typically FormData.
            // For now passing message text. If/when backend supports files, logic goes here.
            await ticketService.addMessage(id, newMessage); // + files if supported

            setNewMessage('');
            setReplyFiles([]);
            await fetchTicketDetails(); // Refresh to show new message
        } catch (err) {
            setError('Failed to send message');
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    const handleCloseTicket = async () => {
        if (!window.confirm('Are you sure you want to close this ticket?')) return;

        try {
            await ticketService.closeTicket(id);
            navigate('/tickets');
        } catch (err) {
            setError('Failed to close ticket');
            console.error(err);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) return 'fa-image';
        if (ext === 'pdf') return 'fa-file-pdf';
        if (['doc', 'docx'].includes(ext)) return 'fa-file-word';
        return 'fa-file';
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="container">
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!ticket) {
        return (
            <DashboardLayout>
                <div className="container">
                    <div style={{ textAlign: 'center', padding: '100px 0', color: '#dc3545' }}>
                        <h2>Ticket not found</h2>
                        <Link to="/tickets" className="btn btn-primary mt-3">Back to Tickets</Link>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <section className="page-section">
                <div className="container">
                    <div className="ticket-detail-card animate-fade-up">
                        <Link to="/tickets" className="back-button">
                            <i className="fa-light fa-arrow-left"></i>
                            <span>Back to Tickets</span>
                        </Link>

                        <div className="ticket-header">
                            <div className="ticket-header-left">
                                <h1>{ticket.subject}</h1>
                                <div className="ticket-meta">
                                    <span className="meta-item">
                                        <i className="fa-light fa-hashtag"></i>
                                        <span>#{ticket.ticket_number || ticket._id?.substring(0, 8).toUpperCase()}</span>
                                    </span>
                                    <span className="meta-item">
                                        <i className="fa-light fa-calendar"></i>
                                        <span>Created: {formatDate(ticket.created_at)}</span>
                                    </span>
                                    {ticket.category && (
                                        <span className="meta-item">
                                            <i className="fa-light fa-tag"></i>
                                            <span>{ticket.category}</span>
                                        </span>
                                    )}
                                    <span className="meta-item">
                                        <i className="fa-light fa-exclamation-circle"></i>
                                        <span style={{ textTransform: 'capitalize' }}>Priority: {ticket.priority}</span>
                                    </span>
                                </div>
                            </div>
                            <span className={`ticket-status ${ticket.status}`}>{ticket.status.replace('_', ' ')}</span>

                            {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
                                <button className="btn btn-danger-outline" onClick={handleCloseTicket}>
                                    Close Ticket
                                </button>
                            )}
                        </div>

                        {error && <div className="alert alert-error" style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

                        <div className="ticket-content">
                            <div className="ticket-content-body">
                                <p>{ticket.message || ticket.description}</p>
                            </div>

                            {/* Attachments if any */}
                            {ticket.attachments && ticket.attachments.length > 0 && (
                                <div className="ticket-attachments">
                                    <div className="attachments-title">Attachments</div>
                                    <div className="attachment-list">
                                        {ticket.attachments.map((att, idx) => (
                                            <a key={idx} href={att.url} className="attachment-item" target="_blank" rel="noopener noreferrer">
                                                <i className={`fa-light ${getFileIcon(att.name)} attachment-icon`}></i>
                                                <span className="attachment-name">{att.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="conversation-section">
                            <h3 className="conversation-title">Conversation</h3>

                            {messages.map((message, index) => (
                                <div key={index} className={`reply-item animate-fade-up ${message.is_admin_reply ? 'admin-message' : ''}`}>
                                    <div className="reply-header">
                                        <div className="reply-author">
                                            <div className="reply-avatar">
                                                {message.is_admin_reply ? 'ST' : (user?.firstname?.charAt(0) || 'U')}
                                            </div>
                                            <div className="reply-author-info">
                                                <h4>{message.is_admin_reply ? 'Support Team' : 'You'}</h4>
                                                <span>{message.is_admin_reply ? 'Stoxzo Support' : 'Customer'}</span>
                                            </div>
                                        </div>
                                        <span className="reply-time">{formatDate(message.created_at)}</span>
                                    </div>
                                    <div className="reply-content">
                                        <p>{message.message}</p>
                                    </div>
                                    {/* Message attachments if any (assuming structure) */}
                                    {message.attachments && message.attachments.length > 0 && (
                                        <div className="reply-attachments">
                                            <div className="attachment-list">
                                                {message.attachments.map((att, idx) => (
                                                    <a key={idx} href={att.url || '#'} className="attachment-item" target="_blank" rel="noopener noreferrer">
                                                        <i className={`fa-light ${getFileIcon(att.name || 'file')} attachment-icon`}></i>
                                                        <span className="attachment-name">{att.name || 'Attachment'}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {messages.length === 0 && <p className="text-muted">No messages yet.</p>}

                            {ticket.status !== 'closed' && (
                                <div className="reply-form animate-fade-up">
                                    <h4 className="reply-form-title">Add Reply</h4>
                                    <form onSubmit={handleSendMessage}>
                                        <div className="form-input">
                                            <label htmlFor="replyMessage">Your Message</label>
                                            <textarea
                                                id="replyMessage"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type your reply here..."
                                                required={replyFiles.length === 0}
                                            />
                                        </div>

                                        <div className="form-input">
                                            <label>Attachments (Optional)</label>
                                            <div
                                                className="file-upload-area"
                                                onClick={() => fileInputRef.current.click()}
                                            >
                                                <i className="fa-light fa-cloud-arrow-up" style={{ fontSize: '24px', color: '#1e8a8a', marginBottom: '10px' }}></i>
                                                <div className="file-upload-text">Click to upload files</div>
                                                <input
                                                    type="file"
                                                    id="fileInput"
                                                    ref={fileInputRef}
                                                    className="file-input"
                                                    multiple
                                                    accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                                                    onChange={handleFileSelect}
                                                    style={{ display: 'none' }}
                                                />
                                            </div>
                                            {replyFiles.length > 0 && (
                                                <div className="file-list" style={{ display: 'block' }}>
                                                    {replyFiles.map((file, idx) => (
                                                        <div key={idx} className="file-item">
                                                            <div className="file-item-info">
                                                                <div className="file-item-icon"><i className={`fa-light ${getFileIcon(file.name)}`}></i></div>
                                                                <div className="file-item-name">{file.name}</div>
                                                            </div>
                                                            <button type="button" className="file-item-remove" onClick={() => handleRemoveFile(file.name)}>
                                                                <i className="fa-light fa-times"></i>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-actions">
                                            <button type="submit" className="tj-primary-btn" disabled={sending}>
                                                <span className="btn-text"><span>{sending ? 'Sending...' : 'Send Reply'}</span></span>
                                                {!sending && <span className="btn-icon"><i className="tji-arrow-right-long"></i></span>}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {ticket.status === 'closed' && (
                                <div className="closed-notice">
                                    <p>This ticket has been closed. Please create a new ticket if you need further assistance.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default TicketDetail;
