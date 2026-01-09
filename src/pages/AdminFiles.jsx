import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import fileService from '../services/file.service';
import SEO from '../components/common/SEO';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Files, FileText, Video, Headphones, ImageIcon, MoreHorizontal } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import './styles/AdminFiles.css';
import { toast } from 'react-toastify';
import Pagination from '../components/common/Pagination';

const AdminFiles = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [stats, setStats] = useState({
        total_files: 0,
        video_count: 0,
        audio_count: 0,
        image_count: 0,
        pdf_count: 0,
        other_count: 0
    });
    const navigate = useNavigate();

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const params = {
                category: categoryFilter,
                search: searchQuery,
                limit: pagination.limit,
                offset: (pagination.page - 1) * pagination.limit
            };
            const response = await fileService.getAllFiles(params);

            if (response.success) {
                if (response.data && response.data.pagination) {
                    setFiles(response.data.files);
                    setPagination(prev => ({ ...prev, total: response.data.pagination.total }));
                    if (response.data.summary) {
                        setStats(response.data.summary);
                    }
                } else if (Array.isArray(response.data)) {
                    // Fallback for backward compatibility or direct array
                    setFiles(response.data);
                } else if (response.data && response.data.files) {
                    setFiles(response.data.files);
                }
            }
        } catch (error) {
            console.error('Error fetching files:', error);
            toast.error('Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchFiles();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, categoryFilter, pagination.page]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
            try {
                await fileService.deleteFile(id);
                fetchFiles();
                toast.success('File deleted successfully');
            } catch (error) {
                console.error('Delete failed:', error);
                toast.error('Failed to delete file');
            }
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (mimeType) => {
        if (!mimeType) return <i className="fas fa-file text-secondary"></i>;

        if (mimeType.includes('pdf')) return <i className="fas fa-file-pdf text-danger"></i>;
        if (mimeType.includes('image')) return <i className="fas fa-file-image text-primary"></i>;
        if (mimeType.includes('video')) return <i className="fas fa-file-video text-info"></i>;
        if (mimeType.includes('zip') || mimeType.includes('compressed')) return <i className="fas fa-file-archive text-warning"></i>;
        if (mimeType.includes('word') || mimeType.includes('doc')) return <i className="fas fa-file-word text-primary"></i>;
        if (mimeType.includes('excel') || mimeType.includes('sheet')) return <i className="fas fa-file-excel text-success"></i>;

        return <i className="fas fa-file text-secondary"></i>;
    };

    return (
        <DashboardLayout>
            <SEO title="File Management" description="Manage downloadable files" />
            <div className="admin-listing-page animate-fade-up">
                <div className="container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Downloads & Resources</h1>
                            <p style={{ color: '#6c757d' }}>Manage files available for subscription plans</p>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="admin-stats-grid mb-4">
                        <StatCard
                            label="Total Files"
                            value={stats.total_files}
                            icon={Files}
                            isLoading={loading}
                            active={categoryFilter === ''}
                            onClick={() => setCategoryFilter('')}
                            className="card-users stat-card-hover"
                        />
                        <StatCard
                            label="PDFs"
                            value={stats.pdf_count}
                            icon={FileText}
                            iconColor="#ef4444"
                            iconBgColor="rgba(239, 68, 68, 0.1)"
                            isLoading={loading}
                            active={categoryFilter === 'pdf'}
                            onClick={() => setCategoryFilter('pdf')}
                            className="card-expiring stat-card-hover"
                        />
                        <StatCard
                            label="Videos"
                            value={stats.video_count}
                            icon={Video}
                            iconColor="#10b981"
                            iconBgColor="rgba(16, 185, 129, 0.1)"
                            isLoading={loading}
                            active={categoryFilter === 'video'}
                            onClick={() => setCategoryFilter('video')}
                            className="card-active-marketers stat-card-hover"
                        />
                        <StatCard
                            label="Audios"
                            value={stats.audio_count}
                            icon={Headphones}
                            iconColor="#f59e0b"
                            iconBgColor="rgba(245, 158, 11, 0.1)"
                            isLoading={loading}
                            active={categoryFilter === 'audio'}
                            onClick={() => setCategoryFilter('audio')}
                            className="card-plans stat-card-hover"
                        />
                        <StatCard
                            label="Images"
                            value={stats.image_count}
                            icon={ImageIcon}
                            iconColor="#6366f1"
                            iconBgColor="rgba(99, 102, 241, 0.1)"
                            isLoading={loading}
                            active={categoryFilter === 'image'}
                            onClick={() => setCategoryFilter('image')}
                            className="card-revenue stat-card-hover"
                        />
                        <StatCard
                            label="Others"
                            value={stats.other_count}
                            icon={MoreHorizontal}
                            iconColor="#6c757d"
                            iconBgColor="rgba(108, 117, 125, 0.1)"
                            isLoading={loading}
                            active={categoryFilter === 'other'}
                            onClick={() => setCategoryFilter('other')}
                            className="card-payouts stat-card-hover"
                        />
                    </div>

                    <div className="admin-listing-toolbar mb-4" style={{
                        backgroundColor: 'white',
                        padding: '15px 20px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                        border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            {/* Left Side: Search */}
                            <div className="flex-grow-1" style={{ maxWidth: '400px' }}>
                                <div className="position-relative">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm ps-4"
                                        placeholder="Search files..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ borderRadius: '6px', borderColor: '#e2e8f0', height: '38px' }}
                                    />
                                    <i className="fas fa-search position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}></i>
                                </div>
                            </div>

                            {/* Right Side: Filters & Actions */}
                            <div className="d-flex align-items-center gap-3">
                                <select
                                    className="form-select form-select-sm"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    style={{ borderRadius: '6px', borderColor: '#e2e8f0', minWidth: '150px', height: '38px' }}
                                >
                                    <option value="">All Categories</option>
                                    <option value="pdf">PDF</option>
                                    <option value="video">Video</option>
                                    <option value="audio">Audio</option>
                                    <option value="doc">Document</option>
                                    <option value="image">Image</option>
                                    <option value="other">Other</option>
                                </select>

                                <button
                                    className="tj-primary-btn"
                                    onClick={() => navigate('/admin/files/create')}
                                    style={{
                                        height: '38px',
                                        borderRadius: '6px',
                                        padding: '0 20px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        fontSize: '14px',
                                        fontWeight: 500
                                    }}
                                >
                                    <span className="btn-text">Add File</span>
                                    <span className="btn-icon">
                                        <i className="fas fa-arrow-right"></i>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="listing-table-container">
                        <table className="listing-table">
                            <thead>
                                <tr>
                                    <th>File Name</th>
                                    <th>Category</th>
                                    <th>Size</th>
                                    <th>Type</th>
                                    <th>Date Added</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center">Loading...</td></tr>
                                ) : files.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center" style={{ padding: '80px' }}>
                                            <i className="far fa-folder-open" style={{ fontSize: '40px', display: 'block', marginBottom: '15px', color: '#ccc' }}></i>
                                            No files found matching your filters.
                                        </td>
                                    </tr>
                                ) : (
                                    files.map(file => (
                                        <tr key={file.id}>
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '8px',
                                                        backgroundColor: '#f8f9fa',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '20px'
                                                    }}>
                                                        {getFileIcon(file.mime_type)}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{file.title}</div>
                                                        <div className="text-muted small text-truncate" style={{ maxWidth: '250px' }}>{file.description || 'No description'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-secondary border text-capitalize">
                                                    {file.category}
                                                </span>
                                            </td>
                                            <td>{formatFileSize(file.file_size)}</td>
                                            <td>
                                                <span className="text-uppercase small fw-bold text-muted">{file.file_type || 'Unknown'}</span>
                                            </td>
                                            <td>{new Date(file.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <div className="actions-cell">
                                                    <button
                                                        className="action-btn"
                                                        onClick={() => window.open(file.file_path.replace('uploads', `${import.meta.env.VITE_API_URL}/uploads`), '_blank')}
                                                        title="Download"
                                                    >
                                                        <i className="fas fa-download"></i>
                                                    </button>

                                                    {/* Edit button placeholder if needed later */}
                                                    {/* 
                                                    <button className="action-btn" onClick={() => navigate(`/admin/files/edit/${file.id}`)}>
                                                        <i className="far fa-edit"></i>
                                                    </button> 
                                                    */}

                                                    <button className="action-btn delete" onClick={() => handleDelete(file.id)} title="Delete">
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {files.length > 0 && (
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

export default AdminFiles;
