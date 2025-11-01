"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { signIn, getSession, useSession } from "next-auth/react";
import Cookies from "js-cookie"; // ✅ Added

const specialEmails = [
  "njatabrian648@gmail.com",
  "virginia.njata@gmail.com",
  "trizer.trio56@gmail.com",
];

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "student" | "staff" | "admin" | null
  >(null);

  // 🔁 If already logged in, redirect automatically
  useEffect(() => {
    if (status === "authenticated" && !showRoleSelect) {
      const role = session?.user?.role || "student";
      if (["admin", "staff", "lecturer"].includes(role))
        router.push("/staff/dashboard");
      else router.push("/student/dashboard");
    }
  }, [status, session, showRoleSelect, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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

      // 🎯 Special users choose a role
      if (specialEmails.includes(form.email.toLowerCase())) {
        setShowRoleSelect(true);
        return;
      }

      // ✅ Normal redirect
      router.push("/student/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const confirmRole = async () => {
    if (!selectedRole) return toast.error("Please choose a role");

    // ✅ Save selected role in cookie for middleware
    Cookies.set("eco_mentor_role", selectedRole, { expires: 1 }); // 1-day cookie

    toast.success(`Logged in as ${selectedRole}`);

    // ✅ Redirect based on chosen role
    if (selectedRole === "student") router.push("/student/dashboard");
    else if (selectedRole === "staff") router.push("/staff/dashboard");
    else if (selectedRole === "admin") router.push("/staff/dashboard"); // adjust if /admin exists
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black">
      {/* 🌍 Background image */}
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
        {/* 🧩 Normal login form */}
        {!showRoleSelect ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">
              Sign In to Eco-Mentor
            </h2>

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
          </>
        ) : (
          // 🎯 Role selector for special emails
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Choose Your Role</h2>
            <p className="text-sm mb-6">
              Select how you’d like to access the Eco-Mentor dashboard.
            </p>

            <div className="flex justify-center gap-3 mb-6">
              {["student", "staff", "admin"].map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r as any)}
                  className={`px-4 py-2 rounded-md border ${
                    selectedRole === r
                      ? "bg-green-600 border-green-700"
                      : "bg-white/20 border-white/30 hover:bg-white/30"
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={confirmRole}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded-md font-semibold"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowRoleSelect(false)}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-md font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
}
