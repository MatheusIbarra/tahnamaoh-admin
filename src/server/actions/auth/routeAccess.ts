import "server-only";

import { redirect } from "next/navigation";

import { getAdminSession } from "@/server/auth/adminSession";

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session || !session.accessToken) {
    redirect("/login");
  }
  return session;
}
