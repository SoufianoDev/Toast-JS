#!/usr/bin/env node

/**
 * Toast-JS Publish Script
 * 
 * Automates npm publishing process.
 * Usage: node scripts/publish.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const PACKAGE_JSON = path.join(ROOT_DIR, 'package.json');

// Read package.json
const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));

console.log(`Publishing ${pkg.name}@${pkg.version}...`);

// Check if user is logged in
try {
    execSync('npm whoami', { stdio: 'pipe' });
} catch (error) {
    console.error('Error: You must be logged in to npm. Run "npm login" first.');
    process.exit(1);
}

// Run build first
console.log('Running build...');
execSync('node scripts/build.js', { stdio: 'inherit' });

// Publish to npm
console.log('Publishing to npm...');
try {
    execSync('npm publish --access public', { stdio: 'inherit' });
    console.log(`Successfully published ${pkg.name}@${pkg.version}!`);
} catch (error) {
    console.error('Publish failed. Check the error above.');
    process.exit(1);
}