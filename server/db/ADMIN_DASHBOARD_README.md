# Admin Dashboard Setup Guide

This document explains the admin dashboard backend structure and setup process.

## Database Schema

### Admin Dashboard SQL (`admin_dashboard.sql`)
Contains:
- Additional columns for courses table:
  - `enrollment_count` - Cached count of enrollments
  - `is_published` - Whether course is visible to users
- Database functions for admin analytics:
  - `get_dashboard_stats()` - Aggregated platform statistics
  - `get_user_activity_summary()` - User engagement metrics
  - `get_course_performance_metrics()` - Course analytics
- Automatic triggers to maintain enrollment counts
- Indexes for optimized admin queries

### Prisma Schema Updates
Added to Course model:
- `enrollmentCount` - Tracks total enrollments
- `isPublished` - Controls course visibility

Added to User model:
- Index on `role` field for faster admin queries

## Backend Structure

### Controller: `admin.controller.ts`
Endpoints:
1. **getDashboardStats** - `/api/admin/stats` (GET)
   - Returns aggregated statistics (users, courses, enrollments, etc.)

2. **getAllUsersWithStats** - `/api/admin/users` (GET)
   - Returns all users with enrollment and completion counts
   - Supports pagination

3. **getAllCoursesWithMetrics** - `/api/admin/courses` (GET)
   - Returns courses with performance metrics (completion rate, avg progress, etc.)

4. **updateUserRole** - `/api/admin/users/:userId/role` (PATCH)
   - Change user role (owner can change to admin/user)
   - Protects owner role from changes

5. **toggleCoursePublished** - `/api/admin/courses/:courseId/publish` (PATCH)
   - Publish/unpublish courses

6. **deactivateUser** - `/api/admin/users/:userId` (DELETE)
   - Soft delete users (cannot delete owner)

7. **getActivityLogs** - `/api/admin/activity` (GET)
   - Recent user activity (course progress updates)

### Routes: `admin.routes.ts`
All admin endpoints under `/api/admin/*`

### Integration: `index.ts`
Admin routes registered at `/api/admin`

## Setup Instructions

### 1. Apply Database Schema
```bash
cd c:\GitHub\PrepForYou\server

# Apply admin dashboard SQL
psql -U your_user -d your_database -f db/admin_dashboard.sql

# Or use the SQL file in your database client
```

### 2. Update Prisma
```bash
# Push schema changes to database
npx prisma db push

# Regenerate Prisma client
npx prisma generate
```

### 3. Restart Server
```bash
# Stop current server (Ctrl+C)
# Start server
npm run dev
```

## API Usage Examples

### Get Dashboard Stats
```bash
GET http://localhost:3001/api/admin/stats
```

Response:
```json
{
  "success": true,
  "stats": {
    "totalUsers": 10,
    "totalCourses": 12,
    "publishedCourses": 8,
    "totalEnrollments": 45,
    "activeEnrollments": 23,
    "completedEnrollments": 12,
    "adminCount": 2,
    "ownerCount": 1
  }
}
```

### Get All Users with Stats
```bash
GET http://localhost:3001/api/admin/users?page=1&limit=50
```

### Update User Role
```bash
PATCH http://localhost:3001/api/admin/users/{userId}/role
Content-Type: application/json

{
  "role": "admin"
}
```

### Toggle Course Published
```bash
PATCH http://localhost:3001/api/admin/courses/{courseId}/publish
Content-Type: application/json

{
  "isPublished": true
}
```

## Frontend Integration

The admin dashboard page (`AdminDashboardPage.tsx`) now calls these endpoints:
- `/api/admin/stats` - For stats cards
- `/api/admin/users` - For user management table
- `/api/admin/courses` - For course management

## Security Notes

⚠️ **TODO**: Add authentication middleware to verify:
1. User is logged in
2. User has admin or owner role

Example middleware (to be implemented):
```typescript
// middleware/requireAdmin.ts
export const requireAdmin = async (req, res, next) => {
  // Verify Firebase token
  // Check user role from database
  // Allow only if role === 'owner' or 'admin'
};
```

Apply to all admin routes:
```typescript
router.use(requireAdmin); // Add this to admin.routes.ts
```

## Database Functions

You can call these directly from SQL:
```sql
-- Get dashboard stats
SELECT * FROM get_dashboard_stats();

-- Get user activity
SELECT * FROM get_user_activity_summary();

-- Get course metrics
SELECT * FROM get_course_performance_metrics();
```
