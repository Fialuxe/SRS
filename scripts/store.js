/**
 * CampUsFlow Mock Store
 * Simulates Database and State Management.
 * Uses localStorage for persistence across reloads.
 */

import { INITIAL_DATA } from './mock_data.js';

class MockStore {
    constructor() {
        this.STORAGE_KEY = 'campusflow_db_v1';
        this.init();
    }

    init() {
        let currentData = JSON.parse(localStorage.getItem(this.STORAGE_KEY));

        if (!currentData) {
            currentData = INITIAL_DATA;
            console.log("Mock DB Initialized with Seed Data");
        } else {
            // Migration / Integrity Check: specific to this update
            // Ensure graduationRequirements and academicHistory exist
            if (!currentData.graduationRequirements) {
                currentData.graduationRequirements = INITIAL_DATA.graduationRequirements;
            }
            if (!currentData.academicHistory) {
                currentData.academicHistory = INITIAL_DATA.academicHistory;
            }
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentData));
        this.state = currentData;
    }

    reset() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.init();
    }

    _commit() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    }

    // --- Authentication ---

    login(studentId, password) {
        // Simple hash check simulation (In real app, hash the input password before comparing)
        // For mock, we'll just check if the user exists.

        const user = this.state.users.find(u => u.studentId === studentId);

        if (!user) {
            return { success: false, message: "User not found" };
        }

        if (user.status === 'locked') {
            return { success: false, message: "Account is locked" };
        }

        // Mock Password Validation: predefined "password" for student, "admin" for admin

        // Return session info
        return { success: true, user: user, sessionId: "sess_" + Date.now() };
    }

    // --- User Management ---

    getUsers() {
        return this.state.users;
    }

    addUser(user) {
        if (this.state.users.find(u => u.studentId === user.studentId)) {
            return { success: false, message: "Duplicate Student ID" };
        }
        this.state.users.push(user);
        this._commit();
        return { success: true };
    }

    unlockUser(studentId) {
        const user = this.state.users.find(u => u.studentId === studentId);
        if (user) {
            user.status = 'active';
            user.failedLoginAttempts = 0;
            this._commit();
            return { success: true };
        }
        return { success: false };
    }

    // --- Course / Registration ---

    getCourses() {
        return this.state.courses;
    }

    getStudentRegistrations(studentId) {
        const regs = this.state.registrations.filter(r => r.studentId === studentId);
        return regs.map(r => {
            const course = this.state.courses.find(c => c.id === r.courseId);
            return { ...course, notificationEnabled: r.notificationEnabled };
        });
    }

    addRegistration(studentId, courseId) {
        // Check duplication
        if (this.state.registrations.some(r => r.studentId === studentId && r.courseId === courseId)) {
            return { success: false, error: "Already registered" };
        }

        // Check time conflict
        const course = this.state.courses.find(c => c.id === courseId);
        const studentCourses = this.getStudentRegistrations(studentId);
        const conflict = studentCourses.find(c => c.day === course.day && c.period === course.period);
        if (conflict) {
            return { success: false, error: `Time conflict with ${conflict.name}` };
        }

        // CAP validation omitted for simplicity in this method, but should be in controller.

        this.state.registrations.push({ studentId, courseId, notificationEnabled: true });
        this._commit();
        return { success: true };
    }

    removeRegistration(studentId, courseId) {
        this.state.registrations = this.state.registrations.filter(r => !(r.studentId === studentId && r.courseId === courseId));
        this._commit();
        return { success: true };
    }

    toggleNotification(studentId, courseId) {
        const reg = this.state.registrations.find(r => r.studentId === studentId && r.courseId === courseId);
        if (reg) {
            reg.notificationEnabled = !reg.notificationEnabled;
            this._commit();
            return { success: true, newState: reg.notificationEnabled };
        }
        return { success: false };
    }

    // --- Tasks ---

    getStudentTasks(studentId) {
        return this.state.tasks.filter(t => t.studentId === studentId);
    }

    updateTaskStatus(taskId, isComplete) {
        const task = this.state.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = isComplete ? 'complete' : 'incomplete';
            this._commit();
            return { success: true };
        }
        return { success: false };
    }

    // --- System Monitor ---

    getSystemLogs() {
        return this.state.systemLogs;
    }

    acknowledgeLog(logId) {
        const log = this.state.systemLogs.find(l => l.id === logId);
        if (log) {
            log.acknowledged = true;
            this._commit();
            return { success: true };
        }
        return { success: false };
    }

    getSystemStatus() {
        return this.state.systemStatus;
    }

    // --- Academic History ---
    getAcademicHistory(studentId) {
        const history = this.state.academicHistory.find(h => h.studentId === studentId);
        return history ? history.courses : [];
    }
}

export const store = new MockStore();

