var Action = require('../ui/action');
var EditorTool = require('./editortool');

var ui = global.ui;

var PasteTool = function (editor, struct) {
	this.editor = editor;
	this.struct = struct;
	this.action = Action.fromPaste(
		this.struct, 'lastEvent' in this.OnMouseMove0 ?
			ui.page2obj(this.OnMouseMove0.lastEvent) : undefined);
	this.editor.render.update();
};
PasteTool.prototype = new EditorTool();
PasteTool.prototype.OnMouseMove = function (event) {
	if ('action' in this) {
		this.action.perform(this.editor);
	}
	this.action = Action.fromPaste(this.struct, ui.page2obj(event));
	this.editor.render.update();
};
PasteTool.prototype.OnMouseUp = function () {
	ui.addUndoAction(this.action);
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