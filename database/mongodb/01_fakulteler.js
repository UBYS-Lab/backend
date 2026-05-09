// =============================================================
// UBYS – Faculties Collection  (Fakülteler)
// Run: mongosh "mongodb://admin:admin!@72.61.136.135:27017/?authSource=admin" 01_fakulteler.js
// =============================================================

const db = db.getSiblingDB("ubys");

try { db.dropCollection("faculties"); } catch (e) {}

db.createCollection("faculties", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["faculty_code", "name", "is_active"],
            properties: {
                faculty_code:  { bsonType: "string" },
                name:          { bsonType: "string" },
                description:   { bsonType: "string" },
                is_active:     { bsonType: "bool" },
                created_at:    { bsonType: "date" },
                updated_at:    { bsonType: "date" }
            }
        }
    },
    validationLevel:  "moderate",
    validationAction: "warn"
});

db.faculties.createIndex({ faculty_code: 1 }, { unique: true });
db.faculties.createIndex({ name: 1 });

db.faculties.insertMany([
    {
        faculty_code: "ENG",
        name: "Faculty of Engineering",
        description: "Offers undergraduate, graduate and doctoral programs in engineering and technology.",
        is_active: true,
        created_at: new Date("2020-09-01"),
        updated_at: new Date("2020-09-01")
    },
    {
        faculty_code: "ECON",
        name: "Faculty of Economics and Administrative Sciences",
        description: "Provides education in economics, business and management sciences.",
        is_active: true,
        created_at: new Date("2020-09-01"),
        updated_at: new Date("2020-09-01")
    },
    {
        faculty_code: "SCI",
        name: "Faculty of Science and Letters",
        description: "Offers programs in natural sciences and humanities.",
        is_active: true,
        created_at: new Date("2020-09-01"),
        updated_at: new Date("2020-09-01")
    },
    {
        faculty_code: "LAW",
        name: "Faculty of Law",
        description: "Provides undergraduate education in law.",
        is_active: true,
        created_at: new Date("2020-09-01"),
        updated_at: new Date("2020-09-01")
    }
]);

print("✓ faculties collection ready. (" + db.faculties.countDocuments() + " records)");
