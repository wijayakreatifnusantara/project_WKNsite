const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'apps/client/src');
const pagesDir = path.join(srcDir, 'pages');
const featuresDir = path.join(srcDir, 'features');

if (!fs.existsSync(featuresDir)) {
  fs.mkdirSync(featuresDir);
}

// 1. Move pages to features/[Feature]/pages
const pageFolders = fs.readdirSync(pagesDir).filter(f => fs.statSync(path.join(pagesDir, f)).isDirectory());
for (const folder of pageFolders) {
  const featureDir = path.join(featuresDir, folder);
  const featurePagesDir = path.join(featureDir, 'pages');
  
  if (!fs.existsSync(featureDir)) fs.mkdirSync(featureDir);
  if (!fs.existsSync(featurePagesDir)) fs.mkdirSync(featurePagesDir);
  
  const oldPath = path.join(pagesDir, folder);
  
  // move all contents of oldPath to featurePagesDir
  const items = fs.readdirSync(oldPath);
  for (const item of items) {
    fs.renameSync(path.join(oldPath, item), path.join(featurePagesDir, item));
  }
  
  fs.rmdirSync(oldPath);
}
fs.rmdirSync(pagesDir); // should be empty now

// 2. Update AppRoutes.jsx
const appRoutesPath = path.join(srcDir, 'routes', 'AppRoutes.jsx');
if (fs.existsSync(appRoutesPath)) {
  let content = fs.readFileSync(appRoutesPath, 'utf8');
  content = content.replace(/\.\.\/pages\/([A-Za-z0-9_]+)\//g, '../features/$1/pages/');
  fs.writeFileSync(appRoutesPath, content);
  console.log('AppRoutes.jsx updated.');
}

console.log('Web restructuring complete.');
