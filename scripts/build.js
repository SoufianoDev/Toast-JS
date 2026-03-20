#!/usr/bin/env node

/**
 * Toast-JS Build Script
 * 
 * Builds UMD and ESM bundles from source files.
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

// Read source files
const toastJs = fs.readFileSync(path.join(SRC_DIR, 'Toast.js'), 'utf8');
const envJs = fs.readFileSync(path.join(SRC_DIR, 'core', 'env.js'), 'utf8');
const domJs = fs.readFileSync(path.join(SRC_DIR, 'core', 'dom.js'), 'utf8');
const contextJs = fs.readFileSync(path.join(SRC_DIR, 'core', 'context.js'), 'utf8');

// Combine source files for bundle
const combined = `// Toast-JS - Toast Notification Library
// Version: 2.1.0
// License: MIT

// Environment utilities
${envJs}

// DOM utilities
${domJs}

// Context management
${contextJs}

// Main Toast module
${toastJs}
`;

// ESM bundle
const esmBundle = combined;
fs.writeFileSync(path.join(DIST_DIR, 'toast.esm.js'), esmBundle);
console.log('Created dist/toast.esm.js');

// UMD bundle
const umdBundle = `(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Toast = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
${combined}
    return Toast;
}));
`;
fs.writeFileSync(path.join(DIST_DIR, 'toast.umd.js'), umdBundle);
console.log('Created dist/toast.umd.js');

console.log('Build complete!');