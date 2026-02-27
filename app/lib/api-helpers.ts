import { NextResponse } from 'next/server';
import { auth } from '@/auth';

/**
 * Require authentication for API routes
 * Returns user ID if authenticated, or unauthorized response if not
 *
 * Usage:
 * ```ts
 * export async function GET() {
 *   const userId = await requireAuth<MyResponseType>();
 *   if (userId instanceof NextResponse) return userId;
 *
 *   // Use userId in your logic
 *   const user = await prisma.user.findUnique({ where: { id: userId } });
 *   return NextResponse.json({ user });
 * }
 * ```
 */
export async function requireAuth(): Promise<string | NextResponse<{ error: string }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return session.user.id;
}
