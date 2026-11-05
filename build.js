// ============================================================================
// Cloudflare Pages / Workers 兼容构建脚本 (零外部依赖)
// 将静态资源同步生成到 dist/ 目录，同时保留根目录文件，兼容任何构建输出目录设置
// ============================================================================
const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "dist");

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

const filesToCopy = [
  "index.html",
  "styles.css",
  "questions.js",
  "kaoyan_questions.js",
  "xiao1000_questions.js",
  "xiao1000_part1.json",
  "app.js",
  "_headers",
  "c9e1b65a8ac42036810d5541984fd2e0.txt"
];
for (const entry of fs.readdirSync(__dirname)) {
  if ((entry.endsWith(".txt") || entry.endsWith(".json")) && !filesToCopy.includes(entry)) {
    filesToCopy.push(entry);
  }
}
for (const file of filesToCopy) {
  const srcPath = path.join(__dirname, file);
  if (fs.existsSync(srcPath)) {
    copyRecursive(srcPath, path.join(outDir, file));
  }
}

const assetsSrc = path.join(__dirname, "assets");
if (fs.existsSync(assetsSrc)) {
  copyRecursive(assetsSrc, path.join(outDir, "assets"));
}

const docsSrc = path.join(__dirname, "docs");
if (fs.existsSync(docsSrc)) {
  copyRecursive(docsSrc, path.join(outDir, "docs"));
}

console.log("✅ Cloudflare 静态站点构建完成：已移除光电子器件内容，根目录 (.) 与 dist/ 目录均已就绪。");
