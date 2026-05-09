// =============================================================
// UBYS – Attendance Collection  (Devamsızlık)
// Run: mongosh "mongodb://admin:admin!@72.61.136.135:27017/?authSource=admin" 11_devamsizlik.js
// =============================================================

const db = db.getSiblingDB("ubys");

try { db.dropCollection("attendance"); } catch (e) {}

db.createCollection("attendance", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["student_no", "course_code", "semester_name", "class_date", "hour_count", "status", "recorded_by"],
            properties: {
                student_no:    { bsonType: "string" },
                course_code:   { bsonType: "string" },
                semester_name: { bsonType: "string" },
                section:       { bsonType: "string" },
                class_date:    { bsonType: "date" },
                hour_count:    { bsonType: "int", minimum: 1 },
                status: {
                    bsonType: "string",
                    enum: ["present", "absent", "excused", "medical"],
                    description: "present | absent | excused (official) | medical (health report)"
                },
                notes:       { bsonType: "string" },
                recorded_by: { bsonType: "string" },
                created_at:  { bsonType: "date" }
            }
        }
    },
    validationLevel:  "moderate",
    validationAction: "warn"
});

db.attendance.createIndex({ student_no: 1, course_code: 1, semester_name: 1, class_date: 1 }, { unique: true });
db.attendance.createIndex({ student_no: 1, course_code: 1, semester_name: 1 });
db.attendance.createIndex({ course_code: 1, semester_name: 1, class_date: 1 });
db.attendance.createIndex({ status: 1 });

db.attendance.insertMany([
    {
        student_no: "1252024001", course_code: "CS101",
        semester_name: "2024-2025 Spring", section: "A",
        class_date: new Date("2025-02-24"), hour_count: 2,
        status: "present", recorded_by: "INS002",
        created_at: new Date("2025-02-24")
    },
    {
        student_no: "1252024001", course_code: "CS101",
        semester_name: "2024-2025 Spring", section: "A",
        class_date: new Date("2025-03-03"), hour_count: 2,
        status: "absent", recorded_by: "INS002",
        created_at: new Date("2025-03-03")
    },
    {
        student_no: "1252024002", course_code: "CS101",
        semester_name: "2024-2025 Spring", section: "A",
        class_date: new Date("2025-02-24"), hour_count: 2,
        status: "present", recorded_by: "INS002",
        created_at: new Date("2025-02-24")
    },
    {
        student_no: "1302023001", course_code: "CS201",
        semester_name: "2024-2025 Spring", section: "A",
        class_date: new Date("2025-02-27"), hour_count: 2,
        status: "medical", notes: "Health report submitted.",
        recorded_by: "INS001",
        created_at: new Date("2025-02-27")
    }
]);

print("✓ attendance collection ready. (" + db.attendance.countDocuments() + " records)");
