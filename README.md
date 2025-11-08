# CRM System - Next-Gen Customer Relationship Management Platform

A modern, scalable CRM platform built with the MERN stack (MongoDB replaced with PostgreSQL) designed for fast-scaling startups. Features real-time insights, automated follow-ups, and collaborative workflows.

## 🚀 Features

- **Authentication & Role Management** - JWT-based authentication with role-based access control (Admin, Manager, Sales Executive)
- **Lead Management** - Complete CRUD operations for leads with ownership tracking and history trail
- **Activity Timeline** - Detailed log of notes, calls, meetings, and status changes per lead
- **Real-time Notifications** - WebSocket-based real-time notifications for updates
- **Email Notifications** - Automated email triggers for important updates
- **Dashboard & Analytics** - Visualize performance metrics using Recharts
- **RESTful API** - Well-structured, versioned API endpoints

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** - Server framework
- **PostgreSQL** - Relational database
- **Sequelize** - ORM for database operations
- **Socket.io** - Real-time WebSocket communication
- **JWT** + **Bcrypt** - Authentication and password hashing
- **Nodemailer** - Email notifications
- **Jest** - Testing framework

### Frontend
- **React 18** - UI library
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Recharts** - Data visualization
- **Socket.io Client** - Real-time updates
- **Vite** - Build tool
- **Axios** - HTTP client

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CRM-System
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

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

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory (optional):

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Database Setup

Make sure PostgreSQL is running and create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE crm_system;

# Exit
\q
```

The database tables will be automatically created when you start the backend server.

### 5. Run the Application

#### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

#### Docker (Production-like)

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

## 📊 Database Schema (ER Diagram)

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    Users    │         │    Leads     │         │  Activities  │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ id (PK)     │◄────┐   │ id (PK)      │◄────┐   │ id (PK)     │
│ name        │     │   │ firstName    │     │   │ type        │
│ email       │     │   │ lastName     │     │   │ title       │
│ password    │     │   │ email        │     │   │ description │
│ role        │     │   │ phone        │     │   │ leadId (FK) │
│ isActive    │     │   │ company      │     │   │ userId (FK) │
│ createdAt   │     │   │ status       │     │   │ metadata    │
│ updatedAt   │     │   │ source       │     │   │ createdAt   │
└─────────────┘     │   │ estimatedValue│    │   │ updatedAt   │
                    │   │ assignedToId │    │   └─────────────┘
                    │   │ (FK)         │    │
                    │   │ createdById  │    │
                    │   │ (FK)         │    │
                    │   │ notes        │    │
                    │   │ createdAt    │    │
                    │   │ updatedAt    │    │
                    │   └─────────────┘    │
                    │                      │
                    │   ┌─────────────┐    │
                    │   │Notifications│    │
                    │   ├─────────────┤    │
                    └───│ id (PK)      │    │
                        │ type        │    │
                        │ title       │    │
                        │ message     │    │
                        │ userId (FK) │────┘
                        │ leadId (FK) │────┐
                        │ isRead      │    │
                        │ metadata    │    │
                        │ createdAt   │    │
                        │ updatedAt   │    │
                        └─────────────┘    │
                                           │
                                           │
                                           └───────┘
```

### Relationships

- **Users** → **Leads** (One-to-Many): Users can create and be assigned multiple leads
- **Users** → **Activities** (One-to-Many): Users can create multiple activities
- **Users** → **Notifications** (One-to-Many): Users receive multiple notifications
- **Leads** → **Activities** (One-to-Many): Leads have multiple activities
- **Leads** → **Notifications** (One-to-Many): Leads can trigger multiple notifications

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Endpoints

#### Authentication

**POST** `/auth/register`
- Register a new user
- Body: `{ name, email, password, role? }`
- Returns: `{ token, user }`

**POST** `/auth/login`
- Login user
- Body: `{ email, password }`
- Returns: `{ token, user }`

**GET** `/auth/me`
- Get current user (Protected)
- Returns: `{ user }`

#### Users

**GET** `/users`
- Get all users (Admin/Manager only)
- Returns: `[User]`

**GET** `/users/:id`
- Get user by ID (Protected)
- Returns: `User`

**PUT** `/users/:id`
- Update user (Protected)
- Body: `{ name?, email?, role? }`
- Returns: `{ message, user }`

**DELETE** `/users/:id`
- Delete user (Admin only)
- Returns: `{ message }`

#### Leads

**GET** `/leads`
- Get all leads with optional filters
- Query params: `status?, assignedTo?, search?`
- Returns: `[Lead]`

**GET** `/leads/:id`
- Get lead by ID with activities
- Returns: `Lead`

**POST** `/leads`
- Create a new lead
- Body: `{ firstName, lastName, email, phone?, company?, status?, source?, estimatedValue?, notes?, assignedToId? }`
- Returns: `Lead`

**PUT** `/leads/:id`
- Update lead
- Body: `{ firstName?, lastName?, email?, phone?, company?, status?, source?, estimatedValue?, notes?, assignedToId? }`
- Returns: `Lead`

**DELETE** `/leads/:id`
- Delete lead (Admin/Manager only)
- Returns: `{ message }`

#### Activities

**GET** `/activities`
- Get all activities (optionally filtered by leadId)
- Query params: `leadId?`
- Returns: `[Activity]`

**POST** `/activities`
- Create a new activity
- Body: `{ type, title, description?, leadId, metadata? }`
- Returns: `Activity`

**PUT** `/activities/:id`
- Update activity
- Body: `{ type?, title?, description?, metadata? }`
- Returns: `Activity`

**DELETE** `/activities/:id`
- Delete activity
- Returns: `{ message }`

#### Dashboard

**GET** `/dashboard/stats`
- Get dashboard statistics
- Returns: `{ totalLeads, leadsByStatus, leadsBySource, totalValue, wonValue, recentActivities, leadsThisMonth, conversionRate, wonLeads }`

**GET** `/dashboard/timeline`
- Get recent activity timeline
- Query params: `limit?` (default: 10)
- Returns: `[Activity]`

**GET** `/dashboard/performance`
- Get team performance metrics (Admin/Manager only)
- Returns: `[{ userId, userName, userEmail, totalLeads, wonLeads, conversionRate, totalValue, wonValue }]`

#### Notifications

**GET** `/notifications`
- Get user notifications
- Query params: `isRead?` (true/false)
- Returns: `[Notification]`

**PUT** `/notifications/:id/read`
- Mark notification as read
- Returns: `{ message, notification }`

**PUT** `/notifications/read-all`
- Mark all notifications as read
- Returns: `{ message }`

### WebSocket Events

**Client → Server:**
- `authenticate` - Authenticate socket connection with userId
- `markNotificationRead` - Mark notification as read

**Server → Client:**
- `notification` - New notification received
- `notifications` - Batch notifications on connection

## 🧪 Testing

Run tests for the backend:

```bash
cd backend
npm test
```

Test coverage is available for the authentication module.

## 🔐 Role-Based Access Control

### Admin
- Full access to all features
- Can manage users (create, update, delete)
- Can view all leads and activities
- Can access team performance metrics

### Manager
- Can view all leads and activities
- Can manage leads assigned to their team
- Can access team performance metrics
- Cannot manage users

### Sales Executive
- Can only view and manage leads assigned to them
- Can create activities for their leads
- Cannot view team performance metrics
- Cannot manage users

## 📁 Project Structure

```
CRM-System/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Lead.js
│   │   ├── Activity.js
│   │   ├── Notification.js
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── leads.js
│   │   ├── activities.js
│   │   ├── dashboard.js
│   │   └── notifications.js
│   ├── services/
│   │   ├── socketService.js
│   │   ├── notificationService.js
│   │   └── emailService.js
│   ├── tests/
│   │   └── auth.test.js
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   ├── leads/
│   │   │   └── activities/
│   │   ├── pages/
│   │   ├── store/
│   │   │   └── slices/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🚢 Deployment

### Environment Variables

Ensure all environment variables are set correctly in your production environment.

### Docker Deployment

1. Build and push Docker images
2. Deploy using `docker-compose.yml`
3. Configure reverse proxy (nginx) for production
4. Set up SSL certificates

### Manual Deployment

1. Build frontend: `cd frontend && npm run build`
2. Serve frontend build with a static file server
3. Run backend with PM2 or similar process manager
4. Configure PostgreSQL connection
5. Set up environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- Masters' Union Assessment Project

## 🙏 Acknowledgments

- Built for Masters' Union assessment
- Uses modern web technologies and best practices
- Designed for scalability and production use

