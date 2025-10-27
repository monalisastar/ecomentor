// rewriteImports.cjs
const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.join(__dirname, "src");

function getAllFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) getAllFiles(fullPath, files);
    else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) files.push(fullPath);
  }
  return files;
}

function normalizeQuotes(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  // Fix import statements
  content = content.replace(
    /from\s+(['"`])([^'"`]+)['"`]/g,
    (match, _quote, importPath) => `from "${importPath}";`
  );

  // Fix export statements like: export { default as X } from '...'
  content = content.replace(
    /from\s+(['"`])([^'"`]+)['"`]/g,
    (match, _quote, exportPath) => `from "${exportPath}";`
  );

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`Fixed quotes: ${filePath}`);
}

const allFiles = getAllFiles(ROOT_DIR);
allFiles.forEach(normalizeQuotes);

console.log("✅ All imports/exports fixed with matching quotes and semicolons!");
