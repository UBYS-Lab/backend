// =============================================================
// UBYS – Semesters Collection  (Dönemler)
// Run: mongosh "mongodb://admin:admin!@72.61.136.135:27017/?authSource=admin" 03_donemler.js
// =============================================================

const db = db.getSiblingDB("ubys");

try { db.dropCollection("semesters"); } catch (e) {}

db.createCollection("semesters", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "academic_year", "type", "start_date", "end_date", "is_active"],
            properties: {
                name:          { bsonType: "string" },
                academic_year: { bsonType: "string", pattern: "^[0-9]{4}-[0-9]{4}$" },
                type:          { bsonType: "string", enum: ["fall", "spring", "summer"] },
                start_date:    { bsonType: "date" },
                end_date:      { bsonType: "date" },
                exam_schedule: {
                    bsonType: "object",
                    properties: {
                        midterm_start:  { bsonType: "date" },
                        midterm_end:    { bsonType: "date" },
                        final_start:    { bsonType: "date" },
                        final_end:      { bsonType: "date" },
                        resit_start:    { bsonType: "date" },
                        resit_end:      { bsonType: "date" }
                    }
                },
                registration_schedule: {
                    bsonType: "object",
                    properties: {
                        add_start:    { bsonType: "date" },
                        add_end:      { bsonType: "date" },
                        drop_end:     { bsonType: "date" }
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

db.semesters.createIndex({ academic_year: 1, type: 1 }, { unique: true });
db.semesters.createIndex({ is_active: 1 });

db.semesters.insertMany([
    {
        name: "2023-2024 Spring",
        academic_year: "2023-2024",
        type: "spring",
        start_date: new Date("2024-02-12"),
        end_date:   new Date("2024-06-14"),
        exam_schedule: {
            midterm_start: new Date("2024-04-08"), midterm_end: new Date("2024-04-19"),
            final_start:   new Date("2024-06-03"), final_end:   new Date("2024-06-14"),
            resit_start:   new Date("2024-07-01"), resit_end:   new Date("2024-07-12")
        },
        registration_schedule: {
            add_start: new Date("2024-02-05"),
            add_end:   new Date("2024-02-09"),
            drop_end:  new Date("2024-03-08")
        },
        is_active: false,
        created_at: new Date("2024-01-01")
    },
    {
        name: "2024-2025 Fall",
        academic_year: "2024-2025",
        type: "fall",
        start_date: new Date("2024-09-23"),
        end_date:   new Date("2025-01-17"),
        exam_schedule: {
            midterm_start: new Date("2024-11-11"), midterm_end: new Date("2024-11-22"),
            final_start:   new Date("2025-01-06"), final_end:   new Date("2025-01-17"),
            resit_start:   new Date("2025-02-03"), resit_end:   new Date("2025-02-14")
        },
        registration_schedule: {
            add_start: new Date("2024-09-16"),
            add_end:   new Date("2024-09-20"),
            drop_end:  new Date("2024-10-18")
        },
        is_active: false,
        created_at: new Date("2024-07-01")
    },
    {
        name: "2024-2025 Spring",
        academic_year: "2024-2025",
        type: "spring",
        start_date: new Date("2025-02-17"),
        end_date:   new Date("2025-06-13"),
        exam_schedule: {
            midterm_start: new Date("2025-04-07"), midterm_end: new Date("2025-04-18"),
            final_start:   new Date("2025-06-02"), final_end:   new Date("2025-06-13"),
            resit_start:   new Date("2025-06-30"), resit_end:   new Date("2025-07-11")
        },
        registration_schedule: {
            add_start: new Date("2025-02-10"),
            add_end:   new Date("2025-02-14"),
            drop_end:  new Date("2025-03-14")
        },
        is_active: true,
        created_at: new Date("2025-01-01")
    }
]);

print("✓ semesters collection ready. (" + db.semesters.countDocuments() + " records)");
