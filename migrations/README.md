# Database Migrations (Supabase)

Jalankan file SQL di **Supabase Dashboard → SQL Editor** (satu file per eksekusi).

| File | Deskripsi |
|------|-----------|
| `001_create_positions_table.sql` | Tabel `positions`, index, RLS, trigger `updated_at` |

## Verifikasi & seed data (tanpa SQL Editor)

```bash
node scratch/run_positions_migration.js
```

Atau via API (server harus berjalan):

```bash
POST http://localhost:8000/api/organizations/migrate-positions
POST http://localhost:8000/api/organizations/migrate-employees
```
