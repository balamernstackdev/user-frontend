import React from 'react';

/**
 * Reusable Pagination Component
 * 
 * @param {object} props
 * @param {number} props.currentPage - Current page number (1-based)
 * @param {number} props.totalPages - Total number of pages
 * @param {function} props.onPageChange - Callback function(newPage)
 * @param {boolean} props.disabled - Whether pagination is disabled
 */
const Pagination = ({ currentPage, totalPages, onPageChange, disabled = false }) => {
    if (totalPages <= 1) return null;

    const scrollToTop = () => {
        // Use a small timeout to ensure DOM updates (if any) don't override the scroll
        setTimeout(() => {
            // Target all potential scrolling containers
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;

            const layout = document.querySelector('.dashboard-layout');
            if (layout) layout.scrollTop = 0;

            const main = document.querySelector('main');
            if (main) main.scrollTop = 0;
        }, 50);
    };

    const handlePrevious = () => {
        if (currentPage > 1 && !disabled) {
            onPageChange(currentPage - 1);
            scrollToTop();
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages && !disabled) {
            onPageChange(currentPage + 1);
            scrollToTop();
        }
    };

    return (
        <div className="pagination-area mt-4 d-flex justify-content-center align-items-center gap-3">
            <button
                className={`tj-primary-btn btn-sm ${currentPage === 1 ? 'disabled' : ''}`}
                onClick={handlePrevious}
                disabled={currentPage === 1 || disabled}
                style={{ padding: '8px 16px', opacity: currentPage === 1 ? 0.6 : 1 }}
            >
                <i className="fas fa-chevron-left"></i> Previous
            </button>

            <span className="pagination-info" style={{ fontWeight: 600, color: '#333' }}>
                Page {currentPage} of {totalPages}
            </span>

            <button
                className={`tj-primary-btn btn-sm ${currentPage === totalPages ? 'disabled' : ''}`}
                onClick={handleNext}
                disabled={currentPage === totalPages || disabled}
                style={{ padding: '8px 16px', opacity: currentPage === totalPages ? 0.6 : 1 }}
            >
                Next <i className="fas fa-chevron-right"></i>
            </button>
        </div>
    );
};

export default Pagination;
