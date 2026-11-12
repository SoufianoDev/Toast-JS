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
declare const _exports: {
    (context: any, text: any, duration: any): void;
    LENGTH_SHORT: number;
    LENGTH_LONG: number;
    POSITION_TOP_LEFT: string;
    POSITION_TOP_CENTER: string;
    POSITION_TOP_RIGHT: string;
    POSITION_BOTTOM_LEFT: string;
    POSITION_BOTTOM_CENTER: string;
    POSITION_BOTTOM_RIGHT: string;
    ICON_POSITION_START: string;
    ICON_POSITION_END: string;
    FADE: string;
    SLIDE_IN_TOP: string;
    SLIDE_OUT_TOP: string;
    SLIDE_IN_BOTTOM: string;
    SLIDE_OUT_BOTTOM: string;
    SLIDE_IN_TOP_CENTER: string;
    SLIDE_OUT_TOP_CENTER: string;
    SLIDE_IN_BOTTOM_CENTER: string;
    SLIDE_OUT_BOTTOM_CENTER: string;
    SLIDE_IN_RIGHT: string;
    SLIDE_OUT_RIGHT: string;
    SLIDE_IN_LEFT: string;
    SLIDE_OUT_LEFT: string;
    LIGHT_SPEED_IN_RIGHT: string;
    LIGHT_SPEED_OUT_RIGHT: string;
    LIGHT_SPEED_IN_LEFT: string;
    LIGHT_SPEED_OUT_LEFT: string;
    WAVE_IN: string;
    WAVE_OUT: string;
    WOBBLE_IN: string;
    WOBBLE_OUT: string;
    ICON_SIZE: Readonly<{
        SMALL: {
            width: string;
            height: string;
        };
        MEDIUM: {
            width: string;
            height: string;
        };
        LARGE: {
            width: string;
            height: string;
        };
        EXTRA_LARGE: {
            width: string;
            height: string;
        };
    }>;
    ICON_SHAPE_CIRCLE: Readonly<{
        borderRadius: "50%";
        overflow: "hidden";
    }>;
    ICON_SHAPE_SQUARE: Readonly<{
        borderRadius: "0%";
    }>;
    ICON_SHAPE_SQUIRCLE: Readonly<{
        borderRadius: "20px";
        overflow: "hidden";
    }>;
    STYLE_DEFAULT_1: Readonly<{
        display: "flex";
        borderRadius: "10px";
        fontSize: "clamp(12px, 3vw, 14px)";
        padding: "8px 16px";
        width: "fit-content";
        maxWidth: "400px";
        height: "auto";
        justifyContent: "center";
        alignItems: "center";
        textAlign: "center";
        transition: "all 0.3s ease";
        WebkitTransition: "all 0.3s ease";
        MozTransition: "all 0.3s ease";
        msTransition: "all 0.3s ease";
        boxSizing: "border-box";
        backgroundColor: "#323232";
        color: "#fff";
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)";
    }>;
    STYLE_DEFAULT_2: Readonly<{
        display: "flex";
        borderRadius: "10px";
        fontSize: "clamp(12px, 3vw, 14px)";
        padding: "8px 16px";
        width: "fit-content";
        maxWidth: "400px";
        height: "auto";
        justifyContent: "center";
        alignItems: "center";
        textAlign: "center";
        transition: "all 0.3s ease";
        WebkitTransition: "all 0.3s ease";
        MozTransition: "all 0.3s ease";
        msTransition: "all 0.3s ease";
        boxSizing: "border-box";
        backgroundColor: "rgba(0, 0, 0, 0.8)";
        color: "#fff";
        fontFamily: "system-ui, -apple-system, sans-serif";
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)";
    }>;
    STYLE_SUCCESS: Readonly<{
        display: "flex";
        borderRadius: "10px";
        fontSize: "clamp(12px, 3vw, 14px)";
        padding: "8px 16px";
        width: "fit-content";
        maxWidth: "400px";
        height: "auto";
        justifyContent: "center";
        alignItems: "center";
        textAlign: "center";
        transition: "all 0.3s ease";
        WebkitTransition: "all 0.3s ease";
        MozTransition: "all 0.3s ease";
        msTransition: "all 0.3s ease";
        boxSizing: "border-box";
        backgroundColor: "#16A34A";
        color: "#FFFFFF";
        boxShadow: "0 6px 10px rgba(16, 185, 129, 0.2)";
    }>;
    STYLE_WARNING: Readonly<{
        display: "flex";
        borderRadius: "10px";
        fontSize: "clamp(12px, 3vw, 14px)";
        padding: "8px 16px";
        width: "fit-content";
        maxWidth: "400px";
        height: "auto";
        justifyContent: "center";
        alignItems: "center";
        textAlign: "center";
        transition: "all 0.3s ease";
        WebkitTransition: "all 0.3s ease";
        MozTransition: "all 0.3s ease";
        msTransition: "all 0.3s ease";
        boxSizing: "border-box";
        backgroundColor: "#FF9800";
        color: "#fff";
        fontFamily: "system-ui, -apple-system, sans-serif";
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)";
    }>;
    STYLE_WARNING1: Readonly<{
        display: "flex";
        borderRadius: "10px";
        fontSize: "clamp(12px, 3vw, 14px)";
        padding: "8px 16px";
        width: "fit-content";
        maxWidth: "400px";
        height: "auto";
        justifyContent: "center";
        alignItems: "center";
        textAlign: "center";
        transition: "all 0.3s ease";
        WebkitTransition: "all 0.3s ease";
        MozTransition: "all 0.3s ease";
        msTransition: "all 0.3s ease";
        boxSizing: "border-box";
        background: "linear-gradient(90deg, #f39c12, #e67e22)";
        color: "#fff";
    }>;
    STYLE_WARNING2: Readonly<{
        display: "flex";
        borderRadius: "10px";
        fontSize: "clamp(12px, 3vw, 14px)";
        padding: "8px 16px";
        width: "fit-content";
        maxWidth: "400px";
        height: "auto";
        justifyContent: "center";
        alignItems: "center";
        textAlign: "center";
        transition: "all 0.3s ease";
        WebkitTransition: "all 0.3s ease";
        MozTransition: "all 0.3s ease";
        msTransition: "all 0.3s ease";
        boxSizing: "border-box";
        background: "linear-gradient(90deg, #e67e22, #f39c12)";
        color: "#fff";
        boxShadow: "0 4px 10px rgba(230, 126, 34, 0.3)";
    }>;
    STYLE_WARNING3: Readonly<{
        display: "flex";
        borderRadius: "10px";
        fontSize: "clamp(12px, 3vw, 14px)";
        padding: "8px 16px";
        width: "fit-content";
        maxWidth: "400px";
        height: "auto";
        justifyContent: "center";
        alignItems: "center";
        textAlign: "center";
        transition: "all 0.3s ease";
        WebkitTransition: "all 0.3s ease";
        MozTransition: "all 0.3s ease";
        msTransition: "all 0.3s ease";
        boxSizing: "border-box";
        background: "linear-gradient(90deg, #f39c12, #e67e22)";
        color: "#000000";
    }>;
    STYLE_ERROR: Readonly<{
        display: "flex";
        borderRadius: "10px";
        fontSize: "clamp(12px, 3vw, 14px)";
        padding: "8px 16px";
        width: "fit-content";
        maxWidth: "400px";
        height: "auto";
        justifyContent: "center";
        alignItems: "center";
        textAlign: "center";
        transition: "all 0.3s ease";
        WebkitTransition: "all 0.3s ease";
        MozTransition: "all 0.3s ease";
        msTransition: "all 0.3s ease";
        boxSizing: "border-box";
        backgroundColor: "#DC2626";
        color: "#FFFFFF";
        boxShadow: "0 6px 10px rgba(220, 38, 38, 0.2)";
    }>;
    STYLE_ERROR1: Readonly<{
        display: "flex";
        borderRadius: "10px";
        fontSize: "clamp(12px, 3vw, 14px)";
        padding: "8px 16px";
        width: "fit-content";
        maxWidth: "400px";
        height: "auto";
        justifyContent: "center";
        alignItems: "center";
        textAlign: "center";
        transition: "all 0.3s ease";
        WebkitTransition: "all 0.3s ease";
        MozTransition: "all 0.3s ease";
        msTransition: "all 0.3s ease";
        boxSizing: "border-box";
        backgroundColor: "#E74C3C";
        color: "#fff";
    }>;
    STYLE_ERROR2: Readonly<{
        display: "flex";
        borderRadius: "10px";
        fontSize: "clamp(12px, 3vw, 14px)";
        padding: "8px 16px";
        width: "fit-content";
        maxWidth: "400px";
        height: "auto";
        justifyContent: "center";
        alignItems: "center";
        textAlign: "center";
        transition: "all 0.3s ease";
        WebkitTransition: "all 0.3s ease";
        MozTransition: "all 0.3s ease";
        msTransition: "all 0.3s ease";
        boxSizing: "border-box";
        background: "linear-gradient(90deg, #f44336, #e57373)";
        color: "#fff";
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)";
    }>;
    STYLE_INFO: Readonly<{
        display: "flex";
        borderRadius: "10px";
        fontSize: "clamp(12px, 3vw, 14px)";
        padding: "8px 16px";
        width: "fit-content";
        maxWidth: "400px";
        height: "auto";
        justifyContent: "center";
        alignItems: "center";
        textAlign: "center";
        transition: "all 0.3s ease";
        WebkitTransition: "all 0.3s ease";
        MozTransition: "all 0.3s ease";
        msTransition: "all 0.3s ease";
        boxSizing: "border-box";
        backgroundColor: "#2563EB";
        color: "#FFFFFF";
        border: "1px solid rgba(37, 99, 235, 0.3)";
        boxShadow: "0 6px 10px rgba(37, 99, 235, 0.2)";
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        backdropFilter: "blur(6px)";
    }>;
    STYLE_GRADIENT: Readonly<{
        display: "flex";
        borderRadius: "10px";
        fontSize: "clamp(12px, 3vw, 14px)";
        padding: "8px 16px";
        width: "fit-content";
        maxWidth: "400px";
        height: "auto";
        justifyContent: "center";
        alignItems: "center";
        textAlign: "center";
        transition: "all 0.3s ease";
        WebkitTransition: "all 0.3s ease";
        MozTransition: "all 0.3s ease";
        msTransition: "all 0.3s ease";
        boxSizing: "border-box";
        background: "linear-gradient(90deg, #ff9a9e, #fad0c4)";
        color: "#000";
        boxShadow: "0 5px 15px rgba(255, 154, 158, 0.3)";
    }>;
    STYLE_NEON: Readonly<{
        display: "flex";
        borderRadius: "10px";
        fontSize: "clamp(12px, 3vw, 14px)";
        padding: "8px 16px";
        width: "fit-content";
        maxWidth: "400px";
        height: "auto";
        justifyContent: "center";
        alignItems: "center";
        textAlign: "center";
        transition: "all 0.3s ease";
        WebkitTransition: "all 0.3s ease";
        MozTransition: "all 0.3s ease";
        msTransition: "all 0.3s ease";
        boxSizing: "border-box";
        background: "linear-gradient(90deg, #00d2ff, #3a7bd5)";
        color: "#fff";
        boxShadow: "0 0 15px #00d2ff, 0 0 30px #3a7bd5";
    }>;
    STYLE_NEON1: Readonly<{
        display: "flex";
        borderRadius: "10px";
        fontSize: "clamp(12px, 3vw, 14px)";
        padding: "8px 16px";
        width: "fit-content";
        maxWidth: "400px";
        height: "auto";
        justifyContent: "center";
        alignItems: "center";
        textAlign: "center";
        transition: "all 0.3s ease";
        WebkitTransition: "all 0.3s ease";
        MozTransition: "all 0.3s ease";
        msTransition: "all 0.3s ease";
        boxSizing: "border-box";
        backgroundColor: "#0ff";
        color: "#000";
        fontFamily: "monospace";
        boxShadow: "0 0 10px #0ff, 0 0 40px #0ff";
    }>;
    STYLE_DARK_MODE: Readonly<{
        display: "flex";
        borderRadius: "10px";
        fontSize: "clamp(12px, 3vw, 14px)";
        padding: "8px 16px";
        width: "fit-content";
        maxWidth: "400px";
        height: "auto";
        justifyContent: "center";
        alignItems: "center";
        textAlign: "center";
        transition: "all 0.3s ease";
        WebkitTransition: "all 0.3s ease";
        MozTransition: "all 0.3s ease";
        msTransition: "all 0.3s ease";
        boxSizing: "border-box";
        background: "#1f2937";
        color: "#fff";
        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)";
    }>;
    STYLE_LIGHT_MODE: Readonly<{
        display: "flex";
        borderRadius: "10px";
        fontSize: "clamp(12px, 3vw, 14px)";
        padding: "8px 16px";
        width: "fit-content";
        maxWidth: "400px";
        height: "auto";
        justifyContent: "center";
        alignItems: "center";
        textAlign: "center";
        transition: "all 0.3s ease";
        WebkitTransition: "all 0.3s ease";
        MozTransition: "all 0.3s ease";
        msTransition: "all 0.3s ease";
        boxSizing: "border-box";
        background: "#fff";
        color: "#000";
        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)";
    }>;
    STYLE_SHADOW: Readonly<{
        display: "flex";
        borderRadius: "10px";
        fontSize: "clamp(12px, 3vw, 14px)";
        padding: "8px 16px";
        width: "fit-content";
        maxWidth: "400px";
        height: "auto";
        justifyContent: "center";
        alignItems: "center";
        textAlign: "center";
        transition: "all 0.3s ease";
        WebkitTransition: "all 0.3s ease";
        MozTransition: "all 0.3s ease";
        msTransition: "all 0.3s ease";
        boxSizing: "border-box";
        backgroundColor: "#000000";
        color: "#fff";
        fontFamily: "Verdana, sans-serif";
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)";
    }>;
    STYLE_RETRO: Readonly<{
        display: "flex";
        borderRadius: "10px";
        fontSize: "clamp(12px, 3vw, 14px)";
        padding: "8px 16px";
        width: "fit-content";
        maxWidth: "400px";
        height: "auto";
        justifyContent: "center";
        alignItems: "center";
        textAlign: "center";
        transition: "all 0.3s ease";
        WebkitTransition: "all 0.3s ease";
        MozTransition: "all 0.3s ease";
        msTransition: "all 0.3s ease";
        boxSizing: "border-box";
        backgroundColor: "#FCD34D";
        color: "#000";
        boxShadow: "0 6px 12px rgba(252, 211, 77, 0.2)";
    }>;
    STYLE_METALLIC: Readonly<{
        display: "flex";
        borderRadius: "10px";
        fontSize: "clamp(12px, 3vw, 14px)";
        padding: "8px 16px";
        width: "fit-content";
        maxWidth: "400px";
        height: "auto";
        justifyContent: "center";
        alignItems: "center";
        textAlign: "center";
        transition: "all 0.3s ease";
        WebkitTransition: "all 0.3s ease";
        MozTransition: "all 0.3s ease";
        msTransition: "all 0.3s ease";
        boxSizing: "border-box";
        background: "linear-gradient(145deg, #d3d3d3, #a8a8a8)";
        color: "#222";
        fontFamily: "Tahoma, sans-serif";
        boxShadow: "inset 3px 3px 6px #999, inset -3px -3px 6px #ddd";
    }>;
    STYLE_GLOW: Readonly<{
        display: "flex";
        borderRadius: "10px";
        fontSize: "clamp(12px, 3vw, 14px)";
        padding: "8px 16px";
        width: "fit-content";
        maxWidth: "400px";
        height: "auto";
        justifyContent: "center";
        alignItems: "center";
        textAlign: "center";
        transition: "all 0.3s ease";
        WebkitTransition: "all 0.3s ease";
        MozTransition: "all 0.3s ease";
        msTransition: "all 0.3s ease";
        boxSizing: "border-box";
        backgroundColor: "#5A67D8";
        color: "#fff";
        boxShadow: "0 0 15px rgba(90, 103, 216, 0.8)";
    }>;
    STYLE_TRANSPARENT: Readonly<{
        display: "flex";
        borderRadius: "10px";
        fontSize: "clamp(12px, 3vw, 14px)";
        padding: "8px 16px";
        width: "fit-content";
        maxWidth: "400px";
        height: "auto";
        justifyContent: "center";
        alignItems: "center";
        textAlign: "center";
        transition: "all 0.3s ease";
        WebkitTransition: "all 0.3s ease";
        MozTransition: "all 0.3s ease";
        msTransition: "all 0.3s ease";
        boxSizing: "border-box";
        backgroundColor: "rgba(0, 0, 0, 0.6)";
        color: "#fff";
        fontFamily: "system-ui, sans-serif";
    }>;
    TextOverflow: Readonly<{
        ELLIPSIS: "ellipsis";
        WRAP: "wrap";
        CLIP: "clip";
    }>;
    getWebAppContext: () => HTMLElement | Object;
    getContextFor: (container: any) => any;
    /**
     * Factory method - mirrors the Android Toast.makeText() API.
     */
    makeText: (context: any, text: any, duration: any) => any;
    Manager: {
        maxVisible: number;
        _active: never[];
        _queue: never[];
        show: (toast: any) => void;
        _display: (toast: any) => void;
        _applyStackOffset: (toast: any) => void;
        _onHide: (hiddenToast: any) => void;
    };
};
export = _exports;
