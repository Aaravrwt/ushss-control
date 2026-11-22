import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET || 'ushss-dean-control-secret-key-fallback-2026';
const encodedKey = new TextEncoder().encode(SECRET_KEY);
const COOKIE_NAME = 'ushss_dean_session';

export interface SessionPayload {
  userId: number | string;
  username: string;
  role: string;
  fullName: string;
  isDean: boolean;
  expiresAt: Date;
}

export async function encrypt(payload: Omit<SessionPayload, 'expiresAt'>) {
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours
  return new SignJWT({ ...payload, expiresAt })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(userData: {
  userId: number | string;
  username: string;
  role: string;
  fullName: string;
  isDean: boolean;
}) {
  const token = await encrypt(userData);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 8 * 60 * 60, // 8 hours
  });

  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(COOKIE_NAME)?.value;
  if (!sessionToken) return null;
  return await decrypt(sessionToken);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
