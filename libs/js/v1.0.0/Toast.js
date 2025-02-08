/**
 * @file Toast.js
 * @fileoverview Toast notification library for creating customizable, animated toast messages
 * @version 1.0.0
 * @license MIT
 * @copyright 2025 Soufiano Dev
 *
 * @class Toast
 * @classdesc Creates toast notifications with customizable styles, animations, icons, and behaviors.
 *
 * @author Soufiano Hanane
 */



/**
 * Toast class to create and display toast notifications.
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
  static SLIDE_TOP = "slide-top";
  static SLIDE_BOTTOM = "slide-bottom";
  static SLIDE_LEFT = "slide-left";
  static SLIDE_RIGHT = "slide-right";

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
   * Predefined style constants.
   * @type {Object}
   */
  static STYLE_DEFAULT_1 = {
    backgroundColor: "#323232",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
    fontSize: "14px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  };

  static STYLE_DEFAULT_2 = {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
    fontSize: "14px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  };

  static STYLE_SUCCESS = {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
    fontSize: "14px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  };

  static STYLE_ERROR = {
    backgroundColor: "#F44336",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
    fontSize: "14px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  };

  static STYLE_WARNING = {
    backgroundColor: "#FF9800",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
    fontSize: "14px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  };

  static STYLE_INFO = {
    backgroundColor: "#2196F3",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
    fontSize: "14px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  };

  /**
   * Creates an instance of Toast.
   * @param {HTMLElement} context - The context in which the toast will be displayed.      
   * @param {string} text - The text to display in the toast.
   * @param {number} duration - The duration for which the toast will be displayed.
   */
  constructor(context) {
    this.context = context || document.body;
    this.toastElement = null;
    this.duration = Toast.LENGTH_SHORT;
    this.callbacks = [];
    this.customStyle = Toast.STYLE_DEFAULT_1;
    this.position = Toast.POSITION_BOTTOM_CENTER;
    this.icon = null;
    this.iconSize = Toast.ICON_SIZE.MEDIUM;
    this.iconPosition = Toast.ICON_POSITION_START;
    this.textDirection = "auto";
    this.animationClass = Toast.FADE;
    this.dismissible = false;
    this.customKeyframes = null;
  }

  /**
   * Static factory method to create a toast with text.
   * @param {HTMLElement} context - The context in which the toast will be displayed.
   * @param {string} text - The text to display in the toast.
   * @param {number} [duration=Toast.LENGTH_SHORT] - The duration of the toast.
   * @returns {Toast} The created toast instance.
   */
  static makeText(context, text, duration = Toast.LENGTH_SHORT) {
    const toast = new Toast(context);
    toast.setText(text);
    toast.setDuration(duration);
    return toast;
  }

  /**
   * Sets the text of the toast.
   * @param {string} text - The text to display in the toast.
   * @returns {Toast} The current toast instance.
   */
  setText(text) {
    this.text = text;
    return this;
  }

  /**
   * Sets the duration of the toast.
   * @param {number} duration - The duration of the toast.
   * @returns {Toast} The current toast instance.
   */
  setDuration(duration) {
    this.duration =
      duration === Toast.LENGTH_LONG ? Toast.LENGTH_LONG : Toast.LENGTH_SHORT;
    return this;
  }

  /**
   * Sets the style of the toast.
   * @param {string|Object} style - The style to apply to the toast.
   * @returns {Toast} The current toast instance.
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
        default:
          console.warn("Invalid style name. Using default style.");
          this.customStyle = Toast.STYLE_DEFAULT_1;
      }
    } else if (typeof style === "object") {
      this.customStyle = { ...Toast.STYLE_DEFAULT_1, ...style };
      if (style.keyframes) {
        this.customKeyframes = style.keyframes;
      }
    }
    return this;
  }

  /**
   * Sets the position of the toast.
   * @param {string} position - The position of the toast.
   * @returns {Toast} The current toast instance.
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
   * @param {string} animationClass - The animation class to apply to the toast.
   * @param {string} [keyframes=null] - Custom keyframes for the animation.
   * @returns {Toast} The current toast instance.
   */
  setAnimation(animationClass, keyframes = null) {
    this.animationClass = animationClass;
    if (keyframes) {
      this.customKeyframes = keyframes;
    }
    return this;
  }

  /**
   * Sets the icon of the toast.
   * @param {string} iconPath - The path to the icon.
   * @param {Object|string} [size=null] - The size of the icon.
   * @param {string} [position=Toast.ICON_POSITION_START] - The position of the icon.
   * @returns {Toast} The current toast instance.
   */
  setIcon(iconPath, size = null, position = Toast.ICON_POSITION_START) {
    if (typeof iconPath === "string" && iconPath.trim().startsWith("<svg")) {
      throw new Error(
        "Inline SVG code is not supported. Please provide an SVG file or link. Supported formats: .svg, .png, .jpg, .jpeg, .webm, .mp4."
      );
    }

    this.icon = iconPath;
    if (size) {
      if (typeof size === "object" && size.width && size.height) {
        this.iconSize = size;
      } else if (Toast.ICON_SIZE[size]) {
        this.iconSize = Toast.ICON_SIZE[size];
      } else {
        console.warn("Invalid icon size. Using default size.");
      }
    }
    this.iconPosition = position;
    return this;
  }

  /**
   * Makes the toast dismissible.
   * @param {boolean} [dismissible=true] - Whether the toast is dismissible.
   * @returns {Toast} The current toast instance.
   */
  setDismissible(dismissible = true) {
    this.dismissible = dismissible;
    return this;
  }

  /**
   * Adds a callback to be executed when the toast is shown.
   * @param {Function} callback - The callback function.
   * @returns {Toast} The current toast instance.
   */
  addCallback(callback) {
    if (typeof callback === "function") {
      this.callbacks.push(callback);
    }
    return this;
  }

  /**
   * Creates an icon element for the toast.
   * @returns {HTMLElement|null} The icon element.
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
    });

    if (this.icon.endsWith(".svg")) {
      const img = document.createElement("img");
      Object.assign(img.style, {
        width: "100%",
        height: "100%",
        objectFit: "contain",
      });
      img.src = this.icon;
      img.alt = "Toast icon";
      iconContainer.appendChild(img);
    } else if (this.icon.endsWith(".webm") || this.icon.endsWith(".mp4")) {
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
   * Creates a close button for the toast.
   * @returns {HTMLElement} The close button element.
   */
  createCloseButton() {
    const closeButton = document.createElement("button");
    Object.assign(closeButton.style, {
      background: "none",
      border: "none",
      color: "inherit",
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
   * Applies position styles to the toast element.
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

    this.toastElement = document.createElement("div");
    this.toastElement.className = `toast-notification ${this.animationClass}`;

    const contentContainer = document.createElement("div");
    Object.assign(contentContainer.style, {
      display: "flex",
      alignItems: "center",
      minHeight: "48px",
      padding: "8px 12px",
    });

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

    if (this.dismissible) {
      contentContainer.appendChild(this.createCloseButton());
    }

    this.toastElement.appendChild(contentContainer);

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

    const style = document.createElement("style");
    style.textContent = `
      .fade {
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
      }
      .slide-top {
        transform: translateY(-100%);
        transition: transform 0.3s ease-in-out;
      }
      .slide-bottom {
        transform: translateY(100%);
        transition: transform 0.3s ease-in-out;
      }
      .slide-left {
        transform: translateX(-100%);
        transition: transform 0.3s ease-in-out;
      }
      .slide-right {
        transform: translateX(100%);
        transition: transform 0.3s ease-in-out;
      }
      ${this.customKeyframes || ""}
    `;
    document.head.appendChild(style);

    this.context.appendChild(this.toastElement);

    requestAnimationFrame(() => {
      this.toastElement.style.opacity = 1;
      if (this.position.includes("center")) {
        this.toastElement.style.transform = "translateX(-50%) scale(1)";
      } else {
        this.toastElement.style.transform = "scale(1)";
      }
    });

    this.callbacks.forEach((callback) => callback());

    if (!this.dismissible) {
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