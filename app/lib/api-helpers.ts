import { NextResponse, NextRequest } from 'next/server';
import { auth } from './auth';
import { prisma } from './prisma';
import { hashToken } from './token';

/**
 * Require authentication for API routes.
 * Checks Bearer token first (for browser extension / API access),
 * then falls back to session cookie auth.
 * Returns userId if authenticated, or 401 NextResponse if not.
 *
 * Usage:
 * ```ts
 * export async function GET(request: NextRequest) {
 *   const userId = await requireAuth(request)
 *   if (userId instanceof NextResponse) return userId
 *   // use userId...
 * }
 * ```
 */
export async function requireAuth(
  request: NextRequest
): Promise<string | NextResponse<{ error: string }>> {
  const authHeader = request.headers.get('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const rawToken = authHeader.slice(7);
    const tokenHash = hashToken(rawToken);
    const apiToken = await prisma.apiToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true },
    });
    if (!apiToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    if (apiToken.expiresAt && apiToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }
    // Update lastUsedAt non-blocking
    prisma.apiToken
      .update({ where: { id: apiToken.id }, data: { lastUsedAt: new Date() } })
      .catch(() => {});
    return apiToken.userId;
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session.user.id;
}
