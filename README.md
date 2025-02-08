<div>
  <!-- Library Version -->

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


<div align="center">
</div>

## Introduction



- 🚀 **Customizable**: Easily style and animate toasts to match your app's theme.
- 🎨 **Predefined Styles**: Choose from success, error, warning, and info notifications.
- 🌍 **Accessible**: Fully customizable icons, animations, and positions.
- 🛠️ **Developer-Friendly**: Minimal setup and robust API.

### Quick Links


### **Demo Test:**


# Installation:

### Add Toast.js to Your Project

Include the library via CDN in your HTML file:

```html
```

Add the notification container to your body:

```html
<div id="toast-notification" class="toast-notification"></div>
```

## Simple HTML Example

```javascript
```


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

    <!-- Example Scripts -->
    <script>
      function showSuccessToast() {
        successToast.setStyle(Toast.STYLE_SUCCESS)
        successToast.setPosition(Toast.POSITION_TOP_CENTER)
        successToast.show();
      }

      function showErrorToast() {
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
const successToast = Toast.makeText(document.body, "✅ Success! Your action was completed successfully.", Toast.LENGTH_SHORT);
    successToast.setStyle("success") // Toast.STYLE_SUCCESS
```

### ❌ Error Toast

Display error notifications with a predefined error style.

```javascript
    errorToast.setStyle(Toast.STYLE_ERROR)
    errorToast.show();
```

### ℹ️ Information Toast

Use for informational messages, like user tips or updates.

```javascript
const infoToast = Toast.makeText(document.body, "ℹ️ Here's an important update for you!", Toast.LENGTH_SHORT);
    infoToast.show();
```

### 🎨 Custom Toast

Create a unique toast with custom styles, icons, and animations.

```javascript

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
  .show();
```

### **SetIcon Using URL:**

```javascript

toastIcon.setStyle(Toast.STYLE_DEFAULT_2); // you can use   toastIcon.setStyle("defult_1")
toastIcon.show();
```

### ⏳ Custom Duration Toast

Set a custom duration for your toast notification.

```javascript
customDurationToast1.setStyle("info");
customDurationToast1.setPosition(Toast.POSITION_BOTTOM_LEFT);
customDurationToast1.show();
```
### ⏲️ Another Custom Duration Example

```javascript
customDurationToast2.setDuration(15000); // 15 seconds
customDurationToast2.show();
```

### **Make toast dismissible:**

```javascript
    toast.show();



## **Actual Use Of The Library By Dev Soufiano :**

<img src="/assets/Real_Use_By_Dev.gif" alt="Actual Use By Dev" ></img>

### **Script:**

<div style="display: flex; justify-content: center;">
  <img src="assets/Script_From_Translate_js.png" alt="">
</div>

## Features


## Adding Toasts to Your Application

2. Add the `<div id="toast-notification"></div>` to your HTML body.
3. Create toast notifications using the API methods, e.g., `Toast.makeText`.

## Developer Notes





