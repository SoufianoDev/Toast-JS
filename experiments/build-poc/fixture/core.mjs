export const DEFAULT_STYLE = {
  display: 'flex',
  borderRadius: '10px',
  padding: '8px 16px',
};

export function render(target, text) {
  const node = target.ownerDocument.createElement('div');
  node.className = 'toast';
  node.textContent = text;
  target.appendChild(node);
  return node;
}

// Exported but never used by the consumer entry, so a tree-shaking-capable
// build must drop it from the consumer bundle.
export const UNUSED_MARKER = 'toast-poc-unused-marker';
