var Action = require('../action');
var HoverHelper = require('./helper/hover');
var EditorTool = require('./base');

var ui = global.ui;

var ReactionPlusTool = function (editor) {
	this.editor = editor;

	this._hoverHelper = new HoverHelper(this);
};
ReactionPlusTool.prototype = new EditorTool();
ReactionPlusTool.prototype.OnMouseDown = function (event) {
	var rnd = this.editor.render;
	var ci = rnd.findItem(event, ['rxnPluses']);
	if (ci && ci.map == 'rxnPluses') {
		this._hoverHelper.hover(null);
		this.editor._selectionHelper.setSelection(ci);
		this.dragCtx = {
			xy0: rnd.page2obj(event)
		};
	}
};
ReactionPlusTool.prototype.OnMouseMove = function (event) {
	var rnd = this.editor.render;
	if ('dragCtx' in this) {
		if (this.dragCtx.action)
			this.dragCtx.action.perform();
		this.dragCtx.action = Action.fromMultipleMove(
			this.editor._selectionHelper.selection,
		rnd.page2obj(event).sub(this.dragCtx.xy0)
		);
		rnd.update();
	} else {
		this._hoverHelper.hover(rnd.findItem(event, ['rxnPluses']));
	}
};
ReactionPlusTool.prototype.OnMouseUp = function (event) {
	var rnd = this.editor.render;
	if ('dragCtx' in this) {
		ui.addUndoAction(this.dragCtx.action, false); // TODO investigate, subsequent undo/redo fails
		rnd.update();
		delete this.dragCtx;
	} else {
		ui.addUndoAction(Action.fromPlusAddition(rnd.page2obj(event)));
		rnd.update();
	}
};

module.exports = ReactionPlusTool;
