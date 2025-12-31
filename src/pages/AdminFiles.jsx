import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import fileService from '../services/file.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import './AdminFiles.css';
import { toast } from 'react-toastify';

const AdminFiles = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('');
    const navigate = useNavigate();

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const params = { category: categoryFilter };
            const response = await fileService.getAllFiles(params);
            if (response.success) {
                setFiles(response.data);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [categoryFilter]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
            try {
                await fileService.deleteFile(id);
                fetchFiles();
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
        if (mimeType.includes('pdf')) return <i className="fa-solid fa-file-pdf"></i>;
        if (mimeType.includes('image')) return <i className="fa-solid fa-file-image"></i>;
        if (mimeType.includes('video')) return <i className="fa-solid fa-file-video"></i>;
        if (mimeType.includes('zip') || mimeType.includes('compressed')) return <i className="fa-solid fa-file-zipper"></i>;
        return <i className="fa-solid fa-file"></i>;
    };

    return (
        <DashboardLayout>
            <div className="admin-files-page animate-fade-up">
                <div className="container">
                    <div className="files-header">
                        <div className="header-title">
                            <h1>Downloads & Resources</h1>
                            <p style={{ color: '#6c757d' }}>Manage files available for subscription plans</p>
                        </div>
                        <div className="header-actions">
                            <div className="file-filters">
                                <select className="form-control" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ width: '150px' }}>
                                    <option value="">All Categories</option>
                                    <option value="e-book">E-Books</option>
                                    <option value="software">Software</option>
                                    <option value="template">Templates</option>
                                    <option value="video">Videos</option>
                                </select>
                                <Link to="/admin/files/create" className="tj-primary-btn">
                                    <span className="btn-text"><span><i className="fas fa-upload"></i> Upload File</span></span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loader-container"><div className="spinner-border text-primary"></div></div>
                    ) : files.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="far fa-folder-open" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
                            <h3>No files found</h3>
                            <p>Upload your first file to get started.</p>
                        </div>
                    ) : (
                        <div className="file-grid">
                            {files.map(file => (
                                <div className="file-card" key={file.id}>
                                    <div className="file-icon">
                                        {getFileIcon(file.mime_type)}
                                    </div>
                                    <div className="file-info">
                                        <h3>{file.title}</h3>
                                        <div className="file-meta">
                                            <span>{formatFileSize(file.file_size)}</span>
                                            <span>{new Date(file.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.4', height: '34px', overflow: 'hidden' }}>
                                            {file.description || 'No description provided.'}
                                        </p>
                                    </div>
                                    <div className="file-actions">
                                        <button className="btn-icon" onClick={() => window.open(file.file_path.replace('uploads', `${import.meta.env.VITE_API_URL}/uploads`), '_blank')} title="Download">
                                            <i className="fas fa-download"></i>
                                        </button>

                                        {/* 
                                        <Link to={`/admin/files/edit/${file.id}`} className="btn-icon">
                                            <i className="fas fa-pen"></i>
                                        </Link>
                                        */}

                                        <button className="btn-icon delete" onClick={() => handleDelete(file.id)} title="Delete">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminFiles;
