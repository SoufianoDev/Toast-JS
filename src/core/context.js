/**
 * @fileoverview Context system for SSR-safe DOM context resolution.
 * @module context
 * @version 2.1.0
 * @license MIT
 * @copyright 2026 Soufiano Dev
 * 
 * @description
 * Provides an Android-style context system for toast rendering.
 * The context represents the application root where toasts will be mounted.
 * In SSR environments, the context is lazy and resolves only after hydration.
 */

/**
 * Symbol for marking lazy context objects.
 * @type {symbol}
 */
var LAZY_CONTEXT_MARKER = typeof Symbol !== 'undefined' 
  ? Symbol('toast.lazy.context') 
  : '__toast_lazy_context__';

/**
 * Creates a lazy context object that defers DOM resolution.
 * This is used in SSR environments where the DOM is not yet available.
 * 
 * @returns {Object} A lazy context object with resolution methods.
 */
function createLazyContext() {
  var resolvedElement = null;
  var pendingCallbacks = [];

  return {
    /**
     * Marker to identify this as a lazy context.
     * @type {symbol|string}
     */
    _marker: LAZY_CONTEXT_MARKER,

    /**
     * Checks if this is a lazy (unresolved) context.
     * @returns {boolean} True if lazy/unresolved.
     */
    isLazy: function() {
      return resolvedElement === null;
    },

    /**
     * Checks if the context is ready for use.
     * @returns {boolean} True if DOM is available.
     */
    isReady: function() {
      return typeof document !== 'undefined' && document.body != null;
    },

    /**
     * Resolves and returns the actual DOM element.
     * If DOM is not ready, returns null.
     * 
     * @returns {HTMLElement|null} The resolved DOM element.
     */
    resolve: function() {
      if (resolvedElement) return resolvedElement;
      
      if (typeof document === 'undefined' || !document.body) {
        return null;
      }
      
      resolvedElement = document.body;
      return resolvedElement;
    },

    /**
     * Executes a callback when the context becomes ready.
     * If already ready, executes immediately.
     * 
     * @param {Function} callback - Callback to execute when ready.
     */
    onReady: function(callback) {
      if (typeof callback !== 'function') return;

      if (this.isReady()) {
        callback(this.resolve());
        return;
      }

      pendingCallbacks.push(callback);

      // Try to resolve on DOMContentLoaded
      if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', function() {
            var ctx = this.resolve();
            pendingCallbacks.forEach(function(cb) {
              cb(ctx);
            });
            pendingCallbacks = [];
          }.bind(this));
        }
      }
    },

    /**
     * Forces resolution to a specific element.
     * @param {HTMLElement} element - The element to resolve to.
     */
    forceResolve: function(element) {
      if (element && element.nodeType === 1) {
        resolvedElement = element;
      }
    },

    /**
     * Resets the context to unresolved state.
     */
    reset: function() {
      resolvedElement = null;
    },

    /**
     * Returns a string representation.
     * @returns {string}
     */
    toString: function() {
      return '[Toast LazyContext]';
    }
  };
}

/**
 * Checks if an object is a lazy context.
 * @param {*} obj - Object to check.
 * @returns {boolean} True if the object is a lazy context.
 */
function isLazyContext(obj) {
  return obj && (obj._marker === LAZY_CONTEXT_MARKER || obj.isLazy);
}

/**
 * Resolves a context to its actual DOM element.
 * Handles both regular HTMLElement and lazy context objects.
 * 
 * @param {HTMLElement|Object} context - Context to resolve.
 * @returns {HTMLElement|null} The resolved DOM element or null.
 */
function resolveContext(context) {
  if (!context) return null;

  // Already a DOM element
  if (context.nodeType === 1) {
    return context;
  }

  // Lazy context
  if (isLazyContext(context)) {
    return context.resolve();
  }

  return null;
}

/**
 * Gets the web application context for toast rendering.
 * This is the primary function for obtaining a toast context in
 * cross-environment applications (React, Next.js, Vue, etc.).
 * 
 * In browser environments, returns document.body immediately.
 * In SSR environments, returns a lazy context that resolves after hydration.
 * 
 * @returns {HTMLElement|Object} The context (HTMLElement or lazy context).
 * 
 * @example
 * // In any environment (browser, SSR, etc.)
 * var context = getWebAppContext();
 * Toast.makeText(context, "Hello!", Toast.LENGTH_SHORT).show();
 * 
 * @example
 * // In React/Next.js
 * import { getWebAppContext } from 'toast-js';
 * 
 * function MyComponent() {
 *   const showToast = () => {
 *     Toast.makeText(getWebAppContext(), "Hello React!", Toast.LENGTH_SHORT).show();
 *   };
 *   return <button onClick={showToast}>Show Toast</button>;
 * }
 */
function getWebAppContext() {
  // Browser environment - return body directly
  if (typeof document !== 'undefined' && document.body) {
    return document.body;
  }

  // SSR or pre-DOM environment - return lazy context
  return createLazyContext();
}

/**
 * Gets a context for a specific container element.
 * Useful when you want toasts to render in a specific container
 * rather than document.body.
 * 
 * @param {string|HTMLElement} container - Container selector or element.
 * @returns {Object} A context object for the specified container.
 * 
 * @example
 * // Using a selector
 * var context = getContextFor('#toast-container');
 * Toast.makeText(context, "Hello!", Toast.LENGTH_SHORT).show();
 * 
 * @example
 * // Using an element
 * var container = document.getElementById('my-container');
 * var context = getContextFor(container);
 * Toast.makeText(context, "Hello!", Toast.LENGTH_SHORT).show();
 */
function getContextFor(container) {
  // Already a DOM element
  if (container && container.nodeType === 1) {
    return container;
  }

  // String selector
  if (typeof container === 'string') {
    // Create a lazy context that resolves to the selector
    var lazyCtx = createLazyContext();
    var originalResolve = lazyCtx.resolve;
    
    lazyCtx.resolve = function() {
      var element = document.querySelector(container);
      if (element) {
        this.forceResolve(element);
        return element;
      }
      // Fallback to body
      return originalResolve.call(this);
    };
    
    return lazyCtx;
  }

  // Fallback to default context
  return getWebAppContext();
}

/**
 * Ensures a context is ready before executing an action.
 * Useful for SSR-safe toast operations.
 * 
 * @param {HTMLElement|Object} context - The context to wait for.
 * @param {Function} action - Action to execute when context is ready.
 * @param {*} [fallback] - Value to return if context never becomes ready.
 * 
 * @example
 * ensureContextReady(context, function(ctx) {
 *   Toast.makeText(ctx, "Hello!", Toast.LENGTH_SHORT).show();
 * });
 */
function ensureContextReady(context, action, fallback) {
  if (typeof action !== 'function') return fallback;

  // Already a DOM element
  if (context && context.nodeType === 1) {
    return action(context);
  }

  // Lazy context
  if (isLazyContext(context)) {
    if (context.isReady()) {
      return action(context.resolve());
    }
    
    context.onReady(function(resolved) {
      if (resolved) {
        action(resolved);
      }
    });
    return fallback;
  }

  return fallback;
}

// Create the Context module object
var Context = {
  getWebAppContext: getWebAppContext,
  getContextFor: getContextFor,
  ensureContextReady: ensureContextReady,
  isLazyContext: isLazyContext,
  resolveContext: resolveContext,
  createLazyContext: createLazyContext
};

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Context;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return Context; });
}