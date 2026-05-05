// =============================================================
// UBYS – Öğrenci Şifre Seeder
// Çalıştırma:
//   docker run --rm -v "${PWD}/ubys-backend/database/mongodb:/app" \
//     -w /app node:22-alpine sh -c "npm install && node seeder.mjs"
//
// Mantık: Her öğrencinin varsayılan şifresi, öğrenci numarasının
//         ters çevrilmiş halidir (bcrypt ile hashlenmiş olarak saklanır).
//   Örn:  student_no = "1252024004"
//         raw şifre  = "4004202521"
//         stored     = bcrypt("4004202521", 12)
// =============================================================

import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

const MONGO_URI = "mongodb://admin:admin!@72.61.136.135:27017/?authSource=admin";
const DB_NAME   = "ubys_backend";
const SALT_ROUNDS = 12;

const client = new MongoClient(MONGO_URI);

try {
    await client.connect();
    console.log("✓ MongoDB bağlantısı kuruldu\n");

    const col = client.db(DB_NAME).collection("students");

    // Şifresi olmayan VEYA bcrypt ile hashlenmemiş (plain text) öğrencileri bul
    const filter = { $or: [
        { password: { $exists: false } },
        { password: { $not: /^\$2[aby]\$/ } }
    ]};
    const cursor = col.find(filter);
    const total  = await col.countDocuments(filter);

    if (total === 0) {
        console.log("⚠ Güncellenecek öğrenci bulunamadı. Tüm şifreler zaten bcrypt ile hashlenmiş.");
        process.exit(0);
    }

    console.log(`${total} öğrenci için şifre oluşturuluyor...\n`);
    let updated = 0;

    for await (const student of cursor) {
        const rawPassword = student.student_no.split("").reverse().join("");
        const hashed      = await bcrypt.hash(rawPassword, SALT_ROUNDS);

        await col.updateOne(
            { _id: student._id },
            { $set: { password: hashed, updated_at: new Date() } }
        );

        console.log(
            `  ✓  ${student.student_no}` +
            `  →  ham şifre: ${rawPassword}` +
            `  →  hash: ${hashed.slice(0, 29)}...`
        );
        updated++;
    }

    console.log(`\n✓ Toplam ${updated} öğrencinin şifresi güncellendi.`);

} catch (err) {
    console.error("✗ Hata:", err.message);
    process.exit(1);
} finally {
    await client.close();
}
