// @ts-check
/**
 * Manager coordination for managed notifications.
 *
 * The manager decides which notifications are managed and when they become
 * visible. Order and visible-capacity accounting belong to the queue, so the
 * manager never keeps a second list of what is waiting or what is showing.
 *
 * The dependency runs one way: the manager knows the Toast class, and the Toast
 * class never imports the manager. A managed notification carries a reference to
 * whoever manages it, so hiding one notifies the manager without the
 * notification reaching into manager internals.
 */

import { Toast } from './Toast.mjs';
import { ToastQueue } from './ToastQueue.mjs';

/**
 * A toast instance managed by this manager.
 *
 * @typedef {import('./Toast.mjs').Toast} ToastInstance
 */

/** The vertical gap between two stacked notifications, in pixels. */
const STACK_OFFSET_STEP = 72;

export class ToastManager {
  constructor() {
    /**
     * The default visible limit for every position that has no limit of its
     * own. Read on every `show()` call, so a consumer may change it at runtime.
     *
     * @type {number}
     */
    this.maxVisible = 3;

    /** @type {ToastQueue} */
    this._queue = new ToastQueue();
  }

  /**
   * The visible limit that applies to a position.
   *
   * @param {string} position
   * @returns {number}
   */
  visibleLimit(position) {
    this._queue.defaultVisibleLimit = this.maxVisible;
    return this._queue.visibleLimit(position);
  }

  /**
   * Configures the visible limit of one position, independently of the others.
   *
   * @param {string} position
   * @param {number} limit
   * @returns {boolean} Whether the limit was applied.
   */
  setVisibleLimit(position, limit) {
    return this._queue.setVisibleLimit(position, limit);
  }

  /**
   * Manages a notification: it is displayed now, or queued behind the ones
   * already waiting for that position.
   *
   * @param {ToastInstance} toast
   * @returns {void}
   */
  show(toast) {
    if (!(toast instanceof Toast)) {
      console.error('[ToastManager] show(): argument must be a Toast instance.');
      return;
    }

    this._queue.defaultVisibleLimit = this.maxVisible;
    toast._manager = this;

    if (this._queue.enqueue(toast) === 'visible') this._display(toast);
  }

  /**
   * The notifications holding a visible slot in a position.
   *
   * @param {string} position
   * @returns {ToastInstance[]}
   */
  _visibleItems(position) {
    return /** @type {ToastInstance[]} */ (this._queue.visibleItems(position));
  }

  /**
   * @param {ToastInstance} toast
   * @returns {void}
   */
  _display(toast) {
    this._applyStackOffset(toast);
    toast.show();

    // A notification that could not be rendered must not keep its slot.
    if (!toast.toastElement && !toast._pendingShow) {
      toast._manager = null;
      const admitted = /** @type {ToastInstance | null} */ (this._queue.release(toast));
      if (admitted) this._display(admitted);
    }
  }

  /**
   * @param {ToastInstance} toast
   * @returns {void}
   */
  _applyStackOffset(toast) {
    const index = this._visibleItems(toast.position).indexOf(toast);
    toast._stackOffset = index * STACK_OFFSET_STEP;
  }

  /**
   * @param {string} position
   * @returns {void}
   */
  _applyStackOffsets(position) {
    for (const toast of this._visibleItems(position)) {
      this._applyStackOffset(toast);
    }
  }

  /**
   * Called by a managed notification once it has been removed. The slot it
   * held is released here, and the next notification waiting for that position
   * is admitted.
   *
   * @param {ToastInstance} hiddenToast
   * @returns {void}
   */
  _onHide(hiddenToast) {
    const admitted = /** @type {ToastInstance | null} */ (this._queue.release(hiddenToast));
    this._applyStackOffsets(hiddenToast.position);
    if (admitted) this._display(admitted);
  }
}

/**
 * The manager singleton exposed as `Toast.Manager`.
 *
 * @type {ToastManager}
 */
export const toastManager = new ToastManager();

Toast.Manager = toastManager;
