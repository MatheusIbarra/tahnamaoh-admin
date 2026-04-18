"use server";

import { redirect } from "next/navigation";

import { setAdminSession } from "@/server/auth/adminSession";

function resolveCredentials() {
  const email = process.env.ADMIN_DEV_EMAIL?.trim();
  const password = process.env.ADMIN_DEV_PASSWORD?.trim();
  const adminId = process.env.ADMIN_DEFAULT_ID?.trim();

  if (!email || !password || !adminId) {
    throw new Error(
      "Missing required envs ADMIN_DEV_EMAIL, ADMIN_DEV_PASSWORD and ADMIN_DEFAULT_ID for admin login placeholder.",
    );
  }

  return { email: email.toLowerCase(), password, adminId };
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "").trim();

  const expected = resolveCredentials();

  if (email !== expected.email || password !== expected.password) {
    redirect("/login?error=invalid_credentials");
  }

  await setAdminSession({
    adminId: expected.adminId,
    email,
    createdAt: new Date().toISOString(),
  });

  redirect("/dashboard");
}
