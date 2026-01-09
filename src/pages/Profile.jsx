import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import SEO from '../components/common/SEO';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import './styles/Profile.css';
import { toast } from 'react-toastify';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        address: '', // Add explicit address field if backend supports it
        city: '',
        country: 'US'
    });

    const [marketerData, setMarketerData] = useState({
        companyName: '',
        referralCode: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        upiId: ''
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };



    useEffect(() => {
        const currentUser = authService.getUser();
        if (currentUser) {
            setUser(currentUser);
            // Initialize profile data from local user storage immediately
            setProfileData(prev => ({
                ...prev,
                name: currentUser.name || '',
                email: currentUser.email || '',
                phone: currentUser.phone || '',
                // Preserve other fields if they exist in currentUser, otherwise keep defaults
            }));
        }
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await userService.getProfile();
            if (response.success) {
                setProfile(response.data);
                // Merge API data with existing state
                setProfileData(prev => ({
                    ...prev,
                    name: response.data.user.name || prev.name || '',
                    phone: response.data.user.phone || prev.phone || '',
                    address: response.data.user.address || prev.address || '',
                    city: response.data.user.city || prev.city || '',
                    country: response.data.user.country || prev.country || 'US'
                }));
                if (response.data.marketer) {
                    setMarketerData({
                        companyName: response.data.marketer.company_name,
                        referralCode: response.data.marketer.referral_code,
                        bankName: response.data.marketer.bank_name || '',
                        accountNumber: response.data.marketer.account_number || '',
                        ifscCode: response.data.marketer.ifsc_code || '',
                        accountHolderName: response.data.marketer.account_holder_name || '',
                        upiId: response.data.marketer.upi_id || ''
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        const toastId = toast.loading('Uploading avatar...');

        try {
            const response = await userService.uploadAvatar(file);
            if (response.success) {
                toast.update(toastId, { render: 'Avatar updated successfully!', type: 'success', isLoading: false, autoClose: 3000 });
                // Update local state
                setProfile(prev => ({
                    ...prev,
                    user: { ...prev.user, avatar_url: response.data.avatarUrl }
                }));
                // Also update user state if needed, though userService updates TokenService
                setUser(prev => ({ ...prev, avatar_url: response.data.avatarUrl }));
            }
        } catch (error) {
            console.error(error);
            toast.update(toastId, { render: 'Failed to upload avatar', type: 'error', isLoading: false, autoClose: 3000 });
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await userService.updateProfile(profileData);
            if (response.success) {
                toast.success('Profile updated successfully!');
                fetchProfile();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleMarketerUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await userService.updateBusinessAssociateProfile(marketerData);
            if (response.success) {
                toast.success('Business Associate profile updated successfully!');
                fetchProfile();
            }
        } catch (error) {
            let errorMessage = 'Failed to update Business Associate profile';
            if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                errorMessage = error.response.data.errors.map(err => err.message).join('. ');
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        setSaving(true);

        try {
            const response = await userService.changePassword({
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword,
            });
            if (response.success) {
                toast.success('Password changed successfully!');
                setPasswordData({
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <SEO title="My Profile" description="Manage your personal and account information." />
            <section className="page-section">
                <div className="container">
                    <div className="page-header">
                        <h2>My Profile</h2>
                        <p style={{ color: '#6c757d' }}>Manage your account information and settings</p>
                    </div>

                    <div className="row">
                        <div className="col-lg-4">
                            <div className="profile-card">
                                <div className="profile-header">
                                    <div className="profile-avatar" onClick={() => document.getElementById('avatar-upload').click()} style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                                        {(profile?.user?.avatar_url || user?.avatar_url) ? (
                                            <img
                                                src={profile?.user?.avatar_url || user?.avatar_url}
                                                alt="Profile"
                                            />
                                        ) : (
                                            <i className="fas fa-user-circle"></i>
                                        )}
                                        <div className="avatar-overlay avatar-hover-overlay" style={{
                                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                            background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            transition: '0.3s opacity',
                                            borderRadius: '12px'
                                        }}
                                        >
                                            <i className="fas fa-camera" style={{ color: 'white', fontSize: '1.5rem', marginBottom: '5px' }}></i>
                                            <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: 500 }}>Update Photo</span>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleAvatarChange}
                                    />
                                    <h3 className="profile-name">{profile?.user?.name || user?.name || 'User'}</h3>
                                    <p className="profile-email">{profile?.user?.email || user?.email || 'email@example.com'}</p>
                                </div>
                                <div className="profile-nav">
                                    <button
                                        className={`profile-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('profile')}
                                    >
                                        <span>Personal Information</span>
                                        <i className="fas fa-arrow-right"></i>
                                    </button>

                                    {user?.role === 'business_associate' && (
                                        <>
                                            <button
                                                className={`profile-nav-btn ${activeTab === 'marketer' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('marketer')}
                                            >
                                                <span>Business Associate Details</span>
                                                <i className="fas fa-arrow-right"></i>
                                            </button>

                                            <button
                                                className={`profile-nav-btn ${activeTab === 'payout' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('payout')}
                                            >
                                                <span>Payout Settings</span>
                                                <i className="fas fa-arrow-right"></i>
                                            </button>
                                        </>
                                    )}

                                    <button
                                        className={`profile-nav-btn ${activeTab === 'password' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('password')}
                                    >
                                        <span>Change Password</span>
                                        <i className="fas fa-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-8">
                            <div className="profile-card">


                                {activeTab === 'profile' && (
                                    <div className="animate-fade-up">
                                        <h3 style={{ marginBottom: '30px', color: '#000000', fontWeight: 600 }}>Personal Information</h3>
                                        <form onSubmit={handleProfileUpdate}>
                                            <div className="form-group">
                                                <label htmlFor="name">Full Name</label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    className="form-control"
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="email">Email Address</label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    className="form-control"
                                                    value={profile?.user?.email || user?.email || ''}
                                                    disabled
                                                />
                                                <span className="form-text">Email cannot be changed</span>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="phone">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    className="form-control"
                                                    value={profileData.phone}
                                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                />
                                            </div>

                                            <div style={{ marginTop: '30px' }}>
                                                <button type="submit" className="tj-primary-btn" disabled={saving}>
                                                    <span className="btn-text"><span>{saving ? 'Saving Changes...' : 'Save Changes'}</span></span>
                                                    <span className="btn-icon"><i className="fas fa-arrow-right"></i></span>
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {activeTab === 'marketer' && (
                                    <div className="animate-fade-up">
                                        <h3 style={{ marginBottom: '30px', color: '#000000', fontWeight: 600 }}>Business Associate Information</h3>
                                        <form onSubmit={handleMarketerUpdate}>
                                            <div className="form-group">
                                                <label htmlFor="referralCode">Referral Code</label>
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        type="text"
                                                        id="referralCode"
                                                        className="form-control"
                                                        value={marketerData.referralCode || ''}
                                                        readOnly
                                                        style={{ backgroundColor: '#f8f9fa', letterSpacing: '1px', fontWeight: 'bold' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-link"
                                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', textDecoration: 'none' }}
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(marketerData.referralCode);
                                                            toast.success('Referral code copied!');
                                                        }}
                                                    >
                                                        <i className="far fa-copy"></i> Copy
                                                    </button>
                                                </div>
                                                <span className="form-text">Share this code with users to earn commissions.</span>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="shareLink">Shareable Link</label>
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        type="text"
                                                        id="shareLink"
                                                        className="form-control"
                                                        value={`${window.location.origin}/register?ref=${marketerData.referralCode}`}
                                                        readOnly
                                                        style={{ backgroundColor: '#f8f9fa', color: '#666' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-link"
                                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', textDecoration: 'none' }}
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(`${window.location.origin}/register?ref=${marketerData.referralCode}`);
                                                            toast.success('Link copied!');
                                                        }}
                                                    >
                                                        <i className="far fa-copy"></i> Copy
                                                    </button>
                                                </div>
                                                <span className="form-text">Send this link to users for direct registration.</span>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="companyName">Company Name</label>
                                                <input
                                                    type="text"
                                                    id="companyName"
                                                    className="form-control"
                                                    value={marketerData.companyName}
                                                    onChange={(e) => setMarketerData({ ...marketerData, companyName: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <div style={{ marginTop: '30px' }}>
                                                <button type="submit" className="tj-primary-btn" disabled={saving}>
                                                    <span className="btn-text"><span>{saving ? 'Saving Changes...' : 'Save Changes'}</span></span>
                                                    <span className="btn-icon"><i className="fas fa-arrow-right"></i></span>
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {activeTab === 'payout' && (
                                    <div className="animate-fade-up">
                                        <h3 style={{ marginBottom: '30px', color: '#000000', fontWeight: 600 }}>Payout Settings</h3>
                                        <form onSubmit={handleMarketerUpdate}>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label htmlFor="bankName">Bank Name</label>
                                                        <input
                                                            type="text"
                                                            id="bankName"
                                                            className="form-control"
                                                            value={marketerData.bankName}
                                                            onChange={(e) => setMarketerData({ ...marketerData, bankName: e.target.value })}
                                                            placeholder="State Bank of India"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label htmlFor="accountHolderName">Account Holder Name</label>
                                                        <input
                                                            type="text"
                                                            id="accountHolderName"
                                                            className="form-control"
                                                            value={marketerData.accountHolderName}
                                                            onChange={(e) => setMarketerData({ ...marketerData, accountHolderName: e.target.value })}
                                                            placeholder="John Doe"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label htmlFor="accountNumber">Account Number</label>
                                                        <input
                                                            type="text"
                                                            id="accountNumber"
                                                            className="form-control"
                                                            value={marketerData.accountNumber}
                                                            onChange={(e) => setMarketerData({ ...marketerData, accountNumber: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label htmlFor="ifscCode">IFSC Code</label>
                                                        <input
                                                            type="text"
                                                            id="ifscCode"
                                                            className="form-control"
                                                            value={marketerData.ifscCode}
                                                            onChange={(e) => setMarketerData({ ...marketerData, ifscCode: e.target.value })}
                                                            placeholder="SBIN0001234"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <hr style={{ margin: '20px 0', borderColor: '#eee' }} />
                                            <h5 style={{ marginBottom: '15px', color: '#000000', fontSize: '16px' }}>UPI Details</h5>

                                            <div className="form-group">
                                                <label htmlFor="upiId">UPI ID (Optional)</label>
                                                <input
                                                    type="text"
                                                    id="upiId"
                                                    className="form-control"
                                                    value={marketerData.upiId}
                                                    onChange={(e) => setMarketerData({ ...marketerData, upiId: e.target.value })}
                                                    placeholder="username@upi"
                                                />
                                            </div>

                                            <div style={{ marginTop: '30px' }}>
                                                <button type="submit" className="tj-primary-btn" disabled={saving}>
                                                    <span className="btn-text"><span>{saving ? 'Saving Changes...' : 'Save Changes'}</span></span>
                                                    <span className="btn-icon"><i className="fas fa-arrow-right"></i></span>
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {activeTab === 'password' && (
                                    <div className="animate-fade-up">
                                        <h3 style={{ marginBottom: '30px', color: '#000000', fontWeight: 600 }}>Change Password</h3>
                                        <form onSubmit={handlePasswordChange}>
                                            <div className="form-group">
                                                <label htmlFor="oldPassword">Current Password</label>
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        type={showPasswords.old ? "text" : "password"}
                                                        id="oldPassword"
                                                        className="form-control"
                                                        value={passwordData.oldPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePasswordVisibility('old')}
                                                        style={{
                                                            position: 'absolute',
                                                            right: '15px',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            color: '#64748b',
                                                            padding: 0,
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <i className={`far ${showPasswords.old ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="newPassword">New Password</label>
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        type={showPasswords.new ? "text" : "password"}
                                                        id="newPassword"
                                                        className="form-control"
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePasswordVisibility('new')}
                                                        style={{
                                                            position: 'absolute',
                                                            right: '15px',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            color: '#64748b',
                                                            padding: 0,
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <i className={`far ${showPasswords.new ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        type={showPasswords.confirm ? "text" : "password"}
                                                        id="confirmPassword"
                                                        className="form-control"
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePasswordVisibility('confirm')}
                                                        style={{
                                                            position: 'absolute',
                                                            right: '15px',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            color: '#64748b',
                                                            padding: 0,
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <i className={`far ${showPasswords.confirm ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-end mt-4">
                                                <button type="submit" className="tj-primary-btn" disabled={saving}>
                                                    <span className="btn-text"><span>{saving ? 'Changing Password...' : 'Change Password'}</span></span>
                                                    <span className="btn-icon"><i className="fas fa-arrow-right"></i></span>
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default Profile;
