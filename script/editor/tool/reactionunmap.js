var Action = require('../action');
var HoverHelper = require('./helper/hover');
var EditorTool = require('./base');

var ui = global.ui;

function ReactionUnmapTool(editor) {
	this.editor = editor;

	this.hoverHelper = new HoverHelper(this);

	this.editor.setSelection(null);
}
ReactionUnmapTool.prototype = new EditorTool();
ReactionUnmapTool.prototype.OnMouseMove = function (event) {
	var ci = this.editor.findItem(event, ['atoms']);
	if (ci && ci.map == 'atoms')
		this.hoverHelper.hover(this.editor.render.ctab.molecule.atoms.get(ci.id).aam ? ci : null);
	else
		this.hoverHelper.hover(null);
};
ReactionUnmapTool.prototype.OnMouseUp = function (event) {
	var ci = this.editor.findItem(event, ['atoms']);
	var atoms = this.editor.render.ctab.molecule.atoms;
	if (ci && ci.map == 'atoms' && atoms.get(ci.id).aam) {
		var action = new Action();
		var aam = atoms.get(ci.id).aam;
		atoms.each(
		function (aid, atom) {
			if (atom.aam == aam)
				action.mergeWith(Action.fromAtomsAttrs(aid, { aam: 0 }));
		},
			this
		);
		ui.addUndoAction(action, true);
		this.editor.render.update();
	}
	this.hoverHelper.hover(null);
};

module.exports = ReactionUnmapTool;
