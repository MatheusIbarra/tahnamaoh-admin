import "server-only";

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "tahnamao_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

export interface AdminSession {
  adminId: string;
  email: string;
  createdAt: string;
}

interface AdminSessionClaims extends JWTPayload {
  adminId: string;
  email: string;
  createdAt: string;
}

function resolveSessionSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret) {
    throw new Error("Missing required env ADMIN_SESSION_SECRET");
  }
  return new TextEncoder().encode(secret);
}

async function signSession(session: AdminSession): Promise<string> {
  const claims: AdminSessionClaims = {
    adminId: session.adminId,
    email: session.email,
    createdAt: session.createdAt,
  };

  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(resolveSessionSecret());
}

async function verifySession(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify<AdminSessionClaims>(token, resolveSessionSecret());
    if (
      typeof payload.adminId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.createdAt !== "string"
    ) {
      return null;
    }

    return {
      adminId: payload.adminId,
      email: payload.email,
      createdAt: payload.createdAt,
    };
  } catch {
    return null;
  }
}

export async function setAdminSession(session: AdminSession): Promise<void> {
  const token = await signSession(session);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  return verifySession(token);
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
