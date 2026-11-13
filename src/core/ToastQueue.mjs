// @ts-check
/**
 * Per-position FIFO queues and visible-slot accounting.
 *
 * Each display position owns its own pending order and its own visible limit,
 * so one position can never consume another position's capacity. Within a
 * position, admission is strictly first in, first out — there is no priority
 * scheduler.
 *
 * A visible slot is held from the moment an item is admitted until the caller
 * releases it, which it does only after the item has been removed. An exit
 * that has merely started keeps its slot, and the next pending item is
 * admitted only once the previous one has actually gone.
 *
 * The queue knows nothing about timers, rendering, animation or the manager:
 * it holds order and capacity, and nothing else.
 */

const DEFAULT_VISIBLE_LIMIT = 3;

/**
 * The queue only needs to know which position an item belongs to.
 *
 * @typedef {object} QueueItem
 * @property {string} position
 */

/**
 * One position's queue state.
 *
 * @typedef {object} PositionQueue
 * @property {QueueItem[]} visible Items holding a visible slot.
 * @property {QueueItem[]} pending Items waiting for a slot, in admission order.
 * @property {number | null} limit The position's own limit, or `null` for the default.
 */

/**
 * Whether an item was admitted straight away or had to wait for a slot.
 *
 * @typedef {'visible' | 'queued'} AdmissionOutcome
 */

export class ToastQueue {
  /**
   * @param {number} [defaultVisibleLimit] The visible limit every position starts with.
   */
  constructor(defaultVisibleLimit = DEFAULT_VISIBLE_LIMIT) {
    /** @type {number} */
    this._defaultVisibleLimit = defaultVisibleLimit;
    /** @type {Map<string, PositionQueue>} */
    this._positions = new Map();
  }

  /**
   * The queue state of one position, created on first use.
   *
   * @param {string} position
   * @returns {PositionQueue}
   */
  _position(position) {
    let queue = this._positions.get(position);
    if (!queue) {
      queue = { visible: [], pending: [], limit: null };
      this._positions.set(position, queue);
    }
    return queue;
  }

  /**
   * The visible limit that applies to a position, including its own override.
   *
   * @param {string} position
   * @returns {number}
   */
  visibleLimit(position) {
    return this._position(position).limit ?? this._defaultVisibleLimit;
  }

  /**
   * Configures the visible limit of one position, independently of the others.
   *
   * @param {string} position
   * @param {number} limit A positive whole number.
   * @returns {boolean} Whether the limit was applied.
   */
  setVisibleLimit(position, limit) {
    if (typeof limit !== 'number' || !Number.isFinite(limit) || limit < 1) return false;
    this._position(position).limit = Math.floor(limit);
    return true;
  }

  /**
   * Admits an item, or queues it behind the items already waiting.
   *
   * @param {QueueItem} item
   * @returns {AdmissionOutcome}
   */
  enqueue(item) {
    const queue = this._position(item.position);
    if (queue.visible.length < this.visibleLimit(item.position)) {
      queue.visible.push(item);
      return 'visible';
    }
    queue.pending.push(item);
    return 'queued';
  }

  /**
   * Releases an item, freeing its visible slot and admitting the next item
   * waiting for that position.
   *
   * A pending item holds no slot, so releasing one only drops it. Releasing
   * an item the queue does not hold changes nothing.
   *
   * @param {QueueItem} item
   * @returns {QueueItem | null} The item admitted for that position, if any.
   */
  release(item) {
    const queue = this._position(item.position);

    const visibleIndex = queue.visible.indexOf(item);
    if (visibleIndex === -1) {
      const pendingIndex = queue.pending.indexOf(item);
      if (pendingIndex !== -1) queue.pending.splice(pendingIndex, 1);
      return null;
    }

    queue.visible.splice(visibleIndex, 1);
    const next = queue.pending.shift();
    if (!next) return null;

    queue.visible.push(next);
    return next;
  }

  /** @param {string} position @returns {number} */
  visibleCount(position) {
    return this._position(position).visible.length;
  }

  /** @param {string} position @returns {number} */
  pendingCount(position) {
    return this._position(position).pending.length;
  }

  /** @param {QueueItem} item @returns {boolean} */
  isVisible(item) {
    return this._position(item.position).visible.includes(item);
  }

  /**
   * The items holding a visible slot in a position, in admission order.
   *
   * @param {string} position
   * @returns {QueueItem[]}
   */
  visibleItems(position) {
    return [...this._position(position).visible];
  }

  /**
   * The items waiting for a slot in a position, in admission order.
   *
   * @param {string} position
   * @returns {QueueItem[]}
   */
  pendingItems(position) {
    return [...this._position(position).pending];
  }
}
