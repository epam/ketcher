var Action = require('./action');
var HoverHelper = require('./hoverhelper');
var EditorTool = require('./editortool');

var ui = global.ui;

var ReactionArrowTool = function (editor) {
	this.editor = editor;

	this._hoverHelper = new HoverHelper(this);
};
ReactionArrowTool.prototype = new EditorTool();
ReactionArrowTool.prototype.OnMouseDown = function (event) {
	var ci = this.editor.render.findItem(event, ['rxnArrows']);
	if (ci && ci.map == 'rxnArrows') {
		this._hoverHelper.hover(null);
		this.editor._selectionHelper.setSelection(ci);
		this.dragCtx = {
			xy0: ui.page2obj(event)
		};
	}
};
ReactionArrowTool.prototype.OnMouseMove = function (event) {
	if ('dragCtx' in this) {
		if (this.dragCtx.action)
			this.dragCtx.action.perform();
		this.dragCtx.action = Action.fromMultipleMove(
			this.editor._selectionHelper.selection,
		ui.page2obj(event).sub(this.dragCtx.xy0)
		);
		ui.render.update();
	} else {
		this._hoverHelper.hover(this.editor.render.findItem(event, ['rxnArrows']));
	}
};
ReactionArrowTool.prototype.OnMouseUp = function (event) {
	if ('dragCtx' in this) {
		ui.addUndoAction(this.dragCtx.action, false); // TODO investigate, subsequent undo/redo fails
		this.editor.render.update();
		delete this.dragCtx;
	} else if (this.editor.render.ctab.molecule.rxnArrows.count() < 1) {
		ui.addUndoAction(Action.fromArrowAddition(ui.page2obj(event)));
		this.editor.render.update();
	}
};

module.exports = ReactionArrowTool;
