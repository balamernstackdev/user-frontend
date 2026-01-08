import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import ticketService from '../services/ticket.service';
import { authService } from '../services/auth.service';
// import './styles/TicketDetail.css';
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
                    // Avoid duplicates if fetch and socket happen together
                    if (prev.some(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });

                // Scroll to bottom
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
            // Assuming addMessage supports attachments, typically FormData.
            // For now passing message text. If/when backend supports files, logic goes here.
            await ticketService.addMessage(id, newMessage); // + files if supported

            setNewMessage('');
            setReplyFiles([]);
            await fetchTicketDetails(); // Refresh to show new message
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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        // Ensure date is treated as UTC if it lacks timezone info
        const dateStr = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
        const date = new Date(dateStr);
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
                    <div className="card border-0 shadow-sm p-4 rounded-4 animate-fade-up">
                        <div className="mb-4">
                            <Link to="/tickets" className="text-decoration-none text-muted small fw-medium d-inline-flex align-items-center hover-opacity">
                                <i className="fas fa-arrow-left me-2"></i>
                                <span>Back to Tickets</span>
                            </Link>
                        </div>

                        <div className="d-flex flex-column flex-lg-row justify-content-between gap-4 mb-4 pb-4 border-bottom">
                            <div className="ticket-header-left">
                                <h1 className="h2 fw-bold text-dark mb-3">{ticket.subject}</h1>
                                <div className="d-flex flex-wrap gap-3 text-muted small">
                                    <span className="d-inline-flex align-items-center bg-light px-3 py-2 rounded-pill">
                                        <i className="fas fa-hashtag me-2 text-primary"></i>
                                        <span className="font-monospace">#{ticket.ticket_number || ticket._id?.substring(0, 8).toUpperCase()}</span>
                                    </span>
                                    <span className="d-inline-flex align-items-center bg-light px-3 py-2 rounded-pill">
                                        <i className="far fa-calendar me-2 text-primary"></i>
                                        <span>{formatDate(ticket.created_at)}</span>
                                    </span>
                                    {ticket.category && (
                                        <span className="d-inline-flex align-items-center bg-light px-3 py-2 rounded-pill">
                                            <i className="fas fa-tag me-2 text-primary"></i>
                                            <span>{ticket.category}</span>
                                        </span>
                                    )}
                                    <span className="d-inline-flex align-items-center bg-light px-3 py-2 rounded-pill">
                                        <i className="fas fa-exclamation-circle me-2 text-primary"></i>
                                        <span style={{ textTransform: 'capitalize' }}>Priority: {ticket.priority}</span>
                                    </span>
                                </div>
                            </div>
                            <div className="ticket-header-actions d-flex align-items-start gap-3">
                                {user?.role === 'admin' ? (
                                    <div className="status-dropdown-container">
                                        <select
                                            className={`form-select form-select-sm fw-bold border-0 bg-${ticket.status === 'open' ? 'primary' : ticket.status === 'resolved' ? 'success' : 'secondary'}-subtle text-${ticket.status === 'open' ? 'primary' : ticket.status === 'resolved' ? 'success' : 'secondary'}`}
                                            value={ticket.status}
                                            onChange={async (e) => {
                                                const newStatus = e.target.value;
                                                try {
                                                    await ticketService.updateStatus(id, newStatus);
                                                    setTicket(prev => ({ ...prev, status: newStatus }));
                                                    toast.success('Status updated');
                                                } catch (err) {
                                                    toast.error('Failed to update status');
                                                }
                                            }}
                                            style={{ borderRadius: '20px', paddingRight: '2rem' }}
                                        >
                                            <option value="open">Open</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                ) : (
                                    <span className={`badge rounded-pill px-3 py-2 bg-${ticket.status === 'open' ? 'primary' : ticket.status === 'resolved' ? 'success' : 'secondary'}-subtle text-${ticket.status === 'open' ? 'primary' : ticket.status === 'resolved' ? 'success' : 'secondary'} text-uppercase`}>
                                        {ticket.status.replace('_', ' ')}
                                    </span>
                                )}

                                {ticket.status !== 'closed' && (
                                    <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={handleCloseTicket}>
                                        Close Ticket
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="ticket-content mb-5">
                            <div className="ticket-content-body p-4 bg-light rounded-3 mb-3">
                                <p className="mb-0 text-dark">{ticket.message || ticket.description}</p>
                            </div>

                            {/* Attachments if any */}
                            {ticket.attachments && ticket.attachments.length > 0 && (
                                <div className="ticket-attachments">
                                    <div className="fw-bold small text-muted mb-2 text-uppercase">Attachments</div>
                                    <div className="d-flex flex-wrap gap-2">
                                        {ticket.attachments.map((att, idx) => (
                                            <a key={idx} href={att.url} className="btn btn-white border btn-sm d-inline-flex align-items-center gap-2" target="_blank" rel="noopener noreferrer">
                                                <i className={`far ${getFileIcon(att.name)} text-primary`}></i>
                                                <span>{att.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="conversation-section">
                            <h3 className="h5 fw-bold mb-4 d-flex align-items-center">
                                <span className="bg-primary rounded-circle p-1 me-2" style={{ width: '8px', height: '8px' }}></span>
                                Conversation
                            </h3>

                            <div className="d-flex flex-column gap-4 mb-5">
                                {messages.map((message, index) => (
                                    <div key={index} className={`d-flex gap-3 ${message.is_admin_reply ? 'flex-row-reverse' : ''}`}>
                                        <div className={`flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center text-white fw-bold ${message.is_admin_reply ? 'bg-primary' : 'bg-secondary'}`} style={{ width: '40px', height: '40px' }}>
                                            {message.is_admin_reply ? 'ST' : (user?.firstname?.charAt(0) || 'U')}
                                        </div>
                                        <div className={`flex-grow-1 ${message.is_admin_reply ? 'text-end' : ''}`}>
                                            <div className="mb-1">
                                                <span className="fw-bold text-dark me-2">
                                                    {message.is_admin_reply
                                                        ? 'Support Team'
                                                        : (user?.role === 'admin' ? (ticket.user_name || 'Customer') : 'You')}
                                                </span>
                                                <small className="text-muted">{formatDate(message.created_at)}</small>
                                            </div>
                                            <div className={`d-inline-block p-3 rounded-3 text-start ${message.is_admin_reply ? 'bg-primary-subtle text-dark' : 'bg-light text-dark'}`} style={{ maxWidth: '85%' }}>
                                                <p className="mb-0">{message.message}</p>
                                            </div>
                                            {/* Message attachments if any (assuming structure) */}
                                            {message.attachments && message.attachments.length > 0 && (
                                                <div className={`mt-2 d-flex flex-wrap gap-2 ${message.is_admin_reply ? 'justify-content-end' : ''}`}>
                                                    {message.attachments.map((att, idx) => (
                                                        <a key={idx} href={att.url || '#'} className="btn btn-white border btn-sm d-inline-flex align-items-center gap-2 bg-white" target="_blank" rel="noopener noreferrer">
                                                            <i className={`far ${getFileIcon(att.name || 'file')} text-primary`}></i>
                                                            <span className="small">{att.name || 'Attachment'}</span>
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {messages.length === 0 && <p className="text-center text-muted py-4 small">No conversation history yet.</p>}
                            </div>

                            {ticket.status !== 'closed' && (
                                <div className="reply-form bg-light p-4 rounded-4">
                                    <h4 className="h6 fw-bold mb-3">Add Reply</h4>
                                    <form onSubmit={handleSendMessage}>
                                        <div className="mb-3">
                                            <label htmlFor="replyMessage" className="form-label visually-hidden">Your Message</label>
                                            <textarea
                                                id="replyMessage"
                                                className="form-control border-0 shadow-sm"
                                                rows="4"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type your reply here..."
                                                required={replyFiles.length === 0}
                                                style={{ resize: 'none' }}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <div
                                                className="border-2 border-dashed rounded-3 p-4 text-center cursor-pointer bg-white"
                                                onClick={() => fileInputRef.current.click()}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                                style={{ borderColor: '#dee2e6' }}
                                            >
                                                <i className="fas fa-cloud-upload-alt text-primary mb-2 fs-4"></i>
                                                <div className="small fw-medium text-dark">Click to upload or drag and drop</div>
                                                <div className="small text-muted mt-1">PNG, JPG, PDF up to 10MB</div>
                                                <input
                                                    type="file"
                                                    id="fileInput"
                                                    ref={fileInputRef}
                                                    className="d-none"
                                                    multiple
                                                    accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                                                    onChange={handleFileSelect}
                                                />
                                            </div>
                                            {replyFiles.length > 0 && (
                                                <div className="mt-3 d-flex flex-column gap-2">
                                                    {replyFiles.map((file, idx) => (
                                                        <div key={idx} className="d-flex align-items-center justify-content-between p-2 bg-white rounded border shadow-sm">
                                                            <div className="d-flex align-items-center overflow-hidden">
                                                                <i className={`far ${getFileIcon(file.name)} text-muted me-2`}></i>
                                                                <span className="small text-truncate">{file.name}</span>
                                                            </div>
                                                            <button type="button" className="btn btn-link btn-sm text-danger p-0" onClick={() => handleRemoveFile(file.name)}>
                                                                <i className="fas fa-times"></i>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-end">
                                            <button type="submit" className="tj-primary-btn" disabled={sending}>
                                                <span className="btn-text"><span>{sending ? 'Sending...' : 'Send Reply'}</span></span>
                                                {!sending && <span className="btn-icon"><i className="fas fa-paper-plane"></i></span>}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {ticket.status === 'closed' && (
                                <div className="alert alert-secondary d-flex align-items-center rounded-3 border-0 bg-secondary-subtle" role="alert">
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
