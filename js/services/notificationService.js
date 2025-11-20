// ==================== NOTIFICATION SERVICE ====================

const NotificationService = {
    show(message, type = 'info') {
        console.log(`Notification [${type}]: ${message}`);

        // Get or create notification container
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
            document.body.appendChild(container);
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade`;
        notification.style.cssText = 'min-width: 300px; margin-bottom: 10px; animation: slideIn 0.3s ease-out;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="close" data-dismiss="alert" onclick="this.parentElement.style.animation='slideOut 0.3s ease-out'; setTimeout(() => this.parentElement.remove(), 300)">
                <span>&times;</span>
            </button>
        `;

        container.appendChild(notification);

        // Add 'show' class for fade effect
        setTimeout(() => notification.classList.add('show'), 10);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }
};

window.NotificationService = NotificationService;