# UBYS Backend – Veritabanı Dokümantasyonu

> **UBYS** (Üniversite Bilgi Yönetim Sistemi) — Laravel + MongoDB tabanlı üniversite yönetim sistemi backend'i.

---

## Genel Bilgiler

| Özellik | Değer |
|---|---|
| **Veritabanı adı** | `ubys` |
| **Veritabanı türü** | MongoDB |
| **Koleksiyon sayısı** | 12 + `counters` (yardımcı) |
| **Seed script dizini** | `database/mongodb/` |

### Seed scriptlerini çalıştırma

Şema ve örnek veriyi yüklemek için iki seçenek vardır:

**A) Tüm koleksiyon scriptlerini sırasıyla çalıştır (01 → 12):**
```bash
mongosh "mongodb://admin:admin!@72.61.136.135:27017/?authSource=admin" 01_fakulteler.js
mongosh "mongodb://admin:admin!@72.61.136.135:27017/?authSource=admin" 02_bolumler.js
# ... 12'ye kadar devam
```

**B) Tek seferde test verisi yükle (önerilen):**
```bash
# Dosyayı sunucuya kopyala ve container içinde çalıştır
scp database/mongodb/test_data.js elliot@<sunucu-ip>:~/test_data.js
ssh elliot@<sunucu-ip> "docker cp ~/test_data.js mongodb_remote:/tmp/ && \
  docker exec mongodb_remote mongosh --authenticationDatabase admin \
  -u admin -p 'admin!' /tmp/test_data.js"
```

> **Uyarı:** Her script `deleteMany({})` çalıştırır; mevcut veri silinir ama koleksiyon şeması (indeksler, validator) korunur.

---

## Kimlik Doğrulama (Authentication)

Sistem **3 farklı kullanıcı türünü** tek endpoint üzerinden destekler:

**Endpoint:** `POST /api/auth/login`

```json
{
  "student_no": "<kimlik>",
  "password":   "<şifre>"
}
```

Giriş sırası: `students` → `instructors` → `managers`. İlk eşleşen döner.

### Kullanıcı Türleri ve Kimlik Alanları

| Tür | Koleksiyon | Kimlik alanı | Örnek kimlik | `role` değeri |
|---|---|---|---|---|
| **Öğrenci** | `students` | `student_no` | `1252024001` | `student` |
| **Öğretim Üyesi** | `instructors` | `staff_id` | `INS001` | `instructor` |
| **Yönetici** | `managers` | `staff_id` | `MNG001` | `manager` |

### Başarılı Giriş Yanıtı — `role: student`

```json
{
  "role": "student",
  "identifier": "1252024001",
  "full_name": "Ali Yılmaz",
  "email": "ali.yilmaz@student.ubys.edu.tr",
  "department_id": 125,
  "class_year": 1,
  "gpa": 3.20,
  "status": "active"
}
```

### Başarılı Giriş Yanıtı — `role: instructor`

```json
{
  "role": "instructor",
  "identifier": "INS001",
  "full_name": "Ahmet Çelik",
  "email": "ahmet.celik@ubys.edu.tr",
  "department_id": 125,
  "title": "Prof. Dr."
}
```

### Başarılı Giriş Yanıtı — `role: manager`

```json
{
  "role": "manager",
  "identifier": "MNG001",
  "full_name": "Kemal Şahin",
  "email": "rector@ubys.edu.tr",
  "unit_type": "university",
  "unit_id": "UNI",
  "manager_role": "rector"
}
```

---

## Test Hesapları

Test verisi (`test_data.js`) yüklendikten sonra aşağıdaki hesapları kullanabilirsiniz. **Tüm hesapların şifresi: `password`**

### Öğrenciler

| Öğrenci No | Ad Soyad | Bölüm | Sınıf | GNO |
|---|---|---|---|---|
| `1252024001` | Ali Yılmaz | Bilgisayar Müh. | 1 | 3.20 |
| `1252024002` | Ayşe Kara | Bilgisayar Müh. | 1 | 3.75 |
| `1252024003` | Emre Arslan | Bilgisayar Müh. | 1 | 2.90 |
| `1252024004` | Seda Demir | Bilgisayar Müh. | 1 | 3.50 |
| `1252023001` | Zeynep Çelik | Bilgisayar Müh. | 2 | 3.10 |
| `1252023002` | Deniz Öztürk | Bilgisayar Müh. | 2 | 2.60 |
| `1252022001` | Can Özkan | Bilgisayar Müh. | 3 | 3.40 |
| `1302023001` | Mehmet Şahin | Elektrik-Elektronik Müh. | 2 | 2.85 |
| `1302024001` | Selin Koç | Elektrik-Elektronik Müh. | 1 | 3.60 |
| `2102024001` | Fatma Bulut | İşletme | 1 | 3.80 |

### Öğretim Üyeleri

| Sicil No | Ad Soyad | Unvan | Bölüm |
|---|---|---|---|
| `INS001` | Ahmet Çelik | Prof. Dr. | Bilgisayar Müh. |
| `INS002` | Fatma Arslan | Doç. Dr. | Bilgisayar Müh. |
| `INS003` | Murat Yıldız | Dr. Öğr. Üyesi | Elektrik-Elektronik Müh. |

### Yöneticiler

| Sicil No | Ad Soyad | Rol | Birim |
|---|---|---|---|
| `MNG001` | Kemal Şahin | Rektör | Üniversite |
| `MNG002` | Leyla Koç | Dekan | Mühendislik Fakültesi |
| `MNG003` | Orhan Bulut | Bölüm Başkanı | Bilgisayar Müh. |

---

## Koleksiyonlar

### 1. `faculties` — Fakülteler

Üniversitenin en üst akademik birimlerini temsil eder.

| Alan | Tür | Açıklama |
|---|---|---|
| `faculty_code` | string | Benzersiz fakülte kısa kodu (örn: `ENG`, `ECON`) |
| `name` | string | Fakültenin tam adı |
| `description` | string | Fakülte hakkında kısa açıklama |
| `is_active` | bool | Fakültenin aktif olup olmadığı |
| `created_at` | date | Kayıt oluşturulma tarihi |
| `updated_at` | date | Son güncelleme tarihi |

**İndeksler:** `faculty_code` (unique), `name`

**Örnek değerler:** `ENG` = Mühendislik Fakültesi, `ECON` = İİBF, `SCI` = Fen-Edebiyat, `LAW` = Hukuk

---

### 2. `departments` — Bölümler

Her fakülteye bağlı akademik bölümler.

| Alan | Tür | Açıklama |
|---|---|---|
| `department_id` | int | Benzersiz bölüm numarası (örn: `125`) |
| `name` | string | Bölümün tam adı |
| `faculty_code` | string | Bağlı olduğu fakültenin kodu → `faculties.faculty_code` |
| `program_duration` | int | Normal öğrenim süresi (yıl, 2–6) |
| `quota` | int | Yıllık öğrenci kontenjanı |
| `description` | string | Bölüm hakkında kısa açıklama |
| `is_active` | bool | Bölümün aktif olup olmadığı |
| `created_at` | date | Kayıt oluşturulma tarihi |
| `updated_at` | date | Son güncelleme tarihi |

**İndeksler:** `department_id` (unique), `faculty_code`, `name`

**Örnek değerler:** `125` = Bilgisayar Mühendisliği, `130` = Elektrik-Elektronik Müh., `210` = İşletme

---

### 3. `semesters` — Dönemler

Akademik takvim ve sınav dönemleri.

| Alan | Tür | Açıklama |
|---|---|---|
| `name` | string | Dönem adı (örn: `2024-2025 Fall`) |
| `academic_year` | string | Akademik yıl, format `YYYY-YYYY` |
| `type` | string | Dönem türü: `fall` (güz) / `spring` (bahar) / `summer` (yaz) |
| `start_date` | date | Dönem başlangıç tarihi |
| `end_date` | date | Dönem bitiş tarihi |
| `exam_schedule` | object | Vize/final/bütünleme sınav tarihleri |
| `exam_schedule.midterm_start` | date | Vize sınavları başlangıcı |
| `exam_schedule.midterm_end` | date | Vize sınavları bitişi |
| `exam_schedule.final_start` | date | Final sınavları başlangıcı |
| `exam_schedule.final_end` | date | Final sınavları bitişi |
| `exam_schedule.resit_start` | date | Bütünleme sınavları başlangıcı |
| `exam_schedule.resit_end` | date | Bütünleme sınavları bitişi |
| `registration_schedule` | object | Ders ekleme/bırakma tarihleri |
| `registration_schedule.add_start` | date | Ders kaydı başlangıcı |
| `registration_schedule.add_end` | date | Ders kaydı bitişi |
| `registration_schedule.drop_end` | date | Ders bırakma son tarihi |
| `is_active` | bool | Aktif dönem mi? |
| `created_at` | date | Kayıt oluşturulma tarihi |

**İndeksler:** `(academic_year, type)` (unique), `is_active`

---

### 4. `students` — Öğrenciler

Sisteme kayıtlı tüm öğrencilerin bilgileri.

| Alan | Tür | Açıklama |
|---|---|---|
| `student_no` | string | Benzersiz öğrenci numarası: `{department_id}{enrollment_year}{sequence_no}` |
| `department_id` | int | Kayıtlı olduğu bölüm → `departments.department_id` |
| `enrollment_year` | int | Üniversiteye ilk kayıt yılı |
| `sequence_no` | int | Bölüm+yıl içindeki sıra numarası |
| `personal.first_name` | string | Ad |
| `personal.last_name` | string | Soyad |
| `personal.national_id` | string | TC Kimlik No (11 hane) |
| `personal.birth_date` | date | Doğum tarihi |
| `personal.gender` | string | Cinsiyet: `M` (erkek) / `F` (kadın) |
| `personal.phone` | string | Telefon numarası |
| `personal.email` | string | E-posta adresi (benzersiz) |
| `personal.address` | string | Adres |
| `academic.class_year` | int | Aktif sınıf düzeyi (1–6) |
| `academic.active_semester` | string | Güncel dönem adı |
| `academic.gpa` | double | Genel Not Ortalaması (0.00–4.00) |
| `academic.total_credits` | int | Tamamlanan toplam kredi |
| `academic.status` | string | Kayıt durumu: `active` (aktif) / `passive` (pasif) / `graduated` (mezun) / `dismissed` (ilişki kesildi) / `on_leave` (izinli) |
| `password` | string | Bcrypt ile hashlenmiş şifre |
| `created_at` | date | Kayıt oluşturulma tarihi |
| `updated_at` | date | Son güncelleme tarihi |

**İndeksler:** `student_no` (unique), `department_id`, `personal.email` (unique), `personal.national_id` (unique, sparse), `academic.status`

**Öğrenci No Üretimi:** `counters` koleksiyonundaki `dept_{department_id}_{year}` sayacı ile otomatik artar.

---

### 5. `instructors` — Öğretim Üyeleri

Akademik personel bilgileri.

| Alan | Tür | Açıklama |
|---|---|---|
| `staff_id` | string | Benzersiz sicil numarası (örn: `INS001`) |
| `department_id` | int | Kadronun bulunduğu bölüm → `departments.department_id` |
| `personal.first_name` | string | Ad |
| `personal.last_name` | string | Soyad |
| `personal.national_id` | string | TC Kimlik No |
| `personal.email` | string | Kurumsal e-posta (benzersiz) |
| `personal.phone` | string | Telefon |
| `personal.office` | string | Ofis oda numarası |
| `academic.title` | string | Unvan: `Prof. Dr.` / `Assoc. Prof. Dr.` / `Asst. Prof. Dr.` / `Lecturer Dr.` / `Lecturer` / `Res. Asst. Dr.` / `Res. Asst.` |
| `academic.specializations` | array | Uzmanlık alanları listesi |
| `academic.publication_count` | int | Toplam yayın sayısı |
| `password` | string | Bcrypt ile hashlenmiş şifre |
| `is_active` | bool | Aktif mi? |
| `created_at` | date | Kayıt oluşturulma tarihi |
| `updated_at` | date | Son güncelleme tarihi |

**İndeksler:** `staff_id` (unique), `department_id`, `personal.email` (unique), `academic.title`

---

### 6. `managers` — Yöneticiler

Rektör, dekan, bölüm başkanı ve diğer idari yöneticiler.

| Alan | Tür | Açıklama |
|---|---|---|
| `staff_id` | string | Benzersiz sicil numarası (örn: `MNG001`) |
| `role` | string | Rol: `rector` (rektör) / `vice_rector` (rektör yrd.) / `dean` (dekan) / `vice_dean` (dekan yrd.) / `institute_director` (enstitü müdürü) / `department_chair` (bölüm başkanı) / `student_affairs` (öğrenci işleri) |
| `unit_type` | string | Yönetilen birim türü: `university` / `faculty` / `department` / `institute` |
| `unit_id` | string/int | Yönetilen birimin kodu (`faculty_code` veya `department_id`) |
| `personal.first_name` | string | Ad |
| `personal.last_name` | string | Soyad |
| `personal.national_id` | string | TC Kimlik No |
| `personal.email` | string | Kurumsal e-posta (benzersiz) |
| `personal.phone` | string | Telefon |
| `personal.office` | string | Ofis |
| `password` | string | Bcrypt ile hashlenmiş şifre |
| `appointment_start` | date | Göreve başlama tarihi |
| `appointment_end` | date/null | Görev bitiş tarihi (`null` = hâlâ görevde) |
| `is_active` | bool | Aktif mi? |
| `created_at` | date | Kayıt oluşturulma tarihi |
| `updated_at` | date | Son güncelleme tarihi |

**İndeksler:** `staff_id` (unique), `role`, `unit_id`, `personal.email` (unique)

---

### 7. `courses` — Dersler

Bölümlere ait ders kataloğu.

| Alan | Tür | Açıklama |
|---|---|---|
| `course_code` | string | Benzersiz ders kodu (örn: `CS101`) |
| `name` | string | Dersin tam adı |
| `department_id` | int | Dersin ait olduğu bölüm → `departments.department_id` |
| `credits` | int | Ulusal kredi (1–6) |
| `ects` | int | AKTS kredisi (1–10) |
| `theory_hours` | int | Haftalık teori ders saati |
| `lab_hours` | int | Haftalık uygulama/laboratuvar saati |
| `type` | string | Ders türü: `mandatory` (zorunlu) / `elective` (seçmeli) / `university_elective` (üniversite seçmeli) |
| `class_year` | int | Sınıf düzeyi (1–4) |
| `prerequisites` | array | Ön koşul ders kodları listesi |
| `description` | string | Dersin içeriği |
| `is_active` | bool | Aktif mi? |
| `created_at` | date | Kayıt oluşturulma tarihi |

**İndeksler:** `course_code` (unique), `department_id`, `class_year`, `type`

---

### 8. `course_offerings` — Ders Açmaları

Bir dersin belirli bir dönemde, belirli bir öğretim üyesi tarafından açılması.

| Alan | Tür | Açıklama |
|---|---|---|
| `course_code` | string | Açılan ders → `courses.course_code` |
| `semester_name` | string | Dönem adı → `semesters.name` |
| `instructor_id` | string | Dersi veren öğretim üyesi → `instructors.staff_id` |
| `section` | string | Şube kodu (`A`, `B`, `C`, …) |
| `capacity` | int | Maksimum öğrenci sayısı |
| `enrolled_count` | int | Kayıtlı öğrenci sayısı |
| `schedule` | array | Haftalık ders programı |
| `schedule[].day` | string | Gün: `Monday` / `Tuesday` / `Wednesday` / `Thursday` / `Friday` |
| `schedule[].start_time` | string | Başlangıç saati (örn: `09:00`) |
| `schedule[].end_time` | string | Bitiş saati (örn: `11:00`) |
| `schedule[].classroom` | string | Derslik/laboratuvar kodu |
| `is_active` | bool | Aktif mi? |
| `created_at` | date | Kayıt oluşturulma tarihi |

**İndeksler:** `(course_code, semester_name, section)` (unique), `semester_name`, `instructor_id`

---

### 9. `enrollments` — Ders Kayıtları

Öğrencilerin dönem içinde kayıt olduğu dersler.

| Alan | Tür | Açıklama |
|---|---|---|
| `student_no` | string | Öğrenci numarası → `students.student_no` |
| `course_code` | string | Ders kodu → `courses.course_code` |
| `semester_name` | string | Dönem adı → `semesters.name` |
| `section` | string | Şube kodu |
| `status` | string | Kayıt durumu: `ongoing` (devam ediyor) / `completed` (tamamlandı) / `dropped` (bıraktı) / `failed` (kaldı) / `passed` (geçti) / `exempt` (muaf) |
| `enrollment_date` | date | Kayıt tarihi |
| `created_at` | date | Kayıt oluşturulma tarihi |

**İndeksler:** `(student_no, course_code, semester_name)` (unique — aynı öğrenci aynı dersi dönem içinde iki kez alamaz), `student_no`, `(course_code, semester_name)`, `status`

---

### 10. `grades` — Notlar

Öğrencilerin ders notları ve harf notu bilgileri.

| Alan | Tür | Açıklama |
|---|---|---|
| `student_no` | string | Öğrenci numarası → `students.student_no` |
| `course_code` | string | Ders kodu → `courses.course_code` |
| `semester_name` | string | Dönem adı → `semesters.name` |
| `score_breakdown.midterm` | double | Vize notu (0–100) |
| `score_breakdown.final` | double | Final notu (0–100) |
| `score_breakdown.homework` | double | Ödev notu (0–100) |
| `score_breakdown.project` | double | Proje notu (0–100) |
| `score_breakdown.lab` | double | Laboratuvar notu (0–100) |
| `score_breakdown.resit` | double | Bütünleme notu (0–100) |
| `raw_score` | double | Ağırlıklı ham not (0–100) |
| `letter_grade` | string | Harf notu (aşağıdaki tabloya bakınız) |
| `grade_point` | double | Katsayı (0.0–4.0) |
| `is_passing` | bool | Dersi geçti mi? |
| `instructor_id` | string | Notu giren öğretim üyesi → `instructors.staff_id` |
| `graded_at` | date | Not giriş tarihi |
| `updated_at` | date | Son güncelleme tarihi |

**Harf Notu Skalası:**

| Harf | Katsayı | Aralık | Durum |
|---|---|---|---|
| `AA` | 4.0 | ≥ 90 | Geçti |
| `BA` | 3.5 | 85–89 | Geçti |
| `BB` | 3.0 | 75–84 | Geçti |
| `CB` | 2.5 | 70–74 | Geçti |
| `CC` | 2.0 | 60–69 | Geçti |
| `DC` | 1.5 | 50–59 | Koşullu |
| `DD` | 1.0 | 45–49 | Koşullu |
| `FF` | 0.0 | < 45 | Kaldı |
| `NA` | — | — | Devamsızlıktan kaldı |
| `EX` | — | — | Muaf |
| `NP` | — | — | Not girilmedi |

**İndeksler:** `(student_no, course_code, semester_name)` (unique), `student_no`, `(course_code, semester_name)`, `letter_grade`

---

### 11. `attendance` — Devamsızlık

Öğrencilerin ders bazında yoklama kayıtları.

| Alan | Tür | Açıklama |
|---|---|---|
| `student_no` | string | Öğrenci numarası → `students.student_no` |
| `course_code` | string | Ders kodu → `courses.course_code` |
| `semester_name` | string | Dönem adı → `semesters.name` |
| `section` | string | Şube kodu |
| `class_date` | date | Dersin yapıldığı tarih |
| `hour_count` | int | Bu ders için sayılan saat sayısı |
| `status` | string | Durum: `present` (geldi) / `absent` (gelmedi) / `excused` (izinli — resmi belge) / `medical` (sağlık raporu) |
| `notes` | string | İsteğe bağlı açıklama |
| `recorded_by` | string | Kaydı giren öğretim üyesi → `instructors.staff_id` |
| `created_at` | date | Kayıt oluşturulma tarihi |

**İndeksler:** `(student_no, course_code, semester_name, class_date)` (unique), `(student_no, course_code, semester_name)`, `(course_code, semester_name, class_date)`, `status`

---

### 12. `announcements` — Duyurular

Öğretim üyeleri ve yöneticiler tarafından yapılan duyurular.

| Alan | Tür | Açıklama |
|---|---|---|
| `title` | string | Duyuru başlığı |
| `content` | string | Duyuru içeriği |
| `target_audience` | string | Hedef kitle: `students` (öğrenciler) / `instructors` (öğretim üyeleri) / `all` (herkes) |
| `department_id` | int/null | Belirli bir bölüme yönelikse bölüm kodu; `null` ise tüm bölümler |
| `published_by` | string | Yayınlayan kişinin sicil numarası |
| `publisher_type` | string | Yayınlayan türü: `instructor` (öğretim üyesi) / `manager` (yönetici) |
| `priority` | string | Önem derecesi: `normal` / `important` (önemli) / `urgent` (acil) |
| `is_active` | bool | Aktif mi? |
| `created_at` | date | Yayın tarihi |
| `updated_at` | date | Son güncelleme tarihi |

**İndeksler:** `(target_audience, is_active)`, `department_id`, `created_at` (desc), `priority`

---

### Yardımcı: `counters` — Sayaçlar

Otomatik numaralandırma için kullanılır. Doğrudan erişilmez.

| Alan | Açıklama |
|---|---|
| `_id` | `dept_{department_id}_{year}` formatında anahtar |
| `seq` | Son üretilen sıra numarası |

---

## İlişki Diyagramı

```
faculties (1) ──< departments (N)
departments (1) ──< students (N)
departments (1) ──< instructors (N)
departments (1) ──< courses (N)
courses (1) ──< course_offerings (N) >── instructors (1)
semesters (1) ──< course_offerings (N)
students (1) ──< enrollments (N) >── course_offerings (1)
students (1) ──< grades (N) >── courses (1)
students (1) ──< attendance (N) >── courses (1)
managers (N) >── faculties/departments (1)  [via unit_id]
```

## Koleksiyon Özeti

| Koleksiyon | Türkçe Adı | Açıklama |
|---|---|---|
| `faculties` | Fakülteler | Üniversite fakülteleri |
| `departments` | Bölümler | Fakültelere bağlı bölümler |
| `semesters` | Dönemler | Akademik dönemler ve takvim |
| `students` | Öğrenciler | Kayıtlı öğrenciler |
| `instructors` | Öğretim Üyeleri | Akademik personel |
| `managers` | Yöneticiler | Rektör, dekan, bölüm başkanı vb. |
| `courses` | Dersler | Ders kataloğu |
| `course_offerings` | Ders Açmaları | Dönem bazında açılan dersler |
| `enrollments` | Ders Kayıtları | Öğrenci ders kayıtları |
| `grades` | Notlar | Öğrenci notları ve harf notları |
| `attendance` | Devamsızlık | Yoklama kayıtları |
| `announcements` | Duyurular | Sistem geneli duyurular |
