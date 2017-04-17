var Action = require('../action');
var HoverHelper = require('./helper/hover');

function ReactionUnmapTool(editor) {
	if (!(this instanceof ReactionUnmapTool))
		return new ReactionUnmapTool(editor);

	this.editor = editor;
	this.editor.selection(null);

	this.hoverHelper = new HoverHelper(this);
}
ReactionUnmapTool.prototype.mousemove = function (event) {
	var ci = this.editor.findItem(event, ['atoms']);
	if (ci && ci.map == 'atoms')
		this.hoverHelper.hover(this.editor.render.ctab.molecule.atoms.get(ci.id).aam ? ci : null);
	else
		this.hoverHelper.hover(null);
};
ReactionUnmapTool.prototype.mouseup = function (event) {
	var ci = this.editor.findItem(event, ['atoms']);
	var atoms = this.editor.render.ctab.molecule.atoms;
	if (ci && ci.map == 'atoms' && atoms.get(ci.id).aam) {
		var action = new Action();
		var aam = atoms.get(ci.id).aam;
		atoms.each(
		function (aid, atom) {
			if (atom.aam == aam)
				action.mergeWith(Action.fromAtomsAttrs(this.editor.render.ctab, aid, { aam: 0 }));
		},
			this
		);
		this.editor.update(action);
	}
	this.hoverHelper.hover(null);
};

module.exports = ReactionUnmapTool;
