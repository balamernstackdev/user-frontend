import React from 'react';
import './SecurePaymentCard.css';

const SecurePaymentCard = ({ plan, amount, onPay, processing, onCancel }) => {
    const [formData, setFormData] = React.useState({
        cardNumber: '1234 5678 9012 3456',
        expiry: '12/30',
        cvv: '123',
        name: 'John Doe'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="secure-payment-card animate-fade-up">
            <div className="secure-payment-header">
                <h2>Secure Payment</h2>
                <p>Powered by Razorpay</p>
            </div>

            <div className="razorpay-logo-container">
                <p>Secure Payment Gateway</p>
                <div className="razorpay-logo-text">Razorpay</div>
            </div>

            <div className="payment-amount-display">
                <span className="label">Amount to Pay</span>
                <div className="value">₹{amount}</div>
            </div>

            <div className="card-form-container">
                <div className="form-group">
                    <label>Card Number</label>
                    <input
                        type="text"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        className="form-control"
                        value={formData.cardNumber}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group col-half">
                        <label>Expiry Date</label>
                        <input
                            type="text"
                            name="expiry"
                            placeholder="MM/YY"
                            className="form-control"
                            value={formData.expiry}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group col-half">
                        <label>CVV</label>
                        <input
                            type="text"
                            name="cvv"
                            placeholder="123"
                            className="form-control"
                            value={formData.cvv}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="security-info-box">
                <i className="fa-light fa-lock"></i>
                <p>Your payment information is encrypted and secure. We do not store your card details.</p>
            </div>

            <div className="pay-button-container">
                <button
                    className="tj-primary-btn"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => onPay(formData)}
                    disabled={processing}
                >
                    <span className="btn-text">
                        <span>{processing ? 'Processing Securely...' : `Pay ₹${amount}`}</span>
                    </span>
                    {!processing && <span className="btn-icon"><i className="tji-arrow-right-long"></i></span>}
                </button>
            </div>

            <div className="cancel-link">
                <a onClick={onCancel}>Cancel Payment</a>
            </div>
        </div>
    );
};

export default SecurePaymentCard;
