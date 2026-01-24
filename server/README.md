# PrepForYou Server

Backend API server for PrepForYou application built with Node.js, Express, and PostgreSQL.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the database credentials and other settings

3. **Setup PostgreSQL database:**
   ```bash
   # Create database
   psql -U postgres -c "CREATE DATABASE prepforyou;"
   
   # Run schema
   psql -U postgres -d prepforyou -f database/schema.sql
   ```

4. **Start the server:**
   ```bash
   # Development mode (use `npm start` to run the server locally)
   npm start
   
   # Production mode (run the node process directly)
   npm run prod
   ```

## Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.js  # PostgreSQL connection
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   └── utils/           # Utility functions
├── database/
│   └── schema.sql       # Database schema
├── .env                 # Environment variables (not in git)
├── server.js            # Entry point
└── package.json
```

## API Endpoints

### Health Check
- `GET /` - Server status
- `GET /api/health` - Health check endpoint

### Authentication (Coming Soon)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Notes (Coming Soon)
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `GET /api/notes/:id` - Get note by ID
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

## Testing

```bash
npm test
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment (development/production) | development |
| DATABASE_URL | PostgreSQL connection string | - |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_NAME | Database name | prepforyou |
| DB_USER | Database user | - |
| DB_PASSWORD | Database password | - |
| JWT_SECRET | Secret key for JWT | - |
| JWT_EXPIRES_IN | JWT expiration time | 7d |
| CORS_ORIGINS | Allowed CORS origins | http://localhost:3000 |
