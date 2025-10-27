"use server";

import { cookies } from "next/headers";

export async function setRoleCookie(role: string) {
  const cookieStore = await cookies(); // ✅ await the promise
  cookieStore.set("eco_mentor_role", role, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}
