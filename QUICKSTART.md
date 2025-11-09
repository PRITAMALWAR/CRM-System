# Quick Start Guide

## Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

## Quick Setup (5 minutes)

### 1. Database Setup
```bash
# Start PostgreSQL (if not running)
# Create database
psql -U postgres
CREATE DATABASE crm_system;
\q
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Test Accounts

After starting the application, register a new account or use these test credentials:

**Admin Account:**
- Email: admin@crm.com
- Password: admin123
- Role: Admin

**Manager Account:**
- Email: manager@crm.com
- Password: manager123
- Role: Manager

**Sales Executive:**
- Email: sales@crm.com
- Password: sales123
- Role: Sales Executive

## Docker Quick Start

```bash
# Build and start all services
docker-compose up --build

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

## Features to Test

1. **Authentication**
   - Register a new account
   - Login with credentials
   - Test protected routes

2. **Lead Management**
   - Create a new lead
   - View all leads
   - Update lead status
   - Assign lead to user
   - Delete lead (Admin/Manager only)

3. **Activity Timeline**
   - Add activity to a lead
   - View activity timeline
   - Filter activities by type

4. **Dashboard**
   - View statistics
   - Check charts (Leads by Status, Leads by Source)
   - View recent activities
   - Check team performance (Admin/Manager only)

5. **Real-time Notifications**
   - Assign a lead to another user
   - Change lead status
   - Add activity to a lead
   - Check notifications in real-time

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists

### Port Already in Use
- Change PORT in backend `.env`
- Change port in frontend `vite.config.js`

### Socket.io Connection Issues
- Ensure backend is running
- Check CORS settings
- Verify FRONTEND_URL in backend `.env`

## Next Steps

1. Configure email notifications (optional)
2. Set up production environment variables
3. Deploy to production
4. Set up CI/CD pipeline

