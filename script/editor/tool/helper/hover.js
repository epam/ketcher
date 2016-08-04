function HoverHelper(editorTool) {
	this.editorTool = editorTool;
}

HoverHelper.prototype.hover = function (ci) {
	if (ci && ci.type == 'Canvas')
		ci = null;
	// TODO add custom highlight style parameter, to be used when fusing atoms, sgroup children highlighting, etc
	if ('ci' in this && (!ci || this.ci.type != ci.type || this.ci.id != ci.id)) {
		this.editorTool.editor.render.highlightObject(this.ci, false);
		delete this.ci;
	}
	if (ci && this.editorTool.editor.render.highlightObject(ci, true))
		this.ci = ci;
};

module.exports = HoverHelper;
