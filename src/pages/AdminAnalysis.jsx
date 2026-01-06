import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import AnalysisService from '../services/analysis.service';
import SEO from '../components/common/SEO';
import './AdminListings.css'; // Reuse common admin listing styles
import { toast } from 'react-toastify';

const AdminAnalysis = () => {
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAnalyses();
    }, []);

    const fetchAnalyses = async () => {
        try {
            setLoading(true);
            const response = await AnalysisService.getAdminAnalyses();
            setAnalyses(response.data);
        } catch (err) {
            toast.error('Failed to fetch analyses');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this analysis?')) return;

        try {
            await AnalysisService.deleteAnalysis(id);
            setAnalyses(analyses.filter(item => item.id !== id));
            toast.success('Analysis deleted');
        } catch (err) {
            toast.error('Delete failed');
            console.error(err);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <DashboardLayout>
            <SEO title="Analysis Management" description="Manage market analysis content" />
            <section className="admin-listing-page animate-fade-up">
                <div className="container">
                    <div className="page-header d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="tj-section-title">Manage Analysis</h2>
                            <p className="text-muted">Create and manage market reports for users</p>
                        </div>
                        <Link
                            to="/admin/analysis/create"
                            className="tj-primary-btn"
                        >
                            <span className="btn-text">Add Analysis</span>
                            <span className="btn-icon">
                                <i className="fas fa-arrow-right"></i>
                            </span>
                        </Link>
                    </div>

                    <div className="admin-card">
                        <div className="table-responsive">
                            <table className="table tj-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Category</th>
                                        <th>Status</th>
                                        <th>Access</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="6" className="text-center py-5">Loading...</td></tr>
                                    ) : analyses.length > 0 ? (
                                        analyses.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        {item.image_url ? (
                                                            <img src={item.image_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', marginRight: '10px' }} />
                                                        ) : (
                                                            <div style={{ width: '40px', height: '40px', borderRadius: '4px', bgcolor: '#eee', marginRight: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-chart-bar text-muted"></i></div>
                                                        )}
                                                        <span className="font-weight-600">{item.title}</span>
                                                    </div>
                                                </td>
                                                <td><span className="badge bg-light text-dark">{item.category}</span></td>
                                                <td>
                                                    <span className={`badge ${item.is_published ? 'bg-success' : 'bg-warning'}`}>
                                                        {item.is_published ? 'Published' : 'Draft'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${item.is_premium ? 'bg-info' : 'bg-secondary'}`}>
                                                        {item.is_premium ? 'Premium' : 'Free'}
                                                    </span>
                                                </td>
                                                <td>{formatDate(item.created_at)}</td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <button
                                                            className="tj-btn tj-btn-sm tj-btn-outline-primary"
                                                            onClick={() => navigate(`/admin/analysis/edit/${item.id}`)}
                                                            title="Edit"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button
                                                            className="tj-btn tj-btn-sm tj-btn-outline-danger"
                                                            onClick={() => handleDelete(item.id)}
                                                            title="Delete"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                        <Link
                                                            className="tj-btn tj-btn-sm tj-btn-outline-info"
                                                            to={`/curated-analysis/${item.id}`}
                                                            target="_blank"
                                                            title="View"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="6" className="text-center py-5">No analyses found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default AdminAnalysis;
