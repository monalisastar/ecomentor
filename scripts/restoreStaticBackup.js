import fs from "fs";
import path from "path";

const BACKUP_DIR = path.resolve("./backup/auto-static");
const PROJECT_ROOT = path.resolve("./");

if (!fs.existsSync(BACKUP_DIR)) {
  console.error("❌ Backup folder not found:", BACKUP_DIR);
  process.exit(1);
}

const files = fs.readdirSync(BACKUP_DIR);

for (const file of files) {
  const backupPath = path.join(BACKUP_DIR, file);

  // Reverse the flattening by converting underscores to slashes
  const relativePath = file.replace(/_/g, "/");
  const originalPath = path.join(PROJECT_ROOT, relativePath);

  // Only restore if file exists in project
  if (fs.existsSync(originalPath)) {
    fs.copyFileSync(backupPath, originalPath);
    console.log(`✅ Restored: ${originalPath}`);
  } else {
    console.warn(`⚠️ Skipped (not found): ${originalPath}`);
  }
}

console.log("🎉 Restoration complete! Original files have been restored.");
