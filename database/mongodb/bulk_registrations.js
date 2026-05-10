// =============================================================
// UBYS – Toplu Kayıt & Onay Scripti
//
// Yapar:
//   1. 30 yeni öğrenci ekler
//   2. Yeni öğrencilerin enrollments'larını ekler
//   3. TÜM öğrenciler için onaylı ders kayıt talebi oluşturur
//
// ÖNCE test_data.js çalıştırılmış olmalı.
// Run: mongosh "mongodb://admin:admin!@72.61.136.135:27017/?authSource=admin" bulk_registrations.js
// =============================================================

const db = db.getSiblingDB("ubys");
const PASS = "$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";
const SEM  = "2024-2025 Spring";
const ED   = new Date("2025-02-14T10:00:00");
const RD   = new Date("2025-02-15T09:00:00");

// ── Ders kataloğu (kod → isim, kredi, öğretmen) ────────────────────────────
const CI = {
    "CS101":   { name: "Programlamaya Giriş",                  credits: 3, ins: "INS002" },
    "CS102":   { name: "Ayrık Matematik",                       credits: 3, ins: "INS001" },
    "CS103":   { name: "Fizik I",                               credits: 4, ins: "INS001" },
    "CS201":   { name: "Veri Yapıları ve Algoritmalar",         credits: 3, ins: "INS001" },
    "CS202":   { name: "Nesne Yönelimli Programlama",           credits: 3, ins: "INS002" },
    "CS301":   { name: "Veritabanı Yönetim Sistemleri",         credits: 3, ins: "INS001" },
    "CS302":   { name: "İşletim Sistemleri",                    credits: 3, ins: "INS001" },
    "EE101":   { name: "Devre Teorisi",                         credits: 4, ins: "INS003" },
    "BUS201":  { name: "Finansal Muhasebe",                     credits: 3, ins: "INS001" },
    "ECON201": { name: "Makro İktisat",                         credits: 3, ins: "INS001" },
    "STAT201": { name: "İşletme İstatistikleri",                credits: 3, ins: "INS001" },
    "BUS203":  { name: "Örgütsel Davranış",                     credits: 3, ins: "INS001" },
    "BUS205":  { name: "Pazarlama Yönetimi",                    credits: 3, ins: "INS001" },
    "SENG101": { name: "Programlama Temelleri (C#)",            credits: 4, ins: "INS004" },
    "MATH101": { name: "Mühendislik Matematiği I",              credits: 4, ins: "INS004" },
    "SENG103": { name: "Yazılım Mühendisliğine Giriş",          credits: 3, ins: "INS004" },
    "PHYS101": { name: "Fizik I",                               credits: 3, ins: "INS004" },
    "ENG101":  { name: "Akademik İngilizce I",                  credits: 3, ins: "INS004" },
    "GNL101":  { name: "Atatürk İlkeleri ve İnkılap Tarihi I",  credits: 2, ins: "INS004" },
    "PSY301":  { name: "Psikopatoloji",                         credits: 3, ins: "INS005" },
    "PSY303":  { name: "Deneysel Psikoloji",                    credits: 4, ins: "INS005" },
    "PSY305":  { name: "Bilişsel Psikoloji",                    credits: 3, ins: "INS005" },
    "PSY307":  { name: "Kişilik Kuramları",                     credits: 3, ins: "INS005" },
    "ARCH101": { name: "Temel Tasarım Stüdyosu",               credits: 8, ins: "INS006" },
    "ARCH103": { name: "Mimari Anlatım Teknikleri I",           credits: 4, ins: "INS006" },
    "ARCH105": { name: "Mimarlık Tarihi I",                     credits: 3, ins: "INS006" },
    "MATH105": { name: "Mimarlar için Geometri",                credits: 3, ins: "INS006" },
    "GNL103":  { name: "Türk Dili I",                           credits: 2, ins: "INS006" },
    "GNL105":  { name: "Kariyer Planlama",                      credits: 2, ins: "INS006" },
    "ELIT401": { name: "Modern Eleştiri Kuramları",             credits: 3, ins: "INS006" },
    "ELIT403": { name: "20. Yüzyıl İngiliz Romanı",             credits: 3, ins: "INS006" },
    "ELIT405": { name: "Karşılaştırmalı Edebiyat",              credits: 3, ins: "INS006" },
    "ELIT407": { name: "Shakespeare ve Çağdaşları",             credits: 3, ins: "INS006" },
};

// ── Bölüm × sınıf yılı → alınacak dersler ────────────────────────────────
const DEPT_COURSES = {
    125: { 1: ["CS101","CS102","CS103"],  2: ["CS201","CS202"], 3: ["CS301","CS302"] },
    130: { 1: ["EE101"], 2: ["EE101"] },
    210: { 2: ["BUS201","ECON201","STAT201","BUS203","BUS205"] },
    301: { 1: ["SENG101","MATH101","SENG103","PHYS101","ENG101","GNL101"] },
    401: { 3: ["PSY301","PSY303","PSY305","PSY307"] },
    501: { 1: ["ARCH101","ARCH103","ARCH105","MATH105","GNL103","GNL105"] },
    601: { 4: ["ELIT401","ELIT403","ELIT405","ELIT407"] },
};

// ══════════════════════════════════════════════════════════════════════════════
// 1. YENİ 30 ÖĞRENCİ
// Format: [student_no, dept_id, enroll_year, seq, class_year, gpa,
//          total_cred, first, last, nat_id_suffix, gender, city, birth_year]
// ══════════════════════════════════════════════════════════════════════════════
const NEW_STUDENTS = [
    // ── CS 2024 – 1. sınıf (seq 5-9) ──────────────────────────────────────
    ["1252024005", 125, 2024, 5, 1, 3.15,  0,  "Ozan",   "Kaya",    "15", "M", "Ankara",    2006],
    ["1252024006", 125, 2024, 6, 1, 3.70,  0,  "Merve",  "Yıldız",  "16", "F", "İstanbul",  2006],
    ["1252024007", 125, 2024, 7, 1, 2.80,  0,  "Burak",  "Özkan",   "17", "M", "İzmir",     2006],
    ["1252024008", 125, 2024, 8, 1, 3.55,  0,  "Elif",   "Şahin",   "18", "F", "Bursa",     2006],
    ["1252024009", 125, 2024, 9, 1, 2.95,  0,  "Tolga",  "Arslan",  "19", "M", "Adana",     2006],
    // ── CS 2023 – 2. sınıf (seq 3-5) ──────────────────────────────────────
    ["1252023003", 125, 2023, 3, 2, 3.30, 60,  "Ceren",  "Aydın",   "20", "F", "Ankara",    2005],
    ["1252023004", 125, 2023, 4, 2, 2.75, 55,  "Arda",   "Çelik",   "21", "M", "Konya",     2005],
    ["1252023005", 125, 2023, 5, 2, 3.60, 62,  "Sude",   "Kılıç",   "22", "F", "İstanbul",  2005],
    // ── CS 2022 – 3. sınıf (seq 2-3) ──────────────────────────────────────
    ["1252022002", 125, 2022, 2, 3, 3.10, 90,  "Volkan", "Demir",   "23", "M", "Ankara",    2004],
    ["1252022003", 125, 2022, 3, 3, 2.65, 85,  "Pınar",  "Aktaş",   "24", "F", "İzmir",     2004],
    // ── EE 2024 – 1. sınıf (seq 2-4) ──────────────────────────────────────
    ["1302024002", 130, 2024, 2, 1, 3.45,  0,  "Barış",  "Güneş",   "25", "M", "Ankara",    2006],
    ["1302024003", 130, 2024, 3, 1, 3.85,  0,  "Sena",   "Koç",     "26", "F", "Bursa",     2006],
    ["1302024004", 130, 2024, 4, 1, 2.70,  0,  "Kerem",  "Bulut",   "27", "M", "Adana",     2006],
    // ── EE 2023 – 2. sınıf (seq 2-3) ──────────────────────────────────────
    ["1302023002", 130, 2023, 2, 2, 3.20, 60,  "Tuğba",  "Yılmaz",  "28", "F", "İstanbul",  2005],
    ["1302023003", 130, 2023, 3, 2, 2.90, 58,  "Serhat", "Kurt",    "29", "M", "Ankara",    2005],
    // ── BA 2023 – 2. sınıf / 3. dönem (seq 2-5) ───────────────────────────
    ["2102023002", 210, 2023, 2, 2, 3.50, 60,  "İpek",   "Doğan",   "30", "F", "İzmir",     2005],
    ["2102023003", 210, 2023, 3, 2, 2.80, 58,  "Mert",   "Öztürk",  "31", "M", "Konya",     2005],
    ["2102023004", 210, 2023, 4, 2, 3.15, 61,  "Büşra",  "Ak",      "32", "F", "Ankara",    2005],
    ["2102023005", 210, 2023, 5, 2, 2.95, 57,  "Yiğit",  "Çetin",   "33", "M", "İstanbul",  2005],
    // ── SE 2024 – 1. sınıf (seq 2-5) ──────────────────────────────────────
    ["3012024002", 301, 2024, 2, 1, 3.80,  0,  "Lara",   "Tekin",   "34", "F", "Ankara",    2006],
    ["3012024003", 301, 2024, 3, 1, 3.20,  0,  "Alp",    "Şimşek",  "35", "M", "Bursa",     2006],
    ["3012024004", 301, 2024, 4, 1, 2.85,  0,  "Naz",    "Demirci", "36", "F", "İstanbul",  2006],
    ["3012024005", 301, 2024, 5, 1, 3.55,  0,  "Baran",  "Akar",    "37", "M", "İzmir",     2006],
    // ── PSY 2022 – 3. sınıf / 5. dönem (seq 2-4) ──────────────────────────
    ["4012022002", 401, 2022, 2, 3, 3.65, 120, "Dila",   "Sezer",   "38", "F", "Ankara",    2004],
    ["4012022003", 401, 2022, 3, 3, 3.05, 115, "Emre",   "Kaplan",  "39", "M", "İzmir",     2004],
    ["4012022004", 401, 2022, 4, 3, 3.40, 118, "Gözde",  "Arslan",  "40", "F", "Konya",     2004],
    // ── ARCH 2024 – 1. sınıf (seq 2-4) ────────────────────────────────────
    ["5012024002", 501, 2024, 2, 1, 3.30,  0,  "Tuna",   "Güler",   "41", "M", "Ankara",    2006],
    ["5012024003", 501, 2024, 3, 1, 2.90,  0,  "Lina",   "Erdoğan", "42", "F", "İstanbul",  2006],
    ["5012024004", 501, 2024, 4, 1, 3.75,  0,  "Can",    "Polat",   "43", "M", "İzmir",     2006],
    // ── EL 2021 – 4. sınıf / 7. dönem (seq 2) ─────────────────────────────
    ["6012021002", 601, 2021, 2, 4, 3.90, 180, "Selin",  "Avcı",    "44", "F", "Ankara",    2003],
];

const newStudentDocs = NEW_STUDENTS.map(
    ([sno, dept, yr, seq, cy, gpa, tc, fn, ln, idSuffix, gender, city, byear]) => ({
        student_no: sno, department_id: dept, enrollment_year: yr, sequence_no: seq,
        personal: {
            first_name: fn, last_name: ln,
            national_id: "1000000" + idSuffix.padStart(4, "0"),
            birth_date: new Date(byear + "-06-01"),
            gender, phone: "555111" + idSuffix.padStart(4, "0"),
            email: (fn.toLowerCase().replace(/[ğ]/g,"g").replace(/[ü]/g,"u").replace(/[ş]/g,"s").replace(/[ı]/g,"i").replace(/[ö]/g,"o").replace(/[ç]/g,"c") + "." +
                   ln.toLowerCase().replace(/[ğ]/g,"g").replace(/[ü]/g,"u").replace(/[ş]/g,"s").replace(/[ı]/g,"i").replace(/[ö]/g,"o").replace(/[ç]/g,"c")) +
                   "@student.ubys.edu.tr",
            address: city
        },
        academic: { class_year: cy, active_semester: SEM, gpa, total_credits: tc, status: "active" },
        password: PASS, created_at: new Date(yr + "-09-01"), updated_at: new Date("2025-02-17")
    })
);

// Mevcut olanları atla, sadece olmayanları ekle
let addedStudents = 0;
newStudentDocs.forEach(s => {
    const exists = db.students.countDocuments({ student_no: s.student_no }) > 0;
    if (!exists) { db.students.insertOne(s); addedStudents++; }
});
print("✓ Eklenen yeni öğrenci: " + addedStudents + " | Toplam: " + db.students.countDocuments());

// ══════════════════════════════════════════════════════════════════════════════
// 2. YENİ ÖĞRENCİLERİN ENROLLMENT'LARI
// ══════════════════════════════════════════════════════════════════════════════
const newEnrolls = [];
NEW_STUDENTS.forEach(([sno, dept, _yr, _seq, cy]) => {
    const codes = (DEPT_COURSES[dept] || {})[cy] || [];
    codes.forEach(code => {
        const exists = db.enrollments.countDocuments({ student_no: sno, course_code: code, semester_name: SEM }) > 0;
        if (!exists) {
            newEnrolls.push({
                student_no: sno, course_code: code, semester_name: SEM, section: "A",
                status: "ongoing", enrollment_date: ED, created_at: ED
            });
        }
    });
});
if (newEnrolls.length > 0) db.enrollments.insertMany(newEnrolls);
print("✓ Eklenen yeni enrollment: " + newEnrolls.length + " | Toplam: " + db.enrollments.countDocuments());

// ══════════════════════════════════════════════════════════════════════════════
// 3. TÜM ÖĞRENCİLER İÇİN ONAYLANMIŞ DERS KAYIT TALEPLERİ
// ══════════════════════════════════════════════════════════════════════════════
db.course_registration_requests.deleteMany({ semester_name: SEM });
print("  (Mevcut talepler temizlendi)");

const allStudents = db.students.find({}, {
    student_no: 1, department_id: 1,
    "personal.first_name": 1, "personal.last_name": 1,
    "academic.class_year": 1, _id: 0
}).toArray();

const reqDocs = [];
let offset = 0;

allStudents.forEach(s => {
    const codes = (DEPT_COURSES[s.department_id] || {})[s.academic.class_year] || [];
    if (codes.length === 0) return;

    const reqCourses = codes.map(code => ({
        course_code: code,
        course_name: CI[code].name,
        credits: CI[code].credits,
        section: "A",
        instructor_id: CI[code].ins
    }));

    const totalCredits = reqCourses.reduce((sum, c) => sum + c.credits, 0);
    const uniqueIns    = [...new Set(reqCourses.map(c => c.instructor_id))];

    reqDocs.push({
        student_no:    s.student_no,
        student_name:  s.personal.first_name + " " + s.personal.last_name,
        department_id: s.department_id,
        semester_name: SEM,
        requested_courses:       reqCourses,
        total_credits_requested: totalCredits,
        instructor_ids:          uniqueIns,
        status:      "approved",
        feedback:    "Ders seçiminiz onaylandı, başarılar dileriz.",
        submitted_at: new Date(ED.getTime() + offset * 180000),
        reviewed_at:  new Date(RD.getTime() + offset * 60000),
        reviewed_by:  uniqueIns[0]
    });
    offset++;
});

db.course_registration_requests.insertMany(reqDocs);
print("✓ Oluşturulan onaylı talep: " + reqDocs.length);

// ══════════════════════════════════════════════════════════════════════════════
print("\n════════════════════════════════════════════════");
print("  Toplu kayıt & onay tamamlandı!");
print("  Toplam öğrenci : " + db.students.countDocuments());
print("  Toplam enrollment : " + db.enrollments.countDocuments());
print("  Onaylı talep sayısı: " + db.course_registration_requests.countDocuments({ status: "approved" }));
print("════════════════════════════════════════════════\n");
