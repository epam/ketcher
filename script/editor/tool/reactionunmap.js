var Action = require('../action');

function ReactionUnmapTool(editor) {
	if (!(this instanceof ReactionUnmapTool))
		return new ReactionUnmapTool(editor);

	this.editor = editor;
	this.editor.selection(null);
}
ReactionUnmapTool.prototype.mousemove = function (event) {
	var ci = this.editor.findItem(event, ['atoms']);
	if (ci && ci.map === 'atoms')
		this.editor.hover(this.editor.render.ctab.molecule.atoms.get(ci.id).aam ? ci : null);
	else
		this.editor.hover(null);
};
ReactionUnmapTool.prototype.mouseup = function (event) {
	var ci = this.editor.findItem(event, ['atoms']);
	var atoms = this.editor.render.ctab.molecule.atoms;
	if (ci && ci.map === 'atoms' && atoms.get(ci.id).aam) {
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
	this.editor.hover(null);
};

module.exports = ReactionUnmapTool;
