import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import ticketService from '../services/ticket.service';
import { authService } from '../services/auth.service';
import './styles/TicketDetail.css';
import { toast } from 'react-toastify';

import { useSocket } from '../context/SocketContext';

const TicketDetail = () => {
    const { socket } = useSocket();
    const { settings } = useSettings();
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [replyFiles, setReplyFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const user = authService.getUser();
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchTicketDetails();

        if (socket) {
            socket.emit('join_chat', id);

            socket.on('new_message', (message) => {
                setMessages(prev => {
                    if (prev.some(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });

                setTimeout(() => {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }, 100);
            });

            return () => {
                socket.off('new_message');
            };
        }
    }, [id, socket]);

    const fetchTicketDetails = async () => {
        try {
            setLoading(true);
            const response = await ticketService.getTicket(id);
            setTicket(response.data);
            setMessages(response.data.messages || []);
        } catch (err) {
            toast.error('Failed to load ticket details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const processFiles = (files) => {
        const validFiles = files.filter(file => {
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
                return false;
            }
            return true;
        });
        setReplyFiles(prev => [...prev, ...validFiles]);
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(Array.from(e.target.files));
        }
    };

    const handleRemoveFile = (fileName) => {
        setReplyFiles(prev => prev.filter(file => file.name !== fileName));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && replyFiles.length === 0) return;

        try {
            setSending(true);
            await ticketService.addMessage(id, newMessage);

            setNewMessage('');
            setReplyFiles([]);
            await fetchTicketDetails();
            toast.success('Message reply sent');
        } catch (err) {
            toast.error('Failed to send message');
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    const handleCloseTicket = async () => {
        if (!window.confirm('Are you sure you want to close this ticket?')) return;

        try {
            await ticketService.closeTicket(id);
            toast.success('Ticket closed successfully');
            navigate('/tickets');
        } catch (err) {
            toast.error('Failed to close ticket');
            console.error(err);
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

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) return 'fa-image';
        if (ext === 'pdf') return 'fa-file-pdf';
        if (['doc', 'docx'].includes(ext)) return 'fa-file-word';
        return 'fa-file';
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
                        <Link to="/tickets" className="tj-primary-btn" style={{ display: 'inline-flex' }}>
                            <span className="btn-text">Back to Tickets</span>
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <section className="page-section">
                <div className="container">
                    <Link to="/tickets" className="back-button">
                        <i className="fas fa-arrow-left"></i>
                        <span>Back to Tickets</span>
                    </Link>

                    <div className="ticket-detail-card">
                        <div className="ticket-header">
                            <div className="ticket-header-content w-100">
                                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                                    <h1 className="mb-0">{ticket.subject}</h1>
                                    <div className="ticket-header-actions">
                                        <span className={`ticket-status-badge ${ticket.status}`}>
                                            {ticket.status.toUpperCase()}
                                        </span>
                                        {ticket.status !== 'closed' && (
                                            <button className="close-ticket-btn" onClick={handleCloseTicket}>
                                                Close Ticket
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="ticket-meta">
                                    <span className="meta-item">
                                        <i className="fas fa-hashtag"></i>
                                        <span>#{ticket.ticket_number || ticket._id?.substring(0, 8).toUpperCase()}</span>
                                    </span>
                                    <span className="meta-item">
                                        <i className="far fa-calendar"></i>
                                        <span>Created: {formatDate(ticket.created_at, false)}</span>
                                    </span>
                                    <span className="meta-item">
                                        <i className="fas fa-tag"></i>
                                        <span>{ticket.category || 'General'}</span>
                                    </span>
                                    <span className="meta-item">
                                        <i className="fas fa-user"></i>
                                        <span>Assigned to: Support Team</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="ticket-content">
                            <div className="ticket-content-body">
                                <p>{ticket.message || ticket.description}</p>
                            </div>

                            {ticket.attachments && ticket.attachments.length > 0 && (
                                <div className="ticket-attachments">
                                    <div className="attachments-title">Attachments</div>
                                    <div className="attachment-pills">
                                        {ticket.attachments.map((att, idx) => (
                                            <a key={idx} href={att.url} className="attachment-pill" target="_blank" rel="noopener noreferrer">
                                                <i className={`fas ${getFileIcon(att.name)}`}></i>
                                                <span>{att.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="conversation-section">
                            <h3 className="conversation-title">Conversation</h3>

                            <div className="conversation-list">
                                {messages.map((message, index) => (
                                    <div key={index} className={`reply-item ${message.is_admin_reply ? 'admin-msg' : 'customer-msg'}`}>
                                        <div className="reply-header">
                                            <div className="reply-author">
                                                <div className="reply-avatar">
                                                    {message.is_admin_reply ? 'ST' : (user?.firstname?.charAt(0) || 'U')}
                                                </div>
                                                <div className="reply-author-info">
                                                    <h4>{message.is_admin_reply ? 'Support Team' : 'You'}</h4>
                                                    <span>{message.is_admin_reply ? 'Staff' : 'Customer'}</span>
                                                </div>
                                            </div>
                                            <div className="reply-time">{formatDate(message.created_at)}</div>
                                        </div>
                                        <div className="reply-content">
                                            {message.message}
                                        </div>
                                        {message.attachments && message.attachments.length > 0 && (
                                            <div className="attachment-pills mt-3">
                                                {message.attachments.map((att, idx) => (
                                                    <a key={idx} href={att.url || '#'} className="attachment-pill" target="_blank" rel="noopener noreferrer">
                                                        <i className={`fas ${getFileIcon(att.name || 'file')}`}></i>
                                                        <span className="small">{att.name || 'Attachment'}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {messages.length === 0 && <p className="text-center text-muted py-4 small">No conversation history yet.</p>}
                            </div>

                            {ticket.status !== 'closed' && (
                                <div className="reply-form">
                                    <h4 className="reply-form-title">Add Reply</h4>
                                    <form onSubmit={handleSendMessage}>
                                        <div className="mb-4">
                                            <label className="form-label">Your Message</label>
                                            <textarea
                                                className="form-control-reply"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type your reply here..."
                                                required={replyFiles.length === 0}
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <div
                                                className="file-upload-box"
                                                onClick={() => fileInputRef.current.click()}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                            >
                                                <i className="fas fa-cloud-upload-alt"></i>
                                                <div className="file-upload-text">Click to upload or drag and drop</div>
                                                <div className="file-upload-subtext">PNG, JPG, PDF up to 10MB</div>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="d-none"
                                                    multiple
                                                    accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                                                    onChange={handleFileSelect}
                                                />
                                            </div>
                                            {replyFiles.length > 0 && (
                                                <div className="attachment-pills">
                                                    {replyFiles.map((file, idx) => (
                                                        <div key={idx} className="attachment-pill">
                                                            <i className={`fas ${getFileIcon(file.name)}`}></i>
                                                            <span className="small text-truncate" style={{ maxWidth: '150px' }}>{file.name}</span>
                                                            <i className="fas fa-times remove-attachment" onClick={() => handleRemoveFile(file.name)}></i>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-end">
                                            <button type="submit" className="tj-primary-btn" disabled={sending}>
                                                <span className="btn-text">{sending ? 'Sending...' : 'Send Reply'}</span>
                                                {!sending && <span className="btn-icon"><i className="fas fa-paper-plane"></i></span>}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {ticket.status === 'closed' && (
                                <div className="alert alert-secondary d-flex align-items-center rounded-3 border-0 bg-secondary-subtle mt-4" role="alert">
                                    <i className="fas fa-lock me-2"></i>
                                    <div>This ticket has been closed. Please create a new ticket if you need further assistance.</div>
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
