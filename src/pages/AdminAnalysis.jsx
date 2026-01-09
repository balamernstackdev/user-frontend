import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import AnalysisService from '../services/analysis.service';
import SEO from '../components/common/SEO';
import { TrendingUp, BarChart, Eye, Edit, Trash, Plus, Lock, Unlock, Globe, Calendar } from 'lucide-react';
import './styles/AdminListings.css';
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
                <div className="admin-container">
                    <div className="admin-listing-header">
                        <div className="header-title">
                            <h1>Manage Analysis</h1>
                            <p className="text-muted mb-0">Create and manage market reports for users</p>
                        </div>
                        <div className="header-actions">
                            <button
                                onClick={() => navigate('/admin/analysis/create')}
                                className="tj-btn tj-btn-primary"
                            >
                                <Plus size={18} className="me-2" /> Add Analysis
                            </button>
                        </div>
                    </div>

                    <div className="listing-table-container">
                        <div className="table-responsive">
                            <table className="listing-table">
                                <thead>
                                    <tr>
                                        <th>Title & Image</th>
                                        <th>Category</th>
                                        <th>Status</th>
                                        <th>Access</th>
                                        <th>Created</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="6" className="text-center py-5 text-muted">Loading analyses...</td></tr>
                                    ) : analyses.length > 0 ? (
                                        analyses.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-3">
                                                        {item.image_url ? (
                                                            <img
                                                                src={item.image_url}
                                                                alt=""
                                                                style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                                                            />
                                                        ) : (
                                                            <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <BarChart size={20} className="text-muted" />
                                                            </div>
                                                        )}
                                                        <span className="fw-semibold text-dark">{item.title}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="premium-badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`premium-badge ${item.is_published ? 'premium-badge-success' : 'premium-badge-warning'}`}>
                                                        {item.is_published ? <Globe size={12} className="me-1" /> : <Lock size={12} className="me-1" />}
                                                        {item.is_published ? 'Published' : 'Draft'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`premium-badge ${item.is_premium ? 'premium-badge-primary' : 'premium-badge-secondary'}`}>
                                                        {item.is_premium ? <TrendingUp size={12} className="me-1" /> : <Unlock size={12} className="me-1" />}
                                                        {item.is_premium ? 'Premium' : 'Free'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="text-muted small">
                                                        <Calendar size={12} className="me-1" />
                                                        {formatDate(item.created_at)}
                                                    </div>
                                                </td>
                                                <td className="text-end">
                                                    <div className="actions-cell justify-content-end">
                                                        <button
                                                            className="action-btn"
                                                            onClick={() => window.open(`/curated-analysis/${item.id}`, '_blank')}
                                                            title="View"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            className="action-btn"
                                                            onClick={() => navigate(`/admin/analysis/edit/${item.id}`)}
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            className="action-btn delete"
                                                            onClick={() => handleDelete(item.id)}
                                                            title="Delete"
                                                        >
                                                            <Trash size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5">
                                                <div className="d-flex flex-column align-items-center">
                                                    <div className="mb-2"><BarChart size={40} className="text-muted opacity-20" /></div>
                                                    <p className="text-muted mb-0">No analyses found.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminAnalysis;
