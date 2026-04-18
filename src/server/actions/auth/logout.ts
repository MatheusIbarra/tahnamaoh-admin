"use server";

import { redirect } from "next/navigation";

import { clearAdminSession } from "@/server/auth/adminSession";

export async function logoutAction(): Promise<void> {
  await clearAdminSession();
  redirect("/login");
}
