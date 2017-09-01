/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

var Action = require('../action');

function ReactionArrowTool(editor) {
	if (!(this instanceof ReactionArrowTool))
		return new ReactionArrowTool(editor);

	this.editor = editor;
	this.editor.selection(null);
}

ReactionArrowTool.prototype.mousedown = function (event) {
	var rnd = this.editor.render;
	var ci = this.editor.findItem(event, ['rxnArrows']);
	if (ci && ci.map === 'rxnArrows') {
		this.editor.hover(null);
		this.editor.selection({ rxnArrows: [ci.id] });
		this.dragCtx = { xy0: rnd.page2obj(event) };
	}
};
ReactionArrowTool.prototype.mousemove = function (event) {
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
		this.editor.hover(this.editor.findItem(event, ['rxnArrows']));
	}
};
ReactionArrowTool.prototype.mouseup = function (event) {
	var rnd = this.editor.render;
	if (this.dragCtx) {
		this.editor.update(this.dragCtx.action); // TODO investigate, subsequent undo/redo fails
		delete this.dragCtx;
	} else if (rnd.ctab.molecule.rxnArrows.count() < 1) {
		this.editor.update(Action.fromArrowAddition(rnd.ctab, rnd.page2obj(event)));
	}
};

module.exports = ReactionArrowTool;
