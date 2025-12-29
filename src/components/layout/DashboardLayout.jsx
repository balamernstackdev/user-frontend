import Header from './Header';
import Footer from './Footer';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
    // We can assume user is authenticated here or check context
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div className="dashboard-layout">
            <Header notificationCount={3} />

            <main className="main-content" style={{ minHeight: 'calc(100vh - 400px)' }}>
                {children}
            </main>

            <Footer />
        </div>
    );
};

export default DashboardLayout;
