"use client";

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
    if (status === "loading") return; // Wait for session to load

    // 🚫 No session → login
    if (!session?.user) {
      router.replace("/login");
      return;
    }

    const email = session.user.email?.toLowerCase() || "";
    const roles = (session.user as any).roles || [];
    const primaryRole =
      roles[0] || (session.user as { role?: string }).role || "student";

    // 🚨 Dual-role special accounts → force role selection modal
    if (specialEmails.includes(email)) {
      console.log(`[DashboardRedirect] Dual-role user detected: ${email}`);
      router.replace("/login?force=true");
      return;
    }

    // ⚡ Always enforce admin → /admin/dashboard (no exceptions)
    if (primaryRole === "admin") {
      if (window.location.pathname !== "/admin/dashboard") {
        router.replace("/admin/dashboard");
      }
      return;
    }

    // ✅ Staff and students follow normal routing
    if (["staff", "lecturer"].includes(primaryRole)) {
      if (!window.location.pathname.startsWith("/staff")) {
        router.replace("/staff/dashboard");
      }
    } else {
      if (!window.location.pathname.startsWith("/student")) {
        router.replace("/student/dashboard");
      }
    }
  }, [session, status, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
      <p className="text-lg font-medium">Redirecting to your dashboard...</p>
    </div>
  );
}
