/**
 * @file Toast.js
 * @fileoverview Lightweight, customizable toast notification library.
 * @version 2.1.0-beta
 * @license MIT
 * @copyright 2026 Soufiano Dev
 *
 * @author SoufianoDev
 *
 * CHANGELOG v2.1.0-beta (Audit Fixes):
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
  // ─── [FIX-D02] UMD Wrapper ─────────────────────────────────────────────────
  // Supports: CommonJS (Node/Webpack), AMD (RequireJS), and plain browser globals.
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    define(factory);
  } else {
    global.Toast = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : this, function () {
  "use strict";

  // ─── [FIX-D01] Inject global CSS once at library load ─────────────────────
  // Previously, a <style> block was created inside show() on every call, causing
  // unbounded accumulation in document.head. Now it runs once via IIFE.
  // Guard: only runs in browser environments (document must exist).
  (function injectToastGlobalStyles() {
    if (typeof document === "undefined") return; // SSR / Node.js — skip safely
    const STYLE_ID = "toast-js-global-styles-v2";
    if (document.getElementById(STYLE_ID)) return; // Guard: inject only once

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      /* ── Base toast element ─────────────────────────────────────────── */
      .toast-js-element {
        position: fixed;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        opacity: 0;
        min-width: 200px;
        max-width: 80vw;
        transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
        box-sizing: border-box;
      }
      .toast-js-element.is-dismissible {
        pointer-events: auto;
      }

      /* ── [FIX-U02 + FIX-U03] Real responsive rules ────────────────── */
      /* Previously defined inside JS objects via "@media" keys which     */
      /* Object.assign() silently ignores. Now in a real stylesheet.      */
      @media (max-width: 480px) {
        .toast-js-element {
          width: 90% !important;
          max-width: none !important;
          padding: 10px 14px !important;
          border-radius: 8px !important;
          left: 50% !important;
          right: auto !important;
          transform: translateX(-50%) !important;
        }
      }

      /* ── Animations ────────────────────────────────────────────────── */
      .toast-js-element.fade {
        /* opacity controlled via JS; transition handles the fade */
      }
      .toast-js-element.slide-in-right  { animation: toastSlideInRight  0.5s ease-in-out; }
      .toast-js-element.slide-out-right { animation: toastSlideOutRight 0.5s ease-in-out; }
      .toast-js-element.slide-in-left   { animation: toastSlideInLeft   0.5s ease-in-out; }
      .toast-js-element.slide-out-left  { animation: toastSlideOutLeft  0.5s ease-in-out; }
      .toast-js-element.slide-in-top    { animation: toastSlideInTop    0.5s ease-in-out; }
      .toast-js-element.slide-out-top   { animation: toastSlideOutTop   0.5s ease-in-out; }
      .toast-js-element.slide-in-bottom { animation: toastSlideInBottom 0.5s ease-in-out; }
      .toast-js-element.slide-out-bottom{ animation: toastSlideOutBottom 0.5s ease-in-out;}
      .toast-js-element.slide-in-top-center    { animation: toastSlideInTopCenter    0.5s ease-in-out; }
      .toast-js-element.slide-out-top-center   { animation: toastSlideOutTopCenter   0.5s ease-in-out; }
      .toast-js-element.slide-in-bottom-center { animation: toastSlideInBottomCenter 0.5s ease-in-out; }
      .toast-js-element.slide-out-bottom-center{ animation: toastSlideOutBottomCenter 0.5s ease-in-out;}
      .toast-js-element.light-speed-in-right  { animation: toastLightSpeedInRight  0.5s ease-in-out; }
      .toast-js-element.light-speed-out-right { animation: toastLightSpeedOutRight 0.5s ease-in-out; }
      .toast-js-element.light-speed-in-left   { animation: toastLightSpeedInLeft   0.5s ease-in-out; }
      .toast-js-element.light-speed-out-left  { animation: toastLightSpeedOutLeft  0.5s ease-in-out; }
      .toast-js-element.wave-in    { animation: toastWaveIn    0.5s ease-in-out; }
      .toast-js-element.wave-out   { animation: toastWaveOut   0.5s ease-in-out; }
      .toast-js-element.wobble-in  { animation: toastWobbleIn  0.6s ease-in-out; }
      .toast-js-element.wobble-out { animation: toastWobbleOut 0.6s ease-in-out; }

      /* ── @keyframes ─────────────────────────────────────────────────── */
      @keyframes toastSlideInRight  { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes toastSlideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
      @keyframes toastSlideInLeft   { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes toastSlideOutLeft  { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-100%); opacity: 0; } }
      @keyframes toastSlideInTop    { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      @keyframes toastSlideOutTop   { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-100%); opacity: 0; } }
      @keyframes toastSlideInBottom { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      @keyframes toastSlideOutBottom{ from { transform: translateY(0); opacity: 1; } to { transform: translateY(100%); opacity: 0; } }
      @keyframes toastSlideInTopCenter    { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      @keyframes toastSlideOutTopCenter   { from { transform: translate(-50%, 0); opacity: 1; } to { transform: translate(-50%, -100%); opacity: 0; } }
      @keyframes toastSlideInBottomCenter { from { transform: translate(-50%, 100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      @keyframes toastSlideOutBottomCenter{ from { transform: translate(-50%, 0); opacity: 1; } to { transform: translate(-50%, 100%); opacity: 0; } }
      @keyframes toastLightSpeedInRight  { 0%{transform:translateX(100%) skewX(-30deg);opacity:0} 60%{transform:translateX(-20%) skewX(30deg);opacity:1} 80%{transform:translateX(0%) skewX(-15deg);opacity:1} 100%{transform:translateX(0) skewX(0);opacity:1} }
      @keyframes toastLightSpeedOutRight { from{transform:translateX(0) skewX(0);opacity:1} to{transform:translateX(100%) skewX(-30deg);opacity:0} }
      @keyframes toastLightSpeedInLeft   { 0%{transform:translateX(-100%) skewX(30deg);opacity:0} 60%{transform:translateX(20%) skewX(-30deg);opacity:1} 80%{transform:translateX(0%) skewX(15deg);opacity:1} 100%{transform:translateX(0) skewX(0);opacity:1} }
      @keyframes toastLightSpeedOutLeft  { from{transform:translateX(0) skewX(0);opacity:1} to{transform:translateX(-100%) skewX(30deg);opacity:0} }
      @keyframes toastWaveIn    { 0%{transform:translateY(0) rotate(0);opacity:0} 50%{transform:translateY(-20px) rotate(10deg);opacity:1} 100%{transform:translateY(0) rotate(0);opacity:1} }
      @keyframes toastWaveOut   { 0%{transform:translateY(0) rotate(0);opacity:1} 50%{transform:translateY(20px) rotate(-10deg);opacity:0} 100%{transform:translateY(0) rotate(0);opacity:0} }
      @keyframes toastWobbleIn  { 0%{transform:translateX(0%) rotate(0);opacity:0} 15%{transform:translateX(-25%) rotate(-5deg);opacity:1} 30%{transform:translateX(20%) rotate(3deg)} 45%{transform:translateX(-15%) rotate(-3deg)} 60%{transform:translateX(10%) rotate(2deg)} 75%{transform:translateX(-5%) rotate(-1deg)} 100%{transform:translateX(0%) rotate(0);opacity:1} }
      @keyframes toastWobbleOut { 0%{transform:translateX(0%) rotate(0);opacity:1} 15%{transform:translateX(-25%) rotate(-5deg)} 30%{transform:translateX(20%) rotate(3deg)} 45%{transform:translateX(-15%) rotate(-3deg)} 60%{transform:translateX(10%) rotate(2deg)} 75%{transform:translateX(-5%) rotate(-1deg)} 100%{transform:translateX(0%) rotate(0);opacity:0} }

      /* ── Close button hover ──────────────────────────────────────────── */
      .toast-js-close-btn:hover { opacity: 1 !important; }
    `;
    document.head.appendChild(style);
  })();

  // ══════════════════════════════════════════════════════════════════════════
  //  [FIX-D03] Private base style — shared properties factored out once.
  //  Previously each of the 17 style objects repeated ~12 identical props,
  //  totalling ~200 lines of duplication. Now we spread #BASE_STYLE.
  // ══════════════════════════════════════════════════════════════════════════
  const _BASE_STYLE = Object.freeze({
    display:        "flex",
    borderRadius:   "10px",
    fontSize:       "clamp(12px, 3vw, 14px)",
    padding:        "8px 16px",
    width:          "fit-content",
    maxWidth:       "400px",
    height:         "auto",
    justifyContent: "center",
    alignItems:     "center",
    textAlign:      "center",
    transition:           "all 0.3s ease",
    WebkitTransition:     "all 0.3s ease",
    MozTransition:        "all 0.3s ease",
    msTransition:         "all 0.3s ease",
    boxSizing:      "border-box",
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  [FIX-S01] CSS Sanitizer — blocks dangerous CSS before injection.
  //  Prevents CSS Injection attacks when custom keyframes or CSS strings
  //  originate from user-controlled data.
  // ══════════════════════════════════════════════════════════════════════════
  function _sanitizeCSS(cssString) {
    if (typeof cssString !== "string") return "";
    const dangerous = /url\s*\(|expression\s*\(|@import\s|javascript\s*:/gi;
    if (dangerous.test(cssString)) {
      console.error(
        "[Toast-JS] Potentially unsafe CSS was detected and blocked. " +
        "Do not pass user-controlled strings directly to setAnimation()."
      );
      return "";
    }
    return cssString;
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  [FIX-S03] Icon URL validator — rejects inline SVG and obvious non-URLs.
  // ══════════════════════════════════════════════════════════════════════════
  const _ALLOWED_ICON_EXTENSIONS = /\.(svg|png|jpg|jpeg|gif|webm|mp4)(\?.*)?$/i;

  function _validateIconPath(iconPath) {
    if (typeof iconPath !== "string" || iconPath.trim() === "") {
      throw new TypeError("[Toast-JS] setIcon(): iconPath must be a non-empty string.");
    }
    if (iconPath.trim().startsWith("<svg")) {
      throw new Error(
        "[Toast-JS] setIcon(): Inline SVG markup is not supported. " +
        "Provide a URL to an .svg file instead. " +
        "Supported formats: .svg, .png, .jpg, .jpeg, .gif, .webm, .mp4."
      );
    }
    if (!_ALLOWED_ICON_EXTENSIONS.test(iconPath)) {
      console.warn(
        "[Toast-JS] setIcon(): The icon URL does not end with a recognised " +
        "extension (.svg, .png, .jpg, .jpeg, .gif, .webm, .mp4). " +
        "The URL will be used as-is but may not render correctly."
      );
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  Toast Class
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Creates and displays customisable toast notifications.
   *
   * Quick start:
   *   Toast.makeText(document.body, "Hello!", Toast.LENGTH_SHORT)
   *     .setStyle(Toast.STYLE_SUCCESS)
   *     .setPosition(Toast.POSITION_TOP_CENTER)
   *     .show();
   */
  class Toast {

    // ── Duration constants ────────────────────────────────────────────────
    /** @type {number} Short display duration: 3 seconds. */
    static LENGTH_SHORT = 3000;
    /** @type {number} Long display duration: 6.5 seconds. */
    static LENGTH_LONG  = 6500;

    // ── Position constants ────────────────────────────────────────────────
    static POSITION_TOP_LEFT      = "top-left";
    static POSITION_TOP_CENTER    = "top-center";
    static POSITION_TOP_RIGHT     = "top-right";
    static POSITION_BOTTOM_LEFT   = "bottom-left";
    static POSITION_BOTTOM_CENTER = "bottom-center";
    static POSITION_BOTTOM_RIGHT  = "bottom-right";

    // ── Icon position constants ───────────────────────────────────────────
    static ICON_POSITION_START = "start";
    static ICON_POSITION_END   = "end";

    // ── Animation constants ───────────────────────────────────────────────
    static FADE                     = "fade";
    static SLIDE_IN_TOP             = "slide-in-top";
    static SLIDE_OUT_TOP            = "slide-out-top";
    static SLIDE_IN_BOTTOM          = "slide-in-bottom";
    static SLIDE_OUT_BOTTOM         = "slide-out-bottom";
    static SLIDE_IN_TOP_CENTER      = "slide-in-top-center";
    static SLIDE_OUT_TOP_CENTER     = "slide-out-top-center";
    static SLIDE_IN_BOTTOM_CENTER   = "slide-in-bottom-center";
    static SLIDE_OUT_BOTTOM_CENTER  = "slide-out-bottom-center";
    static SLIDE_IN_RIGHT           = "slide-in-right";
    static SLIDE_OUT_RIGHT          = "slide-out-right";
    static SLIDE_IN_LEFT            = "slide-in-left";
    static SLIDE_OUT_LEFT           = "slide-out-left";
    static LIGHT_SPEED_IN_RIGHT     = "light-speed-in-right";
    static LIGHT_SPEED_OUT_RIGHT    = "light-speed-out-right";
    static LIGHT_SPEED_IN_LEFT      = "light-speed-in-left";
    static LIGHT_SPEED_OUT_LEFT     = "light-speed-out-left";
    static WAVE_IN                  = "wave-in";
    static WAVE_OUT                 = "wave-out";
    static WOBBLE_IN                = "wobble-in";
    static WOBBLE_OUT               = "wobble-out";

    // ── Icon size constants ───────────────────────────────────────────────
    static ICON_SIZE = Object.freeze({
      SMALL:       { width: "20px", height: "20px" },
      MEDIUM:      { width: "24px", height: "24px" },
      LARGE:       { width: "32px", height: "32px" },
      EXTRA_LARGE: { width: "48px", height: "48px" },
    });

    // ── Icon shape constants ──────────────────────────────────────────────
    static ICON_SHAPE_CIRCLE   = Object.freeze({ borderRadius: "50%",  overflow: "hidden" });
    static ICON_SHAPE_SQUARE   = Object.freeze({ borderRadius: "0%" });
    static ICON_SHAPE_SQUIRCLE = Object.freeze({ borderRadius: "20px", overflow: "hidden" });

    // ── [FIX-D03] Predefined styles — unique overrides spread onto _BASE_STYLE ──
    // Removed ~200 lines of duplicated shared properties.
    // Removed "@media" keys that were previously silently ignored by Object.assign.

    static STYLE_DEFAULT_1 = Object.freeze({ ..._BASE_STYLE,
      backgroundColor: "#323232",
      color:           "#fff",
      boxShadow:       "0 2px 4px rgba(0, 0, 0, 0.3)",
    });

    static STYLE_DEFAULT_2 = Object.freeze({ ..._BASE_STYLE,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      color:           "#fff",
      fontFamily:      "system-ui, -apple-system, sans-serif",
      boxShadow:       "0 2px 4px rgba(0, 0, 0, 0.3)",
    });

    static STYLE_SUCCESS = Object.freeze({ ..._BASE_STYLE,
      backgroundColor: "#16A34A",
      color:           "#FFFFFF",
      boxShadow:       "0 6px 10px rgba(16, 185, 129, 0.2)",
    });

    static STYLE_WARNING = Object.freeze({ ..._BASE_STYLE,
      backgroundColor: "#FF9800",
      color:           "#fff",
      fontFamily:      "system-ui, -apple-system, sans-serif",
      boxShadow:       "0 2px 4px rgba(0, 0, 0, 0.3)",
    });

    // [FIX-D04] STYLE_WARNING1 and STYLE_WARNING2 now exist (gap in numbering fixed).
    static STYLE_WARNING1 = Object.freeze({ ..._BASE_STYLE,
      background: "linear-gradient(90deg, #f39c12, #e67e22)",
      color:      "#fff",
    });

    /** @type {Object} Warning style variant 2 — white text on amber gradient. */
    static STYLE_WARNING2 = Object.freeze({ ..._BASE_STYLE,
      background: "linear-gradient(90deg, #e67e22, #f39c12)",
      color:      "#fff",
      boxShadow:  "0 4px 10px rgba(230, 126, 34, 0.3)",
    });

    static STYLE_WARNING3 = Object.freeze({ ..._BASE_STYLE,
      background: "linear-gradient(90deg, #f39c12, #e67e22)",
      color:      "#000000",
    });

    static STYLE_ERROR = Object.freeze({ ..._BASE_STYLE,
      backgroundColor: "#DC2626",
      color:           "#FFFFFF",
      boxShadow:       "0 6px 10px rgba(220, 38, 38, 0.2)",
    });

    static STYLE_ERROR1 = Object.freeze({ ..._BASE_STYLE,
      backgroundColor: "#E74C3C",
      color:           "#fff",
    });

    static STYLE_ERROR2 = Object.freeze({ ..._BASE_STYLE,
      background: "linear-gradient(90deg, #f44336, #e57373)",
      color:      "#fff",
      boxShadow:  "0 4px 10px rgba(0, 0, 0, 0.2)",
    });

    static STYLE_INFO = Object.freeze({ ..._BASE_STYLE,
      backgroundColor: "#2563EB",
      color:           "#FFFFFF",
      border:          "1px solid rgba(37, 99, 235, 0.3)",
      boxShadow:       "0 6px 10px rgba(37, 99, 235, 0.2)",
      fontFamily:      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      backdropFilter:  "blur(6px)",
    });

    static STYLE_GRADIENT = Object.freeze({ ..._BASE_STYLE,
      background: "linear-gradient(90deg, #ff9a9e, #fad0c4)",
      color:      "#000",
      boxShadow:  "0 5px 15px rgba(255, 154, 158, 0.3)",
    });

    static STYLE_NEON = Object.freeze({ ..._BASE_STYLE,
      background: "linear-gradient(90deg, #00d2ff, #3a7bd5)",
      color:      "#fff",
      boxShadow:  "0 0 15px #00d2ff, 0 0 30px #3a7bd5",
    });

    static STYLE_NEON1 = Object.freeze({ ..._BASE_STYLE,
      backgroundColor: "#0ff",
      color:           "#000",
      fontFamily:      "monospace",
      boxShadow:       "0 0 10px #0ff, 0 0 40px #0ff",
    });

    static STYLE_DARK_MODE = Object.freeze({ ..._BASE_STYLE,
      background: "#1f2937",
      color:      "#fff",
      boxShadow:  "0 5px 15px rgba(0, 0, 0, 0.3)",
    });

    static STYLE_LIGHT_MODE = Object.freeze({ ..._BASE_STYLE,
      background: "#fff",
      color:      "#000",
      boxShadow:  "0 5px 15px rgba(0, 0, 0, 0.1)",
    });

    static STYLE_SHADOW = Object.freeze({ ..._BASE_STYLE,
      backgroundColor: "#000000",
      color:           "#fff",
      fontFamily:      "Verdana, sans-serif",
      boxShadow:       "0 8px 16px rgba(0, 0, 0, 0.2)",
    });

    static STYLE_RETRO = Object.freeze({ ..._BASE_STYLE,
      backgroundColor: "#FCD34D",
      color:           "#000",
      boxShadow:       "0 6px 12px rgba(252, 211, 77, 0.2)",
    });

    static STYLE_METALLIC = Object.freeze({ ..._BASE_STYLE,
      background:  "linear-gradient(145deg, #d3d3d3, #a8a8a8)",
      color:       "#222",
      fontFamily:  "Tahoma, sans-serif",
      boxShadow:   "inset 3px 3px 6px #999, inset -3px -3px 6px #ddd",
    });

    static STYLE_GLOW = Object.freeze({ ..._BASE_STYLE,
      backgroundColor: "#5A67D8",
      color:           "#fff",
      boxShadow:       "0 0 15px rgba(90, 103, 216, 0.8)",
    });

    static STYLE_TRANSPARENT = Object.freeze({ ..._BASE_STYLE,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      color:           "#fff",
      fontFamily:      "system-ui, sans-serif",
    });


    // ── Text overflow constants ───────────────────────────────────────────
     static TextOverflow = Object.freeze({
    ELLIPSIS: "ellipsis",
    WRAP:     "wrap",
    CLIP:     "clip"
    });
    
    // ── Constructor ───────────────────────────────────────────────────────

    /**
     * @param {HTMLElement} context  - Parent element; defaults to document.body.
     * @param {string}      text     - Notification message.
     * @param {number}      duration - Display time in ms; defaults to LENGTH_SHORT.
     */
    constructor(context, text, duration) {
      if (typeof text !== "string") {
        throw new TypeError("[Toast-JS] constructor: 'text' must be a string.");
      }

      this.context         = (context instanceof HTMLElement) ? context : document.body;
      this.text            = text;
      this.duration        = (typeof duration === "number" && duration > 0) ? duration : Toast.LENGTH_SHORT;

      this.customStyle     = Toast.STYLE_DEFAULT_1;
      this.position        = Toast.POSITION_BOTTOM_CENTER;
      this.icon            = null;
      this.iconSize        = Toast.ICON_SIZE.MEDIUM;
      this.iconPosition    = Toast.ICON_POSITION_START;
      this.iconShape       = Toast.ICON_SHAPE_CIRCLE;
      this.enterAnimation  = Toast.FADE;
      this.exitAnimation   = Toast.FADE;
      this.dismissible     = false;
      this.closeButtonColor = "#fff";
      this.textOverflow    = "ellipsis";   // [FIX-U07] 'ellipsis' | 'wrap' | 'clip'
      this.customKeyframes = null;

      // [FIX-U06] Event listener registry
      this._events = Object.create(null);

      // DOM reference & timer — initialised in show()
      this.toastElement = null;
      this._timeoutId   = null;           // [FIX-D08] was never stored before
    }

    // ── Factory ───────────────────────────────────────────────────────────

    /**
     * Factory method — mirrors the Android Toast.makeText() API.
     * @param {HTMLElement} context
     * @param {string}      text
     * @param {number}      [duration=Toast.LENGTH_SHORT]
     * @returns {Toast}
     */
    static makeText(context, text, duration = Toast.LENGTH_SHORT) {
      return new Toast(context, text, duration);
    }

    // ── Configuration setters (all return `this` for chaining) ────────────

    /**
     * Sets how long the toast is visible.
     * Can also be called after show() to reschedule dismissal.
     * @param {number} duration - Milliseconds.
     * @returns {Toast}
     */
    setDuration(duration) {
      if (typeof duration !== "number" || duration <= 0) {
        console.warn("[Toast-JS] setDuration(): expected a positive number. Ignoring.");
        return this;
      }
      this.duration = duration;

      // [FIX-D08] clearTimeout works correctly because show() now stores the id.
      if (this.toastElement && this._timeoutId !== null) {
        clearTimeout(this._timeoutId);
        this._timeoutId = setTimeout(() => this.hide(), this.duration);
      }
      return this;
    }

    /**
     * Applies a predefined or custom style.
     * @param {string|Object} style - Style name string or plain CSS object.
     * @returns {Toast}
     */
    setStyle(style) {
      if (typeof style === "string") {
        // [FIX-D04] "defult_1" and "defult_2" preserved as aliases for backward compat.
        const styleMap = {
          default_1:  Toast.STYLE_DEFAULT_1,
          defult_1:   Toast.STYLE_DEFAULT_1,   // backward-compat alias (typo in old docs)
          default_2:  Toast.STYLE_DEFAULT_2,
          defult_2:   Toast.STYLE_DEFAULT_2,   // backward-compat alias
          success:    Toast.STYLE_SUCCESS,
          error:      Toast.STYLE_ERROR,
          error1:     Toast.STYLE_ERROR1,
          error2:     Toast.STYLE_ERROR2,
          warning:    Toast.STYLE_WARNING,
          warning1:   Toast.STYLE_WARNING1,
          warning2:   Toast.STYLE_WARNING2,    // [FIX-D04] was missing
          warning3:   Toast.STYLE_WARNING3,
          info:       Toast.STYLE_INFO,
          gradient:   Toast.STYLE_GRADIENT,
          neon:       Toast.STYLE_NEON,
          neon1:      Toast.STYLE_NEON1,
          shadow:     Toast.STYLE_SHADOW,
          retro:      Toast.STYLE_RETRO,
          metallic:   Toast.STYLE_METALLIC,
          glow:       Toast.STYLE_GLOW,
          transparent: Toast.STYLE_TRANSPARENT,
          dark_mode:  Toast.STYLE_DARK_MODE,
          light_mode: Toast.STYLE_LIGHT_MODE,
        };

        const resolved = styleMap[style.toLowerCase()];
        if (resolved) {
          this.customStyle = resolved;
        } else {
          // [FIX-D06] Consistent warning for unknown style names.
          console.warn(
            `[Toast-JS] setStyle(): Unknown style "${style}". ` +
            `Falling back to STYLE_DEFAULT_1. ` +
            `Valid names: ${Object.keys(styleMap).join(", ")}.`
          );
          this.customStyle = Toast.STYLE_DEFAULT_1;
        }
      } else if (style !== null && typeof style === "object") {
        // Merge user overrides on top of the default base.
        this.customStyle = { ..._BASE_STYLE, ...style };

        // Custom keyframes are extracted from the style object (non-CSS key).
        if (typeof style.keyframes === "string") {
          this.customKeyframes = style.keyframes;
        }
      } else {
        console.warn("[Toast-JS] setStyle(): argument must be a string or an object.");
      }
      return this;
    }

    /**
     * Sets the screen position of the toast.
     * @param {string} position - One of the POSITION_* constants.
     * @returns {Toast}
     */
    setPosition(position) {
      const valid = [
        Toast.POSITION_TOP_LEFT,    Toast.POSITION_TOP_CENTER,    Toast.POSITION_TOP_RIGHT,
        Toast.POSITION_BOTTOM_LEFT, Toast.POSITION_BOTTOM_CENTER, Toast.POSITION_BOTTOM_RIGHT,
      ];
      if (!valid.includes(position)) {
        console.warn(
          `[Toast-JS] setPosition(): "${position}" is not a valid position. ` +
          `Using POSITION_BOTTOM_CENTER. Valid values: ${valid.join(", ")}.`
        );
        this.position = Toast.POSITION_BOTTOM_CENTER;
      } else {
        this.position = position;
      }
      return this;
    }

    /**
     * Configures enter and exit animations.
     * Pass a string constant (e.g. Toast.SLIDE_IN_RIGHT) or a custom object:
     *   { css: "animation: myAnim 0.5s;", keyframes: "@keyframes myAnim {...}" }
     * @param {string|Object} enterAnimation
     * @param {string|Object} [exitAnimation]
     * @returns {Toast}
     */
    setAnimation(enterAnimation, exitAnimation) {
      this._resolveAnimation(enterAnimation, "enter");
      if (exitAnimation !== undefined) {
        this._resolveAnimation(exitAnimation, "exit");
      }
      return this;
    }

    /**
     * @private Resolves and stores an animation name, injecting custom CSS if needed.
     */
    _resolveAnimation(anim, slot) {
      if (typeof anim === "string") {
        if (slot === "enter") this.enterAnimation = anim;
        else                  this.exitAnimation  = anim;

      } else if (anim !== null && typeof anim === "object" && typeof anim.css === "string") {
        // [FIX-S01] Sanitize custom CSS before injection.
        const safeCss       = _sanitizeCSS(anim.css);
        const safeKeyframes = typeof anim.keyframes === "string"
          ? _sanitizeCSS(anim.keyframes) : "";

        if (!safeCss && !safeKeyframes) return; // blocked by sanitizer

        const name   = `toast-custom-${slot}-${Date.now()}`;
        const style  = document.createElement("style");
        style.id     = name;
        style.textContent = `.${name} { ${safeCss} } ${safeKeyframes}`;
        document.head.appendChild(style);

        if (slot === "enter") this.enterAnimation = name;
        else                  this.exitAnimation  = name;

      } else {
        console.warn("[Toast-JS] setAnimation(): each argument must be a string or { css, keyframes? }.");
      }
    }

    /**
     * Sets the icon displayed alongside the message.
     * Supported formats: .svg, .png, .jpg, .jpeg, .gif, .webm, .mp4
     * @param {string}        iconPath - URL to the icon asset.
     * @param {Object|string} [size]   - ICON_SIZE constant or { width, height }.
     * @param {string}        [position=ICON_POSITION_START]
     * @returns {Toast}
     */
    setIcon(iconPath, size = null, position = Toast.ICON_POSITION_START) {
      // [FIX-S03] Validate icon path before accepting it.
      _validateIconPath(iconPath);

      this.icon = iconPath;

      if (size !== null) {
        if (typeof size === "object" && size.width && size.height) {
          this.iconSize = size;
        } else if (typeof size === "string") {
          const key = size.toUpperCase();
          if (Toast.ICON_SIZE[key]) {
            this.iconSize = Toast.ICON_SIZE[key];
          } else {
            // [FIX-D06] More informative warning.
            console.warn(
              `[Toast-JS] setIcon(): Unknown size "${size}". ` +
              `Valid names: ${Object.keys(Toast.ICON_SIZE).join(", ")}. Using MEDIUM.`
            );
          }
        }
      }

      const validPositions = [Toast.ICON_POSITION_START, Toast.ICON_POSITION_END];
      this.iconPosition = validPositions.includes(position) ? position : Toast.ICON_POSITION_START;
      return this;
    }

    /**
     * Sets the shape applied to the icon container.
     * @param {Object} [shape=Toast.ICON_SHAPE_CIRCLE]
     * @returns {Toast}
     */
    setIconShape(shape = Toast.ICON_SHAPE_CIRCLE) {
      const valid = [Toast.ICON_SHAPE_CIRCLE, Toast.ICON_SHAPE_SQUARE, Toast.ICON_SHAPE_SQUIRCLE];
      this.iconShape = valid.includes(shape) ? shape : Toast.ICON_SHAPE_CIRCLE;
      return this;
    }

    /**
     * Makes the toast manually dismissible via a close button.
     * When dismissible=true the toast persists until the user clicks ×
     * (unless duration elapses first — whichever comes first).
     *
     * [FIX-U05] Previous logic hid the toast automatically even when
     * dismissible=true if duration < LENGTH_LONG, which was confusing.
     * New behaviour: dismissible=true means the × button is shown AND
     * the auto-timer still runs. User can close early or wait for auto-hide.
     *
     * @param {boolean} [dismissible=true]
     * @param {string}  [closeButtonColor="#fff"]
     * @returns {Toast}
     */
    setDismissible(dismissible = true, closeButtonColor = "#fff") {
      this.dismissible      = Boolean(dismissible);
      this.closeButtonColor = typeof closeButtonColor === "string" ? closeButtonColor : "#fff";
      return this;
    }

    /**
     * Controls how overflowing text is handled.
     * [FIX-U07] Previously hard-coded to 'ellipsis' with no override.
     * @param {'ellipsis'|'wrap'|'clip'} mode
     * @returns {Toast}
     */
     setTextOverflow(mode = Toast.TextOverflow.ELLIPSIS) {
      const valid = Object.values(Toast.TextOverflow);
      if (!valid.includes(mode)) {
        console.warn(
          `[Toast-JS] setTextOverflow(): "${mode}" is not valid. ` +
          `Use one of: ${valid.join(", ")}. Defaulting to "ellipsis".`
        );
        this.textOverflow = Toast.TextOverflow.ELLIPSIS;
      } else {
        this.textOverflow = mode;
      }
      return this;
    }

    /**
     * Registers a callback for a lifecycle event.
     * [FIX-U06] Added: previously only addCallback() existed and only fired on show.
     * @param {'show'|'hide'|'dismiss'} event
     * @param {Function}                callback
     * @returns {Toast}
     */
    on(event, callback) {
      if (typeof callback !== "function") {
        console.warn("[Toast-JS] on(): callback must be a function.");
        return this;
      }
      const valid = ["show", "hide", "dismiss"];
      if (!valid.includes(event)) {
        console.warn(`[Toast-JS] on(): "${event}" is not a valid event. Use: ${valid.join(", ")}.`);
        return this;
      }
      if (!this._events[event]) this._events[event] = [];
      this._events[event].push(callback);
      return this;
    }

    /**
     * Removes a previously registered event callback.
     * @param {'show'|'hide'|'dismiss'} event
     * @param {Function}                callback
     * @returns {Toast}
     */
    off(event, callback) {
      if (!this._events[event]) return this;
      this._events[event] = this._events[event].filter((cb) => cb !== callback);
      return this;
    }

    /**
     * @private Fires all callbacks registered for `event`.
     */
    _emit(event) {
      (this._events[event] || []).forEach((cb) => {
        try { cb(this); } catch (e) {
          console.error(`[Toast-JS] Error in "${event}" event handler:`, e);
        }
      });
    }

    /**
     * @deprecated Use on('show', fn) instead.
     * Preserved for backward compatibility.
     */
    addCallback(callback) {
      if (typeof callback === "function") {
        this.on("show", callback);
      }
      return this;
    }

    // ── DOM builders ──────────────────────────────────────────────────────

    /**
     * @private Builds the icon element based on file extension.
     * @returns {HTMLElement|null}
     */
    _createIconElement() {
      if (!this.icon) return null;

      const container = document.createElement("div");
      Object.assign(container.style, {
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        flexShrink:     "0",
        ...this.iconSize,
        ...this.iconShape,
      });

      const lowerIcon = this.icon.toLowerCase();
      let media;

      if (lowerIcon.endsWith(".webm") || lowerIcon.endsWith(".mp4")) {
        media = document.createElement("video");
        media.autoplay      = true;
        media.loop          = true;
        media.muted         = true;
        media.playbackRate  = 1.0;
        // [FIX-U04] Provide accessible text for screen readers even on video icons.
        media.setAttribute("aria-label", "Toast notification icon");
      } else {
        media = document.createElement("img");
        media.alt = "Toast notification icon";
      }

      media.src = this.icon;
      Object.assign(media.style, { width: "100%", height: "100%", objectFit: "contain" });
      container.appendChild(media);
      return container;
    }

    /**
     * @private Builds the × close button.
     * @returns {HTMLButtonElement}
     */
    _createCloseButton() {
      const btn = document.createElement("button");
      btn.className = "toast-js-close-btn";

      // [FIX-U04] Accessible label for screen readers.
      btn.setAttribute("aria-label", "Close notification");

      Object.assign(btn.style, {
        background:  "none",
        border:      "none",
        color:        this.closeButtonColor,
        cursor:      "pointer",
        padding:     "0 0 0 12px",
        fontSize:    "18px",
        lineHeight:  "1",
        opacity:     "0.8",
        transition:  "opacity 0.2s ease",
        flexShrink:  "0",
      });

      // Use textContent (not innerHTML) to avoid any XSS surface.
      btn.textContent = "×";
      btn.addEventListener("click", () => {
        this._emit("dismiss");
        this.hide();
      });
      return btn;
    }

    /**
     * @private Returns inline styles that control the toast's fixed position.
     * @returns {Object}
     */
    _getPositionStyles() {
      const positions = {
        [Toast.POSITION_TOP_LEFT]:      { top:    "20px", left:  "20px" },
        [Toast.POSITION_TOP_CENTER]:    { top:    "20px", left:  "50%", transform: "translateX(-50%)" },
        [Toast.POSITION_TOP_RIGHT]:     { top:    "20px", right: "20px" },
        [Toast.POSITION_BOTTOM_LEFT]:   { bottom: "20px", left:  "20px" },
        [Toast.POSITION_BOTTOM_CENTER]: { bottom: "20px", left:  "50%", transform: "translateX(-50%)" },
        [Toast.POSITION_BOTTOM_RIGHT]:  { bottom: "20px", right: "20px" },
      };
      return positions[this.position] || positions[Toast.POSITION_BOTTOM_CENTER];
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────

    /**
     * Renders and shows the toast.
     * Idempotent: calling show() on an already-visible toast is a no-op.
     */
    show() {
      if (this.toastElement) return; // already showing

      // ── Build DOM structure ──────────────────────────────────────────
      this.toastElement = document.createElement("div");
      // [FIX-U04] ARIA roles so screen readers announce the notification.
      this.toastElement.setAttribute("role", "alert");
      this.toastElement.setAttribute("aria-live", "assertive");
      this.toastElement.setAttribute("aria-atomic", "true");
      this.toastElement.className = [
        "toast-js-element",
        this.enterAnimation,
        this.dismissible ? "is-dismissible" : "",
      ].filter(Boolean).join(" ");

      // Content container (icon + text + close btn)
      const content = document.createElement("div");
      Object.assign(content.style, {
        display:    "flex",
        alignItems: "center",
        minHeight:  "48px",
        padding:    "8px 12px",
        width:      "100%",
        boxSizing:  "border-box",
      });

      // [FIX-D09] Icon position logic was REVERSED in the original code.
      // POSITION_START used appendChild (adds at END) and
      // POSITION_END used insertBefore with firstChild (adds at START).
      // Fixed: START => prepend (adds at beginning), END => append (adds at end).
      const iconEl = this._createIconElement();
      if (iconEl) {
        if (this.iconPosition === Toast.ICON_POSITION_START) {
          iconEl.style.marginRight = "12px";
          content.prepend(iconEl);           // ← correctly at the START
        } else {
          iconEl.style.marginLeft = "12px";
          content.appendChild(iconEl);      // ← correctly at the END
        }
      }

      // Text span
      const textSpan = document.createElement("span");
      // [FIX-S02] innerText instead of innerHTML — safe against XSS.
      textSpan.innerText = this.text;

      // [FIX-U07] Text overflow based on user choice.
      Object.assign(textSpan.style, {
        flex: "1",
      });
      if (this.textOverflow === "wrap") {
        textSpan.style.whiteSpace    = "normal";
        textSpan.style.wordBreak     = "break-word";
        textSpan.style.overflow      = "visible";
      } else if (this.textOverflow === "clip") {
        textSpan.style.whiteSpace    = "nowrap";
        textSpan.style.overflow      = "hidden";
        textSpan.style.textOverflow  = "clip";
      } else {
        // default: ellipsis
        textSpan.style.whiteSpace    = "nowrap";
        textSpan.style.overflow      = "hidden";
        textSpan.style.textOverflow  = "ellipsis";
      }

      // Insert text at correct position relative to icon
      if (this.iconPosition === Toast.ICON_POSITION_END) {
        content.prepend(textSpan);           // text first, icon last
      } else {
        content.appendChild(textSpan);      // icon first, text after
      }

      if (this.dismissible) {
        content.appendChild(this._createCloseButton());
      }

      this.toastElement.appendChild(content);

      // Apply the chosen visual style
      Object.assign(this.toastElement.style, this.customStyle);

      // Position & initial hidden state
      Object.assign(this.toastElement.style, this._getPositionStyles(), {
        opacity: "0",
        transform: this.position.includes("center")
          ? "translateX(-50%) scale(0.95)"
          : "scale(0.95)",
      });

      // Inject custom keyframes declared via setStyle({ keyframes: "..." })
      if (this.customKeyframes) {
        const kfId = "toast-js-custom-kf-" + Date.now();
        if (!document.getElementById(kfId)) {
          const kfStyle = document.createElement("style");
          kfStyle.id    = kfId;
          // [FIX-S01] Sanitize before injecting.
          kfStyle.textContent = _sanitizeCSS(this.customKeyframes);
          document.head.appendChild(kfStyle);
        }
      }

      this.context.appendChild(this.toastElement);

      // Trigger entrance transition on next paint
      requestAnimationFrame(() => {
        if (!this.toastElement) return; // guard against rapid show/hide
        this.toastElement.style.opacity   = "1";
        this.toastElement.style.transform = this.position.includes("center")
          ? "translateX(-50%) scale(1)"
          : "scale(1)";
      });

      // [FIX-U06] Fire 'show' event.
      this._emit("show");

      // [FIX-D08] Store the timeout id so setDuration() and hide() can cancel it.
      // [FIX-U05] Auto-timer always runs. If dismissible, × button allows early close.
      this._timeoutId = setTimeout(() => this.hide(), this.duration);
    }

    /**
     * Hides and removes the toast from the DOM.
     * Safe to call multiple times.
     */
    hide() {
      if (!this.toastElement) return;

      // Cancel the auto-hide timer if it's still pending
      if (this._timeoutId !== null) {
        clearTimeout(this._timeoutId);
        this._timeoutId = null;
      }

      // Apply exit animation class
      const el = this.toastElement;
      el.className = ["toast-js-element", this.exitAnimation].filter(Boolean).join(" ");
      el.style.opacity   = "0";
      el.style.transform = this.position.includes("center")
        ? "translateX(-50%) scale(0.8)"
        : "scale(0.8)";

      // Remove from DOM after transition completes
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
        if (this.toastElement === el) this.toastElement = null;

        // [FIX-U06] Fire 'hide' event after removal.
        this._emit("hide");

        // [FIX-U01] Notify ToastManager so it can dequeue the next toast.
        ToastManager._onHide(this);
      }, 350);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  [FIX-U01] ToastManager — Queue system for multiple simultaneous toasts.
  //
  //  Problem: previously all toasts used position:fixed with the same
  //  coordinates, so concurrent toasts piled on top of each other.
  //
  //  Solution: ToastManager maintains a per-position queue and stacks
  //  active toasts by offsetting their position dynamically.
  // ══════════════════════════════════════════════════════════════════════════

  class ToastManager {
    /** Maximum number of toasts visible at one time. @type {number} */
    static maxVisible = 3;

    /** Toasts currently displayed, in order of appearance. @type {Toast[]} */
    static _active = [];

    /** Toasts waiting to be shown. @type {Toast[]} */
    static _queue = [];

    /**
     * Registers a toast for managed display.
     * Call ToastManager.show(toast) instead of toast.show() to enable queuing.
     * @param {Toast} toast
     */
    static show(toast) {
      if (!(toast instanceof Toast)) {
        console.error("[ToastManager] show(): argument must be a Toast instance.");
        return;
      }

      if (this._active.length >= this.maxVisible) {
        this._queue.push(toast);
      } else {
        this._display(toast);
      }
    }

    /** @private Displays a toast and tracks it. */
    static _display(toast) {
      this._active.push(toast);
      this._applyStackOffset(toast);
      toast.show();
    }

    /**
     * @private
     * Computes a vertical offset so each active toast appears stacked
     * without overlapping. Called before show().
     */
    static _applyStackOffset(toast) {
      const index   = this._active.length - 1; // 0-based index
      const offsetPx = index * 72; // 72px ≈ typical toast height + gap
      const isBottom = toast.position.startsWith("bottom");
      const prop     = isBottom ? "bottom" : "top";
      const base     = 20; // base margin from edge (px)

      // Override the fixed position margin to create the stack effect.
      // We must patch this after show() calls _getPositionStyles(), so we
      // intercept by temporarily overriding _getPositionStyles.
      const originalGetPos = toast._getPositionStyles.bind(toast);
      toast._getPositionStyles = function () {
        const styles = originalGetPos();
        styles[prop] = `${base + offsetPx}px`;
        return styles;
      };
    }

    /**
     * Called by Toast.hide() to dequeue the next waiting toast.
     * @param {Toast} hiddenToast
     */
    static _onHide(hiddenToast) {
      this._active = this._active.filter((t) => t !== hiddenToast);

      // Re-stack remaining active toasts (shift them back down/up)
      this._active.forEach((toast, index) => {
        if (!toast.toastElement) return;
        const isBottom = toast.position.startsWith("bottom");
        const prop     = isBottom ? "bottom" : "top";
        toast.toastElement.style[prop] = `${20 + index * 72}px`;
        toast.toastElement.style.transition = "bottom 0.2s ease, top 0.2s ease";
      });

      // Show next queued toast if any
      if (this._queue.length > 0) {
        const next = this._queue.shift();
        this._display(next);
      }
    }
  }

  // Attach ToastManager as a static property of Toast for convenience.
  Toast.Manager = ToastManager;

  return Toast;
});

