/**
 * Admin User Controller
 * Handles CSV Upload (Mock) and User Management (UC-01-01).
 */
import { store } from '../store.js';

export function renderAdminUser(user) {
    const uploadBtn = document.querySelector('.upload-section button');

    // Clear listeners trick
    const newBtn = uploadBtn.cloneNode(true);
    uploadBtn.parentNode.replaceChild(newBtn, uploadBtn);

    newBtn.addEventListener('click', handleUpload);

    renderUserList();
}

function handleUpload() {
    const fileInput = document.querySelector('.upload-section input[type="file"]');
    if (fileInput.files.length === 0) {
        alert("Please select a file.");
        return;
    }

    // Mock Processing
    alert("Uploading... (Simulating server delay)");
    setTimeout(() => {
        // Mock result
        alert("Upload Complete.\nSuccess: 5 users\nFailed: 0");
        // Add a mock user for demo
        store.addUser({
            studentId: `u${Math.floor(Math.random() * 1000000)}`,
            email: "new@uec.ac.jp",
            program: "J",
            status: "active",
            role: "student"
        });
        renderUserList();
    }, 1500);
}

function renderUserList() {
    const table = document.getElementById('user-list-table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const users = store.getUsers().filter(u => u.role === 'student'); // Show only students
    // Sort: Locked first
    users.sort((a, b) => (a.status === 'locked' ? -1 : 1));

    users.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.studentId}</td>
            <td>${u.email}</td>
            <td class="status-${u.status}">${u.status.toUpperCase()}</td>
            <td>
                ${u.status === 'locked' ? '<button class="btn-unlock">Unlock</button>' : '-'}
            </td>
        `;

        const unlockBtn = tr.querySelector('.btn-unlock');
        if (unlockBtn) {
            unlockBtn.addEventListener('click', () => {
                if (confirm(`Unlock account ${u.studentId}?`)) {
                    store.unlockUser(u.studentId);
                    renderUserList();
                }
            });
        }

        table.querySelector('tbody').appendChild(tr);
    });
}
