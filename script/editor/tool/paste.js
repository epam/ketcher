var Action = require('../action');
var EditorTool = require('./base');

var ui = global.ui;

function PasteTool(editor, struct) {
	if (!(this instanceof PasteTool))
		return new PasteTool(editor, struct);

	this.editor = editor;
	this.editor.selection(null);
	this.struct = struct;

	var rnd = editor.render;
	this.action = Action.fromPaste(rnd.ctab,
		this.struct, 'lastEvent' in this.OnMouseMove0 ?
			rnd.page2obj(this.OnMouseMove0.lastEvent) : undefined);
	rnd.update();
}

PasteTool.prototype = new EditorTool();
PasteTool.prototype.OnMouseMove = function (event) {
	if ('action' in this)
		this.action.perform(this.editor);
	var rnd = this.editor.render;
	this.action = Action.fromPaste(rnd.ctab, this.struct, rnd.page2obj(event));
	rnd.update();
};

PasteTool.prototype.OnMouseUp = function () {
	this.editor.update(this.action);
	delete this.action;
	ui.selectAction(null);
};

PasteTool.prototype.OnCancel = function () {
	if ('action' in this) {
		this.action.perform(this.editor);
		delete this.action;
	}
};

module.exports = PasteTool;
