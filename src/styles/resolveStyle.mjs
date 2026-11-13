// @ts-check
/**
 * Pure style normalization and validation.
 *
 * The module resolves a consumer's style input into the style the toast
 * should use, the custom keyframes it carried, and the reason a warning is
 * owed. It performs no side effects: the caller decides what to warn about,
 * so the warning text stays where the public method lives.
 *
 * Every alias characterized by the compatibility suite is retained, matched
 * case-insensitively, and resolves to the very same preset object the
 * constructor exposes.
 */

import { BASE_STYLE, PRESET_BY_ALIAS, STYLE_DEFAULT_1 } from './presets.mjs';

/**
 * A frozen style preset: the shared base plus its own overrides.
 *
 * @typedef {import('./presets.mjs').StylePreset} StylePreset
 */

/**
 * A resolved style: the base merged with the consumer's own properties.
 *
 * @typedef {Record<string, string>} MergedStyle
 */

/**
 * Why a warning is owed, if one is.
 *
 * @typedef {'unknown-alias' | 'invalid-type'} StyleWarning
 */

/**
 * The outcome of normalizing a style input.
 *
 * @typedef {object} StyleResolution
 * @property {boolean} resolved Whether the style should replace the current one.
 * @property {StylePreset | MergedStyle} style The resolved style.
 * @property {string | null} keyframes Custom keyframes carried by the input.
 * @property {StyleWarning | null} warning The reason a warning is owed.
 */

/**
 * Normalizes a style input.
 *
 * - a string is looked up in the alias map, lowercased; an unknown alias
 *   resolves to the default style and owes an `unknown-alias` warning;
 * - an object is merged over the shared base, and a string `keyframes`
 *   property is captured as custom keyframes;
 * - anything else is invalid, owes an `invalid-type` warning, and leaves the
 *   current style untouched.
 *
 * @param {unknown} input The consumer's style argument.
 * @returns {StyleResolution}
 */
export function resolveStyle(input) {
  if (typeof input === 'string') {
    const preset = PRESET_BY_ALIAS[input.toLowerCase()];
    if (preset) {
      return { resolved: true, style: preset, keyframes: null, warning: null };
    }
    return { resolved: true, style: STYLE_DEFAULT_1, keyframes: null, warning: 'unknown-alias' };
  }

  if (input !== null && typeof input === 'object') {
    const custom = /** @type {Record<string, string>} */ (input);
    return {
      resolved: true,
      style: { ...BASE_STYLE, ...custom },
      keyframes: typeof custom.keyframes === 'string' ? custom.keyframes : null,
      warning: null,
    };
  }

  return { resolved: false, style: STYLE_DEFAULT_1, keyframes: null, warning: 'invalid-type' };
}
