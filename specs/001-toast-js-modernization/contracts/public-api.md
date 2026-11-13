# Public API Contract

## 1. Compatibility Baseline

The mandatory API baseline is the public surface and supported observable behavior of `main` at `701371fd42423d034fc649aeac900f13b99b183d`, subject to a re-audit if `main` advances before implementation.

`src/Toast.js` on the modernization branch is byte-identical to that commit, so the inventory below is the audited `main` surface. The package `exports` map, `main`, `module`, `browser`, `unpkg`, `jsdelivr`, and `files` are also unchanged from the baseline. `types` is the one exception — see section 3.

This inventory was produced by enumerating the runtime object (`tests/contracts/public-api-inventory.test.mjs`), not by reading filenames. It covers every export, property, method, alias, default, event, callback, and package subpath.

## 2. Module and Export Shape

`src/Toast.js` is a UMD module whose factory returns the `Toast` constructor.

| Consumer | Shape |
|---|---|
| CommonJS | `module.exports = factory()` — the `Toast` constructor itself |
| AMD | `define(factory)` — the `Toast` constructor |
| Browser global | `globalThis.Toast = factory()` |
| ESM build (`dist/toast.esm.js`, baseline) | `export default Toast` — a default export only |

**On the legacy formats there are no named exports.** The entire public surface hangs off the single `Toast` constructor. That is the audited `main` behavior and it is preserved.

### 2.2 The primary ESM entry `src/index.mjs` — additive named exports

**Owner decision (2026-11-13):** the named exports are part of the **new public ESM entry API**. They are **additive**, and they are **not required** in the legacy CommonJS/UMD formats, which keep their current shape.

| Export | Value |
|---|---|
| `default` | the `Toast` constructor |
| `Toast` | the same constructor, also by name |
| 61 named exports | the runtime's own public static values |

The named exports are the runtime's own objects, not copies, so reference identity holds across the ESM and CommonJS entries. The set is asserted against the runtime's own static names by `tests/unit/esm-entry.test.mjs`, so a drift between the entry and the runtime fails the suite.

**The final packaged ESM artifact must expose the same named exports.** The build (T041) must emit this export shape, and the packaging verification (T044, T045) must confirm it from the packed tarball.

**Snapshot semantics.** The named exports are initialized once, when the entry module is evaluated. The runtime assigns every static during its own initialization, which completes before the entry body runs, so the bindings hold the runtime's final values: primitive exports are value snapshots, and object exports are references to the runtime's own objects. Twenty-six of the twenty-seven object statics are frozen; the only mutable one, `Manager`, is exported as the object itself, so its internal state stays visible through the binding.

## 3. Package Entry Points and Subpaths

| Subpath | Target | Notes |
|---|---|---|
| `.` | `import` → `dist/toast.esm.js`; `require` → `dist/toast.umd.js`; `browser` → `dist/toast.umd.js`; `default` → `dist/toast.umd.js` | The `browser` and `default` conditions are unreachable because `import` and `require` precede them. Recorded as an open defect; `exports` stays frozen until the packaging task. |
| `./src/Toast.js` | `./src/Toast.js` | Legacy deep import. Retained and repointed by the consumer-evidence decision (R-003, VAL-003); the target migration is implemented by the packaging task. |

Top-level metadata fields: `main`, `module`, `browser`, `unpkg`, `jsdelivr`, `types`, `files`.

| Field | Baseline `main` | On this branch | Note |
|---|---|---|---|
| `types` | `dist/types/index.d.ts` | `dist/types/Toast.d.ts` | The baseline value pointed at a file the build never produced, so no consumer could resolve it. The branch corrects the path to the declaration the build now emits. A correction, not a break — recorded here because it is the only baseline metadata field that changed. |

## 4. Static Members

All 61 own properties of the `Toast` constructor. Every one is part of the baseline.

### 4.1 Duration constants

| Name | Value |
|---|---|
| `LENGTH_SHORT` | `3000` |
| `LENGTH_LONG` | `6500` |

### 4.2 Position constants

`POSITION_TOP_LEFT`, `POSITION_TOP_CENTER`, `POSITION_TOP_RIGHT`, `POSITION_BOTTOM_LEFT`, `POSITION_BOTTOM_CENTER`, `POSITION_BOTTOM_RIGHT`

Values: `"top-left"`, `"top-center"`, `"top-right"`, `"bottom-left"`, `"bottom-center"`, `"bottom-right"`.

### 4.3 Icon position constants

| Name | Value |
|---|---|
| `ICON_POSITION_START` | `"start"` |
| `ICON_POSITION_END` | `"end"` |

### 4.4 Icon size constants

`ICON_SIZE` is a frozen object. Its four members — `SMALL` (`20px`/`20px`), `MEDIUM` (`24px`/`24px`), `LARGE` (`32px`/`32px`), `EXTRA_LARGE` (`48px`/`48px`) — are plain objects and are **not** themselves frozen. Only the outer container is.

### 4.5 Icon shape constants

| Name | Value |
|---|---|
| `ICON_SHAPE_CIRCLE` | `{ borderRadius: "50%", overflow: "hidden" }` |
| `ICON_SHAPE_SQUARE` | `{ borderRadius: "0%" }` |
| `ICON_SHAPE_SQUIRCLE` | `{ borderRadius: "20px", overflow: "hidden" }` |

All three are frozen.

### 4.6 Animation constants (21)

`FADE`, `SLIDE_IN_TOP`, `SLIDE_OUT_TOP`, `SLIDE_IN_BOTTOM`, `SLIDE_OUT_BOTTOM`, `SLIDE_IN_TOP_CENTER`, `SLIDE_OUT_TOP_CENTER`, `SLIDE_IN_BOTTOM_CENTER`, `SLIDE_OUT_BOTTOM_CENTER`, `SLIDE_IN_RIGHT`, `SLIDE_OUT_RIGHT`, `SLIDE_IN_LEFT`, `SLIDE_OUT_LEFT`, `LIGHT_SPEED_IN_RIGHT`, `LIGHT_SPEED_OUT_RIGHT`, `LIGHT_SPEED_IN_LEFT`, `LIGHT_SPEED_OUT_LEFT`, `WAVE_IN`, `WAVE_OUT`, `WOBBLE_IN`, `WOBBLE_OUT`

Every value is the kebab-case string of the same name with the `SLIDE_`/`LIGHT_SPEED_`/`WAVE_`/`WOBBLE_` prefix lowercased; `FADE` is `"fade"`.

### 4.7 Style presets (21 frozen objects)

`STYLE_DEFAULT_1`, `STYLE_DEFAULT_2`, `STYLE_SUCCESS`, `STYLE_WARNING`, `STYLE_WARNING1`, `STYLE_WARNING2`, `STYLE_WARNING3`, `STYLE_ERROR`, `STYLE_ERROR1`, `STYLE_ERROR2`, `STYLE_INFO`, `STYLE_GRADIENT`, `STYLE_NEON`, `STYLE_NEON1`, `STYLE_DARK_MODE`, `STYLE_LIGHT_MODE`, `STYLE_SHADOW`, `STYLE_RETRO`, `STYLE_METALLIC`, `STYLE_GLOW`, `STYLE_TRANSPARENT`

Every preset is frozen and spreads a shared frozen base (`display: flex`, `borderRadius: 10px`, `fontSize: clamp(12px, 3vw, 14px)`, `padding: 8px 16px`, `width: fit-content`, `maxWidth: 400px`, `height: auto`, `justifyContent: center`, `alignItems: center`, `textAlign: center`, `transition: all 0.3s ease` plus the `-webkit-`/`-moz-`/`-ms-` variants, `boxSizing: border-box`), then adds its own colour, shadow, and font overrides. Preset shape, values, and freezing are part of the baseline.

### 4.8 Text overflow constants

`TextOverflow` is a frozen object: `ELLIPSIS` (`"ellipsis"`), `WRAP` (`"wrap"`), `CLIP` (`"clip"`).

### 4.9 Factory and context helpers

| Name | Signature | Behaviour |
|---|---|---|
| `makeText` | `makeText(context, text, duration)` | Mirrors the Android `Toast.makeText()` API. Returns a new `Toast`. `duration` defaults to `LENGTH_SHORT` when `undefined`. |
| `getWebAppContext` | `getWebAppContext()` | Returns `document.body` in a browser. In SSR it returns a lazy context that resolves after hydration. |
| `getContextFor` | `getContextFor(container)` | Element (`nodeType === 1`) → that element. String → a lazy context that resolves via `document.querySelector(container)`. Anything else → `getWebAppContext()`. |

`getContextFor()` with a string does not query immediately. It returns a lazy context whose `resolve()` calls `document.querySelector(selector)`. A selector that is not valid CSS throws a `DOMException` at **resolve** time in a browser; in SSR, `resolve()` returns `null` instead of throwing.

### 4.10 Manager

`Manager` is the `ToastManager` singleton (see section 7). It is a static property of `Toast`.

## 5. Instance Surface

### 5.1 Constructor

`new Toast(context, text, duration)`

- Throws `TypeError` (`"[Toast-JS] constructor: 'text' must be a string."`) when `text` is not a string.
- `duration` defaults to `LENGTH_SHORT` unless it is a number greater than zero.
- The context is resolved immediately when the DOM is available, and lazily otherwise.

### 5.2 Public instance properties and their defaults

| Property | Default | Notes |
|---|---|---|
| `text` | — | The message. Required string. |
| `duration` | `LENGTH_SHORT` | Milliseconds. |
| `context` | resolved context or `null` | The mount point. |
| `customStyle` | `STYLE_DEFAULT_1` | The resolved style object. |
| `position` | `POSITION_BOTTOM_CENTER` | One of the six position constants. |
| `icon` | `null` | Icon URL. |
| `iconSize` | `ICON_SIZE.MEDIUM` | An `ICON_SIZE` member or a `{ width, height }` object. |
| `iconPosition` | `ICON_POSITION_START` | |
| `iconShape` | `ICON_SHAPE_CIRCLE` | |
| `enterAnimation` | `FADE` | Animation name or a generated custom-animation id. |
| `exitAnimation` | `FADE` | |
| `dismissible` | `false` | Shows the close button when true. |
| `closeButtonColor` | `"#fff"` | Close-button colour. |
| `textOverflow` | `"ellipsis"` | One of the `TextOverflow` values. |
| `customKeyframes` | `null` | Keyframe CSS captured from `setStyle({ keyframes })`. |
| `toastElement` | `null` | The rendered container element, `null` before `show()` and after removal. |

Underscore-prefixed instance fields are internal state and are not part of the public contract: `_originalContext`, `_events`, `_timeoutId`, `_rafId`, `_pendingShow`, `_isHiding`, `_injectedStyleIds`, `_stackOffset`, `_managedByManager`.

### 5.3 Public instance methods

Every setter returns `this` and is chainable.

| Method | Signature | Behaviour and invalid-input handling |
|---|---|---|
| `setDuration` | `setDuration(duration)` | Non-number or `<= 0` → `console.warn` and the call is ignored. Otherwise sets the duration and, when already visible, restarts the dismissal timer with the new value. |
| `setStyle` | `setStyle(style)` | String → looked up in the alias map (section 6), lowercased. Unknown alias → `console.warn` and falls back to `STYLE_DEFAULT_1`. Object → merged over the shared base style; a string `keyframes` property is captured as custom keyframes. Anything else → `console.warn`. |
| `setPosition` | `setPosition(position)` | Invalid position → `console.warn` and falls back to `POSITION_BOTTOM_CENTER`. |
| `setAnimation` | `setAnimation(enterAnimation, exitAnimation)` | `exitAnimation` is optional and only applied when it is not `undefined`. A string sets the animation name. An object `{ css, keyframes? }` is CSS-sanitized, injected as a `<style>` element, and the generated element id becomes the animation name. Anything else → `console.warn`. |
| `setIcon` | `setIcon(iconPath, size, position)` | `position` defaults to `ICON_POSITION_START`; an invalid position falls back to it. `iconPath` must be a non-empty string (otherwise `TypeError`); inline SVG markup throws `Error`; an unrecognised file extension logs `console.warn` but is accepted. `size` may be an `ICON_SIZE` key string (unknown key → `console.warn`) or a `{ width, height }` object. |
| `setIconShape` | `setIconShape(shape)` | Defaults to `ICON_SHAPE_CIRCLE`; an invalid shape falls back to `ICON_SHAPE_CIRCLE` **without a warning**. |
| `setDismissible` | `setDismissible(dismissible, closeButtonColor)` | Defaults to `true` and `"#fff"`. `dismissible` is coerced with `Boolean`. A non-string `closeButtonColor` falls back to `"#fff"`. |
| `setTextOverflow` | `setTextOverflow(mode)` | Defaults to `TextOverflow.ELLIPSIS`. Invalid mode → `console.warn` and falls back to `ELLIPSIS`. |
| `on` | `on(event, callback)` | Registers a callback for `show`, `hide`, or `dismiss` (section 8). A non-function callback → `console.warn`; an unknown event name → `console.warn`. Multiple callbacks per event are allowed. |
| `off` | `off(event, callback)` | Removes the given callback from the event's list. Unknown events and non-function callbacks are ignored silently — no validation, no warning. |
| `addCallback` | `addCallback(callback)` | Registers `callback` on the `show` event. A non-function argument is ignored silently. Equivalent to `on("show", callback)`. |
| `show` | `show()` | Non-browser environment → `console.warn` and returns `this` without rendering. Already visible or pending → returns `this`. A lazy context defers rendering until it resolves. No resolvable context → `console.warn`. Otherwise renders, queues the entry animation, emits `show`, and starts the dismissal timer. |
| `hide` | `hide()` | **Returns `undefined`, not `this`** — the only public method that does not chain. No element, or already hiding → returns `undefined` immediately. Otherwise cancels the animation frame and the dismissal timer, applies the exit animation, and after a 350 ms delay removes the element, cleans up injected style elements, emits `hide`, and notifies the manager. |

### 5.4 Internal prototype members (not public contract)

`_resolveContext`, `_resolveAnimation`, `_emit`, `_createIconElement`, `_createCloseButton`, `_getPositionStyles`, `_doShow`, `_cleanupInjectedStyles`

These are implementation details of the current runtime. They are recorded so that the migration can recognise them, and they must not be promoted to public API.

### 5.5 Disconnected modules (not public API)

`src/core/env.js`, `src/core/dom.js`, and `src/core/context.js` exist in the repository but are **not** exported by the package, **not** reachable from `src/Toast.js`, and carry their own copies of the environment, DOM, and context logic. They are outside the compatibility baseline and are candidates for reuse only after review.

## 6. Style Alias Map

`setStyle(string)` accepts exactly these 23 aliases, matched case-insensitively:

`default_1`, `defult_1`, `default_2`, `defult_2`, `success`, `error`, `error1`, `error2`, `warning`, `warning1`, `warning2`, `warning3`, `info`, `gradient`, `neon`, `neon1`, `shadow`, `retro`, `metallic`, `glow`, `transparent`, `dark_mode`, `light_mode`

`defult_1` and `defult_2` are historical misspellings. They are part of the accepted contract and must be preserved.

## 7. Manager and Queue

`Toast.Manager` is a singleton with a **single global queue** and a **single global limit**.

| Member | Kind | Value or behaviour |
|---|---|---|
| `maxVisible` | public, mutable | `3`. Read on every `show()` call, so a consumer may change it at runtime. |
| `show` | public method | `show(toast)`. A non-`Toast` argument → `console.error` and the call is ignored. At capacity the toast is queued; otherwise it is displayed. |
| `_active` | internal | The array of displayed toasts. |
| `_queue` | internal | The FIFO queue. |
| `_display` | internal | Adds the toast to `_active`, applies the stack offset, marks it managed, and shows it. |
| `_applyStackOffset` | internal | Sets a 72 px-per-toast offset. |
| `_onHide` | internal | Removes the hidden toast, re-stacks the remaining ones, and displays the next queued toast. |

**Gap against the approved decisions.** DEC-026 and DEC-027 require independent FIFO queues per display position with a per-position configurable limit defaulting to three. The current implementation has one queue and one limit for all positions. This is recorded as an implementation gap, not as contract to preserve.

## 8. Events and Callbacks

| Event | Emitted when | Order |
|---|---|---|
| `show` | The element has been attached to the context and the entry animation has been queued. | After the DOM insert, before the dismissal timer starts. |
| `dismiss` | The close button is clicked. | Immediately before `hide()` is called. |
| `hide` | The element has been removed from the DOM and injected styles cleaned up. | Last, after the 350 ms exit delay; the manager is notified after the event. |

Every callback receives the `Toast` instance as its single argument. Callbacks registered for the same event run in registration order. A callback that throws is caught, logged with `console.error`, and does not prevent the remaining callbacks from running.

`addCallback(callback)` is the legacy spelling of `on("show", callback)`.

## 9. Observable DOM Output

| Element | Contract |
|---|---|
| Container | `div` with class `toast-js-element`, the entry-animation class, and `is-dismissible` when dismissible. `role="alert"`, `aria-live="assertive"`, `aria-atomic="true"`. The announcement semantics conflict with the feature specification — see section 11, item 8. |
| Content wrapper | `div`, `display: flex`, `min-height: 48px`, `padding: 8px 12px`, `width: 100%`. |
| Text | `span` with `flex: 1`. `white-space`/`overflow`/`text-overflow` follow the `textOverflow` mode: `wrap` → normal/visible, `clip` → nowrap/hidden/clip, otherwise nowrap/hidden/ellipsis. |
| Icon | A wrapper `div` with the icon size and shape applied. `.webm` and `.mp4` icons render as `video` (`autoplay`, `loop`, `muted`, `playsInline`); all others render as `img`. Both carry an accessible name of `Toast notification icon`. |
| Close button | `button.toast-js-close-btn`, `aria-label="Close notification"`, text `x`, coloured by `closeButtonColor`. |

The global stylesheet is injected once at module load in a browser under the id `toast-js-global-styles-v2`; the injection is skipped in SSR.

Custom animation CSS and custom keyframes are sanitized before injection: `url(`, `expression(`, `@import`, and `javascript:` are blocked, logged with `console.error`, and the offending CSS is discarded.

## 10. Errors and Warnings

| Condition | Behaviour |
|---|---|
| Constructor with a non-string `text` | Throws `TypeError` |
| `setIcon()` with an empty or non-string path | Throws `TypeError` |
| `setIcon()` with inline `<svg` markup | Throws `Error` |
| `getContextFor()` with an invalid selector string | The lazy context's `resolve()` throws a `DOMException` when it reaches `document.querySelector`. In SSR, `resolve()` returns `null` instead of throwing. |
| Unknown style alias, invalid position, invalid overflow mode, invalid animation argument, invalid icon size, non-function `on()` callback, unknown `on()` event, invalid duration, `show()` outside a browser, `show()` without a context | `console.warn`, then the documented fallback or ignore |
| Unsafe CSS in a custom animation or keyframes | `console.error`, CSS discarded |
| `ToastManager.show()` with a non-`Toast` argument | `console.error`, call ignored |
| Callback throwing inside an event handler | Caught, logged with `console.error`, remaining callbacks still run |

## 11. Known Gaps Against Approved Decisions

These are current-implementation facts, not contract to preserve.

1. **Queue is global, not per position.** DEC-026 and DEC-027 require per-position FIFO queues with independently configurable limits. The current manager has one queue and one `maxVisible` of three.
2. **No per-notification timer state or pause reasons.** DEC-028 and DEC-029 require a dedicated timer controller with independent per-notification timers and composing pause reasons. The current runtime uses a single `setTimeout` per toast with no pause support.
3. **Exit is a fixed 350 ms delay.** DEC-030 requires animation/transition completion events as the primary signal with a bounded fallback. The current runtime always waits 350 ms.
4. **Renderer, manager, and lifecycle are entangled.** DEC-031 requires one DOM renderer with a clear contract. The current runtime spreads DOM work across the toast instance and the manager.
5. **`hide()` is not chainable** and `setIconShape()` fails silently, unlike the other setters.
6. **CSS is injected implicitly at module load**, which DEC-017 and DEC-018 change to explicit import by default with opt-in injection.
7. **`exports` has unreachable `browser` and `default` conditions** — see section 3.
8. **Announcement semantics conflict with the feature specification — OWNER REVIEW REQUIRED.** The legacy runtime renders every toast with `role="alert"` and `aria-live="assertive"`, which interrupts whatever the user is doing. The feature specification's US4 acceptance criterion requires routine messages to use **polite status semantics by default** (`role="status"`, `aria-live="polite"`), with assertive alerts reserved for urgent cases. The two cannot both hold for the same rendered node. This contract records the legacy behaviour as the compatibility baseline and does **not** change it. Whether the new implementation adopts the specification's default is a design decision, not a mechanical migration, because adopting it is an observable behaviour change against the strict baseline. Tracked in `research.md` §3 and raised for owner review.

## 12. Contract Rules

- Preserve method names, argument forms, documented defaults, constants, accepted style aliases, event behavior, and supported observable lifecycle behavior.
- Record callback/event names, callback order, return values, error behavior, and invalid-input behavior where observable and part of the current contract.
- Preserve the shape, values, freezing, and alias map of the 21 style preset objects.
- Do not promote an accidental defect to a permanent contract without checking source, README, changelog, and actual usage. Section 11 lists the defects deliberately excluded from the contract.
- New functionality must be additive or explicitly versioned; do not silently redefine existing options.
- New public method/option names are not selected by this document. They require an API design based on the current API style and testability.

## 13. New Capability Contracts

The new API must support the following behaviors without prescribing unapproved signature names:

- Create, show, dismiss, and update a notification by stable ID.
- Represent transient and persistent notification modes.
- Attach one or more accessible actions.
- Represent async pending/success/failure states on the same notification identity.
- Configure a per-position visible limit with a default of three.
- Explicitly opt into CSS injection; explicit stylesheet import remains default.

## 14. Contract Test Requirements

`tests/contracts/public-api.contract.test.mjs` must verify the same baseline assertions against both implementations through adapters. Tests must include exported values, instance methods, argument forms, defaults, style data/aliases, events, callbacks, and supported lifecycle outcomes.

`tests/contracts/public-api-inventory.test.mjs` keeps this document honest: it enumerates the runtime's static members, prototype methods, accepted style aliases, event names, and package subpaths, and fails when this document does not mention them.
