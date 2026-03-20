/**
 * @fileoverview Environment detection utilities for cross-platform compatibility.
 * @module env
 * @version 2.1.0
 * @license MIT
 * @copyright 2026 Soufiano Dev
 */

/**
 * Environment detection module.
 * Provides utilities to detect the current runtime environment.
 */
const Env = {
  /**
   * Checks if running in a browser environment.
   * @returns {boolean} True if in browser, false otherwise.
   */
  isBrowser: function() {
    return typeof window !== 'undefined' && 
           typeof document !== 'undefined' && 
           typeof document.createElement === 'function';
  },

  /**
   * Checks if running in a server-side rendering (SSR) environment.
   * This includes Next.js SSR, Nuxt SSR, etc.
   * @returns {boolean} True if in SSR environment, false otherwise.
   */
  isSSR: function() {
    return typeof window === 'undefined' && 
           typeof global !== 'undefined';
  },

  /**
   * Checks if running in a Node.js environment.
   * @returns {boolean} True if in Node.js, false otherwise.
   */
  isNode: function() {
    return typeof process !== 'undefined' && 
           process.versions != null && 
           process.versions.node != null;
  },

  /**
   * Checks if running in a build/bundler environment (Webpack, Vite, etc.).
   * @returns {boolean} True if in build environment, false otherwise.
   */
  isBuild: function() {
    return typeof module !== 'undefined' && 
           typeof module.exports !== 'undefined' && 
           !this.isBrowser();
  },

  /**
   * Checks if the DOM is available for manipulation.
   * @returns {boolean} True if DOM is available, false otherwise.
   */
  isDOMAvailable: function() {
    return typeof document !== 'undefined' && 
           document.body != null;
  },

  /**
   * Checks if running in a hydration context (React/Next.js).
   * This is when code runs on client but before full hydration.
   * @returns {boolean} True if in hydration context, false otherwise.
   */
  isHydrating: function() {
    return this.isBrowser() && 
           document.readyState === 'loading';
  },

  /**
   * Gets the current environment name as a string.
   * @returns {string} Environment name: 'browser', 'ssr', 'node', or 'unknown'.
   */
  getEnvironment: function() {
    if (this.isBrowser()) return 'browser';
    if (this.isSSR()) return 'ssr';
    if (this.isNode()) return 'node';
    return 'unknown';
  },

  /**
   * Executes a callback only in browser environment.
   * @param {Function} callback - Function to execute.
   * @param {*} [fallback] - Value to return if not in browser.
   * @returns {*} Result of callback or fallback.
   */
  runInBrowser: function(callback, fallback) {
    if (this.isBrowser() && typeof callback === 'function') {
      return callback();
    }
    return fallback;
  },

  /**
   * Executes a callback when DOM is ready.
   * @param {Function} callback - Function to execute when DOM is ready.
   */
  onDOMReady: function(callback) {
    if (!this.isBrowser()) return;
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }
};

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Env;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return Env; });
}