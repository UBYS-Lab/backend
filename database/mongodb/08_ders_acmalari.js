// =============================================================
// UBYS – Course Offerings Collection  (Ders Açmaları)
// A course offered in a specific semester by a specific instructor
// Run: mongosh "mongodb://admin:admin!@72.61.136.135:27017/?authSource=admin" 08_ders_acmalari.js
// =============================================================

const db = db.getSiblingDB("ubys");

try { db.dropCollection("course_offerings"); } catch (e) {}

db.createCollection("course_offerings", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["course_code", "semester_name", "instructor_id", "section", "capacity", "is_active"],
            properties: {
                course_code:    { bsonType: "string" },
                semester_name:  { bsonType: "string" },
                instructor_id:  { bsonType: "string" },
                section:        { bsonType: "string" },
                capacity:       { bsonType: "int", minimum: 1 },
                enrolled_count: { bsonType: "int", minimum: 0 },
                schedule: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        required: ["day", "start_time", "end_time"],
                        properties: {
                            day:        { bsonType: "string",
                                          enum: ["Monday","Tuesday","Wednesday","Thursday","Friday"] },
                            start_time: { bsonType: "string" },
                            end_time:   { bsonType: "string" },
                            classroom:  { bsonType: "string" }
                        }
                    }
                },
                is_active:  { bsonType: "bool" },
                created_at: { bsonType: "date" }
            }
        }
    },
    validationLevel:  "moderate",
    validationAction: "warn"
});

db.course_offerings.createIndex({ course_code: 1, semester_name: 1, section: 1 }, { unique: true });
db.course_offerings.createIndex({ semester_name: 1 });
db.course_offerings.createIndex({ instructor_id: 1 });

db.course_offerings.insertMany([
    {
        course_code: "CS101", semester_name: "2024-2025 Spring",
        instructor_id: "INS002", section: "A",
        capacity: 30, enrolled_count: 28,
        schedule: [
            { day: "Monday",    start_time: "09:00", end_time: "11:00", classroom: "B-Lab1" },
            { day: "Wednesday", start_time: "11:00", end_time: "13:00", classroom: "B-Lab1" }
        ],
        is_active: true, created_at: new Date("2025-01-15")
    },
    {
        course_code: "CS102", semester_name: "2024-2025 Spring",
        instructor_id: "INS001", section: "A",
        capacity: 40, enrolled_count: 35,
        schedule: [
            { day: "Tuesday", start_time: "13:00", end_time: "16:00", classroom: "A-101" }
        ],
        is_active: true, created_at: new Date("2025-01-15")
    },
    {
        course_code: "CS201", semester_name: "2024-2025 Spring",
        instructor_id: "INS001", section: "A",
        capacity: 30, enrolled_count: 25,
        schedule: [
            { day: "Thursday", start_time: "09:00", end_time: "11:00", classroom: "B-Lab2" },
            { day: "Friday",   start_time: "09:00", end_time: "11:00", classroom: "B-Lab2" }
        ],
        is_active: true, created_at: new Date("2025-01-15")
    }
]);

print("✓ course_offerings collection ready. (" + db.course_offerings.countDocuments() + " records)");
