// =============================================================
// UBYS – Managers Collection  (Yöneticiler: Dekan, Müdür, Rektör vb.)
// Run: mongosh "mongodb://admin:admin!@72.61.136.135:27017/?authSource=admin" 06_yoneticiler.js
// =============================================================

const db = db.getSiblingDB("ubys");

try { db.dropCollection("managers"); } catch (e) {}

db.createCollection("managers", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["staff_id", "role", "unit_type", "unit_id", "personal", "password", "is_active"],
            properties: {
                staff_id:  { bsonType: "string" },
                role: {
                    bsonType: "string",
                    enum: ["rector", "vice_rector", "dean", "vice_dean",
                           "institute_director", "department_chair", "student_affairs"]
                },
                unit_type: {
                    bsonType: "string",
                    enum: ["university", "faculty", "department", "institute"]
                },
                unit_id:   { bsonType: ["string", "int"] },
                personal: {
                    bsonType: "object",
                    required: ["first_name", "last_name", "email"],
                    properties: {
                        first_name:  { bsonType: "string" },
                        last_name:   { bsonType: "string" },
                        national_id: { bsonType: "string", minLength: 11, maxLength: 11 },
                        email:       { bsonType: "string" },
                        phone:       { bsonType: "string" },
                        office:      { bsonType: "string" }
                    }
                },
                password:         { bsonType: "string" },
                appointment_start: { bsonType: "date" },
                appointment_end:   { bsonType: ["date", "null"] },
                is_active:  { bsonType: "bool" },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" }
            }
        }
    },
    validationLevel:  "moderate",
    validationAction: "warn"
});

db.managers.createIndex({ staff_id: 1 },            { unique: true });
db.managers.createIndex({ role: 1 });
db.managers.createIndex({ unit_id: 1 });
db.managers.createIndex({ "personal.email": 1 },    { unique: true });

db.managers.insertMany([
    {
        staff_id: "MNG001",
        role: "rector",
        unit_type: "university",
        unit_id: "UNI",
        personal: {
            first_name: "Kemal", last_name: "Şahin",
            national_id: "55566677788",
            email: "rector@ubys.edu.tr",
            phone: "3121110001", office: "Rectorate A-1"
        },
        password: "$2y$12$exampleHashedPasswordMng1",
        appointment_start: new Date("2022-09-01"),
        appointment_end: null,
        is_active: true,
        created_at: new Date("2022-09-01"),
        updated_at: new Date("2022-09-01")
    },
    {
        staff_id: "MNG002",
        role: "dean",
        unit_type: "faculty",
        unit_id: "ENG",
        personal: {
            first_name: "Leyla", last_name: "Koç",
            national_id: "66677788899",
            email: "dean.eng@ubys.edu.tr",
            phone: "3121110002", office: "Engineering Faculty A-1"
        },
        password: "$2y$12$exampleHashedPasswordMng2",
        appointment_start: new Date("2023-09-01"),
        appointment_end: null,
        is_active: true,
        created_at: new Date("2023-09-01"),
        updated_at: new Date("2023-09-01")
    },
    {
        staff_id: "MNG003",
        role: "department_chair",
        unit_type: "department",
        unit_id: 125,
        personal: {
            first_name: "Orhan", last_name: "Bulut",
            national_id: "77788899900",
            email: "chair.cs@ubys.edu.tr",
            phone: "3121110003", office: "B-101"
        },
        password: "$2y$12$exampleHashedPasswordMng3",
        appointment_start: new Date("2023-09-01"),
        appointment_end: null,
        is_active: true,
        created_at: new Date("2023-09-01"),
        updated_at: new Date("2023-09-01")
    }
]);

print("✓ managers collection ready. (" + db.managers.countDocuments() + " records)");
