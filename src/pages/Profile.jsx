import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import './Profile.css';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        address: '', // Add explicit address field if backend supports it
        city: '',
        country: 'US'
    });

    const [marketerData, setMarketerData] = useState({
        companyName: '',
        referralCode: ''
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
        setUser(currentUser);
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await userService.getProfile();
            if (response.success) {
                setProfile(response.data);
                setProfileData({
                    name: response.data.user.name,
                    phone: response.data.user.phone || '',
                    address: response.data.user.address || '',
                    city: response.data.user.city || '',
                    country: response.data.user.country || 'US'
                });
                if (response.data.marketer) {
                    setMarketerData({
                        companyName: response.data.marketer.company_name,
                        referralCode: response.data.marketer.referral_code
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await userService.updateProfile(profileData);
            if (response.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                fetchProfile();
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update profile',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleMarketerUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await userService.updateMarketerProfile(marketerData);
            if (response.success) {
                setMessage({ type: 'success', text: 'Marketer profile updated successfully!' });
                fetchProfile();
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update marketer profile',
            });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setSaving(true);

        try {
            const response = await userService.changePassword({
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword,
            });
            if (response.success) {
                setMessage({ type: 'success', text: 'Password changed successfully!' });
                setPasswordData({
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to change password',
            });
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
                                    <div className="profile-avatar">
                                        <i className="fa-light fa-user"></i>
                                    </div>
                                    <h3 className="profile-name">{profile?.user?.name || 'User'}</h3>
                                    <p className="profile-email">{profile?.user?.email || 'email@example.com'}</p>
                                </div>
                                <div className="profile-nav">
                                    <button
                                        className={`profile-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('profile')}
                                    >
                                        <span>Personal Information</span>
                                        <i className="tji-arrow-right-long"></i>
                                    </button>

                                    {user?.role === 'marketer' && (
                                        <button
                                            className={`profile-nav-btn ${activeTab === 'marketer' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('marketer')}
                                        >
                                            <span>Marketer Details</span>
                                            <i className="tji-arrow-right-long"></i>
                                        </button>
                                    )}

                                    <button
                                        className={`profile-nav-btn ${activeTab === 'password' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('password')}
                                    >
                                        <span>Change Password</span>
                                        <i className="tji-arrow-right-long"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-8">
                            <div className="profile-card">
                                {message.text && (
                                    <div className={`alert alert-${message.type}`}>
                                        {message.text}
                                    </div>
                                )}

                                {activeTab === 'profile' && (
                                    <div className="animate-fade-up">
                                        <h3 style={{ marginBottom: '30px', color: '#0c1e21', fontWeight: 600 }}>Personal Information</h3>
                                        <form onSubmit={handleProfileUpdate}>
                                            <div class="form-group">
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
                                                    value={profile?.user?.email}
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
                                                    <span className="btn-icon"><i className="tji-arrow-right-long"></i></span>
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {activeTab === 'marketer' && (
                                    <div className="animate-fade-up">
                                        <h3 style={{ marginBottom: '30px', color: '#0c1e21', fontWeight: 600 }}>Marketer Information</h3>
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
                                                            alert('Referral code copied!');
                                                        }}
                                                    >
                                                        <i className="fa-light fa-copy"></i> Copy
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
                                                            alert('Link copied!');
                                                        }}
                                                    >
                                                        <i className="fa-light fa-copy"></i> Copy
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
                                                    <span className="btn-icon"><i className="tji-arrow-right-long"></i></span>
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {activeTab === 'password' && (


                                    <div className="animate-fade-up">
                                        <h3 style={{ marginBottom: '30px', color: '#0c1e21', fontWeight: 600 }}>Change Password</h3>
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
                                                        <i className={`fa-light ${showPasswords.old ? 'fa-eye' : 'fa-eye-slash'}`}></i>
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
                                                        <i className={`fa-light ${showPasswords.new ? 'fa-eye' : 'fa-eye-slash'}`}></i>
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
                                                        <i className={`fa-light ${showPasswords.confirm ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                                                    </button>
                                                </div>
                                            </div>

                                            <div style={{ marginTop: '30px' }}>
                                                <button type="submit" className="tj-primary-btn" disabled={saving}>
                                                    <span className="btn-text"><span>{saving ? 'Changing Password...' : 'Change Password'}</span></span>
                                                    <span className="btn-icon"><i className="tji-arrow-right-long"></i></span>
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
