import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import FileService from '../services/file.service';
import SubscriptionService from '../services/subscription.service';
import './Downloads.css';

const Downloads = () => {
    const [files, setFiles] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [filesRes, subRes] = await Promise.all([
                FileService.getMyFiles(),
                SubscriptionService.getActiveSubscription()
            ]);
            setFiles(filesRes.data);
            setSubscription(subRes.data);
        } catch (err) {
            setError('Failed to load files');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (file) => {
        try {
            setDownloading(file.id);
            const response = await FileService.downloadFile(file.id);

            // Determine filename
            let filename = file.title || 'download';
            if (file.file_type && !filename.toLowerCase().endsWith(`.${file.file_type.toLowerCase()}`)) {
                filename += `.${file.file_type.toLowerCase()}`;
            }

            // Create blob URL directly from response.data (which is already a Blob)
            // This preserves the Content-Type from the backend
            const url = window.URL.createObjectURL(response.data);

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert(err.response?.data?.message || 'Download failed');
            console.error(err);
        } finally {
            setDownloading(null);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Icon mapping using FontAwesome
    // Using fa-light as per template, fallback to fa-solid or fa-regular if needed
    const getFileIconClass = (fileType) => {
        const type = fileType ? fileType.toLowerCase() : 'default';
        const icons = {
            pdf: 'fa-light fa-file-pdf',
            doc: 'fa-regular fa-file-word',
            docx: 'fa-regular fa-file-word',
            zip: 'fa-light fa-file-zipper',
            rar: 'fa-light fa-file-zipper',
            jpg: 'fa-light fa-file-image',
            png: 'fa-light fa-file-image',
            mp4: 'fa-light fa-file-video',
            avi: 'fa-light fa-file-video',
            default: 'fa-light fa-file'
        };
        return icons[type] || icons.default;
    };

    return (
        <DashboardLayout>
            <section className="page-section">
                <div className="container">
                    <div className="page-header">
                        <h2>My Downloads</h2>
                        <p style={{ color: '#6c757d' }}>Access all your purchased resources</p>
                    </div>

                    {!subscription && !loading && (
                        <div className="no-content-state mb-4">
                            <div className="no-content-icon"><i className="fa-light fa-lock"></i></div>
                            <h3>No Active Subscription</h3>
                            <p>You need an active subscription to access downloadable files.</p>
                            <Link to="/plans" className="tj-primary-btn" style={{ display: 'inline-flex' }}>
                                <span className="btn-text"><span>View Plans</span></span>
                                <span className="btn-icon"><i className="tji-arrow-right-long"></i></span>
                            </Link>
                        </div>
                    )}

                    {subscription && (
                        <div className="subscription-info-banner">
                            <div className="banner-item">
                                <span className="banner-label">Current Plan:</span>
                                <span className="banner-value">{subscription.plan_name}</span>
                            </div>
                            <div className="banner-item">
                                <span className="banner-label">Valid Until:</span>
                                <span className="banner-value">{formatDate(subscription.end_date)}</span>
                            </div>
                        </div>
                    )}

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
                            ) : files.length > 0 ? (
                                files.map((file) => (
                                    <div key={file.id} className="download-card">
                                        <div className="download-card-content">
                                            <div className="file-type-icon">
                                                <i className={getFileIconClass(file.file_type)}></i>
                                            </div>
                                            <div className="download-info">
                                                <div className="download-title">{file.title}</div>
                                                {file.description && (
                                                    <div className="download-file-description">{file.description}</div>
                                                )}
                                                <div className="download-meta">
                                                    <span><i className="fa-light fa-calendar"></i> Purchased: {formatDate(file.created_at)}</span>
                                                    <span><i className="fa-light fa-file"></i> {file.file_type ? file.file_type.toUpperCase() : 'FILE'}</span>
                                                    <span><i className="fa-light fa-hard-drive"></i> {formatFileSize(file.file_size)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="download-actions">
                                            <button
                                                className="tj-primary-btn"
                                                onClick={() => handleDownload(file)}
                                                disabled={downloading === file.id}
                                            >
                                                <span className="btn-text"><span>{downloading === file.id ? 'Downloading...' : 'Download'}</span></span>
                                                <span className="btn-icon"><i className="tji-arrow-right-long"></i></span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                subscription ? (
                                    <div className="no-content-state">
                                        <div className="no-content-icon"><i className="fa-light fa-folder-open"></i></div>
                                        <h3>No Files Available</h3>
                                        <p>There are no files available for your current plan yet. Please come back later.</p>
                                    </div>
                                ) : null
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default Downloads;
