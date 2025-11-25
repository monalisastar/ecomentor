"use client";

import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";


export default function RootClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Navbar />
      {children}
    </Providers>
  );
}
