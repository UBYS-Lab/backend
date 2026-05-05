// =============================================================
// UBYS – Öğrenci Koleksiyonu (students.js)
// Çalıştırma: mongosh "mongodb://admin:admin!@72.61.136.135:27017/ubys_backend?authSource=admin" students.js
// =============================================================

const db = db.getSiblingDB("ubys_backend");

// -------------------------------------------------------------
// 1. COUNTER KOLEKSİYONU
//    Öğrenci numarası üretmek için bölüm+yıl bazlı sıra sayacı
// -------------------------------------------------------------
try { db.createCollection("counters"); } catch(e) {}

/**
 * nextStudentNo(departmentId, year)
 * Örnek: nextStudentNo(125, 2024) → "1252024001"
 */
function nextStudentNo(departmentId, year) {
    const result = db.counters.findOneAndUpdate(
        { _id: `dept_${departmentId}_${year}` },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" }
    );
    const seq = String(result.seq).padStart(3, "0");
    return { no: `${departmentId}${year}${seq}`, seq: result.seq };
}

// -------------------------------------------------------------
// 2. STUDENTS KOLEKSİYONU – JSON SCHEMA DOĞRULAMASI
// -------------------------------------------------------------
const studentsValidator = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: [
                "student_no",
                "department_id",
                "enrollment_year",
                "sequence_no",
                "personal",
                "academic",
                "created_at"
            ],
            properties: {

                // --- Öğrenci Numarası ---
                student_no: {
                    bsonType: "string",
                    pattern: "^[1-9][0-9]{2}(19|20)[0-9]{2}[0-9]{3}$",
                    description: "Format: {bölümId:3}{yıl:4}{sıraNo:3} — zorunlu"
                },

                department_id: {
                    bsonType: "int",
                    minimum: 111,
                    maximum: 999,
                    description: "Bölüm ID'si (111-999) — zorunlu"
                },

                enrollment_year: {
                    bsonType: "int",
                    minimum: 1950,
                    maximum: 2100,
                    description: "Kayıt yılı — zorunlu"
                },

                sequence_no: {
                    bsonType: "int",
                    minimum: 1,
                    maximum: 999,
                    description: "O bölüme o yıl kaçıncı kaydolan öğrenci — zorunlu"
                },

                // --- Kişisel Bilgiler ---
                personal: {
                    bsonType: "object",
                    required: ["first_name", "last_name", "email"],
                    properties: {
                        first_name:  { bsonType: "string" },
                        last_name:   { bsonType: "string" },
                        tc_no: {
                            bsonType: "string",
                            pattern: "^[0-9]{11}$",
                            description: "11 haneli TC kimlik numarası"
                        },
                        birth_date:  { bsonType: "date" },
                        gender: {
                            bsonType: "string",
                            enum: ["male", "female", "other"]
                        },
                        email: {
                            bsonType: "string",
                            pattern: "^[^@]+@[^@]+\\.[^@]+$"
                        },
                        phone:   { bsonType: "string" },
                        address: { bsonType: "string" },
                        photo_url: { anyOf: [{ bsonType: "null" }, { bsonType: "string" }] }
                    }
                },

                // --- Akademik Bilgiler ---
                academic: {
                    bsonType: "object",
                    required: ["status", "current_semester"],
                    properties: {
                        status: {
                            bsonType: "string",
                            enum: ["active", "passive", "graduated", "suspended", "transferred"],
                            description: "Öğrencilik durumu"
                        },
                        current_semester: {
                            bsonType: "int",
                            minimum: 1,
                            maximum: 16
                        },
                        advisor_id: {
                            anyOf: [{ bsonType: "null" }, { bsonType: "objectId" }],
                            description: "Danışman öğretim üyesinin _id'si"
                        },
                        gpa: {
                            bsonType: "number",
                            minimum: 0,
                            maximum: 4,
                            description: "Genel Not Ortalaması (GNO)"
                        },
                        credits_completed: {
                            bsonType: "int",
                            minimum: 0
                        },
                        credits_required: {
                            bsonType: "int",
                            minimum: 0
                        }
                    }
                },

                // --- Alınan Dersler ---
                courses: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        required: ["course_id", "course_code", "semester", "year", "status"],
                        properties: {
                            course_id: {
                                bsonType: "objectId",
                                description: "courses koleksiyonundaki dersin _id'si"
                            },
                            course_code:  { bsonType: "string" },
                            course_name:  { bsonType: "string" },
                            semester: {
                                bsonType: "int",
                                minimum: 1,
                                maximum: 16
                            },
                            year: {
                                bsonType: "int",
                                minimum: 1950
                            },
                            credits: {
                                bsonType: "int",
                                minimum: 1
                            },

                            // Sınav notları
                            scores: {
                                bsonType: "object",
                                properties: {
                                    midterm:   { bsonType: "number", minimum: 0, maximum: 100 },
                                    final:     { bsonType: "number", minimum: 0, maximum: 100 },
                                    makeup:   { anyOf: [{ bsonType: "null" }, { bsonType: "number", minimum: 0, maximum: 100 }] },
                                    project:  { anyOf: [{ bsonType: "null" }, { bsonType: "number", minimum: 0, maximum: 100 }] },
                                    weighted: { anyOf: [{ bsonType: "null" }, { bsonType: "number", minimum: 0, maximum: 100 }] }
                                }
                            },

                            // Harf notu ve katsayı
                            letter_grade: {
                                bsonType: "string",
                                enum: ["AA","BA","BB","CB","CC","DC","DD","FD","FF","DZ","BL","YT","YZ","MU","EK"]
                            },
                            grade_point: {
                                bsonType: "number",
                                minimum: 0,
                                maximum: 4
                            },

                            // Devamsızlık bilgisi
                            attendance: {
                                bsonType: "object",
                                properties: {
                                    total_classes: { bsonType: "int", minimum: 0 },
                                    attended:      { bsonType: "int", minimum: 0 },
                                    absent:        { bsonType: "int", minimum: 0 },
                                    absent_dates: {
                                        bsonType: "array",
                                        items: { bsonType: "date" }
                                    }
                                }
                            },

                            status: {
                                bsonType: "string",
                                enum: ["ongoing", "completed", "failed", "withdrawn"]
                            }
                        }
                    }
                },

                password: {
                    bsonType: "string",
                    description: "bcrypt hashlenmiş şifre — varsayılan: ters çevrilmiş öğrenci numarası"
                },

                created_at:  { bsonType: "date" },
                updated_at:  { bsonType: "date" }
            }
        }
    },
    validationLevel:  "strict",
    validationAction: "error"
};

const existingCollections = db.getCollectionNames();
if (existingCollections.includes("students")) {
    db.runCommand({ collMod: "students", ...studentsValidator });
} else {
    db.createCollection("students", studentsValidator);
}

// -------------------------------------------------------------
// 3. INDEX'LER
// -------------------------------------------------------------

// Öğrenci numarası — benzersiz, sık kullanılır
db.students.createIndex({ student_no: 1 }, { unique: true, name: "idx_student_no" });

// TC kimlik no — benzersiz
db.students.createIndex({ "personal.tc_no": 1 }, { unique: true, sparse: true, name: "idx_tc_no" });

// E-posta — benzersiz
db.students.createIndex({ "personal.email": 1 }, { unique: true, name: "idx_email" });

// Bölüm bazlı sorgular (bölüm + yıl + sıra no ile numara üretimi)
db.students.createIndex(
    { department_id: 1, enrollment_year: 1, sequence_no: 1 },
    { name: "idx_dept_year_seq" }
);

// Akademik durum bazlı filtreler
db.students.createIndex({ "academic.status": 1 }, { name: "idx_academic_status" });

// GNO bazlı sıralama / sorgulama
db.students.createIndex({ "academic.gpa": -1 }, { name: "idx_gpa_desc" });

// Ders bazlı sorgular (hangi öğrenciler hangi dersi aldı)
db.students.createIndex({ "courses.course_id": 1 }, { name: "idx_course_id" });

// Danışman bazlı sorgular
db.students.createIndex({ "academic.advisor_id": 1 }, { name: "idx_advisor" });

// -------------------------------------------------------------
// 4. ÖRNEK DÖKÜMAN EKLEMESİ
// -------------------------------------------------------------
const generated = nextStudentNo(125, 2024); // → { no: "1252024001", seq: 1 }

if (db.students.findOne({ "personal.tc_no": "12345678901" })) {
    print("⚠ Örnek öğrenci zaten mevcut, insert atlandı.");
} else {
try { db.students.insertOne({
    student_no:      generated.no,
    department_id:   NumberInt(125),
    enrollment_year: NumberInt(2024),
    sequence_no:     NumberInt(generated.seq),

    personal: {
        first_name: "Ali",
        last_name:  "Demir",
        tc_no:      "12345678901",
        birth_date: new Date("2004-03-15"),
        gender:     "male",
        email:      "ali.demir@ubys.edu.tr",
        phone:      "+905551234567",
        address:    "Kadıköy, İstanbul",
        photo_url:  null
    },

    academic: {
        status:            "active",
        current_semester:  NumberInt(1),
        advisor_id:        null,
        gpa:               0.0,
        credits_completed: NumberInt(0),
        credits_required:  NumberInt(240)
    },

    courses: [
        {
            course_id:    new ObjectId(),
            course_code:  "MAT101",
            course_name:  "Matematik I",
            semester:     NumberInt(1),
            year:         NumberInt(2024),
            credits:      NumberInt(4),
            scores: {
                midterm:  65.0,
                final:    78.0,
                makeup:   null,
                project:  null,
                weighted: 73.0
            },
            letter_grade: "BB",
            grade_point:  3.0,
            attendance: {
                total_classes: NumberInt(28),
                attended:      NumberInt(25),
                absent:        NumberInt(3),
                absent_dates: [
                    new Date("2024-10-07"),
                    new Date("2024-11-04"),
                    new Date("2024-12-02")
                ]
            },
            status: "completed"
        }
    ],

    created_at: new Date(),
    updated_at: new Date()
}); print(`✓ Öğrenci oluşturuldu — No: ${generated.no}`); } catch(e) { print(`✗ Insert hatası: ${e.message}`); if(e.errInfo) print(JSON.stringify(e.errInfo, null, 2)); }
}

print(`✓ Koleksiyon: students`);
print(`✓ Index sayısı: ${db.students.getIndexes().length}`);
