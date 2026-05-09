// =============================================================
// UBYS – Enrollments Collection  (Ders Kayıtları)
// Student course registrations per semester
// Run: mongosh "mongodb://admin:admin!@72.61.136.135:27017/?authSource=admin" 09_ders_kayitlari.js
// =============================================================

const db = db.getSiblingDB("ubys");

try { db.dropCollection("enrollments"); } catch (e) {}

db.createCollection("enrollments", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["student_no", "course_code", "semester_name", "section", "status", "enrollment_date"],
            properties: {
                student_no:       { bsonType: "string" },
                course_code:      { bsonType: "string" },
                semester_name:    { bsonType: "string" },
                section:          { bsonType: "string" },
                status: {
                    bsonType: "string",
                    enum: ["ongoing", "completed", "dropped", "failed", "passed", "exempt"]
                },
                enrollment_date: { bsonType: "date" },
                created_at:      { bsonType: "date" }
            }
        }
    },
    validationLevel:  "moderate",
    validationAction: "warn"
});

db.enrollments.createIndex({ student_no: 1, course_code: 1, semester_name: 1 }, { unique: true });
db.enrollments.createIndex({ student_no: 1 });
db.enrollments.createIndex({ course_code: 1, semester_name: 1 });
db.enrollments.createIndex({ status: 1 });

db.enrollments.insertMany([
    {
        student_no: "1252024001", course_code: "CS101",
        semester_name: "2024-2025 Spring", section: "A",
        status: "ongoing",
        enrollment_date: new Date("2025-02-12"), created_at: new Date("2025-02-12")
    },
    {
        student_no: "1252024001", course_code: "CS102",
        semester_name: "2024-2025 Spring", section: "A",
        status: "ongoing",
        enrollment_date: new Date("2025-02-12"), created_at: new Date("2025-02-12")
    },
    {
        student_no: "1252024002", course_code: "CS101",
        semester_name: "2024-2025 Spring", section: "A",
        status: "ongoing",
        enrollment_date: new Date("2025-02-12"), created_at: new Date("2025-02-12")
    },
    {
        student_no: "1302023001", course_code: "CS201",
        semester_name: "2024-2025 Spring", section: "A",
        status: "ongoing",
        enrollment_date: new Date("2025-02-12"), created_at: new Date("2025-02-12")
    }
]);

print("✓ enrollments collection ready. (" + db.enrollments.countDocuments() + " records)");
