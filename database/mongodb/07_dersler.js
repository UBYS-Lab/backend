// =============================================================
// UBYS – Courses Collection  (Dersler)
// Run: mongosh "mongodb://admin:admin!@72.61.136.135:27017/?authSource=admin" 07_dersler.js
// =============================================================

const db = db.getSiblingDB("ubys");

try { db.dropCollection("courses"); } catch (e) {}

db.createCollection("courses", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["course_code", "name", "department_id", "credits", "ects", "theory_hours", "type", "class_year", "is_active"],
            properties: {
                course_code:   { bsonType: "string" },
                name:          { bsonType: "string" },
                department_id: { bsonType: "int" },
                credits:       { bsonType: "int", minimum: 1, maximum: 6 },
                ects:          { bsonType: "int", minimum: 1, maximum: 10 },
                theory_hours:  { bsonType: "int", minimum: 0 },
                lab_hours:     { bsonType: "int", minimum: 0 },
                type: {
                    bsonType: "string",
                    enum: ["mandatory", "elective", "university_elective"]
                },
                class_year:    { bsonType: "int", minimum: 1, maximum: 4 },
                prerequisites: { bsonType: "array", items: { bsonType: "string" } },
                description:   { bsonType: "string" },
                is_active:     { bsonType: "bool" },
                created_at:    { bsonType: "date" }
            }
        }
    },
    validationLevel:  "moderate",
    validationAction: "warn"
});

db.courses.createIndex({ course_code: 1 },   { unique: true });
db.courses.createIndex({ department_id: 1 });
db.courses.createIndex({ class_year: 1 });
db.courses.createIndex({ type: 1 });

db.courses.insertMany([
    // COMPUTER ENGINEERING – YEAR 1
    {
        course_code: "CS101", name: "Introduction to Programming",
        department_id: 125, credits: 3, ects: 5,
        theory_hours: 2, lab_hours: 2,
        type: "mandatory", class_year: 1, prerequisites: [],
        description: "Fundamental programming concepts and algorithms.",
        is_active: true, created_at: new Date("2020-09-01")
    },
    {
        course_code: "CS102", name: "Discrete Mathematics",
        department_id: 125, credits: 3, ects: 5,
        theory_hours: 3, lab_hours: 0,
        type: "mandatory", class_year: 1, prerequisites: [],
        description: "Set theory, logic, graph theory and combinatorics.",
        is_active: true, created_at: new Date("2020-09-01")
    },
    {
        course_code: "CS103", name: "Physics I",
        department_id: 125, credits: 4, ects: 6,
        theory_hours: 3, lab_hours: 2,
        type: "mandatory", class_year: 1, prerequisites: [],
        description: "Mechanics, kinematics and dynamics.",
        is_active: true, created_at: new Date("2020-09-01")
    },
    // COMPUTER ENGINEERING – YEAR 2
    {
        course_code: "CS201", name: "Data Structures and Algorithms",
        department_id: 125, credits: 3, ects: 5,
        theory_hours: 2, lab_hours: 2,
        type: "mandatory", class_year: 2, prerequisites: ["CS101"],
        description: "Fundamental data structures, search and sorting algorithms.",
        is_active: true, created_at: new Date("2020-09-01")
    },
    {
        course_code: "CS202", name: "Object-Oriented Programming",
        department_id: 125, credits: 3, ects: 5,
        theory_hours: 2, lab_hours: 2,
        type: "mandatory", class_year: 2, prerequisites: ["CS101"],
        description: "OOP principles applied with Java or C++.",
        is_active: true, created_at: new Date("2020-09-01")
    },
    // COMPUTER ENGINEERING – YEAR 3
    {
        course_code: "CS301", name: "Database Management Systems",
        department_id: 125, credits: 3, ects: 5,
        theory_hours: 2, lab_hours: 2,
        type: "mandatory", class_year: 3, prerequisites: ["CS201"],
        description: "Relational and NoSQL databases, SQL, normalization.",
        is_active: true, created_at: new Date("2020-09-01")
    },
    {
        course_code: "CS302", name: "Operating Systems",
        department_id: 125, credits: 3, ects: 5,
        theory_hours: 3, lab_hours: 0,
        type: "mandatory", class_year: 3, prerequisites: ["CS201"],
        description: "Process management, memory management, file systems.",
        is_active: true, created_at: new Date("2020-09-01")
    },
    // COMPUTER ENGINEERING – YEAR 4
    {
        course_code: "CS401", name: "Software Engineering",
        department_id: 125, credits: 3, ects: 5,
        theory_hours: 2, lab_hours: 2,
        type: "mandatory", class_year: 4, prerequisites: ["CS302"],
        description: "Software development processes, testing and project management.",
        is_active: true, created_at: new Date("2020-09-01")
    },
    {
        course_code: "CS490", name: "Graduation Project",
        department_id: 125, credits: 4, ects: 8,
        theory_hours: 0, lab_hours: 4,
        type: "mandatory", class_year: 4, prerequisites: ["CS301", "CS302"],
        description: "Design and implementation of a comprehensive software project.",
        is_active: true, created_at: new Date("2020-09-01")
    }
]);

print("✓ courses collection ready. (" + db.courses.countDocuments() + " records)");
