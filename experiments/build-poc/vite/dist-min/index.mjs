// ../fixture/core.mjs
var e = {
	display: "flex",
	borderRadius: "10px",
	padding: "8px 16px"
};
function t(e, t) {
	let n = e.ownerDocument.createElement("div");
	return n.className = "toast", n.textContent = t, e.appendChild(n), n;
}
var n = "toast-poc-unused-marker";
export { e as DEFAULT_STYLE, n as UNUSED_MARKER, t as render };

//# sourceMappingURL=index.mjs.map