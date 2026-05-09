// =============================================================
// UBYS – Departments Collection  (Bölümler)
// Run: mongosh "mongodb://admin:admin!@72.61.136.135:27017/?authSource=admin" 02_bolumler.js
// =============================================================

const db = db.getSiblingDB("ubys");

try { db.dropCollection("departments"); } catch (e) {}

db.createCollection("departments", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["department_id", "name", "faculty_code", "program_duration", "is_active"],
            properties: {
                department_id:     { bsonType: "int" },
                name:              { bsonType: "string" },
                faculty_code:      { bsonType: "string" },
                program_duration:  { bsonType: "int", minimum: 2, maximum: 6 },
                quota:             { bsonType: "int" },
                description:       { bsonType: "string" },
                is_active:         { bsonType: "bool" },
                created_at:        { bsonType: "date" },
                updated_at:        { bsonType: "date" }
            }
        }
    },
    validationLevel:  "moderate",
    validationAction: "warn"
});

db.departments.createIndex({ department_id: 1 }, { unique: true });
db.departments.createIndex({ faculty_code: 1 });
db.departments.createIndex({ name: 1 });

db.departments.insertMany([
    {
        department_id: 125,
        name: "Computer Engineering",
        faculty_code: "ENG",
        program_duration: 4,
        quota: 60,
        description: "Trains engineers in software, hardware and information systems.",
        is_active: true,
        created_at: new Date("2020-09-01"),
        updated_at: new Date("2020-09-01")
    },
    {
        department_id: 130,
        name: "Electrical and Electronics Engineering",
        faculty_code: "ENG",
        program_duration: 4,
        quota: 50,
        description: "Trains engineers in electrical, electronics and communications systems.",
        is_active: true,
        created_at: new Date("2020-09-01"),
        updated_at: new Date("2020-09-01")
    },
    {
        department_id: 210,
        name: "Business Administration",
        faculty_code: "ECON",
        program_duration: 4,
        quota: 80,
        description: "Trains experts in business and management sciences.",
        is_active: true,
        created_at: new Date("2020-09-01"),
        updated_at: new Date("2020-09-01")
    },
    {
        department_id: 215,
        name: "Economics",
        faculty_code: "ECON",
        program_duration: 4,
        quota: 60,
        description: "Trains experts in economic theory and applied economics.",
        is_active: true,
        created_at: new Date("2020-09-01"),
        updated_at: new Date("2020-09-01")
    },
    {
        department_id: 310,
        name: "Mathematics",
        faculty_code: "SCI",
        program_duration: 4,
        quota: 40,
        description: "Trains experts in pure and applied mathematics.",
        is_active: true,
        created_at: new Date("2020-09-01"),
        updated_at: new Date("2020-09-01")
    }
]);

print("✓ departments collection ready. (" + db.departments.countDocuments() + " records)");
