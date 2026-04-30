# Contract: Employee API

Definisi aliran data antara frontend dan backend.

## 1. Get All Employees
- **Endpoint**: `/api/employees`
- **Method**: `GET`
- **Query Params**: `q` (search string)
- **Response**:
```json
[
  {
    "id": 1,
    "nik": "WKN001",
    "nama": "Budi Santoso",
    "posisi": "Developer",
    "is_active": 1
  }
]
```

## 2. Create Employee
- **Endpoint**: `/api/employees`
- **Method**: `POST`
- **Body**:
```json
{
  "nik": "WKN002",
  "nama": "Siti Aminah",
  "email": "siti@wijayakn.com",
  "posisi": "Manager",
  "departemen": "HR",
  "gaji_pokok": 15000000,
  "tanggal_masuk": "2026-01-01"
}
```

## 3. Update Employee
- **Endpoint**: `/api/employees/{id}`
- **Method**: `PUT`
- **Body**: (Field yang diubah)

## 4. Delete Employee (Soft Delete)
- **Endpoint**: `/api/employees/{id}`
- **Method**: `DELETE`
