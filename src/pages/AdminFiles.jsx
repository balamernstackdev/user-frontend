import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import fileService from '../services/file.service';
import SEO from '../components/common/SEO';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Files, FileText, Video, Headphones, ImageIcon, MoreHorizontal, Box, Download, Trash, Plus, Search } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import './styles/AdminListings.css';
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
        exe_count: 0,
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
        if (mimeType.includes('exe') || mimeType.includes('msdownload') || mimeType.includes('application/x-msdos-program')) return <i className="fab fa-windows text-primary"></i>;

        return <i className="fas fa-file text-secondary"></i>;
    };

    return (
        <DashboardLayout>
            <SEO title="File Management" description="Manage downloadable files" />
            <div className="admin-listing-page animate-fade-up">
                <div className="admin-container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Downloads & Resources</h1>
                            <p className="text-muted mb-0">Manage files available for subscription plans</p>
                        </div>
                        <div className="header-actions">
                            <button
                                className="tj-btn tj-btn-primary"
                                onClick={() => navigate('/admin/files/create')}
                            >
                                <Plus size={18} className="me-2" /> Add File
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-3">
                            <StatCard
                                label="Total Files"
                                value={stats.total_files}
                                icon={Files}
                                isLoading={loading}
                                active={categoryFilter === ''}
                                onClick={() => setCategoryFilter('')}
                            />
                        </div>
                        <div className="col-md-3">
                            <StatCard
                                label="Videos"
                                value={stats.video_count}
                                icon={Video}
                                iconColor="#10b981"
                                iconBgColor="rgba(16, 185, 129, 0.1)"
                                isLoading={loading}
                                active={categoryFilter === 'video'}
                                onClick={() => setCategoryFilter('video')}
                            />
                        </div>
                        <div className="col-md-3">
                            <StatCard
                                label="Audios"
                                value={stats.audio_count}
                                icon={Headphones}
                                iconColor="#f59e0b"
                                iconBgColor="rgba(245, 158, 11, 0.1)"
                                isLoading={loading}
                                active={categoryFilter === 'audio'}
                                onClick={() => setCategoryFilter('audio')}
                            />
                        </div>
                        <div className="col-md-3">
                            <StatCard
                                label="Software"
                                value={stats.exe_count}
                                icon={Box}
                                iconColor="#0ea5e9"
                                iconBgColor="rgba(14, 165, 233, 0.1)"
                                isLoading={loading}
                                active={categoryFilter === 'exe'}
                                onClick={() => setCategoryFilter('exe')}
                            />
                        </div>
                    </div>

                    <div className="admin-listing-toolbar">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 w-100">
                            <div className="search-box flex-grow-1" style={{ maxWidth: '400px' }}>
                                <div className="position-relative">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search files..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ paddingLeft: '40px' }}
                                    />
                                    <Search className="position-absolute text-muted" size={18} style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                </div>
                            </div>

                            <div className="d-flex gap-2">
                                <select
                                    className="custom-select"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    <option value="pdf">PDF</option>
                                    <option value="video">Video</option>
                                    <option value="audio">Audio</option>
                                    <option value="doc">Document</option>
                                    <option value="image">Image</option>
                                    <option value="exe">Software / EXE</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="listing-table-container">
                        <div className="table-responsive">
                            <table className="listing-table">
                                <thead>
                                    <tr>
                                        <th>File Name & Description</th>
                                        <th>Category</th>
                                        <th>Size</th>
                                        <th>Type</th>
                                        <th>Date Added</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="6" className="text-center py-5 text-muted">Loading files...</td></tr>
                                    ) : files.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5">
                                                <div className="d-flex flex-column align-items-center">
                                                    <div className="mb-2"><Files size={40} className="text-muted opacity-20" /></div>
                                                    <p className="text-muted mb-0">No files found matching your filters.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        files.map(file => (
                                            <tr key={file.id}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="file-icon-box" style={{
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
                                                    <span className="premium-badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                                                        {file.category}
                                                    </span>
                                                </td>
                                                <td className="text-muted">{formatFileSize(file.file_size)}</td>
                                                <td>
                                                    <span className="premium-badge premium-badge-info">
                                                        {file.file_type || 'Unknown'}
                                                    </span>
                                                </td>
                                                <td className="text-muted small">{new Date(file.created_at).toLocaleDateString()}</td>
                                                <td className="text-end">
                                                    <div className="actions-cell justify-content-end">
                                                        <button
                                                            className="action-btn"
                                                            onClick={() => window.open(file.file_path.replace('uploads', `${import.meta.env.VITE_API_URL}/uploads`), '_blank')}
                                                            title="Download"
                                                        >
                                                            <Download size={16} />
                                                        </button>
                                                        <button
                                                            className="action-btn delete"
                                                            onClick={() => handleDelete(file.id)}
                                                            title="Delete"
                                                        >
                                                            <Trash size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {pagination.total > pagination.limit && (
                            <div className="mt-4 p-4 border-top d-flex justify-content-center">
                                <Pagination
                                    currentPage={pagination.page}
                                    totalItems={pagination.total}
                                    itemsPerPage={pagination.limit}
                                    onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminFiles;
