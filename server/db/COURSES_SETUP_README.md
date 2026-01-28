# Course Database Setup

This document explains how to set up the course tables in your PostgreSQL database.

## Prerequisites

- PostgreSQL 12+ installed and running
- Database created (see main `USER_SETUP_README.md` if not done)
- Users table already created from `users.sql`

## Quick Setup

```bash
# Run from the server directory
psql -U your_username -d your_database_name -f db/courses.sql
```

## What Gets Created

### Tables

1. **courses** - Main course catalog
   - Course metadata (title, description, category)
   - Duration and difficulty level
   - Tags for filtering
   - Soft delete support (is_active)

2. **course_progress** - User progress tracking
   - Links users to courses
   - Tracks progress percentage (0-100)
   - Status tracking (not-started, in-progress, completed)
   - Timestamps for started/completed/last accessed

### Automatic Features

- **Updated timestamps**: Automatically updates `updated_at` on record changes
- **Started tracking**: Automatically sets `started_at` when progress begins
- **Completed tracking**: Automatically sets `completed_at` and progress to 100% when completed
- **Cascading deletes**: Deleting a user or course removes associated progress records

## Seeding Sample Data

After creating tables, seed with sample courses:

```bash
cd server
npx tsx prisma/seed.ts
```

This will create 12 sample courses across various categories:
- Programming (JavaScript, React, Node.js, TypeScript)
- Computer Science (Data Structures & Algorithms)
- Database (SQL)
- Tools (Git & GitHub)
- Cloud (AWS)
- DevOps (Docker & Kubernetes)
- Data Science (Python)
- AI & ML (Machine Learning)
- Design (UI/UX)

## API Endpoints

Once set up, these endpoints become available:

```
GET    /api/courses                           # Get all courses
GET    /api/courses/user/:firebaseUid         # Get courses with user progress
GET    /api/courses/recommended/:firebaseUid  # Get recommended courses
GET    /api/courses/:courseId                 # Get specific course
POST   /api/courses                           # Create new course
PATCH  /api/courses/:courseId/progress/:uid   # Update user progress
```

## Prisma Integration

The schema is designed to match the Prisma schema:

```prisma
model Course {
  id          String   @id @default(dbgenerated("gen_random_uuid()"))
  title       String
  description String
  category    String
  // ... other fields
  courseProgress CourseProgress[]
}

model CourseProgress {
  id         String   @id @default(dbgenerated("gen_random_uuid()"))
  userId     String
  courseId   String
  progress   Int      @default(0)
  status     String   @default("not-started")
  // ... other fields
}
```

After running the SQL, regenerate Prisma client:

```bash
npx prisma generate
```

## Verification

Check tables were created:

```sql
-- List all tables
\dt

-- Check courses table structure
\d courses

-- Check course_progress table structure
\d course_progress

-- Verify indexes
\di courses*
\di course_progress*
```

## Troubleshooting

**Error: relation "users" does not exist**
- Run `users.sql` first

**Error: function gen_random_uuid() does not exist**
- Run `CREATE EXTENSION IF NOT EXISTS pgcrypto;` first

**Error: permission denied**
- Make sure your PostgreSQL user has CREATE privileges
