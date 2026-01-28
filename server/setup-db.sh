# Database Setup Script

echo "Setting up database..."

# Run SQL migration
echo "Running SQL migration..."
psql $DATABASE_URL -f db/users.sql

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

echo "Setup complete! Run 'npm run dev' to start the server."
