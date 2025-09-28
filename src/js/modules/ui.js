export class UIModule {
    constructor() {
        this.statusElement = null;
        this.loginButton = null;
        this.logoutButton = null;
        this.userInfo = null;
        this.userAvatar = null;
    }

    init() {
        this.statusElement = document.getElementById('status');
        this.loginButton = document.getElementById('loginButton');
        this.logoutButton = document.getElementById('logoutButton');
        this.userInfo = document.getElementById('userInfo');
        this.userAvatar = document.getElementById('userAvatar');
    }

    showStatus(message, type = 'loading') {
        if (!this.statusElement) return;

        this.statusElement.textContent = message;
        this.statusElement.className = `status ${type}`;
        this.statusElement.style.display = 'block';
    }

    hideStatus() {
        if (!this.statusElement) return;
        this.statusElement.style.display = 'none';
    }

    updateAuthUI(user) {
        if (user) {
            // Show authenticated state
            if (this.loginButton) this.loginButton.style.display = 'none';
            if (this.userInfo) {
                this.userInfo.style.display = 'block';
                this.userInfo.querySelector('.user-name').textContent = user.displayName;
                this.userInfo.querySelector('.user-email').textContent = user.email;
            }
            if (this.userAvatar) {
                this.userAvatar.src = user.photoURL || '';
                this.userAvatar.alt = `${user.displayName}'s Avatar`;
            }
            if (this.logoutButton) this.logoutButton.style.display = 'block';
        } else {
            // Show unauthenticated state
            if (this.loginButton) this.loginButton.style.display = 'block';
            if (this.userInfo) this.userInfo.style.display = 'none';
            if (this.logoutButton) this.logoutButton.style.display = 'none';
        }
    }

    // Keep backward compatibility
    updateLoginButton(user) {
        this.updateAuthUI(user);
    }

    addLoginButtonListener(callback) {
        if (!this.loginButton) return;
        this.loginButton.addEventListener('click', callback);
    }

    addLogoutButtonListener(callback) {
        if (!this.logoutButton) return;
        this.logoutButton.addEventListener('click', callback);
    }
}