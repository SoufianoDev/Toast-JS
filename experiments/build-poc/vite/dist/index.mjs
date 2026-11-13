// ../fixture/core.mjs
var DEFAULT_STYLE = {
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
var UNUSED_MARKER = "toast-poc-unused-marker";
export { DEFAULT_STYLE, UNUSED_MARKER, render };

//# sourceMappingURL=index.mjs.map