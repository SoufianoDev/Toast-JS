# Runtime Lifecycle Contract

## 1. Ownership

- `Toast` owns the public instance API and instance configuration/state.
- `ToastManager` coordinates managed notifications and communicates through a defined lifecycle contract; `Toast` must not call manager internals directly.
- Each position has an independent FIFO queue.
- Each transient notification has an independent timer state.
- `DOMRenderer` owns DOM creation/update/attachment/removal and renderer-related accessibility attributes.
- Animation completion is coordinated through browser events and a bounded fallback.

The actual number of classes/modules is decided by responsibility and testability, not by this diagram.

## 2. Queue Contract

- Default maximum visible notifications: 3 per position.
- Consumer can configure a different limit independently for each position.
- Pending items are FIFO.
- Queue wait does not consume display duration.
- No priority scheduler in the initial release.
- A visible slot is released after DOM removal completes, including the bounded fallback path.

## 3. Timer Contract

- Start after the notification becomes visible, not when it is enqueued.
- Pause reasons include hover, keyboard focus, and action execution.
- Pause reasons compose; clearing one reason cannot resume while another remains active.
- On action success or failure, resume the remaining duration when no other pause reason remains.
- Persistent notifications have no auto-dismiss timer.
- Permanent removal clears timer handles/resources.

## 4. Animation Contract

- `animationend` / `transitionend` are the primary completion signals where applicable.
- A bounded fallback prevents a lifecycle wait from hanging.
- Canceled transitions/animations and reduced-motion paths must complete predictably.
- Renderer removal and queue-capacity release occur in a deterministic order.

## 5. Failure and Cleanup

A failed render must not leave an orphaned manager registry entry or reserved queue slot. Listener, timer, animation-wait, DOM, and stylesheet resources must be released exactly once on permanent removal. Error paths must be tested as well as normal paths.
