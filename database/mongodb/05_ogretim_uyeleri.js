// =============================================================
// UBYS – Instructors Collection  (Öğretim Üyeleri)
// Run: mongosh "mongodb://admin:admin!@72.61.136.135:27017/?authSource=admin" 05_ogretim_uyeleri.js
// =============================================================

const db = db.getSiblingDB("ubys");

try { db.dropCollection("instructors"); } catch (e) {}

db.createCollection("instructors", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["staff_id", "department_id", "personal", "academic", "password", "is_active"],
            properties: {
                staff_id:      { bsonType: "string" },
                department_id: { bsonType: "int" },
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
                academic: {
                    bsonType: "object",
                    required: ["title"],
                    properties: {
                        title: {
                            bsonType: "string",
                            enum: ["Prof. Dr.", "Assoc. Prof. Dr.", "Asst. Prof. Dr.",
                                   "Lecturer Dr.", "Lecturer", "Res. Asst. Dr.", "Res. Asst."]
                        },
                        specializations:    { bsonType: "array", items: { bsonType: "string" } },
                        publication_count:  { bsonType: "int", minimum: 0 }
                    }
                },
                password:   { bsonType: "string" },
                is_active:  { bsonType: "bool" },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" }
            }
        }
    },
    validationLevel:  "moderate",
    validationAction: "warn"
});

db.instructors.createIndex({ staff_id: 1 },             { unique: true });
db.instructors.createIndex({ department_id: 1 });
db.instructors.createIndex({ "personal.email": 1 },     { unique: true });
db.instructors.createIndex({ "academic.title": 1 });

db.instructors.insertMany([
    {
        staff_id: "INS001",
        department_id: 125,
        personal: {
            first_name: "Ahmet", last_name: "Çelik",
            national_id: "22233344455",
            email: "ahmet.celik@ubys.edu.tr",
            phone: "3121234567", office: "B-201"
        },
        academic: {
            title: "Prof. Dr.",
            specializations: ["Artificial Intelligence", "Machine Learning", "Data Mining"],
            publication_count: 47
        },
        password: "$2y$12$exampleHashedPasswordIns1",
        is_active: true,
        created_at: new Date("2010-09-01"),
        updated_at: new Date("2024-09-01")
    },
    {
        staff_id: "INS002",
        department_id: 125,
        personal: {
            first_name: "Fatma", last_name: "Arslan",
            national_id: "33344455566",
            email: "fatma.arslan@ubys.edu.tr",
            phone: "3121234568", office: "B-205"
        },
        academic: {
            title: "Assoc. Prof. Dr.",
            specializations: ["Software Engineering", "Object-Oriented Programming"],
            publication_count: 22
        },
        password: "$2y$12$exampleHashedPasswordIns2",
        is_active: true,
        created_at: new Date("2015-09-01"),
        updated_at: new Date("2024-09-01")
    },
    {
        staff_id: "INS003",
        department_id: 130,
        personal: {
            first_name: "Murat", last_name: "Yıldız",
            national_id: "44455566677",
            email: "murat.yildiz@ubys.edu.tr",
            phone: "3121234569", office: "C-110"
        },
        academic: {
            title: "Asst. Prof. Dr.",
            specializations: ["Power Electronics", "Control Systems"],
            publication_count: 11
        },
        password: "$2y$12$exampleHashedPasswordIns3",
        is_active: true,
        created_at: new Date("2019-09-01"),
        updated_at: new Date("2024-09-01")
    }
]);

print("✓ instructors collection ready. (" + db.instructors.countDocuments() + " records)");
