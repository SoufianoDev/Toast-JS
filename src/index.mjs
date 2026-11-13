// @ts-check
/**
 * Primary ESM entry for Toast-JS.
 *
 * The canonical runtime is the audited current-`main` implementation in
 * `./Toast.js`. Reaching it through the platform's module system keeps a single
 * instance: a process that also loads the CommonJS entry observes the same API
 * object, the same `Manager`, the same queue, and the same module-level
 * constants (DEC-040, `research.md` R-003.4e).
 *
 * Importing it here must stay free of DOM access at module evaluation time.
 */
import Toast from './Toast.js';

export default Toast;
export { Toast };

/**
 * The public static surface, re-exported by name so ESM consumers receive the
 * same named bindings the CommonJS entry already provides (`research.md`
 * R-003.4d).
 *
 * The bindings are initialized once, when this module is evaluated. The runtime
 * assigns every static during its own initialization, which completes before
 * this body runs, so primitive exports hold the runtime's final values and
 * object exports are references to the runtime's own objects — reference
 * identity holds across both entry points (DEC-041).
 */
export const {
  // Durations
  LENGTH_SHORT,
  LENGTH_LONG,

  // Display positions
  POSITION_TOP_LEFT,
  POSITION_TOP_CENTER,
  POSITION_TOP_RIGHT,
  POSITION_BOTTOM_LEFT,
  POSITION_BOTTOM_CENTER,
  POSITION_BOTTOM_RIGHT,

  // Icon placement
  ICON_POSITION_START,
  ICON_POSITION_END,

  // Animations
  FADE,
  SLIDE_IN_TOP,
  SLIDE_OUT_TOP,
  SLIDE_IN_BOTTOM,
  SLIDE_OUT_BOTTOM,
  SLIDE_IN_TOP_CENTER,
  SLIDE_OUT_TOP_CENTER,
  SLIDE_IN_BOTTOM_CENTER,
  SLIDE_OUT_BOTTOM_CENTER,
  SLIDE_IN_RIGHT,
  SLIDE_OUT_RIGHT,
  SLIDE_IN_LEFT,
  SLIDE_OUT_LEFT,
  LIGHT_SPEED_IN_RIGHT,
  LIGHT_SPEED_OUT_RIGHT,
  LIGHT_SPEED_IN_LEFT,
  LIGHT_SPEED_OUT_LEFT,
  WAVE_IN,
  WAVE_OUT,
  WOBBLE_IN,
  WOBBLE_OUT,

  // Icon size and shape
  ICON_SIZE,
  ICON_SHAPE_CIRCLE,
  ICON_SHAPE_SQUARE,
  ICON_SHAPE_SQUIRCLE,

  // Style presets
  STYLE_DEFAULT_1,
  STYLE_DEFAULT_2,
  STYLE_SUCCESS,
  STYLE_WARNING,
  STYLE_WARNING1,
  STYLE_WARNING2,
  STYLE_WARNING3,
  STYLE_ERROR,
  STYLE_ERROR1,
  STYLE_ERROR2,
  STYLE_INFO,
  STYLE_GRADIENT,
  STYLE_NEON,
  STYLE_NEON1,
  STYLE_DARK_MODE,
  STYLE_LIGHT_MODE,
  STYLE_SHADOW,
  STYLE_RETRO,
  STYLE_METALLIC,
  STYLE_GLOW,
  STYLE_TRANSPARENT,

  // Text overflow
  TextOverflow,

  // Context and factory helpers
  getWebAppContext,
  getContextFor,
  makeText,

  // Manager singleton
  Manager,
} = Toast;
