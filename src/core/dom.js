/**
 * @fileoverview Lightweight DOM utility layer for cross-environment compatibility.
 * @module dom
 * @version 2.1.0
 * @license MIT
 * @copyright 2026 Soufiano Dev
 * 
 * @description
 * Minimal DOM abstraction layer that provides simple utility functions
 * for DOM manipulation. Designed to be extremely lightweight without
 * complex class-based adapters or heavy abstractions.
 */

/**
 * Lightweight DOM utility object.
 * All methods are safe to call in any environment - they will gracefully
 * return null or false when DOM is unavailable.
 */
const Dom = {
  /**
   * Checks if DOM is available for manipulation.
   * @returns {boolean} True if DOM operations can be performed.
   */
  isAvailable: function() {
    return typeof document !== 'undefined' && 
           typeof document.createElement === 'function';
  },

  /**
   * Creates a DOM element if DOM is available.
   * @param {string} tagName - The tag name of the element to create.
   * @returns {HTMLElement|null} The created element or null if DOM unavailable.
   */
  createElement: function(tagName) {
    if (!this.isAvailable()) return null;
    try {
      return document.createElement(tagName);
    } catch (e) {
      return null;
    }
  },

  /**
   * Appends a child element to a parent element.
   * @param {HTMLElement} parent - The parent element.
   * @param {HTMLElement} child - The child element to append.
   * @returns {HTMLElement|null} The appended child or null on failure.
   */
  append: function(parent, child) {
    if (!parent || !child) return null;
    try {
      return parent.appendChild(child);
    } catch (e) {
      return null;
    }
  },

  /**
   * Prepends a child element to a parent element.
   * @param {HTMLElement} parent - The parent element.
   * @param {HTMLElement} child - The child element to prepend.
   * @returns {HTMLElement|null} The prepended child or null on failure.
   */
  prepend: function(parent, child) {
    if (!parent || !child) return null;
    try {
      return parent.insertBefore(child, parent.firstChild);
    } catch (e) {
      return null;
    }
  },

  /**
   * Removes an element from its parent.
   * @param {HTMLElement} element - The element to remove.
   * @returns {boolean} True if removed, false otherwise.
   */
  remove: function(element) {
    if (!element || !element.parentNode) return false;
    try {
      element.parentNode.removeChild(element);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Gets an element by ID.
   * @param {string} id - The element ID.
   * @returns {HTMLElement|null} The element or null if not found.
   */
  getById: function(id) {
    if (!this.isAvailable() || !id) return null;
    try {
      return document.getElementById(id);
    } catch (e) {
      return null;
    }
  },

  /**
   * Queries for elements matching a selector.
   * @param {string} selector - CSS selector.
   * @param {HTMLElement} [context=document] - Context element.
   * @returns {NodeList|Array} NodeList of elements or empty array.
   */
  query: function(selector, context) {
    if (!this.isAvailable() || !selector) return [];
    try {
      var ctx = context || document;
      return ctx.querySelectorAll(selector);
    } catch (e) {
      return [];
    }
  },

  /**
   * Queries for a single element matching a selector.
   * @param {string} selector - CSS selector.
   * @param {HTMLElement} [context=document] - Context element.
   * @returns {HTMLElement|null} The element or null if not found.
   */
  queryOne: function(selector, context) {
    if (!this.isAvailable() || !selector) return null;
    try {
      var ctx = context || document;
      return ctx.querySelector(selector);
    } catch (e) {
      return null;
    }
  },

  /**
   * Sets multiple styles on an element.
   * @param {HTMLElement} element - The target element.
   * @param {Object} styles - Object containing style properties.
   * @returns {boolean} True if styles were applied.
   */
  setStyles: function(element, styles) {
    if (!element || !styles || typeof styles !== 'object') return false;
    try {
      Object.assign(element.style, styles);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Adds one or more classes to an element.
   * @param {HTMLElement} element - The target element.
   * @param {...string} classNames - Class names to add.
   * @returns {boolean} True if classes were added.
   */
  addClass: function(element) {
    var classNames = Array.prototype.slice.call(arguments, 1);
    if (!element || !classNames.length) return false;
    try {
      element.classList.add.apply(element.classList, classNames);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Removes one or more classes from an element.
   * @param {HTMLElement} element - The target element.
   * @param {...string} classNames - Class names to remove.
   * @returns {boolean} True if classes were removed.
   */
  removeClass: function(element) {
    var classNames = Array.prototype.slice.call(arguments, 1);
    if (!element || !classNames.length) return false;
    try {
      element.classList.remove.apply(element.classList, classNames);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Checks if an element has a specific class.
   * @param {HTMLElement} element - The target element.
   * @param {string} className - Class name to check.
   * @returns {boolean} True if element has the class.
   */
  hasClass: function(element, className) {
    if (!element || !className) return false;
    try {
      return element.classList.contains(className);
    } catch (e) {
      return false;
    }
  },

  /**
   * Sets an attribute on an element.
   * @param {HTMLElement} element - The target element.
   * @param {string} name - Attribute name.
   * @param {string} value - Attribute value.
   * @returns {boolean} True if attribute was set.
   */
  setAttr: function(element, name, value) {
    if (!element || !name) return false;
    try {
      element.setAttribute(name, value);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Gets an attribute from an element.
   * @param {HTMLElement} element - The target element.
   * @param {string} name - Attribute name.
   * @returns {string|null} The attribute value or null.
   */
  getAttr: function(element, name) {
    if (!element || !name) return null;
    try {
      return element.getAttribute(name);
    } catch (e) {
      return null;
    }
  },

  /**
   * Gets the document head element.
   * @returns {HTMLElement|null} The head element or null.
   */
  getHead: function() {
    if (!this.isAvailable()) return null;
    return document.head || document.getElementsByTagName('head')[0] || null;
  },

  /**
   * Gets the document body element.
   * @returns {HTMLElement|null} The body element or null.
   */
  getBody: function() {
    if (!this.isAvailable()) return null;
    return document.body || document.getElementsByTagName('body')[0] || null;
  },

  /**
   * Injects a style element into the document head.
   * @param {string} id - Unique ID for the style element.
   * @param {string} css - CSS content to inject.
   * @returns {HTMLStyleElement|null} The style element or null on failure.
   */
  injectStyle: function(id, css) {
    if (!this.isAvailable() || !css) return null;
    
    // Check if style already exists
    var existing = this.getById(id);
    if (existing) return existing;

    var style = this.createElement('style');
    if (!style) return null;

    style.id = id;
    style.textContent = css;

    var head = this.getHead();
    if (!head) return null;

    return this.append(head, style);
  },

  /**
   * Creates a text node.
   * @param {string} text - The text content.
   * @returns {Text|null} The text node or null.
   */
  createTextNode: function(text) {
    if (!this.isAvailable()) return null;
    try {
      return document.createTextNode(text);
    } catch (e) {
      return null;
    }
  },

  /**
   * Adds an event listener to an element.
   * @param {HTMLElement|Window|Document} element - Target element.
   * @param {string} event - Event type.
   * @param {Function} handler - Event handler.
   * @param {Object} [options] - Event listener options.
   * @returns {boolean} True if listener was added.
   */
  on: function(element, event, handler, options) {
    if (!element || !event || typeof handler !== 'function') return false;
    try {
      element.addEventListener(event, handler, options || false);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Removes an event listener from an element.
   * @param {HTMLElement|Window|Document} element - Target element.
   * @param {string} event - Event type.
   * @param {Function} handler - Event handler.
   * @param {Object} [options] - Event listener options.
   * @returns {boolean} True if listener was removed.
   */
  off: function(element, event, handler, options) {
    if (!element || !event || typeof handler !== 'function') return false;
    try {
      element.removeEventListener(event, handler, options || false);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Requests an animation frame (browser only).
   * @param {Function} callback - Callback to execute on next frame.
   * @returns {number|null} Request ID or null.
   */
  requestFrame: function(callback) {
    if (!this.isAvailable() || typeof callback !== 'function') return null;
    var raf = window.requestAnimationFrame || 
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame ||
              function(cb) { return setTimeout(cb, 16); };
    try {
      return raf.call(window, callback);
    } catch (e) {
      return null;
    }
  },

  /**
   * Cancels an animation frame (browser only).
   * @param {number} id - Request ID to cancel.
   * @returns {boolean} True if cancelled.
   */
  cancelFrame: function(id) {
    if (!this.isAvailable() || id == null) return false;
    var caf = window.cancelAnimationFrame || 
              window.webkitCancelAnimationFrame ||
              window.mozCancelAnimationFrame ||
              function(i) { clearTimeout(i); };
    try {
      caf.call(window, id);
      return true;
    } catch (e) {
      return false;
    }
  }
};

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Dom;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return Dom; });
}