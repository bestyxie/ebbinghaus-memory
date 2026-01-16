import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getUserFromDb, createUserForDb } from '@/app/lib/db'
import { saltAndHashPassword } from '@/app/lib/password'

export async function GET() {
  try {
    // 测试简单查询
    console.log('Testing database connection...')
    const result = await prisma.user.findMany()
    console.log('Query successful, found users:', result.length)

    // 测试创建用户
    const testEmail = `test-${Date.now()}@test.com`
    const hash = await saltAndHashPassword('testpassword123')
    const newUser = await createUserForDb(testEmail, hash, 'Test User')
    console.log('Created user:', newUser.id, newUser.email)

    // 查询刚创建的用户
    const foundUser = await getUserFromDb(testEmail)
    console.log('Found user:', foundUser?.email)

    return NextResponse.json({
      success: true,
      usersFound: result.length,
      newUser: { id: newUser.id, email: newUser.email },
      foundUser: { id: foundUser?.id, email: foundUser?.email }
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
