var Action = require('../action');
var EditorTool = require('./base');

var ui = global.ui;

var PasteTool = function (editor, struct) {
	this.editor = editor;
	this.struct = struct;

	var rnd = editor.render;
	this.action = Action.fromPaste(
		this.struct, 'lastEvent' in this.OnMouseMove0 ?
			rnd.page2obj(this.OnMouseMove0.lastEvent) : undefined);
	rnd.update();
};
PasteTool.prototype = new EditorTool();
PasteTool.prototype.OnMouseMove = function (event) {
	if ('action' in this) {
		this.action.perform(this.editor);
	}
	var rnd = this.editor.render;
	this.action = Action.fromPaste(this.struct, rnd.page2obj(event));
	rnd.update();
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
