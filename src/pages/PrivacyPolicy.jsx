import { useSettings } from '../context/SettingsContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import SEO from '../components/common/SEO';
import './styles/LegalPages.css';

const PrivacyPolicy = () => {
    const { settings } = useSettings();
    return (
        <DashboardLayout>
            <SEO title="Privacy Policy" description={`Learn how ${settings.site_name || 'Stoxzo'} protects your personal information.`} />
            <section className="page-section">
                <div className="container">
                    <div className="page-header text-center mb-5">
                        <h2>Privacy Policy</h2>
                        <p className="text-muted">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="card shadow-sm border-0 legal-card">
                        <div className="card-body p-4 p-md-5">
                            <h4>1. Introduction</h4>
                            <p>Welcome to {settings.site_name || 'Stoxzo'}. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.</p>

                            <h4 className="mt-4">2. Data We Collect</h4>
                            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows: Identity Data, Contact Data, Financial Data, Transaction Data, and Technical Data.</p>

                            <h4 className="mt-4">3. How We Use Your Data</h4>
                            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                            <ul>
                                <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                                <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                                <li>Where we need to comply with a legal or regulatory obligation.</li>
                            </ul>

                            <h4 className="mt-4">4. Data Security</h4>
                            <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.</p>

                            <h4 className="mt-4">5. Contact Us</h4>
                            <p>If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href={`mailto:${settings.support_email || 'support@stoxzo.com'}`}>{settings.support_email || 'support@stoxzo.com'}</a></p>
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default PrivacyPolicy;
