const DB = {
    user: {
        id: '2410000',
        name: '山田 太郎',
        program: '情報・通信工学プログラム',
        password: 'password123' // Mock password
    },
    courses: [
        { id: 'C001', code: 'MAT101', name: '線形代数I', day: 'Mon', period: 1, credits: 2, category: '基盤教養', teacher: '佐藤 健', room: 'A-201', semester: '1学期' },
        { id: 'C002', code: 'PRO101', name: 'プログラミング基礎', day: 'Tue', period: 2, credits: 2, category: '専門基礎', teacher: '鈴木 一郎', room: 'B-101', semester: '1学期' },
        { id: 'C003', code: 'ENG101', name: '英語コミュニケーション', day: 'Mon', period: 2, credits: 1, category: '英語', teacher: 'Smith John', room: 'C-305', semester: '1学期' },
        { id: 'C004', code: 'PHY101', name: '物理学実験', day: 'Wed', period: 3, credits: 2, category: '専門基礎', teacher: '田中 花子', room: 'Lab-1', semester: '2学期' },
        { id: 'C005', code: 'MAT102', name: '離散数学', day: 'Thu', period: 1, credits: 2, category: '専門基礎', teacher: '高橋 次郎', room: 'A-202', semester: '2学期' },
        { id: 'C006', code: 'CS101', name: 'アルゴリズム論', day: 'Fri', period: 2, credits: 2, category: '専門課程', teacher: '伊藤 三郎', room: 'B-102', semester: '2学期' },
        { id: 'C007', code: 'HUM101', name: '心理学概論', day: 'Wed', period: 1, credits: 2, category: '人文科学', teacher: '渡辺 美咲', room: 'D-101', semester: '1学期' },
        { id: 'C008', code: 'SOC101', name: '経済学入門', day: 'Fri', period: 3, credits: 2, category: '社会科学', teacher: '山本 太郎', room: 'D-102', semester: '3学期' }
    ],
    myCourses: [
        'C001', 'C002', 'C003', 'C004', 'C005', 'C006'
    ],
    tasks: [
        { id: 'T001', courseId: 'C001', title: '第1回レポート', deadline: '2026-01-20', completed: false },
        { id: 'T002', courseId: 'C002', title: 'Hello World課題', deadline: '2026-01-18', completed: true },
        { id: 'T003', courseId: 'C002', title: 'ループ処理課題', deadline: '2026-01-25', completed: false },
        { id: 'T004', courseId: 'C004', title: '実験予習レポート', deadline: '2026-01-21', completed: false },
        { id: 'T005', courseId: 'C006', title: 'ソートアルゴリズム実装', deadline: '2026-01-30', completed: false }
    ],
    sheets: [
        { id: 'S001', name: 'メディア情報学', courses: ['C001', 'C002', 'C003', 'C004', 'C005', 'C006'] },
        { id: 'S002', name: '経営社会情報', courses: ['C001', 'C002', 'C003', 'C004', 'C005', 'C006', 'C007', 'C008'] },
        { id: 'S003', name: '転類失敗(・w・)', courses: ['C001', 'C002', 'C003', 'C004', 'C005', 'C006', 'C007', 'C008'] }
    ],
    unitRequirements: {
        'メディア情報学プログラム': [
            {
                category: '総合文化科目', required: 28, acquired: 20, color: 'var(--primary-color)',
                children: [
                    { category: '人文･社会科学科目', required: 8, acquired: 6 },
                    { category: '人文社会(編入生）', required: 0, acquired: 0 },
                    { category: '人文社会', required: 8, acquired: 6 },
                    { category: '言語文化科目Ⅰ', required: 6, acquired: 6 },
                    { category: '言語文化科目Ⅱ', required: 2, acquired: 2 },
                    { category: '言語文化演習科目', required: 2, acquired: 0 }
                ]
            },
            { category: '健康・スポーツ科学科目', required: 3, acquired: 3, color: '#10b981', children: [{ category: '必修', required: 2, acquired: 2 }, { category: '選択', required: 1, acquired: 1 }] },
            { category: '理工系教養科目', required: 2, acquired: 2, color: '#f59e0b' },
            { category: '上級科目', required: 4, acquired: 2, color: '#8b5cf6' },
            { category: '実践教育科目', required: 17, acquired: 14, color: '#ec4899', children: [{ category: '初年次導入科目', required: 6, acquired: 6 }, { category: 'データサイエンス科目', required: 3, acquired: 2 }, { category: '倫理･キャリア教育科目', required: 4, acquired: 4 }, { category: '技術英語科目', required: 4, acquired: 2 }] },
            { category: '専門科目', required: 76, acquired: 56, color: '#3b82f6', children: [{ category: '理数基礎科目', required: 18, acquired: 18 }, { category: '類共通基礎科目(必修）', required: 15, acquired: 15 }, { category: '類共通基礎科目(選択)', required: 8, acquired: 8 }, { category: '類専門科目(必修)', required: 13, acquired: 3 }, { category: '類専門科目(選択)', required: 22, acquired: 12 }] },
            { category: '共通単位', required: 8, acquired: 6, color: '#6366f1' }
        ],
        '経営情報学プログラム': [
            { category: '健康・スポーツ科学科目', required: 3, acquired: 3, color: '#10b981', children: [{ category: '必修', required: 2, acquired: 2 }, { category: '選択', required: 1, acquired: 1 }] },
            { category: '理工系教養科目', required: 2, acquired: 2, color: '#f59e0b' },
            { category: '上級科目', required: 4, acquired: 2, color: '#8b5cf6' },
            { category: '実践教育科目', required: 17, acquired: 14, color: '#ec4899', children: [{ category: '初年次導入科目', required: 6, acquired: 6 }, { category: 'データサイエンス科目', required: 3, acquired: 2 }, { category: '倫理･キャリア教育科目', required: 4, acquired: 4 }, { category: '技術英語科目', required: 4, acquired: 2 }] },
            { category: '総合文化科目', required: 24, acquired: 20, color: 'var(--primary-color)', children: [] },
            { category: '専門科目', required: 80, acquired: 40, color: '#3b82f6', children: [] }
        ],
        'セキュリティ情報学プログラム': [
            { category: '総合文化科目', required: 26, acquired: 20, color: 'var(--primary-color)', children: [] },
            { category: '専門科目', required: 78, acquired: 45, color: '#3b82f6', children: [] }
        ]
    },

    // Methods
    getCourse(id) {
        return this.courses.find(c => c.id === id);
    },
    getMyCourses() {
        return this.myCourses.map(id => this.getCourse(id)).filter(Boolean);
    },
    getTasks() {
        return this.tasks;
    },
    getTasksByCourse(courseId) {
        return this.tasks.filter(t => t.courseId === courseId);
    },
    toggleTaskCompletion(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
        }
    },
    searchCourses(keyword, day, period, category) {
        return this.courses.filter(c => {
            const matchKeyword = !keyword || c.name.includes(keyword) || c.teacher.includes(keyword);
            const matchDay = !day || c.day === day;
            const matchPeriod = !period || c.period == period;
            const matchCategory = !category || c.category === category;
            return matchKeyword && matchDay && matchPeriod && matchCategory;
        });
    },
    registerCourse(courseId) {
        if (!this.myCourses.includes(courseId)) {
            this.myCourses.push(courseId);
        }
    },
    removeCourse(courseId) {
        this.myCourses = this.myCourses.filter(id => id !== courseId);
    },
    getSheets() {
        return this.sheets;
    },
    createSheet(name) {
        const newId = 'S' + (this.sheets.length + 1).toString().padStart(3, '0');
        const newSheet = { id: newId, name: name, courses: [] };
        this.sheets.push(newSheet);
        return newSheet;
    },
    updateSheet(sheetId, courseIds) {
        const sheet = this.sheets.find(s => s.id === sheetId);
        if (sheet) {
            sheet.courses = courseIds;
        }
    },
    getUnitProgress(program) {
        // Default to user's program if not specified
        const p = program || this.user.program;
        return this.unitRequirements[p] || this.unitRequirements['メディア情報学プログラム'];
    },
    login(id, password) {
        return id === this.user.id && password === this.user.password;
    }
};
