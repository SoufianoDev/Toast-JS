/**
 * @file Toast.js
 * @fileoverview Toast notification library for creating customizable, animated toast messages
 * @version 2.0.0
 * @license MIT
 * @copyright 2025 Soufiano Dev
 *
 * @class Toast
 * @classdesc Creates toast notifications with customizable styles, animations, icons, and behaviors.
 *
 * @author Soufiane Hanane
 */

/**
 * Toast class to create and display customizable toast notifications.
 */
class Toast {
  /**
   * Toast duration constants.
   * @type {number}
   */
  static LENGTH_SHORT = 3000; // 3 seconds
  static LENGTH_LONG = 6500; // 6.5 seconds

  /**
   * Toast position constants.
   * @type {string}
   */
  static POSITION_TOP_LEFT = "top-left";
  static POSITION_TOP_CENTER = "top-center";
  static POSITION_TOP_RIGHT = "top-right";
  static POSITION_BOTTOM_LEFT = "bottom-left";
  static POSITION_BOTTOM_CENTER = "bottom-center";
  static POSITION_BOTTOM_RIGHT = "bottom-right";

  /**
   * Icon position constants.
   * @type {string}
   */
  static ICON_POSITION_START = "start";
  static ICON_POSITION_END = "end";

  /**
   * Predefined animation constants.
   * @type {string}
   */
  static FADE = "fade";
  static SLIDE_IN_TOP = "slide-in-top";
  static SLIDE_OUT_TOP = "slide-out-top";
  static SLIDE_IN_BOTTOM = "slide-in-bottom";
  static SLIDE_OUT_BOTTOM = "slide-out-bottom";
  static SLIDE_IN_TOP_CENTER = "slide-in-top-center";
  static SLIDE_OUT_TOP_CENTER = "slide-out-top-center";
  static SLIDE_IN_BOTTOM_CENTER = "slide-in-bottom-center";
  static SLIDE_OUT_BOTTOM_CENTER = "slide-out-bottom-center";
  static SLIDE_IN_RIGHT = "slide-in-right";
  static SLIDE_OUT_RIGHT = "slide-out-right";
  static SLIDE_IN_LEFT = "slide-in-left";
  static SLIDE_OUT_LEFT = "slide-out-left";
  static LIGHT_SPEED_IN_RIGHT = "light-speed-in-right";
  static LIGHT_SPEED_OUT_RIGHT = "light-speed-out-right";
  static LIGHT_SPEED_IN_LEFT = "light-speed-in-left";
  static LIGHT_SPEED_OUT_LEFT = "light-speed-out-left";
  static WAVE_IN = "wave-in";
  static WAVE_OUT = "wave-out";
  static WOBBLE_IN = "wobble-in";
  static WOBBLE_OUT = "wobble-out";

  /**
   * Icon size constants.
   * @type {Object}
   */
  static ICON_SIZE = {
    SMALL: { width: "20px", height: "20px" },
    MEDIUM: { width: "24px", height: "24px" },
    LARGE: { width: "32px", height: "32px" },
    EXTRA_LARGE: { width: "48px", height: "48px" },
  };

  /**
   * Icon shape styles.
   * @type {Object}
   */
  static ICON_SHAPE_CIRCLE = {
    borderRadius: "50%",
    overflow: "hidden",
  };
  static ICON_SHAPE_SQUARE = {
    borderRadius: "0%",
  };
  static ICON_SHAPE_SQUIRCLE = {
    borderRadius: "20px",
    overflow: "hidden",
  };

  /**
   * Predefined style constants.
   * @type {Object}
   */
  static STYLE_DEFAULT_1 = {
    backgroundColor: "#323232",
    color: "#fff",
    display: "flex",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
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

    "@media (max-width: 480px)": {
      width: "90%",
      maxWidth: "none",
      padding: "20vh 20vh",
      borderRadius: "8px",
    },
  };

  static STYLE_DEFAULT_2 = {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    color: "#fff",
    display: "flex",
    fontFamily: "system-ui, -apple-system, sans-serif",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
    fontSize: "14px",
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

    "@media (max-width: 480px)": {
      width: "90%",
      maxWidth: "none",
      padding: "20vh 20vh",
      borderRadius: "8px",
    },
  };

  static STYLE_SUCCESS = {
    backgroundColor: "#16A34A", // Vibrant green
    color: "#FFFFFF",
    display: "flex",
    boxShadow: "0 6px 10px rgba(16, 185, 129, 0.2)",
    borderRadius: "10px",
    fontSize: "clamp(12px, 3vw, 14px)",
    padding: "8px 16px",
    width: "fit-content",
    maxWidth: "400px",
    height: "fit-content",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    transition: "all 0.3s ease",
    WebkitTransition: "all 0.3s ease",
    MozTransition: "all 0.3s ease",
    msTransition: "all 0.3s ease",

    "@media (max-width: 480px)": {
      width: "90%",
      maxWidth: "none",
      padding: "20vh 20vh",
      borderRadius: "8px",
    },
  };

  static STYLE_WARNING = {
    backgroundColor: "#FF9800",
    color: "#fff",
    display: "flex",
    fontFamily: "system-ui, -apple-system, sans-serif",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
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

    "@media (max-width: 480px)": {
      width: "90%",
      maxWidth: "none",
      padding: "20vh 20vh",
      borderRadius: "8px",
    },
  };

  static STYLE_WARNING1 = {
    background: "linear-gradient(90deg, #f39c12, #e67e22)",
    color: "#fff",
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

    "@media (max-width: 480px)": {
      width: "90%",
      maxWidth: "none",
      padding: "20vh 20vh",
      borderRadius: "8px",
    },
  };
  static STYLE_WARNING3 = {
    background: "linear-gradient(90deg, #f39c12, #e67e22)",
    color: "#000000",
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

    "@media (max-width: 480px)": {
      width: "90%",
      maxWidth: "none",
      padding: "20vh 20vh",
      borderRadius: "8px",
    },
  };

  static STYLE_ERROR = {
    backgroundColor: "#DC2626", // Bold red
    color: "#FFFFFF",
    display: "flex",
    boxShadow: "0 6px 10px rgba(220, 38, 38, 0.2)",
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

    "@media (max-width: 480px)": {
      width: "90%",
      maxWidth: "none",
      padding: "20vh 20vh",
      borderRadius: "8px",
    },
  };

  static STYLE_ERROR1 = {
    background: "#E74C3C",
    color: "#fff",
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

    "@media (max-width: 480px)": {
      width: "90%",
      maxWidth: "none",
      padding: "20vh 20vh",
      borderRadius: "8px",
    },
  };

  static STYLE_ERROR2 = {
    background: "linear-gradient(90deg, #f44336, #e57373)",
    color: "#fff",
    display: "flex",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
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

    "@media (max-width: 480px)": {
      width: "90%",
      maxWidth: "none",
      padding: "20vh 20vh",
      borderRadius: "8px",
    },
  };

  static STYLE_INFO = {
    backgroundColor: "#2563EB", // Deep blue
    color: "#FFFFFF",
    border: "1px solid rgba(37, 99, 235, 0.3)",
    boxShadow: "0 6px 10px rgba(37, 99, 235, 0.2)",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backdropFilter: "blur(6px)",
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

    "@media (max-width: 480px)": {
      width: "90%",
      maxWidth: "none",
      padding: "20vh 20vh",
      borderRadius: "8px",
    },
  };

  static STYLE_GRADIENT = {
    background: "linear-gradient(90deg, #ff9a9e, #fad0c4)",
    color: "#000",
    display: "flex",
    boxShadow: "0 5px 15px rgba(255, 154, 158, 0.3)",
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

    "@media (max-width: 480px)": {
      width: "90%",
      maxWidth: "none",
      padding: "20vh 20vh",
      borderRadius: "8px",
    },
  };

  static STYLE_NEON = {
    background: "linear-gradient(90deg, #00d2ff, #3a7bd5)",
    color: "#fff",
    display: "flex",
    boxShadow: "0 0 15px #00d2ff, 0 0 30px #3a7bd5",
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

    "@media (max-width: 480px)": {
      width: "90%",
      maxWidth: "none",
      padding: "20vh 20vh",
      borderRadius: "8px",
    },
  };

  static STYLE_NEON1 = {
    backgroundColor: "#0ff",
    color: "#000",
    boxShadow: "0 0 10px #0ff, 0 0 40px #0ff",
    fontFamily: "monospace",
    borderRadius: "10px",
    display: "flex",
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

    "@media (max-width: 480px)": {
      width: "90%",
      maxWidth: "none",
      padding: "20vh 20vh",
      borderRadius: "8px",
    },
  };

  static STYLE_DARK_MODE = {
    background: "#1f2937",
    color: "#fff",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
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

    "@media (max-width: 480px)": {
      width: "90%",
      maxWidth: "none",
      padding: "20vh 20vh",
      borderRadius: "8px",
    },
  };
  static STYLE_LIGHT_MODE = {
    background: "#fff",
    color: "#000",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
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

    "@media (max-width: 480px)": {
      width: "90%",
      maxWidth: "none",
      padding: "20vh 20vh",
      borderRadius: "8px",
    },
  };

  static STYLE_SHADOW = {
    backgroundColor: "#000000",
    color: "#fff",
    display: "flex",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
    fontFamily: "Verdana, sans-serif",
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

    "@media (max-width: 480px)": {
      width: "90%",
      maxWidth: "none",
      padding: "20vh 20vh",
      borderRadius: "8px",
    },
  };

  static STYLE_RETRO = {
    backgroundColor: "#FCD34D",
    color: "#000",
    display: "flex",
    boxShadow: "0 6px 12px rgba(252, 211, 77, 0.2)",
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

    "@media (max-width: 480px)": {
      width: "90%",
      maxWidth: "none",
      padding: "20vh 20vh",
      borderRadius: "8px",
    },
  };

  static STYLE_METALLIC = {
    background: "linear-gradient(145deg, #d3d3d3, #a8a8a8)",
    color: "#222",
    display: "flex",
    boxShadow: "inset 3px 3px 6px #999, inset -3px -3px 6px #ddd",
    fontFamily: "Tahoma, sans-serif",
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

    "@media (max-width: 480px)": {
      width: "90%",
      maxWidth: "none",
      padding: "20vh 20vh",
      borderRadius: "8px",
    },
  };

  static STYLE_GLOW = {
    backgroundColor: "#5A67D8",
    color: "#fff",
    boxShadow: "0 0 15px rgba(90, 103, 216, 0.8)",
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

    "@media (max-width: 480px)": {
      width: "90%",
      maxWidth: "none",
      padding: "20vh 20vh",
      borderRadius: "8px",
    },
  };

  static STYLE_TRANSPARENT = {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    fontFamily: "system-ui, sans-serif",
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

    "@media (max-width: 480px)": {
      width: "90%",
      maxWidth: "none",
      padding: "20vh 20vh",
      borderRadius: "8px",
    },
  };

  /**
   * Creates an instance of Toast.
   * @param {HTMLElement} context - The context in which the toast will be displayed.
   * @param {string} text - The text to display in the toast.
   * @param {number} duration - The duration for which the toast will be displayed.
   */
  constructor(context, text, duration) {
    this.context = context || document.body;
    this.text = text;
    this.duration = duration || Toast.LENGTH_SHORT;
    this.callbacks = [];
    this.customStyle = Toast.STYLE_DEFAULT_1;
    this.position = Toast.POSITION_BOTTOM_CENTER;
    this.icon = null;
    this.iconSize = Toast.ICON_SIZE.MEDIUM;
    this.iconPosition = Toast.ICON_POSITION_START; // Default icon position
    this.iconShape = Toast.ICON_SHAPE_CIRCLE; // Default icon shape
    this.textDirection = "auto";
    this.enterAnimation = Toast.FADE;
    this.exitAnimation = Toast.FADE;
    this.dismissible = false;
    this.customKeyframes = null; // Store custom keyframes
    this.customAnimations = {}; // Store custom animations
  }

  /**
   * Static factory method to create a toast with text.
   * @param {HTMLElement} context - The context in which the toast will be displayed.
   * @param {string} text - The text to display in the toast.
   * @param {number} [duration=Toast.LENGTH_SHORT] - The duration for which the toast will be displayed.
   * @returns {Toast} - The created Toast instance.
   */
  static makeText(context, text, duration = Toast.LENGTH_SHORT) {
    return new Toast(context, text, duration);
  }

  /**
   * Sets the duration of the toast.
   * @param {number} duration - The duration for which the toast will be displayed.
   * @returns {Toast} - The current Toast instance.
   */
  setDuration(duration) {
    this.duration = duration;
    if (this.toastElement) {
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => {
        this.hide();
      }, this.duration);
    }
    return this;
  }

  /**
   * Sets the style of the toast.
   * @param {string|Object} style - The style to apply to the toast.
   * @returns {Toast} - The current Toast instance.
   */
  setStyle(style) {
    if (typeof style === "string") {
      switch (style.toLowerCase()) {
        case "default_1":
          this.customStyle = Toast.STYLE_DEFAULT_1;
          break;
        case "default_2":
          this.customStyle = Toast.STYLE_DEFAULT_2;
          break;
        case "success":
          this.customStyle = Toast.STYLE_SUCCESS;
          break;
        case "error":
          this.customStyle = Toast.STYLE_ERROR;
          break;
        case "warning":
          this.customStyle = Toast.STYLE_WARNING;
          break;
        case "info":
          this.customStyle = Toast.STYLE_INFO;
          break;
        case "gradient":
          this.customStyle = Toast.STYLE_GRADIENT;
          break;
        case "neon":
          this.customStyle = Toast.STYLE_NEON;
          break;
        case "shadow":
          this.customStyle = Toast.STYLE_SHADOW;
          break;
        case "retro":
          this.customStyle = Toast.STYLE_RETRO;
          break;
        case "metallic":
          this.customStyle = Toast.STYLE_METALLIC;
          break;
        case "glow":
          this.customStyle = Toast.STYLE_GLOW;
          break;
        case "transparent":
          this.customStyle = Toast.STYLE_TRANSPARENT;
          break;
        case "warning1":
          this.customStyle = Toast.STYLE_WARNING1;
          break;
        case "warning3":
          this.customStyle = Toast.STYLE_WARNING3;
          break;
        case "error1":
          this.customStyle = Toast.STYLE_ERROR1;
          break;
        case "error2":
          this.customStyle = Toast.STYLE_ERROR2;
          break;
        case "neon1":
          this.customStyle = Toast.STYLE_NEON1;
          break;
        case "dark_mode":
          this.customStyle = Toast.STYLE_DARK_MODE;
          break;
        case "light_mode":
          this.customStyle = Toast.STYLE_LIGHT_MODE;
          break;
        default:
          console.warn("Invalid style name. Using default style.");
          this.customStyle = Toast.STYLE_DEFAULT_1;
      }
    } else if (typeof style === "object") {
      // Merge custom style with default style
      this.customStyle = { ...Toast.STYLE_DEFAULT_1, ...style };

      // Inject custom keyframes if provided
      if (style.keyframes) {
        this.customKeyframes = style.keyframes;
      }
    }
    return this;
  }

  /**
   * Sets the position of the toast.
   * @param {string} position - The position to display the toast.
   * @returns {Toast} - The current Toast instance.
   */
  setPosition(position) {
    const validPositions = [
      Toast.POSITION_TOP_LEFT,
      Toast.POSITION_TOP_CENTER,
      Toast.POSITION_TOP_RIGHT,
      Toast.POSITION_BOTTOM_LEFT,
      Toast.POSITION_BOTTOM_CENTER,
      Toast.POSITION_BOTTOM_RIGHT,
    ];
    this.position = validPositions.includes(position)
      ? position
      : Toast.POSITION_BOTTOM_CENTER;
    return this;
  }

  /**
   * Sets the animation of the toast.
   * @param {string|Object} enterAnimation - The animation class or custom CSS to apply when the toast enters.
   * @param {string|Object} exitAnimation - The animation class or custom CSS to apply when the toast exits.
   * @returns {Toast} - The current Toast instance.
   */
  setAnimation(enterAnimation, exitAnimation) {
    if (typeof enterAnimation === "string") {
      this.enterAnimation = enterAnimation;
    } else if (typeof enterAnimation === "object" && enterAnimation.css) {
      // Inject custom CSS for enter animation
      const animationName = `custom-enter-animation-${Date.now()}`;
      this.enterAnimation = animationName;
      this.injectCustomAnimation(
        animationName,
        enterAnimation.css,
        enterAnimation.keyframes
      );
    }

    if (typeof exitAnimation === "string") {
      this.exitAnimation = exitAnimation;
    } else if (typeof exitAnimation === "object" && exitAnimation.css) {
      // Inject custom CSS for exit animation
      const animationName = `custom-exit-animation-${Date.now()}`;
      this.exitAnimation = animationName;
      this.injectCustomAnimation(
        animationName,
        exitAnimation.css,
        exitAnimation.keyframes
      );
    }

    return this;
  }

  /**
   * Injects custom animation CSS and keyframes into the document.
   * @param {string} animationName - The name of the custom animation.
   * @param {string} css - The CSS for the custom animation.
   * @param {string} keyframes - The keyframes for the custom animation.
   */
  injectCustomAnimation(animationName, css, keyframes) {
    const style = document.createElement("style");
    style.textContent = `
      .${animationName} {
        ${css}
      }
      ${keyframes || ""} // Inject custom keyframes if provided
    `;
    document.head.appendChild(style);
    this.customAnimations[animationName] = style;
  }

  /**
   * Sets the icon of the toast.
   * @param {string} iconPath - The path to the icon.
   * @param {Object|string} [size=null] - The size of the icon.
   * @param {string} [position=Toast.ICON_POSITION_START] - The position of the icon.
   * @returns {Toast} - The current Toast instance.
   */
  setIcon(iconPath, size = null, position = Toast.ICON_POSITION_START) {
    // Check if the iconPath is an SVG file or link
    if (typeof iconPath === "string" && iconPath.trim().startsWith("<svg")) {
      throw new Error(
        "Inline SVG code is not supported. Please provide an SVG file or link. Supported formats: .svg , .png, .jpg, .jpeg,.gif, .webm, .mp4."
      );
    }

    this.icon = iconPath;
    if (size) {
      if (typeof size === "object" && size.width && size.height) {
        this.iconSize = size;
      } else if (
        Toast.ICON_SIZE[size.toUpperCase()] ||
        Toast.ICON_SIZE[size.toLowerCase()]
      ) {
        this.iconSize =
          Toast.ICON_SIZE[size.toUpperCase()] ||
          Toast.ICON_SIZE[size.toLowerCase()];
      } else {
        console.warn("Invalid icon size. Library Using default size.");
      }
    }
    this.iconPosition = position;
    return this;
  }

  /**
   * Sets the icon shape of the toast.
   * @param {Object|string} shape - The shape of the icon.
   * @returns {Toast} - The current Toast instance.
   */
  setIconShape(shape = Toast.ICON_SHAPE_CIRCLE) {
    const validShapes = [
      Toast.ICON_SHAPE_CIRCLE,
      Toast.ICON_SHAPE_SQUARE,
      Toast.ICON_SHAPE_SQUIRCLE,
    ];
    this.iconShape = validShapes.includes(shape)
      ? shape
      : Toast.ICON_SHAPE_CIRCLE;
    return this;
  }

  /**
   * Makes the toast dismissible.
   * @param {boolean} [dismissible=true] - Whether the toast is dismissible.
   * @param {string} [closeButtonColor="#fff"] - The color of the close button.
   * @returns {Toast} - The current Toast instance.
   */
  setDismissible(dismissible = true, closeButtonColor = "#fff") {
    this.dismissible = dismissible;
    this.closeButtonColor = closeButtonColor;
    return this;
  }

  /**
   * Adds a callback to be executed when the toast is shown.
   * @param {Function} callback - The callback function.
   * @returns {Toast} - The current Toast instance.
   */
  addCallback(callback) {
    if (typeof callback === "function") {
      this.callbacks.push(callback);
    }
    return this;
  }

  /**
   * Helper method to create the icon element.
   * @returns {HTMLElement|null} - The icon element or null if no icon is set.
   */
  createIconElement() {
    if (!this.icon) return null;

    const iconContainer = document.createElement("div");
    Object.assign(iconContainer.style, {
      marginRight:
        this.iconPosition === Toast.ICON_POSITION_START ? "12px" : "0",
      marginLeft: this.iconPosition === Toast.ICON_POSITION_END ? "12px" : "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: "0",
      ...this.iconSize,
      ...this.iconShape, // Apply the selected icon shape style
    });

    if (this.icon.endsWith(".svg")) {
      // Handle SVG icons
      const img = document.createElement("img");
      Object.assign(img.style, {
        width: "100%",
        height: "100%",
        objectFit: "contain",
      });
      img.src = this.icon;
      img.alt = "Toast icon";
      iconContainer.appendChild(img);
    } else if (this.icon.endsWith(".gif")) {
      // Handle GIF icons
      const img = document.createElement("img");
      Object.assign(img.style, {
        width: "100%",
        height: "100%",
        objectFit: "contain",
      });
      img.src = this.icon;
      img.alt = "";
      iconContainer.appendChild(img);
    } else if (this.icon.endsWith(".webm") || this.icon.endsWith(".mp4")) {
      // Handle animated icons (video)
      const video = document.createElement("video");
      Object.assign(video.style, {
        width: "100%",
        height: "100%",
        objectFit: "contain",
      });
      video.src = this.icon;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playbackRate = 1.0;
      iconContainer.appendChild(video);
    } else {
      // Handle static icons (images)
      const img = document.createElement("img");
      Object.assign(img.style, {
        width: "100%",
        height: "100%",
        objectFit: "contain",
      });
      img.src = this.icon;
      img.alt = "";
      iconContainer.appendChild(img);
    }

    return iconContainer;
  }

  /**
   * Creates the close button element.
   * @returns {HTMLElement} - The close button element.
   */
  createCloseButton() {
    const closeButton = document.createElement("button");
    Object.assign(closeButton.style, {
      background: "none",
      border: "none",
      color: this.closeButtonColor,
      cursor: "pointer",
      padding: "0 0 0 12px",
      fontSize: "18px",
      opacity: "0.8",
      transition: "opacity 0.2s ease",
    });
    closeButton.innerHTML = "×";
    closeButton.onclick = () => this.hide();
    closeButton.onmouseover = () => (closeButton.style.opacity = "1");
    closeButton.onmouseout = () => (closeButton.style.opacity = "0.8");
    return closeButton;
  }

  /**
   * Applies the position styles to the toast element.
   * @param {HTMLElement} element - The toast element.
   */
  applyPositionStyle(element) {
    const positions = {
      [Toast.POSITION_TOP_LEFT]: { top: "20px", left: "20px" },
      [Toast.POSITION_TOP_CENTER]: {
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
      },
      [Toast.POSITION_TOP_RIGHT]: { top: "20px", right: "20px" },
      [Toast.POSITION_BOTTOM_LEFT]: { bottom: "20px", left: "20px" },
      [Toast.POSITION_BOTTOM_CENTER]: {
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
      },
      [Toast.POSITION_BOTTOM_RIGHT]: { bottom: "20px", right: "20px" },
    };

    Object.assign(
      element.style,
      positions[this.position] || positions[Toast.POSITION_BOTTOM_CENTER]
    );
  }

  /**
   * Shows the toast notification.
   */
  show() {
    if (this.toastElement) return;

    // Create toast element
    this.toastElement = document.createElement("div");
    this.toastElement.className = `toast-notification ${this.enterAnimation}`;

    // Create container for icon and text
    const contentContainer = document.createElement("div");
    Object.assign(contentContainer.style, {
      display: "flex",
      alignItems: "center",
      minHeight: "48px",
      padding: "8px 12px",
    });

    // Add icon if specified
    if (this.icon) {
      const iconElement = this.createIconElement();
      if (iconElement) {
        if (this.iconPosition === Toast.ICON_POSITION_START) {
          contentContainer.appendChild(iconElement);
        } else {
          contentContainer.insertBefore(
            iconElement,
            contentContainer.firstChild
          );
        }
      }
    }

    // Add text
    const textElement = document.createElement("span");
    textElement.innerText = this.text;
    Object.assign(textElement.style, {
      flex: "1",
      marginLeft:
        this.icon && this.iconPosition === Toast.ICON_POSITION_START
          ? "0"
          : "12px",
      marginRight:
        this.icon && this.iconPosition === Toast.ICON_POSITION_END
          ? "0"
          : "12px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    });
    contentContainer.appendChild(textElement);

    // Add close button if dismissible
    if (this.dismissible) {
      contentContainer.appendChild(this.createCloseButton());
    }

    this.toastElement.appendChild(contentContainer);

    // Apply styles
    Object.assign(this.toastElement.style, {
      position: "fixed",
      zIndex: 1000,
      pointerEvents: this.dismissible ? "auto" : "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.3s ease-in-out",
      opacity: 0,
      minWidth: "200px",
      maxWidth: "80vw",
    });

    Object.assign(this.toastElement.style, this.customStyle);
    this.applyPositionStyle(this.toastElement);

    // Add CSS animations and keyframes
    const style = document.createElement("style");
    style.textContent = `
          .fade {
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
      }
      .slide-in-right {
        animation: slideInRight 0.5s ease-in-out;
      }
      .slide-out-right {
        animation: slideOutRight 0.5s ease-in-out;
      }
      .slide-in-left {
        animation: slideInLeft 0.5s ease-in-out;
      }
      .slide-out-left {
        animation: slideOutLeft 0.5s ease-in-out;
      }
      .light-speed-in-right {
        animation: lightSpeedInRight 0.5s ease-in-out;
      }
      .light-speed-out-right {
        animation: lightSpeedOutRight 0.5s ease-in-out;
      }
      .light-speed-in-left {
        animation: lightSpeedInLeft 0.5s ease-in-out;
      }
      .light-speed-out-left {
        animation: lightSpeedOutLeft 0.5s ease-in-out;
      }
      .wave-in {
        animation: waveIn 0.5s ease-in-out;
      }
      .wave-out {
        animation: waveOut 0.5s ease-in-out;
      }
      .wobble-in {
        animation: wobbleIn 0.5s ease-in-out;
      }
      .wobble-out {
        animation: wobbleOut 0.5s ease-in-out;
      }
      .slide-in-top {
        animation: slideInTop 0.5s ease-in-out;
      }
      .slide-out-top {
        animation: slideOutTop 0.5s ease-in-out;
      }
      .slide-in-bottom {
        animation: slideInBottom 0.5s ease-in-out;
      }
      .slide-out-bottom {
        animation: slideOutBottom 0.5s ease-in-out;
      }
       .slide-in-top-center {
    animation: slideInTopCenter 0.5s ease-in-out;
  }
    .slide-out-top-center {
      animation: slideOutTopCenter 0.5s ease-in-out;
    }
    .slide-in-bottom-center {
      animation: slideInBottomCenter 0.5s ease-in-out;
    }
    .slide-out-bottom-center {
      animation: slideOutBottomCenter 0.5s ease-in-out;
    }
      @keyframes slideInRight {
        0% { transform: translateX(100%); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        0% { transform: translateX(0); opacity: 1; }
        100% { transform: translateX(100%); opacity: 0; }
      }
      @keyframes slideInLeft {
        0% { transform: translateX(-100%); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutLeft {
        0% { transform: translateX(0); opacity: 1; }
        100% { transform: translateX(-100%); opacity: 0; }
      }
      @keyframes lightSpeedInRight {
        0% { transform: translateX(100%) skewX(-30deg); opacity: 0; }
        60% { transform: translateX(-20%) skewX(30deg); opacity: 1; }
        80% { transform: translateX(0%) skewX(-15deg); opacity: 1; }
        100% { transform: translateX(0) skewX(0); opacity: 1; }
      }
      @keyframes lightSpeedOutRight {
        0% { transform: translateX(0) skewX(0); opacity: 1; }
        100% { transform: translateX(100%) skewX(-30deg); opacity: 0; }
      }
      @keyframes lightSpeedInLeft {
        0% { transform: translateX(-100%) skewX(30deg); opacity: 0; }
        60% { transform: translateX(20%) skewX(-30deg); opacity: 1; }
        80% { transform: translateX(0%) skewX(15deg); opacity: 1; }
        100% { transform: translateX(0) skewX(0); opacity: 1; }
      }
      @keyframes lightSpeedOutLeft {
        0% { transform: translateX(0) skewX(0); opacity: 1; }
        100% { transform: translateX(-100%) skewX(30deg); opacity: 0; }
      }
      @keyframes waveIn {
        0% { transform: translateY(0) rotate(0); opacity: 0; }
        50% { transform: translateY(-20px) rotate(10deg); opacity: 1; }
        100% { transform: translateY(0) rotate(0); opacity: 1; }
      }
      @keyframes waveOut {
        0% { transform: translateY(0) rotate(0); opacity: 1; }
        50% { transform: translateY(20px) rotate(-10deg); opacity: 0; }
        100% { transform: translateY(0) rotate(0); opacity: 0; }
      }
      @keyframes wobbleIn {
        0% { transform: translateX(0%) rotate(0); opacity: 0; }
        15% { transform: translateX(-25%) rotate(-5deg); opacity: 1; }
        30% { transform: translateX(20%) rotate(3deg); opacity: 1; }
        45% { transform: translateX(-15%) rotate(-3deg); opacity: 1; }
        60% { transform: translateX(10%) rotate(2deg); opacity: 1; }
        75% { transform: translateX(-5%) rotate(-1deg); opacity: 1; }
        100% { transform: translateX(0%) rotate(0); opacity: 1; }
      }
      @keyframes wobbleOut {
        0% { transform: translateX(0%) rotate(0); opacity: 1; }
        15% { transform: translateX(-25%) rotate(-5deg); opacity: 1; }
        30% { transform: translateX(20%) rotate(3deg); opacity: 1; }
        45% { transform: translateX(-15%) rotate(-3deg); opacity: 1; }
        60% { transform: translateX(10%) rotate(2deg); opacity: 1; }
        75% { transform: translateX(-5%) rotate(-1deg); opacity: 1; }
        100% { transform: translateX(0%) rotate(0); opacity: 0; }
      }
      @keyframes slideInTop {
        0% { transform: translateY(-100%); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      @keyframes slideOutTop {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-100%); opacity: 0; }
      }
      @keyframes slideInBottom {
        0% { transform: translateY(100%); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      @keyframes slideOutBottom {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(100%); opacity: 0; }
      }
      @keyframes slideInTopCenter {
    0% { transform: translate(-50%, -100%); opacity: 0; }
    100% { transform: translate(-50%, 0); opacity: 1; }
  }
    @keyframes slideOutTopCenter {
      0% { transform: translate(-50%, 0); opacity: 1; }
      100% { transform: translate(-50%, -100%); opacity: 0; }
    }
    @keyframes slideInBottomCenter {
      0% { transform: translate(-50%, 100%); opacity: 0; }
      100% { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes slideOutBottomCenter {
      0% { transform: translate(-50%, 0); opacity: 1; }
      100% { transform: translate(-50%, 100%); opacity: 0; }
    }
      ${this.customKeyframes || ""} // Inject custom keyframes if provided
    `;
    document.head.appendChild(style);

    // Append and animate
    this.context.appendChild(this.toastElement);

    requestAnimationFrame(() => {
      this.toastElement.style.opacity = 1;
      if (this.position.includes("center")) {
        this.toastElement.style.transform = "translateX(-50%) scale(1)";
      } else {
        this.toastElement.style.transform = "scale(1)";
      }
    });

    // Execute callbacks
    this.callbacks.forEach((callback) => callback());

    // Auto-hide if not dismissible or if duration <= 6.5 seconds
    if (
      !this.dismissible ||
      (this.dismissible && this.duration < Toast.LENGTH_LONG)
    ) {
      setTimeout(() => {
        this.hide();
      }, this.duration);
    }
  }

  /**
   * Hides the toast notification.
   */
  hide() {
    if (!this.toastElement) return;

    // Apply out animation
    this.toastElement.className = `toast-notification ${this.exitAnimation}`;

    this.toastElement.style.opacity = 0;
    if (this.position.includes("center")) {
      this.toastElement.style.transform = "translateX(-50%) scale(0.8)";
    } else {
      this.toastElement.style.transform = "scale(0.8)";
    }

    setTimeout(() => {
      if (this.toastElement && this.toastElement.parentNode) {
        this.toastElement.parentNode.removeChild(this.toastElement);
      }
      this.toastElement = null;
    }, 300);
  }
}

window.Toast = Toast;
