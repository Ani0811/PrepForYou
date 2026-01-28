# User Management Setup Guide

This guide explains how to set up the user authentication and profile management system.

## Database Setup

### 1. Run the SQL migration

```bash
cd server
psql -U your_username -d your_database -f db/users.sql
```

Or connect to your PostgreSQL database and run the contents of `db/users.sql`.

### 2. Generate Prisma Client

```bash
cd server
npx prisma generate
```

### 3. (Optional) Push Prisma schema to database

If you prefer using Prisma migrations:

```bash
cd server
npx prisma db push
```

## Environment Variables

### Server (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/prepforyou?schema=public"
PORT=3001
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### Client (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## API Endpoints

### POST /api/users/signin
Upsert user on sign-in (automatically called when user signs in via Firebase)

**Body:**
```json
{
  "firebaseUid": "firebase_user_id",
  "email": "user@example.com",
  "displayName": "John Doe",
  "avatarUrl": "https://...",
  "avatarProvider": "google"
}
```

### GET /api/users/:firebaseUid
Get user by Firebase UID

### PATCH /api/users/:firebaseUid
Update user profile

**Body:**
```json
{
  "username": "johndoe",
  "avatarUrl": "https://...",
  "avatarStoragePath": "s3://bucket/avatars/...",
  "avatarProvider": "custom"
}
```

### DELETE /api/users/:firebaseUid
Soft delete user (sets isActive to false)

### GET /api/users
Get all users (paginated)

**Query params:** `page`, `limit`, `active`

## Frontend Integration

The frontend automatically syncs users to the backend when they sign in via Firebase:

1. User signs in with Firebase (Google/Email)
2. `onAuthStateChanged` fires in Header component
3. Backend API is called to upsert user in PostgreSQL
4. User data is stored with Firebase UID as the key

### Usage in Components

```typescript
import { upsertUserOnSignIn, getUserByFirebaseUid, updateUserProfile } from '@/lib/userApi';

// Get current user from backend
const user = await getUserByFirebaseUid(firebaseUser.uid);

// Update username
await updateUserProfile(firebaseUser.uid, {
  username: 'newusername',
});

// Update avatar
await updateUserProfile(firebaseUser.uid, {
  avatarUrl: 'https://storage.example.com/avatar.jpg',
  avatarStoragePath: 's3://bucket/avatars/user123.jpg',
  avatarProvider: 'custom',
});
```

## Avatar Upload (TODO)

The `uploadAvatar` function in `userApi.ts` is a placeholder. Implement it with your preferred storage solution:

- **AWS S3**: Use `@aws-sdk/client-s3`
- **Google Cloud Storage**: Use `@google-cloud/storage`
- **Firebase Storage**: Use Firebase Storage SDK
- **Cloudinary**: Use Cloudinary SDK

Example S3 upload flow:
1. Generate presigned URL on backend
2. Upload file from client directly to S3
3. Call `updateUserProfile` with the public URL

## Testing

### Start the server
```bash
cd server
npm run dev
```

### Start the client
```bash
cd client
npm run dev
```

### Test the flow
1. Sign in with Google
2. Check browser console - should see "User upserted in backend"
3. Check PostgreSQL database - user should be created
4. Sign in again - user should be updated with incremented `sign_in_count`

## Database Schema

The `users` table includes:
- `id`: UUID primary key
- `firebase_uid`: Unique Firebase authentication ID
- `email`: Case-insensitive email
- `display_name`: Display name from provider
- `username`: Optional custom username (unique, case-insensitive)
- `avatar_url`: Public avatar URL
- `avatar_storage_path`: Internal storage path
- `avatar_provider`: 'google' | 'custom' | 'none'
- `sign_in_count`: Number of sign-ins
- `last_sign_in_at`: Last sign-in timestamp
- Timestamps: `created_at`, `updated_at`
- `metadata`: JSONB for flexible data
- `is_active`: Soft delete flag
