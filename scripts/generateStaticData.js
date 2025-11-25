/**
 * 🧠 Safe Static Data Generator (v2)
 * -----------------------------------------------------
 * Scans only safe frontend directories (marketing pages)
 * and ignores backend/admin/api routes.
 * -----------------------------------------------------
 */

import fs from "fs";
import path from "path";

const INCLUDE_DIRS = [
  path.resolve("./src/components"),
  path.resolve("./src/app/home"),
  path.resolve("./src/app/about-us"),
  path.resolve("./src/app/faq"),
  path.resolve("./src/app/shop"),
];

const EXCLUDE_DIRS = [
  "admin",
  "dashboard",
  "student",
  "staff",
  "api",
  "lib",
];

const BACKUP_DIR = path.resolve("./backup/auto-static-v2");
fs.mkdirSync(BACKUP_DIR, { recursive: true });

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  if (EXCLUDE_DIRS.some((bad) => dir.includes(bad))) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) walk(fullPath);
    else if (file.endsWith(".tsx")) processFile(fullPath);
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  if (content.includes("export const staticData")) return;

  const regex = /<([hpbutton]+)([^>]*)>([^<]+)<\/\1>/g;
  let match,
    staticObj = {},
    counter = 1;

  while ((match = regex.exec(content)) !== null) {
    const tag = match[1];
    const text = match[3].trim();
    if (!text || text.length < 2) continue;

    const key = `${tag}_${counter++}`;
    staticObj[key] = text;
    const replacement = `<${tag}${match[2]}>{"{staticData.${key}}"}</${tag}>`;
    content = content.replace(match[0], replacement);
  }

  if (Object.keys(staticObj).length === 0) return;

  const staticExport = `\n\n// 🧩 Auto-generated static data for CMS\nexport const staticData = ${JSON.stringify(staticObj, null, 2)};\n`;
  const modified = staticExport + "\n" + content;

  const relative = path.relative("./", filePath);
  const backupPath = path.join(BACKUP_DIR, relative.replace(/[\\/]/g, "_"));
  fs.copyFileSync(filePath, backupPath);
  fs.writeFileSync(filePath, modified, "utf8");

  console.log(`✅ Processed: ${filePath}`);
}

// Run generator safely
console.log("🔍 Scanning safe frontend directories...");
for (const dir of INCLUDE_DIRS) walk(dir);
console.log("🎉 Safe static data generation complete!");
