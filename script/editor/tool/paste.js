/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

var Action = require('../action');

function PasteTool(editor, struct) {
	if (!(this instanceof PasteTool))
		return new PasteTool(editor, struct);

	this.editor = editor;
	this.editor.selection(null);
	this.struct = struct;

	var rnd = editor.render;
	var point = editor.lastEvent ?
	    rnd.page2obj(editor.lastEvent) : null;
	this.action = Action.fromPaste(rnd.ctab, this.struct, point);
	this.editor.update(this.action, true);
}

PasteTool.prototype.mousemove = function (event) {
	var rnd = this.editor.render;
	if (this.action)
		this.action.perform(rnd.ctab);
	this.action = Action.fromPaste(rnd.ctab, this.struct, rnd.page2obj(event));
	this.editor.update(this.action, true);
};

PasteTool.prototype.mouseup = function () {
	if (this.action) {
		var action = this.action;
		delete this.action;
		this.editor.update(action);
	}
};

PasteTool.prototype.cancel = PasteTool.prototype.mouseleave = function () {
	var rnd = this.editor.render;
	if (this.action) {
		this.action.perform(rnd.ctab); // revert the action
		delete this.action;
		rnd.update();
	}
};

module.exports = PasteTool;
