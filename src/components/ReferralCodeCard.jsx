import { useState, useEffect } from 'react';
import referralService from '../services/referral.service';

const ReferralCodeCard = () => {
    const [referralData, setReferralData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchReferralCode();
    }, []);

    const fetchReferralCode = async () => {
        try {
            const response = await referralService.getMyCode();
            if (response.success) {
                setReferralData(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch referral code:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="card">
                <div className="card-body">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (!referralData) {
        return null;
    }

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">🎯 Your Referral Code</h3>
            </div>
            <div className="card-body">
                <div className="mb-md">
                    <p className="text-muted text-small">Share this code with users to earn commissions</p>
                    <div
                        className="referral-code-box"
                        style={{
                            background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)',
                            padding: 'var(--spacing-md)',
                            borderRadius: 'var(--border-radius-lg)',
                            marginTop: 'var(--spacing-sm)',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                        }}
                        onClick={() => copyToClipboard(referralData.referralCode)}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <p
                            style={{
                                fontSize: 'var(--font-size-2xl)',
                                fontWeight: 'bold',
                                color: 'white',
                                letterSpacing: '4px',
                                margin: 0
                            }}
                        >
                            {referralData.referralCode}
                        </p>
                        <p
                            style={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontSize: 'var(--font-size-sm)',
                                marginTop: 'var(--spacing-xs)'
                            }}
                        >
                            {copied ? '✓ Copied!' : 'Click to copy'}
                        </p>
                    </div>
                </div>

                <div className="mt-md">
                    <p className="text-muted text-small mb-xs">Referral Link</p>
                    <div
                        className="input-group"
                        style={{
                            display: 'flex',
                            gap: 'var(--spacing-xs)',
                        }}
                    >
                        <input
                            type="text"
                            className="form-input"
                            value={referralData.referralLink}
                            readOnly
                            style={{ flex: 1 }}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={() => copyToClipboard(referralData.referralLink)}
                        >
                            {copied ? '✓ Copied' : 'Copy Link'}
                        </button>
                    </div>
                </div>

                <div className="mt-md" style={{
                    background: 'var(--glass-bg)',
                    padding: 'var(--spacing-sm)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--glass-border)'
                }}>
                    <div className="flex justify-between align-center">
                        <div>
                            <p className="text-muted text-small">Total Referrals</p>
                            <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: '600' }}>
                                {referralData.totalReferrals || 0}
                            </p>
                        </div>
                        <div style={{ fontSize: '2rem' }}>👥</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferralCodeCard;
