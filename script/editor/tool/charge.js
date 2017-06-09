var Action = require('../action');
var element = require('../../chem/element');

function ChargeTool(editor, charge) {
	if (!(this instanceof ChargeTool))
		return new ChargeTool(editor, charge);

	this.editor = editor;
	this.editor.selection(null);
	this.charge = charge;
}

ChargeTool.prototype.mousemove = function (event) {
	var rnd = this.editor.render;
	var ci = this.editor.findItem(event, ['atoms']);
	var struct = rnd.ctab.molecule;
	if (ci && ci.map == 'atoms' && element.map[struct.atoms.get(ci.id).label])
		this.editor.hover(ci);
	else
		this.editor.hover(null);
	return true;
};
ChargeTool.prototype.mouseup = function (event) {
	var editor = this.editor;
	var rnd = editor.render;
	var struct = rnd.ctab.molecule;
	var ci = editor.findItem(event, ['atoms']);
	if (ci && ci.map == 'atoms' && element.map[struct.atoms.get(ci.id).label]) {
		this.editor.hover(null);
		this.editor.update(Action.fromAtomsAttrs(rnd.ctab, ci.id, {
			charge: struct.atoms.get(ci.id).charge + this.charge
		}));
	}
	return true;
};

module.exports = ChargeTool;
