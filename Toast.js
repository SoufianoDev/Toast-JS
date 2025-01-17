class Toast {
  // Toast duration constants
  static LENGTH_SHORT = 3000; // 3 seconds
  static LENGTH_LONG = 6500; // 6.5 seconds

  // Toast position constants
  static POSITION_TOP_LEFT = "top-left";
  static POSITION_TOP_CENTER = "top-center";
  static POSITION_TOP_RIGHT = "top-right";
  static POSITION_BOTTOM_LEFT = "bottom-left";
  static POSITION_BOTTOM_CENTER = "bottom-center";
  static POSITION_BOTTOM_RIGHT = "bottom-right";

  // Icon position constants
  static ICON_POSITION_START = "start";
  static ICON_POSITION_END = "end";

  // Predefined animation constants
  static FADE = "fade";
  static SLIDE_TOP = "slide-top";
  static SLIDE_BOTTOM = "slide-bottom";
  static SLIDE_LEFT = "slide-left";
  static SLIDE_RIGHT = "slide-right";

  // Icon size constants
  static ICON_SIZE = {
    SMALL: { width: "20px", height: "20px" },
    MEDIUM: { width: "24px", height: "24px" },
    LARGE: { width: "32px", height: "32px" },
    EXTRA_LARGE: { width: "48px", height: "48px" },
  };

  // Predefined style constants
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

  constructor(context) {
    this.context = context || document.body;
    this.toastElement = null;
    this.duration = Toast.LENGTH_SHORT;
    this.callbacks = [];
    this.customStyle = Toast.STYLE_DEFAULT_1;
    this.position = Toast.POSITION_BOTTOM_CENTER;
    this.icon = null;
    this.iconSize = Toast.ICON_SIZE.MEDIUM;
    this.iconPosition = Toast.ICON_POSITION_START; // Default icon position
    this.textDirection = "auto";
    this.animationClass = Toast.FADE;
    this.dismissible = false;
  }

  // Static factory method
  static makeText(context, text, duration = Toast.LENGTH_SHORT) {
    const toast = new Toast(context);
    toast.setText(text);
    toast.setDuration(duration);
    return toast;
  }

  // Method to set toast text
  setText(text) {
    this.text = text;
    return this;
  }

  // Method to set toast duration
  setDuration(duration) {
    this.duration =
      duration === Toast.LENGTH_LONG ? Toast.LENGTH_LONG : Toast.LENGTH_SHORT;
    return this;
  }

  // Method to set toast style
  setStyle(style) {
    if (typeof style === "string") {
      switch (style.toLowerCase()) {
        case "default_1":
          this.customStyle = Toast.STYLE_DEFAULT_1;
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
    }
    return this;
  }

  // Method to set toast position
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

  // Method to set toast animation
  setAnimation(animationClass) {
    this.animationClass = animationClass;
    return this;
  }

  // Method to set toast icon
  setIcon(iconPath, size = null, position = Toast.ICON_POSITION_START) {
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

  // Method to make toast dismissible
  setDismissible(dismissible = true) {
    this.dismissible = dismissible;
    return this;
  }

  // Method to add callback
  addCallback(callback) {
    if (typeof callback === "function") {
      this.callbacks.push(callback);
    }
    return this;
  }

  // Helper method to create icon element
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

    if (this.icon.endsWith(".webm") || this.icon.endsWith(".mp4")) {
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
      img.alt = "Toast icon";
      iconContainer.appendChild(img);
    }

    return iconContainer;
  }

  // Method to create close button
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

  // Method to apply position styles
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

  // Method to show toast
  show() {
    if (this.toastElement) return;

    // Create toast element
    this.toastElement = document.createElement("div");
    this.toastElement.className = `toast-notification ${this.animationClass}`;

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

    // Add CSS animations
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

    // Auto-hide if not dismissible
    if (!this.dismissible) {
      setTimeout(() => {
        this.hide();
      }, this.duration);
    }
  }

  // Method to hide toast
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

// class Toast {
//   // Toast duration constants
//   static LENGTH_SHORT = 3000; // 3 seconds
//   static LENGTH_LONG = 6500; // 6.5 seconds

//   // Toast position constants
//   static POSITION_TOP_LEFT = "top-left";
//   static POSITION_TOP_CENTER = "top-center";
//   static POSITION_TOP_RIGHT = "top-right";
//   static POSITION_BOTTOM_LEFT = "bottom-left";
//   static POSITION_BOTTOM_CENTER = "bottom-center";
//   static POSITION_BOTTOM_RIGHT = "bottom-right";

//   // Icon position constants
//   static ICON_POSITION_START = "start";
//   static ICON_POSITION_END = "end";

//   // Predefined animation constants
//   static FADE = { in: "fade-in", out: "fade-out" };
//   static SLIDE_TOP = { in: "slide-in-top", out: "slide-out-top" };
//   static SLIDE_BOTTOM = { in: "slide-in-bottom", out: "slide-out-bottom" };
//   static SLIDE_LEFT = { in: "slide-in-left", out: "slide-out-left" };
//   static SLIDE_RIGHT = { in: "slide-in-right", out: "slide-out-right" };
//   static ZOOM = { in: "zoom-in", out: "zoom-out" };
//   static BOUNCE = { in: "bounce-in", out: "bounce-out" };

//   // Icon size constants
//   static ICON_SIZE = {
//     SMALL: { width: "20px", height: "20px" },
//     MEDIUM: { width: "24px", height: "24px" },
//     LARGE: { width: "32px", height: "32px" },
//     EXTRA_LARGE: { width: "48px", height: "48px" },
//   };

//   // Predefined style constants
//   static STYLE_DEFAULT_1 = {
//     backgroundColor: "#323232",
//     color: "#fff",
//     padding: "10px 20px",
//     borderRadius: "5px",
//     boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
//     fontSize: "14px",
//     fontFamily: "system-ui, -apple-system, sans-serif",
//   };

//   static STYLE_DEFAULT_2 = {
//     backgroundColor: "rgba(0, 0, 0, 0.8)",
//     color: "#fff",
//     padding: "10px 20px",
//     borderRadius: "5px",
//     boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
//     fontSize: "14px",
//     fontFamily: "system-ui, -apple-system, sans-serif",
//   };

//   static STYLE_SUCCESS = {
//     backgroundColor: "#4CAF50",
//     color: "#fff",
//     padding: "10px 20px",
//     borderRadius: "5px",
//     boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
//     fontSize: "14px",
//     fontFamily: "system-ui, -apple-system, sans-serif",
//   };

//   static STYLE_ERROR = {
//     backgroundColor: "#F44336",
//     color: "#fff",
//     padding: "10px 20px",
//     borderRadius: "5px",
//     boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
//     fontSize: "14px",
//     fontFamily: "system-ui, -apple-system, sans-serif",
//   };

//   static STYLE_WARNING = {
//     backgroundColor: "#FF9800",
//     color: "#fff",
//     padding: "10px 20px",
//     borderRadius: "5px",
//     boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
//     fontSize: "14px",
//     fontFamily: "system-ui, -apple-system, sans-serif",
//   };

//   static STYLE_INFO = {
//     backgroundColor: "#2196F3",
//     color: "#fff",
//     padding: "10px 20px",
//     borderRadius: "5px",
//     boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
//     fontSize: "14px",
//     fontFamily: "system-ui, -apple-system, sans-serif",
//   };

//   constructor(context, text, duration = Toast.LENGTH_SHORT) {
//     this.context = context || document.body;
//     this.text = text; // Set the text directly in the constructor
//     this.duration = duration;
//     this.toastElement = null;
//     this.callbacks = [];
//     this.customStyle = Toast.STYLE_DEFAULT_1;
//     this.position = Toast.POSITION_BOTTOM_CENTER;
//     this.icon = null;
//     this.iconSize = Toast.ICON_SIZE.MEDIUM;
//     this.iconPosition = Toast.ICON_POSITION_START; // Default icon position
//     this.textDirection = "auto";
//     this.animation = Toast.FADE; // Default animation
//     this.dismissible = false;
//     this.animationKeyframes = null; // Store @keyframes for animations
//   }

//   // Static factory method
//   static makeText(context, text, duration = Toast.LENGTH_SHORT) {
//     return new Toast(context, text, duration);
//   }

//   // Method to set toast duration
//   setDuration(duration) {
//     if (typeof duration === "number" && duration > 0) {
//       // If duration is a positive number, use it as custom duration
//       this.duration = duration;
//     } else if (duration === Toast.LENGTH_LONG) {
//       // If duration is LENGTH_LONG, use the predefined long duration
//       this.duration = Toast.LENGTH_LONG;
//     } else {
//       // Default to LENGTH_SHORT if duration is invalid
//       this.duration = Toast.LENGTH_SHORT;
//     }
//     return this;
//   }

//   // Method to set toast style (supports full CSS control, including animations)
//   setStyle(style) {
//     if (typeof style === "string") {
//       // If style is a string, use predefined styles
//       switch (style.toLowerCase()) {
//         case "default_1":
//           this.customStyle = Toast.STYLE_DEFAULT_1;
//           break;
//         case "default_2":
//           this.customStyle = Toast.STYLE_DEFAULT_2;
//           break;
//         case "success":
//           this.customStyle = Toast.STYLE_SUCCESS;
//           break;
//         case "error":
//           this.customStyle = Toast.STYLE_ERROR;
//           break;
//         case "warning":
//           this.customStyle = Toast.STYLE_WARNING;
//           break;
//         case "info":
//           this.customStyle = Toast.STYLE_INFO;
//           break;
//         default:
//           console.warn("Invalid style name. Using default style.");
//           this.customStyle = Toast.STYLE_DEFAULT_1;
//       }
//     } else if (typeof style === "object") {
//       // If style is an object, merge it with the default style
//       this.customStyle = { ...Toast.STYLE_DEFAULT_1, ...style };

//       // Check if the style includes animation properties
//       if (style.animation) {
//         // Extract the animation name from the animation property
//         const animationName = style.animation.split(" ")[0];

//         // If keyframes are provided, inject them into the document
//         if (style.keyframes) {
//           this.animationKeyframes = style.keyframes;
//           this.injectKeyframes(animationName, style.keyframes);
//         }
//       }
//     }
//     return this;
//   }

//   // Method to inject @keyframes into the document
//   injectKeyframes(animationName, keyframes) {
//     const style = document.createElement("style");
//     style.textContent = `
//       @keyframes ${animationName} {
//         ${keyframes}
//       }
//     `;
//     document.head.appendChild(style);
//   }

//   // Method to set toast position
//   setPosition(position) {
//     const validPositions = [
//       Toast.POSITION_TOP_LEFT,
//       Toast.POSITION_TOP_CENTER,
//       Toast.POSITION_TOP_RIGHT,
//       Toast.POSITION_BOTTOM_LEFT,
//       Toast.POSITION_BOTTOM_CENTER,
//       Toast.POSITION_BOTTOM_RIGHT,
//     ];
//     this.position = validPositions.includes(position)
//       ? position
//       : Toast.POSITION_BOTTOM_CENTER;
//     return this;
//   }

//   // Method to set toast animation
//   setAnimation(animation) {
//     if (typeof animation === "string") {
//       // If animation is a string, use predefined animations
//       switch (animation.toLowerCase()) {
//         case "fade":
//           this.animation = Toast.FADE;
//           break;
//         case "slide-top":
//           this.animation = Toast.SLIDE_TOP;
//           break;
//         case "slide-bottom":
//           this.animation = Toast.SLIDE_BOTTOM;
//           break;
//         case "slide-left":
//           this.animation = Toast.SLIDE_LEFT;
//           break;
//         case "slide-right":
//           this.animation = Toast.SLIDE_RIGHT;
//           break;
//         case "zoom":
//           this.animation = Toast.ZOOM;
//           break;
//         case "bounce":
//           this.animation = Toast.BOUNCE;
//           break;
//         default:
//           console.warn("Invalid animation name. Using default animation.");
//           this.animation = Toast.FADE;
//       }
//     } else if (typeof animation === "object" && animation.in && animation.out) {
//       // If animation is an object with in and out properties, use it as custom animation
//       this.animation = animation;
//     } else {
//       console.warn("Invalid animation format. Using default animation.");
//       this.animation = Toast.FADE;
//     }
//     return this;
//   }

//   // Method to set toast icon
//   setIcon(iconPath, size = null, position = Toast.ICON_POSITION_START) {
//     // Check if the iconPath is an SVG file or link
//     if (typeof iconPath === "string" && iconPath.trim().startsWith("<svg")) {
//       throw new Error(
//         "Inline SVG code is not supported. Please provide an SVG file or link. Supported formats: .svg, .png, .jpg, .jpeg, .webm, .mp4."
//       );
//     }

//     this.icon = iconPath;
//     if (size) {
//       if (typeof size === "object" && size.width && size.height) {
//         this.iconSize = size;
//       } else if (Toast.ICON_SIZE[size]) {
//         this.iconSize = Toast.ICON_SIZE[size];
//       } else {
//         console.warn("Invalid icon size. Using default size.");
//       }
//     }
//     this.iconPosition = position;
//     return this;
//   }

//   // Method to make toast dismissible
//   setDismissible(dismissible = true) {
//     this.dismissible = dismissible;
//     return this;
//   }

//   // Method to add callback
//   addCallback(callback) {
//     if (typeof callback === "function") {
//       this.callbacks.push(callback);
//     }
//     return this;
//   }

//   // Helper method to create icon element
//   createIconElement() {
//     if (!this.icon) return null;

//     const iconContainer = document.createElement("div");
//     Object.assign(iconContainer.style, {
//       marginRight:
//         this.iconPosition === Toast.ICON_POSITION_START ? "12px" : "0",
//       marginLeft: this.iconPosition === Toast.ICON_POSITION_END ? "12px" : "0",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       flexShrink: "0",
//       ...this.iconSize,
//     });

//     if (this.icon.endsWith(".svg")) {
//       // Handle SVG icons
//       const img = document.createElement("img");
//       Object.assign(img.style, {
//         width: "100%",
//         height: "100%",
//         objectFit: "contain",
//       });
//       img.src = this.icon;
//       img.alt = "Toast icon";
//       iconContainer.appendChild(img);
//     } else if (this.icon.endsWith(".webm") || this.icon.endsWith(".mp4")) {
//       // Handle animated icons (video)
//       const video = document.createElement("video");
//       Object.assign(video.style, {
//         width: "100%",
//         height: "100%",
//         objectFit: "contain",
//       });
//       video.src = this.icon;
//       video.autoplay = true;
//       video.loop = true;
//       video.muted = true;
//       video.playbackRate = 1.0;
//       iconContainer.appendChild(video);
//     } else {
//       // Handle static icons (images)
//       const img = document.createElement("img");
//       Object.assign(img.style, {
//         width: "100%",
//         height: "100%",
//         objectFit: "contain",
//       });
//       img.src = this.icon;
//       img.alt = "Toast icon";
//       iconContainer.appendChild(img);
//     }

//     return iconContainer;
//   }

//   // Method to create close button
//   createCloseButton() {
//     const closeButton = document.createElement("button");
//     Object.assign(closeButton.style, {
//       background: "none",
//       border: "none",
//       color: "inherit",
//       cursor: "pointer",
//       padding: "0 0 0 12px",
//       fontSize: "18px",
//       opacity: "0.8",
//       transition: "opacity 0.2s ease",
//     });
//     closeButton.innerHTML = "×";
//     closeButton.onclick = () => this.hide();
//     closeButton.onmouseover = () => (closeButton.style.opacity = "1");
//     closeButton.onmouseout = () => (closeButton.style.opacity = "0.8");
//     return closeButton;
//   }

//   // Method to apply position styles
//   applyPositionStyle(element) {
//     const positions = {
//       [Toast.POSITION_TOP_LEFT]: { top: "20px", left: "20px" },
//       [Toast.POSITION_TOP_CENTER]: {
//         top: "20px",
//         left: "50%",
//         transform: "translateX(-50%)",
//       },
//       [Toast.POSITION_TOP_RIGHT]: { top: "20px", right: "20px" },
//       [Toast.POSITION_BOTTOM_LEFT]: { bottom: "20px", left: "20px" },
//       [Toast.POSITION_BOTTOM_CENTER]: {
//         bottom: "20px",
//         left: "50%",
//         transform: "translateX(-50%)",
//       },
//       [Toast.POSITION_BOTTOM_RIGHT]: { bottom: "20px", right: "20px" },
//     };

//     Object.assign(
//       element.style,
//       positions[this.position] || positions[Toast.POSITION_BOTTOM_CENTER]
//     );
//   }

//   // Method to show toast
//   show() {
//     if (this.toastElement) return;

//     // Create toast element
//     this.toastElement = document.createElement("div");
//     this.toastElement.className = `toast-notification ${this.animation.in}`;

//     // Create container for icon and text
//     const contentContainer = document.createElement("div");
//     Object.assign(contentContainer.style, {
//       display: "flex",
//       alignItems: "center",
//       minHeight: "48px",
//       padding: "8px 12px",
//     });

//     // Add icon if specified
//     if (this.icon) {
//       const iconElement = this.createIconElement();
//       if (iconElement) {
//         if (this.iconPosition === Toast.ICON_POSITION_START) {
//           contentContainer.appendChild(iconElement);
//         } else {
//           contentContainer.insertBefore(
//             iconElement,
//             contentContainer.firstChild
//           );
//         }
//       }
//     }

//     // Add text
//     const textElement = document.createElement("span");
//     textElement.innerText = this.text;
//     Object.assign(textElement.style, {
//       flex: "1",
//       marginLeft:
//         this.icon && this.iconPosition === Toast.ICON_POSITION_START
//           ? "0"
//           : "12px",
//       marginRight:
//         this.icon && this.iconPosition === Toast.ICON_POSITION_END
//           ? "0"
//           : "12px",
//       whiteSpace: "nowrap",
//       overflow: "hidden",
//       textOverflow: "ellipsis",
//     });
//     contentContainer.appendChild(textElement);

//     // Add close button if dismissible
//     if (this.dismissible) {
//       contentContainer.appendChild(this.createCloseButton());
//     }

//     this.toastElement.appendChild(contentContainer);

//     // Apply styles
//     Object.assign(this.toastElement.style, {
//       position: "fixed",
//       zIndex: 1000,
//       pointerEvents: this.dismissible ? "auto" : "none",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       transition: "all 0.3s ease-in-out",
//       opacity: 0,
//       minWidth: "200px",
//       maxWidth: "80vw",
//     });

//     // Apply custom styles (full CSS control)
//     Object.assign(this.toastElement.style, this.customStyle);

//     // Apply position styles
//     this.applyPositionStyle(this.toastElement);

//     // Append and animate
//     this.context.appendChild(this.toastElement);

//     requestAnimationFrame(() => {
//       this.toastElement.style.opacity = 1;
//       this.toastElement.classList.add(this.animation.in);
//     });

//     // Execute callbacks
//     this.callbacks.forEach((callback) => callback());

//     // Auto-hide if not dismissible
//     if (!this.dismissible) {
//       setTimeout(() => {
//         this.hide();
//       }, this.duration);
//     }
//   }

//   // Method to hide toast
//   hide() {
//     if (!this.toastElement) return;

//     // Apply out animation
//     this.toastElement.classList.remove(this.animation.in);
//     this.toastElement.classList.add(this.animation.out);

//     setTimeout(() => {
//       if (this.toastElement && this.toastElement.parentNode) {
//         this.toastElement.parentNode.removeChild(this.toastElement);
//       }
//       this.toastElement = null;
//     }, 300); // Match the duration of the out animation
//   }
// }

// // Attach Toast to the window object
// window.Toast = Toast;
