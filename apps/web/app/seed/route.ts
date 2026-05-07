export async function GET() {
  try {
    // Prisma 会自动根据 schema.prisma 创建表结构
    // 这里可以添加一些初始数据，例如创建一个测试用户
    // const testUser = await prisma.user.upsert({
    //   where: { email: 'test@example.com' },
    //   update: {},
    //   create: {
    //     email: 'test@example.com',
    //     password: 'hashed_password_here',
    //     name: 'Test User',
    //   },
    // })
    
    return Response.json({ 
      message: 'Database schema is ready. Run `npx prisma migrate dev` to apply migrations.',
    });
  } catch (error) {
    console.error('Seed error:', error)
    return Response.json({ error: String(error) }, { status: 500 });
  }
}