/**
 * Patches React DOM to add null checks before removeChild calls during
 * unmount/cleanup. Fixes errors during Next.js page transitions when
 * the DOM tree is torn down and parent refs can be null.
 *
 * Patches:
 * 1. unmountHoistable - instance.parentNode can be null
 * 2. removeChild - parentInstance can be null
 * 3. removeChildFromContainer - container.parentNode can be null when COMMENT_NODE
 */
const fs = require('fs');
const path = require('path');

const files = [
  'node_modules/next/dist/compiled/react-dom/cjs/react-dom.development.js',
  'node_modules/next/dist/compiled/react-dom/cjs/react-dom.production.js',
  'node_modules/next/dist/compiled/react-dom/cjs/react-dom.profiling.js',
];

const patches = [
  {
    name: 'unmountHoistable',
    buggy: `function unmountHoistable(instance) {
  instance.parentNode.removeChild(instance);
}`,
    fixed: `function unmountHoistable(instance) {
  if (instance.parentNode) {
    instance.parentNode.removeChild(instance);
  }
}`,
  },
  {
    name: 'removeChild',
    buggy: `function removeChild(parentInstance, child) {
  parentInstance.removeChild(child);
}`,
    fixed: `function removeChild(parentInstance, child) {
  if (parentInstance) {
    parentInstance.removeChild(child);
  }
}`,
  },
  {
    name: 'removeChildFromContainer',
    buggy: `function removeChildFromContainer(container, child) {
  if (container.nodeType === COMMENT_NODE) {
    container.parentNode.removeChild(child);
  } else {
    container.removeChild(child);
  }
}`,
    fixed: `function removeChildFromContainer(container, child) {
  if (container.nodeType === COMMENT_NODE) {
    if (container.parentNode) {
      container.parentNode.removeChild(child);
    }
  } else {
    container.removeChild(child);
  }
}`,
  },
];

let totalPatched = 0;

files.forEach((file) => {
  const filePath = path.resolve(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠ File not found: ${file}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let filePatched = 0;
  patches.forEach(({ name, buggy, fixed }) => {
    if (content.includes(buggy)) {
      content = content.replace(buggy, fixed);
      filePatched++;
      totalPatched++;
    } else if (!content.includes(fixed)) {
      console.log(`⚠ Could not find ${name} in ${file}`);
    }
  });
  if (filePatched > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Patched ${filePatched} place(s) in ${file}`);
  }
});

console.log(`\nPatched ${totalPatched} total`);
