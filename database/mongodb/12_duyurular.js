// =============================================================
// UBYS – Announcements Collection  (Duyurular)
// Run: mongosh "mongodb://admin:admin!@72.61.136.135:27017/?authSource=admin" 12_duyurular.js
// =============================================================

const db = db.getSiblingDB("ubys");

try { db.dropCollection("announcements"); } catch (e) {}

db.createCollection("announcements", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["title", "content", "target_audience", "published_by", "publisher_type", "is_active"],
            properties: {
                title:   { bsonType: "string" },
                content: { bsonType: "string" },
                target_audience: {
                    bsonType: "string",
                    enum: ["students", "instructors", "all"]
                },
                department_id:   { bsonType: ["int", "null"] },
                published_by:    { bsonType: "string" },
                publisher_type: {
                    bsonType: "string",
                    enum: ["instructor", "manager"]
                },
                priority: {
                    bsonType: "string",
                    enum: ["normal", "important", "urgent"]
                },
                is_active:  { bsonType: "bool" },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" }
            }
        }
    },
    validationLevel:  "moderate",
    validationAction: "warn"
});

db.announcements.createIndex({ target_audience: 1, is_active: 1 });
db.announcements.createIndex({ department_id: 1 });
db.announcements.createIndex({ created_at: -1 });
db.announcements.createIndex({ priority: 1 });

db.announcements.insertMany([
    {
        title: "2024-2025 Spring Semester Course Registration Reminder",
        content: "Course registrations for the 2024-2025 Spring semester will be held between February 10-14, 2025. Advisor approval is required.",
        target_audience: "students", department_id: null,
        published_by: "MNG001", publisher_type: "manager",
        priority: "important", is_active: true,
        created_at: new Date("2025-02-05"), updated_at: new Date("2025-02-05")
    },
    {
        title: "CS101 Midterm Exam Date Change",
        content: "The midterm exam for Introduction to Programming has been rescheduled to April 7, 2025. Exam location: B-Lab1.",
        target_audience: "students", department_id: 125,
        published_by: "INS002", publisher_type: "instructor",
        priority: "important", is_active: true,
        created_at: new Date("2025-03-20"), updated_at: new Date("2025-03-20")
    },
    {
        title: "Faculty Meeting – Engineering",
        content: "The Engineering Faculty instructors meeting will be held on Tuesday, April 1, 2025 at 14:00 in the Faculty Meeting Hall.",
        target_audience: "instructors", department_id: null,
        published_by: "MNG002", publisher_type: "manager",
        priority: "normal", is_active: true,
        created_at: new Date("2025-03-25"), updated_at: new Date("2025-03-25")
    },
    {
        title: "Graduation Ceremony Announcement",
        content: "The 2024-2025 Academic Year Graduation Ceremony will be held on June 20, 2025 at 10:00 in the Main Amphitheater.",
        target_audience: "all", department_id: null,
        published_by: "MNG001", publisher_type: "manager",
        priority: "important", is_active: true,
        created_at: new Date("2025-05-01"), updated_at: new Date("2025-05-01")
    }
]);

print("✓ announcements collection ready. (" + db.announcements.countDocuments() + " records)");
