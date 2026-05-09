// =============================================================
// UBYS – Test Data Script
// 10 students, 3 instructors, 3 managers + enrollments, grades, attendance
// Password for ALL accounts: "password"
//
// Run: mongosh "mongodb://admin:admin!@72.61.136.135:27017/?authSource=admin" test_data.js
// =============================================================

const db = db.getSiblingDB("ubys");

// bcrypt hash of "password" (cost=10) — valid for Hash::check() in Laravel
const PASS = "$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";

// ── Helper: clear all collections without dropping (schema stays intact) ──────
[
    "faculties", "departments", "semesters", "students", "instructors",
    "managers", "courses", "course_offerings", "enrollments",
    "grades", "attendance", "announcements", "counters"
].forEach(c => { try { db[c].deleteMany({}); } catch(e) {} });

print("Collections cleared.");

// ══════════════════════════════════════════════════════════════════════════════
// 1. FACULTIES
// ══════════════════════════════════════════════════════════════════════════════
db.faculties.insertMany([
    { faculty_code: "ENG",  name: "Faculty of Engineering",                          is_active: true, created_at: new Date("2020-09-01"), updated_at: new Date("2020-09-01") },
    { faculty_code: "ECON", name: "Faculty of Economics and Administrative Sciences", is_active: true, created_at: new Date("2020-09-01"), updated_at: new Date("2020-09-01") },
    { faculty_code: "SCI",  name: "Faculty of Science and Letters",                  is_active: true, created_at: new Date("2020-09-01"), updated_at: new Date("2020-09-01") }
]);
print("✓ faculties: " + db.faculties.countDocuments());

// ══════════════════════════════════════════════════════════════════════════════
// 2. DEPARTMENTS
// ══════════════════════════════════════════════════════════════════════════════
db.departments.insertMany([
    { department_id: 125, name: "Computer Engineering",                 faculty_code: "ENG",  program_duration: 4, quota: 60, is_active: true, created_at: new Date("2020-09-01"), updated_at: new Date("2020-09-01") },
    { department_id: 130, name: "Electrical and Electronics Engineering",faculty_code: "ENG",  program_duration: 4, quota: 50, is_active: true, created_at: new Date("2020-09-01"), updated_at: new Date("2020-09-01") },
    { department_id: 210, name: "Business Administration",              faculty_code: "ECON", program_duration: 4, quota: 80, is_active: true, created_at: new Date("2020-09-01"), updated_at: new Date("2020-09-01") }
]);
print("✓ departments: " + db.departments.countDocuments());

// ══════════════════════════════════════════════════════════════════════════════
// 3. SEMESTERS
// ══════════════════════════════════════════════════════════════════════════════
db.semesters.insertMany([
    {
        name: "2023-2024 Fall", academic_year: "2023-2024", type: "fall",
        start_date: new Date("2023-09-25"), end_date: new Date("2024-01-19"),
        exam_schedule: { midterm_start: new Date("2023-11-13"), midterm_end: new Date("2023-11-24"), final_start: new Date("2024-01-08"), final_end: new Date("2024-01-19"), resit_start: new Date("2024-02-05"), resit_end: new Date("2024-02-16") },
        registration_schedule: { add_start: new Date("2023-09-18"), add_end: new Date("2023-09-22"), drop_end: new Date("2023-10-20") },
        is_active: false, created_at: new Date("2023-07-01")
    },
    {
        name: "2023-2024 Spring", academic_year: "2023-2024", type: "spring",
        start_date: new Date("2024-02-12"), end_date: new Date("2024-06-14"),
        exam_schedule: { midterm_start: new Date("2024-04-08"), midterm_end: new Date("2024-04-19"), final_start: new Date("2024-06-03"), final_end: new Date("2024-06-14"), resit_start: new Date("2024-07-01"), resit_end: new Date("2024-07-12") },
        registration_schedule: { add_start: new Date("2024-02-05"), add_end: new Date("2024-02-09"), drop_end: new Date("2024-03-08") },
        is_active: false, created_at: new Date("2024-01-01")
    },
    {
        name: "2024-2025 Fall", academic_year: "2024-2025", type: "fall",
        start_date: new Date("2024-09-23"), end_date: new Date("2025-01-17"),
        exam_schedule: { midterm_start: new Date("2024-11-11"), midterm_end: new Date("2024-11-22"), final_start: new Date("2025-01-06"), final_end: new Date("2025-01-17"), resit_start: new Date("2025-02-03"), resit_end: new Date("2025-02-14") },
        registration_schedule: { add_start: new Date("2024-09-16"), add_end: new Date("2024-09-20"), drop_end: new Date("2024-10-18") },
        is_active: false, created_at: new Date("2024-07-01")
    },
    {
        name: "2024-2025 Spring", academic_year: "2024-2025", type: "spring",
        start_date: new Date("2025-02-17"), end_date: new Date("2025-06-13"),
        exam_schedule: { midterm_start: new Date("2025-04-07"), midterm_end: new Date("2025-04-18"), final_start: new Date("2025-06-02"), final_end: new Date("2025-06-13"), resit_start: new Date("2025-06-30"), resit_end: new Date("2025-07-11") },
        registration_schedule: { add_start: new Date("2025-02-10"), add_end: new Date("2025-02-14"), drop_end: new Date("2025-03-14") },
        is_active: true, created_at: new Date("2025-01-01")
    }
]);
print("✓ semesters: " + db.semesters.countDocuments());

// ══════════════════════════════════════════════════════════════════════════════
// 4. INSTRUCTORS  (3 kişi)
// ══════════════════════════════════════════════════════════════════════════════
db.instructors.insertMany([
    {
        staff_id: "INS001", department_id: 125,
        personal: { first_name: "Ahmet",  last_name: "Çelik",  national_id: "22233344455", email: "ahmet.celik@ubys.edu.tr",  phone: "3121234567", office: "B-201" },
        academic: { title: "Prof. Dr.",          specializations: ["Artificial Intelligence", "Machine Learning"], publication_count: 47 },
        password: PASS, is_active: true, created_at: new Date("2010-09-01"), updated_at: new Date("2024-09-01")
    },
    {
        staff_id: "INS002", department_id: 125,
        personal: { first_name: "Fatma",  last_name: "Arslan", national_id: "33344455566", email: "fatma.arslan@ubys.edu.tr", phone: "3121234568", office: "B-205" },
        academic: { title: "Assoc. Prof. Dr.",   specializations: ["Software Engineering", "Web Technologies"],   publication_count: 22 },
        password: PASS, is_active: true, created_at: new Date("2015-09-01"), updated_at: new Date("2024-09-01")
    },
    {
        staff_id: "INS003", department_id: 130,
        personal: { first_name: "Murat",  last_name: "Yıldız", national_id: "44455566677", email: "murat.yildiz@ubys.edu.tr", phone: "3121234569", office: "C-110" },
        academic: { title: "Asst. Prof. Dr.",    specializations: ["Power Electronics", "Control Systems"],        publication_count: 11 },
        password: PASS, is_active: true, created_at: new Date("2019-09-01"), updated_at: new Date("2024-09-01")
    }
]);
print("✓ instructors: " + db.instructors.countDocuments());

// ══════════════════════════════════════════════════════════════════════════════
// 5. MANAGERS  (3 kişi)
// ══════════════════════════════════════════════════════════════════════════════
db.managers.insertMany([
    {
        staff_id: "MNG001", role: "rector",           unit_type: "university", unit_id: "UNI",
        personal: { first_name: "Kemal", last_name: "Şahin", national_id: "55566677788", email: "rector@ubys.edu.tr",   phone: "3121110001", office: "Rectorate A-1" },
        password: PASS, appointment_start: new Date("2022-09-01"), appointment_end: null, is_active: true, created_at: new Date("2022-09-01"), updated_at: new Date("2022-09-01")
    },
    {
        staff_id: "MNG002", role: "dean",             unit_type: "faculty",    unit_id: "ENG",
        personal: { first_name: "Leyla", last_name: "Koç",   national_id: "66677788899", email: "dean.eng@ubys.edu.tr", phone: "3121110002", office: "Engineering Faculty A-1" },
        password: PASS, appointment_start: new Date("2023-09-01"), appointment_end: null, is_active: true, created_at: new Date("2023-09-01"), updated_at: new Date("2023-09-01")
    },
    {
        staff_id: "MNG003", role: "department_chair", unit_type: "department", unit_id: 125,
        personal: { first_name: "Orhan", last_name: "Bulut", national_id: "77788899900", email: "chair.cs@ubys.edu.tr", phone: "3121110003", office: "B-101" },
        password: PASS, appointment_start: new Date("2023-09-01"), appointment_end: null, is_active: true, created_at: new Date("2023-09-01"), updated_at: new Date("2023-09-01")
    }
]);
print("✓ managers: " + db.managers.countDocuments());

// ══════════════════════════════════════════════════════════════════════════════
// 6. COURSES
// ══════════════════════════════════════════════════════════════════════════════
db.courses.insertMany([
    { course_code: "CS101", name: "Introduction to Programming",       department_id: 125, credits: 3, ects: 5, theory_hours: 2, lab_hours: 2, type: "mandatory", class_year: 1, prerequisites: [],              is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "CS102", name: "Discrete Mathematics",              department_id: 125, credits: 3, ects: 5, theory_hours: 3, lab_hours: 0, type: "mandatory", class_year: 1, prerequisites: [],              is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "CS103", name: "Physics I",                         department_id: 125, credits: 4, ects: 6, theory_hours: 3, lab_hours: 2, type: "mandatory", class_year: 1, prerequisites: [],              is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "CS201", name: "Data Structures and Algorithms",    department_id: 125, credits: 3, ects: 5, theory_hours: 2, lab_hours: 2, type: "mandatory", class_year: 2, prerequisites: ["CS101"],       is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "CS202", name: "Object-Oriented Programming",       department_id: 125, credits: 3, ects: 5, theory_hours: 2, lab_hours: 2, type: "mandatory", class_year: 2, prerequisites: ["CS101"],       is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "CS301", name: "Database Management Systems",       department_id: 125, credits: 3, ects: 5, theory_hours: 2, lab_hours: 2, type: "mandatory", class_year: 3, prerequisites: ["CS201"],       is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "CS302", name: "Operating Systems",                 department_id: 125, credits: 3, ects: 5, theory_hours: 3, lab_hours: 0, type: "mandatory", class_year: 3, prerequisites: ["CS201"],       is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "CS401", name: "Software Engineering",              department_id: 125, credits: 3, ects: 5, theory_hours: 2, lab_hours: 2, type: "mandatory", class_year: 4, prerequisites: ["CS302"],       is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "CS490", name: "Graduation Project",                department_id: 125, credits: 4, ects: 8, theory_hours: 0, lab_hours: 4, type: "mandatory", class_year: 4, prerequisites: ["CS301","CS302"], is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "BA101", name: "Introduction to Business",          department_id: 210, credits: 3, ects: 5, theory_hours: 3, lab_hours: 0, type: "mandatory", class_year: 1, prerequisites: [],              is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "EE101", name: "Circuit Theory",                    department_id: 130, credits: 4, ects: 6, theory_hours: 3, lab_hours: 2, type: "mandatory", class_year: 1, prerequisites: [],              is_active: true, created_at: new Date("2020-09-01") }
]);
print("✓ courses: " + db.courses.countDocuments());

// ══════════════════════════════════════════════════════════════════════════════
// 7. COURSE OFFERINGS  (2024-2025 Spring)
// ══════════════════════════════════════════════════════════════════════════════
db.course_offerings.insertMany([
    {
        course_code: "CS101", semester_name: "2024-2025 Spring", instructor_id: "INS002", section: "A",
        capacity: 40, enrolled_count: 6,
        schedule: [
            { day: "Monday",    start_time: "09:00", end_time: "11:00", classroom: "B-Lab1" },
            { day: "Wednesday", start_time: "11:00", end_time: "13:00", classroom: "B-Lab1" }
        ],
        is_active: true, created_at: new Date("2025-01-15")
    },
    {
        course_code: "CS102", semester_name: "2024-2025 Spring", instructor_id: "INS001", section: "A",
        capacity: 40, enrolled_count: 6,
        schedule: [
            { day: "Tuesday",  start_time: "13:00", end_time: "16:00", classroom: "A-101" }
        ],
        is_active: true, created_at: new Date("2025-01-15")
    },
    {
        course_code: "CS103", semester_name: "2024-2025 Spring", instructor_id: "INS001", section: "A",
        capacity: 40, enrolled_count: 6,
        schedule: [
            { day: "Thursday", start_time: "09:00", end_time: "12:00", classroom: "C-Lab1" }
        ],
        is_active: true, created_at: new Date("2025-01-15")
    },
    {
        course_code: "CS201", semester_name: "2024-2025 Spring", instructor_id: "INS001", section: "A",
        capacity: 30, enrolled_count: 2,
        schedule: [
            { day: "Monday",  start_time: "13:00", end_time: "15:00", classroom: "B-Lab2" },
            { day: "Friday",  start_time: "09:00", end_time: "11:00", classroom: "B-Lab2" }
        ],
        is_active: true, created_at: new Date("2025-01-15")
    },
    {
        course_code: "CS301", semester_name: "2024-2025 Spring", instructor_id: "INS002", section: "A",
        capacity: 30, enrolled_count: 1,
        schedule: [
            { day: "Wednesday", start_time: "09:00", end_time: "11:00", classroom: "B-Lab3" },
            { day: "Friday",    start_time: "13:00", end_time: "15:00", classroom: "B-Lab3" }
        ],
        is_active: true, created_at: new Date("2025-01-15")
    },
    {
        course_code: "CS401", semester_name: "2024-2025 Spring", instructor_id: "INS002", section: "A",
        capacity: 25, enrolled_count: 1,
        schedule: [
            { day: "Tuesday",  start_time: "09:00", end_time: "11:00", classroom: "A-102" },
            { day: "Thursday", start_time: "13:00", end_time: "15:00", classroom: "A-102" }
        ],
        is_active: true, created_at: new Date("2025-01-15")
    },
    {
        course_code: "EE101", semester_name: "2024-2025 Spring", instructor_id: "INS003", section: "A",
        capacity: 35, enrolled_count: 2,
        schedule: [
            { day: "Monday",   start_time: "11:00", end_time: "13:00", classroom: "C-101" },
            { day: "Thursday", start_time: "11:00", end_time: "13:00", classroom: "C-Lab2" }
        ],
        is_active: true, created_at: new Date("2025-01-15")
    },
    {
        course_code: "BA101", semester_name: "2024-2025 Spring", instructor_id: "INS001", section: "A",
        capacity: 50, enrolled_count: 2,
        schedule: [
            { day: "Wednesday", start_time: "13:00", end_time: "16:00", classroom: "D-201" }
        ],
        is_active: true, created_at: new Date("2025-01-15")
    }
]);
print("✓ course_offerings: " + db.course_offerings.countDocuments());

// ══════════════════════════════════════════════════════════════════════════════
// 8. STUDENTS  (10 öğrenci)
//    CS(125)/2024 → 4 kişi | CS(125)/2023 → 2 kişi | CS(125)/2022 → 1 kişi
//    EE(130)/2023 → 1 kişi | EE(130)/2024 → 1 kişi | BA(210)/2024 → 1 kişi
// ══════════════════════════════════════════════════════════════════════════════
db.students.insertMany([
    // ── CS 2024 (1. sınıf) ────────────────────────────────────────────────────
    {
        student_no: "1252024001", department_id: 125, enrollment_year: 2024, sequence_no: 1,
        personal: { first_name: "Ali",    last_name: "Yılmaz", national_id: "10000000001", birth_date: new Date("2006-03-15"), gender: "M", phone: "5551111001", email: "ali.yilmaz@student.ubys.edu.tr",    address: "Ankara" },
        academic:  { class_year: 1, active_semester: "2024-2025 Spring", gpa: 3.20, total_credits: 30, status: "active" },
        password: PASS, created_at: new Date("2024-09-01"), updated_at: new Date("2025-02-17")
    },
    {
        student_no: "1252024002", department_id: 125, enrollment_year: 2024, sequence_no: 2,
        personal: { first_name: "Ayşe",   last_name: "Kara",   national_id: "10000000002", birth_date: new Date("2005-07-22"), gender: "F", phone: "5551111002", email: "ayse.kara@student.ubys.edu.tr",      address: "Istanbul" },
        academic:  { class_year: 1, active_semester: "2024-2025 Spring", gpa: 3.75, total_credits: 30, status: "active" },
        password: PASS, created_at: new Date("2024-09-01"), updated_at: new Date("2025-02-17")
    },
    {
        student_no: "1252024003", department_id: 125, enrollment_year: 2024, sequence_no: 3,
        personal: { first_name: "Emre",   last_name: "Arslan", national_id: "10000000003", birth_date: new Date("2006-11-08"), gender: "M", phone: "5551111003", email: "emre.arslan@student.ubys.edu.tr",    address: "Izmir" },
        academic:  { class_year: 1, active_semester: "2024-2025 Spring", gpa: 2.90, total_credits: 30, status: "active" },
        password: PASS, created_at: new Date("2024-09-01"), updated_at: new Date("2025-02-17")
    },
    {
        student_no: "1252024004", department_id: 125, enrollment_year: 2024, sequence_no: 4,
        personal: { first_name: "Seda",   last_name: "Demir",  national_id: "10000000004", birth_date: new Date("2006-02-14"), gender: "F", phone: "5551111004", email: "seda.demir@student.ubys.edu.tr",     address: "Bursa" },
        academic:  { class_year: 1, active_semester: "2024-2025 Spring", gpa: 3.50, total_credits: 30, status: "active" },
        password: PASS, created_at: new Date("2024-09-01"), updated_at: new Date("2025-02-17")
    },
    // ── CS 2023 (2. sınıf) ────────────────────────────────────────────────────
    {
        student_no: "1252023001", department_id: 125, enrollment_year: 2023, sequence_no: 1,
        personal: { first_name: "Zeynep", last_name: "Çelik",  national_id: "10000000005", birth_date: new Date("2005-05-30"), gender: "F", phone: "5551111005", email: "zeynep.celik@student.ubys.edu.tr",   address: "Ankara" },
        academic:  { class_year: 2, active_semester: "2024-2025 Spring", gpa: 3.10, total_credits: 60, status: "active" },
        password: PASS, created_at: new Date("2023-09-01"), updated_at: new Date("2025-02-17")
    },
    {
        student_no: "1252023002", department_id: 125, enrollment_year: 2023, sequence_no: 2,
        personal: { first_name: "Deniz",  last_name: "Öztürk", national_id: "10000000006", birth_date: new Date("2005-09-12"), gender: "M", phone: "5551111006", email: "deniz.ozturk@student.ubys.edu.tr",   address: "Adana" },
        academic:  { class_year: 2, active_semester: "2024-2025 Spring", gpa: 2.60, total_credits: 57, status: "active" },
        password: PASS, created_at: new Date("2023-09-01"), updated_at: new Date("2025-02-17")
    },
    // ── CS 2022 (3. sınıf) ────────────────────────────────────────────────────
    {
        student_no: "1252022001", department_id: 125, enrollment_year: 2022, sequence_no: 1,
        personal: { first_name: "Can",    last_name: "Özkan",  national_id: "10000000007", birth_date: new Date("2004-01-20"), gender: "M", phone: "5551111007", email: "can.ozkan@student.ubys.edu.tr",       address: "Istanbul" },
        academic:  { class_year: 3, active_semester: "2024-2025 Spring", gpa: 3.40, total_credits: 90, status: "active" },
        password: PASS, created_at: new Date("2022-09-01"), updated_at: new Date("2025-02-17")
    },
    // ── EE 2023 (2. sınıf) ────────────────────────────────────────────────────
    {
        student_no: "1302023001", department_id: 130, enrollment_year: 2023, sequence_no: 1,
        personal: { first_name: "Mehmet", last_name: "Şahin",  national_id: "10000000008", birth_date: new Date("2005-04-17"), gender: "M", phone: "5551111008", email: "mehmet.sahin@student.ubys.edu.tr",   address: "Izmir" },
        academic:  { class_year: 2, active_semester: "2024-2025 Spring", gpa: 2.85, total_credits: 60, status: "active" },
        password: PASS, created_at: new Date("2023-09-01"), updated_at: new Date("2025-02-17")
    },
    // ── EE 2024 (1. sınıf) ────────────────────────────────────────────────────
    {
        student_no: "1302024001", department_id: 130, enrollment_year: 2024, sequence_no: 1,
        personal: { first_name: "Selin",  last_name: "Koç",    national_id: "10000000009", birth_date: new Date("2006-08-03"), gender: "F", phone: "5551111009", email: "selin.koc@student.ubys.edu.tr",       address: "Ankara" },
        academic:  { class_year: 1, active_semester: "2024-2025 Spring", gpa: 3.60, total_credits: 30, status: "active" },
        password: PASS, created_at: new Date("2024-09-01"), updated_at: new Date("2025-02-17")
    },
    // ── BA 2024 (1. sınıf) ────────────────────────────────────────────────────
    {
        student_no: "2102024001", department_id: 210, enrollment_year: 2024, sequence_no: 1,
        personal: { first_name: "Fatma",  last_name: "Bulut",  national_id: "10000000010", birth_date: new Date("2006-06-25"), gender: "F", phone: "5551111010", email: "fatma.bulut@student.ubys.edu.tr",    address: "Konya" },
        academic:  { class_year: 1, active_semester: "2024-2025 Spring", gpa: 3.80, total_credits: 30, status: "active" },
        password: PASS, created_at: new Date("2024-09-01"), updated_at: new Date("2025-02-17")
    }
]);
print("✓ students: " + db.students.countDocuments());

// ══════════════════════════════════════════════════════════════════════════════
// 9. ENROLLMENTS  (2024-2025 Spring)
//    1. sınıf CS → CS101, CS102, CS103
//    2. sınıf CS → CS201, CS202
//    3. sınıf CS → CS301
//    EE 1.sınıf  → EE101
//    BA 1.sınıf  → BA101
// ══════════════════════════════════════════════════════════════════════════════
const SEM = "2024-2025 Spring";
const ED  = new Date("2025-02-17");

const enrollData = [
    // CS year-1 students (4 students × 3 courses)
    ...["1252024001","1252024002","1252024003","1252024004"].flatMap(sno =>
        ["CS101","CS102","CS103"].map(code => ({
            student_no: sno, course_code: code, semester_name: SEM, section: "A",
            status: "ongoing", enrollment_date: ED, created_at: ED
        }))
    ),
    // CS year-2 students (2 students × 2 courses)
    ...["1252023001","1252023002"].flatMap(sno =>
        ["CS201","CS202"].map(code => ({
            student_no: sno, course_code: code, semester_name: SEM, section: "A",
            status: "ongoing", enrollment_date: ED, created_at: ED
        }))
    ),
    // CS year-3 student (1 student × 2 courses)
    ...["CS301","CS302"].map(code => ({
        student_no: "1252022001", course_code: code, semester_name: SEM, section: "A",
        status: "ongoing", enrollment_date: ED, created_at: ED
    })),
    // EE students
    { student_no: "1302023001", course_code: "EE101", semester_name: SEM, section: "A", status: "ongoing", enrollment_date: ED, created_at: ED },
    { student_no: "1302024001", course_code: "EE101", semester_name: SEM, section: "A", status: "ongoing", enrollment_date: ED, created_at: ED },
    // BA student
    { student_no: "2102024001", course_code: "BA101", semester_name: SEM, section: "A", status: "ongoing", enrollment_date: ED, created_at: ED }
];
db.enrollments.insertMany(enrollData);
print("✓ enrollments: " + db.enrollments.countDocuments());

// ══════════════════════════════════════════════════════════════════════════════
// 10. GRADES  (2024-2025 Fall — tamamlandı)
// ══════════════════════════════════════════════════════════════════════════════
function calcGrade(raw) {
    if (raw >= 90) return { letter: "AA", point: 4.0, passing: true  };
    if (raw >= 85) return { letter: "BA", point: 3.5, passing: true  };
    if (raw >= 75) return { letter: "BB", point: 3.0, passing: true  };
    if (raw >= 70) return { letter: "CB", point: 2.5, passing: true  };
    if (raw >= 60) return { letter: "CC", point: 2.0, passing: true  };
    if (raw >= 50) return { letter: "DC", point: 1.5, passing: false };
    if (raw >= 45) return { letter: "DD", point: 1.0, passing: false };
    return               { letter: "FF", point: 0.0, passing: false };
}

const FALL = "2024-2025 Fall";
const GD   = new Date("2025-01-20");

// raw scores: [student_no, course_code, midterm, final, homework]
const gradeRows = [
    ["1252024001","CS101", 70, 82, 85, "INS002"],
    ["1252024002","CS101", 90, 95, 98, "INS002"],
    ["1252024003","CS101", 55, 60, 70, "INS002"],
    ["1252024004","CS101", 80, 78, 88, "INS002"],
    ["1252024001","CS102", 65, 72, 80, "INS001"],
    ["1252024002","CS102", 88, 92, 95, "INS001"],
    ["1252024003","CS102", 40, 50, 55, "INS001"],
    ["1252024004","CS102", 75, 80, 82, "INS001"],
    ["1252023001","CS201", 78, 82, 85, "INS001"],
    ["1252023002","CS201", 55, 48, 60, "INS001"],
    ["1252022001","CS301", 85, 90, 88, "INS002"],
    ["1302023001","EE101", 70, 75, 80, "INS003"],
    ["1302024001","EE101", 92, 88, 95, "INS003"]
];

const gradesDocs = gradeRows.map(([sno, code, mid, fin, hw, ins]) => {
    const raw = Math.round(mid * 0.3 + fin * 0.5 + hw * 0.2);
    const g = calcGrade(raw);
    return {
        student_no: sno, course_code: code, semester_name: FALL,
        score_breakdown: { midterm: mid, final: fin, homework: hw },
        raw_score: raw, letter_grade: g.letter, grade_point: g.point, is_passing: g.passing,
        instructor_id: ins, graded_at: GD, updated_at: GD
    };
});
db.grades.insertMany(gradesDocs);
print("✓ grades: " + db.grades.countDocuments());

// ══════════════════════════════════════════════════════════════════════════════
// 11. ATTENDANCE  (2024-2025 Spring — ilk 3 hafta)
// ══════════════════════════════════════════════════════════════════════════════
const attDates = [
    new Date("2025-02-24"), new Date("2025-03-03"), new Date("2025-03-10")
];

// status pool: mostly present, some absent
const statusPool = ["present","present","present","present","absent"];

const cs1Students = ["1252024001","1252024002","1252024003","1252024004"];
const attDocs = [];

cs1Students.forEach((sno, si) => {
    attDates.forEach((dt, di) => {
        attDocs.push({
            student_no: sno, course_code: "CS101", semester_name: SEM, section: "A",
            class_date: dt, hour_count: 2,
            status: statusPool[(si + di) % statusPool.length],
            recorded_by: "INS002", created_at: dt
        });
    });
});

// CS201 attendance for year-2 students
["1252023001","1252023002"].forEach((sno, si) => {
    attDates.forEach((dt, di) => {
        attDocs.push({
            student_no: sno, course_code: "CS201", semester_name: SEM, section: "A",
            class_date: dt, hour_count: 2,
            status: statusPool[(si + di + 2) % statusPool.length],
            recorded_by: "INS001", created_at: dt
        });
    });
});

// CS301 attendance for year-3 student
attDates.forEach((dt, di) => {
    attDocs.push({
        student_no: "1252022001", course_code: "CS301", semester_name: SEM, section: "A",
        class_date: dt, hour_count: 2, status: "present",
        recorded_by: "INS002", created_at: dt
    });
});

db.attendance.insertMany(attDocs);
print("✓ attendance: " + db.attendance.countDocuments());

// ══════════════════════════════════════════════════════════════════════════════
// 12. ANNOUNCEMENTS
// ══════════════════════════════════════════════════════════════════════════════
db.announcements.insertMany([
    {
        title: "2024-2025 Spring Semester Course Registration Reminder",
        content: "Course registrations for the Spring semester will be held between Feb 10-14, 2025.",
        target_audience: "students", department_id: null,
        published_by: "MNG001", publisher_type: "manager",
        priority: "important", is_active: true,
        created_at: new Date("2025-02-05"), updated_at: new Date("2025-02-05")
    },
    {
        title: "CS101 Midterm Exam – April 7",
        content: "The CS101 midterm exam will be held on April 7, 2025 at 09:00 in B-Lab1.",
        target_audience: "students", department_id: 125,
        published_by: "INS002", publisher_type: "instructor",
        priority: "important", is_active: true,
        created_at: new Date("2025-03-20"), updated_at: new Date("2025-03-20")
    },
    {
        title: "Faculty Meeting – Engineering",
        content: "All Engineering Faculty instructors are invited to the meeting on April 1, 2025 at 14:00.",
        target_audience: "instructors", department_id: null,
        published_by: "MNG002", publisher_type: "manager",
        priority: "normal", is_active: true,
        created_at: new Date("2025-03-25"), updated_at: new Date("2025-03-25")
    },
    {
        title: "Graduation Ceremony 2025",
        content: "The 2024-2025 Graduation Ceremony will be held on June 20, 2025 at 10:00 in the Main Amphitheater.",
        target_audience: "all", department_id: null,
        published_by: "MNG001", publisher_type: "manager",
        priority: "important", is_active: true,
        created_at: new Date("2025-05-01"), updated_at: new Date("2025-05-01")
    }
]);
print("✓ announcements: " + db.announcements.countDocuments());

// ══════════════════════════════════════════════════════════════════════════════
print("\n════════════════════════════════════════════════");
print("  Test data loaded successfully!");
print("  Password for ALL accounts: password");
print("────────────────────────────────────────────────");
print("  Students (10):");
db.students.find({}, { student_no: 1, "personal.first_name": 1, "personal.last_name": 1, department_id: 1, _id: 0 })
    .forEach(s => print("    " + s.student_no + "  " + s.personal.first_name + " " + s.personal.last_name + "  (dept " + s.department_id + ")"));
print("════════════════════════════════════════════════\n");
