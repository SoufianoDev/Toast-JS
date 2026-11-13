// ../../fixture/style.css?inline
var style_default = ".toast {\n  border-radius: 10px;\n  justify-content: center;\n  align-items: center;\n  padding: 8px 16px;\n  display: flex;\n}\n";
// inline-injection.mjs
function injectStyles(target) {
	const style = target.ownerDocument.createElement("style");
	style.textContent = style_default;
	target.ownerDocument.head.appendChild(style);
	return style;
}
export { style_default as css, injectStyles };

//# sourceMappingURL=inline-injection.mjs.map