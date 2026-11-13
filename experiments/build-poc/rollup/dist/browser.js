var ToastPoc = (function (exports) {
  'use strict';

  const DEFAULT_STYLE = {
    display: 'flex',
    borderRadius: '10px',
    padding: '8px 16px',
  };

  function render(target, text) {
    const node = target.ownerDocument.createElement('div');
    node.className = 'toast';
    node.textContent = text;
    target.appendChild(node);
    return node;
  }

  function mount(target, text) {
    const node = render(target, text);
    Object.assign(node.style, DEFAULT_STYLE);
    return node;
  }

  exports.mount = mount;

  return exports;

})({});
//# sourceMappingURL=browser.js.map
