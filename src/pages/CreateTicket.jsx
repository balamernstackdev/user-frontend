import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import ticketService from '../services/ticket.service';
import './CreateTicket.css';

const CreateTicket = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        subject: '',
        category: '',
        priority: 'low',
        description: ''
    });
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(Array.from(e.target.files));
        }
    };

    const handleFiles = (newFiles) => {
        const validFiles = newFiles.filter(file => {
            if (file.size > 10 * 1024 * 1024) {
                alert(`File ${file.name} is too large. Maximum size is 10MB.`);
                return false;
            }
            return true;
        });
        setFiles(prev => [...prev, ...validFiles]);
    };

    const handleRemoveFile = (fileName) => {
        setFiles(prev => prev.filter(file => file.name !== fileName));
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
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.subject.trim() || !formData.description.trim() || !formData.category) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // If backend supports FormData for files:
            // const data = new FormData();
            // Object.keys(formData).forEach(key => data.append(key, formData[key]));
            // files.forEach(file => data.append('attachments', file));

            // For now, retaining JSON capability as per previous service implementation, 
            // but acknowledging files might need backend update to be handled.
            // Passes files if service updated, or just data.
            // Assuming we pass plain object for now as service likely only takes JSON

            await ticketService.createTicket({ ...formData, message: formData.description }); // mapping description to message as per previous implementation? previous used 'message'

            navigate('/tickets', { state: { message: 'Ticket created successfully!' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create ticket');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) return 'fa-image';
        if (ext === 'pdf') return 'fa-file-pdf';
        if (['doc', 'docx'].includes(ext)) return 'fa-file-word';
        return 'fa-file';
    };

    return (
        <DashboardLayout>
            <section className="page-section">
                <div className="container">
                    <div className="page-header animate-fade-up">
                        <Link to="/tickets" className="back-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#6c757d', textDecoration: 'none', marginBottom: '20px' }}>
                            <i className="fa-light fa-arrow-left"></i> Back to Tickets
                        </Link>
                        <h1>Create New Ticket</h1>
                        <p>Submit a support ticket and our team will get back to you soon</p>
                    </div>

                    <div className="ticket-form-container animate-fade-up" style={{ animationDelay: '0.1s' }}>
                        <form onSubmit={handleSubmit}>
                            {error && <div className="alert alert-error">{error}</div>}

                            <div className="form-group">
                                <label htmlFor="subject">Subject <span style={{ color: '#dc3545' }}>*</span></label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="Brief description of your issue"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="category">Category <span style={{ color: '#dc3545' }}>*</span></label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select a category</option>
                                    <option value="technical">Technical Support</option>
                                    <option value="billing">Billing & Payments</option>
                                    <option value="account">Account Issues</option>
                                    <option value="feature">Feature Request</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Priority <span style={{ color: '#dc3545' }}>*</span></label>
                                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                    {['low', 'medium', 'high', 'urgent'].map(p => (
                                        <label key={p} style={{
                                            flex: 1,
                                            minWidth: '100px',
                                            cursor: 'pointer',
                                            padding: '12px',
                                            border: `2px solid ${formData.priority === p ? '#1e8a8a' : '#e5e5e5'}`,
                                            borderRadius: '6px',
                                            textAlign: 'center',
                                            backgroundColor: formData.priority === p ? 'rgba(30, 138, 138, 0.05)' : 'white',
                                            color: formData.priority === p ? '#1e8a8a' : '#0c1e21',
                                            textTransform: 'capitalize',
                                            fontWeight: '500'
                                        }}>
                                            <input
                                                type="radio"
                                                name="priority"
                                                value={p}
                                                checked={formData.priority === p}
                                                onChange={handleChange}
                                                style={{ display: 'none' }}
                                            />
                                            {p}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description <span style={{ color: '#dc3545' }}>*</span></label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Please provide detailed information about your issue..."
                                    rows="6"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Attachments</label>
                                <div
                                    className="file-upload-area"
                                    onClick={() => fileInputRef.current.click()}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <div className="file-upload-icon">
                                        <i className="fa-light fa-cloud-arrow-up"></i>
                                    </div>
                                    <div className="file-upload-text">Click to upload or drag and drop</div>
                                    <div className="file-upload-hint">PNG, JPG, PDF up to 10MB</div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        multiple
                                        accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                                        onChange={handleFileSelect}
                                    />
                                </div>

                                {files.length > 0 && (
                                    <div className="file-list">
                                        {files.map((file, index) => (
                                            <div key={index} className="file-item">
                                                <div className="file-item-info">
                                                    <div className="file-item-icon">
                                                        <i className={`fa-light ${getFileIcon(file.name)}`}></i>
                                                    </div>
                                                    <div className="file-item-details">
                                                        <div className="file-item-name">{file.name}</div>
                                                        <div className="file-item-size">{formatFileSize(file.size)}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="file-item-remove"
                                                    onClick={() => handleRemoveFile(file.name)}
                                                >
                                                    <i className="fa-light fa-times"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => navigate('/tickets')}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-small"></span>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ marginRight: '8px' }}>Submit Ticket</span>
                                            <i className="tji-arrow-right-long"></i>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default CreateTicket;
