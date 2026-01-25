import pkg from '@prisma/client'

const PrismaClientImpl = (pkg as any).PrismaClient ?? pkg

declare global {
	// eslint-disable-next-line no-var
	var prisma: any | undefined
}

export const prisma = global.prisma ?? new (PrismaClientImpl as any)()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma

