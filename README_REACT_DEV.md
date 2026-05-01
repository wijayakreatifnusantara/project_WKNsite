# project_WKNsite - React Development Server

## 🚀 Cara Menjalankan React Development Server

### Method 1: Using Batch File (Recommended)
```bash
# Double-click file ini di Windows Explorer
start_react_dev.bat
```

### Method 2: Manual Commands
```bash
# Buka terminal/CMD/PowerShell
cd e:\project_WKNsite\apps\client
npm run dev
```

### Method 3: From Root Directory
```bash
# Di root project directory
cd apps\client
npm run dev
```

## 📱 Access Points

Setelah server berjalan, buka:
- **Frontend:** http://localhost:5173
- **API Backend:** http://localhost:8000 (jika running)

## 🔧 Troubleshooting

### Issue: Port Already in Use
```bash
# Kill process yang menggunakan port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Atau gunakan port lain
npm run dev -- --port 5174
```

### Issue: Dependencies Missing
```bash
# Install ulang dependencies
cd apps\client
npm install
```

### Issue: Build Errors
```bash
# Clear cache dan rebuild
cd apps\client
rmdir /s node_modules\.cache
npm run dev
```

## 📊 Features yang Tersedia

### Login Page
- ✅ Modern React components
- ✅ TailwindCSS styling
- ✅ Connection status indicator
- ✅ Form validation
- ✅ FastAPI integration

### Dashboard
- ✅ Employee management
- ✅ Attendance tracking
- ✅ Real-time data
- ✅ Responsive design

## 🎯 Testing Credentials

Untuk testing login:
- **Email:** admin@wijayakn.com
- **Password:** admin

## 📝 Development Notes

- React 18.2.0 dengan hooks
- Vite sebagai build tool
- TailwindCSS untuk styling
- Radix UI untuk components
- Axios untuk API calls

Server akan auto-reload saat ada perubahan file.

## 🏷️ Project Information

- **Project Name:** project_WKNsite
- **Client Package:** project-wknsite-client
- **Version:** 2.4.0
- **Author:** Wijaya Kreatif Nusantara
