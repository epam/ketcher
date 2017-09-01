/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

var element = require('../../chem/element');

function AttachTool(editor, attachPoints) {
	if (!(this instanceof AttachTool))
		return new AttachTool(editor, attachPoints);

	this.attach = attachPoints || {}; // { atomid: .. , bondid: .. }
	this.editor = editor;

	this.editor.selection({
		atoms: [this.attach.atomid] || [],
		bonds: [this.attach.bondid] || []
	});
}
AttachTool.prototype.mousemove = function (event) {
	var rnd = this.editor.render;

	var ci = this.editor.findItem(event, ['atoms', 'bonds']);
	var struct = rnd.ctab.molecule;
	if (ci && ((ci.map === 'atoms' && element.map[struct.atoms.get(ci.id).label]) || ci.map === 'bonds'))
		this.editor.hover(ci);
	else
		this.editor.hover(null);
	return true;
};
AttachTool.prototype.mouseup = function (event) {
	var editor = this.editor;
	var rnd = editor.render;
	var struct = rnd.ctab.molecule;
	var ci = editor.findItem(event, ['atoms', 'bonds']);

	if (ci && ((ci.map === 'atoms' && element.map[struct.atoms.get(ci.id).label]) || ci.map === 'bonds')) {
		if (ci.map === 'atoms')
			this.attach.atomid = ci.id;
		else
			this.attach.bondid = ci.id;

		this.editor.selection({
			atoms: [this.attach.atomid],
			bonds: [this.attach.bondid]
		});
		this.editor.event.attachEdit.dispatch(this.attach);
	}
	return true;
};

module.exports = AttachTool;
