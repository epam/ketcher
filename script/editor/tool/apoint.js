var Action = require('../action');

function APointTool(editor) {
	if (!(this instanceof APointTool))
		return new APointTool(editor);

	this.editor = editor;
	this.editor.selection(null);
}

APointTool.prototype.mousemove = function (event) {
	this.editor.hover(this.editor.findItem(event, ['atoms']));
};

APointTool.prototype.mouseup = function (event) {
	var editor = this.editor;
	var struct = editor.render.ctab.molecule;
	var ci = editor.findItem(event, ['atoms']);

	if (ci && ci.map == 'atoms') {
		this.editor.hover(null);
		var atom = struct.atoms.get(ci.id);
		var res = editor.event.elementEdit.dispatch({
			attpnt: atom.attpnt
		});
		Promise.resolve(res).then(function (newatom) {
			if (atom.attpnt != newatom.attpnt) {
				var action = Action.fromAtomsAttrs(editor.render.ctab, ci.id, newatom);
				editor.update(action);
			}
		});
		return true;
	}
};

module.exports = APointTool;
