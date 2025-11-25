import fs from "fs";
import path from "path";

const root = path.resolve("./src/components");

function fixFile(file: string) {
  let content = fs.readFileSync(file, "utf8");
  if (!content.includes("'use client'")) return;

  // Move 'use client' to the top if not already
  content = content
    .replace(/[\r\n]*'use client';/g, "")
    .trim();
  const fixed = `'use client';\n\n${content}\n`;
  fs.writeFileSync(file, fixed, "utf8");
  console.log(`✅ Fixed: ${file}`);
}

function walk(dir: string) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (item.endsWith(".tsx")) fixFile(full);
  }
}

walk(root);
console.log("🎉 All 'use client' directives moved to top!");
