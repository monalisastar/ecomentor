// test-auth-providers.ts
import { authOptions } from "./src/lib/authOptions"; // no .ts extension

console.log("Configured NextAuth providers:");
console.log(authOptions.providers.map(p => p.name));
