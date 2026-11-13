import './style.css';

export function injectStyles(target) {
  const style = target.ownerDocument.createElement('style');
  style.textContent = '.toast { display: flex; border-radius: 10px; padding: 8px 16px; }';
  target.ownerDocument.head.appendChild(style);
  return style;
}
