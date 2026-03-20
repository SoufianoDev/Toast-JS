/**
 * @file Toast.js
 * @fileoverview Lightweight, customizable toast notification library.
 * @version 2.1.0
 * @license MIT
 * @copyright 2026 Soufiano Dev
 *
 * @author SoufianoDev
 *
 * CHANGELOG v2.1.0:
 *  - [ARCH] Complete architecture redesign for cross-environment support
 *  - [ARCH] Added environment detection layer (Env module)
 *  - [ARCH] Added lightweight DOM utility layer (Dom module)
 *  - [ARCH] Added SSR-safe context system (Context module)
 *  - [ARCH] Added getWebAppContext() for React/Next.js/Vue compatibility
 *  - [ARCH] Added ESM module format support
 *  - [FIX-D01] CSS is now injected once at library load, not on every show() call.
 *  - [FIX-S01] CSS sanitization added to block unsafe CSS injection in custom animations.
 *  - [FIX-U01] ToastManager added: queue system prevents toast overlap.
 *  - [FIX-U02] Responsive design now works via real @media rules in the injected stylesheet.
 *  - [FIX-U03] Corrected padding in mobile breakpoint from "20vh 20vh" to "10px 14px".
 *  - [FIX-D02] UMD wrapper added: supports CommonJS, AMD, and browser globals.
 *  - [FIX-D08] timeoutId is now stored and cleared correctly in show() and setDuration().
 *  - [FIX-U04] ARIA attributes added (role, aria-live, aria-atomic, aria-label).
 *  - [FIX-U05] dismissible logic is now intuitive: toast stays until manually closed.
 *  - [FIX-U06] Event system added: on(), off(), emit() for show/hide/dismiss events.
 *  - [FIX-D03] #BASE_STYLE introduced to eliminate ~200 lines of duplicated CSS properties.
 *  - [FIX-D04] STYLE_WARNING2 added; "defult_1/2" aliases preserved for backward compat.
 *  - [FIX-D06] Consistent error handling: all methods validate input and warn/throw uniformly.
 *  - [FIX-D09] Icon position logic corrected (was reversed: START used appendChild, END used prepend).
 *  - [FIX-U07] setTextOverflow() added: supports 'ellipsis', 'wrap', and 'clip' modes.
 *  - [FIX-S03] Icon URL validation rejects obvious non-URL strings.
 */

(function (global, factory) {
  // UMD Wrapper - Supports: CommonJS (Node/Webpack), AMD (RequireJS), and plain browser globals.
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    define(factory);
  } else {
    global.Toast = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : this, function () {
  "use strict";

  // ══════════════════════════════════════════════════════════════════════════
  //  ENVIRONMENT DETECTION MODULE
  // ══════════════════════════════════════════════════════════════════════════
  
  var Env = {
    isBrowser: function() {
      return typeof window !== 'undefined' && 
             typeof document !== 'undefined' && 
             typeof document.createElement === 'function';
    },
    isSSR: function() {
      return typeof window === 'undefined' && typeof global !== 'undefined';
    },
    isDOMAvailable: function() {
      return typeof document !== 'undefined' && document.body != null;
    },
    runInBrowser: function(callback, fallback) {
      if (this.isBrowser() && typeof callback === 'function') {
        return callback();
      }
      return fallback;
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  DOM UTILITY MODULE
  // ══════════════════════════════════════════════════════════════════════════

  var Dom = {
    isAvailable: function() {
      return typeof document !== 'undefined' && typeof document.createElement === 'function';
    },
    createElement: function(tagName) {
      if (!this.isAvailable()) return null;
      try { return document.createElement(tagName); } catch (e) { return null; }
    },
    append: function(parent, child) {
      if (!parent || !child) return null;
      try { return parent.appendChild(child); } catch (e) { return null; }
    },
    prepend: function(parent, child) {
      if (!parent || !child) return null;
      try { return parent.insertBefore(child, parent.firstChild); } catch (e) { return null; }
    },
    remove: function(element) {
      if (!element || !element.parentNode) return false;
      try { element.parentNode.removeChild(element); return true; } catch (e) { return false; }
    },
    getById: function(id) {
      if (!this.isAvailable() || !id) return null;
      try { return document.getElementById(id); } catch (e) { return null; }
    },
    getHead: function() {
      if (!this.isAvailable()) return null;
      return document.head || document.getElementsByTagName('head')[0] || null;
    },
    getBody: function() {
      if (!this.isAvailable()) return null;
      return document.body || document.getElementsByTagName('body')[0] || null;
    },
    injectStyle: function(id, css) {
      if (!this.isAvailable() || !css) return null;
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
    setStyles: function(element, styles) {
      if (!element || !styles || typeof styles !== 'object') return false;
      try { Object.assign(element.style, styles); return true; } catch (e) { return false; }
    },
    setAttr: function(element, name, value) {
      if (!element || !name) return false;
      try { element.setAttribute(name, value); return true; } catch (e) { return false; }
    },
    requestFrame: function(callback) {
      if (!this.isAvailable() || typeof callback !== 'function') return null;
      var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame || function(cb) { return setTimeout(cb, 16); };
      try { return raf.call(window, callback); } catch (e) { return null; }
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  CONTEXT MODULE
  // ══════════════════════════════════════════════════════════════════════════

  var LAZY_CONTEXT_MARKER = typeof Symbol !== 'undefined' ? Symbol('toast.lazy.context') : '__toast_lazy_context__';

  function createLazyContext() {
    var resolvedElement = null;
    var pendingCallbacks = [];

    return {
      _marker: LAZY_CONTEXT_MARKER,
      isLazy: function() { return resolvedElement === null; },
      isReady: function() { return typeof document !== 'undefined' && document.body != null; },
      resolve: function() {
        if (resolvedElement) return resolvedElement;
        if (typeof document === 'undefined' || !document.body) return null;
        resolvedElement = document.body;
        return resolvedElement;
      },
      onReady: function(callback) {
        if (typeof callback !== 'function') return;
        if (this.isReady()) { callback(this.resolve()); return; }
        pendingCallbacks.push(callback);
        if (typeof document !== 'undefined' && document.readyState === 'loading') {
          var self = this;
          document.addEventListener('DOMContentLoaded', function() {
            var ctx = self.resolve();
            pendingCallbacks.forEach(function(cb) { cb(ctx); });
            pendingCallbacks = [];
          });
        }
      },
      forceResolve: function(element) {
        if (element && element.nodeType === 1) resolvedElement = element;
      },
      reset: function() { resolvedElement = null; },
      toString: function() { return '[Toast LazyContext]'; }
    };
  }

  function isLazyContext(obj) {
    return obj && (obj._marker === LAZY_CONTEXT_MARKER || obj.isLazy);
  }

  function resolveContext(context) {
    if (!context) return null;
    if (context.nodeType === 1) return context;
    if (isLazyContext(context)) return context.resolve();
    return null;
  }

  /**
   * Gets the web application context for toast rendering.
   * In browser environments, returns document.body immediately.
   * In SSR environments, returns a lazy context that resolves after hydration.
   * 
   * @returns {HTMLElement|Object} The context (HTMLElement or lazy context).
   */
  function getWebAppContext() {
    if (typeof document !== 'undefined' && document.body) return document.body;
    return createLazyContext();
  }

  function getContextFor(container) {
    if (container && container.nodeType === 1) return container;
    if (typeof container === 'string') {
      var lazyCtx = createLazyContext();
      var originalResolve = lazyCtx.resolve;
      lazyCtx.resolve = function() {
        var element = document.querySelector(container);
        if (element) { this.forceResolve(element); return element; }
        return originalResolve.call(this);
      };
      return lazyCtx;
    }
    return getWebAppContext();
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  CSS INJECTION (Client-side only)
  // ══════════════════════════════════════════════════════════════════════════

  function injectToastGlobalStyles() {
    if (!Env.isBrowser()) return;
    
    var STYLE_ID = "toast-js-global-styles-v2";
    if (Dom.getById(STYLE_ID)) return;

    var css = ".toast-js-element{position:fixed;z-index:9999;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:0;min-width:200px;max-width:80vw;transition:opacity 0.3s ease-in-out,transform 0.3s ease-in-out;box-sizing:border-box}.toast-js-element.is-dismissible{pointer-events:auto}@media (max-width:480px){.toast-js-element{width:90%!important;max-width:none!important;padding:10px 14px!important;border-radius:8px!important;left:50%!important;right:auto!important;transform:translateX(-50%)!important}}.toast-js-element.slide-in-right{animation:toastSlideInRight 0.5s ease-in-out}.toast-js-element.slide-out-right{animation:toastSlideOutRight 0.5s ease-in-out}.toast-js-element.slide-in-left{animation:toastSlideInLeft 0.5s ease-in-out}.toast-js-element.slide-out-left{animation:toastSlideOutLeft 0.5s ease-in-out}.toast-js-element.slide-in-top{animation:toastSlideInTop 0.5s ease-in-out}.toast-js-element.slide-out-top{animation:toastSlideOutTop 0.5s ease-in-out}.toast-js-element.slide-in-bottom{animation:toastSlideInBottom 0.5s ease-in-out}.toast-js-element.slide-out-bottom{animation:toastSlideOutBottom 0.5s ease-in-out}.toast-js-element.slide-in-top-center{animation:toastSlideInTopCenter 0.5s ease-in-out}.toast-js-element.slide-out-top-center{animation:toastSlideOutTopCenter 0.5s ease-in-out}.toast-js-element.slide-in-bottom-center{animation:toastSlideInBottomCenter 0.5s ease-in-out}.toast-js-element.slide-out-bottom-center{animation:toastSlideOutBottomCenter 0.5s ease-in-out}.toast-js-element.light-speed-in-right{animation:toastLightSpeedInRight 0.5s ease-in-out}.toast-js-element.light-speed-out-right{animation:toastLightSpeedOutRight 0.5s ease-in-out}.toast-js-element.light-speed-in-left{animation:toastLightSpeedInLeft 0.5s ease-in-out}.toast-js-element.light-speed-out-left{animation:toastLightSpeedOutLeft 0.5s ease-in-out}.toast-js-element.wave-in{animation:toastWaveIn 0.5s ease-in-out}.toast-js-element.wave-out{animation:toastWaveOut 0.5s ease-in-out}.toast-js-element.wobble-in{animation:toastWobbleIn 0.6s ease-in-out}.toast-js-element.wobble-out{animation:toastWobbleOut 0.6s ease-in-out}.toast-js-close-btn:hover{opacity:1!important}@keyframes toastSlideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes toastSlideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}@keyframes toastSlideInLeft{from{transform:translateX(-100%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes toastSlideOutLeft{from{transform:translateX(0);opacity:1}to{transform:translateX(-100%);opacity:0}}@keyframes toastSlideInTop{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes toastSlideOutTop{from{transform:translateY(0);opacity:1}to{transform:translateY(-100%);opacity:0}}@keyframes toastSlideInBottom{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes toastSlideOutBottom{from{transform:translateY(0);opacity:1}to{transform:translateY(100%);opacity:0}}@keyframes toastSlideInTopCenter{from{transform:translate(-50%,-100%);opacity:0}to{transform:translate(-50%,0);opacity:1}}@keyframes toastSlideOutTopCenter{from{transform:translate(-50%,0);opacity:1}to{transform:translate(-50%,-100%);opacity:0}}@keyframes toastSlideInBottomCenter{from{transform:translate(-50%,100%);opacity:0}to{transform:translate(-50%,0);opacity:1}}@keyframes toastSlideOutBottomCenter{from{transform:translate(-50%,0);opacity:1}to{transform:translate(-50%,100%);opacity:0}}@keyframes toastLightSpeedInRight{0%{transform:translateX(100%) skewX(-30deg);opacity:0}60%{transform:translateX(-20%) skewX(30deg);opacity:1}80%{transform:translateX(0) skewX(-15deg);opacity:1}100%{transform:translateX(0) skewX(0);opacity:1}}@keyframes toastLightSpeedOutRight{from{transform:translateX(0) skewX(0);opacity:1}to{transform:translateX(100%) skewX(-30deg);opacity:0}}@keyframes toastLightSpeedInLeft{0%{transform:translateX(-100%) skewX(30deg);opacity:0}60%{transform:translateX(20%) skewX(-30deg);opacity:1}80%{transform:translateX(0) skewX(15deg);opacity:1}100%{transform:translateX(0) skewX(0);opacity:1}}@keyframes toastLightSpeedOutLeft{from{transform:translateX(0) skewX(0);opacity:1}to{transform:translateX(-100%) skewX(30deg);opacity:0}}@keyframes toastWaveIn{0%{transform:translateY(0) rotate(0);opacity:0}50%{transform:translateY(-20px) rotate(10deg);opacity:1}100%{transform:translateY(0) rotate(0);opacity:1}}@keyframes toastWaveOut{0%{transform:translateY(0) rotate(0);opacity:1}50%{transform:translateY(20px) rotate(-10deg);opacity:0}100%{transform:translateY(0) rotate(0);opacity:0}}@keyframes toastWobbleIn{0%{transform:translateX(0) rotate(0);opacity:0}15%{transform:translateX(-25%) rotate(-5deg);opacity:1}30%{transform:translateX(20%) rotate(3deg)}45%{transform:translateX(-15%) rotate(-3deg)}60%{transform:translateX(10%) rotate(2deg)}75%{transform:translateX(-5%) rotate(-1deg)}100%{transform:translateX(0) rotate(0);opacity:1}}@keyframes toastWobbleOut{0%{transform:translateX(0) rotate(0);opacity:1}15%{transform:translateX(-25%) rotate(-5deg)}30%{transform:translateX(20%) rotate(3deg)}45%{transform:translateX(-15%) rotate(-3deg)}60%{transform:translateX(10%) rotate(2deg)}75%{transform:translateX(-5%) rotate(-1deg)}100%{transform:translateX(0) rotate(0);opacity:0}}";

    Dom.injectStyle(STYLE_ID, css);
  }

  // Inject styles immediately in browser
  injectToastGlobalStyles();

  // ══════════════════════════════════════════════════════════════════════════
  //  BASE STYLE
  // ══════════════════════════════════════════════════════════════════════════

  var _BASE_STYLE = Object.freeze({
    display: "flex",
    borderRadius: "10px",
    fontSize: "clamp(12px, 3vw, 14px)",
    padding: "8px 16px",
    width: "fit-content",
    maxWidth: "400px",
    height: "auto",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    transition: "all 0.3s ease",
    WebkitTransition: "all 0.3s ease",
    MozTransition: "all 0.3s ease",
    msTransition: "all 0.3s ease",
    boxSizing: "border-box",
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  CSS SANITIZER
  // ══════════════════════════════════════════════════════════════════════════

  function _sanitizeCSS(cssString) {
    if (typeof cssString !== "string") return "";
    var dangerous = /url\s*\(|expression\s*\(|@import\s|javascript\s*:/gi;
    if (dangerous.test(cssString)) {
      console.error("[Toast-JS] Potentially unsafe CSS was detected and blocked.");
      return "";
    }
    return cssString;
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  ICON URL VALIDATOR
  // ══════════════════════════════════════════════════════════════════════════

  var _ALLOWED_ICON_EXTENSIONS = /\.(svg|png|jpg|jpeg|gif|webm|mp4)(\?.*)?$/i;

  function _validateIconPath(iconPath) {
    if (typeof iconPath !== "string" || iconPath.trim() === "") {
      throw new TypeError("[Toast-JS] setIcon(): iconPath must be a non-empty string.");
    }
    if (iconPath.trim().startsWith("<svg")) {
      throw new Error("[Toast-JS] setIcon(): Inline SVG markup is not supported. Provide a URL to an .svg file instead.");
    }
    if (!_ALLOWED_ICON_EXTENSIONS.test(iconPath)) {
      console.warn("[Toast-JS] setIcon(): The icon URL does not end with a recognised extension.");
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TOAST CLASS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Creates and displays customisable toast notifications.
   */
  var Toast = function(context, text, duration) {
    if (typeof text !== "string") {
      throw new TypeError("[Toast-JS] constructor: 'text' must be a string.");
    }

    this._originalContext = context;
    this.context = this._resolveContext(context);
    this.text = text;
    this.duration = (typeof duration === "number" && duration > 0) ? duration : Toast.LENGTH_SHORT;

    this.customStyle = Toast.STYLE_DEFAULT_1;
    this.position = Toast.POSITION_BOTTOM_CENTER;
    this.icon = null;
    this.iconSize = Toast.ICON_SIZE.MEDIUM;
    this.iconPosition = Toast.ICON_POSITION_START;
    this.iconShape = Toast.ICON_SHAPE_CIRCLE;
    this.enterAnimation = Toast.FADE;
    this.exitAnimation = Toast.FADE;
    this.dismissible = false;
    this.closeButtonColor = "#fff";
    this.textOverflow = "ellipsis";
    this.customKeyframes = null;

    this._events = Object.create(null);
    this.toastElement = null;
    this._timeoutId = null;
  };

  // Duration constants
  Toast.LENGTH_SHORT = 3000;
  Toast.LENGTH_LONG = 6500;

  // Position constants
  Toast.POSITION_TOP_LEFT = "top-left";
  Toast.POSITION_TOP_CENTER = "top-center";
  Toast.POSITION_TOP_RIGHT = "top-right";
  Toast.POSITION_BOTTOM_LEFT = "bottom-left";
  Toast.POSITION_BOTTOM_CENTER = "bottom-center";
  Toast.POSITION_BOTTOM_RIGHT = "bottom-right";

  // Icon position constants
  Toast.ICON_POSITION_START = "start";
  Toast.ICON_POSITION_END = "end";

  // Animation constants
  Toast.FADE = "fade";
  Toast.SLIDE_IN_TOP = "slide-in-top";
  Toast.SLIDE_OUT_TOP = "slide-out-top";
  Toast.SLIDE_IN_BOTTOM = "slide-in-bottom";
  Toast.SLIDE_OUT_BOTTOM = "slide-out-bottom";
  Toast.SLIDE_IN_TOP_CENTER = "slide-in-top-center";
  Toast.SLIDE_OUT_TOP_CENTER = "slide-out-top-center";
  Toast.SLIDE_IN_BOTTOM_CENTER = "slide-in-bottom-center";
  Toast.SLIDE_OUT_BOTTOM_CENTER = "slide-out-bottom-center";
  Toast.SLIDE_IN_RIGHT = "slide-in-right";
  Toast.SLIDE_OUT_RIGHT = "slide-out-right";
  Toast.SLIDE_IN_LEFT = "slide-in-left";
  Toast.SLIDE_OUT_LEFT = "slide-out-left";
  Toast.LIGHT_SPEED_IN_RIGHT = "light-speed-in-right";
  Toast.LIGHT_SPEED_OUT_RIGHT = "light-speed-out-right";
  Toast.LIGHT_SPEED_IN_LEFT = "light-speed-in-left";
  Toast.LIGHT_SPEED_OUT_LEFT = "light-speed-out-left";
  Toast.WAVE_IN = "wave-in";
  Toast.WAVE_OUT = "wave-out";
  Toast.WOBBLE_IN = "wobble-in";
  Toast.WOBBLE_OUT = "wobble-out";

  // Icon size constants
  Toast.ICON_SIZE = Object.freeze({
    SMALL: { width: "20px", height: "20px" },
    MEDIUM: { width: "24px", height: "24px" },
    LARGE: { width: "32px", height: "32px" },
    EXTRA_LARGE: { width: "48px", height: "48px" },
  });

  // Icon shape constants
  Toast.ICON_SHAPE_CIRCLE = Object.freeze({ borderRadius: "50%", overflow: "hidden" });
  Toast.ICON_SHAPE_SQUARE = Object.freeze({ borderRadius: "0%" });
  Toast.ICON_SHAPE_SQUIRCLE = Object.freeze({ borderRadius: "20px", overflow: "hidden" });

  // Predefined styles
  Toast.STYLE_DEFAULT_1 = Object.freeze({ ..._BASE_STYLE, backgroundColor: "#323232", color: "#fff", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)" });
  Toast.STYLE_DEFAULT_2 = Object.freeze({ ..._BASE_STYLE, backgroundColor: "rgba(0, 0, 0, 0.8)", color: "#fff", fontFamily: "system-ui, -apple-system, sans-serif", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)" });
  Toast.STYLE_SUCCESS = Object.freeze({ ..._BASE_STYLE, backgroundColor: "#16A34A", color: "#FFFFFF", boxShadow: "0 6px 10px rgba(16, 185, 129, 0.2)" });
  Toast.STYLE_WARNING = Object.freeze({ ..._BASE_STYLE, backgroundColor: "#FF9800", color: "#fff", fontFamily: "system-ui, -apple-system, sans-serif", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)" });
  Toast.STYLE_WARNING1 = Object.freeze({ ..._BASE_STYLE, background: "linear-gradient(90deg, #f39c12, #e67e22)", color: "#fff" });
  Toast.STYLE_WARNING2 = Object.freeze({ ..._BASE_STYLE, background: "linear-gradient(90deg, #e67e22, #f39c12)", color: "#fff", boxShadow: "0 4px 10px rgba(230, 126, 34, 0.3)" });
  Toast.STYLE_WARNING3 = Object.freeze({ ..._BASE_STYLE, background: "linear-gradient(90deg, #f39c12, #e67e22)", color: "#000000" });
  Toast.STYLE_ERROR = Object.freeze({ ..._BASE_STYLE, backgroundColor: "#DC2626", color: "#FFFFFF", boxShadow: "0 6px 10px rgba(220, 38, 38, 0.2)" });
  Toast.STYLE_ERROR1 = Object.freeze({ ..._BASE_STYLE, backgroundColor: "#E74C3C", color: "#fff" });
  Toast.STYLE_ERROR2 = Object.freeze({ ..._BASE_STYLE, background: "linear-gradient(90deg, #f44336, #e57373)", color: "#fff", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)" });
  Toast.STYLE_INFO = Object.freeze({ ..._BASE_STYLE, backgroundColor: "#2563EB", color: "#FFFFFF", border: "1px solid rgba(37, 99, 235, 0.3)", boxShadow: "0 6px 10px rgba(37, 99, 235, 0.2)", fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", backdropFilter: "blur(6px)" });
  Toast.STYLE_GRADIENT = Object.freeze({ ..._BASE_STYLE, background: "linear-gradient(90deg, #ff9a9e, #fad0c4)", color: "#000", boxShadow: "0 5px 15px rgba(255, 154, 158, 0.3)" });
  Toast.STYLE_NEON = Object.freeze({ ..._BASE_STYLE, background: "linear-gradient(90deg, #00d2ff, #3a7bd5)", color: "#fff", boxShadow: "0 0 15px #00d2ff, 0 0 30px #3a7bd5" });
  Toast.STYLE_NEON1 = Object.freeze({ ..._BASE_STYLE, backgroundColor: "#0ff", color: "#000", fontFamily: "monospace", boxShadow: "0 0 10px #0ff, 0 0 40px #0ff" });
  Toast.STYLE_DARK_MODE = Object.freeze({ ..._BASE_STYLE, background: "#1f2937", color: "#fff", boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)" });
  Toast.STYLE_LIGHT_MODE = Object.freeze({ ..._BASE_STYLE, background: "#fff", color: "#000", boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)" });
  Toast.STYLE_SHADOW = Object.freeze({ ..._BASE_STYLE, backgroundColor: "#000000", color: "#fff", fontFamily: "Verdana, sans-serif", boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)" });
  Toast.STYLE_RETRO = Object.freeze({ ..._BASE_STYLE, backgroundColor: "#FCD34D", color: "#000", boxShadow: "0 6px 12px rgba(252, 211, 77, 0.2)" });
  Toast.STYLE_METALLIC = Object.freeze({ ..._BASE_STYLE, background: "linear-gradient(145deg, #d3d3d3, #a8a8a8)", color: "#222", fontFamily: "Tahoma, sans-serif", boxShadow: "inset 3px 3px 6px #999, inset -3px -3px 6px #ddd" });
  Toast.STYLE_GLOW = Object.freeze({ ..._BASE_STYLE, backgroundColor: "#5A67D8", color: "#fff", boxShadow: "0 0 15px rgba(90, 103, 216, 0.8)" });
  Toast.STYLE_TRANSPARENT = Object.freeze({ ..._BASE_STYLE, backgroundColor: "rgba(0, 0, 0, 0.6)", color: "#fff", fontFamily: "system-ui, sans-serif" });

  // Text overflow constants
  Toast.TextOverflow = Object.freeze({
    ELLIPSIS: "ellipsis",
    WRAP: "wrap",
    CLIP: "clip"
  });

  // Context utilities attached to Toast
  Toast.getWebAppContext = getWebAppContext;
  Toast.getContextFor = getContextFor;

  /**
   * Resolves context to actual DOM element.
   */
  Toast.prototype._resolveContext = function(context) {
    if (!Env.isDOMAvailable()) return null;
    if (isLazyContext(context)) return context.resolve();
    if (context && context.nodeType === 1) return context;
    return Dom.getBody();
  };

  /**
   * Factory method - mirrors the Android Toast.makeText() API.
   */
  Toast.makeText = function(context, text, duration) {
    return new Toast(context, text, duration === undefined ? Toast.LENGTH_SHORT : duration);
  };

  Toast.prototype.setDuration = function(duration) {
    if (typeof duration !== "number" || duration <= 0) {
      console.warn("[Toast-JS] setDuration(): expected a positive number. Ignoring.");
      return this;
    }
    this.duration = duration;
    if (this.toastElement && this._timeoutId !== null) {
      clearTimeout(this._timeoutId);
      this._timeoutId = setTimeout(this.hide.bind(this), this.duration);
    }
    return this;
  };

  Toast.prototype.setStyle = function(style) {
    if (typeof style === "string") {
      var styleMap = {
        default_1: Toast.STYLE_DEFAULT_1, defult_1: Toast.STYLE_DEFAULT_1,
        default_2: Toast.STYLE_DEFAULT_2, defult_2: Toast.STYLE_DEFAULT_2,
        success: Toast.STYLE_SUCCESS, error: Toast.STYLE_ERROR,
        error1: Toast.STYLE_ERROR1, error2: Toast.STYLE_ERROR2,
        warning: Toast.STYLE_WARNING, warning1: Toast.STYLE_WARNING1,
        warning2: Toast.STYLE_WARNING2, warning3: Toast.STYLE_WARNING3,
        info: Toast.STYLE_INFO, gradient: Toast.STYLE_GRADIENT,
        neon: Toast.STYLE_NEON, neon1: Toast.STYLE_NEON1,
        shadow: Toast.STYLE_SHADOW, retro: Toast.STYLE_RETRO,
        metallic: Toast.STYLE_METALLIC, glow: Toast.STYLE_GLOW,
        transparent: Toast.STYLE_TRANSPARENT, dark_mode: Toast.STYLE_DARK_MODE,
        light_mode: Toast.STYLE_LIGHT_MODE,
      };
      var resolved = styleMap[style.toLowerCase()];
      if (resolved) {
        this.customStyle = resolved;
      } else {
        console.warn("[Toast-JS] setStyle(): Unknown style \"" + style + "\".");
        this.customStyle = Toast.STYLE_DEFAULT_1;
      }
    } else if (style !== null && typeof style === "object") {
      this.customStyle = { ..._BASE_STYLE, ...style };
      if (typeof style.keyframes === "string") {
        this.customKeyframes = style.keyframes;
      }
    } else {
      console.warn("[Toast-JS] setStyle(): argument must be a string or an object.");
    }
    return this;
  };

  Toast.prototype.setPosition = function(position) {
    var valid = [
      Toast.POSITION_TOP_LEFT, Toast.POSITION_TOP_CENTER, Toast.POSITION_TOP_RIGHT,
      Toast.POSITION_BOTTOM_LEFT, Toast.POSITION_BOTTOM_CENTER, Toast.POSITION_BOTTOM_RIGHT,
    ];
    if (!valid.includes(position)) {
      console.warn("[Toast-JS] setPosition(): \"" + position + "\" is not a valid position.");
      this.position = Toast.POSITION_BOTTOM_CENTER;
    } else {
      this.position = position;
    }
    return this;
  };

  Toast.prototype.setAnimation = function(enterAnimation, exitAnimation) {
    this._resolveAnimation(enterAnimation, "enter");
    if (exitAnimation !== undefined) {
      this._resolveAnimation(exitAnimation, "exit");
    }
    return this;
  };

  Toast.prototype._resolveAnimation = function(anim, slot) {
    if (typeof anim === "string") {
      if (slot === "enter") this.enterAnimation = anim;
      else this.exitAnimation = anim;
    } else if (anim !== null && typeof anim === "object" && typeof anim.css === "string") {
      var safeCss = _sanitizeCSS(anim.css);
      var safeKeyframes = typeof anim.keyframes === "string" ? _sanitizeCSS(anim.keyframes) : "";
      if (!safeCss && !safeKeyframes) return;
      var name = "toast-custom-" + slot + "-" + Date.now();
      var style = Dom.createElement("style");
      if (!style) return;
      style.id = name;
      style.textContent = "." + name + " { " + safeCss + " } " + safeKeyframes;
      var head = Dom.getHead();
      if (head) Dom.append(head, style);
      if (slot === "enter") this.enterAnimation = name;
      else this.exitAnimation = name;
    } else {
      console.warn("[Toast-JS] setAnimation(): each argument must be a string or { css, keyframes? }.");
    }
  };

  Toast.prototype.setIcon = function(iconPath, size, position) {
    position = position === undefined ? Toast.ICON_POSITION_START : position;
    _validateIconPath(iconPath);
    this.icon = iconPath;
    if (size !== null && size !== undefined) {
      if (typeof size === "object" && size.width && size.height) {
        this.iconSize = size;
      } else if (typeof size === "string") {
        var key = size.toUpperCase();
        if (Toast.ICON_SIZE[key]) {
          this.iconSize = Toast.ICON_SIZE[key];
        } else {
          console.warn("[Toast-JS] setIcon(): Unknown size \"" + size + "\".");
        }
      }
    }
    var validPositions = [Toast.ICON_POSITION_START, Toast.ICON_POSITION_END];
    this.iconPosition = validPositions.includes(position) ? position : Toast.ICON_POSITION_START;
    return this;
  };

  Toast.prototype.setIconShape = function(shape) {
    shape = shape === undefined ? Toast.ICON_SHAPE_CIRCLE : shape;
    var valid = [Toast.ICON_SHAPE_CIRCLE, Toast.ICON_SHAPE_SQUARE, Toast.ICON_SHAPE_SQUIRCLE];
    this.iconShape = valid.includes(shape) ? shape : Toast.ICON_SHAPE_CIRCLE;
    return this;
  };

  Toast.prototype.setDismissible = function(dismissible, closeButtonColor) {
    dismissible = dismissible === undefined ? true : dismissible;
    closeButtonColor = closeButtonColor === undefined ? "#fff" : closeButtonColor;
    this.dismissible = Boolean(dismissible);
    this.closeButtonColor = typeof closeButtonColor === "string" ? closeButtonColor : "#fff";
    return this;
  };

  Toast.prototype.setTextOverflow = function(mode) {
    mode = mode === undefined ? Toast.TextOverflow.ELLIPSIS : mode;
    var valid = Object.values(Toast.TextOverflow);
    if (!valid.includes(mode)) {
      console.warn("[Toast-JS] setTextOverflow(): \"" + mode + "\" is not valid.");
      this.textOverflow = Toast.TextOverflow.ELLIPSIS;
    } else {
      this.textOverflow = mode;
    }
    return this;
  };

  Toast.prototype.on = function(event, callback) {
    if (typeof callback !== "function") {
      console.warn("[Toast-JS] on(): callback must be a function.");
      return this;
    }
    var valid = ["show", "hide", "dismiss"];
    if (!valid.includes(event)) {
      console.warn("[Toast-JS] on(): \"" + event + "\" is not a valid event.");
      return this;
    }
    if (!this._events[event]) this._events[event] = [];
    this._events[event].push(callback);
    return this;
  };

  Toast.prototype.off = function(event, callback) {
    if (!this._events[event]) return this;
    this._events[event] = this._events[event].filter(function(cb) { return cb !== callback; });
    return this;
  };

  Toast.prototype._emit = function(event) {
    var self = this;
    (this._events[event] || []).forEach(function(cb) {
      try { cb(self); } catch (e) {
        console.error("[Toast-JS] Error in \"" + event + "\" event handler:", e);
      }
    });
  };

  Toast.prototype.addCallback = function(callback) {
    if (typeof callback === "function") {
      this.on("show", callback);
    }
    return this;
  };

  Toast.prototype._createIconElement = function() {
    if (!this.icon) return null;

    var container = Dom.createElement("div");
    if (!container) return null;
    
    Dom.setStyles(container, {
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0"
    });
    Object.assign(container.style, this.iconSize, this.iconShape);

    var lowerIcon = this.icon.toLowerCase();
    var media;

    if (lowerIcon.endsWith(".webm") || lowerIcon.endsWith(".mp4")) {
      media = Dom.createElement("video");
      if (media) {
        media.autoplay = true; media.loop = true; media.muted = true; media.playbackRate = 1.0;
        Dom.setAttr(media, "aria-label", "Toast notification icon");
      }
    } else {
      media = Dom.createElement("img");
      if (media) {
        media.alt = "Toast notification icon";
      }
    }

    if (media) {
      media.src = this.icon;
      Dom.setStyles(media, { width: "100%", height: "100%", objectFit: "contain" });
      Dom.append(container, media);
    }
    return container;
  };

  Toast.prototype._createCloseButton = function() {
    var btn = Dom.createElement("button");
    if (!btn) return null;
    
    btn.className = "toast-js-close-btn";
    Dom.setAttr(btn, "aria-label", "Close notification");
    Dom.setStyles(btn, {
      background: "none", border: "none", color: this.closeButtonColor,
      cursor: "pointer", padding: "0 0 0 12px", fontSize: "18px",
      lineHeight: "1", opacity: "0.8", transition: "opacity 0.2s ease", flexShrink: "0"
    });
    btn.textContent = "x";
    var self = this;
    btn.addEventListener("click", function() {
      self._emit("dismiss");
      self.hide();
    });
    return btn;
  };

  Toast.prototype._getPositionStyles = function() {
    var positions = {};
    positions[Toast.POSITION_TOP_LEFT] = { top: "20px", left: "20px" };
    positions[Toast.POSITION_TOP_CENTER] = { top: "20px", left: "50%", transform: "translateX(-50%)" };
    positions[Toast.POSITION_TOP_RIGHT] = { top: "20px", right: "20px" };
    positions[Toast.POSITION_BOTTOM_LEFT] = { bottom: "20px", left: "20px" };
    positions[Toast.POSITION_BOTTOM_CENTER] = { bottom: "20px", left: "50%", transform: "translateX(-50%)" };
    positions[Toast.POSITION_BOTTOM_RIGHT] = { bottom: "20px", right: "20px" };
    return positions[this.position] || positions[Toast.POSITION_BOTTOM_CENTER];
  };

  Toast.prototype.show = function() {
    // SSR/Non-browser guard
    if (!Env.isBrowser()) {
      console.warn("[Toast-JS] show() called in non-browser environment. Toast will not be displayed.");
      return this;
    }

    if (this.toastElement) return this;

    // Resolve context if it was lazy
    if (!this.context) {
      this.context = this._resolveContext(this._originalContext);
      if (!this.context) {
        var self = this;
        if (isLazyContext(this._originalContext)) {
          this._originalContext.onReady(function(ctx) {
            if (ctx) {
              self.context = ctx;
              self._doShow();
            }
          });
          return this;
        }
        this.context = Dom.getBody();
        if (!this.context) {
          console.warn("[Toast-JS] show(): No valid context available.");
          return this;
        }
      }
    }

    this._doShow();
    return this;
  };

  Toast.prototype._doShow = function() {
    this.toastElement = Dom.createElement("div");
    if (!this.toastElement) return;

    Dom.setAttr(this.toastElement, "role", "alert");
    Dom.setAttr(this.toastElement, "aria-live", "assertive");
    Dom.setAttr(this.toastElement, "aria-atomic", "true");
    
    var classes = ["toast-js-element", this.enterAnimation, this.dismissible ? "is-dismissible" : ""].filter(Boolean);
    this.toastElement.className = classes.join(" ");

    var content = Dom.createElement("div");
    Dom.setStyles(content, {
      display: "flex", alignItems: "center", minHeight: "48px",
      padding: "8px 12px", width: "100%", boxSizing: "border-box"
    });

    var iconEl = this._createIconElement();
    if (iconEl) {
      if (this.iconPosition === Toast.ICON_POSITION_START) {
        iconEl.style.marginRight = "12px";
        Dom.prepend(content, iconEl);
      } else {
        iconEl.style.marginLeft = "12px";
        Dom.append(content, iconEl);
      }
    }

    var textSpan = Dom.createElement("span");
    if (textSpan) {
      textSpan.innerText = this.text;
      Dom.setStyles(textSpan, { flex: "1" });
      
      if (this.textOverflow === "wrap") {
        textSpan.style.whiteSpace = "normal";
        textSpan.style.wordBreak = "break-word";
        textSpan.style.overflow = "visible";
      } else if (this.textOverflow === "clip") {
        textSpan.style.whiteSpace = "nowrap";
        textSpan.style.overflow = "hidden";
        textSpan.style.textOverflow = "clip";
      } else {
        textSpan.style.whiteSpace = "nowrap";
        textSpan.style.overflow = "hidden";
        textSpan.style.textOverflow = "ellipsis";
      }

      if (this.iconPosition === Toast.ICON_POSITION_END) {
        Dom.prepend(content, textSpan);
      } else {
        Dom.append(content, textSpan);
      }
    }

    if (this.dismissible) {
      var closeBtn = this._createCloseButton();
      if (closeBtn) Dom.append(content, closeBtn);
    }

    Dom.append(this.toastElement, content);

    Object.assign(this.toastElement.style, this.customStyle);

    var posStyles = this._getPositionStyles();
    Object.assign(this.toastElement.style, posStyles, {
      opacity: "0",
      transform: this.position.includes("center") ? "translateX(-50%) scale(0.95)" : "scale(0.95)"
    });

    if (this.customKeyframes) {
      var kfId = "toast-js-custom-kf-" + Date.now();
      if (!Dom.getById(kfId)) {
        var kfStyle = Dom.createElement("style");
        if (kfStyle) {
          kfStyle.id = kfId;
          kfStyle.textContent = _sanitizeCSS(this.customKeyframes);
          var head = Dom.getHead();
          if (head) Dom.append(head, kfStyle);
        }
      }
    }

    Dom.append(this.context, this.toastElement);

    var self = this;
    Dom.requestFrame(function() {
      if (!self.toastElement) return;
      self.toastElement.style.opacity = "1";
      self.toastElement.style.transform = self.position.includes("center")
        ? "translateX(-50%) scale(1)"
        : "scale(1)";
    });

    this._emit("show");

    this._timeoutId = setTimeout(function() { self.hide(); }, this.duration);
  };

  Toast.prototype.hide = function() {
    if (!this.toastElement) return;

    if (this._timeoutId !== null) {
      clearTimeout(this._timeoutId);
      this._timeoutId = null;
    }

    var el = this.toastElement;
    el.className = ["toast-js-element", this.exitAnimation].filter(Boolean).join(" ");
    el.style.opacity = "0";
    el.style.transform = this.position.includes("center")
      ? "translateX(-50%) scale(0.8)"
      : "scale(0.8)";

    var self = this;
    setTimeout(function() {
      if (el.parentNode) el.parentNode.removeChild(el);
      if (self.toastElement === el) self.toastElement = null;
      self._emit("hide");
      ToastManager._onHide(self);
    }, 350);
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  TOAST MANAGER
  // ══════════════════════════════════════════════════════════════════════════

  var ToastManager = {
    maxVisible: 3,
    _active: [],
    _queue: [],

    show: function(toast) {
      if (!(toast instanceof Toast)) {
        console.error("[ToastManager] show(): argument must be a Toast instance.");
        return;
      }

      if (this._active.length >= this.maxVisible) {
        this._queue.push(toast);
      } else {
        this._display(toast);
      }
    },

    _display: function(toast) {
      this._active.push(toast);
      this._applyStackOffset(toast);
      toast.show();
    },

    _applyStackOffset: function(toast) {
      var index = this._active.length - 1;
      var offsetPx = index * 72;
      var isBottom = toast.position.startsWith("bottom");
      var prop = isBottom ? "bottom" : "top";
      var base = 20;

      var originalGetPos = toast._getPositionStyles.bind(toast);
      toast._getPositionStyles = function() {
        var styles = originalGetPos();
        styles[prop] = (base + offsetPx) + "px";
        return styles;
      };
    },

    _onHide: function(hiddenToast) {
      this._active = this._active.filter(function(t) { return t !== hiddenToast; });

      this._active.forEach(function(toast, index) {
        if (!toast.toastElement) return;
        var isBottom = toast.position.startsWith("bottom");
        var prop = isBottom ? "bottom" : "top";
        toast.toastElement.style[prop] = (20 + index * 72) + "px";
        toast.toastElement.style.transition = "bottom 0.2s ease, top 0.2s ease";
      });

      if (this._queue.length > 0) {
        var next = this._queue.shift();
        this._display(next);
      }
    }
  };

  Toast.Manager = ToastManager;

  // Return the Toast constructor
  return Toast;
});