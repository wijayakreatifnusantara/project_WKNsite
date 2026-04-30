# Data Model: Manajemen Karyawan

## Entity: Employee

Mewakili data inti karyawan dalam sistem.

| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PK, AUTOINC | Internal database ID |
| `nik` | TEXT | UNIQUE, NOT NULL | Nomor Induk Karyawan (Pengenal Unik) |
| `nama` | TEXT | NOT NULL | Nama Lengkap |
| `email` | TEXT | - | Alamat Email Perusahaan |
| `posisi` | TEXT | - | Jabatan (misal: Manager, Developer) |
| `departemen` | TEXT | - | Departemen (misal: IT, HR, Finance) |
| `gaji_pokok` | REAL | NOT NULL | Gaji dasar bulanan |
| `tanggal_masuk` | TEXT | - | Format: YYYY-MM-DD |
| `is_active` | INTEGER | DEFAULT 1 | 1 = Aktif, 0 = Dihapus (Soft Delete) |
| `deleted_at` | TEXT | - | Timestamp saat data dinonaktifkan |

## Aturan Validasi
1. **NIK**: Harus unik. Tidak boleh kosong.
2. **Email**: Harus mengikuti format email yang valid jika diisi.
3. **Gaji Pokok**: Harus angka positif.
4. **Nama**: Tidak boleh kosong.
