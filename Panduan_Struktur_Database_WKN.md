# Panduan Struktur Database (Google Spreadsheet) WKNsite

Untuk memastikan website dan Google Apps Script (GAS) dapat berkomunikasi dengan lancar tanpa *error*, pastikan Anda memiliki **5 Sheet** di dalam Spreadsheet Anda dengan nama dan susunan **Header (Baris 1)** yang **PERSIS SAMA** seperti di bawah ini (perhatikan huruf besar/kecil dan spasi).

---

### 1. Sheet: `admin_accounts`
Berfungsi untuk menyimpan data pengguna yang bisa login ke website.

| Kolom A | Kolom B | Kolom C | Kolom D | Kolom E | Kolom F |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Username** | **Password** | **Role** | **Status** | **Full Name** | **Employee ID** |
| adminkomang | 12345 | Super Admin | Active | Komang | WKN-001 |
| hrd1 | pass123 | HRD | Active | Budi Staff HR | WKN-002 |

---

### 2. Sheet: `Employee_Data`
Berfungsi untuk menyimpan data lengkap profil dan gaji karyawan.

| Kolom | Nama Header (Baris 1) | Contoh Isi / Keterangan |
| :--- | :--- | :--- |
| **A** | **EMPLOYEE ID** | WKN-001 |
| **B** | **EMPLOYEE NAME** | Budi Santoso |
| **C** | **EMAIL** | budi@wijayakn.com |
| **D** | **PHONE NUMBER** | 08123456789 |
| **E** | **WHATSAPP NUMBER** | 08123456789 |
| **F** | **GENDER** | Laki-laki |
| **G** | **DATE OF BIRTH** | 12/05/1990 |
| **H** | **MARITAL STATUS** | Married |
| **I** | **NATIONAL ID (NIK)** | 3201234567890001 |
| **J** | **ADDRESS** | Jl. Raya No. 123, Jakarta |
| **K** | **Emergency Contact 1 (Name)** | Siti Aminah |
| **L** | **Emergency Contact 1 (Relationship)** | Istri |
| **M** | **Emergency Contact 1 (Phone)** | 08123456789 |
| **N** | **Emergency Contact 2 (Name)** | Ahmad Fauzi |
| **O** | **Emergency Contact 2 (Relationship)** | Ayah |
| **P** | **Emergency Contact 2 (Phone)** | 08987654321 |
| **Q** | **Organization Name \*** | IT Department |
| **R** | **Job Position \*** | Senior Developer |
| **S** | **Job Level \*** | Senior |
| **T** | **Status \*** | Active |
| **U** | **Gaji Pokok \*** | 10000000 |
| **V** | **Position Allowance** | 1000000 |
| **W** | **Communication Allowance** | 200000 |
| **X** | **Meal Allowance** | 50000 |
| **Y** | **Transport Allowance** | 30000 |
| **Z** | **JOIN DATE** | 01/01/2023 |
| **AA** | **PTKP Status** | TK/0 |
| **AB** | **BPJS Ketenagakerjaan** | Aktif |
| **AC** | **BPJS Kesehatan** | Aktif |
| **AD** | **NPWP** | 12.345.678.9-012.000 |
| **AE** | **Bank Name** | BCA |
| **AF** | **Bank Account** | 1234567890 |
| **AG** | **Bank Account Holder** | Budi Santoso |
| **AH** | **KTP Document (Link)** | Link Google Drive |
| **AI** | **NPWP Document (Link)** | Link Google Drive |
| **AJ** | **KK Document (Link)** | Link Google Drive |
| **AK** | **Contract Document (Link)** | Link Google Drive |
| **AL** | **CV Document (Link)** | Link Google Drive |
| **AM** | **Bank Book Document (Link)** | Link Foto |
| **AN** | **SIM A Document (Link)** | Link Foto |
| **AO** | **SIM C Document (Link)** | Link Foto |
| **AP** | **Contract End Date** | 31/12/2026 (Untuk Notifikasi) |
| **AQ** | **Resign Date** | 01/01/2025 (Jika sudah resign) |
| **AR** | **Profile Photo (Base64)** | (Otomatis) |

---

### 3. Sheet: `Mutation_History`
Berfungsi untuk mencatat setiap perubahan jabatan, divisi, atau kenaikan level karyawan.

| Kolom | Nama Header (Baris 1) | Contoh Isi / Keterangan |
| :--- | :--- | :--- |
| **A** | **Timestamp** | 29/04/2026 08:00:00 |
| **B** | **EMPLOYEE ID** | WKN-001 |
| **C** | **EMPLOYEE NAME** | Budi Santoso |
| **D** | **MUTATION TYPE** | Promotion / Mutation / Salary Change |
| **E** | **OLD DEPT** | IT Support |
| **F** | **NEW DEPT** | IT Infrastructure |
| **G** | **OLD POSITION** | Junior Staff |
| **H** | **NEW POSITION** | Senior Staff |
| **I** | **OLD LEVEL** | Junior |
| **J** | **NEW LEVEL** | Senior |
| **K** | **EFFECTIVE DATE** | 01/05/2026 |
| **L** | **DESCRIPTION** | Lolos evaluasi tahunan dengan nilai A |

---

### 4. Sheet: `Attendance_Data`
Berfungsi untuk mencatat log absensi harian karyawan.

| Kolom A | Kolom B | Kolom C | Kolom D | Kolom E | Kolom F |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Timestamp** | **Employee ID** | **Location** | **Address** | **Notes** | **Photo** |
| 2026-04-29 08:00 | WKN-001 | -6.21, 106.81 | Jl. Sudirman | Masuk Kantor | (Base64) |

---

### 5. Sheet: `System_Logs`
Berfungsi untuk mencatat setiap aktivitas yang dilakukan di dashboard (Audit Trail).

| Kolom A | Kolom B | Kolom C | Kolom D |
| :--- | :--- | :--- | :--- |
| **Timestamp** | **Admin** | **Action** | **Detail** |
| 2026-04-29 07:45 | Admin System | LOGIN | Berhasil masuk ke dashboard |

---

### 6. Sheet: `system_roles`
Daftar role dan hak akses (Opsional untuk pengembangan lanjut).

| Kolom A | Kolom B |
| :--- | :--- |
| **Role Name** | **Permissions** |
| Super Admin | ALL |
| HRD | CRUD_EMPLOYEE, VIEW_SALARY |

---

> [!TIP]
> **PENTING:** Nama Sheet harus tepat sama (termasuk huruf kapital). Jika Anda ingin menambahkan data baru dalam jumlah banyak, sangat disarankan menggunakan fitur **Impor Excel** dan menekan tombol **"Download Template"** terlebih dahulu agar formatnya tidak meleset.
