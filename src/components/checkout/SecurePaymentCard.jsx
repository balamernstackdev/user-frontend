import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';

const SecurePaymentCard = ({ plan, amount, onPay, processing, onCancel }) => {
    const { settings } = useSettings();
    const symbol = settings?.currency_symbol || '₹';

    // Default Test Data (Razorpay Test Card)
    const [formData, setFormData] = useState({
        cardNumber: '4242 4242 4242 4242',
        expiryDate: '12/30',
        cvv: '123',
        cardName: 'Test User'
    });

    const handleChange = (e) => {
        let { name, value } = e.target;

        // Input formatting logic from the HTML script
        if (name === 'cardNumber') {
            value = value.replace(/\s/g, '');
            value = value.match(/.{1,4}/g)?.join(' ') || value;
            if (value.length > 19) return;
        } else if (name === 'expiryDate') {
            value = value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            if (value.length > 5) return;
        } else if (name === 'cvv') {
            value = value.replace(/\D/g, '');
            if (value.length > 4) return;
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onPay(formData);
    };

    return (
        <div className="payment-card-secure">
            <div className="payment-header-secure">
                <h2>Secure Payment</h2>
                <p style={{ color: 'var(--tj-color-text-body-3)' }}>Powered by Razorpay</p>
            </div>

            <div className="razorpay-logo">
                <p style={{ color: 'var(--tj-color-text-body-3)', marginBottom: '10px' }}>Secure Payment Gateway</p>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--tj-color-theme-primary)' }}>Razorpay</div>
            </div>

            <div className="payment-amount">
                <div className="amount-label">Amount to Pay</div>
                <div className="amount-value">{symbol}{amount}</div>
            </div>

            <form className="payment-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="cardNumber">Card Number</label>
                    <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="expiryDate">Expiry Date</label>
                        <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            placeholder="MM/YY"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="cvv">CVV</label>
                        <input
                            type="password"
                            id="cvv"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleChange}
                            placeholder="123"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="cardName">Cardholder Name</label>
                    <input
                        type="text"
                        id="cardName"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                    />
                </div>

                <div className="security-info">
                    <i className="fas fa-lock"></i>
                    <p>Your payment information is encrypted and secure. We do not store your card details.</p>
                </div>

                {processing && (
                    <div className="text-center mb-3">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Processing payment...</p>
                    </div>
                )}

                <button
                    type="submit"
                    className="tj-primary-btn"
                    style={{ width: '100%', justifyContent: 'center' }}
                    disabled={processing}
                >
                    <span className="btn-text"><span>Pay {symbol}{amount}</span></span>
                    <span className="btn-icon"><i className="fas fa-arrow-right"></i></span>
                </button>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <a onClick={onCancel} style={{ fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}>Cancel Payment</a>
                </div>
            </form>
        </div>
    );
};

export default SecurePaymentCard;
