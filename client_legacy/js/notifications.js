/**
 * NotificationManager
 * Handles browser push notifications for WKNsite.
 */
class NotificationManager {
    constructor() {
        this.permission = ("Notification" in window) ? Notification.permission : "default";
        this.enabled = localStorage.getItem('wkn_notifications_enabled') === 'true';
        this.icon = 'assets/wkn_logo.png';
        this.shownTags = new Set();
    }

    /**
     * Initialize notification settings and UI
     */
    init() {
        console.log('NotificationManager initialized. Current permission:', this.permission);
        this.updateUI();
    }

    /**
     * Request permission from the user
     */
    async requestPermission() {
        if (!("Notification" in window)) {
            alert("Browser ini tidak mendukung notifikasi desktop.");
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            
            if (permission === "granted") {
                this.enabled = true;
                localStorage.setItem('wkn_notifications_enabled', 'true');
                this.show("Notifikasi Aktif", "Anda akan menerima peringatan kontrak melalui browser.");
            } else {
                this.enabled = false;
                localStorage.setItem('wkn_notifications_enabled', 'false');
            }
            
            this.updateUI();
            return permission;
        } catch (error) {
            console.error("Error requesting notification permission:", error);
        }
    }

    /**
     * Show a notification
     * @param {string} title 
     * @param {string} body 
     * @param {string} tag - Unique tag to prevent duplicates
     */
    show(title, body, tag = 'wkn-alert') {
        if (this.permission !== "granted" || !this.enabled) {
            return;
        }

        // Avoid spamming the same notification in one session
        if (this.shownTags.has(tag)) {
            return;
        }

        const options = {
            body: body,
            icon: this.icon,
            tag: tag,
            requireInteraction: false
        };

        try {
            const notification = new Notification(title, options);
            this.shownTags.add(tag);

            notification.onclick = function(event) {
                event.preventDefault();
                window.focus();
                notification.close();
            };
        } catch (e) {
            console.error("Failed to show notification:", e);
        }
    }

    /**
     * Update UI elements related to notifications
     */
    updateUI() {
        const btn = document.getElementById('btn-toggle-notifications');
        const statusText = document.getElementById('notification-status-text');

        if (!btn) return;

        if (this.permission === "granted") {
            btn.innerHTML = '<i class="fas fa-bell"></i> Notifikasi Aktif';
            btn.classList.add('active');
            if (statusText) statusText.innerText = "Izin diberikan";
        } else if (this.permission === "denied") {
            btn.innerHTML = '<i class="fas fa-bell-slash"></i> Notifikasi Diblokir';
            btn.classList.add('blocked');
            if (statusText) statusText.innerText = "Izin diblokir browser";
        } else {
            btn.innerHTML = '<i class="fas fa-bell"></i> Aktifkan Notifikasi';
            btn.classList.remove('active', 'blocked');
            if (statusText) statusText.innerText = "Belum diatur";
        }
    }

    /**
     * Toggle notifications on/off
     */
    toggle() {
        if (this.permission === "default") {
            this.requestPermission();
        } else if (this.permission === "granted") {
            this.enabled = !this.enabled;
            localStorage.setItem('wkn_notifications_enabled', this.enabled);
            this.updateUI();
            
            if (this.enabled) {
                this.show("Notifikasi Diaktifkan", "Anda akan kembali menerima peringatan.");
            }
        } else {
            alert("Notifikasi diblokir oleh browser. Silakan ubah pengaturan izin di bar alamat browser Anda.");
        }
    }
}

// Export a singleton instance
const wknNotifications = new NotificationManager();
window.wknNotifications = wknNotifications;

document.addEventListener('DOMContentLoaded', () => {
    wknNotifications.init();
});
