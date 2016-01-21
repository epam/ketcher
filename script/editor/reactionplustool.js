var Action = require('./action');
var HoverHelper = require('./hoverhelper');
var EditorTool = require('./editortool');

var ui = global.ui;

var ReactionPlusTool = function (editor) {
	this.editor = editor;

	this._hoverHelper = new HoverHelper(this);
};
ReactionPlusTool.prototype = new EditorTool();
ReactionPlusTool.prototype.OnMouseDown = function (event) {
	var ci = this.editor.render.findItem(event, ['rxnPluses']);
	if (ci && ci.map == 'rxnPluses') {
		this._hoverHelper.hover(null);
		this.editor._selectionHelper.setSelection(ci);
		this.dragCtx = {
			xy0: ui.page2obj(event)
		};
	}
};
ReactionPlusTool.prototype.OnMouseMove = function (event) {
	if ('dragCtx' in this) {
		if (this.dragCtx.action)
			this.dragCtx.action.perform();
		this.dragCtx.action = Action.fromMultipleMove(
			this.editor._selectionHelper.selection,
		ui.page2obj(event).sub(this.dragCtx.xy0)
		);
		ui.render.update();
	} else {
		this._hoverHelper.hover(this.editor.render.findItem(event, ['rxnPluses']));
	}
};
ReactionPlusTool.prototype.OnMouseUp = function (event) {
	if ('dragCtx' in this) {
		ui.addUndoAction(this.dragCtx.action, false); // TODO investigate, subsequent undo/redo fails
		this.editor.render.update();
		delete this.dragCtx;
	} else {
		ui.addUndoAction(Action.fromPlusAddition(ui.page2obj(event)));
		this.editor.render.update();
	}
};

module.exports = ReactionPlusTool;
