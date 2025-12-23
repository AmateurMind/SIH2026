# 🚀 How to Run Frontend and Backend

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- MongoDB Atlas connection (already configured)

## 📋 Step-by-Step Instructions

### 1. Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campus-placement?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this

# Web3Forms Email Service (Optional but recommended)
WEB3FORMS_KEY=your-web3forms-access-key-here
```

**To get Web3Forms key:**
1. Visit [https://web3forms.com](https://web3forms.com)
2. Sign up for a free account
3. Get your access key from the dashboard
4. Add it to `.env` file

### 3. Start the Backend Server

**Option A: Using npm start (Production mode)**
```bash
cd backend
npm start
```

**Option B: Using nodemon (Development mode with auto-restart)**
```bash
cd backend
npm run dev
```

The backend will run on: **http://localhost:5000**

You should see:
```
🍃 MongoDB Connected: ...
📊 Database: campus-placement
🚀 Server running on port 5000
📍 API available at http://localhost:5000
🏥 Health check at http://localhost:5000/health
```

### 4. Start the Frontend Server

Open a **new terminal window** and run:

```bash
cd frontend
npm start
```

The frontend will run on: **http://localhost:3000**

It will automatically open in your browser.

### 5. Verify Everything is Working

1. **Backend Health Check**: Visit http://localhost:5000/health
   - Should show MongoDB connection status

2. **Frontend**: Visit http://localhost:3000
   - Should show the login page

3. **Test Login**: Use demo credentials:
   - Student: `aarav.sharma@college.edu` / any password
   - Admin: `sunita.mehta@college.edu` / any password

## 🔄 Running Both Servers Simultaneously

### Method 1: Two Terminal Windows (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Method 2: Using npm concurrently (From root)

If you have `concurrently` installed:
```bash
npm run dev
```

This runs both servers at once.

## 🧪 Testing Web3Forms Email Service

1. **Test the email service:**
```bash
cd backend
node test-web3forms.js
```

2. **Test MongoDB connection:**
```bash
cd backend
node test-mongodb-connection.js
```

## 📝 Common Issues & Solutions

### Issue: "Port 5000 already in use"
**Solution**: 
- Kill the process using port 5000, or
- Change PORT in `.env` file to a different port (e.g., 5001)

### Issue: "MongoDB connection failed"
**Solution**:
- Check your `MONGODB_URI` in `.env` file
- Verify MongoDB Atlas cluster is running
- Check IP whitelist in MongoDB Atlas

### Issue: "WEB3FORMS_KEY missing"
**Solution**:
- Add `WEB3FORMS_KEY` to your `.env` file
- Get your key from [web3forms.com](https://web3forms.com)
- This is optional - app will work without it, but emails won't be sent

### Issue: Frontend can't connect to backend
**Solution**:
- Verify backend is running on port 5000
- Check `FRONTEND_URL` in backend `.env`
- Check `proxy` setting in `frontend/package.json`

## 🎯 Quick Start Commands

```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend  
cd frontend && npm start
```

## 📊 Server URLs

- **Backend API**: http://localhost:5000
- **Frontend App**: http://localhost:3000
- **Health Check**: http://localhost:5000/health
- **API Base**: http://localhost:5000/api

## ✅ Verification Checklist

- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] `.env` file created in `backend/` directory
- [ ] MongoDB connection working (check health endpoint)
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] Can access frontend in browser
- [ ] Can login with demo credentials

---

**Need Help?** Check the troubleshooting section or review the logs in your terminal.

