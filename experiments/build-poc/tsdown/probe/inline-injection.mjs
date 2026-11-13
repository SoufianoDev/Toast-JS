// Experiment for question 2 of the tsdown proof of concept: the `?inline`
// route. The fixture's `injection.mjs` cannot be modified, so this probe entry
// imports the *same* fixture stylesheet as a JavaScript string and inserts it
// into a <style> element itself.
import css from '../../fixture/style.css?inline';

export function injectStyles(target) {
  const style = target.ownerDocument.createElement('style');
  style.textContent = css;
  target.ownerDocument.head.appendChild(style);
  return style;
}

export { css };
