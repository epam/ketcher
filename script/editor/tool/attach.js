var HoverHelper = require('./helper/hover');
var EditorTool = require('./base');
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

	this.hoverHelper = new HoverHelper(this);
}
AttachTool.prototype = new EditorTool();
AttachTool.prototype.OnMouseMove = function (event) {
	var rnd = this.editor.render;

	var ci = this.editor.findItem(event, ['atoms', 'bonds']);
	var struct = rnd.ctab.molecule;
	if (ci && ((ci.map == 'atoms' && element.getElementByLabel(struct.atoms.get(ci.id).label) != null) || ci.map == 'bonds'))
		this.hoverHelper.hover(ci);
	else
		this.hoverHelper.hover(null);
	return true;
};
AttachTool.prototype.OnMouseUp = function (event) {
	var editor = this.editor;
	var rnd = editor.render;
	var struct = rnd.ctab.molecule;
	var ci = editor.findItem(event, ['atoms', 'bonds']);

	if (ci && ((ci.map == 'atoms' && element.getElementByLabel(struct.atoms.get(ci.id).label) != null) || ci.map == 'bonds')) {
		if (ci.map == 'atoms')
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
