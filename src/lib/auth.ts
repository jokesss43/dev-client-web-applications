import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export type UserRole = 'guest' | 'user' | 'admin';

export interface AuthUser {
  id: number;
  username: string;
  name: string;
  role: UserRole;
}

export const DEMO_ACCOUNTS: Record<string, AuthUser & { password: string }> = {
  admin: {
    id: 1,
    username: 'admin',
    name: 'Главный Администратор',
    role: 'admin',
    password: 'admin',
  },
  user: {
    id: 2,
    username: 'alex',
    name: 'Алексей Иванов',
    role: 'user',
    password: 'user',
  },
};

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'super-secret-key-for-lab-3-session-management-min32chars'
);

const COOKIE_NAME = 'auth_session';

export async function createSessionToken(user: AuthUser): Promise<string> {
  return await new SignJWT({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      id: Number(payload.id),
      username: String(payload.username),
      name: String(payload.name),
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
