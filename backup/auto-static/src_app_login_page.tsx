"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { signIn, useSession } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  //
  // 🔁 Redirect if already authenticated
  //
  useEffect(() => {
    if (status === "authenticated") {
      const roles = session?.user?.roles || [];
      redirectByRole(roles);
    }
  }, [status, session]);

  //
  // 🧭 Helper to centralize redirect logic
  //
  const redirectByRole = (roles: string[]) => {
    if (roles.includes("admin")) router.replace("/admin/dashboard");
    else if (roles.some((r) => ["staff", "lecturer"].includes(r)))
      router.replace("/staff/dashboard");
    else router.replace("/student/dashboard");
  };

  //
  // 🧠 Handle input changes
  //
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  //
  // 🚀 Handle form submission
  //
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (res?.error) throw new Error(res.error);
      toast.success("Login successful!");

      // 🔄 Fetch session again to get roles
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      const roles = sessionData?.user?.roles || [];

      redirectByRole(roles);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  //
  // 🖼️ UI
  //
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black">
      {/* 🌍 Background */}
      <Image
        src="/images/register-bg.jpg"
        alt="Eco-Mentor Background"
        fill
        className="object-cover opacity-50"
        priority
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white/30 backdrop-blur-md rounded-xl shadow-lg p-8 text-white"
      >
        <h2 className="text-2xl font-bold text-center mb-6">
          Sign In to Eco-Mentor
        </h2>

        {/* 🧩 Credentials Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-md bg-white/80 text-black placeholder-gray-600 focus:outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-md bg-white/80 text-black placeholder-gray-600 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 transition font-semibold py-2 rounded-md disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

        {/* 🔗 Forgot Password */}
        <div className="mt-3 text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-white hover:text-green-200 underline"
          >
            Forgot your password?
          </Link>
        </div>

        {/* 🌐 Google Login */}
        <div className="mt-6 text-center">
          <p className="text-sm mb-2">Or sign in with</p>
          <button
            onClick={() => signIn("google", { callbackUrl: "/student/dashboard" })}
            className="flex items-center justify-center gap-2 w-full bg-white text-black font-medium py-2 rounded-md shadow hover:bg-gray-200 transition"
          >
            {/* Google SVG Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="20"
              height="20"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.7 1.22 9.18 3.6l6.82-6.82C35.9 2.95 30.3 0 24 0 14.64 0 6.48 5.38 2.56 13.22l7.98 6.19C12.24 12.1 17.66 9.5 24 9.5z"
              />
              <path
                fill="#34A853"
                d="M46.98 24.55c0-1.64-.15-3.22-.42-4.75H24v9h12.9c-.56 2.95-2.26 5.45-4.79 7.15l7.38 5.73c4.32-3.99 6.79-9.88 6.79-17.13z"
              />
              <path
                fill="#4A90E2"
                d="M9.04 28.41A14.5 14.5 0 0 1 8.5 24c0-1.53.27-3.01.77-4.41l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.9.93 7.57 2.56 10.94l7.98-6.19z"
              />
              <path
                fill="#FBBC05"
                d="M24 48c6.48 0 11.92-2.15 15.89-5.83l-7.38-5.73C30.41 38.42 27.36 39.5 24 39.5c-6.34 0-11.76-4.1-13.98-9.89l-7.98 6.19C6.48 42.62 14.64 48 24 48z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* 🧭 Register link */}
        <p className="text-sm text-center mt-6">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="underline text-white hover:text-green-200"
          >
            Register
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
