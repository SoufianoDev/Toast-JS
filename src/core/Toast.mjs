// @ts-check
/**
 * The Toast instance — the public instance contract of the audited
 * current-`main` implementation, ported to native ESM.
 *
 * One canonical runtime: this module owns the instance API, its configuration
 * state and its lifecycle. The queue, the manager, the timer, the renderer and
 * the animation lifecycle arrive as their own modules in later tasks; the
 * pieces this instance needs are private to it until then.
 *
 * Nothing here touches a DOM global at module evaluation time, so importing
 * the module stays safe in Node and SSR.
 */
import {
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
} from '../styles/presets.mjs';
import { resolveStyle } from '../styles/resolveStyle.mjs';

/**
 * A context that resolves once the document body exists.
 *
 * @typedef {object} LazyContext
 * @property {() => boolean} isLazy
 * @property {() => boolean} isReady
 * @property {() => HTMLElement | null} resolve
 * @property {(callback: (context: HTMLElement | null) => void) => void} onReady
 * @property {(element: HTMLElement) => void} forceResolve
 * @property {() => void} reset
 * @property {() => string} toString
 */

/**
 * A frozen style preset: the shared base plus its own overrides.
 *
 * @typedef {import('../styles/presets.mjs').StylePreset} StylePreset
 */

/**
 * A public event callback. Every callback receives the toast instance.
 *
 * @typedef {(toast: Toast) => void} ToastEventCallback
 */

/** The three public event names. */
const EVENTS = /** @type {const} */ (['show', 'hide', 'dismiss']);

const LAZY_CONTEXT_MARKER = typeof Symbol !== 'undefined'
  ? Symbol('toast.lazy.context')
  : '__toast_lazy_context__';

const ALLOWED_ICON_EXTENSIONS = /\.(svg|png|jpg|jpeg|gif|webm|mp4)(\?.*)?$/i;

/** @returns {boolean} Whether a DOM is available in this environment. */
function isDOMAvailable() {
  return typeof document !== 'undefined' && document.body != null;
}

/** @returns {boolean} Whether this is a browser with a usable document. */
function isBrowser() {
  return typeof window !== 'undefined'
    && typeof document !== 'undefined'
    && typeof document.createElement === 'function';
}

/**
 * @param {string} tagName
 * @returns {HTMLElement | null} The element, or `null` without a DOM.
 */
function createElement(tagName) {
  if (!isBrowser()) return null;
  try {
    return document.createElement(tagName);
  } catch {
    return null;
  }
}

/**
 * Creates a context that resolves once the document body exists.
 *
 * @returns {LazyContext}
 */
function createLazyContext() {
  /** @type {HTMLElement | null} */
  let resolvedElement = null;
  /** @type {Array<(context: HTMLElement | null) => void>} */
  const pendingCallbacks = [];

  return {
    isLazy: () => resolvedElement === null,
    isReady: () => typeof document !== 'undefined' && document.body != null,
    resolve: () => {
      if (resolvedElement) return resolvedElement;
      if (typeof document === 'undefined' || !document.body) return null;
      resolvedElement = document.body;
      return resolvedElement;
    },
    onReady: (callback) => {
      if (typeof callback !== 'function') return;
      if (isDOMAvailable()) {
        callback(resolvedElement ?? document.body);
        return;
      }
      pendingCallbacks.push(callback);
      if (typeof document !== 'undefined' && document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          const context = resolvedElement ?? document.body ?? null;
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
 * @returns {boolean} Whether the value is a lazy context.
 */
function isLazyContext(candidate) {
  if (!candidate || typeof candidate !== 'object') return false;
  const lazy = /** @type {{ _marker?: unknown, isLazy?: unknown }} */ (candidate);
  return lazy._marker === LAZY_CONTEXT_MARKER || typeof lazy.isLazy === 'function';
}

/**
 * Blocks the CSS constructs that can execute or exfiltrate.
 *
 * @param {unknown} cssString
 * @returns {string} The CSS, or an empty string when it was blocked.
 */
function sanitizeCSS(cssString) {
  if (typeof cssString !== 'string') return '';
  const dangerous = /url\s*\(|expression\s*\(|@import\s|javascript\s*:/gi;
  if (dangerous.test(cssString)) {
    console.error('[Toast-JS] Potentially unsafe CSS was detected and blocked.');
    return '';
  }
  return cssString;
}

/**
 * @param {unknown} iconPath
 * @returns {void}
 * @throws {TypeError} When the path is not a non-empty string.
 * @throws {Error} When the path is inline SVG markup.
 */
function validateIconPath(iconPath) {
  if (typeof iconPath !== 'string' || iconPath.trim() === '') {
    throw new TypeError('[Toast-JS] setIcon(): iconPath must be a non-empty string.');
  }
  if (iconPath.trim().startsWith('<svg')) {
    throw new Error(
      '[Toast-JS] setIcon(): Inline SVG markup is not supported. Provide a URL to an .svg file instead.',
    );
  }
  if (!ALLOWED_ICON_EXTENSIONS.test(iconPath)) {
    console.warn('[Toast-JS] setIcon(): The icon URL does not end with a recognised extension.');
  }
}

/**
 * The context to render into.
 *
 * @returns {HTMLElement | LazyContext} The body, or a lazy context in SSR.
 */
function getWebAppContext() {
  if (typeof document !== 'undefined' && document.body) return document.body;
  return createLazyContext();
}

/**
 * Resolves a container reference to a render target.
 *
 * @param {unknown} container
 * @returns {HTMLElement | LazyContext}
 */
function getContextFor(container) {
  if (container && typeof container === 'object' && /** @type {Node} */ (container).nodeType === 1) {
    return /** @type {HTMLElement} */ (container);
  }
  if (typeof container === 'string') {
    const lazyContext = createLazyContext();
    const originalResolve = lazyContext.resolve;
    lazyContext.resolve = () => {
      if (typeof document === 'undefined') return null;
      const element = document.querySelector(container);
      if (element instanceof HTMLElement) {
        lazyContext.forceResolve(element);
        return element;
      }
      return originalResolve();
    };
    return lazyContext;
  }
  return getWebAppContext();
}

/**
 * A toast notification.
 */
class Toast {
  /**
   * @param {unknown} context The mount point, resolved eagerly or lazily.
   * @param {string} text The message.
   * @param {number} [duration] Visible duration in milliseconds.
   */
  constructor(context, text, duration) {
    if (typeof text !== 'string') {
      throw new TypeError("[Toast-JS] constructor: 'text' must be a string.");
    }

    /** @type {unknown} */
    this._originalContext = context;
    /** @type {HTMLElement | null} */
    this.context = /** @type {HTMLElement | null} */ (this._resolveContext(context));
    /** @type {string} */
    this.text = text;
    /** @type {number} */
    this.duration = (typeof duration === 'number' && duration > 0) ? duration : Toast.LENGTH_SHORT;

    /** @type {StylePreset} */
    this.customStyle = Toast.STYLE_DEFAULT_1;
    /** @type {string} */
    this.position = Toast.POSITION_BOTTOM_CENTER;
    /** @type {string | null} */
    this.icon = null;
    /** @type {{ width: string, height: string }} */
    this.iconSize = Toast.ICON_SIZE.MEDIUM;
    /** @type {string} */
    this.iconPosition = Toast.ICON_POSITION_START;
    /** @type {Readonly<{ borderRadius: string, overflow?: string }>} */
    this.iconShape = Toast.ICON_SHAPE_CIRCLE;
    /** @type {string} */
    this.enterAnimation = Toast.FADE;
    /** @type {string} */
    this.exitAnimation = Toast.FADE;
    /** @type {boolean} */
    this.dismissible = false;
    /** @type {string} */
    this.closeButtonColor = '#fff';
    /** @type {string} */
    this.textOverflow = 'ellipsis';
    /** @type {string | null} */
    this.customKeyframes = null;

    /** @type {Record<string, ToastEventCallback[]>} */
    this._events = Object.create(null);
    /** @type {HTMLElement | null} */
    this.toastElement = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._timeoutId = null;
    /** @type {number | null} */
    this._rafId = null;
    /** @type {boolean} */
    this._pendingShow = false;
    /** @type {boolean} */
    this._isHiding = false;
    /** @type {string[]} */
    this._injectedStyleIds = [];
    /** @type {number} */
    this._stackOffset = 0;
    /**
     * The manager that adopted this toast, if any. `hide()` notifies it once
     * the element is gone, as the current implementation does.
     *
     * @type {{ _onHide: (toast: Toast) => void } | null}
     */
    this._manager = null;
  }

  /**
   * Resolves a context reference to a DOM element.
   *
   * @param {unknown} context
   * @returns {HTMLElement | null}
   */
  _resolveContext(context) {
    if (!isDOMAvailable()) return null;
    if (isLazyContext(context)) return /** @type {LazyContext} */ (context).resolve();
    if (context && typeof context === 'object' && /** @type {Node} */ (context).nodeType === 1) {
      return /** @type {HTMLElement} */ (context);
    }
    return document.body;
  }

  /**
   * @param {number} duration Visible duration in milliseconds.
   * @returns {this}
   */
  setDuration(duration) {
    if (typeof duration !== 'number' || duration <= 0) {
      console.warn('[Toast-JS] setDuration(): expected a positive number. Ignoring.');
      return this;
    }
    this.duration = duration;
    if (this.toastElement && this._timeoutId !== null) {
      clearTimeout(this._timeoutId);
      this._timeoutId = setTimeout(() => this.hide(), this.duration);
    }
    return this;
  }

  /**
   * @param {string | Record<string, string>} style A preset alias or a style object.
   * @returns {this}
   */
  setStyle(style) {
    const resolution = resolveStyle(style);

    if (resolution.warning === 'unknown-alias') {
      console.warn(`[Toast-JS] setStyle(): Unknown style "${style}".`);
    } else if (resolution.warning === 'invalid-type') {
      console.warn('[Toast-JS] setStyle(): argument must be a string or an object.');
    }

    if (resolution.resolved) {
      this.customStyle = resolution.style;
      if (resolution.keyframes !== null) {
        this.customKeyframes = resolution.keyframes;
      }
    }
    return this;
  }

  /**
   * @param {string} position One of the six position constants.
   * @returns {this}
   */
  setPosition(position) {
    const valid = [
      Toast.POSITION_TOP_LEFT, Toast.POSITION_TOP_CENTER, Toast.POSITION_TOP_RIGHT,
      Toast.POSITION_BOTTOM_LEFT, Toast.POSITION_BOTTOM_CENTER, Toast.POSITION_BOTTOM_RIGHT,
    ];
    if (!valid.includes(position)) {
      console.warn(`[Toast-JS] setPosition(): "${position}" is not a valid position.`);
      this.position = Toast.POSITION_BOTTOM_CENTER;
    } else {
      this.position = position;
    }
    return this;
  }

  /**
   * @param {string | { css: string, keyframes?: string }} enterAnimation
   * @param {string | { css: string, keyframes?: string }} [exitAnimation]
   * @returns {this}
   */
  setAnimation(enterAnimation, exitAnimation) {
    this._resolveAnimation(enterAnimation, 'enter');
    if (exitAnimation !== undefined) {
      this._resolveAnimation(exitAnimation, 'exit');
    }
    return this;
  }

  /**
   * @param {string | { css: string, keyframes?: string }} anim
   * @param {'enter' | 'exit'} slot
   * @returns {void}
   */
  _resolveAnimation(anim, slot) {
    if (typeof anim === 'string') {
      if (slot === 'enter') this.enterAnimation = anim;
      else this.exitAnimation = anim;
      return;
    }
    if (anim !== null && typeof anim === 'object' && typeof anim.css === 'string') {
      const safeCss = sanitizeCSS(anim.css);
      const safeKeyframes = typeof anim.keyframes === 'string' ? sanitizeCSS(anim.keyframes) : '';
      if (!safeCss && !safeKeyframes) return;

      const name = `toast-custom-${slot}-${Date.now()}`;
      const style = createElement('style');
      if (!style) return;
      style.id = name;
      style.textContent = `.${name} { ${safeCss} } ${safeKeyframes}`;
      const head = document.head || document.getElementsByTagName('head')[0];
      if (head) {
        head.appendChild(style);
        this._injectedStyleIds.push(name);
      }
      if (slot === 'enter') this.enterAnimation = name;
      else this.exitAnimation = name;
      return;
    }
    console.warn('[Toast-JS] setAnimation(): each argument must be a string or { css, keyframes? }.');
  }

  /**
   * @param {string} iconPath URL of the icon.
   * @param {string | { width: string, height: string }} [size]
   * @param {string} [position]
   * @returns {this}
   */
  setIcon(iconPath, size, position) {
    const iconPosition = position === undefined ? Toast.ICON_POSITION_START : position;
    validateIconPath(iconPath);
    this.icon = iconPath;

    if (size !== null && size !== undefined) {
      if (typeof size === 'object' && size.width && size.height) {
        this.iconSize = size;
      } else if (typeof size === 'string') {
        const key = size.toUpperCase();
        const known = /** @type {Record<string, { width: string, height: string }>} */ (Toast.ICON_SIZE)[key];
        if (known) {
          this.iconSize = known;
        } else {
          console.warn(`[Toast-JS] setIcon(): Unknown size "${size}".`);
        }
      }
    }

    const validPositions = [Toast.ICON_POSITION_START, Toast.ICON_POSITION_END];
    this.iconPosition = validPositions.includes(iconPosition) ? iconPosition : Toast.ICON_POSITION_START;
    return this;
  }

  /**
   * @param {Readonly<{ borderRadius: string, overflow?: string }>} [shape]
   * @returns {this}
   */
  setIconShape(shape) {
    const requested = shape === undefined ? Toast.ICON_SHAPE_CIRCLE : shape;
    const valid = /** @type {Readonly<{ borderRadius: string, overflow?: string }>[]} */ ([
      Toast.ICON_SHAPE_CIRCLE,
      Toast.ICON_SHAPE_SQUARE,
      Toast.ICON_SHAPE_SQUIRCLE,
    ]);
    this.iconShape = valid.includes(requested)
      ? requested
      : Toast.ICON_SHAPE_CIRCLE;
    return this;
  }

  /**
   * @param {boolean} [dismissible]
   * @param {string} [closeButtonColor]
   * @returns {this}
   */
  setDismissible(dismissible, closeButtonColor) {
    const dismissibleValue = dismissible === undefined ? true : dismissible;
    const colorValue = closeButtonColor === undefined ? '#fff' : closeButtonColor;
    this.dismissible = Boolean(dismissibleValue);
    this.closeButtonColor = typeof colorValue === 'string' ? colorValue : '#fff';
    return this;
  }

  /**
   * @param {string} [mode]
   * @returns {this}
   */
  setTextOverflow(mode) {
    const requested = mode === undefined ? Toast.TextOverflow.ELLIPSIS : mode;
    const valid = /** @type {string[]} */ (Object.values(Toast.TextOverflow));
    if (!valid.includes(requested)) {
      console.warn(`[Toast-JS] setTextOverflow(): "${requested}" is not valid.`);
      this.textOverflow = Toast.TextOverflow.ELLIPSIS;
    } else {
      this.textOverflow = requested;
    }
    return this;
  }

  /**
   * @param {string} event One of `show`, `hide` or `dismiss`.
   * @param {ToastEventCallback} callback
   * @returns {this}
   */
  on(event, callback) {
    if (typeof callback !== 'function') {
      console.warn('[Toast-JS] on(): callback must be a function.');
      return this;
    }
    if (!EVENTS.includes(/** @type {'show' | 'hide' | 'dismiss'} */ (event))) {
      console.warn(`[Toast-JS] on(): "${event}" is not a valid event.`);
      return this;
    }
    if (!this._events[event]) this._events[event] = [];
    this._events[event].push(callback);
    return this;
  }

  /**
   * @param {string} event
   * @param {ToastEventCallback} callback
   * @returns {this}
   */
  off(event, callback) {
    if (!this._events[event]) return this;
    this._events[event] = this._events[event].filter((registered) => registered !== callback);
    return this;
  }

  /**
   * @param {string} event
   * @returns {void}
   */
  _emit(event) {
    const callbacks = this._events[event] || [];
    for (const callback of callbacks) {
      try {
        callback(this);
      } catch (error) {
        console.error(`[Toast-JS] Error in "${event}" event handler:`, error);
      }
    }
  }

  /**
   * @param {ToastEventCallback} callback
   * @returns {this}
   */
  addCallback(callback) {
    if (typeof callback === 'function') {
      this.on('show', callback);
    }
    return this;
  }

  /**
   * @returns {HTMLElement | null}
   */
  _createIconElement() {
    if (!this.icon) return null;

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.flexShrink = '0';
    Object.assign(container.style, this.iconSize, this.iconShape);

    const lowerIcon = this.icon.toLowerCase();
    /** @type {HTMLImageElement | HTMLVideoElement | null} */
    let media = null;

    if (lowerIcon.endsWith('.webm') || lowerIcon.endsWith('.mp4')) {
      const video = document.createElement('video');
      media = video;
      if (video) {
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playbackRate = 1.0;
        video.playsInline = true;
        video.setAttribute('aria-label', 'Toast notification icon');
      }
    } else {
      const image = document.createElement('img');
      media = image;
      if (image) {
        image.alt = 'Toast notification icon';
      }
    }

    if (media) {
      media.src = this.icon;
      media.style.width = '100%';
      media.style.height = '100%';
      media.style.objectFit = 'contain';
      container.appendChild(media);
    }
    return container;
  }

  /**
   * @returns {HTMLButtonElement | null}
   */
  _createCloseButton() {
    const button = document.createElement('button');
    button.className = 'toast-js-close-btn';
    button.setAttribute('aria-label', 'Close notification');
    Object.assign(button.style, {
      background: 'none',
      border: 'none',
      color: this.closeButtonColor,
      cursor: 'pointer',
      padding: '0 0 0 12px',
      fontSize: '18px',
      lineHeight: '1',
      opacity: '0.8',
      transition: 'opacity 0.2s ease',
      flexShrink: '0',
    });
    button.textContent = 'x';
    button.addEventListener('click', () => {
      this._emit('dismiss');
      this.hide();
    });
    return button;
  }

  /**
   * @returns {Record<string, string>}
   */
  _getPositionStyles() {
    /** @type {Record<string, Record<string, string>>} */
    const positions = {
      [Toast.POSITION_TOP_LEFT]: { top: '20px', left: '20px' },
      [Toast.POSITION_TOP_CENTER]: { top: '20px', left: '50%', transform: 'translateX(-50%)' },
      [Toast.POSITION_TOP_RIGHT]: { top: '20px', right: '20px' },
      [Toast.POSITION_BOTTOM_LEFT]: { bottom: '20px', left: '20px' },
      [Toast.POSITION_BOTTOM_CENTER]: { bottom: '20px', left: '50%', transform: 'translateX(-50%)' },
      [Toast.POSITION_BOTTOM_RIGHT]: { bottom: '20px', right: '20px' },
    };
    const styles = positions[this.position] || positions[Toast.POSITION_BOTTOM_CENTER];
    if (this._stackOffset) {
      const isBottom = this.position.startsWith('bottom');
      const property = isBottom ? 'bottom' : 'top';
      const offset = { ...styles };
      offset[property] = `${20 + this._stackOffset}px`;
      return offset;
    }
    return styles;
  }

  /**
   * @returns {this}
   */
  show() {
    if (!isBrowser()) {
      console.warn('[Toast-JS] show() called in non-browser environment. Toast will not be displayed.');
      return this;
    }

    if (this.toastElement || this._pendingShow) return this;

    if (!this.context) {
      this.context = this._resolveContext(this._originalContext);
      if (!this.context) {
        if (isLazyContext(this._originalContext)) {
          this._pendingShow = true;
          /** @type {LazyContext} */ (this._originalContext).onReady((context) => {
            this._pendingShow = false;
            if (context) {
              this.context = context;
              this._doShow();
            }
          });
          return this;
        }
        this.context = document.body;
        if (!this.context) {
          console.warn('[Toast-JS] show(): No valid context available.');
          return this;
        }
      }
    }

    this._doShow();
    return this;
  }

  /**
   * @returns {void}
   */
  _doShow() {
    const element = document.createElement('div');
    this.toastElement = element;
    element.setAttribute('role', 'alert');
    element.setAttribute('aria-live', 'assertive');
    element.setAttribute('aria-atomic', 'true');

    const classes = ['toast-js-element', this.enterAnimation, this.dismissible ? 'is-dismissible' : '']
      .filter(Boolean);
    element.className = classes.join(' ');

    const content = document.createElement('div');
    Object.assign(content.style, {
      display: 'flex',
      alignItems: 'center',
      minHeight: '48px',
      padding: '8px 12px',
      width: '100%',
      boxSizing: 'border-box',
    });

    const iconElement = this._createIconElement();
    if (iconElement) {
      if (this.iconPosition === Toast.ICON_POSITION_START) {
        iconElement.style.marginRight = '12px';
        content.insertBefore(iconElement, content.firstChild);
      } else {
        iconElement.style.marginLeft = '12px';
        content.appendChild(iconElement);
      }
    }

    const textSpan = document.createElement('span');
    textSpan.innerText = this.text;
    textSpan.style.flex = '1';

    if (this.textOverflow === 'wrap') {
      textSpan.style.whiteSpace = 'normal';
      textSpan.style.wordBreak = 'break-word';
      textSpan.style.overflow = 'visible';
    } else if (this.textOverflow === 'clip') {
      textSpan.style.whiteSpace = 'nowrap';
      textSpan.style.overflow = 'hidden';
      textSpan.style.textOverflow = 'clip';
    } else {
      textSpan.style.whiteSpace = 'nowrap';
      textSpan.style.overflow = 'hidden';
      textSpan.style.textOverflow = 'ellipsis';
    }

    if (this.iconPosition === Toast.ICON_POSITION_END) {
      content.insertBefore(textSpan, content.firstChild);
    } else {
      content.appendChild(textSpan);
    }

    if (this.dismissible) {
      const closeButton = this._createCloseButton();
      if (closeButton) content.appendChild(closeButton);
    }

    element.appendChild(content);
    Object.assign(element.style, this.customStyle);

    Object.assign(element.style, this._getPositionStyles(), {
      opacity: '0',
      transform: this.position.includes('center') ? 'translateX(-50%) scale(0.95)' : 'scale(0.95)',
    });

    if (this.customKeyframes) {
      const keyframesId = `toast-js-custom-kf-${Date.now()}`;
      if (!document.getElementById(keyframesId)) {
        const keyframeStyle = document.createElement('style');
        keyframeStyle.id = keyframesId;
        keyframeStyle.textContent = sanitizeCSS(this.customKeyframes);
        const head = document.head || document.getElementsByTagName('head')[0];
        if (head) {
          head.appendChild(keyframeStyle);
          this._injectedStyleIds.push(keyframesId);
        }
      }
    }

    /** @type {HTMLElement | null} */
    this.context?.appendChild(element);

    const raf = window.requestAnimationFrame
      || /** @type {any} */ (window).webkitRequestAnimationFrame
      || /** @type {any} */ (window).mozRequestAnimationFrame
      || ((callback) => setTimeout(callback, 16));
    this._rafId = raf.call(window, () => {
      this._rafId = null;
      if (!this.toastElement) return;
      this.toastElement.style.opacity = '1';
      this.toastElement.style.transform = this.position.includes('center')
        ? 'translateX(-50%) scale(1)'
        : 'scale(1)';
    });

    this._emit('show');

    this._timeoutId = setTimeout(() => this.hide(), this.duration);
  }

  /**
   * @returns {void}
   */
  _cleanupInjectedStyles() {
    for (const id of this._injectedStyleIds) {
      const element = document.getElementById(id);
      if (element && element.parentNode) element.parentNode.removeChild(element);
    }
    this._injectedStyleIds.length = 0;
  }

  /**
   * @returns {void}
   */
  hide() {
    if (!this.toastElement || this._isHiding) return;
    this._isHiding = true;

    if (this._rafId !== null) {
      const cancel = window.cancelAnimationFrame
        || /** @type {any} */ (window).webkitCancelAnimationFrame
        || /** @type {any} */ (window).mozCancelAnimationFrame
        || ((id) => clearTimeout(id));
      cancel.call(window, this._rafId);
      this._rafId = null;
    }

    if (this._timeoutId !== null) {
      clearTimeout(this._timeoutId);
      this._timeoutId = null;
    }

    const element = this.toastElement;
    element.className = ['toast-js-element', this.exitAnimation].filter(Boolean).join(' ');
    element.style.opacity = '0';
    element.style.transform = this.position.includes('center')
      ? 'translateX(-50%) scale(0.8)'
      : 'scale(0.8)';

    setTimeout(() => {
      this._cleanupInjectedStyles();
      if (element.parentNode) element.parentNode.removeChild(element);
      if (this.toastElement === element) this.toastElement = null;
      this._isHiding = false;
      this._emit('hide');
      if (this._manager) this._manager._onHide(this);
    }, 350);
  }
}

// ── Static surface ──────────────────────────────────────────────────────────

Toast.LENGTH_SHORT = 3000;
Toast.LENGTH_LONG = 6500;

Toast.POSITION_TOP_LEFT = 'top-left';
Toast.POSITION_TOP_CENTER = 'top-center';
Toast.POSITION_TOP_RIGHT = 'top-right';
Toast.POSITION_BOTTOM_LEFT = 'bottom-left';
Toast.POSITION_BOTTOM_CENTER = 'bottom-center';
Toast.POSITION_BOTTOM_RIGHT = 'bottom-right';

Toast.ICON_POSITION_START = 'start';
Toast.ICON_POSITION_END = 'end';

Toast.FADE = 'fade';
Toast.SLIDE_IN_TOP = 'slide-in-top';
Toast.SLIDE_OUT_TOP = 'slide-out-top';
Toast.SLIDE_IN_BOTTOM = 'slide-in-bottom';
Toast.SLIDE_OUT_BOTTOM = 'slide-out-bottom';
Toast.SLIDE_IN_TOP_CENTER = 'slide-in-top-center';
Toast.SLIDE_OUT_TOP_CENTER = 'slide-out-top-center';
Toast.SLIDE_IN_BOTTOM_CENTER = 'slide-in-bottom-center';
Toast.SLIDE_OUT_BOTTOM_CENTER = 'slide-out-bottom-center';
Toast.SLIDE_IN_RIGHT = 'slide-in-right';
Toast.SLIDE_OUT_RIGHT = 'slide-out-right';
Toast.SLIDE_IN_LEFT = 'slide-in-left';
Toast.SLIDE_OUT_LEFT = 'slide-out-left';
Toast.LIGHT_SPEED_IN_RIGHT = 'light-speed-in-right';
Toast.LIGHT_SPEED_OUT_RIGHT = 'light-speed-out-right';
Toast.LIGHT_SPEED_IN_LEFT = 'light-speed-in-left';
Toast.LIGHT_SPEED_OUT_LEFT = 'light-speed-out-left';
Toast.WAVE_IN = 'wave-in';
Toast.WAVE_OUT = 'wave-out';
Toast.WOBBLE_IN = 'wobble-in';
Toast.WOBBLE_OUT = 'wobble-out';

Toast.ICON_SIZE = Object.freeze({
  SMALL: { width: '20px', height: '20px' },
  MEDIUM: { width: '24px', height: '24px' },
  LARGE: { width: '32px', height: '32px' },
  EXTRA_LARGE: { width: '48px', height: '48px' },
});

Toast.ICON_SHAPE_CIRCLE = Object.freeze({ borderRadius: '50%', overflow: 'hidden' });
Toast.ICON_SHAPE_SQUARE = Object.freeze({ borderRadius: '0%' });
Toast.ICON_SHAPE_SQUIRCLE = Object.freeze({ borderRadius: '20px', overflow: 'hidden' });

Toast.STYLE_DEFAULT_1 = STYLE_DEFAULT_1;
Toast.STYLE_DEFAULT_2 = STYLE_DEFAULT_2;
Toast.STYLE_SUCCESS = STYLE_SUCCESS;
Toast.STYLE_WARNING = STYLE_WARNING;
Toast.STYLE_WARNING1 = STYLE_WARNING1;
Toast.STYLE_WARNING2 = STYLE_WARNING2;
Toast.STYLE_WARNING3 = STYLE_WARNING3;
Toast.STYLE_ERROR = STYLE_ERROR;
Toast.STYLE_ERROR1 = STYLE_ERROR1;
Toast.STYLE_ERROR2 = STYLE_ERROR2;
Toast.STYLE_INFO = STYLE_INFO;
Toast.STYLE_GRADIENT = STYLE_GRADIENT;
Toast.STYLE_NEON = STYLE_NEON;
Toast.STYLE_NEON1 = STYLE_NEON1;
Toast.STYLE_DARK_MODE = STYLE_DARK_MODE;
Toast.STYLE_LIGHT_MODE = STYLE_LIGHT_MODE;
Toast.STYLE_SHADOW = STYLE_SHADOW;
Toast.STYLE_RETRO = STYLE_RETRO;
Toast.STYLE_METALLIC = STYLE_METALLIC;
Toast.STYLE_GLOW = STYLE_GLOW;
Toast.STYLE_TRANSPARENT = STYLE_TRANSPARENT;

Toast.TextOverflow = Object.freeze({
  ELLIPSIS: 'ellipsis',
  WRAP: 'wrap',
  CLIP: 'clip',
});

Toast.getWebAppContext = getWebAppContext;
Toast.getContextFor = getContextFor;

/**
 * Mirrors the Android `Toast.makeText()` API.
 *
 * @param {unknown} context
 * @param {string} text
 * @param {number} [duration]
 * @returns {Toast}
 */
Toast.makeText = function makeText(context, text, duration) {
  return new Toast(context, text, duration === undefined ? Toast.LENGTH_SHORT : duration);
};

export { Toast };
export default Toast;
