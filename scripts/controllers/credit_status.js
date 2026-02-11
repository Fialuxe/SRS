/**
 * Credit Status Controller
 * Calculates and visualizes graduation requirements (UC-03-04).
 */
import { store } from '../store.js';

export function renderCreditStatus(user) {
    if (!user) return;

    const reqs = store.state.graduationRequirements;
    const registered = store.getStudentRegistrations(user.studentId);
    const earnedMock = registered; // In real app, separate 'earned' vs 'registered'. For mock, assume all registered are calculated.

    const tbody = document.getElementById('credit-table-body');
    tbody.innerHTML = '';

    reqs.categories.forEach(cat => {
        // Calculate earned for this category
        // Start with courses that match the category name directly
        let earned = registered
            .filter(c => c.category === cat.name)
            .reduce((sum, c) => sum + c.credits, 0);

        // Also verify against children categories if any (logic simplification)
        if (cat.children && cat.children.length > 0) {
            const childrenCredits = registered
                .filter(c => cat.children.includes(c.category))
                .reduce((sum, c) => sum + c.credits, 0);
            earned += childrenCredits;
        }

        const deficit = Math.max(0, cat.required - earned);
        const statusClass = deficit === 0 ? 'status-active' : 'status-locked'; // Reuse color classes

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cat.name}</td>
            <td>${cat.required}</td>
            <td>${earned}</td>
            <td>${earned} (Est)</td>
            <td class="${statusClass}">${deficit}</td>
         `;
        tbody.appendChild(tr);
    });
}
