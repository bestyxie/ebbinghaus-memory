import { prisma } from './prisma'

/**
 * 根据邮箱查询用户
 */
export async function getUserFromDb(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })
    return user
  } catch (error) {
    return null
  }
}

/**
 * 创建新用户
 */
export async function createUserForDb(email: string, password: string, name?: string) {
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password,
        name: name || null,
      },
    })
    return user
  } catch (error) {
    // 如果是唯一约束冲突（用户已存在），抛出错误以便上层处理
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      throw new Error('用户已存在')
    }
    throw error
  }
}
