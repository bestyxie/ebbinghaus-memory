import "dotenv/config";
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`

// Prisma Client 单例模式，避免在开发环境中创建多个实例
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const adapter = new PrismaPg({ connectionString });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter })
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
// if (process.env.NODE_ENV !== 'production') {
//   // 在开发环境中，确保只有一个 Prisma Client 实例
//   if (globalForPrisma.prisma !== prisma) {
//     // 如果存在旧的实例，先断开连接
//     if (globalForPrisma.prisma) {
//       globalForPrisma.prisma.$disconnect().catch(console.error)
//     }
//     globalForPrisma.prisma = prisma
//   }
// }
