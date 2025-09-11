"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { ReactNode } from "react"
import { SocketProvider } from "@/context/SocketProvider" // import your Socket context

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SocketProvider>
          {children}
        </SocketProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
