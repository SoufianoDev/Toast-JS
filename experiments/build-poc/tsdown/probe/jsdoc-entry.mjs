// Experiment for question 3 of the tsdown proof of concept: can a declaration
// file be generated from JSDoc annotations in plain JavaScript?
/**
 * Create a toast node inside `target`.
 *
 * @param {HTMLElement} target
 * @param {string} text
 * @returns {HTMLElement}
 */
export function render(target, text) {
  const node = target.ownerDocument.createElement('div');
  node.className = 'toast';
  node.textContent = text;
  target.appendChild(node);
  return node;
}

/** Default inline styles applied to a toast node. */
export const DEFAULT_STYLE = {
  display: 'flex',
  borderRadius: '10px',
  padding: '8px 16px',
};
