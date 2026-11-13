// @ts-check
/**
 * The 21 frozen public style presets, the shared base they spread, and the
 * alias map that resolves a consumer's style name to a preset.
 *
 * The values, the freezing and the identity of every preset are part of the
 * public API contract.
 */

/**
 * A frozen style preset: the shared base plus its own overrides.
 *
 * @typedef {Readonly<Record<string, string>>} StylePreset
 */

/**
 * The shared base every preset spreads.
 *
 * @type {Readonly<Record<string, string>>}
 */
const BASE_STYLE = Object.freeze({
  display: 'flex',
  borderRadius: '10px',
  fontSize: 'clamp(12px, 3vw, 14px)',
  padding: '8px 16px',
  width: 'fit-content',
  maxWidth: '400px',
  height: 'auto',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  transition: 'all 0.3s ease',
  WebkitTransition: 'all 0.3s ease',
  MozTransition: 'all 0.3s ease',
  msTransition: 'all 0.3s ease',
  boxSizing: 'border-box',
});

/**
 * Builds one frozen preset: the shared base plus a preset's own overrides.
 *
 * @param {Record<string, string>} overrides
 * @returns {StylePreset}
 */
function preset(overrides) {
  return Object.freeze({ ...BASE_STYLE, ...overrides });
}

const STYLE_DEFAULT_1 = preset({ backgroundColor: '#323232', color: '#fff', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' });
const STYLE_DEFAULT_2 = preset({ backgroundColor: 'rgba(0, 0, 0, 0.8)', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' });
const STYLE_SUCCESS = preset({ backgroundColor: '#16A34A', color: '#FFFFFF', boxShadow: '0 6px 10px rgba(16, 185, 129, 0.2)' });
const STYLE_WARNING = preset({ backgroundColor: '#FF9800', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' });
const STYLE_WARNING1 = preset({ background: 'linear-gradient(90deg, #f39c12, #e67e22)', color: '#fff' });
const STYLE_WARNING2 = preset({ background: 'linear-gradient(90deg, #e67e22, #f39c12)', color: '#fff', boxShadow: '0 4px 10px rgba(230, 126, 34, 0.3)' });
const STYLE_WARNING3 = preset({ background: 'linear-gradient(90deg, #f39c12, #e67e22)', color: '#000000' });
const STYLE_ERROR = preset({ backgroundColor: '#DC2626', color: '#FFFFFF', boxShadow: '0 6px 10px rgba(220, 38, 38, 0.2)' });
const STYLE_ERROR1 = preset({ backgroundColor: '#E74C3C', color: '#fff' });
const STYLE_ERROR2 = preset({ background: 'linear-gradient(90deg, #f44336, #e57373)', color: '#fff', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)' });
const STYLE_INFO = preset({ backgroundColor: '#2563EB', color: '#FFFFFF', border: '1px solid rgba(37, 99, 235, 0.3)', boxShadow: '0 6px 10px rgba(37, 99, 235, 0.2)', fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", backdropFilter: 'blur(6px)' });
const STYLE_GRADIENT = preset({ background: 'linear-gradient(90deg, #ff9a9e, #fad0c4)', color: '#000', boxShadow: '0 5px 15px rgba(255, 154, 158, 0.3)' });
const STYLE_NEON = preset({ background: 'linear-gradient(90deg, #00d2ff, #3a7bd5)', color: '#fff', boxShadow: '0 0 15px #00d2ff, 0 0 30px #3a7bd5' });
const STYLE_NEON1 = preset({ backgroundColor: '#0ff', color: '#000', fontFamily: 'monospace', boxShadow: '0 0 10px #0ff, 0 0 40px #0ff' });
const STYLE_DARK_MODE = preset({ background: '#1f2937', color: '#fff', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)' });
const STYLE_LIGHT_MODE = preset({ background: '#fff', color: '#000', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' });
const STYLE_SHADOW = preset({ backgroundColor: '#000000', color: '#fff', fontFamily: 'Verdana, sans-serif', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)' });
const STYLE_RETRO = preset({ backgroundColor: '#FCD34D', color: '#000', boxShadow: '0 6px 12px rgba(252, 211, 77, 0.2)' });
const STYLE_METALLIC = preset({ background: 'linear-gradient(145deg, #d3d3d3, #a8a8a8)', color: '#222', fontFamily: 'Tahoma, sans-serif', boxShadow: 'inset 3px 3px 6px #999, inset -3px -3px 6px #ddd' });
const STYLE_GLOW = preset({ backgroundColor: '#5A67D8', color: '#fff', boxShadow: '0 0 15px rgba(90, 103, 216, 0.8)' });
const STYLE_TRANSPARENT = preset({ backgroundColor: 'rgba(0, 0, 0, 0.6)', color: '#fff', fontFamily: 'system-ui, sans-serif' });

/**
 * Every accepted alias, mapped to the preset it resolves to.
 *
 * The historical misspellings `defult_1` and `defult_2` resolve to the very
 * same objects as `default_1` and `default_2`, so a toast styled through
 * either spelling is identical by reference.
 *
 * @type {Readonly<Record<string, StylePreset>>}
 */
const PRESET_BY_ALIAS = Object.freeze({
  default_1: STYLE_DEFAULT_1,
  defult_1: STYLE_DEFAULT_1,
  default_2: STYLE_DEFAULT_2,
  defult_2: STYLE_DEFAULT_2,
  success: STYLE_SUCCESS,
  error: STYLE_ERROR,
  error1: STYLE_ERROR1,
  error2: STYLE_ERROR2,
  warning: STYLE_WARNING,
  warning1: STYLE_WARNING1,
  warning2: STYLE_WARNING2,
  warning3: STYLE_WARNING3,
  info: STYLE_INFO,
  gradient: STYLE_GRADIENT,
  neon: STYLE_NEON,
  neon1: STYLE_NEON1,
  shadow: STYLE_SHADOW,
  retro: STYLE_RETRO,
  metallic: STYLE_METALLIC,
  glow: STYLE_GLOW,
  transparent: STYLE_TRANSPARENT,
  dark_mode: STYLE_DARK_MODE,
  light_mode: STYLE_LIGHT_MODE,
});

export {
  BASE_STYLE,
  PRESET_BY_ALIAS,
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
};
