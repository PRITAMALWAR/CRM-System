# Environment Variables Setup Guide

## Backend Environment Variables

Create a `.env` file in the `backend` directory with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crm_system
DB_USER=postgres
DB_PASSWORD=postgres

# SSL Configuration (for managed PostgreSQL services like Aiven, AWS RDS, etc.)
# Set DB_SSL=true if your database requires SSL
DB_SSL=true
# Set DB_SSL_REJECT_UNAUTHORIZED=false if using self-signed certificates
DB_SSL_REJECT_UNAUTHORIZED=true

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production_use_random_string
JWT_EXPIRE=7d

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Quick Setup Command:
```bash
cd backend
cp .env.example .env
# Then edit .env with your actual values
```

## Frontend Environment Variables

Create a `.env` file in the `frontend` directory with the following content:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Quick Setup Command:
```bash
cd frontend
cp .env.example .env
# Edit if needed (defaults should work for local development)
```

## Environment Variables Explained

### Backend Variables

- **PORT**: Server port (default: 5000)
- **NODE_ENV**: Environment mode (development/production)
- **DB_HOST**: PostgreSQL host (default: localhost)
- **DB_PORT**: PostgreSQL port (default: 5432)
- **DB_NAME**: Database name (default: crm_system)
- **DB_USER**: PostgreSQL username (default: postgres)
- **DB_PASSWORD**: PostgreSQL password (default: postgres)
- **DB_SSL**: Enable SSL for database connection (true/false, auto-enabled for remote hosts)
- **DB_SSL_REJECT_UNAUTHORIZED**: Reject unauthorized SSL certificates (true/false, default: true)
- **JWT_SECRET**: Secret key for JWT tokens (CHANGE IN PRODUCTION!)
- **JWT_EXPIRE**: JWT token expiration (default: 7d)
- **EMAIL_HOST**: SMTP server host (for email notifications)
- **EMAIL_PORT**: SMTP server port
- **EMAIL_USER**: Email address for sending notifications
- **EMAIL_PASS**: Email password or app password
- **FRONTEND_URL**: Frontend URL for CORS configuration

### Frontend Variables

- **VITE_API_URL**: Backend API URL
- **VITE_SOCKET_URL**: WebSocket server URL

## Production Setup

For production, make sure to:

1. **Change JWT_SECRET** to a strong random string
2. **Update database credentials** to production database
3. **Set NODE_ENV=production**
4. **Configure email credentials** for notifications
5. **Update FRONTEND_URL** to production frontend URL
6. **Update VITE_API_URL** and **VITE_SOCKET_URL** in frontend to production URLs

## Docker Environment

If using Docker, environment variables can be set in `docker-compose.yml` or passed via environment files.

