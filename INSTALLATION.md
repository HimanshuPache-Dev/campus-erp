# 📦 Installation Guide - Campus ERP

## Quick Installation Steps

### Prerequisites
- Node.js (v16+): https://nodejs.org/
- Git: https://git-scm.com/
- Supabase Account: https://supabase.com/

---

## 🚀 Installation (5 Steps)

### Step 1: Clone Repository
```bash
git clone https://github.com/HimanshuPache-Dev/campus-erp.git
cd campus-erp
```

### Step 2: Setup Supabase Database
1. Create project at https://supabase.com/dashboard
2. Go to SQL Editor → New Query
3. Copy & run: `backend/COMPLETE_DATABASE_SETUP.sql`
4. Get your credentials from Settings → API

### Step 3: Configure Environment Variables

**Backend** (`backend/.env`):
```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
ADMIN_SECRET_KEY=your-admin-secret
```

**Frontend** (`frontend/.env`):
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Step 4: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### Step 5: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## ✅ Access Application

Open browser: **http://localhost:5173**

**Login Credentials:**
- Admin: `admin@campus.com` / `admin123`
- Faculty: `dr.patil@campus.com` / `faculty123`
- Student: `rahul.sharma@campus.edu` / `student123`

---

## 📝 Optional: Add Sample Data

```bash
cd backend
node src/seed.js
```

---

## 🐛 Common Issues

**Port in use:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

**Module not found:**
```bash
rm -rf node_modules
npm install
```

**Database connection fails:**
- Check `.env` credentials
- Verify Supabase project is active
- Ensure database tables are created

---

## 📚 More Help

- **DEPLOYMENT_GUIDE.md** - Detailed installation guide
- **START_HERE.md** - Quick start guide
- **README.md** - Project overview

---

**Repository**: https://github.com/HimanshuPache-Dev/campus-erp

