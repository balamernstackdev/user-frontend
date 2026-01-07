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
            <div className="admin-listing-page animate-fade-up">
                <div className="container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Manage Analysis</h1>
                            <p style={{ color: '#6c757d' }}>Create and manage market reports for users</p>
                        </div>
                        <div className="header-actions">
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
                    </div>

                    <div className="listing-table-container">
                        <table className="listing-table">
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
                                    <tr><td colSpan="6" className="text-center">Loading...</td></tr>
                                ) : analyses.length > 0 ? (
                                    analyses.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', marginRight: '10px' }} />
                                                    ) : (
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundColor: '#eee', marginRight: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-chart-bar text-muted"></i></div>
                                                    )}
                                                    <span className="plan-name-text">{item.title}</span>
                                                </div>
                                            </td>
                                            <td><span className="plan-slug-text" style={{ fontSize: '14px' }}>{item.category}</span></td>
                                            <td>
                                                <span className="plan-type-badge" style={{
                                                    background: item.is_published ? '#e8f5e9' : '#fff3e0',
                                                    color: item.is_published ? '#2e7d32' : '#ff9800'
                                                }}>
                                                    {item.is_published ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="plan-type-badge" style={{
                                                    background: item.is_premium ? '#e3f2fd' : '#f5f5f5',
                                                    color: item.is_premium ? '#1565c0' : '#616161'
                                                }}>
                                                    {item.is_premium ? 'Premium' : 'Free'}
                                                </span>
                                            </td>
                                            <td>{formatDate(item.created_at)}</td>
                                            <td>
                                                <div className="actions-cell">
                                                    <button
                                                        className="action-btn"
                                                        onClick={() => navigate(`/admin/analysis/edit/${item.id}`)}
                                                        title="Edit"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => handleDelete(item.id)}
                                                        title="Delete"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                    <Link
                                                        className="action-btn"
                                                        to={`/curated-analysis/${item.id}`}
                                                        target="_blank"
                                                        title="View"
                                                        style={{ color: '#17a2b8' }}
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6" className="text-center" style={{ padding: '50px' }}>No analyses found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminAnalysis;
