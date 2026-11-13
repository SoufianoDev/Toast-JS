(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ?  factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ToastPoc = {})));
})(this, function(exports) {
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
// ../fixture/core.mjs
	const DEFAULT_STYLE = {
		display: "flex",
		borderRadius: "10px",
		padding: "8px 16px"
	};
	function render(target, text) {
		const node = target.ownerDocument.createElement("div");
		node.className = "toast";
		node.textContent = text;
		target.appendChild(node);
		return node;
	}

// ../fixture/browser.mjs
	function mount(target, text) {
		const node = render(target, text);
		Object.assign(node.style, DEFAULT_STYLE);
		return node;
	}

exports.mount = mount;
});
//# sourceMappingURL=browser.js.map