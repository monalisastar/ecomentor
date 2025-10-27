'use client';

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const specialEmails = [
  "njatabrian648@gmail.com",
  "virginia.njata@gmail.com",
  "trizer.trio56@gmail.com",
];

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Wait until session loads

    // 🔒 No user → login
    if (!session?.user) {
      router.replace("/login");
      return;
    }

    const email = session.user.email?.toLowerCase();
    const role =
      (session.user as { role?: "student" | "staff" | "admin" }).role ||
      localStorage.getItem("role") ||
      "student";

    // 🚨 Special emails — force role modal
    if (email && specialEmails.includes(email)) {
      console.log("[DashboardRedirect] Special email detected:", email);
      router.replace("/login?force=true");
      return;
    }

    // ✅ Role-based redirect logic
    let targetRoute = "/";
    if (role === "student") targetRoute = "/student/dashboard";
    else if (role === "staff") targetRoute = "/staff";
    else if (role === "admin") targetRoute = "/admin";

    console.log(`[DashboardRedirect] Redirecting ${email} → ${targetRoute}`);
    router.replace(targetRoute);
  }, [session, status, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
      <p className="text-lg font-medium">Redirecting to your dashboard...</p>
    </div>
  );
}
