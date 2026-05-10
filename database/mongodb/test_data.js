// =============================================================
// UBYS – Test Data Script  (v2)
// 7 bölüm, 6 öğretmen, 5 test öğrencisi (bölüm/dönem bazlı)
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
    "grades", "attendance", "announcements", "counters",
    "course_registration_requests"
].forEach(c => { try { db[c].deleteMany({}); } catch(e) {} });

print("Collections cleared.");

// ══════════════════════════════════════════════════════════════════════════════
// 1. FACULTIES
// ══════════════════════════════════════════════════════════════════════════════
db.faculties.insertMany([
    { faculty_code: "ENG",  name: "Mühendislik Fakültesi",                      is_active: true, created_at: new Date("2020-09-01"), updated_at: new Date("2020-09-01") },
    { faculty_code: "ECON", name: "İktisadi ve İdari Bilimler Fakültesi",        is_active: true, created_at: new Date("2020-09-01"), updated_at: new Date("2020-09-01") },
    { faculty_code: "SCI",  name: "Fen-Edebiyat Fakültesi",                     is_active: true, created_at: new Date("2020-09-01"), updated_at: new Date("2020-09-01") },
    { faculty_code: "ARTS", name: "İnsan ve Toplum Bilimleri Fakültesi",         is_active: true, created_at: new Date("2020-09-01"), updated_at: new Date("2020-09-01") },
    { faculty_code: "ARCHF","name": "Mimarlık Fakültesi",                        is_active: true, created_at: new Date("2020-09-01"), updated_at: new Date("2020-09-01") }
]);
print("✓ faculties: " + db.faculties.countDocuments());

// ══════════════════════════════════════════════════════════════════════════════
// 2. DEPARTMENTS
// ══════════════════════════════════════════════════════════════════════════════
db.departments.insertMany([
    { department_id: 125, name: "Bilgisayar Mühendisliği",          faculty_code: "ENG",   program_duration: 4, quota: 60, max_credits: 30, is_active: true, created_at: new Date("2020-09-01"), updated_at: new Date("2020-09-01") },
    { department_id: 130, name: "Elektrik-Elektronik Mühendisliği", faculty_code: "ENG",   program_duration: 4, quota: 50, max_credits: 30, is_active: true, created_at: new Date("2020-09-01"), updated_at: new Date("2020-09-01") },
    { department_id: 210, name: "İşletme",                          faculty_code: "ECON",  program_duration: 4, quota: 80, max_credits: 38, is_active: true, created_at: new Date("2020-09-01"), updated_at: new Date("2020-09-01") },
    { department_id: 301, name: "Yazılım Mühendisliği",             faculty_code: "ENG",   program_duration: 4, quota: 60, max_credits: 40, is_active: true, created_at: new Date("2020-09-01"), updated_at: new Date("2020-09-01") },
    { department_id: 401, name: "Psikoloji",                        faculty_code: "ARTS",  program_duration: 4, quota: 50, max_credits: 36, is_active: true, created_at: new Date("2020-09-01"), updated_at: new Date("2020-09-01") },
    { department_id: 501, name: "Mimarlık",                         faculty_code: "ARCHF", program_duration: 4, quota: 40, max_credits: 35, is_active: true, created_at: new Date("2020-09-01"), updated_at: new Date("2020-09-01") },
    { department_id: 601, name: "İngiliz Dili ve Edebiyatı",        faculty_code: "ARTS",  program_duration: 4, quota: 40, max_credits: 42, is_active: true, created_at: new Date("2020-09-01"), updated_at: new Date("2020-09-01") }
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
        personal: { first_name: "Ahmet",  last_name: "Çelik",    national_id: "22233344455", email: "ahmet.celik@ubys.edu.tr",    phone: "3121234567", office: "B-201" },
        academic: { title: "Prof. Dr.",        specializations: ["Yazılım Mimarisi", "Veritabanı Sistemleri"], publication_count: 47 },
        password: PASS, is_active: true, created_at: new Date("2010-09-01"), updated_at: new Date("2024-09-01")
    },
    {
        staff_id: "INS002", department_id: 125,
        personal: { first_name: "Fatma",  last_name: "Arslan",   national_id: "33344455566", email: "fatma.arslan@ubys.edu.tr",   phone: "3121234568", office: "B-205" },
        academic: { title: "Doç. Dr.",         specializations: ["Yazılım Mühendisliği", "Web Teknolojileri"],  publication_count: 22 },
        password: PASS, is_active: true, created_at: new Date("2015-09-01"), updated_at: new Date("2024-09-01")
    },
    {
        staff_id: "INS003", department_id: 130,
        personal: { first_name: "Murat",  last_name: "Yıldız",   national_id: "44455566677", email: "murat.yildiz@ubys.edu.tr",   phone: "3121234569", office: "C-110" },
        academic: { title: "Dr. Öğr. Üyesi",   specializations: ["Güç Elektroniği", "Kontrol Sistemleri"],     publication_count: 11 },
        password: PASS, is_active: true, created_at: new Date("2019-09-01"), updated_at: new Date("2024-09-01")
    },
    {
        staff_id: "INS004", department_id: 301,
        personal: { first_name: "Elif",   last_name: "Aydın",    national_id: "55566677788", email: "elif.aydin@ubys.edu.tr",      phone: "3121234570", office: "B-310" },
        academic: { title: "Prof. Dr.",        specializations: ["Nesne Yönelimli Programlama", "Yazılım Testi"], publication_count: 35 },
        password: PASS, is_active: true, created_at: new Date("2012-09-01"), updated_at: new Date("2024-09-01")
    },
    {
        staff_id: "INS005", department_id: 401,
        personal: { first_name: "Serkan", last_name: "Kaya",     national_id: "66677788899", email: "serkan.kaya@ubys.edu.tr",     phone: "3121234571", office: "E-205" },
        academic: { title: "Doç. Dr.",         specializations: ["Klinik Psikoloji", "Bilişsel Davranışçı Terapi"], publication_count: 18 },
        password: PASS, is_active: true, created_at: new Date("2017-09-01"), updated_at: new Date("2024-09-01")
    },
    {
        staff_id: "INS006", department_id: 601,
        personal: { first_name: "Hülya",  last_name: "Demirci",  national_id: "77788899900", email: "hulya.demirci@ubys.edu.tr",   phone: "3121234572", office: "G-102" },
        academic: { title: "Prof. Dr.",        specializations: ["İngiliz Romanı", "Karşılaştırmalı Edebiyat"], publication_count: 29 },
        password: PASS, is_active: true, created_at: new Date("2011-09-01"), updated_at: new Date("2024-09-01")
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
    // ── CS (dept 125) ──────────────────────────────────────────────────────────
    { course_code: "CS101", name: "Programlamaya Giriş",              department_id: 125, credits: 3, ects: 5, theory_hours: 2, lab_hours: 2, type: "mandatory", class_year: 1, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "CS102", name: "Ayrık Matematik",                  department_id: 125, credits: 3, ects: 5, theory_hours: 3, lab_hours: 0, type: "mandatory", class_year: 1, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "CS103", name: "Fizik I",                          department_id: 125, credits: 4, ects: 6, theory_hours: 3, lab_hours: 2, type: "mandatory", class_year: 1, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "CS201", name: "Veri Yapıları ve Algoritmalar",    department_id: 125, credits: 3, ects: 5, theory_hours: 2, lab_hours: 2, type: "mandatory", class_year: 2, prerequisites: ["CS101"],        is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "CS202", name: "Nesne Yönelimli Programlama",      department_id: 125, credits: 3, ects: 5, theory_hours: 2, lab_hours: 2, type: "mandatory", class_year: 2, prerequisites: ["CS101"],        is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "CS301", name: "Veritabanı Yönetim Sistemleri",    department_id: 125, credits: 3, ects: 5, theory_hours: 2, lab_hours: 2, type: "mandatory", class_year: 3, prerequisites: ["CS201"],        is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "CS302", name: "İşletim Sistemleri",               department_id: 125, credits: 3, ects: 5, theory_hours: 3, lab_hours: 0, type: "mandatory", class_year: 3, prerequisites: ["CS201"],        is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "CS401", name: "Yazılım Mühendisliği",             department_id: 125, credits: 3, ects: 5, theory_hours: 2, lab_hours: 2, type: "mandatory", class_year: 4, prerequisites: ["CS302"],        is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "CS490", name: "Bitirme Projesi",                  department_id: 125, credits: 4, ects: 8, theory_hours: 0, lab_hours: 4, type: "mandatory", class_year: 4, prerequisites: ["CS301","CS302"], is_active: true, created_at: new Date("2020-09-01") },
    // ── EE (dept 130) ──────────────────────────────────────────────────────────
    { course_code: "EE101", name: "Devre Teorisi",                    department_id: 130, credits: 4, ects: 6, theory_hours: 3, lab_hours: 2, type: "mandatory", class_year: 1, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    // ── İşletme (dept 210) – 3. Dönem (class_year 2) ──────────────────────────
    { course_code: "BUS201",  name: "Finansal Muhasebe",              department_id: 210, credits: 3, ects: 6, theory_hours: 3, lab_hours: 0, type: "mandatory", class_year: 2, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "ECON201", name: "Makro İktisat",                  department_id: 210, credits: 3, ects: 6, theory_hours: 3, lab_hours: 0, type: "mandatory", class_year: 2, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "STAT201", name: "İşletme İstatistikleri",         department_id: 210, credits: 3, ects: 6, theory_hours: 2, lab_hours: 2, type: "mandatory", class_year: 2, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "BUS203",  name: "Örgütsel Davranış",              department_id: 210, credits: 3, ects: 5, theory_hours: 3, lab_hours: 0, type: "mandatory", class_year: 2, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "BUS205",  name: "Pazarlama Yönetimi",             department_id: 210, credits: 3, ects: 5, theory_hours: 3, lab_hours: 0, type: "mandatory", class_year: 2, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "ELEC001", name: "Sosyal Seçmeli – Girişimcilik",  department_id: 210, credits: 2, ects: 2, theory_hours: 2, lab_hours: 0, type: "elective",  class_year: 2, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    // ── Yazılım Mühendisliği (dept 301) – 1. Dönem ────────────────────────────
    { course_code: "SENG101", name: "Programlama Temelleri (C#)",     department_id: 301, credits: 4, ects: 7, theory_hours: 2, lab_hours: 2, type: "mandatory", class_year: 1, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "MATH101", name: "Mühendislik Matematiği I",        department_id: 301, credits: 4, ects: 6, theory_hours: 4, lab_hours: 0, type: "mandatory", class_year: 1, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "SENG103", name: "Yazılım Mühendisliğine Giriş",   department_id: 301, credits: 3, ects: 5, theory_hours: 2, lab_hours: 1, type: "mandatory", class_year: 1, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "PHYS101", name: "Fizik I",                        department_id: 301, credits: 3, ects: 5, theory_hours: 3, lab_hours: 0, type: "mandatory", class_year: 1, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "ENG101",  name: "Akademik İngilizce I",           department_id: 301, credits: 3, ects: 4, theory_hours: 3, lab_hours: 0, type: "mandatory", class_year: 1, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "GNL101",  name: "Atatürk İlkeleri ve İnkılap Tarihi I", department_id: 301, credits: 2, ects: 3, theory_hours: 2, lab_hours: 0, type: "mandatory", class_year: 1, prerequisites: [], is_active: true, created_at: new Date("2020-09-01") },
    // ── Psikoloji (dept 401) – 5. Dönem (class_year 3) ────────────────────────
    { course_code: "PSY301",  name: "Psikopatoloji",                  department_id: 401, credits: 3, ects: 7, theory_hours: 3, lab_hours: 0, type: "mandatory", class_year: 3, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "PSY303",  name: "Deneysel Psikoloji",             department_id: 401, credits: 4, ects: 7, theory_hours: 2, lab_hours: 2, type: "mandatory", class_year: 3, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "PSY305",  name: "Bilişsel Psikoloji",             department_id: 401, credits: 3, ects: 6, theory_hours: 3, lab_hours: 0, type: "mandatory", class_year: 3, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "PSY307",  name: "Kişilik Kuramları",              department_id: 401, credits: 3, ects: 5, theory_hours: 3, lab_hours: 0, type: "mandatory", class_year: 3, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "ELEC002", name: "Alan Seçmeli – Adli Psikoloji",  department_id: 401, credits: 3, ects: 5, theory_hours: 3, lab_hours: 0, type: "elective",  class_year: 3, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    // ── Mimarlık (dept 501) – 1. Dönem ────────────────────────────────────────
    { course_code: "ARCH101", name: "Temel Tasarım Stüdyosu",         department_id: 501, credits: 8, ects: 12, theory_hours: 2, lab_hours: 6, type: "mandatory", class_year: 1, prerequisites: [],              is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "ARCH103", name: "Mimari Anlatım Teknikleri I",    department_id: 501, credits: 4, ects: 6,  theory_hours: 2, lab_hours: 2, type: "mandatory", class_year: 1, prerequisites: [],              is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "ARCH105", name: "Mimarlık Tarihi I",              department_id: 501, credits: 3, ects: 4,  theory_hours: 3, lab_hours: 0, type: "mandatory", class_year: 1, prerequisites: [],              is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "MATH105", name: "Mimarlar için Geometri",         department_id: 501, credits: 3, ects: 4,  theory_hours: 3, lab_hours: 0, type: "mandatory", class_year: 1, prerequisites: [],              is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "GNL103",  name: "Türk Dili I",                    department_id: 501, credits: 2, ects: 2,  theory_hours: 2, lab_hours: 0, type: "mandatory", class_year: 1, prerequisites: [],              is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "GNL105",  name: "Kariyer Planlama",               department_id: 501, credits: 2, ects: 2,  theory_hours: 2, lab_hours: 0, type: "mandatory", class_year: 1, prerequisites: [],              is_active: true, created_at: new Date("2020-09-01") },
    // ── İngiliz Dili ve Edebiyatı (dept 601) – 7. Dönem (class_year 4) ────────
    { course_code: "ELIT401", name: "Modern Eleştiri Kuramları",      department_id: 601, credits: 3, ects: 7, theory_hours: 3, lab_hours: 0, type: "mandatory", class_year: 4, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "ELIT403", name: "20. Yüzyıl İngiliz Romanı",      department_id: 601, credits: 3, ects: 7, theory_hours: 3, lab_hours: 0, type: "mandatory", class_year: 4, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "ELIT405", name: "Karşılaştırmalı Edebiyat",       department_id: 601, credits: 3, ects: 6, theory_hours: 3, lab_hours: 0, type: "mandatory", class_year: 4, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "ELIT407", name: "Shakespeare ve Çağdaşları",      department_id: 601, credits: 3, ects: 6, theory_hours: 3, lab_hours: 0, type: "mandatory", class_year: 4, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") },
    { course_code: "ELEC003", name: "Alan Dışı Seçmeli – Psikanaliz", department_id: 601, credits: 2, ects: 4, theory_hours: 2, lab_hours: 0, type: "elective",  class_year: 4, prerequisites: [],               is_active: true, created_at: new Date("2020-09-01") }
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
    // ── İşletme 3. Dönem (INS001) ──────────────────────────────────────────────
    { course_code: "BUS201",  semester_name: "2024-2025 Spring", instructor_id: "INS001", section: "A", capacity: 50, enrolled_count: 1,
      schedule: [{ day: "Monday",    start_time: "09:00", end_time: "12:00", classroom: "D-301" }],
      is_active: true, created_at: new Date("2025-01-15") },
    { course_code: "ECON201", semester_name: "2024-2025 Spring", instructor_id: "INS001", section: "A", capacity: 50, enrolled_count: 1,
      schedule: [{ day: "Tuesday",   start_time: "13:00", end_time: "16:00", classroom: "D-302" }],
      is_active: true, created_at: new Date("2025-01-15") },
    { course_code: "STAT201", semester_name: "2024-2025 Spring", instructor_id: "INS001", section: "A", capacity: 40, enrolled_count: 1,
      schedule: [{ day: "Wednesday", start_time: "09:00", end_time: "11:00", classroom: "D-Lab2" }, { day: "Friday", start_time: "09:00", end_time: "11:00", classroom: "D-Lab2" }],
      is_active: true, created_at: new Date("2025-01-15") },
    { course_code: "BUS203",  semester_name: "2024-2025 Spring", instructor_id: "INS001", section: "A", capacity: 50, enrolled_count: 1,
      schedule: [{ day: "Thursday",  start_time: "13:00", end_time: "16:00", classroom: "D-303" }],
      is_active: true, created_at: new Date("2025-01-15") },
    { course_code: "BUS205",  semester_name: "2024-2025 Spring", instructor_id: "INS001", section: "A", capacity: 50, enrolled_count: 1,
      schedule: [{ day: "Monday",    start_time: "13:00", end_time: "16:00", classroom: "D-304" }],
      is_active: true, created_at: new Date("2025-01-15") },
    { course_code: "ELEC001", semester_name: "2024-2025 Spring", instructor_id: "INS001", section: "A", capacity: 30, enrolled_count: 0,
      schedule: [{ day: "Friday",    start_time: "13:00", end_time: "15:00", classroom: "D-201" }],
      is_active: true, created_at: new Date("2025-01-15") },
    // ── Yazılım Mühendisliği 1. Dönem (INS004) ─────────────────────────────────
    { course_code: "SENG101", semester_name: "2024-2025 Spring", instructor_id: "INS004", section: "A", capacity: 40, enrolled_count: 1,
      schedule: [{ day: "Monday",    start_time: "09:00", end_time: "11:00", classroom: "B-Lab2" }, { day: "Wednesday", start_time: "09:00", end_time: "11:00", classroom: "B-Lab2" }],
      is_active: true, created_at: new Date("2025-01-15") },
    { course_code: "MATH101", semester_name: "2024-2025 Spring", instructor_id: "INS004", section: "A", capacity: 40, enrolled_count: 1,
      schedule: [{ day: "Tuesday",   start_time: "09:00", end_time: "11:00", classroom: "A-201" }, { day: "Thursday", start_time: "09:00", end_time: "11:00", classroom: "A-201" }],
      is_active: true, created_at: new Date("2025-01-15") },
    { course_code: "SENG103", semester_name: "2024-2025 Spring", instructor_id: "INS004", section: "A", capacity: 40, enrolled_count: 1,
      schedule: [{ day: "Wednesday", start_time: "13:00", end_time: "16:00", classroom: "B-101" }],
      is_active: true, created_at: new Date("2025-01-15") },
    { course_code: "PHYS101", semester_name: "2024-2025 Spring", instructor_id: "INS004", section: "A", capacity: 40, enrolled_count: 1,
      schedule: [{ day: "Monday",    start_time: "11:00", end_time: "14:00", classroom: "A-202" }],
      is_active: true, created_at: new Date("2025-01-15") },
    { course_code: "ENG101",  semester_name: "2024-2025 Spring", instructor_id: "INS004", section: "A", capacity: 30, enrolled_count: 1,
      schedule: [{ day: "Friday",    start_time: "09:00", end_time: "12:00", classroom: "D-101" }],
      is_active: true, created_at: new Date("2025-01-15") },
    { course_code: "GNL101",  semester_name: "2024-2025 Spring", instructor_id: "INS004", section: "A", capacity: 60, enrolled_count: 1,
      schedule: [{ day: "Thursday",  start_time: "13:00", end_time: "15:00", classroom: "A-103" }],
      is_active: true, created_at: new Date("2025-01-15") },
    // ── Psikoloji 5. Dönem (INS005) ────────────────────────────────────────────
    { course_code: "PSY301",  semester_name: "2024-2025 Spring", instructor_id: "INS005", section: "A", capacity: 30, enrolled_count: 1,
      schedule: [{ day: "Monday",    start_time: "09:00", end_time: "12:00", classroom: "E-101" }],
      is_active: true, created_at: new Date("2025-01-15") },
    { course_code: "PSY303",  semester_name: "2024-2025 Spring", instructor_id: "INS005", section: "A", capacity: 25, enrolled_count: 1,
      schedule: [{ day: "Tuesday",   start_time: "09:00", end_time: "11:00", classroom: "E-Lab1" }, { day: "Thursday", start_time: "09:00", end_time: "11:00", classroom: "E-Lab1" }],
      is_active: true, created_at: new Date("2025-01-15") },
    { course_code: "PSY305",  semester_name: "2024-2025 Spring", instructor_id: "INS005", section: "A", capacity: 30, enrolled_count: 1,
      schedule: [{ day: "Wednesday", start_time: "13:00", end_time: "16:00", classroom: "E-102" }],
      is_active: true, created_at: new Date("2025-01-15") },
    { course_code: "PSY307",  semester_name: "2024-2025 Spring", instructor_id: "INS005", section: "A", capacity: 30, enrolled_count: 1,
      schedule: [{ day: "Friday",    start_time: "09:00", end_time: "12:00", classroom: "E-103" }],
      is_active: true, created_at: new Date("2025-01-15") },
    { course_code: "ELEC002", semester_name: "2024-2025 Spring", instructor_id: "INS005", section: "A", capacity: 20, enrolled_count: 0,
      schedule: [{ day: "Thursday",  start_time: "14:00", end_time: "17:00", classroom: "E-104" }],
      is_active: true, created_at: new Date("2025-01-15") },
    // ── Mimarlık 1. Dönem (INS006) ─────────────────────────────────────────────
    { course_code: "ARCH101", semester_name: "2024-2025 Spring", instructor_id: "INS006", section: "A", capacity: 25, enrolled_count: 1,
      schedule: [{ day: "Monday",    start_time: "08:00", end_time: "13:00", classroom: "STÜDYO-1" }, { day: "Wednesday", start_time: "08:00", end_time: "13:00", classroom: "STÜDYO-1" }],
      is_active: true, created_at: new Date("2025-01-15") },
    { course_code: "ARCH103", semester_name: "2024-2025 Spring", instructor_id: "INS006", section: "A", capacity: 25, enrolled_count: 1,
      schedule: [{ day: "Tuesday",   start_time: "09:00", end_time: "11:00", classroom: "STÜDYO-2" }, { day: "Thursday", start_time: "09:00", end_time: "11:00", classroom: "STÜDYO-2" }],
      is_active: true, created_at: new Date("2025-01-15") },
    { course_code: "ARCH105", semester_name: "2024-2025 Spring", instructor_id: "INS006", section: "A", capacity: 30, enrolled_count: 1,
      schedule: [{ day: "Friday",    start_time: "09:00", end_time: "12:00", classroom: "F-101" }],
      is_active: true, created_at: new Date("2025-01-15") },
    { course_code: "MATH105", semester_name: "2024-2025 Spring", instructor_id: "INS006", section: "A", capacity: 30, enrolled_count: 1,
      schedule: [{ day: "Tuesday",   start_time: "13:00", end_time: "16:00", classroom: "F-102" }],
      is_active: true, created_at: new Date("2025-01-15") },
    { course_code: "GNL103",  semester_name: "2024-2025 Spring", instructor_id: "INS006", section: "A", capacity: 60, enrolled_count: 1,
      schedule: [{ day: "Wednesday", start_time: "13:00", end_time: "15:00", classroom: "A-103" }],
      is_active: true, created_at: new Date("2025-01-15") },
    { course_code: "GNL105",  semester_name: "2024-2025 Spring", instructor_id: "INS006", section: "A", capacity: 60, enrolled_count: 1,
      schedule: [{ day: "Friday",    start_time: "13:00", end_time: "15:00", classroom: "A-104" }],
      is_active: true, created_at: new Date("2025-01-15") },
    // ── İngiliz Dili ve Edebiyatı 7. Dönem (INS006) ────────────────────────────
    { course_code: "ELIT401", semester_name: "2024-2025 Spring", instructor_id: "INS006", section: "A", capacity: 20, enrolled_count: 1,
      schedule: [{ day: "Monday",    start_time: "09:00", end_time: "12:00", classroom: "G-101" }],
      is_active: true, created_at: new Date("2025-01-15") },
    { course_code: "ELIT403", semester_name: "2024-2025 Spring", instructor_id: "INS006", section: "A", capacity: 20, enrolled_count: 1,
      schedule: [{ day: "Tuesday",   start_time: "13:00", end_time: "16:00", classroom: "G-102" }],
      is_active: true, created_at: new Date("2025-01-15") },
    { course_code: "ELIT405", semester_name: "2024-2025 Spring", instructor_id: "INS006", section: "A", capacity: 20, enrolled_count: 1,
      schedule: [{ day: "Wednesday", start_time: "09:00", end_time: "12:00", classroom: "G-103" }],
      is_active: true, created_at: new Date("2025-01-15") },
    { course_code: "ELIT407", semester_name: "2024-2025 Spring", instructor_id: "INS006", section: "A", capacity: 20, enrolled_count: 1,
      schedule: [{ day: "Thursday",  start_time: "13:00", end_time: "16:00", classroom: "G-104" }],
      is_active: true, created_at: new Date("2025-01-15") },
    { course_code: "ELEC003", semester_name: "2024-2025 Spring", instructor_id: "INS006", section: "A", capacity: 15, enrolled_count: 0,
      schedule: [{ day: "Friday",    start_time: "09:00", end_time: "11:00", classroom: "G-105" }],
      is_active: true, created_at: new Date("2025-01-15") }
]);
print("✓ course_offerings: " + db.course_offerings.countDocuments());

// ══════════════════════════════════════════════════════════════════════════════
// 8. STUDENTS
//    CS(125)/2024→4 | CS(125)/2023→2 | CS(125)/2022→1
//    EE(130)/2023→1 | EE(130)/2024→1
//    BA(210)/2023→1  (2. sınıf, 3. dönem)
//    SE(301)/2024→1  (1. sınıf, 1. dönem)
//    PSY(401)/2022→1 (3. sınıf, 5. dönem)
//    ARCH(501)/2024→1(1. sınıf, 1. dönem)
//    EL(601)/2021→1  (4. sınıf, 7. dönem)
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
    // ── BA 2023 (2. sınıf — 3. dönem) ────────────────────────────────────────
    {
        student_no: "2102023001", department_id: 210, enrollment_year: 2023, sequence_no: 1,
        personal: { first_name: "Berk",   last_name: "Yıldırım", national_id: "10000000010", birth_date: new Date("2005-03-18"), gender: "M", phone: "5551111010", email: "berk.yildirim@student.ubys.edu.tr",  address: "Konya" },
        academic:  { class_year: 2, active_semester: "2024-2025 Spring", gpa: 3.00, total_credits: 60, status: "active" },
        password: PASS, created_at: new Date("2023-09-01"), updated_at: new Date("2025-02-17")
    },
    // ── SE 2024 (1. sınıf — 1. dönem) ────────────────────────────────────────
    {
        student_no: "3012024001", department_id: 301, enrollment_year: 2024, sequence_no: 1,
        personal: { first_name: "Kaan",   last_name: "Şimşek",  national_id: "10000000011", birth_date: new Date("2006-11-05"), gender: "M", phone: "5551111011", email: "kaan.simsek@student.ubys.edu.tr",    address: "Bursa" },
        academic:  { class_year: 1, active_semester: "2024-2025 Spring", gpa: 3.40, total_credits: 0,  status: "active" },
        password: PASS, created_at: new Date("2024-09-01"), updated_at: new Date("2025-02-17")
    },
    // ── PSY 2022 (3. sınıf — 5. dönem) ───────────────────────────────────────
    {
        student_no: "4012022001", department_id: 401, enrollment_year: 2022, sequence_no: 1,
        personal: { first_name: "Nisa",   last_name: "Çetin",   national_id: "10000000012", birth_date: new Date("2004-07-14"), gender: "F", phone: "5551111012", email: "nisa.cetin@student.ubys.edu.tr",      address: "İzmir" },
        academic:  { class_year: 3, active_semester: "2024-2025 Spring", gpa: 3.50, total_credits: 120, status: "active" },
        password: PASS, created_at: new Date("2022-09-01"), updated_at: new Date("2025-02-17")
    },
    // ── ARCH 2024 (1. sınıf — 1. dönem) ──────────────────────────────────────
    {
        student_no: "5012024001", department_id: 501, enrollment_year: 2024, sequence_no: 1,
        personal: { first_name: "Emir",   last_name: "Doğan",   national_id: "10000000013", birth_date: new Date("2006-02-28"), gender: "M", phone: "5551111013", email: "emir.dogan@student.ubys.edu.tr",      address: "Ankara" },
        academic:  { class_year: 1, active_semester: "2024-2025 Spring", gpa: 3.20, total_credits: 0,  status: "active" },
        password: PASS, created_at: new Date("2024-09-01"), updated_at: new Date("2025-02-17")
    },
    // ── EL 2021 (4. sınıf — 7. dönem) ────────────────────────────────────────
    {
        student_no: "6012021001", department_id: 601, enrollment_year: 2021, sequence_no: 1,
        personal: { first_name: "İrem",   last_name: "Güneş",   national_id: "10000000014", birth_date: new Date("2003-09-20"), gender: "F", phone: "5551111014", email: "irem.gunes@student.ubys.edu.tr",      address: "İstanbul" },
        academic:  { class_year: 4, active_semester: "2024-2025 Spring", gpa: 3.70, total_credits: 180, status: "active" },
        password: PASS, created_at: new Date("2021-09-01"), updated_at: new Date("2025-02-17")
    }
]);
print("✓ students: " + db.students.countDocuments());

// ══════════════════════════════════════════════════════════════════════════════
// 9. ENROLLMENTS  (2024-2025 Spring)
// ══════════════════════════════════════════════════════════════════════════════
const SEM = "2024-2025 Spring";
const ED  = new Date("2025-02-17");

const enrollData = [
    // CS year-1 (4 öğrenci × 3 ders)
    ...["1252024001","1252024002","1252024003","1252024004"].flatMap(sno =>
        ["CS101","CS102","CS103"].map(code => ({
            student_no: sno, course_code: code, semester_name: SEM, section: "A",
            status: "ongoing", enrollment_date: ED, created_at: ED
        }))
    ),
    // CS year-2 (2 öğrenci × 2 ders)
    ...["1252023001","1252023002"].flatMap(sno =>
        ["CS201","CS202"].map(code => ({
            student_no: sno, course_code: code, semester_name: SEM, section: "A",
            status: "ongoing", enrollment_date: ED, created_at: ED
        }))
    ),
    // CS year-3
    ...["CS301","CS302"].map(code => ({
        student_no: "1252022001", course_code: code, semester_name: SEM, section: "A",
        status: "ongoing", enrollment_date: ED, created_at: ED
    })),
    // EE
    { student_no: "1302023001", course_code: "EE101", semester_name: SEM, section: "A", status: "ongoing", enrollment_date: ED, created_at: ED },
    { student_no: "1302024001", course_code: "EE101", semester_name: SEM, section: "A", status: "ongoing", enrollment_date: ED, created_at: ED },
    // BA 3. dönem (2102023001)
    ...["BUS201","ECON201","STAT201","BUS203","BUS205"].map(code => ({
        student_no: "2102023001", course_code: code, semester_name: SEM, section: "A",
        status: "ongoing", enrollment_date: ED, created_at: ED
    })),
    // SE 1. dönem (3012024001)
    ...["SENG101","MATH101","SENG103","PHYS101","ENG101","GNL101"].map(code => ({
        student_no: "3012024001", course_code: code, semester_name: SEM, section: "A",
        status: "ongoing", enrollment_date: ED, created_at: ED
    })),
    // PSY 5. dönem (4012022001)
    ...["PSY301","PSY303","PSY305","PSY307"].map(code => ({
        student_no: "4012022001", course_code: code, semester_name: SEM, section: "A",
        status: "ongoing", enrollment_date: ED, created_at: ED
    })),
    // ARCH 1. dönem (5012024001)
    ...["ARCH101","ARCH103","ARCH105","MATH105","GNL103","GNL105"].map(code => ({
        student_no: "5012024001", course_code: code, semester_name: SEM, section: "A",
        status: "ongoing", enrollment_date: ED, created_at: ED
    })),
    // EL 7. dönem (6012021001)
    ...["ELIT401","ELIT403","ELIT405","ELIT407"].map(code => ({
        student_no: "6012021001", course_code: code, semester_name: SEM, section: "A",
        status: "ongoing", enrollment_date: ED, created_at: ED
    }))
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
// 13. COURSE REGISTRATION REQUESTS  (örnek: 2 bekleyen, 1 onaylı)
// ══════════════════════════════════════════════════════════════════════════════
db.course_registration_requests.insertMany([
    {
        student_no: "1252024001", student_name: "Ali Yılmaz",
        department_id: 125, semester_name: SEM,
        requested_courses: [
            { course_code: "CS101", course_name: "Introduction to Programming", credits: 3, section: "A", instructor_id: "INS002" },
            { course_code: "CS102", course_name: "Discrete Mathematics",         credits: 3, section: "A", instructor_id: "INS001" },
            { course_code: "CS103", course_name: "Physics I",                    credits: 4, section: "A", instructor_id: "INS001" }
        ],
        total_credits_requested: 10, instructor_ids: ["INS002","INS001"],
        status: "pending", feedback: null,
        submitted_at: new Date("2025-02-16T10:30:00"), reviewed_at: null, reviewed_by: null
    },
    {
        student_no: "1252024003", student_name: "Emre Arslan",
        department_id: 125, semester_name: SEM,
        requested_courses: [
            { course_code: "CS101", course_name: "Introduction to Programming", credits: 3, section: "A", instructor_id: "INS002" },
            { course_code: "CS102", course_name: "Discrete Mathematics",         credits: 3, section: "A", instructor_id: "INS001" }
        ],
        total_credits_requested: 6, instructor_ids: ["INS002","INS001"],
        status: "pending", feedback: null,
        submitted_at: new Date("2025-02-16T14:15:00"), reviewed_at: null, reviewed_by: null
    },
    {
        student_no: "1252024002", student_name: "Ayşe Kara",
        department_id: 125, semester_name: SEM,
        requested_courses: [
            { course_code: "CS101", course_name: "Introduction to Programming", credits: 3, section: "A", instructor_id: "INS002" },
            { course_code: "CS102", course_name: "Discrete Mathematics",         credits: 3, section: "A", instructor_id: "INS001" },
            { course_code: "CS103", course_name: "Physics I",                    credits: 4, section: "A", instructor_id: "INS001" }
        ],
        total_credits_requested: 10, instructor_ids: ["INS002","INS001"],
        status: "approved", feedback: "Ders seçiminiz onaylandı, başarılar!",
        submitted_at: new Date("2025-02-15T09:00:00"),
        reviewed_at: new Date("2025-02-15T11:00:00"), reviewed_by: "INS001"
    }
]);
print("✓ course_registration_requests: " + db.course_registration_requests.countDocuments());

// ══════════════════════════════════════════════════════════════════════════════
print("\n════════════════════════════════════════════════");
print("  Test data loaded successfully!");
print("  Password for ALL accounts: password");
print("────────────────────────────────────────────────");
print("  Students (10):");
db.students.find({}, { student_no: 1, "personal.first_name": 1, "personal.last_name": 1, department_id: 1, _id: 0 })
    .forEach(s => print("    " + s.student_no + "  " + s.personal.first_name + " " + s.personal.last_name + "  (dept " + s.department_id + ")"));
print("════════════════════════════════════════════════\n");
