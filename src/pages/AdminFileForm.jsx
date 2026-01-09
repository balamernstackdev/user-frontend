import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import fileService from '../services/file.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import './styles/AdminForms.css'; // Reusing common form styles
import { toast } from 'react-toastify';

const AdminFileForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'doc'
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            // If we had a getFile method we would fetch here. 
            // Since we only have getAllFiles, we might need to filter or implement getOne. 
            // For now, let's assume we are mainly focused on Upload (Create) as per user request.
            // If viewing/editing is needed later, we can add it. 
            // But actually, file editing usually just means changing metadata, not re-uploading the file itself.
            // Let's implement basic metadata fetch if possible or just skip edit for now and focus on Create.
            // The user specifically asked "where is file upload" and "want separate page".
            // I will implement Create first. If I add edit route, I need to fetch data.
            fetchFileDetails();
        }
    }, [id]);

    const fetchFileDetails = async () => {
        setLoading(true);
        try {
            // Since we don't have a direct getFileById in service yet (only delete/download/getAll), 
            // I'll skip full edit implementation for the *file content* but allows metadata editing if I filter from getAll (inefficient)
            // or just focus on Create for this step.
            // Let's implement CREATE properly as a separate page first.
            // If I need to support Edit, I will need to add `getFileById` to backend/frontend.
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            // Auto fill title if empty
            if (!formData.title) {
                setFormData(prev => ({ ...prev, title: file.name }));
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile && !isEditMode) {
            toast.error('Please select a file to upload.');
            return;
        }

        setUploading(true);
        const data = new FormData();
        if (selectedFile) data.append('file', selectedFile);
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('category', formData.category);

        try {
            if (isEditMode) {
                // await fileService.updateFile(id, data); // To be implemented if needed
                toast.info('Edit not fully implemented yet');
            } else {
                await fileService.uploadFile(data);
                toast.success('File uploaded successfully');
            }
            navigate('/admin/files');
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <DashboardLayout>
            <div className="admin-form-page animate-fade-up">
                <div className="container">
                    <div className="admin-form-header mb-4">
                        <h2>Upload New File</h2>
                        <p>Add resources for your subscription plans</p>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="admin-form-card">
                                <div className="card-body p-4">

                                    <form onSubmit={handleSubmit}>

                                        {/* File Drop Zone */}
                                        <div
                                            className={`drop-zone mb-4 ${selectedFile ? 'border-primary bg-light' : ''}`}
                                            onClick={() => fileInputRef.current.click()}
                                            style={{
                                                border: '2px dashed #ddd',
                                                borderRadius: '12px',
                                                padding: '40px',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                backgroundColor: '#f8f9fa',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />
                                            <i className={`fas fa-cloud-arrow-up mb-3 ${selectedFile ? 'text-primary' : 'text-secondary'}`} style={{ fontSize: '48px' }}></i>
                                            <p className="mb-0 fw-medium text-dark">
                                                {selectedFile ? 'Click to replace file' : 'Click to browse or drag file here'}
                                            </p>
                                            <small className="text-muted mt-2 d-block">Supported formats: PDF, Docs, Images, Zip, Video</small>
                                        </div>

                                        {selectedFile && (
                                            <div className="file-preview mb-4 p-3 bg-light rounded d-flex justify-content-between align-items-center border">
                                                <div className="d-flex align-items-center">
                                                    <i className="fa-solid fa-file-lines me-3 text-primary fs-4"></i>
                                                    <div>
                                                        <strong className="d-block text-dark">{selectedFile.name}</strong>
                                                        <span className="text-muted small">{formatFileSize(selectedFile.size)}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-link text-danger p-0"
                                                    onClick={() => setSelectedFile(null)}
                                                    title="Remove file"
                                                >
                                                    <i className="fa-solid fa-trash-can fs-5"></i>
                                                </button>
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <label className="form-label">File Title</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                required
                                                placeholder="Enter display name"
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Category</label>
                                            <select
                                                className="form-select"
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                            >
                                                <option value="pdf">PDF</option>
                                                <option value="video">Video</option>
                                                <option value="audio">Audio</option>
                                                <option value="doc">Document</option>
                                                <option value="image">Image</option>
                                                <option value="exe">Software / EXE</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label">Description (Optional)</label>
                                            <textarea
                                                className="form-control"
                                                name="description"
                                                rows="3"
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder="Describe the file content..."
                                            ></textarea>
                                        </div>

                                        <div className="d-flex justify-content-end gap-3 pt-3 border-top">
                                            <button
                                                type="button"
                                                className="btn btn-light px-4 py-2 fw-semibold rounded-pill border"
                                                onClick={() => navigate('/admin/files')}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary px-4 py-2 fw-semibold rounded-pill"
                                                disabled={uploading || (!selectedFile && !isEditMode)}
                                                style={{ minWidth: '140px' }}
                                            >
                                                {uploading ? (
                                                    <><span className="spinner-border spinner-border-sm me-2"></span>Uploading...</>
                                                ) : 'Upload File'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminFileForm;
