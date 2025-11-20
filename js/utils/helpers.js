// ==================== UTILITY FUNCTIONS ====================

const Utils = {
    /**
     * Generate unique ID for tasks
     */
    generateId() {
        return Date.now() + Math.random();
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Format date for display (ID-ID locale)
     */
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('id-ID', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Get difficulty badge configuration
     */
    getDifficultyBadge(difficulty) {
        const badges = {
            easy: { class: 'success', icon: 'smile', text: 'Easy' },
            medium: { class: 'warning', icon: 'meh', text: 'Medium' },
            hard: { class: 'danger', icon: 'fire', text: 'Hard' }
        };
        return badges[difficulty] || badges.medium;
    }
};

// Expose to window for global access if needed, or use in other scripts
window.Utils = Utils;