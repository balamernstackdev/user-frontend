import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const PlanModal = ({ plan, onSave, onClose }) => {
    // ... (existing state and logic) ...
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        planType: 'monthly',
        monthly_price: '',
        yearly_price: '',
        lifetime_price: '',
        features: [''],
        is_popular: false,
        is_featured: false,
        badge_text: '',
        max_downloads: ''
    });

    useEffect(() => {
        if (plan) {
            setFormData({
                ...plan,
                features: plan.features || [''],
                monthly_price: plan.monthly_price || '',
                yearly_price: plan.yearly_price || '',
                lifetime_price: plan.lifetime_price || '',
                max_downloads: plan.max_downloads || ''
            });
        }
    }, [plan]);

    const generateSlug = (text) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')     // Replace spaces with -
            .replace(/[^\w-]+/g, '')  // Remove all non-word chars
            .replace(/--+/g, '-');    // Replace multiple - with single -
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            // Auto-generate slug when name changes
            if (name === 'name') {
                newData.slug = generateSlug(value);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        // Clean up empty features
        const cleanedData = {
            ...formData,
            features: formData.features.filter(f => f.trim() !== ''),
            monthly_price: formData.monthly_price || null,
            yearly_price: formData.yearly_price || null,
            lifetime_price: formData.lifetime_price || null,
            max_downloads: formData.max_downloads || null
        };
        onSave(cleanedData);
    };

    return createPortal(
        <div className="modal-overlay">
            <div className="modal-content animate-fade-up">
                <div className="modal-header">
                    <h2>{plan ? 'Edit Subscription Plan' : 'Create New Plan'}</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Plan Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Pro Monthly"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Slug (URL Identifier)</label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                placeholder="e.g. pro-monthly"
                                required
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="2"
                                placeholder="Short summary of the plan"
                            ></textarea>
                        </div>
                        <div className="form-group">
                            <label>Plan Type</label>
                            <select name="planType" value={formData.planType} onChange={handleChange}>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                                <option value="lifetime">Lifetime</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Max Downloads</label>
                            <input
                                type="number"
                                name="max_downloads"
                                value={formData.max_downloads}
                                onChange={handleChange}
                                placeholder="Empty for unlimited"
                            />
                        </div>

                        {/* Prices based on type or all for flexibility */}
                        <div className="form-group">
                            <label>Monthly Price (₹)</label>
                            <input
                                type="number"
                                name="monthly_price"
                                value={formData.monthly_price}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Yearly Price (₹)</label>
                            <input
                                type="number"
                                name="yearly_price"
                                value={formData.yearly_price}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Badge Text</label>
                            <input
                                type="text"
                                name="badge_text"
                                value={formData.badge_text}
                                onChange={handleChange}
                                placeholder="e.g. Save 20%"
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ marginBottom: '10px' }}>Options</label>
                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input type="checkbox" name="is_popular" checked={formData.is_popular} onChange={handleChange} />
                                    Most Popular
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} />
                                    Featured Plan
                                </label>
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label>Features & Benefits</label>
                            <div className="features-list">
                                {formData.features.map((feature, index) => (
                                    <div className="feature-item" key={index}>
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                                            placeholder="Feature description"
                                        />
                                        <button type="button" className="action-btn delete" onClick={() => removeFeature(index)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                ))}
                                <button type="button" className="add-feature-btn" onClick={addFeature}>
                                    <i className="fas fa-plus"></i> Add Another Feature
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="tj-primary-btn">
                            <span className="btn-text"><span>{plan ? 'Update Plan' : 'Create Plan'}</span></span>
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default PlanModal;
