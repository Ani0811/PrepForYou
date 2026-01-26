import 'dotenv/config'
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Ensure DATABASE_URL is loaded before creating pool
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables')
}

// Prisma 7.x requires adapter for database connections
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

const clientOptions: Prisma.PrismaClientOptions = {
  adapter,
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn']
}

export const prisma = globalThis.prisma ?? new PrismaClient(clientOptions)

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

export default prisma
