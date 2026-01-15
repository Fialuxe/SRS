document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const pageTitle = document.getElementById('page-title');
    const viewContainer = document.getElementById('view-container');
    const app = document.getElementById('app');
    const loginView = document.getElementById('login-view');

    // Login Logic
    document.getElementById('btn-login').addEventListener('click', () => {
        const id = document.getElementById('login-id').value;
        const pass = document.getElementById('login-pass').value;

        if (DB.login(id, pass)) {
            loginView.style.opacity = '0';
            setTimeout(() => {
                loginView.style.display = 'none';
                app.style.display = 'flex';
                loadView('dashboard');
            }, 500);
        } else {
            document.getElementById('login-error').textContent = 'IDまたはパスワードが間違っています';
        }
    });

    // Navigation Logic
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked
            item.classList.add('active');

            const viewName = item.dataset.view;
            loadView(viewName);
        });
    });

    // Initial Load (Wait for login)
    // loadView('dashboard'); // Moved to login success

    function loadView(viewName) {
        // Update Title
        const titles = {
            'dashboard': '時間割',
            'registration': '履修登録',
            'simulation': 'シミュレーション',
            'unit-status': '単位修得状況'
        };
        pageTitle.textContent = titles[viewName] || 'CampUsFlow';

        // Clear Container
        viewContainer.innerHTML = '';

        // Render View
        switch (viewName) {
            case 'dashboard':
                renderDashboard(viewContainer);
                break;
            case 'registration':
                renderRegistration(viewContainer);
                break;
            case 'simulation':
                renderSimulation(viewContainer);
                break;
            case 'unit-status':
                renderUnitStatus(viewContainer);
                break;
            default:
                viewContainer.innerHTML = '<p>View not found</p>';
        }
    }

    // Placeholder Render Functions
    function renderDashboard(container) {
        container.innerHTML = `
            <div class="dashboard-layout">
                <div class="glass-panel">
                    <div class="panel-header">
                        <div class="panel-title">
                            <span class="icon">📅</span> 時間割
                        </div>
                        <button class="icon-btn mini">⚙️</button>
                    </div>
                    <div id="timetable" class="timetable-grid"></div>
                </div>
                <div class="glass-panel">
                    <div class="panel-header">
                        <div class="panel-title">
                            <span class="icon">✅</span> 課題
                        </div>
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
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const periods = [1, 2, 3, 4, 5, 6, 7];

        // Header Row (Days)
        grid.appendChild(createGridHeader('')); // Corner
        days.forEach(day => {
            grid.appendChild(createGridHeader(day));
        });

        // Grid Content
        periods.forEach(period => {
            // Period Number
            grid.appendChild(createGridHeader(period));

            days.forEach(day => {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';

                // Find course for this slot
                const course = DB.getMyCourses().find(c => c.day === day && c.period === period);

                if (course) {
                    cell.innerHTML = `
                        <div class="course-card">
                            <div class="course-name">${course.name}</div>
                            <div class="course-room">${course.room}</div>
                            <div class="cell-actions">
                                <span class="mini-icon" title="Syllabus">📄</span>
                                <span class="mini-icon active" title="Tasks">📝</span>
                            </div>
                        </div>
                    `;
                    cell.onclick = () => showCourseDetails(course);
                }

                grid.appendChild(cell);
            });
        });
    }

    function createGridHeader(text) {
        const div = document.createElement('div');
        div.className = 'grid-header';
        div.textContent = text;
        return div;
    }

    function renderTaskTree() {
        const container = document.getElementById('task-tree');
        const courses = DB.getMyCourses();

        courses.forEach(course => {
            const tasks = DB.getTasksByCourse(course.id);
            if (tasks.length === 0) return;

            const group = document.createElement('div');
            group.className = 'task-course-group';

            group.innerHTML = `
                <div class="group-header">
                    ${course.name}
                    <span class="badge">${tasks.filter(t => !t.completed).length}</span>
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

        // Event Listeners for Checkboxes
        container.querySelectorAll('.task-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const taskId = e.target.dataset.id;
                const taskItem = e.target.closest('.task-item');
                const isChecked = e.target.checked;

                // Update DB
                DB.toggleTaskCompletion(taskId);

                // Update UI locally to avoid full re-render (Layout Thrashing Fix)
                if (isChecked) {
                    taskItem.classList.add('completed');
                } else {
                    taskItem.classList.remove('completed');
                }

                // Update Badge
                const group = taskItem.closest('.task-course-group');
                const badge = group.querySelector('.badge');
                const currentCount = parseInt(badge.textContent);
                badge.textContent = isChecked ? currentCount - 1 : currentCount + 1;
            });
        });
    }

    function showCourseDetails(course) {
        const modal = document.getElementById('modal-overlay');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');

        const isNotifyOn = localStorage.getItem(`notify_${course.id}`) === 'true';

        title.textContent = course.name;
        body.innerHTML = `
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
                    <a href="#" class="btn btn-primary" style="text-decoration: none; font-size: 0.9rem;">シラバス</a>
                    <a href="#" class="btn" style="background: var(--bg-color); text-decoration: none; font-size: 0.9rem;">課題提出箱</a>
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

        modal.classList.add('open');
    }

    window.closeModal = () => {
        document.getElementById('modal-overlay').classList.remove('open');
    };

    window.toggleNotify = (courseId, iconEl, forceState) => {
        const key = `notify_${courseId}`;
        let newState;

        if (forceState !== undefined) {
            newState = forceState;
        } else {
            const current = localStorage.getItem(key) === 'true';
            newState = !current;
        }

        localStorage.setItem(key, newState);

        // Update Icon if passed
        if (iconEl) {
            if (newState) iconEl.classList.add('active');
            else iconEl.classList.remove('active');
        }

        // If inside modal, we might want to sync but simplified for now
    };

    function renderRegistration(container) {
        container.innerHTML = `
            <div class="dashboard-layout">
                <div class="glass-panel" style="grid-column: span 2;">
                    <div class="panel-header">
                        <div class="panel-title">
                            <span class="icon">🔍</span> 履修登録
                        </div>
                    </div>
                    
                    <!-- Search Form -->
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
                                <option value="Mon">月</option>
                                <option value="Tue">火</option>
                                <option value="Wed">水</option>
                                <option value="Thu">木</option>
                                <option value="Fri">金</option>
                                <option value="Sat">土</option>
                            </select>
                        </div>
                        <div class="form-group" style="width: 100px;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--text-muted);">時限</label>
                            <select id="reg-period" style="width: 100%; padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--glass-border); background: rgba(255,255,255,0.5);">
                                <option value="">指定なし</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                                <option value="7">7</option>
                            </select>
                        </div>
                        <button id="btn-search" class="btn btn-primary" style="height: 46px; padding: 0 2rem;">検索</button>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                        <!-- Search Results -->
                        <div class="results-area">
                            <h3 style="margin-bottom: 1rem; font-size: 1rem; color: var(--text-muted);">検索結果</h3>
                            <div id="search-results" style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 400px; overflow-y: auto; padding-right: 0.5rem;">
                                <div style="padding: 1rem; text-align: center; color: var(--text-muted);">条件を入力して検索してください</div>
                            </div>
                        </div>

                        <!-- Current Registration -->
                        <div class="current-area">
                            <h3 style="margin-bottom: 1rem; font-size: 1rem; color: var(--text-muted);">現在の登録 (仮)</h3>
                            <div id="current-reg" class="timetable-grid" style="height: 400px; overflow-y: auto;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Event Listeners
        document.getElementById('btn-search').addEventListener('click', () => {
            const keyword = document.getElementById('reg-keyword').value;
            const day = document.getElementById('reg-day').value;
            const period = document.getElementById('reg-period').value;

            const results = DB.searchCourses(keyword, day, period);
            renderSearchResults(results);
        });

        renderCurrentRegistration();
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
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const periods = [1, 2, 3, 4, 5, 6, 7];

        container.innerHTML = '';
        container.appendChild(createGridHeader(''));
        days.forEach(day => container.appendChild(createGridHeader(day)));

        periods.forEach(period => {
            container.appendChild(createGridHeader(period));
            days.forEach(day => {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                const course = courses.find(c => c.day === day && c.period === period);

                if (course) {
                    cell.innerHTML = `
                        <div class="course-card" style="background: rgba(16, 185, 129, 0.1); border-radius: var(--radius-sm); position: relative;">
                            <div class="course-name" style="font-size: 0.75rem;">${course.name}</div>
                            <button class="icon-btn mini" style="position: absolute; top: 2px; right: 2px; width: 20px; height: 20px; font-size: 0.7rem; color: var(--danger); background: white;" onclick="removeCourse('${course.id}')">×</button>
                        </div>
                    `;
                }
                container.appendChild(cell);
            });
        });
    }

    // Expose functions to global scope for inline onclick handlers (simplified approach)
    window.addCourse = (id) => {
        DB.registerCourse(id);
        renderCurrentRegistration();
        // Also refresh search results to update state if needed (optional)
    };

    window.removeCourse = (id) => {
        DB.removeCourse(id);
        renderCurrentRegistration();
    };

    function renderSimulation(container) {
        const sheets = DB.getSheets();
        // Default to first sheet if not selected (simplified state management)
        const activeSheetId = container.dataset.activeSheet || sheets[0].id;
        const activeSheet = sheets.find(s => s.id === activeSheetId);

        // Mock Program/Semester Data
        const programs = ['メディア情報学プログラム', '経営情報学プログラム', 'セキュリティ情報学プログラム'];
        const semesters = ['1学期', '2学期', '3学期'];

        container.innerHTML = `
            <div class="dashboard-layout" style="grid-template-columns: 2fr 1fr; gap: 1.5rem;">
                <!-- Left Panel: Simulation -->
                <div class="glass-panel">
                    <div class="panel-header">
                        <div class="panel-title">
                            <span class="icon">🔮</span> 履修シミュレーション
                        </div>
                        <div style="display:flex; gap:0.5rem;">
                             <button class="btn btn-primary" onclick="createNewSheet()">＋ 新規</button>
                        </div>
                    </div>
                    
                    <!-- Sheet Tabs -->
                    <div class="sheet-tabs" style="display: flex; gap: 0.5rem; margin-bottom: 1rem; overflow-x: auto; padding-bottom: 0.5rem;">
                        ${sheets.map(sheet => `
                            <div class="sheet-tab ${sheet.id === activeSheetId ? 'active' : ''}" 
                                 onclick="switchSheet('${sheet.id}')"
                                 style="padding: 0.5rem 1rem; cursor: pointer; border-radius: var(--radius-md); background: ${sheet.id === activeSheetId ? 'var(--primary-color)' : 'rgba(255,255,255,0.4)'}; color: ${sheet.id === activeSheetId ? 'white' : 'var(--text-muted)'}; font-weight: 600; white-space: nowrap;">
                                ${sheet.name}
                            </div>
                        `).join('')}
                    </div>

                    <!-- Controls -->
                    <div style="display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center;">
                        <select onchange="updateProgram(this)" style="padding: 0.5rem; border-radius: var(--radius-md); border: 1px solid var(--glass-border);">
                            ${programs.map(p => `<option ${p === DB.user.program ? 'selected' : ''}>${p}</option>`).join('')}
                        </select>
                         <div style="display:flex; gap:0.25rem; background:rgba(255,255,255,0.5); padding:0.25rem; border-radius:var(--radius-md);">
                            ${semesters.map((s, i) => `
                                <div class="semester-tab" onclick="switchSemester(${i})" data-index="${i}" 
                                     style="padding: 0.25rem 0.75rem; cursor: pointer; border-radius: var(--radius-sm); 
                                            background: ${i === (container.dataset.semesterIndex || 0) ? 'white' : 'transparent'}; 
                                            font-weight: ${i === (container.dataset.semesterIndex || 0) ? '600' : '400'}; 
                                            box-shadow: ${i === (container.dataset.semesterIndex || 0) ? 'var(--shadow-sm)' : 'none'}; 
                                            transition: all 0.2s;">
                                    ${s}
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div id="sim-grid" class="timetable-grid"></div>
                </div>

                <!-- Right Panel: Unit Status -->
                <div class="glass-panel">
                    <div class="panel-header">
                        <div class="panel-title">
                            <span class="icon">📊</span> 単位修得状況照会
                        </div>
                    </div>
                    <div id="sim-unit-status" style="overflow-y: auto; max-height: 600px;"></div>
                </div>
            </div>
        `;

        renderSimulationGrid(activeSheet);
        renderSimulationUnitStatus(activeSheet);
    }

    function renderSimulationUnitStatus(sheet) {
        const container = document.getElementById('sim-unit-status');
        const progress = DB.getUnitProgress(); // Uses DB.user.program implicitly

        // Calculate simulated additions
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
                    ${progress.map(p => {
            const simAdded = simProgress[p.category] || 0;
            const total = p.acquired + simAdded;
            const isShort = total < p.required;
            const rowStyle = isShort ? 'background: rgba(255, 0, 0, 0.05);' : '';
            const statusColor = isShort ? 'var(--danger)' : 'var(--success)';

            return `
                            <tr style="border-bottom: 1px solid var(--glass-border); ${rowStyle}">
                                <td style="padding: 0.75rem 0.5rem;">
                                    <div style="display:flex; align-items:center; gap:0.5rem;">
                                        <div style="width:4px; height:1rem; background:${p.color}; border-radius:2px;"></div>
                                        ${p.category}
                                    </div>
                                </td>
                                <td style="text-align: center; font-weight:600;">${p.required}</td>
                                <td style="text-align: center; color: var(--text-muted);">${p.acquired}</td>
                                <td style="text-align: center; font-weight:700; color: ${statusColor};">
                                    ${total}
                                    ${simAdded > 0 ? `<span style="font-size:0.75rem; color:var(--primary-color);">+${simAdded}</span>` : ''}
                                </td>
                            </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
        `;
    }

    function renderSimulationGrid(sheet) {
        const grid = document.getElementById('sim-grid');
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const periods = [1, 2, 3, 4, 5, 6, 7];

        // Get current semester index from container dataset (default to 0: 1学期)
        const semesterIndex = parseInt(document.getElementById('view-container').dataset.semesterIndex || 0);
        const semesterName = ['1学期', '2学期', '3学期'][semesterIndex];

        grid.innerHTML = ''; // Clear existing content
        grid.appendChild(createGridHeader(''));
        days.forEach(day => grid.appendChild(createGridHeader(day)));

        periods.forEach(period => {
            grid.appendChild(createGridHeader(period));
            days.forEach(day => {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';

                // Find course in this sheet AND semester
                const courseId = sheet.courses.find(id => {
                    const c = DB.getCourse(id);
                    return c && c.day === day && c.period === period && c.semester === semesterName;
                });

                if (courseId) {
                    const course = DB.getCourse(courseId);
                    cell.innerHTML = `
                        <div class="course-card" style="background: rgba(99, 102, 241, 0.1); border-radius: var(--radius-sm); cursor: pointer;">
                            <div class="course-name">${course.name}</div>
                            <div class="course-room">${course.room}</div>
                        </div>
                    `;
                    cell.onclick = () => {
                        if (confirm(`「${course.name}」をシミュレーションから削除しますか？`)) {
                            const newCourses = sheet.courses.filter(id => id !== courseId);
                            DB.updateSheet(sheet.id, newCourses);
                            renderSimulation(document.getElementById('view-container'));
                        }
                    };
                } else {
                    // Empty slot
                    cell.style.opacity = '0.5';
                    cell.innerHTML = '<span style="font-size: 1.5rem; color: var(--text-light); opacity: 0; transition: opacity 0.2s;">+</span>';
                    cell.onmouseenter = () => cell.querySelector('span').style.opacity = '1';
                    cell.onmouseleave = () => cell.querySelector('span').style.opacity = '0';
                    cell.onclick = () => {
                        const input = prompt('追加する科目IDまたは名前の一部を入力してください\n(デモ用ID: C001~C008)');
                        if (input) {
                            // Simple search logic
                            const allCourses = DB.courses; // Direct access for prototype
                            const target = allCourses.find(c =>
                                (c.id === input || c.name.includes(input)) &&
                                c.day === day &&
                                c.period === period
                            );

                            if (target) {
                                if (sheet.courses.includes(target.id)) {
                                    alert('既に登録されています');
                                } else {
                                    const newCourses = [...sheet.courses, target.id];
                                    DB.updateSheet(sheet.id, newCourses);
                                    renderSimulation(document.getElementById('view-container'));
                                }
                            } else {
                                alert('該当する曜時限の科目が見つかりません');
                            }
                        }
                    };
                }

                grid.appendChild(cell);
            });
        });
    }

    window.switchSheet = (sheetId) => {
        const container = document.getElementById('view-container');
        container.dataset.activeSheet = sheetId;
        renderSimulation(container);
    };

    window.createNewSheet = () => {
        const name = prompt('シート名を入力してください', '新しいプラン');
        if (name) {
            const newSheet = DB.createSheet(name);
            switchSheet(newSheet.id);
        }
    };

    function renderUnitStatus(container) {
        const progress = DB.getUnitProgress();

        // Helper to calculate totals recursively
        const calculateTotal = (items) => {
            return items.reduce((acc, curr) => {
                const selfReq = curr.required || 0;
                const selfAcq = curr.acquired || 0;
                const childTotals = curr.children ? calculateTotal(curr.children) : { req: 0, acq: 0 };
                return {
                    req: acc.req + selfReq + childTotals.req,
                    acq: acc.acq + selfAcq + childTotals.acq
                };
            }, { req: 0, acq: 0 });
        };

        // Calculate Grand Total (Top-level items only, assuming children are subsets or additive depending on logic. 
        // Based on the prompt structure, children seem to be breakdowns. 
        // If children are breakdowns, we should only sum the top level.
        // Let's assume top-level 'required' and 'acquired' are the sums or the main tracking numbers.)
        // Actually, looking at the data structure I created, top-level has its own req/acq. 
        // Let's trust the top-level numbers for the grand total.
        const totalRequired = progress.reduce((acc, curr) => acc + curr.required, 0);
        const totalAcquired = progress.reduce((acc, curr) => acc + curr.acquired, 0);
        const totalPercentage = totalRequired === 0 ? 100 : Math.round((totalAcquired / totalRequired) * 100);

        // Recursive render function
        const renderCategory = (item, level = 0) => {
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
                html += item.children.map(child => renderCategory(child, level + 1)).join('');
            }

            return html;
        };

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
                    ${progress.map(p => renderCategory(p)).join('')}
                </div>
            </div>
        `;
    }
    // Program Change Logic
    window.updateProgram = (select) => {
        DB.user.program = select.value;
        const container = document.getElementById('view-container');
        renderSimulation(container);
    };

    // Semester Change Logic
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
