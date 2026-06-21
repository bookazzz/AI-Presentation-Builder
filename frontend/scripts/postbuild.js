/**
 * Post-build script to copy all prerendered HTML pages from .next/server/pages/
 * to the out/ directory. Next.js 14 with output: "export" does not always copy
 * every page, especially those with client components.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', '.next', 'server', 'pages');
const DST = path.join(__dirname, '..', 'out', 'AI-Presentation-Builder');
const ROOT_DST = path.join(__dirname, '..', 'out');

function copyRecursive(srcDir, dstDir, base = '') {
  if (!fs.existsSync(srcDir)) return;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('_')) continue; // skip _app, _document, etc.
    const srcPath = path.join(srcDir, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, dstDir, path.join(base, entry.name));
    } else if (entry.name.endsWith('.html')) {
      // Determine destination path
      // base looks like: '' or 'login' or 'create' or 'dashboard/edit/123'
      let relPath = path.join(base, entry.name);
      if (relPath === 'index.html') {
        // Root page -> out/AI-Presentation-Builder/index.html
        const destFile = path.join(dstDir, 'index.html');
        fs.mkdirSync(path.dirname(destFile), { recursive: true });
        fs.copyFileSync(srcPath, destFile);
        console.log(`  out/AI-Presentation-Builder/index.html`);
      } else if (relPath.endsWith('.html')) {
        // e.g. login.html -> out/AI-Presentation-Builder/login.html
        // e.g. create.html -> out/AI-Presentation-Builder/create.html
        // e.g. dashboard.html -> out/AI-Presentation-Builder/dashboard.html
        // e.g. edit.html -> out/AI-Presentation-Builder/edit.html
        // e.g. register.html -> out/AI-Presentation-Builder/register.html
        // e.g. presentation-demo.html -> out/AI-Presentation-Builder/presentation-demo.html
        const destFile = path.join(dstDir, relPath);
        fs.mkdirSync(path.dirname(destFile), { recursive: true });
        fs.copyFileSync(srcPath, destFile);
        console.log(`  out/AI-Presentation-Builder/${relPath}`);
      } else {
        // Just copy to same relative path under dstDir
        const destFile = path.join(dstDir, relPath);
        fs.mkdirSync(path.dirname(destFile), { recursive: true });
        fs.copyFileSync(srcPath, destFile);
        console.log(`  out/${relPath}`);
      }
    }
  }
}

console.log('Copying prerendered pages from .next/server/pages/ to out/...');
// Copy with basePath prefix
copyRecursive(SRC, ROOT_DST);

// Also copy index.html to root out/ for GitHub Pages root access
if (fs.existsSync(path.join(ROOT_DST, 'AI-Presentation-Builder', 'index.html'))) {
  const rootIdx = path.join(ROOT_DST, 'index.html');
  fs.copyFileSync(path.join(ROOT_DST, 'AI-Presentation-Builder', 'index.html'), rootIdx);
  console.log('  out/index.html (root redirect)');
}

console.log('Done!');
