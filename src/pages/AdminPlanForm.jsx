import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import planService from '../services/plan.service';
import fileService from '../services/file.service';
import './styles/AdminForms.css';
import { toast } from 'react-toastify';

const AdminPlanForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        plan_type: 'monthly',
        monthly_price: '',
        yearly_price: '',
        lifetime_price: '',
        max_downloads: '',
        badge_text: '',
        is_popular: false,
        is_featured: false,
        is_active: true,
        features: ['']
    });
    const [availableFiles, setAvailableFiles] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);

    useEffect(() => {
        if (isEditMode) {
            fetchPlan();
        }
    }, [id]);

    const fetchPlan = async () => {
        try {
            const response = await planService.getPlans(); // Assuming getPlanById exists or filters
            // Optimally we should have getPlanById, but if not we find it from the list
            // Or better, let's assume getPlanById might not exist yet, so we filter.
            // EDIT: Checking plan.service previously suggests only getPlans. Let's try to get specific if possible or filter.
            // Actually, usually admin APIs have a get-one endpoint. If not, I'll filter from all.
            // Let's assume we filter from getPlans since that's what AdminPlans used.
            const plan = response.data.find(p => p.id === id);
            if (plan) {
                setFormData({
                    name: plan.name,
                    slug: plan.slug,
                    description: plan.description || '',
                    plan_type: plan.plan_type,
                    monthly_price: plan.monthly_price || '',
                    yearly_price: plan.yearly_price || '',
                    lifetime_price: plan.lifetime_price || '',
                    max_downloads: plan.max_downloads || '',
                    badge_text: plan.badge_text || '',
                    is_popular: plan.is_popular,
                    is_featured: plan.is_featured,
                    is_active: plan.is_active,
                    features: plan.features || []
                });

                // Fetch assigned files
                try {
                    const planFiles = await fileService.getPlanFiles(id);
                    if (planFiles.success) {
                        setSelectedFiles(planFiles.data.map(f => f.id));
                    }
                } catch (e) {
                    console.error('Failed to load plan files', e);
                }

            } else {
                setError('Plan not found.');
            }
        } catch (err) {
            console.error('Failed to fetch plan:', err);
            toast.error('Failed to load plan data');
        } finally {
            setFetching(false);
        }
    };

    const fetchFiles = async () => {
        try {
            const response = await fileService.getAllFiles({ limit: 100 }); // Increase limit or implement pagination dropdown
            if (response.success) {
                // Handle different response structures
                const files = response.data?.files || response.data || [];
                setAvailableFiles(Array.isArray(files) ? files : []);
            }
        } catch (e) {
            console.error('Failed to fetch files', e);
            setAvailableFiles([]); // Set empty array on error
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            // Auto-generate slug from name if creating new plan
            if (name === 'name' && !isEditMode) {
                newData.slug = value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
            }

            return newData;
        });
    };

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData(prev => ({ ...prev, features: newFeatures }));
    };

    const addFeature = () => {
        setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
    };

    const removeFeature = (index) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, features: newFeatures }));
    };

    const handleFileToggle = (fileId) => {
        setSelectedFiles(prev => {
            if (prev.includes(fileId)) {
                return prev.filter(id => id !== fileId);
            } else {
                return [...prev, fileId];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Clean up data
            const payload = {
                ...formData,
                planType: formData.plan_type, // Required for backend validation middleware
                monthly_price: formData.monthly_price ? Number(formData.monthly_price) : null,
                yearly_price: formData.yearly_price ? Number(formData.yearly_price) : null,
                lifetime_price: formData.lifetime_price ? Number(formData.lifetime_price) : null,
                max_downloads: formData.max_downloads ? Number(formData.max_downloads) : null,
                features: formData.features.filter(f => f.trim() !== '') // Remove empty features
            };

            let planId = id;
            if (isEditMode) {
                await planService.updatePlan(id, payload);
                toast.success('Plan updated successfully');
            } else {
                const newPlan = await planService.createPlan(payload);
                planId = newPlan.data.id;
                toast.success('Plan created successfully');
            }

            // Handle Files Assignment
            // Ideally we should have a bulk update endpoint, but for now we can iterate
            // First, in edit mode, we might want to see what was added/removed, but basic sync is okay
            // Simple robust strategy: For each selected file, ensure assigned. For others, ensure removed.
            // This is chatty but effective for MVP. 
            // Better: Compare with initial if possible.
            // Let's just iterate selected and assign. For deslected... wait, we need to know what to remove.
            // In Edit mode, we fetched initial `planFiles`.
            // Let's assume we can just assign all selected. The backend `assignFileToPlan` uses `ON CONFLICT UPDATE`, so it's safe.
            // But we also need to REMOVE unselected ones.
            // A better backend approach would be `syncPlanFiles(planId, listOfFileIds)`.
            // Given current backend API in `file.controller.js` only has `assign` and `remove`, we must loop carefully.

            // To be safe and simple: 
            // 1. Get current plan files (we have them from load, but maybe stale? No, we loaded them).
            // Actually, `selectedFiles` reflects desired state. 
            // We need to know what to remove.
            // Let's fetch the current plan files again to be sure (or trust our initial load if we stored it separate from selectedFiles).
            // Since we didn't store initial state separately, let's just use `availableFiles` loop.

            // Optimization: Only process changes if we track them.
            // Brute force for now:
            const allFileIds = availableFiles.map(f => f.id);
            const toAdd = selectedFiles;
            const toRemove = allFileIds.filter(fid => !selectedFiles.includes(fid)); // Only remove from available list... 
            // Wait, what if there are files not in available list (unlikely)?

            // We need to remove files that are NOT in selectedFiles but ARE currently assigned.
            // Since we don't have exact list of currently assigned in a variable (we overwrote selectedFiles), this is tricky.
            // Let's fetch assigned files again? No, we can't in mid-flight easily.

            // Allow me to add a `syncPlanFiles` method to backend? No, stick to frontend changes if possible.
            // Let's just Loop all Available Files.
            // If ID in Selected -> Assign
            // If ID NOT in Selected -> Remove
            // This covers everything visible.

            const filePromises = availableFiles.map(file => {
                if (selectedFiles.includes(file.id)) {
                    return fileService.assignFileToPlan(planId, file.id);
                } else {
                    return fileService.removeFileFromPlan(planId, file.id);
                }
            });

            await Promise.all(filePromises);

            navigate('/admin/plans');
        } catch (err) {
            console.error('Operation failed:', err);
            const msg = err.response?.data?.message || 'Operation failed';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <DashboardLayout>
                <div className="container py-5 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="admin-form-page animate-fade-up">
                <div className="container">
                    <div className="admin-form-header mb-4">
                        <h2>{isEditMode ? 'Edit Plan' : 'Create New Plan'}</h2>
                        <p>{isEditMode ? 'Update subscription plan details' : 'Add a new pricing tier'}</p>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="admin-form-card">
                                <div className="card-body p-4">

                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Plan Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="name"
                                                    placeholder="e.g. Pro Monthly"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Slug (URL Identifier)</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="slug"
                                                    placeholder="e.g. pro-monthly"
                                                    value={formData.slug}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                className="form-control"
                                                name="description"
                                                rows="3"
                                                value={formData.description}
                                                onChange={handleChange}
                                            ></textarea>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Plan Type</label>
                                                <select
                                                    className="form-select"
                                                    name="plan_type"
                                                    value={formData.plan_type}
                                                    onChange={handleChange}
                                                >
                                                    <option value="monthly">Monthly</option>
                                                    <option value="yearly">Yearly</option>
                                                    <option value="lifetime">Lifetime</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Max Downloads</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="max_downloads"
                                                    placeholder="Empty for unlimited"
                                                    value={formData.max_downloads}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Monthly Price (₹)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="monthly_price"
                                                    value={formData.monthly_price}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Yearly Price (₹)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="yearly_price"
                                                    value={formData.yearly_price}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Lifetime Price (₹)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="lifetime_price"
                                                    value={formData.lifetime_price}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Badge Text</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="badge_text"
                                                placeholder="e.g. Save 20%"
                                                value={formData.badge_text}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Options</label>
                                            <div className="checkbox-group">
                                                <label className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        name="is_popular"
                                                        checked={formData.is_popular}
                                                        onChange={handleChange}
                                                    />
                                                    Most Popular
                                                </label>
                                                <label className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        name="is_featured"
                                                        checked={formData.is_featured}
                                                        onChange={handleChange}
                                                    />
                                                    Featured Plan
                                                </label>
                                                <label className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        name="is_active"
                                                        checked={formData.is_active}
                                                        onChange={handleChange}
                                                    />
                                                    Active
                                                </label>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label">Features & Benefits</label>
                                            <div className="features-list">
                                                {(Array.isArray(formData.features) ? formData.features : []).map((feature, index) => (
                                                    <div key={index} className="feature-item">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={feature}
                                                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                                                            placeholder="Feature description"
                                                        />
                                                        {formData.features.length > 1 && (
                                                            <button
                                                                type="button"
                                                                className="btn-remove-feature"
                                                                onClick={() => removeFeature(index)}
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <button type="button" className="btn-add-feature" onClick={addFeature}>
                                                + Add Another Feature
                                            </button>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label">Included Resources (Downloads)</label>
                                            <p style={{ fontSize: '13px', color: '#666' }}>Select files that users will get access to with this plan.</p>
                                            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '6px', padding: '10px' }}>
                                                {availableFiles.length === 0 ? (
                                                    <p className="text-muted text-center my-2">No files available. Go to Downloads page to upload files.</p>
                                                ) : (
                                                    availableFiles.map(file => (
                                                        <div key={file.id} className="form-check mb-2">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={`file-${file.id}`}
                                                                checked={selectedFiles.includes(file.id)}
                                                                onChange={() => handleFileToggle(file.id)}
                                                            />
                                                            <label className="form-check-label" htmlFor={`file-${file.id}`} style={{ color: '#212529', fontWeight: '500' }}>
                                                                {file.title} <span className="text-muted" style={{ fontSize: '11px' }}>({file.file_type})</span>
                                                            </label>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-end gap-2 mt-4">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => navigate('/admin/plans')}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="tj-primary-btn"
                                                disabled={loading}
                                            >
                                                <span className="btn-text">
                                                    <span>{loading ? 'Saving...' : (isEditMode ? 'Update Plan' : 'Create Plan')}</span>
                                                </span>
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

export default AdminPlanForm;
