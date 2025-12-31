import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import SEO from '../components/common/SEO';
import './LegalPages.css';
const TermsConditions = () => {
    return (
        <DashboardLayout>
            <SEO title="Terms & Conditions" description="Read the Terms and Conditions for using Stoxzo services." />
            <section className="page-section">
                <div className="container">
                    <div className="page-header text-center mb-5">
                        <h2>Terms & Conditions</h2>
                        <p className="text-muted">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="card shadow-sm border-0 legal-card">
                        <div className="card-body p-4 p-md-5">
                            <h4>1. Agreement to Terms</h4>
                            <p>By accessing our website, you agree to be bound by these Terms of Service and to comply with all applicable laws and regulations.</p>

                            <h4 className="mt-4">2. Intellectual Property Rights</h4>
                            <p>Other than the content you own, under these Terms, Stoxzo and/or its licensors own all the intellectual property rights and materials contained in this Website.</p>

                            <h4 className="mt-4">3. Restrictions</h4>
                            <p>You are specifically restricted from all of the following:</p>
                            <ul>
                                <li>Publishing any Website material in any other media;</li>
                                <li>Selling, sublicensing and/or otherwise commercializing any Website material;</li>
                                <li>Publicly performing and/or showing any Website material;</li>
                                <li>Using this Website in any way that is or may be damaging to this Website;</li>
                                <li>Using this Website in any way that impacts user access to this Website;</li>
                            </ul>

                            <h4 className="mt-4">4. Limitation of Liability</h4>
                            <p>In no event shall Stoxzo, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this Website.</p>

                            <h4 className="mt-4">5. Governing Law & Jurisdiction</h4>
                            <p>These Terms will be governed by and interpreted in accordance with the laws of the State, and you submit to the non-exclusive jurisdiction of the state and federal courts located in us for the resolution of any disputes.</p>
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default TermsConditions;
