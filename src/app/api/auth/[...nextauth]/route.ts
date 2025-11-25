import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

const handler = NextAuth(authOptions);


handler.trustHost = true;

export const GET = handler;
export const POST = handler;
