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
  {
    name: 'clearSuspenseBoundary (production)',
    buggy: `function clearSuspenseBoundary(parentInstance, suspenseInstance) {
  let node = suspenseInstance; // Delete all nodes within this suspense boundary.`,
    fixed: `function clearSuspenseBoundary(parentInstance, suspenseInstance) {
  if (!parentInstance) return;
  let node = suspenseInstance; // Delete all nodes within this suspense boundary.`,
  },
  {
    name: 'clearSuspenseBoundary (development)',
    buggy: `function clearSuspenseBoundary(parentInstance, suspenseInstance) {
  var node = suspenseInstance; // Delete all nodes within this suspense boundary.`,
    fixed: `function clearSuspenseBoundary(parentInstance, suspenseInstance) {
  if (!parentInstance) return;
  var node = suspenseInstance; // Delete all nodes within this suspense boundary.`,
  },
  {
    name: 'clearContainerSparingly',
    buggy: `    }

    container.removeChild(node);
  }

  return;
} // Making this so we can eventually move all of the instance caching to the commit phase.`,
    fixed: `    }

    if (container) container.removeChild(node);
  }

  return;
} // Making this so we can eventually move all of the instance caching to the commit phase.`,
  },
  {
    name: 'clearSingleton',
    buggy: `    if (isMarkedHoistable(node) || nodeName === 'HEAD' || nodeName === 'BODY' || nodeName === 'SCRIPT' || nodeName === 'STYLE' || nodeName === 'LINK' && node.rel.toLowerCase() === 'stylesheet') ; else {
      element.removeChild(node);
    }`,
    fixed: `    if (isMarkedHoistable(node) || nodeName === 'HEAD' || nodeName === 'BODY' || nodeName === 'SCRIPT' || nodeName === 'STYLE' || nodeName === 'LINK' && node.rel.toLowerCase() === 'stylesheet') ; else {
      if (element) element.removeChild(node);
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
