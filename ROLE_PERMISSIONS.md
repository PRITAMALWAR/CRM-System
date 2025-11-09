# Role-Based Access Control (RBAC) - Complete Permissions Guide

## Role Permissions Summary

### 🔴 Admin - Full Control
- ✅ **Users Management**
  - View all users
  - Create new users
  - Update any user (including role changes)
  - Delete any user (except own account)
  - Change user roles

- ✅ **Leads Management**
  - View all leads
  - Create leads
  - Update any lead
  - Delete any lead
  - Assign leads to anyone
  - Change lead status

- ✅ **Activities Management**
  - View all activities
  - Create activities for any lead
  - Update any activity
  - Delete any activity

- ✅ **Dashboard & Analytics**
  - View all dashboard statistics
  - View team performance metrics
  - Access all analytics

- ✅ **Notifications**
  - View all notifications
  - Manage notifications

### 🟡 Manager - Management Access
- ✅ **Users Management**
  - View all users (except Admin users)
  - Update users (except Admin users)
  - Cannot create users
  - Cannot delete users
  - Cannot change user roles

- ✅ **Leads Management**
  - View all leads
  - Create leads
  - Update any lead
  - Delete any lead
  - Assign leads to anyone
  - Change lead status

- ✅ **Activities Management**
  - View all activities
  - Create activities for any lead
  - Update any activity
  - Delete any activity

- ✅ **Dashboard & Analytics**
  - View all dashboard statistics
  - View team performance metrics
  - Access all analytics

- ✅ **Notifications**
  - View all notifications

### 🟢 Sales Executive - Limited Access
- ✅ **Users Management**
  - View own profile only
  - Update own profile only
  - Cannot view other users
  - Cannot create/delete users

- ✅ **Leads Management**
  - View only assigned leads
  - Create leads (assigned to self by default)
  - Update only assigned leads
  - Delete only assigned leads
  - Cannot assign leads to others
  - Can change status of assigned leads

- ✅ **Activities Management**
  - View activities for assigned leads only
  - Create activities for assigned leads only
  - Update own activities only
  - Delete own activities only

- ✅ **Dashboard & Analytics**
  - View own dashboard statistics only
  - Cannot view team performance
  - Limited analytics

- ✅ **Notifications**
  - View own notifications only

## Detailed Permissions Matrix

| Feature | Admin | Manager | Sales Executive |
|---------|-------|---------|----------------|
| **View All Users** | ✅ | ✅ (except Admin) | ❌ (own only) |
| **Create Users** | ✅ | ❌ | ❌ |
| **Update Users** | ✅ (anyone) | ✅ (except Admin) | ✅ (own only) |
| **Delete Users** | ✅ (anyone) | ❌ | ❌ |
| **Change User Roles** | ✅ | ❌ | ❌ |
| **View All Leads** | ✅ | ✅ | ❌ (assigned only) |
| **Create Leads** | ✅ | ✅ | ✅ |
| **Update Leads** | ✅ (any) | ✅ (any) | ✅ (assigned only) |
| **Delete Leads** | ✅ (any) | ✅ (any) | ✅ (assigned only) |
| **Assign Leads** | ✅ | ✅ | ❌ |
| **View All Activities** | ✅ | ✅ | ❌ (assigned leads only) |
| **Create Activities** | ✅ (any lead) | ✅ (any lead) | ✅ (assigned leads only) |
| **Update Activities** | ✅ (any) | ✅ (any) | ✅ (own only) |
| **Delete Activities** | ✅ (any) | ✅ (any) | ✅ (own only) |
| **View Team Performance** | ✅ | ✅ | ❌ |
| **View All Dashboard Stats** | ✅ | ✅ | ❌ (own only) |

## API Endpoint Access

### Users Endpoints

| Endpoint | Method | Admin | Manager | Sales Executive |
|----------|--------|-------|---------|----------------|
| `/api/users` | GET | ✅ All | ✅ All (except Admin) | ✅ Own only |
| `/api/users` | POST | ✅ | ❌ | ❌ |
| `/api/users/:id` | GET | ✅ Any | ✅ Any (except Admin) | ✅ Own only |
| `/api/users/:id` | PUT | ✅ Any | ✅ Any (except Admin) | ✅ Own only |
| `/api/users/:id` | DELETE | ✅ Any | ❌ | ❌ |

### Leads Endpoints

| Endpoint | Method | Admin | Manager | Sales Executive |
|----------|--------|-------|---------|----------------|
| `/api/leads` | GET | ✅ All | ✅ All | ✅ Assigned only |
| `/api/leads` | POST | ✅ | ✅ | ✅ |
| `/api/leads/:id` | GET | ✅ Any | ✅ Any | ✅ Assigned only |
| `/api/leads/:id` | PUT | ✅ Any | ✅ Any | ✅ Assigned only |
| `/api/leads/:id` | DELETE | ✅ Any | ✅ Any | ✅ Assigned only |

### Activities Endpoints

| Endpoint | Method | Admin | Manager | Sales Executive |
|----------|--------|-------|---------|----------------|
| `/api/activities` | GET | ✅ All | ✅ All | ✅ Assigned leads only |
| `/api/activities` | POST | ✅ Any lead | ✅ Any lead | ✅ Assigned leads only |
| `/api/activities/:id` | PUT | ✅ Any | ✅ Any | ✅ Own only |
| `/api/activities/:id` | DELETE | ✅ Any | ✅ Any | ✅ Own only |

### Dashboard Endpoints

| Endpoint | Method | Admin | Manager | Sales Executive |
|----------|--------|-------|---------|----------------|
| `/api/dashboard/stats` | GET | ✅ All | ✅ All | ✅ Own only |
| `/api/dashboard/timeline` | GET | ✅ All | ✅ All | ✅ Own only |
| `/api/dashboard/performance` | GET | ✅ | ✅ | ❌ |

## Security Rules

1. **Admin Protection**
   - Managers cannot view, update, or delete Admin users
   - Only Admin can change user roles
   - Only Admin can create new users

2. **Lead Assignment**
   - Sales Executives can only see and manage their assigned leads
   - Admin and Manager can see and manage all leads
   - Sales Executives cannot assign leads to others

3. **Activity Restrictions**
   - Sales Executives can only add activities to their assigned leads
   - Sales Executives can only update/delete their own activities
   - Admin and Manager have full access

4. **Self-Protection**
   - Users cannot delete their own account
   - Users can always update their own profile

## Implementation Notes

- All permissions are enforced at the API level
- Frontend should also implement UI restrictions based on roles
- Role checks are performed in route handlers
- Middleware `authorize()` is used for role-based route protection

