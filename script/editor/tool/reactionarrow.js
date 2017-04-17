var Action = require('../action');
var HoverHelper = require('./helper/hover');

function ReactionArrowTool(editor) {
	if (!(this instanceof ReactionArrowTool))
		return new ReactionArrowTool(editor);

	this.editor = editor;
	this.editor.selection(null);

	this.hoverHelper = new HoverHelper(this);
}

ReactionArrowTool.prototype.OnMouseDown = function (event) {
	var rnd = this.editor.render;
	var ci = this.editor.findItem(event, ['rxnArrows']);
	if (ci && ci.map == 'rxnArrows') {
		this.hoverHelper.hover(null);
		this.editor.selection({ rxnArrows: [ci.id] });
		this.dragCtx = { xy0: rnd.page2obj(event) };
	}
};
ReactionArrowTool.prototype.OnMouseMove = function (event) {
	var rnd = this.editor.render;
	if ('dragCtx' in this) {
		if (this.dragCtx.action)
			this.dragCtx.action.perform(rnd.ctab);

		this.dragCtx.action = Action.fromMultipleMove(
			rnd.ctab,
			this.editor.selection() || {},
			rnd.page2obj(event).sub(this.dragCtx.xy0)
		);
		rnd.update();
	} else {
		this.hoverHelper.hover(this.editor.findItem(event, ['rxnArrows']));
	}
};
ReactionArrowTool.prototype.OnMouseUp = function (event) {
	var rnd = this.editor.render;
	if (this.dragCtx) {
		this.editor.update(this.dragCtx.action); // TODO investigate, subsequent undo/redo fails
		delete this.dragCtx;
	} else if (rnd.ctab.molecule.rxnArrows.count() < 1) {
		this.editor.update(Action.fromArrowAddition(rnd.ctab, rnd.page2obj(event)));
	}
};

module.exports = ReactionArrowTool;
