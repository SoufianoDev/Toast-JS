function render(target, text) {
  const node = target.ownerDocument.createElement('div');
  node.className = 'toast';
  node.textContent = text;
  target.appendChild(node);
  return node;
}

export { render };
//# sourceMappingURL=consumer.js.map
