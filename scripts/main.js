/**
 * CampUsFlow Main Script
 * Handles initialization, routing, and global event listeners.
 */
import { store } from './store.js';

// Global State
let currentUser = null;

// DOM Elements & Views
const views = {
    login: document.getElementById('view-login'),
    dashboard: document.getElementById('view-dashboard'),
    registration: document.getElementById('view-registration'),
    creditStatus: document.getElementById('view-credit-status'),
    adminUser: document.getElementById('view-admin-user'),
    adminSystem: document.getElementById('view-admin-system')
};

// Router
function navigateTo(viewName) {
    console.log(`Navigating to: ${viewName}`);

    // Admin Views are top-level
    if (viewName.startsWith('admin')) {
        document.getElementById('student-portal').classList.add('hidden');
        document.getElementById('view-login').classList.add('hidden');
        document.getElementById('view-admin-user').classList.add(viewName === 'adminUser' ? '' : 'hidden');
        document.getElementById('view-admin-system').classList.add(viewName === 'adminSystem' ? '' : 'hidden');

        if (viewName === 'adminUser') document.getElementById('view-admin-user').classList.remove('hidden');
        if (viewName === 'adminSystem') document.getElementById('view-admin-system').classList.remove('hidden');

        // Render
        if (viewName === 'adminUser') import('./controllers/admin_user.js').then(m => m.renderAdminUser(currentUser));
        if (viewName === 'adminSystem') import('./controllers/admin_system.js').then(m => m.renderAdminSystem(currentUser));
        return;
    }

    // Login
    if (viewName === 'login') {
        document.getElementById('student-portal').classList.add('hidden');
        document.getElementById('view-admin-user').classList.add('hidden');
        document.getElementById('view-admin-system').classList.add('hidden');
        document.getElementById('view-login').classList.remove('hidden');
        return;
    }

    // Student Views (Dashboard, Reg, Sim, Credit)
    // Show Portal Container
    document.getElementById('view-login').classList.add('hidden');
    document.getElementById('view-admin-user').classList.add('hidden');
    document.getElementById('student-portal').classList.remove('hidden');

    // Hide all sub-views in portal
    document.querySelectorAll('.sub-view').forEach(el => el.classList.add('hidden'));

    // Show target sub-view
    const target = document.getElementById('view-' + viewName);
    if (target) {
        target.classList.remove('hidden');

        // Update Nav Active State
        document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
        // (Simple matching logic)

        // Render
        if (viewName === 'dashboard') import('./controllers/dashboard.js').then(m => m.renderDashboard(currentUser));
        if (viewName === 'registration') import('./controllers/registration.js').then(m => m.renderRegistration(currentUser));
        if (viewName === 'simulation') import('./controllers/simulation.js').then(m => m.renderSimulation(currentUser));
        if (viewName === 'creditStatus') import('./controllers/credit_status.js').then(m => m.renderCreditStatus(currentUser));
    }
}

// Render Logic (Dispatcher)
function renderView(viewName) {
    switch (viewName) {
        case 'dashboard':
            // Dynamic import or local function to render dashboard
            import('./controllers/dashboard.js').then(m => m.renderDashboard(currentUser));
            break;
        case 'registration':
            import('./controllers/registration.js').then(m => m.renderRegistration(currentUser));
            break;
        case 'creditStatus':
            import('./controllers/credit_status.js').then(m => m.renderCreditStatus(currentUser));
            break;
        case 'adminUser':
            import('./controllers/admin_user.js').then(m => m.renderAdminUser(currentUser));
            break;
        case 'adminSystem':
            import('./controllers/admin_system.js').then(m => m.renderAdminSystem(currentUser));
            break;
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log("CampUsFlow initialized");

    // Check if user is logged in (conceptually)
    // For now, always start at Login
    navigateTo('login');

    // Setup Login Form Listener
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

function handleLogin(e) {
    e.preventDefault();
    const id = document.getElementById('input-id').value;
    const password = document.getElementById('input-password').value;

    const result = store.login(id, password);

    if (result.success) {
        currentUser = result.user;
        console.log("Logged in as:", currentUser.role);

        if (currentUser.role === 'admin') {
            navigateTo('adminUser'); // Default admin view
        } else {
            navigateTo('dashboard'); // Default student view
        }
    } else {
        alert(result.message); // Simple alert for MVP
    }
}

// Expose navigate globally for inline onclicks 
window.app = {
    navigate: navigateTo,
    logout: () => {
        currentUser = null;
        navigateTo('login');
    }
};
