<div >
  <!-- Library Version -->
  <a href="https://soufianodev.github.io/Toast-JS/docs/docs_v1.0.0/docs.html" target="_blank">
    <img src="https://img.shields.io/badge/Version-1.0.0_Beta-007BFF?style=for-the-badge&logo=bookstack&logoColor=white" alt="Version Badge">
  </a>
  &nbsp;&nbsp;&nbsp;

  <!-- JavaScript -->
  <a href="https://www.javascript.com" target="_blank">
    <img src="https://img.shields.io/badge/-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  </a>
  &nbsp;&nbsp;&nbsp;



  <!-- Instagram -->
  <a href="https://www.instagram.com/soufiane_hanane1?igsh=N2d6ZTJ1ZGttZG41/" target="_blank">
    <img src="https://img.shields.io/badge/-soufiane__hanane1-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram">
  </a>
</div>


<h1 class="title"><strong>🍞 Toast JS Library  - By Soufiano Dev 🎩🪄</strong></h1>

<div align="center">
  <img src="https://soufianodev.github.io/Toast-JS/assets/Toast-JS_Logo.png" alt="Toast.js Logo" style="max-width: 300px; height: 300px; border-radius: 20px; object-fit: cover;">
</div>



## Introduction

**Toast.js** is an open-source JavaScript library created by **Soufiano Dev** 🎉. It provides an elegant, flexible, and developer-friendly way to display toast notifications in your web applications.

### Why Choose Toast.js?

- 🚀 **Customizable**: Easily style and animate toasts to match your app's theme.
- 🎨 **Predefined Styles**: Choose from success, error, warning, and info notifications.
- 🌍 **Accessible**: Fully customizable icons, animations, and positions.
- 🛠️ **Developer-Friendly**: Minimal setup and robust API.

### Quick Links

- <a href="https://soufianodev.github.io/Toast-JS/docs/docs_v1.0.0/docs.html" target="_blank">Full Documentation 📚</a>
- <a href="https://soufianodev.github.io/Toast-JS/" target="_blank">Live Demo 🔗</a>

### **Demo Test:**

![DemoTest](https://soufianodev.github.io/Toast-JS/assets/Demo_Test.gif)



# Installation:

### Add Toast.js to Your Project

Include the library via CDN in your HTML file:

```html
<script src="https://soufianodev.github.io/Toast-JS/libs/js/v1.0.0/Toast.js"></script>
```

Add the notification container to your body:

```html
<div id="toast-notification" class="toast-notification"></div>
```

## Simple HTML Example

```javascript
const toast = Toast.makeText(document.body, "Hello Toast", Toast.LENGTH_SHORT)
toast.show();
```

Here's a basic HTML file demonstrating Toast.js:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Toast.js Example</title>
  </head>
  <body>
    <!-- Notification Container -->
    <div id="toast-notification" class="toast-notification"></div>

    <!-- Buttons to Trigger Toasts -->
    <button onclick="showSuccessToast()">Show Success Toast</button>
    <button onclick="showErrorToast()">Show Error Toast</button>

    <!-- Include Toast.js Library -->
    <script src="https://soufianodev.github.io/Toast-JS/libs/js/v1.0.0/Toast.js"></script>

    <!-- Example Scripts -->
    <script>
      function showSuccessToast() {
        const successToast = Toast.makeText(document.body,"✅ Success! Operation completed.",Toast.LENGTH_SHORT)
        successToast.setStyle("success")
        successToast.setPosition(Toast.POSITION_TOP_CENTER)
        successToast.setAnimation(Toast.SLIDE_TOP)
        successToast.show();
      }

      function showErrorToast() {
        const errorToast = Toast.makeText(document.body,"❌ Error! Something went wrong.",Toast.LENGTH_LONG)
        errorToast.setStyle("error")
        errorToast.setPosition(Toast.POSITION_TOP_RIGHT)
        errorToast.setAnimation(Toast.SLIDE_RIGHT)
        errorToast.show();
      }
    </script>
  </body>
</html>
```

## Usage Examples

### ✅ Success Toast

Use this toast to show success messages (e.g., operation completed).

```javascript
const successToast = Toast.makeText(document.body,"✅ Success! Your action was completed successfully.",Toast.LENGTH_SHORT);
successToast.setStyle("success")
successToast.setPosition(Toast.POSITION_BOTTOM_CENTER)
successToast.show();
```

### ❌ Error Toast

Display error notifications with a predefined error style.

```javascript
const errorToast = Toast.makeText(document.body,"❌ Oops! Something went wrong. Please try again later.",Toast.LENGTH_LONG);
errorToast.setStyle("error")
errorToast.setPosition(Toast.POSITION_TOP_RIGHT)
errorToast.setAnimation(Toast.SLIDE_TOP)
errorToast.setDismissible(true)
errorToast.show();
```


### ℹ️ Information Toast

Use for informational messages, like user tips or updates.

```javascript
function showInfoToast() {const infoToast = Toast.makeText(document.body,"ℹ️ Here's an important update for you!",Toast.LENGTH_SHORT);
  infoToast.setStyle("info")
  infoToast.setPosition(Toast.POSITION_TOP_LEFT)
  infoToast.setAnimation(Toast.FADE)
  infoToast.show();
}
```

### 🎨 Custom Toast

Create a unique toast with custom styles, icons, and animations.

```javascript
const toast = Toast.makeText( document.body," This is a beautifully styled custom toast!", Toast.LENGTH_LONG);

let toastStyle = {
  background: "linear-gradient(90deg, #ff7eb3, #ff758c)",
  color: "#fff",
  borderRadius: "10px",
  padding: "15px",
  fontSize: "16px",
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
};

toast
  .setStyle(toastStyle)
  .setIcon("./assets/custom-icon.svg", Toast.ICON_SIZE.EXTRA_LARGE) // You Can Add An Image Using Link
  .setPosition(Toast.POSITION_BOTTOM_RIGHT)
  .setAnimation(Toast.SLIDE_BOTTOM)
  .show();
```

**SetIcon Using URL:**

```javascript
let iconUrl ="https://soufianodev.github.io/Toast-JS/assets/checkmark_150x150.webm";

const toastIcon = Toast.makeText(document.body, "Hello Toast Icon")
toastIcon.setStyle(Toast.STYLE_DEFAULT_2); // you can use   toastIcon.setStyle("defult_1")
toastIcon.setIcon(iconUrl); //Supported formats: .svg , .png, .jpg, .jpeg, .webm, .mp4.
toastIcon.show();
```

**Make toast dismissible:**

```javascript
const toast = Toast.makeText(document.body, "Hello Toast", Toast.LENGTH_SHORT)
toast.setDismissible(true)
toast.show();
```

## **Actual Use Of The Library By Dev Soufiano :**

  <img src="/assets/Real_Use_By_Dev.gif" alt="Actual Use By Dev" ></img>


### **Script:**

<div style="display: flex; justify-content: center;">
  <img src="assets/Script_From_Translate_js.png" alt="">
</div>




## Features

- ✅ **Predefined Styles**: Success, error, info, warning, and default.
- 🖌️ **Custom Decorations**: Set your own background, fonts, and borders.
- 🎥 **Dynamic Icons**: Add images, SVGs, or videos (webm&mp4) as toast icons.
- 🎭 **Animations**: Fade, slide, and custom keyframe animations.
- 🌐 **Positioning**: Display toasts at various screen locations.

## Adding Toasts to Your Application

1. Include the Toast.js CDN in your HTML file.
2. Add the `<div id="toast-notification"></div>` to your HTML body.
3. Create toast notifications using the API methods, e.g., `Toast.makeText`.

## Developer Notes

Toast.js is authored by **Soufiane Dev**. The library prioritizes ease of use while offering extensive customization options for developers. For full documentation, visit <a href="https://soufianodev.github.io/Toast-JS/docs/docs_v1.0.0/docs.html">Toast.js Docs 📚</a> .

---

Created with ❤️ by **Soufiane Dev** | Made in **Morocco** 🇲🇦


