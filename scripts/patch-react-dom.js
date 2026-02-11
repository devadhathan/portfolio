/**
 * Patches React DOM's unmountHoistable function to add a null check
 * for instance.parentNode before calling removeChild.
 * 
 * This fixes a known bug where React tries to remove hoisted elements
 * (like <link>, <meta>, <style> in <head>) during page transitions,
 * but the element's parentNode is already null.
 * 
 * See: https://github.com/facebook/react/issues/26608
 */
const fs = require('fs');
const path = require('path');

const files = [
  'node_modules/next/dist/compiled/react-dom/cjs/react-dom.development.js',
  'node_modules/next/dist/compiled/react-dom/cjs/react-dom.production.js',
  'node_modules/next/dist/compiled/react-dom/cjs/react-dom.profiling.js',
];

const buggyCode = `function unmountHoistable(instance) {
  instance.parentNode.removeChild(instance);
}`;

const fixedCode = `function unmountHoistable(instance) {
  if (instance.parentNode) {
    instance.parentNode.removeChild(instance);
  }
}`;

let patchCount = 0;

files.forEach((file) => {
  const filePath = path.resolve(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(buggyCode)) {
      content = content.replace(buggyCode, fixedCode);
      fs.writeFileSync(filePath, content, 'utf8');
      patchCount++;
      console.log(`✓ Patched ${file}`);
    } else if (content.includes(fixedCode)) {
      console.log(`✓ Already patched ${file}`);
    } else {
      console.log(`⚠ Could not find unmountHoistable in ${file}`);
    }
  } else {
    console.log(`⚠ File not found: ${file}`);
  }
});

console.log(`\nPatched ${patchCount} file(s)`);
