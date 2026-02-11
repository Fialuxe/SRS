/**
 * CampUsFlow Mock Data
 * strictly adhering to SRS data structures.
 */

export const INITIAL_DATA = {
    // 2.1.2 Database Interface - Student Information
    users: [
        {
            studentId: "u1234567",
            // Password: "Password1!" (hashed mock)
            passwordHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
            email: "u1234567@uec.ac.jp",
            program: "Information and Communication Engineering",
            status: "active", // active, locked, pending
            role: "student", // student, admin
            failedLoginAttempts: 0
        },
        {
            studentId: "admin",
            passwordHash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // admin
            email: "admin@uec.ac.jp",
            program: "Administration",
            status: "active",
            role: "admin",
            failedLoginAttempts: 0
        },
        {
            studentId: "u9999999",
            passwordHash: "...",
            email: "u9999999@uec.ac.jp",
            program: "Mechanical Engineering",
            status: "locked",
            role: "student",
            failedLoginAttempts: 5
        }
    ],

    // 2.1.2 Database Interface - Course Data
    // 3.1.1 TimeTable Screen - 1-7 periods, Mon-Sat
    courses: [
        {
            id: "CS101",
            name: "Introduction to Computer Science",
            instructor: "Prof. Alan Turing",
            room: "East-101",
            day: "Mon", // Mon, Tue, Wed, Thu, Fri, Sat
            period: 1, // 1-7
            credits: 2,
            category: "Specialized Basic", // for Credit Status
            syllabusUrl: "https://kyoumu.uec.ac.jp/syllabus/CS101",
            lmsUrl: "https://class.uec.ac.jp/CS101", // detected submission URL
            description: "Fundamental concepts of computing."
        },
        {
            id: "MA101",
            name: "Calculus I",
            instructor: "Prof. Newton",
            room: "West-202",
            day: "Tue",
            period: 2,
            credits: 2,
            category: "Basic Science",
            syllabusUrl: "https://kyoumu.uec.ac.jp/syllabus/MA101",
            lmsUrl: null,
            description: "Limits, derivatives, and integrals."
        },
        {
            id: "EN101",
            name: "Academic English",
            instructor: "Prof. Shakespeare",
            room: "Language-Lab",
            day: "Wed",
            period: 3,
            credits: 1,
            category: "Language",
            syllabusUrl: "https://kyoumu.uec.ac.jp/syllabus/EN101",
            lmsUrl: "https://class.uec.ac.jp/EN101/submit",
            description: "English for academic purposes."
        },
        {
            id: "IT101",
            name: "Information Literacy",
            instructor: "Prof. Gate",
            room: "A-201",
            day: "Mon",
            period: 1, // Intentional conflict for testing
            credits: 2,
            category: "Basic",
            syllabusUrl: "https://kyoumu.uec.ac.jp/syllabus/IT101",
            lmsUrl: null,
            description: "Basic IT skills."
        }
    ],

    // 2.1.2 Database Interface - Registration Data
    // Link between User and Course
    registrations: [
        {
            studentId: "u1234567",
            courseId: "CS101",
            notificationEnabled: true // 3.1.1 Notification setting
        },
        {
            studentId: "u1234567",
            courseId: "MA101",
            notificationEnabled: false
        }
    ],

    // 2.1.2 Database Interface - Task Data
    // 3.1.1 Task Tree
    tasks: [
        {
            id: "t1",
            courseId: "CS101",
            title: "Algorithm Report",
            deadline: "2026-02-15T23:59:00", // MM/DD HH:mm
            createdAt: "2026-02-01T10:00:00",
            status: "incomplete", // incomplete, complete
            studentId: "u1234567"
        },
        {
            id: "t2",
            courseId: "CS101",
            title: "Coding Assignment 1",
            deadline: "2026-02-20T23:59:00",
            createdAt: "2026-02-05T10:00:00",
            status: "incomplete",
            studentId: "u1234567"
        },
        {
            id: "t3",
            courseId: "MA101",
            title: "Problem Set 3",
            deadline: "2026-02-10T12:00:00", // Past deadline example
            createdAt: "2026-02-01T09:00:00",
            status: "complete",
            studentId: "u1234567"
        }
    ],

    // 3.1.1 Credit Status Data
    graduationRequirements: {
        program: "Information and Communication Engineering",
        categories: [
            {
                name: "Humanities & Social Sciences",
                required: 12,
                children: ["Philosophy", "History", "Economy"]
            },
            {
                name: "Basic Science",
                required: 10,
                children: ["Mathematics", "Physics", "Chemistry"]
            },
            {
                name: "Language",
                required: 8,
                children: ["English", "Second Language"]
            },
            {
                name: "Specialized Basic",
                required: 16,
                children: []
            },
            {
                name: "Specialized",
                required: 40,
                children: []
            }
        ]
    },

    // 3.1.1 System Monitor Data
    systemLogs: [
        {
            id: "log1",
            timestamp: "2026-02-10T04:05:00",
            type: "error", // error, warning
            message: "Sync Timeout: Syllabus DB",
            target: "ALL",
            acknowledged: false
        },
        {
            id: "log2",
            timestamp: "2026-02-09T18:30:00",
            type: "error",
            message: "Email Send Failed",
            target: "u1234567",
            acknowledged: true
        }
    ],

    // 3.1.1 System Monitor External Link Status
    systemStatus: {
        syllabusSync: {
            status: "normal", // normal, error
            lastSuccess: "2026-02-11T04:00:00",
            lastFailure: null
        },
        lmsSync: {
            lastFailure: "2026-02-11T04:00:00"
        }
    },

    // 3.1.2 Academic History (Feedback Feature)
    academicHistory: [
        {
            studentId: "u1234567",
            courses: [
                { semester: 1, courseId: "CS101", name: "Introduction to Computer Science", grade: "A", credits: 2 },
                { semester: 1, courseId: "MA101", name: "Calculus I", grade: "B", credits: 2 },
                { semester: 2, courseId: "EN101", name: "Academic English", grade: "S", credits: 1 }
            ]
        }
    ]
};
