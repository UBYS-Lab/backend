// =============================================================
// UBYS – Students Collection  (Öğrenciler)
// Run: mongosh "mongodb://admin:admin!@72.61.136.135:27017/?authSource=admin" 04_ogrenciler.js
// =============================================================

const db = db.getSiblingDB("ubys");

// Counter collection for student_no generation
try { db.createCollection("counters"); } catch (e) {}
db.counters.createIndex({ _id: 1 }, { unique: true });

/**
 * nextStudentNo(departmentId, year)
 * Example: nextStudentNo(125, 2024) → { no: "1252024001", seq: 1 }
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

try { db.dropCollection("students"); } catch (e) {}

db.createCollection("students", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["student_no", "department_id", "enrollment_year", "sequence_no", "personal", "academic", "password"],
            properties: {
                student_no:      { bsonType: "string" },
                department_id:   { bsonType: "int" },
                enrollment_year: { bsonType: "int", minimum: 2000 },
                sequence_no:     { bsonType: "int" },
                personal: {
                    bsonType: "object",
                    required: ["first_name", "last_name", "email"],
                    properties: {
                        first_name:  { bsonType: "string" },
                        last_name:   { bsonType: "string" },
                        national_id: { bsonType: "string", minLength: 11, maxLength: 11 },
                        birth_date:  { bsonType: "date" },
                        gender:      { bsonType: "string", enum: ["M", "F"] },
                        phone:       { bsonType: "string" },
                        email:       { bsonType: "string" },
                        address:     { bsonType: "string" }
                    }
                },
                academic: {
                    bsonType: "object",
                    properties: {
                        class_year:      { bsonType: "int", minimum: 1, maximum: 6 },
                        active_semester: { bsonType: "string" },
                        gpa:             { bsonType: "double", minimum: 0.0, maximum: 4.0 },
                        total_credits:   { bsonType: "int" },
                        status: {
                            bsonType: "string",
                            enum: ["active", "passive", "graduated", "dismissed", "on_leave"]
                        }
                    }
                },
                password:   { bsonType: "string" },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" }
            }
        }
    },
    validationLevel:  "moderate",
    validationAction: "warn"
});

db.students.createIndex({ student_no: 1 },              { unique: true });
db.students.createIndex({ department_id: 1 });
db.students.createIndex({ "personal.email": 1 },        { unique: true });
db.students.createIndex({ "personal.national_id": 1 },  { unique: true, sparse: true });
db.students.createIndex({ "academic.status": 1 });

const s1 = nextStudentNo(125, 2024);
const s2 = nextStudentNo(125, 2024);
const s3 = nextStudentNo(130, 2023);

db.students.insertMany([
    {
        student_no: s1.no,
        department_id: 125,
        enrollment_year: 2024,
        sequence_no: s1.seq,
        personal: {
            first_name:  "Ali",
            last_name:   "Yılmaz",
            national_id: "12345678901",
            birth_date:  new Date("2006-03-15"),
            gender:      "M",
            phone:       "5551234567",
            email:       "ali.yilmaz@student.ubys.edu.tr",
            address:     "Ankara"
        },
        academic: {
            class_year:      1,
            active_semester: "2024-2025 Spring",
            gpa:             3.20,
            total_credits:   30,
            status:          "active"
        },
        password:   "$2y$12$exampleHashedPassword1",
        created_at: new Date("2024-09-01"),
        updated_at: new Date("2025-02-17")
    },
    {
        student_no: s2.no,
        department_id: 125,
        enrollment_year: 2024,
        sequence_no: s2.seq,
        personal: {
            first_name:  "Ayşe",
            last_name:   "Kara",
            national_id: "98765432109",
            birth_date:  new Date("2005-07-22"),
            gender:      "F",
            phone:       "5559876543",
            email:       "ayse.kara@student.ubys.edu.tr",
            address:     "Istanbul"
        },
        academic: {
            class_year:      1,
            active_semester: "2024-2025 Spring",
            gpa:             3.75,
            total_credits:   30,
            status:          "active"
        },
        password:   "$2y$12$exampleHashedPassword2",
        created_at: new Date("2024-09-01"),
        updated_at: new Date("2025-02-17")
    },
    {
        student_no: s3.no,
        department_id: 130,
        enrollment_year: 2023,
        sequence_no: s3.seq,
        personal: {
            first_name:  "Mehmet",
            last_name:   "Demir",
            national_id: "11223344556",
            birth_date:  new Date("2005-01-10"),
            gender:      "M",
            phone:       "5553334455",
            email:       "mehmet.demir@student.ubys.edu.tr",
            address:     "Izmir"
        },
        academic: {
            class_year:      2,
            active_semester: "2024-2025 Spring",
            gpa:             2.85,
            total_credits:   60,
            status:          "active"
        },
        password:   "$2y$12$exampleHashedPassword3",
        created_at: new Date("2023-09-01"),
        updated_at: new Date("2025-02-17")
    }
]);

print("✓ students collection ready. (" + db.students.countDocuments() + " records)");
