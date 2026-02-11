/**
 * Simulation Controller (v2)
 * Handles UC-04: Sheet Management, Mock Planning, and Reflection.
 * Refined for Semester/Program selection and Search/Filter logic.
 */
import { store } from '../store.js';

let currentStudent = null;
let sheets = [];
let activeSheetId = null;
let currentSemester = 1; // Default
let currentProgram = 'ICE'; // Default
let activeFilter = null; // { day: 'Mon', period: 1 } or null

export function renderSimulation(user) {
    if (!user) return;
    currentStudent = user;

    // Init Store Sim Data if not exists
    if (!localStorage.getItem('sim_sheets_' + user.studentId)) {
        sheets = [{ id: 'sheet1', name: 'Plan A', courses: [] }];
        saveSheets();
        activeSheetId = 'sheet1';
    } else {
        sheets = JSON.parse(localStorage.getItem('sim_sheets_' + user.studentId));
        activeSheetId = sheets[0].id;
    }

    renderTabs();
    renderActiveSheet();
    bindControls();

    // Initial Empty Search
    renderCourseSearch();
}

function saveSheets() {
    localStorage.setItem('sim_sheets_' + currentStudent.studentId, JSON.stringify(sheets));
}

function renderTabs() {
    const container = document.getElementById('sim-tabs');
    container.innerHTML = '';

    sheets.forEach(sheet => {
        const tab = document.createElement('div');
        tab.className = `sim-tab ${sheet.id === activeSheetId ? 'active' : ''}`;
        tab.textContent = sheet.name;
        tab.onclick = () => {
            activeSheetId = sheet.id;
            renderTabs();
            renderActiveSheet();
        };
        container.appendChild(tab);
    });
}

function renderActiveSheet() {
    const sheet = sheets.find(s => s.id === activeSheetId);
    document.getElementById('current-sheet-name').textContent = sheet.name;

    const grid = document.getElementById('sim-grid');
    grid.innerHTML = '';

    // Headers
    const days = ['Per', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        const div = document.createElement('div');
        div.className = 'grid-header';
        div.textContent = day;
        grid.appendChild(div);
    });

    for (let period = 1; period <= 7; period++) {
        const label = document.createElement('div');
        label.className = 'grid-header';
        label.textContent = period;
        grid.appendChild(label);

        const dayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayKeys.forEach(day => {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            if (activeFilter && activeFilter.day === day && activeFilter.period === period) {
                cell.classList.add('active-filter');
            }

            // Interaction: Click to Filter
            cell.onclick = (e) => {
                // If clicked on a filled cell (logic below), prompt remove.
                // If empty, set filter.
                if (cell.classList.contains('filled')) {
                    // handled by inner click or check below
                } else {
                    setActiveFilter(day, period);
                }
            };

            // Check sheet courses
            const courseId = sheet.courses.find(cId => {
                const c = store.getCourses().find(ref => ref.id === cId);
                return c && c.day === day && c.period === period;
            });

            if (courseId) {
                const c = store.getCourses().find(ref => ref.id === courseId);
                cell.classList.add('filled');
                cell.textContent = c.name;
                cell.style.fontSize = '0.8em';

                // Override click for removal
                cell.onclick = (e) => {
                    e.stopPropagation();
                    if (confirm(`Remove ${c.name} from plan?`)) {
                        sheet.courses = sheet.courses.filter(id => id !== c.id);
                        saveSheets();
                        renderActiveSheet();
                    }
                };
            }
            grid.appendChild(cell);
        });
    }

    renderSimulationCredits(sheet);
}

function renderSimulationCredits(sheet) {
    const list = document.getElementById('sim-credit-list');
    list.innerHTML = '';

    const reqs = store.state.graduationRequirements;
    if (!reqs) return;

    // Calculate credits from SHEET courses (not real registration)
    const sheetCourses = sheet.courses.map(cId => store.getCourses().find(c => c.id === cId)).filter(c => c);

    reqs.categories.forEach(cat => {
        let earned = sheetCourses
            .filter(c => c.category === cat.name)
            .reduce((sum, c) => sum + c.credits, 0);

        if (cat.children && cat.children.length > 0) {
            const childrenCredits = sheetCourses
                .filter(c => cat.children.includes(c.category))
                .reduce((sum, c) => sum + c.credits, 0);
            earned += childrenCredits;
        }

        const deficit = Math.max(0, cat.required - earned);
        const statusClass = deficit === 0 ? 'ok' : 'deficit';
        const label = deficit === 0 ? 'OK' : `-${deficit}`;

        const item = document.createElement('div');
        item.className = `sim-credit-item ${statusClass}`;
        item.innerHTML = `
            <span>${cat.name}</span>
            <span>${earned}/${cat.required} (${label})</span>
        `;
        list.appendChild(item);
    });
}

function setActiveFilter(day, period) {
    activeFilter = { day, period };
    // Update Input Placeholder
    const input = document.getElementById('sim-search-input');
    input.placeholder = `Filtering: ${day}/${period} (Click to clear)`;
    input.value = ''; // Clear text

    renderActiveSheet(); // Re-render to show highlight
    renderCourseSearch(); // Filter results
}

function renderCourseSearch() {
    const input = document.getElementById('sim-search-input');
    const keyword = input.value.toLowerCase();
    const container = document.getElementById('sim-search-results');
    container.innerHTML = '';

    let courses = store.getCourses();

    // Filter by Active Cell
    if (activeFilter) {
        courses = courses.filter(c => c.day === activeFilter.day && c.period === activeFilter.period);
    }

    // Filter by Keyword
    if (keyword) {
        courses = courses.filter(c =>
            c.name.toLowerCase().includes(keyword) ||
            c.instructor.toLowerCase().includes(keyword)
        );
    }

    if (courses.length === 0) {
        container.innerHTML = '<div style="padding:10px; color:#666;">No courses found.</div>';
        return;
    }

    courses.forEach(c => {
        const div = document.createElement('div');
        div.className = 'sim-course-item';
        div.innerHTML = `<strong>${c.name}</strong> <br> ${c.day}/${c.period} - ${c.instructor}`;

        div.onclick = () => {
            addCourseToSheet(c.id);
        };

        container.appendChild(div);
    });
}

function addCourseToSheet(cId) {
    const sheet = sheets.find(s => s.id === activeSheetId);
    const newCourse = store.getCourses().find(c => c.id === cId);

    // Conflict Check
    const conflict = sheet.courses.some(existingId => {
        const existing = store.getCourses().find(c => c.id === existingId);
        return existing.day === newCourse.day && existing.period === newCourse.period;
    });

    if (conflict) {
        alert("Time Conflict in this plan!");
    } else {
        sheet.courses.push(cId);
        saveSheets();
        renderActiveSheet();
        // clear filter after add? keep for now.
    }
}

function bindControls() {
    // Selectors
    document.getElementById('sim-semester-select').onchange = (e) => {
        currentSemester = e.target.value;
        // Logic to load different plans per semester could go here
        // For MVP, shared sheets.
    };

    document.getElementById('sim-program-select').onchange = (e) => {
        currentProgram = e.target.value;
    };

    // Search Input
    const input = document.getElementById('sim-search-input');
    input.onclick = () => {
        if (activeFilter) {
            activeFilter = null; // Clear filter on click
            input.placeholder = "Keyword or Click Cell...";
            renderActiveSheet();
            renderCourseSearch();
        }
    };
    input.onkeyup = renderCourseSearch;
    document.getElementById('btn-sim-search').onclick = renderCourseSearch;

    // New Sheet
    document.getElementById('btn-new-sheet').onclick = () => {
        if (sheets.length >= 3) {
            alert("Max sheets reached.");
            return;
        }
        sheets.push({
            id: 'sheet' + Date.now(),
            name: 'Plan ' + (sheets.length + 1),
            courses: []
        });
        saveSheets();
        renderTabs();
        activeSheetId = sheets[sheets.length - 1].id;
        renderActiveSheet();
    };

    // Reflect
    document.getElementById('btn-reflect-real').onclick = () => {
        const sheet = sheets.find(s => s.id === activeSheetId);
        if (confirm(`Overwrite real registration with ${sheet.name}?`)) {
            sheet.courses.forEach(cId => {
                store.addRegistration(currentStudent.studentId, cId);
            });
            alert("Applied to Registration!");
        }
    };
}
