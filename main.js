document.addEventListener('DOMContentLoaded', () => {
    // --- Global Refs ---
    const navItems = document.querySelectorAll('.nav-item');
    const pageTitle = document.getElementById('page-title');
    const viewContainer = document.getElementById('view-container');
    const app = document.getElementById('app');
    const loginView = document.getElementById('login-view');

    // --- Constants ---
    const CONSTANTS = {
        VIEWS: {
            DASHBOARD: 'dashboard',
            REGISTRATION: 'registration',
            SIMULATION: 'simulation',
            UNIT_STATUS: 'unit-status'
        },
        TITLES: {
            'dashboard': '時間割',
            'registration': '履修登録',
            'simulation': 'シミュレーション',
            'unit-status': '単位修得状況'
        },
        DAYS: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        PERIODS: [1, 2, 3, 4, 5, 6, 7]
    };

    // --- UI Helpers ---
    const UI = {
        showToast: (message, type = 'info') => {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.textContent = message;
            document.body.appendChild(toast);

            // Animation handled by CSS (see style.css updates)
            requestAnimationFrame(() => toast.classList.add('show'));

            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        },

        showModal: (titleText, bodyContent, footerContent = '') => {
            const modal = document.getElementById('modal-overlay');
            const title = document.getElementById('modal-title');
            const body = document.getElementById('modal-body');

            title.textContent = titleText;
            body.innerHTML = bodyContent;

            // If footer provided, append it. For now, modal-body handles main content.
            // Simplified: if bodyContent contains buttons, that's fine.
            // Or we can inject footer div.
            if (footerContent) {
                const footer = document.createElement('div');
                footer.className = 'modal-footer';
                footer.innerHTML = footerContent;
                body.appendChild(footer); // Append to body or separate container? 
                // Currently modal-content has header and body. Footer fits in body or new div.
                // Let's add it to body for simplicity with styling.
            }

            modal.classList.add('open');
        },

        closeModal: () => {
            document.getElementById('modal-overlay').classList.remove('open');
        },

        // Loading Spinner
        withLoading: async (fn) => {
            let loader = document.getElementById('global-loader');
            if (!loader) {
                loader = document.createElement('div');
                loader.id = 'global-loader';
                loader.innerHTML = '<div class="spinner"></div>';
                document.body.appendChild(loader);
            }

            loader.classList.add('visible');

            // Artificial delay > 1s for "Processing" feel or SRS Requirement
            // SRS says "if >3s, show spinner". We force spinner for demo.
            await new Promise(r => setTimeout(r, 800));

            try {
                await fn();
            } finally {
                loader.classList.remove('visible');
            }
        },

        createGridHeader: (text) => {
            const div = document.createElement('div');
            div.className = 'grid-header';
            div.textContent = text;
            return div;
        },

        createCourseCard: (course, options = {}) => {
            const { showActions = false, showDelete = false, useColor = false, onClick = null } = options;
            const color = useColor ? DB.getCategoryColor(course.category) : null;
            const style = useColor
                ? `background: rgba(255, 255, 255, 0.6); border-left: 4px solid ${color}; padding-left: calc(var(--spacing-xs) + 4px);`
                : (showDelete ? 'background: rgba(16, 185, 129, 0.1);' : '');

            const div = document.createElement('div');
            div.className = 'course-card';
            if (style) div.style.cssText += style;
            if (showDelete) div.style.position = 'relative';

            let html = `
                <div class="course-name" ${showDelete ? 'style="font-size: 0.75rem;"' : ''}>${course.name}</div>
                ${!showDelete ? `<div class="course-room">${course.room}</div>` : ''}
            `;

            if (showActions) {
                // Check if has link (mock)
                html += `
                    <div class="cell-actions">
                        <span class="mini-icon" title="Syllabus" style="cursor:pointer;" onclick="event.stopPropagation(); window.open('https://example.com', '_blank')">📄</span>
                        <span class="mini-icon active" title="Tasks">📝</span>
                    </div>
                `;
            }

            if (showDelete) {
                html += `
                    <button class="icon-btn mini" style="position: absolute; top: 2px; right: 2px; width: 20px; height: 20px; font-size: 0.7rem; color: var(--danger); background: white;" onclick="removeCourse('${course.id}'); event.stopPropagation();">×</button>
                `;
            }

            div.innerHTML = html;
            if (onClick) div.onclick = onClick;

            return div;
        },

        renderGrid: (container, getCellContent) => {
            container.innerHTML = '';
            container.appendChild(UI.createGridHeader('')); // Corner
            CONSTANTS.DAYS.forEach(day => container.appendChild(UI.createGridHeader(day)));

            CONSTANTS.PERIODS.forEach(period => {
                container.appendChild(UI.createGridHeader(period));
                CONSTANTS.DAYS.forEach(day => {
                    const cell = document.createElement('div');
                    cell.className = 'grid-cell';
                    const content = getCellContent(day, period, cell);
                    if (content) cell.appendChild(content);
                    container.appendChild(cell);
                });
            });
        }
    };

    // --- State & Main Logic ---

    // Auth Flow
    document.getElementById('btn-login').addEventListener('click', async () => {
        const id = document.getElementById('login-id').value;
        const pass = document.getElementById('login-pass').value;

        await UI.withLoading(async () => {
            const res = DB.login(id, pass);
            if (res.success) {
                loginView.style.opacity = '0';

                // Update User Profile UI
                document.querySelector('.user-profile .name').textContent = DB.currentUser.name;
                document.querySelector('.user-profile .id').textContent = DB.currentUser.id;

                setTimeout(() => {
                    loginView.style.display = 'none';
                    app.style.display = 'flex';
                    loadView(CONSTANTS.VIEWS.DASHBOARD);
                }, 500);
            } else {
                document.getElementById('login-error').textContent = res.message;
            }
        });
    });

    // Toggle Registration Mode
    // Quick Hack for Register Button Handling
    document.getElementById('btn-toggle-mode').addEventListener('click', () => {
        const formTitle = document.querySelector('.logo');
        const loginBtn = document.getElementById('btn-login');
        const regBtn = document.getElementById('btn-register');
        const toggleBtn = document.getElementById('btn-toggle-mode');
        const hint = document.getElementById('login-hint');

        if (loginBtn.style.display !== 'none') {
            loginBtn.style.display = 'none';
            regBtn.style.display = 'block';
            formTitle.textContent = '新規登録';
            toggleBtn.textContent = 'ログインへ戻る';
            hint.textContent = '初期パスワードを設定してください';
        } else {
            loginBtn.style.display = 'block';
            regBtn.style.display = 'none';
            formTitle.textContent = 'CampUsFlow';
            toggleBtn.textContent = '新規登録はこちら';
            hint.innerHTML = '学籍番号とパスワードを入力してください<br>※WORK IN PROGRESS..';
        }
        document.getElementById('login-error').textContent = '';
    });

    document.getElementById('btn-register').addEventListener('click', async () => {
        const id = document.getElementById('login-id').value;
        const pass = document.getElementById('login-pass').value;
        const email = 'demo@example.com'; // Mock email input

        await UI.withLoading(async () => {
            const res = DB.registerUser(id, pass, email);
            if (res.success) {
                UI.showToast(res.message);
                document.getElementById('btn-toggle-mode').click();
                document.getElementById('login-error').textContent = '登録完了。メールを確認してください。(2秒後に自動有効化されます)';
            } else {
                document.getElementById('login-error').textContent = res.message;
            }
        });
    });

    // Logout
    window.logout = () => {
        // Simple logout
        location.reload();
    };

    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.dataset.view === 'logout') {
                window.logout();
                return;
            }
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            loadView(item.dataset.view);
        });
    });

    function loadView(viewName) {
        pageTitle.textContent = CONSTANTS.TITLES[viewName] || 'CampUsFlow';
        viewContainer.innerHTML = '';

        switch (viewName) {
            case CONSTANTS.VIEWS.DASHBOARD:
                renderDashboard(viewContainer);
                break;
            case CONSTANTS.VIEWS.REGISTRATION:
                renderRegistration(viewContainer);
                break;
            case CONSTANTS.VIEWS.SIMULATION:
                renderSimulation(viewContainer);
                break;
            case CONSTANTS.VIEWS.UNIT_STATUS:
                renderUnitStatus(viewContainer);
                break;
            default:
                viewContainer.innerHTML = '<p>View not found</p>';
        }
    }

    // --- Dashboard ---
    function renderDashboard(container) {
        container.innerHTML = `
            <div class="dashboard-layout">
                <div class="glass-panel">
                    <div class="panel-header">
                        <div class="panel-title"><span class="icon">📅</span> 時間割</div>
                        <button class="icon-btn mini" onclick="UI.showToast('設定機能は未実装です')">⚙️</button>
                    </div>
                    <div id="timetable" class="timetable-grid"></div>
                </div>
                <div class="glass-panel">
                    <div class="panel-header">
                        <div class="panel-title"><span class="icon">✅</span> 課題</div>
                    </div>
                    <div id="task-tree" class="task-list"></div>
                </div>
            </div>
        `;

        renderTimetable();
        renderTaskTree();
    }

    function renderTimetable() {
        const grid = document.getElementById('timetable');
        const courses = DB.getMyCourses();

        UI.renderGrid(grid, (day, period, cell) => {
            const course = courses.find(c => c.day === day && c.period === period);
            if (course) {
                cell.onclick = () => showCourseDetails(course);
                return UI.createCourseCard(course, { showActions: true });
            }
            return null;
        });
    }

    function renderTaskTree() {
        const container = document.getElementById('task-tree');
        const courses = DB.getMyCourses();

        // If no courses, show empty
        if (courses.length === 0) {
            container.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:2rem;">履歴登録された科目がありません</div>';
            return;
        }

        let hasTasks = false;
        courses.forEach(course => {
            const tasks = DB.getTasksByCourse(course.id);
            if (tasks.length === 0) return;
            hasTasks = true;

            const group = document.createElement('div');
            group.className = 'task-course-group';

            group.innerHTML = `
                <div class="group-header">
                    ${course.name}
                    <span class="badge" style="background:var(--primary-color); color:white; padding:2px 8px; border-radius:12px; font-size:0.75rem;">${tasks.filter(t => !t.completed).length}</span>
                </div>
                <div class="task-items">
                    ${tasks.map(task => `
                        <div class="task-item ${task.completed ? 'completed' : ''}">
                            <input type="checkbox" class="task-checkbox" 
                                ${task.completed ? 'checked' : ''} 
                                data-id="${task.id}">
                            <div class="task-content">
                                <div class="task-title">${task.title}</div>
                                <div class="task-deadline">Due: ${task.deadline}</div>
                            </div>
                            <span class="mini-icon ${localStorage.getItem(`notify_task_${task.id}`) === 'true' ? 'active' : ''}" 
                                  style="cursor: pointer;"
                                  onclick="toggleNotify('task_${task.id}', this)">🔔</span>
                        </div>
                    `).join('')}
                </div>
            `;

            container.appendChild(group);
        });

        if (!hasTasks) {
            container.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:2rem;">未完了の課題はありません</div>';
        }

        // Event Listeners for Checkboxes
        container.querySelectorAll('.task-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const taskId = e.target.dataset.id;
                const taskItem = e.target.closest('.task-item');
                const isChecked = e.target.checked;

                // Update DB
                DB.toggleTaskCompletion(taskId);

                // Update UI locally
                if (isChecked) {
                    taskItem.classList.add('completed');
                } else {
                    taskItem.classList.remove('completed');
                }

                // Update Badge
                const group = taskItem.closest('.task-course-group');
                const badge = group.querySelector('.badge');
                if (badge) {
                    // Recalculate badge
                    // A bit lazy, but works for mock
                    const tasksInGroup = DB.getTasksByCourse(DB.getTasks().find(t => t.id === taskId).courseId);
                    badge.textContent = tasksInGroup.filter(t => !t.completed).length;
                }
            });
        });
    }

    // Modal Details (UC-02-01)
    function showCourseDetails(course) {
        const isNotifyOn = localStorage.getItem(`notify_${course.id}`) === 'true';

        const body = `
            <div style="margin-bottom: 1rem;">
                <div style="font-size: 0.9rem; color: var(--text-muted);">教員</div>
                <div style="font-weight: 600;">${course.teacher}</div>
            </div>
            <div style="margin-bottom: 1rem;">
                <div style="font-size: 0.9rem; color: var(--text-muted);">教室</div>
                <div style="font-weight: 600;">${course.room}</div>
            </div>
            <div style="margin-bottom: 1.5rem;">
                <div style="font-size: 0.9rem; color: var(--text-muted);">リンク</div>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                    <a href="https://example.com" target="_blank" class="btn btn-primary" style="text-decoration: none; font-size: 0.9rem;">シラバス</a>
                    <a href="https://example.com" target="_blank" class="btn" style="background: var(--bg-color); text-decoration: none; font-size: 0.9rem;">課題提出箱</a>
                </div>
            </div>
            <div style="padding-top: 1rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600;">課題リマインド通知</span>
                <label class="switch" style="position: relative; display: inline-block; width: 40px; height: 24px;">
                    <input type="checkbox" ${isNotifyOn ? 'checked' : ''} onchange="toggleNotify('${course.id}', null, this.checked)">
                    <span class="slider round" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 34px;"></span>
                     <style>
                        .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
                        input:checked + .slider { background-color: var(--primary-color); }
                        input:checked + .slider:before { transform: translateX(16px); }
                    </style>
                </label>
            </div>
        `;

        UI.showModal(course.name, body, `<button class="btn" onclick="UI.closeModal()">閉じる</button>`);
    }

    window.closeModal = UI.closeModal;

    window.toggleNotify = (keySuffix, iconEl, forceState) => {
        const key = keySuffix.startsWith('notify_') ? keySuffix : `notify_${keySuffix}`;
        let newState;
        if (forceState !== undefined) {
            newState = forceState;
        } else {
            const current = localStorage.getItem(key) === 'true';
            newState = !current;
        }
        localStorage.setItem(key, newState);
        if (iconEl) {
            if (newState) iconEl.classList.add('active');
            else iconEl.classList.remove('active');
        }
        if (!iconEl && forceState !== undefined) {
            UI.showToast(`通知を${newState ? 'ON' : 'OFF'}にしました`);
        }
    };

    // --- Registration (UC-03) ---
    function renderRegistration(container) {
        container.innerHTML = `
            <div class="dashboard-layout">
                <div class="glass-panel" style="grid-column: span 2;">
                    <div class="panel-header">
                        <div class="panel-title"><span class="icon">🔍</span> 履修登録</div>
                    </div>
                    <div id="search-form-container"></div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                        <div class="results-area">
                            <h3 style="margin-bottom: 1rem; font-size: 1rem; color: var(--text-muted);">検索結果</h3>
                            <div id="search-results" style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 400px; overflow-y: auto; padding-right: 0.5rem;">
                                <div style="padding: 1rem; text-align: center; color: var(--text-muted);">条件を入力して検索してください</div>
                            </div>
                        </div>
                        <div class="current-area">
                            <h3 style="margin-bottom: 1rem; font-size: 1rem; color: var(--text-muted);">現在の登録 (仮)</h3>
                            <div id="current-reg" class="timetable-grid" style="height: 400px; overflow-y: auto;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        renderSearchForm(document.getElementById('search-form-container'));
        renderCurrentRegistration();
    }

    function renderSearchForm(container) {
        container.innerHTML = `
            <div class="search-form" style="display: flex; gap: 1rem; margin-bottom: 2rem; align-items: end;">
                <div class="form-group" style="flex: 1;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--text-muted);">キーワード</label>
                    <input type="text" id="reg-keyword" placeholder="科目名・教員名" 
                        style="width: 100%; padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--glass-border); background: rgba(255,255,255,0.5);">
                </div>
                <div class="form-group" style="width: 150px;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--text-muted);">曜日</label>
                    <select id="reg-day" style="width: 100%; padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--glass-border); background: rgba(255,255,255,0.5);">
                        <option value="">指定なし</option>
                        ${CONSTANTS.DAYS.map(d => `<option value="${d}">${d}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group" style="width: 100px;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--text-muted);">時限</label>
                    <select id="reg-period" style="width: 100%; padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--glass-border); background: rgba(255,255,255,0.5);">
                        <option value="">指定なし</option>
                        ${CONSTANTS.PERIODS.map(p => `<option value="${p}">${p}</option>`).join('')}
                    </select>
                </div>
                <button id="btn-search" class="btn btn-primary" style="height: 46px; padding: 0 2rem;">検索</button>
            </div>
        `;

        document.getElementById('btn-search').addEventListener('click', () => {
            const keyword = document.getElementById('reg-keyword').value;
            const day = document.getElementById('reg-day').value;
            const period = document.getElementById('reg-period').value;
            const results = DB.searchCourses(keyword, day, period);
            renderSearchResults(results);
        });
    }

    function renderSearchResults(courses) {
        const container = document.getElementById('search-results');
        if (courses.length === 0) {
            container.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-muted);">該当する科目がありません</div>';
            return;
        }

        container.innerHTML = courses.map(c => `
            <div style="background: rgba(255,255,255,0.4); padding: 1rem; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 700;">${c.name} <span style="font-weight:400; color:var(--text-muted); font-size:0.85rem; margin-left:0.5rem;">${c.code || ''}</span></div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">${c.day}${c.period} / ${c.teacher} / ${c.credits}単位 / ${c.category}</div>
                </div>
                <button class="btn btn-primary" style="padding: 0.25rem 0.75rem; font-size: 0.85rem;" onclick="addCourse('${c.id}')">追加</button>
            </div>
        `).join('');
    }

    function renderCurrentRegistration() {
        const container = document.getElementById('current-reg');
        const courses = DB.getMyCourses();

        UI.renderGrid(container, (day, period, cell) => {
            const course = courses.find(c => c.day === day && c.period === period);
            if (course) {
                return UI.createCourseCard(course, { showDelete: true });
            }
            return null;
        });
    }

    // Exposed handlers
    window.addCourse = async (id) => {
        const res = DB.registerCourse(id);
        if (res.success) {
            UI.showToast(res.message);
            renderCurrentRegistration();
        } else {
            UI.showModal('登録エラー', `<p style="color:var(--danger)">${res.message}</p>`, '<button class="btn" onclick="UI.closeModal()">確認</button>');
        }
    };

    window.removeCourse = (id) => {
        UI.showModal(
            '確認',
            '本当にこの科目を削除しますか？',
            `
            <button class="btn" style="background:transparent; color:var(--text-muted);" onclick="UI.closeModal()">キャンセル</button>
            <button class="btn btn-primary" style="background:var(--danger);" onclick="confirmRemoveCourse('${id}')">削除する</button>
            `
        );
    };

    window.confirmRemoveCourse = (id) => {
        DB.removeCourse(id);
        UI.closeModal();
        UI.showToast('削除しました', 'info');
        renderCurrentRegistration();
    };

    // --- Simulation (UC-04) ---
    function renderSimulation(container) {
        const sheets = DB.getSheets();
        const activeSheetId = container.dataset.activeSheet || (sheets[0] ? sheets[0].id : null);

        const activeSheet = sheets.find(s => s.id === activeSheetId) || sheets[0];

        container.innerHTML = `
            <div class="dashboard-layout" style="grid-template-columns: 2fr 1fr; gap: 1.5rem;">
                <!-- Left Panel: Simulation -->
                <div class="glass-panel">
                    <div class="panel-header">
                        <div class="panel-title"><span class="icon">🔮</span> 履修シミュレーション</div>
                        <div style="display:flex; gap:0.5rem;">
                             <button class="btn btn-primary" onclick="createNewSheet()">＋ 新規</button>
                             <button class="btn" style="background:var(--success); color:white;" onclick="reflectToReal('${activeSheet.id}')">本登録へ反映</button>
                        </div>
                    </div>
                    
                    <div id="sim-sheet-tabs" class="sheet-tabs" style="display: flex; gap: 0.5rem; margin-bottom: 1rem; overflow-x: auto; padding-bottom: 0.5rem;"></div>
                    <div id="sim-controls" style="display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center;"></div>
                    <div id="sim-grid" class="timetable-grid"></div>
                </div>

                <!-- Right Panel: Unit Status -->
                <div class="glass-panel">
                    <div class="panel-header">
                        <div class="panel-title"><span class="icon">📊</span> 単位修得状況照会</div>
                    </div>
                    <div id="sim-unit-status" style="overflow-y: auto; max-height: 600px;"></div>
                </div>
            </div>
        `;

        renderSheetTabs(document.getElementById('sim-sheet-tabs'), sheets, activeSheet.id);
        renderSimulationControls(document.getElementById('sim-controls'), container);
        renderSimulationGrid(activeSheet);
        renderSimulationUnitStatus(activeSheet);
    }

    function renderSheetTabs(container, sheets, activeId) {
        container.innerHTML = sheets.map(sheet => `
            <div class="sheet-tab ${sheet.id === activeId ? 'active' : ''}" 
                 onclick="switchSheet('${sheet.id}')"
                 style="padding: 0.5rem 1rem; cursor: pointer; border-radius: var(--radius-md); background: ${sheet.id === activeId ? 'var(--primary-color)' : 'rgba(255,255,255,0.4)'}; color: ${sheet.id === activeId ? 'white' : 'var(--text-muted)'}; font-weight: 600; white-space: nowrap;">
                ${sheet.name}
            </div>
        `).join('');
    }

    function renderSimulationControls(container, viewContainer) {
        const programs = ['メディア情報学プログラム', '経営情報学プログラム', 'セキュリティ情報学プログラム'];
        const semesters = ['1学期', '2学期', '3学期'];
        const currentSemester = parseInt(viewContainer.dataset.semesterIndex || 0);

        const currentProgram = DB.currentUser.program;

        container.innerHTML = `
            <select onchange="updateProgram(this)" style="padding: 0.5rem; border-radius: var(--radius-md); border: 1px solid var(--glass-border);">
                ${programs.map(p => `<option ${p === currentProgram ? 'selected' : ''}>${p}</option>`).join('')}
            </select>
             <div style="display:flex; gap:0.25rem; background:rgba(255,255,255,0.5); padding:0.25rem; border-radius:var(--radius-md);">
                ${semesters.map((s, i) => `
                    <div class="semester-tab" onclick="switchSemester(${i})" data-index="${i}" 
                         style="padding: 0.25rem 0.75rem; cursor: pointer; border-radius: var(--radius-sm); 
                                background: ${i === currentSemester ? 'white' : 'transparent'}; 
                                font-weight: ${i === currentSemester ? '600' : '400'}; 
                                box-shadow: ${i === currentSemester ? 'var(--shadow-sm)' : 'none'}; 
                                transition: all 0.2s;">
                        ${s}
                    </div>
                `).join('')}
            </div>
        `;
    }

    function renderSimulationGrid(sheet) {
        const grid = document.getElementById('sim-grid');
        const semesterIndex = parseInt(document.getElementById('view-container').dataset.semesterIndex || 0);
        const semesterName = ['1学期', '2学期', '3学期'][semesterIndex];

        UI.renderGrid(grid, (day, period, cell) => {
            const courseId = sheet.courses.find(id => {
                const c = DB.getCourse(id);
                return c && c.day === day && c.period === period && c.semester === semesterName;
            });

            if (courseId) {
                const course = DB.getCourse(courseId);
                const card = UI.createCourseCard(course, { useColor: true });
                card.onclick = () => {
                    // Confirm Remove
                    if (confirm('削除しますか？')) {
                        const newCourses = sheet.courses.filter(id => id !== courseId);
                        DB.updateSheet(sheet.id, newCourses);
                        renderSimulation(document.getElementById('view-container'));
                    }
                };
                return card;
            } else {
                // Add Course Logic
                cell.style.opacity = '0.5';
                cell.innerHTML = '<span style="font-size: 1.5rem; color: var(--text-light); opacity: 0; transition: opacity 0.2s;">+</span>';
                cell.onmouseenter = () => cell.querySelector('span').style.opacity = '1';
                cell.onmouseleave = () => cell.querySelector('span').style.opacity = '0';

                cell.onclick = () => {
                    const input = prompt('科目IDを入力 (C001, C009等)');
                    if (input) {
                        const c = DB.getCourse(input);
                        if (c && c.day === day && c.period === period) {
                            if (sheet.courses.includes(c.id)) return;
                            const newCourses = [...sheet.courses, c.id];
                            DB.updateSheet(sheet.id, newCourses);
                            renderSimulation(document.getElementById('view-container'));
                        } else {
                            alert('科目が見つからないか、曜日時限が一致しません');
                        }
                    }
                };
                return null;
            }
        });
    }

    window.switchSheet = (sheetId) => {
        const container = document.getElementById('view-container');
        container.dataset.activeSheet = sheetId;
        renderSimulation(container);
    };

    window.createNewSheet = () => {
        const name = prompt('シート名');
        if (name) {
            const newSheet = DB.createSheet(name);
            switchSheet(newSheet.id);
        }
    };

    // Reflect Logic
    window.reflectToReal = async (sheetId) => {
        await UI.withLoading(async () => {
            const res = DB.reflectSheetToReal(sheetId);
            if (res.success) {
                const added = res.results.success.length;
                const errors = res.results.errors;

                let msg = `<p>登録成功: ${added}件</p>`;
                if (errors.length > 0) {
                    msg += `<div style="margin-top:1rem; border:1px solid var(--danger); background:rgba(255,0,0,0.05); padding:0.5rem; border-radius:var(--radius-sm);">
                        <div style="font-weight:bold; color:var(--danger); margin-bottom:0.5rem;">登録できなかった科目</div>
                        <ul style="padding-left:1.5rem; font-size:0.9rem;">
                            ${errors.map(e => `<li>${e.course.name}: ${e.reason}</li>`).join('')}
                        </ul>
                    </div>`;
                } else {
                    msg += `<p style="color:var(--success);">すべての科目が正常に登録されました。</p>`;
                }

                UI.showModal('反映結果', msg, '<button class="btn" onclick="UI.closeModal()">閉じる</button>');
            }
        });
    };

    function renderUnitStatus(container) {
        const progress = DB.getUnitProgress();
        const totalRequired = progress.reduce((acc, curr) => acc + curr.required, 0);
        const totalAcquired = progress.reduce((acc, curr) => acc + curr.acquired, 0);
        const totalPercentage = totalRequired === 0 ? 100 : Math.round((totalAcquired / totalRequired) * 100);

        container.innerHTML = `
            <div class="dashboard-layout" style="grid-template-columns: 1fr 1fr;">
                <!-- Overall Progress -->
                <div class="glass-panel" style="grid-column: span 2; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <div style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">総取得単位数</div>
                        <div style="font-size: 3rem; font-weight: 800; line-height: 1; background: linear-gradient(to right, var(--primary-color), var(--secondary-color)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                            ${totalAcquired} <span style="font-size: 1.5rem; color: var(--text-muted); -webkit-text-fill-color: var(--text-muted);">/ ${totalRequired}</span>
                        </div>
                    </div>
                    <div style="width: 150px; height: 150px; position: relative; display: flex; align-items: center; justify-content: center;">
                        <svg viewBox="0 0 36 36" style="width: 100%; height: 100%; transform: rotate(-90deg);">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" stroke-width="3" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary-color)" stroke-width="3" stroke-dasharray="${totalPercentage}, 100" />
                        </svg>
                        <div style="position: absolute; font-size: 1.5rem; font-weight: 700; color: var(--text-main);">${totalPercentage}%</div>
                    </div>
                </div>

                <!-- Category Breakdown -->
                <div class="glass-panel" style="grid-column: span 2;">
                    ${progress.map(p => renderUnitStatusList(p)).join('')}
                </div>
            </div>
        `;
    }

    function renderUnitStatusList(item, level = 0) {
        const percentage = Math.min(100, Math.round((item.acquired / item.required) * 100)) || 0;
        const isChild = level > 0;
        const paddingLeft = level * 1.5;
        const fontSize = isChild ? '0.9rem' : '1.1rem';
        const fontWeight = isChild ? '400' : '700';
        const barHeight = isChild ? '8px' : '12px';

        let html = `
            <div style="margin-bottom: ${isChild ? '0.5rem' : '1.5rem'}; padding-left: ${paddingLeft}rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                    <div style="font-weight: ${fontWeight}; font-size: ${fontSize}; color: var(--text-main);">${item.category}</div>
                    <div style="font-weight: 600; font-size: ${fontSize}; color: var(--text-muted);">${item.acquired} / ${item.required}</div>
                </div>
                <div style="height: ${barHeight}; background: #e2e8f0; border-radius: 6px; overflow: hidden;">
                    <div style="height: 100%; width: ${percentage}%; background: ${item.color || 'var(--primary-color)'}; border-radius: 6px; transition: width 1s ease-out;"></div>
                </div>
            </div>
        `;

        if (item.children) {
            html += item.children.map(child => renderUnitStatusList(child, level + 1)).join('');
        }

        return html;
    }

    function renderSimulationUnitStatus(sheet) {
        const container = document.getElementById('sim-unit-status');
        const progress = DB.getUnitProgress();

        const simCourses = sheet.courses.map(id => DB.getCourse(id)).filter(Boolean);
        const simProgress = {};

        simCourses.forEach(c => {
            if (!simProgress[c.category]) simProgress[c.category] = 0;
            simProgress[c.category] += c.credits;
        });

        container.innerHTML = `
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--glass-border);">
                        <th style="text-align: left; padding: 0.5rem;">区分</th>
                        <th style="text-align: center; padding: 0.5rem;">所要</th>
                        <th style="text-align: center; padding: 0.5rem;">修得</th>
                        <th style="text-align: center; padding: 0.5rem;">計</th>
                    </tr>
                </thead>
                <tbody>
                    ${progress.map(p => renderUnitStatusRow(p, 0, simProgress)).join('')}
                </tbody>
            </table>
        `;
    }

    function renderUnitStatusRow(item, level = 0, simProgress = {}) {
        const simAdded = simProgress[item.category] || 0;
        const total = item.acquired + simAdded;
        const isShort = total < item.required;
        const rowStyle = isShort ? 'background: rgba(255, 0, 0, 0.05);' : '';
        const statusColor = isShort ? 'var(--danger)' : 'var(--success)';

        let html = `
            <tr style="border-bottom: 1px solid var(--glass-border); ${rowStyle}">
                <td style="padding: 0.75rem 0.5rem; padding-left: ${(level * 1.5) + 0.5}rem;">
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        ${level === 0 ? `<div style="width:4px; height:1rem; background:${item.color}; border-radius:2px;"></div>` : ''}
                        <span style="font-weight:${level === 0 ? '700' : '400'}; font-size:${level === 0 ? '0.9rem' : '0.85rem'};">${item.category}</span>
                    </div>
                </td>
                <td style="text-align: center; font-weight:600;">${item.required}</td>
                <td style="text-align: center; color: var(--text-muted);">${item.acquired}</td>
                <td style="text-align: center; font-weight:700; color: ${statusColor};">
                    ${total}
                    ${simAdded > 0 ? `<span style="font-size:0.75rem; color:var(--primary-color);">+${simAdded}</span>` : ''}
                </td>
            </tr>
        `;

        if (item.children) {
            html += item.children.map(child => renderUnitStatusRow(child, level + 1, simProgress)).join('');
        }

        return html;
    }

    // Program/Semester switch helpers
    window.updateProgram = (select) => {
        DB.currentUser.program = select.value;
        const container = document.getElementById('view-container');
        renderSimulation(container);
    };

    window.switchSemester = (index) => {
        const container = document.getElementById('view-container');
        container.dataset.semesterIndex = index;

        // Update Tabs UI
        document.querySelectorAll('.semester-tab').forEach((tab, i) => {
            if (i === index) {
                tab.style.background = 'white';
                tab.style.fontWeight = '600';
                tab.style.boxShadow = 'var(--shadow-sm)';
            } else {
                tab.style.background = 'transparent';
                tab.style.fontWeight = '400';
                tab.style.boxShadow = 'none';
            }
        });

        // Re-render Grid
        const sheets = DB.getSheets();
        const activeSheetId = container.dataset.activeSheet || sheets[0].id;
        const activeSheet = sheets.find(s => s.id === activeSheetId);
        renderSimulationGrid(activeSheet);
    };

});
