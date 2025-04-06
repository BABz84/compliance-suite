import { PrismaClient } from '@prisma/client'

// Use PrismaClient with global caching to prevent multiple instances during hot reloads
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function testConnection() {
  try {
    await prisma.$connect()
    console.log('Database connection established')
    return true
  } catch (error) {
    console.error('Unable to connect to the database:', error)
    return false
  }
}

export default prisma 