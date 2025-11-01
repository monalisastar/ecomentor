'use client';

import Providers from "./providers";
import Navbar from "@/components/Navbar";

export default function RootClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Navbar />
      {children}
    </Providers>
  );
}
