// Supabase 免费版保活：项目连续 7 天缺乏「用户数据库查询」会被暂停
// （纯网关/dashboard 流量不算 activity），因此每天跑一次真实查询
// 由 .github/workflows/supabase-keep-alive.yml 调度
import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error("缺少 DATABASE_URL 环境变量")
  process.exit(1)
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

try {
  await prisma.$queryRaw`SELECT 1`

  const [users, decks, cards, reviewLogs] = await Promise.all([
    prisma.user.count(),
    prisma.deck.count(),
    prisma.card.count(),
    prisma.reviewLog.count(),
  ])

  console.log(
    `[keep-alive] ${new Date().toISOString()} 数据库正常：users=${users} decks=${decks} cards=${cards} reviewLogs=${reviewLogs}`,
  )
} catch (error) {
  console.error("[keep-alive] 查询失败：", error)
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
