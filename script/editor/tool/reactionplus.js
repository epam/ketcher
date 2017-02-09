var Action = require('../action');
var HoverHelper = require('./helper/hover');
var EditorTool = require('./base');

var ui = global.ui;

function ReactionPlusTool(editor) {
	if (!(this instanceof ReactionPlusTool))
		return new ReactionPlusTool(editor);

	this.editor = editor;
	this.editor.selection(null);

	this.hoverHelper = new HoverHelper(this);
}
ReactionPlusTool.prototype = new EditorTool();
ReactionPlusTool.prototype.OnMouseDown = function (event) {
	var rnd = this.editor.render;
	var ci = this.editor.findItem(event, ['rxnPluses']);
	if (ci && ci.map == 'rxnPluses') {
		this.hoverHelper.hover(null);
		this.editor.selection({ rxnPluses: [ci.id] });
		this.dragCtx = { xy0: rnd.page2obj(event) };
	}
};
ReactionPlusTool.prototype.OnMouseMove = function (event) {
	var rnd = this.editor.render;
	if ('dragCtx' in this) {
		if (this.dragCtx.action)
			this.dragCtx.action.perform();
		this.dragCtx.action = Action.fromMultipleMove(
			this.editor.selection() || {},
			rnd.page2obj(event).sub(this.dragCtx.xy0)
		);
		rnd.update();
	} else {
		this.hoverHelper.hover(this.editor.findItem(event, ['rxnPluses']));
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
