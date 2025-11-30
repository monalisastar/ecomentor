/**
 * FULL PIPELINE SCRIPT
 * ---------------------
 * 1. Converts all PNG/JPG/JPEG inside /public to .webp
 * 2. Rewrites ALL image references inside /src to .webp
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// ROOT DIRECTORIES
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const SRC_DIR = path.join(__dirname, "..", "src");

// ---------------------------------------------
// 🔥 1. Convert public images → webp
// ---------------------------------------------
function convertImagesToWebp(dir) {
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      convertImagesToWebp(fullPath);
    } else {
      const ext = path.extname(item).toLowerCase();
      const base = path.basename(item, ext);

      if ([".png", ".jpg", ".jpeg"].includes(ext)) {
        const webpPath = path.join(dir, `${base}.webp`);

        console.log(`Converting → ${fullPath}`);

        sharp(fullPath)
          .webp({ quality: 90 })
          .toFile(webpPath)
          .then(() => console.log(`✓ Created: ${webpPath}`))
          .catch((err) => console.error(`Error converting ${item}:`, err));
      }
    }
  });
}

// ---------------------------------------------
// 🔥 2. Rewrite all src/js/ts files → .webp
// ---------------------------------------------
function rewriteSrcFiles(dir) {
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      rewriteSrcFiles(fullPath);
    } else {
      // Only rewrite text/code files
      const validExt = [".ts", ".tsx", ".js", ".jsx", ".json", ".css", ".md"];
      if (!validExt.includes(path.extname(item))) return;

      let content = fs.readFileSync(fullPath, "utf8");

      const originalContent = content;

      // Rewrite any image reference to .webp
      content = content
        .replace(/\.png/g, ".webp")
        .replace(/\.jpg/g, ".webp")
        .replace(/\.jpeg/g, ".webp");

      // Save only if changed
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, "utf8");
        console.log(`📝 Updated: ${fullPath}`);
      }
    }
  });
}

// -------------------------------------------------
// RUN BOTH PROCESSES
// -------------------------------------------------

console.log("\n🔥 Starting conversion and rewrite process...\n");

convertImagesToWebp(PUBLIC_DIR);

setTimeout(() => {
  console.log("\n🛠  Starting src rewrite to .webp...\n");
  rewriteSrcFiles(SRC_DIR);
  console.log("\n✅ ALL DONE — images converted and src updated!\n");
}, 3000);
