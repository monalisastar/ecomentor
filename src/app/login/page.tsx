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
  // 🔁 Auto-redirect if already logged in
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
  // 🧠 Handle input
  //
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  //
  // 🚀 Handle submit
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

      // 🔄 Re-fetch session to get roles
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

        {/* 🌐 Google Login */}
        <div className="mt-6 text-center">
          <p className="text-sm mb-2">Or sign in with</p>
          <button
            onClick={() =>
              signIn("google", { callbackUrl: "/student/dashboard" })
            }
            className="w-full bg-white text-black font-medium py-2 rounded-md shadow hover:bg-gray-200 transition"
          >
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
