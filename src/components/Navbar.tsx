"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Menu, X, Moon, Sun } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<{ href: string; label: string }[]>([]);

  // ⭐ NEW: detect navbar height
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateNavHeight = () => {
      if (navRef.current) {
        const height = navRef.current.offsetHeight;
        document.documentElement.style.setProperty("--nav-height", `${height}px`);
      }
    };

    updateNavHeight();
    window.addEventListener("resize", updateNavHeight);
    return () => window.removeEventListener("resize", updateNavHeight);
  }, []);

  // Ensure hydration completed for theme + session
  useEffect(() => setMounted(true), []);

  // Load menu config
  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then(setMenuItems)
      .catch(() => console.warn("⚠️ Failed to load menu items"));
  }, []);

  // Load role
  useEffect(() => {
    if (status === "authenticated") {
      const roles = (session?.user as any)?.roles ?? [];
      if (roles.length > 0) {
        setRole(roles[0]);
        localStorage.setItem("role", roles[0]);
        return;
      }
    }

    const stored = localStorage.getItem("role");
    if (stored) setRole(stored);
  }, [status, session]);

  // Paths where navbar should be hidden
  const hidePaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/student",
    "/staff",
    "/admin",
    "/dashboard",
  ];

  if (hidePaths.some((p) => pathname.startsWith(p))) return null;

  // Dashboard link
  const dashboardHref =
    role === "admin"
      ? "/admin/dashboard"
      : role === "staff"
      ? "/staff/dashboard"
      : "/student/dashboard";

  const handleLogout = async () => {
    setRole(null);
    localStorage.removeItem("role");
    toast.success("Logged out");
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <nav
      ref={navRef} // ⭐ NEW: attach ref
      className="w-full fixed top-0 left-0 z-50 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-xl border-b border-white/10 shadow-sm"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div className="px-3 py-2 rounded-xl bg-white shadow-md dark:bg-white/90 border border-white/70">
            <Image
              src="/ecomentorlogo.jpg"
              alt="Eco Mentor Logo"
              width={100}
              height={40}
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">

          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`font-medium transition ${
                pathname === item.href
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-700 dark:text-gray-300 hover:text-green-500"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Auth / Dashboard */}
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
                className="text-sm font-medium px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Register
              </Link>
            </>
          )}

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

          {/* Logout */}
          {status === "authenticated" && role && (
            <button
              onClick={handleLogout}
              className="text-sm font-medium px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen((v) => !v)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-[#0b0f19] px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-800">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`block py-2 text-sm font-medium ${
                pathname === item.href
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {status === "authenticated" && role ? (
            <>
              <Link
                href={dashboardHref}
                onClick={() => setMobileOpen(false)}
                className="block mt-2 text-sm font-semibold text-green-600 dark:text-green-400"
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="w-full mt-3 text-sm font-medium px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block pt-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Login
              </Link>

              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="block mt-2 text-sm font-medium px-4 py-2 rounded bg-green-600 text-white text-center"
              >
                Register
              </Link>
            </>
          )}

          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="mt-3 w-full py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            >
              {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
