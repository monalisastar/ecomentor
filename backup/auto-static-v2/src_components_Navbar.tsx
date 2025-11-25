'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "react-hot-toast";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<{ label: string; href: string }[]>([]);

  //
  // 🧠 Load static + CMS menu items
  //
  useEffect(() => {
    setMounted(true);
    fetch("/api/menu")
      .then((res) => res.json())
      .then(setMenuItems)
      .catch(() => console.warn("⚠️ Failed to load dynamic menu"));
  }, []);

  //
  // 🧩 Role management
  //
  useEffect(() => {
    const user = session?.user as { role?: "student" | "staff" | "admin" } | undefined;

    if (status === "authenticated" && user?.role) {
      setRole(user.role);
      localStorage.setItem("role", user.role);
    } else {
      const storedRole = localStorage.getItem("role");
      if (storedRole) setRole(storedRole);
    }
  }, [status, session]);

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  const handleLogout = async () => {
    setRole(null);
    localStorage.removeItem("role");
    toast.success("Logged out ✅");
    await signOut({ redirect: false });
    router.push("/login");
  };

  const dashboardHref =
    role === "student"
      ? "/student/dashboard"
      : role === "staff"
      ? "/staff/dashboard"
      : role === "admin"
      ? "/admin/dashboard"
      : "/dashboard";

  const hideNavbarPaths = ["/student", "/staff", "/admin", "/dashboard"];
  if (hideNavbarPaths.some((path) => pathname.startsWith(path))) return null;

  return (
    <nav className="w-full fixed z-50 top-0 left-0 bg-white dark:bg-[#0b0f19] shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:px-8">
        {/* 🌿 Logo */}
        <Link href="/">
          <div className="flex items-center space-x-2">
            <Image src="/eco-mentor-logo.png" alt="Eco-Mentor Logo" width={40} height={40} />
            <span className="font-bold text-xl text-green-600 dark:text-green-400">
              Eco-Mentor
            </span>
          </div>
        </Link>

        {/* 💻 Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6">
          {menuItems.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-medium transition hover:text-green-500 ${
                pathname === link.href
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* ✅ Dashboard or Auth */}
          {status === "authenticated" && role ? (
            <Link
              href={dashboardHref}
              className="text-sm font-medium px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-500"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="ml-4 text-sm font-medium px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Register
              </Link>
            </>
          )}

          {/* 🌗 Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="ml-4 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

          {/* 🚪 Logout */}
          {status === "authenticated" && role && (
            <button
              onClick={handleLogout}
              className="ml-2 text-sm font-medium px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
            >
              Logout
            </button>
          )}
        </div>

        {/* 📱 Mobile Toggle */}
        <button className="md:hidden p-2" onClick={toggleMobile}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 📱 Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-[#0b0f19] px-4 pb-4">
          {menuItems.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block py-2 text-sm font-medium ${
                pathname === link.href
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {status === "authenticated" && role ? (
            <>
              <Link
                href={dashboardHref}
                className="block mt-3 text-sm font-semibold text-green-600"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="mt-2 w-full text-sm font-medium px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block mt-3 text-sm text-gray-700 dark:text-gray-300"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block mt-1 text-sm font-medium px-3 py-2 rounded bg-green-600 text-white"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
