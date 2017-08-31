var Action = require('../action');

function ReactionPlusTool(editor) {
	if (!(this instanceof ReactionPlusTool))
		return new ReactionPlusTool(editor);

	this.editor = editor;
	this.editor.selection(null);
}
ReactionPlusTool.prototype.mousedown = function (event) {
	var rnd = this.editor.render;
	var ci = this.editor.findItem(event, ['rxnPluses']);
	if (ci && ci.map === 'rxnPluses') {
		this.editor.hover(null);
		this.editor.selection({ rxnPluses: [ci.id] });
		this.dragCtx = { xy0: rnd.page2obj(event) };
	}
};
ReactionPlusTool.prototype.mousemove = function (event) {
	var rnd = this.editor.render;
	if ('dragCtx' in this) {
		if (this.dragCtx.action)
			this.dragCtx.action.perform(rnd.ctab);
		this.dragCtx.action = Action.fromMultipleMove(
			rnd.ctab,
			this.editor.selection() || {},
			rnd.page2obj(event).sub(this.dragCtx.xy0)
		);
		this.editor.update(this.dragCtx.action, true);
	} else {
		this.editor.hover(this.editor.findItem(event, ['rxnPluses']));
	}
};
ReactionPlusTool.prototype.mouseup = function (event) {
	var rnd = this.editor.render;
	if (this.dragCtx) {
		this.editor.update(this.dragCtx.action); // TODO investigate, subsequent undo/redo fails
		delete this.dragCtx;
	} else {
		this.editor.update(Action.fromPlusAddition(rnd.ctab, rnd.page2obj(event)));
	}
};

module.exports = ReactionPlusTool;
