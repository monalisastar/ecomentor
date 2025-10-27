'use client'

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "react-hot-toast";
import Image from "next/image";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about-us" },
  { name: "Courses", href: "/courses" },
  { name: "FAQ", href: "/faq" },
  { name: "Shop", href: "/shop" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    // ✅ Priority 1: get role from session
    const user = session?.user as { role?: "student" | "staff" | "admin" } | undefined;

    if (status === "authenticated" && user?.role) {
      setRole(user.role);
      localStorage.setItem("role", user.role);
    } 
    // ✅ Priority 2: fallback to localStorage (bypass mode)
    else {
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

  // ✅ Role-based dashboard link
  const dashboardHref =
    role === "student"
      ? "/student/dashboard"
      : role === "staff"
      ? "/staff/dashboard"
      : role === "admin"
      ? "/admin/dashboard"
      : "/dashboard";

  // ✅ Hide navbar on all dashboard-related routes
  const hideNavbarPaths = [
    "/student",
    "/staff",
    "/admin",
    "/dashboard",
  ];

  if (hideNavbarPaths.some((path) => pathname.startsWith(path))) return null;

  return (
    <nav className="w-full fixed z-50 top-0 left-0 bg-white dark:bg-[#0b0f19] shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:px-8">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center space-x-2">
            <Image
              src="/eco-mentor-logo.png"
              alt="Eco-Mentor Logo"
              width={40}
              height={40}
            />
            <span className="font-bold text-xl text-green-600 dark:text-green-400">
              Eco-Mentor
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-medium transition hover:text-green-500 ${
                pathname === link.href
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* ✅ Dashboard or Login/Register */}
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

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="ml-4 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

          {/* Logout */}
          {status === "authenticated" && role && (
            <button
              onClick={handleLogout}
              className="ml-2 text-sm font-medium px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2" onClick={toggleMobile}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-[#0b0f19] px-4 pb-4">
          {navLinks.map((link) => (
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
              {link.name}
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
