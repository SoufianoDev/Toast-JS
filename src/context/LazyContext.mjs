// @ts-check
/**
 * Lazy context resolution.
 *
 * A lazy context defers DOM access until a runtime operation needs it. In a
 * browser it resolves to an element; in SSR it resolves to `null` rather than
 * reaching for a DOM global that is not there.
 *
 * Nothing here touches a DOM global at module evaluation time, so importing
 * the module stays safe in Node and SSR.
 */

/**
 * A context that resolves once the document body exists.
 *
 * @typedef {object} LazyContext
 * @property {symbol | string} _marker Identifies a lazy context.
 * @property {() => boolean} isLazy Whether it has not resolved yet.
 * @property {() => boolean} isReady Whether the document body is available.
 * @property {() => Element | null} resolve The element, or `null` in SSR.
 * @property {(callback: (context: Element | null) => void) => void} onReady Runs a callback when the context is available.
 * @property {(element: Element) => void} forceResolve Pins the context to an element.
 * @property {() => void} reset Forgets the resolved element.
 * @property {() => string} toString
 */

const LAZY_CONTEXT_MARKER = typeof Symbol !== 'undefined'
  ? Symbol('toast.lazy.context')
  : '__toast_lazy_context__';

/**
 * The document body, or `null` when there is no DOM.
 *
 * @returns {Element | null}
 */
export function getBody() {
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') return null;
  return document.body || document.getElementsByTagName('body')[0] || null;
}

/**
 * Creates a context that resolves once the document body exists.
 *
 * @returns {LazyContext}
 */
export function createLazyContext() {
  /** @type {Element | null} */
  let resolvedElement = null;
  /** @type {Array<(context: Element | null) => void>} */
  const pendingCallbacks = [];

  /** @returns {Element | null} */
  const resolve = () => {
    if (resolvedElement) return resolvedElement;
    if (typeof document === 'undefined' || !document.body) return null;
    resolvedElement = document.body;
    return resolvedElement;
  };

  return {
    _marker: LAZY_CONTEXT_MARKER,

    isLazy: () => resolvedElement === null,

    isReady: () => typeof document !== 'undefined' && document.body != null,

    resolve,

    onReady: (callback) => {
      if (typeof callback !== 'function') return;
      if (typeof document !== 'undefined' && document.body != null) {
        callback(resolve());
        return;
      }
      pendingCallbacks.push(callback);
      if (typeof document !== 'undefined' && document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          const context = resolve();
          pendingCallbacks.forEach((pending) => pending(context));
          pendingCallbacks.length = 0;
        });
      }
    },

    forceResolve: (element) => {
      if (element && element.nodeType === 1) resolvedElement = element;
    },

    reset: () => {
      resolvedElement = null;
    },

    toString: () => '[Toast LazyContext]',
  };
}

/**
 * @param {unknown} candidate
 * @returns {candidate is LazyContext} Whether the value is a lazy context.
 */
export function isLazyContext(candidate) {
  if (!candidate || typeof candidate !== 'object') return false;
  const lazy = /** @type {{ _marker?: unknown, isLazy?: unknown }} */ (candidate);
  return lazy._marker === LAZY_CONTEXT_MARKER || typeof lazy.isLazy === 'function';
}

/**
 * The context to render into.
 *
 * @returns {Element | LazyContext} The body, or a lazy context in SSR.
 */
export function getWebAppContext() {
  if (typeof document !== 'undefined' && document.body) return document.body;
  return createLazyContext();
}

/**
 * Resolves a container reference to a render target.
 *
 * @param {unknown} container An element, a CSS selector, or anything else.
 * @returns {Element | LazyContext}
 */
export function getContextFor(container) {
  if (container && typeof container === 'object' && /** @type {Node} */ (container).nodeType === 1) {
    return /** @type {Element} */ (container);
  }
  if (typeof container === 'string') {
    const lazyContext = createLazyContext();
    const baseResolve = lazyContext.resolve;
    lazyContext.resolve = () => {
      if (typeof document === 'undefined') return null;
      const element = document.querySelector(container);
      if (element) {
        lazyContext.forceResolve(element);
        return element;
      }
      return baseResolve();
    };
    return lazyContext;
  }
  return getWebAppContext();
}
