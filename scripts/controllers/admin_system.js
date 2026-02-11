/**
 * Admin System Controller
 * Handles System Status and Logs (Non-functional requirements visualization).
 */
import { store } from '../store.js';

export function renderAdminSystem(user) {
    renderStatus();
    renderLogs();
}

function renderStatus() {
    const status = store.getSystemStatus();

    // Syllabus
    const sylEl = document.getElementById('status-syllabus');
    sylEl.className = `card status-${status.syllabusSync.status === 'normal' ? 'active' : 'locked'}`; // reuse colors
    sylEl.innerHTML = `
        <h3>Syllabus Sync</h3>
        <p>Status: <strong>${status.syllabusSync.status.toUpperCase()}</strong></p>
        <p>Last Success: ${status.syllabusSync.lastSuccess}</p>
    `;

    // LMS
    const lmsEl = document.getElementById('status-lms');
    lmsEl.className = `card status-${status.lmsSync.status === 'normal' ? 'active' : 'locked'}`;
    lmsEl.innerHTML = `
        <h3>LMS Sync</h3>
        <p>Status: <strong>${status.lmsSync.status.toUpperCase()}</strong></p>
        <p>Last Failure: ${status.lmsSync.lastFailure}</p>
    `;
}

function renderLogs() {
    const list = document.getElementById('error-log-list');
    list.innerHTML = '';

    const logs = store.getSystemLogs();

    logs.forEach(log => {
        const li = document.createElement('li');
        li.style.borderBottom = '1px solid #ccc';
        li.style.padding = '8px';
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.backgroundColor = log.acknowledged ? '#f9f9f9' : '#fff0f0'; // Red bg for unack

        li.innerHTML = `
            <div>
                <strong>[${log.type.toUpperCase()}]</strong> ${log.timestamp} <br>
                ${log.message} (Target: ${log.target})
            </div>
            ${!log.acknowledged ? '<button class="btn-ack">Acknowledge</button>' : '<span style="color:green">✔ Ack</span>'}
        `;

        const btn = li.querySelector('.btn-ack');
        if (btn) {
            btn.addEventListener('click', () => {
                store.acknowledgeLog(log.id);
                renderLogs();
            });
        }

        list.appendChild(li);
    });
}
