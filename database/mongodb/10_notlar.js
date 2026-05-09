// =============================================================
// UBYS – Grades Collection  (Notlar)
// Student grades and letter grade information
// Run: mongosh "mongodb://admin:admin!@72.61.136.135:27017/?authSource=admin" 10_notlar.js
// =============================================================

const db = db.getSiblingDB("ubys");

try { db.dropCollection("grades"); } catch (e) {}

db.createCollection("grades", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["student_no", "course_code", "semester_name", "instructor_id"],
            properties: {
                student_no:    { bsonType: "string" },
                course_code:   { bsonType: "string" },
                semester_name: { bsonType: "string" },
                score_breakdown: {
                    bsonType: "object",
                    properties: {
                        midterm:  { bsonType: "double", minimum: 0, maximum: 100 },
                        final:    { bsonType: "double", minimum: 0, maximum: 100 },
                        homework: { bsonType: "double", minimum: 0, maximum: 100 },
                        project:  { bsonType: "double", minimum: 0, maximum: 100 },
                        lab:      { bsonType: "double", minimum: 0, maximum: 100 },
                        resit:    { bsonType: "double", minimum: 0, maximum: 100 }
                    }
                },
                raw_score: { bsonType: "double", minimum: 0, maximum: 100 },
                letter_grade: {
                    bsonType: "string",
                    enum: ["AA","BA","BB","CB","CC","DC","DD","FF","NA","EX","NP"],
                    description: "AA(4.0) BA(3.5) BB(3.0) CB(2.5) CC(2.0) DC(1.5) DD(1.0) FF(0.0) NA(absent) EX(exempt) NP(not entered)"
                },
                grade_point: { bsonType: "double", minimum: 0.0, maximum: 4.0 },
                is_passing:  { bsonType: "bool" },
                instructor_id: { bsonType: "string" },
                graded_at:   { bsonType: "date" },
                updated_at:  { bsonType: "date" }
            }
        }
    },
    validationLevel:  "moderate",
    validationAction: "warn"
});

db.grades.createIndex({ student_no: 1, course_code: 1, semester_name: 1 }, { unique: true });
db.grades.createIndex({ student_no: 1 });
db.grades.createIndex({ course_code: 1, semester_name: 1 });
db.grades.createIndex({ letter_grade: 1 });

function calcGrade(rawScore) {
    if (rawScore >= 90) return { letter: "AA", point: 4.0, passing: true  };
    if (rawScore >= 85) return { letter: "BA", point: 3.5, passing: true  };
    if (rawScore >= 75) return { letter: "BB", point: 3.0, passing: true  };
    if (rawScore >= 70) return { letter: "CB", point: 2.5, passing: true  };
    if (rawScore >= 60) return { letter: "CC", point: 2.0, passing: true  };
    if (rawScore >= 50) return { letter: "DC", point: 1.5, passing: false };
    if (rawScore >= 45) return { letter: "DD", point: 1.0, passing: false };
    return                     { letter: "FF", point: 0.0, passing: false };
}

const g1 = calcGrade(78);
const g2 = calcGrade(92);
const g3 = calcGrade(55);

db.grades.insertMany([
    {
        student_no: "1252024001", course_code: "CS101",
        semester_name: "2024-2025 Fall",
        score_breakdown: { midterm: 70.0, final: 82.0, homework: 85.0 },
        raw_score: 78.0, letter_grade: g1.letter, grade_point: g1.point, is_passing: g1.passing,
        instructor_id: "INS002",
        graded_at: new Date("2025-01-20"), updated_at: new Date("2025-01-20")
    },
    {
        student_no: "1252024002", course_code: "CS101",
        semester_name: "2024-2025 Fall",
        score_breakdown: { midterm: 95.0, final: 90.0, homework: 100.0 },
        raw_score: 92.0, letter_grade: g2.letter, grade_point: g2.point, is_passing: g2.passing,
        instructor_id: "INS002",
        graded_at: new Date("2025-01-20"), updated_at: new Date("2025-01-20")
    },
    {
        student_no: "1302023001", course_code: "CS201",
        semester_name: "2024-2025 Fall",
        score_breakdown: { midterm: 50.0, final: 58.0, homework: 60.0 },
        raw_score: 55.0, letter_grade: g3.letter, grade_point: g3.point, is_passing: g3.passing,
        instructor_id: "INS001",
        graded_at: new Date("2025-01-20"), updated_at: new Date("2025-01-20")
    }
]);

print("✓ grades collection ready. (" + db.grades.countDocuments() + " records)");
