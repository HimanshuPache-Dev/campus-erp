# 🚀 Deployment Guide - Campus ERP

## How to Clone and Run This Project from GitHub

This guide explains how anyone can download and run this Campus ERP project on their machine.

---

## 📋 Prerequisites

Before you start, make sure you have these installed:

### Required Software
1. **Node.js** (v16 or higher)
   - Download: https://nodejs.org/
   - Check version: `node --version`

2. **npm** (comes with Node.js)
   - Check version: `npm --version`

3. **Git**
   - Download: https://git-scm.com/
   - Check version: `git --version`

4. **Supabase Account** (Free)
   - Sign up: https://supabase.com/

---

## 🔽 Step 1: Clone the Repository

Open your terminal/command prompt and run:

```bash
# Clone the repository
git clone https://github.com/HimanshuPache-Dev/campus-erp.git

# Navigate into the project folder
cd campus-erp
```

You should now see the project structure:
```
campus-erp/
├── frontend/          # React frontend
├── backend/           # Node.js backend
├── README.md          # Project overview
├── START_HERE.md      # Quick start guide
└── ... (other files)
```

---

## 🗄️ Step 2: Setup Supabase Database

### 2.1 Create Supabase Project

1. Go to: https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name**: Campus ERP (or any name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete

### 2.2 Get Your Supabase Credentials

1. In your Supabase project dashboard
2. Click **"Settings"** (gear icon) → **"API"**
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJhbGc...`)
   - **service_role key** (starts with `eyJhbGc...`)

### 2.3 Create Database Tables

1. In Supabase dashboard, click **"SQL Editor"**
2. Click **"New Query"**
3. Open the file: `backend/COMPLETE_DATABASE_SETUP.sql` from the cloned project
4. Copy ALL the SQL code
5. Paste into Supabase SQL Editor
6. Click **"RUN"** (or press Ctrl+Enter)
7. Wait for success message

✅ All 10 database tables are now created!

---

## ⚙️ Step 3: Configure Environment Variables

### 3.1 Backend Configuration

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Create `.env` file:
   ```bash
   # Windows
   copy .env.example .env
   
   # Mac/Linux
   cp .env.example .env
   ```

3. Open `backend/.env` and update with YOUR Supabase credentials:
   ```env
   # Replace with YOUR Supabase credentials
   SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_KEY=your_service_role_key_here
   
   # Server Configuration (keep as is)
   PORT=3000
   NODE_ENV=development
   
   # JWT Secret (you can change this)
   JWT_SECRET=your-secret-key-here
   ADMIN_SECRET_KEY=your-admin-secret
   ```

### 3.2 Frontend Configuration

1. Navigate to frontend folder:
   ```bash
   cd ../frontend
   ```

2. Create `.env` file:
   ```bash
   # Windows
   copy .env.example .env
   
   # Mac/Linux
   cp .env.example .env
   ```

3. Open `frontend/.env` and update:
   ```env
   # Replace with YOUR Supabase credentials
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

---

## 📦 Step 4: Install Dependencies

### 4.1 Install Backend Dependencies

```bash
# Make sure you're in the backend folder
cd backend

# Install all dependencies
npm install
```

This will install:
- Express.js
- Supabase client
- JWT authentication
- And all other backend dependencies

Wait for installation to complete (may take 1-2 minutes).

### 4.2 Install Frontend Dependencies

```bash
# Navigate to frontend folder
cd ../frontend

# Install all dependencies
npm install
```

This will install:
- React
- Vite
- Tailwind CSS
- Framer Motion
- And all other frontend dependencies

Wait for installation to complete (may take 2-3 minutes).

---

## 🎯 Step 5: Run the Application

### 5.1 Start Backend Server

Open a terminal and run:

```bash
# Navigate to backend folder
cd backend

# Start the server
npm start
```

You should see:
```
✅ CampusERP Backend running on http://localhost:3000
📝 Environment: development
```

**Keep this terminal open!**

### 5.2 Start Frontend Server

Open a NEW terminal (keep backend running) and run:

```bash
# Navigate to frontend folder
cd frontend

# Start the development server
npm run dev
```

You should see:
```
VITE v5.4.21  ready in 2090 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Keep this terminal open too!**

---

## 🎉 Step 6: Access the Application

1. Open your web browser
2. Go to: **http://localhost:5173**
3. You'll see the login page

### Test Login Credentials

**Admin Account:**
- Email: `admin@campus.com`
- Password: `admin123`

**Faculty Account:**
- Email: `dr.patil@campus.com`
- Password: `faculty123`

**Student Account:**
- Email: `rahul.sharma@campus.edu`
- Password: `student123`

---

## 📊 Step 7: Add Sample Data (Optional)

If you want to test with sample data:

```bash
# Navigate to backend folder
cd backend

# Run seed script
node src/seed.js
```

This will create:
- 1 Admin user
- 3 Faculty members
- 15 Students
- 10 Courses
- Sample enrollments and assignments

---

## 🔍 Verification Checklist

After setup, verify everything works:

### Backend Verification
- [ ] Backend terminal shows "Server running on http://localhost:3000"
- [ ] No errors in backend terminal
- [ ] Can access: http://localhost:3000/api/health

### Frontend Verification
- [ ] Frontend terminal shows "Local: http://localhost:5173"
- [ ] No errors in frontend terminal
- [ ] Browser opens http://localhost:5173
- [ ] Login page appears

### Database Verification
- [ ] Can login with test credentials
- [ ] Dashboard loads without errors
- [ ] Can navigate between pages
- [ ] Data loads from database

---

## 🐛 Troubleshooting

### Problem: "Port 3000 already in use"

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

Or change the port in `backend/.env`:
```env
PORT=3001
```

### Problem: "Port 5173 already in use"

**Solution:**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:5173 | xargs kill -9
```

### Problem: "Cannot find module"

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Problem: "Database connection failed"

**Solution:**
1. Check `.env` files have correct Supabase credentials
2. Verify Supabase project is active
3. Check internet connection
4. Verify database tables were created

### Problem: "Login fails"

**Solution:**
1. Make sure backend is running
2. Check backend terminal for errors
3. Verify database tables exist in Supabase
4. Run seed script to create test users

### Problem: "npm install fails"

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Try installing again
npm install
```

---

## 📁 Project Structure

```
campus-erp/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── pages/           # All application pages
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context providers
│   │   ├── hooks/           # Custom React hooks
│   │   └── config/          # Configuration files
│   ├── .env                 # Frontend environment variables
│   └── package.json         # Frontend dependencies
│
├── backend/                  # Node.js backend application
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Authentication & validation
│   │   ├── services/        # Database services
│   │   └── config/          # Configuration files
│   ├── .env                 # Backend environment variables
│   ├── package.json         # Backend dependencies
│   └── COMPLETE_DATABASE_SETUP.sql  # Database setup script
│
└── Documentation/            # Project documentation
    ├── README.md            # Project overview
    ├── START_HERE.md        # Quick start guide
    ├── DEPLOYMENT_GUIDE.md  # This file
    └── ... (other docs)
```

---

## 🔐 Security Notes

### For Development
- Default credentials are for testing only
- `.env` files are gitignored (not pushed to GitHub)
- Each user must create their own `.env` files

### For Production
1. Change all default passwords
2. Use strong JWT secrets
3. Enable HTTPS
4. Enable Row Level Security (RLS) in Supabase
5. Add rate limiting
6. Regular security audits

---

## 🌐 Deployment to Production

### Frontend Deployment (Vercel)

1. Push code to GitHub (already done)
2. Go to: https://vercel.com
3. Click **"New Project"**
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Click **"Deploy"**

### Backend Deployment (Railway)

1. Go to: https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
6. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `PORT`
   - `JWT_SECRET`
   - `NODE_ENV=production`
7. Click **"Deploy"**

### Database (Already on Supabase)
- No deployment needed
- Already in production
- Automatic backups
- Scalable infrastructure

---

## 📚 Additional Resources

### Documentation
- **START_HERE.md** - Quick 3-step guide
- **README.md** - Project overview
- **PROJECT_COMPLETE.md** - Complete project details
- **DATABASE_SETUP_GUIDE.md** - Database documentation

### Technology Documentation
- **React**: https://react.dev
- **Vite**: https://vitejs.dev
- **Supabase**: https://supabase.com/docs
- **Express.js**: https://expressjs.com
- **Tailwind CSS**: https://tailwindcss.com

---

## 🎓 What You Get

After following this guide, you'll have:

- ✅ Fully functional Campus ERP system
- ✅ Real-time database integration
- ✅ Modern, responsive UI
- ✅ Secure authentication
- ✅ Complete admin, faculty, and student modules
- ✅ Ready for customization and deployment

---

## 📞 Support

### Common Commands

```bash
# Start backend
cd backend && npm start

# Start frontend
cd frontend && npm run dev

# Install dependencies
npm install

# Run seed script
cd backend && node src/seed.js

# Check git status
git status

# Pull latest changes
git pull origin master
```

### Getting Help

1. Check documentation files
2. Review troubleshooting section
3. Check Supabase logs
4. Review browser console
5. Check backend terminal logs

---

## ✅ Success Checklist

After completing all steps:

- [ ] Repository cloned successfully
- [ ] Supabase project created
- [ ] Database tables created (10 tables)
- [ ] Environment variables configured
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend server running on port 3000
- [ ] Frontend server running on port 5173
- [ ] Can access login page
- [ ] Can login with test credentials
- [ ] Dashboard loads successfully
- [ ] Can navigate between pages

---

## 🎉 Congratulations!

You've successfully set up the Campus ERP system on your machine!

**Next Steps:**
1. Explore all features
2. Customize for your needs
3. Add your institution's data
4. Deploy to production

**Repository**: https://github.com/HimanshuPache-Dev/campus-erp

---

**Version**: 1.0.0  
**Last Updated**: March 15, 2026  
**Status**: ✅ Production Ready

