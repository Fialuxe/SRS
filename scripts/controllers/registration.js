/**
 * Registration Controller
 * Handles Course Search and Registration Logic (UC-03-01).
 */
import { store } from '../store.js';

let currentStudentId = null;

export function renderRegistration(user) {
    if (!user) return;
    currentStudentId = user.studentId;

    // Bind Event Listeners
    const searchBtn = document.querySelector('.search-panel button');
    const commitBtn = document.querySelector('.draft-panel button');

    // Clear previous bindings (simple approach, better to use named functions)
    const newSearchBtn = searchBtn.cloneNode(true);
    searchBtn.parentNode.replaceChild(newSearchBtn, searchBtn);
    newSearchBtn.addEventListener('click', handleSearch);

    // Initial Render of Current Registration (Draft Calendar)
    renderDraftCalendar();
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('history-list');
    if (!container) return; // Guard
    container.innerHTML = '';

    const history = store.getAcademicHistory(currentStudentId);

    if (history.length === 0) {
        container.innerHTML = '<p style="padding:10px; color:#666">No academic history records.</p>';
        return;
    }

    history.forEach(h => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div>
                <strong>${h.name}</strong> (${h.courseId})<br>
                <small>Sem ${h.semester} | ${h.credits} Credits</small>
            </div>
            <div style="font-weight:bold; color: ${h.grade === 'F' ? 'red' : 'green'}">
                ${h.grade}
            </div>
        `;
        container.appendChild(div);
    });
}

function handleSearch() {
    const input = document.querySelector('.search-panel input');
    const keyword = input.value.toLowerCase();

    const allCourses = store.getCourses();
    const results = allCourses.filter(c =>
        c.name.toLowerCase().includes(keyword) ||
        c.instructor.toLowerCase().includes(keyword)
    );

    renderSearchResults(results);
}

function renderSearchResults(courses) {
    const container = document.getElementById('search-results');
    container.innerHTML = '';

    if (courses.length === 0) {
        container.innerHTML = '<p>No courses found.</p>';
        return;
    }

    const table = document.createElement('table');
    table.style.width = '100%';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Instructor</th>
                <th>Day/Per</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    courses.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.id}</td>
            <td>${c.name}</td>
            <td>${c.instructor}</td>
            <td>${c.day} / ${c.period}</td>
            <td><button class="btn-add">Add</button></td>
        `;

        // Add Button
        tr.querySelector('.btn-add').addEventListener('click', () => {
            const res = store.addRegistration(currentStudentId, c.id);
            if (res.success) {
                renderDraftCalendar();
                alert(`Registered ${c.name}`);
            } else {
                alert(`Error: ${res.error}`);
            }
        });

        table.querySelector('tbody').appendChild(tr);
    });

    container.appendChild(table);
}

function renderDraftCalendar() {
    const container = document.getElementById('draft-calendar');
    container.innerHTML = '';

    const registered = store.getStudentRegistrations(currentStudentId);
    if (registered.length === 0) {
        container.innerHTML = '<p>No courses registered.</p>';
        return;
    }

    const list = document.createElement('ul');
    registered.forEach(c => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.padding = '4px 0';
        li.innerHTML = `
            <span>${c.name} (${c.day}${c.period})</span>
            <button class="btn-delete" style="color:red; background:none;">Delete</button>
        `;

        li.querySelector('.btn-delete').addEventListener('click', () => {
            if (confirm(`Really delete ${c.name}?`)) {
                store.removeRegistration(currentStudentId, c.id);
                renderDraftCalendar();
            }
        });

        list.appendChild(li);
    });

    container.appendChild(list);

    // Update credits total (feature extension)
    const total = registered.reduce((sum, c) => sum + c.credits, 0);
    const totalDiv = document.createElement('div');
    totalDiv.innerHTML = `<strong>Total Credits: ${total}</strong>`;
    container.appendChild(totalDiv);
}
