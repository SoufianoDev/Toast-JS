#!/usr/bin/env node

/**
 * Toast-JS Build Script
 * 
 * Builds UMD and ESM bundles from src/Toast.js.
 * Toast.js is a self-contained IIFE with an inline UMD wrapper,
 * so no source concatenation is needed.
 * 
 * Usage: node scripts/build.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Read the self-contained source
const source = fs.readFileSync(path.join(SRC_DIR, 'Toast.js'), 'utf8');

// ══════════════════════════════════════════════════════════════════════════
//  UMD Bundle — use src/Toast.js as-is (already has a UMD wrapper)
// ══════════════════════════════════════════════════════════════════════════

fs.writeFileSync(path.join(DIST_DIR, 'toast.umd.js'), source);
console.log('Created dist/toast.umd.js');

// ══════════════════════════════════════════════════════════════════════════
//  ESM Bundle — extract factory body, wrap in clean IIFE, add export
// ══════════════════════════════════════════════════════════════════════════
//
//  Source structure:
//
//    (function (global, factory) {      ← UMD outer opening  (line 35)
//      if (typeof module === ...) { }   ← UMD dispatch logic  (lines 36-43)
//    })(typeof globalThis !== ... , function () {  ← IIFE invocation + factory opening  (line 44)
//      "use strict";                     ← Factory body start  (line 45)
//      ... all code ...                  ← Factory body  (lines 46-886)
//      return Toast;                     ← Factory body end  (line 887)
//    });                                 ← IIFE closing  (line 888)
//
//  For ESM, we extract lines 45-887 (the factory body), wrap it in a
//  simple IIFE (to preserve var scoping), and append `export default Toast;`.

const lines = source.split('\n');

// Find the factory body boundaries
let factoryStart = -1;
let factoryEnd = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '"use strict";' && factoryStart === -1) {
        factoryStart = i;
    }
    if (lines[i].trim() === 'return Toast;') {
        factoryEnd = i;
    }
}

if (factoryStart === -1 || factoryEnd === -1) {
    console.error('Build failed: could not parse Toast.js factory boundaries.');
    console.error('  "use strict"; line:', factoryStart !== -1 ? 'found at line ' + (factoryStart + 1) : 'NOT found');
    console.error('  "return Toast;" line:', factoryEnd !== -1 ? 'found at line ' + (factoryEnd + 1) : 'NOT found');
    process.exit(1);
}

// Extract factory body: from "use strict"; through "return Toast;"
const factoryBody = lines.slice(factoryStart, factoryEnd + 1).join('\n');

const header = `/**
 * @file toast.esm.js
 * Toast-JS - Toast Notification Library (ESM)
 * @version 2.1.0
 * @license MIT
 * @copyright 2026 Soufiano Dev
 */
`;

const esmBundle = header + 'var Toast = (function () {\n' + factoryBody + '\n})();\n\nexport default Toast;\n';

fs.writeFileSync(path.join(DIST_DIR, 'toast.esm.js'), esmBundle);
console.log('Created dist/toast.esm.js');

console.log('Build complete!');
