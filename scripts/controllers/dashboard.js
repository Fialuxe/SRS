/**
 * Dashboard Controller
 * Handles TimeTable Grid and Task Tree rendering.
 */
import { store } from '../store.js';

export function renderDashboard(user) {
    if (!user) return;

    renderTimeTable(user.studentId);
    renderTaskTree(user.studentId);
}

// ==========================
// TimeTable Rendering
// ==========================
function renderTimeTable(studentId) {
    const grid = document.getElementById('timetable-grid');
    grid.innerHTML = '';

    // Days Headers
    const days = ['Per', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        const div = document.createElement('div');
        div.className = 'grid-header';
        div.textContent = day;
        grid.appendChild(div);
    });

    // Grid Cells (1-7 periods)
    for (let period = 1; period <= 7; period++) {
        // Period Label
        const label = document.createElement('div');
        label.className = 'grid-header';
        label.textContent = period;
        grid.appendChild(label);

        // Days Mon-Sat
        const dayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayKeys.forEach(day => {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';

            // Check for registered course
            const courses = store.getStudentRegistrations(studentId);
            const course = courses.find(c => c.day === day && c.period === period);

            if (course) {
                renderCourseCell(cell, course, studentId);
            }

            grid.appendChild(cell);
        });
    }
}

function renderCourseCell(cell, course, studentId) {
    cell.classList.add('filled');
    cell.innerHTML = `
        <div class="course-name">${course.name}</div>
        <div class="cell-icons">
             ${course.syllabusUrl ? '<span class="icon" title="Syllabus">📘</span>' : ''}
             ${course.lmsUrl ? '<span class="icon" title="Task Submission">📥</span>' : ''}
             <span class="icon notification-icon" title="Notification">${course.notificationEnabled ? '🔔' : '🔕'}</span>
        </div>
    `;

    // Click -> Modal
    cell.addEventListener('click', () => openCourseModal(course, studentId));
}

// ==========================
// Course Detail Modal
// ==========================
function openCourseModal(course, studentId) {
    const modal = document.getElementById('course-detail-modal');
    const overlay = document.getElementById('modal-overlay');

    modal.innerHTML = `
        <div class="modal-header">
            <h3>${course.name}</h3>
            <button id="modal-close">✖</button>
        </div>
        <p><strong>Instructor:</strong> ${course.instructor}</p>
        <p><strong>Room:</strong> ${course.room}</p>
        <hr>
        <p><a href="${course.syllabusUrl}" target="_blank">View Syllabus</a></p>
        ${course.lmsUrl ? `<p><a href="${course.lmsUrl}" target="_blank">Submit Assignment</a></p>` : ''}
        <hr>
        <div class="form-group">
            <label>
                <input type="checkbox" id="notification-toggle" ${course.notificationEnabled ? 'checked' : ''}>
                Receive Reminders
            </label>
        </div>
    `;

    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');

    // Close Logic
    const closeBtn = document.getElementById('modal-close');
    closeBtn.onclick = closeModal;
    overlay.onclick = closeModal;

    // Notification Toggle Logic
    const toggle = document.getElementById('notification-toggle');
    toggle.onchange = () => {
        const res = store.toggleNotification(studentId, course.id);
        if (res.success) {
            // Re-render dashboard to update icon
            renderDashboard(store.state.users.find(u => u.studentId === studentId));
        }
    };
}

function closeModal() {
    document.getElementById('course-detail-modal').classList.add('hidden');
    document.getElementById('modal-overlay').classList.add('hidden');
}

// ==========================
// Task Tree Rendering
// ==========================
function renderTaskTree(studentId) {
    const container = document.getElementById('task-tree-container');
    container.innerHTML = '';

    const tasks = store.getStudentTasks(studentId);

    // Group by Course
    // 3.1.1: Sort by TimeTable order (simplified here to just group by courseId for now)
    const grouped = tasks.reduce((acc, task) => {
        if (!acc[task.courseId]) acc[task.courseId] = [];
        acc[task.courseId].push(task);
        return acc;
    }, {});

    // Render Groups
    Object.keys(grouped).forEach(courseId => {
        const course = store.getCourses().find(c => c.id === courseId);
        const courseTasks = grouped[courseId];

        // Sort tasks: Deadline ASC
        courseTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

        const groupDiv = document.createElement('div');
        groupDiv.className = 'task-group';

        const activeCount = courseTasks.filter(t => t.status === 'incomplete').length;

        groupDiv.innerHTML = `
            <div class="task-group-title">
                ${course.name} <span style="font-size:0.8em; color:grey">(${activeCount})</span>
            </div>
        `;

        courseTasks.forEach(task => {
            const item = document.createElement('div');
            item.className = 'task-item';
            if (task.status === 'complete') item.classList.add('completed');

            // Format Deadline
            const d = new Date(task.deadline);
            const dateStr = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;

            item.innerHTML = `
                <input type="checkbox" ${task.status === 'complete' ? 'checked' : ''}>
                <span style="margin-left:8px">${task.title}</span>
                <span class="task-meta">${dateStr}</span>
            `;

            // Interaction
            const checkbox = item.querySelector('input');
            checkbox.onchange = (e) => {
                store.updateTaskStatus(task.id, e.target.checked);
                renderTaskTree(studentId); // Re-render to sort/strike
            };

            groupDiv.appendChild(item);
        });

        container.appendChild(groupDiv);
    });
}
