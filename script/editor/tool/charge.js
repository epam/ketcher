var Action = require('../action');
var HoverHelper = require('./helper/hover');
var EditorTool = require('./base');
var element = require('../../chem/element');

function ChargeTool(editor, charge) {
	if (!(this instanceof ChargeTool))
		return new ChargeTool(editor, charge);

	this.editor = editor;
	this.editor.selection(null);
	this.charge = charge;

	this.hoverHelper = new HoverHelper(this);
}
ChargeTool.prototype = new EditorTool();
ChargeTool.prototype.OnMouseMove = function (event) {
	var rnd = this.editor.render;
	var ci = this.editor.findItem(event, ['atoms']);
	var struct = rnd.ctab.molecule;
	if (ci && ci.map == 'atoms' && element.map[struct.atoms.get(ci.id).label])
		this.hoverHelper.hover(ci);
	else
		this.hoverHelper.hover(null);
	return true;
};
ChargeTool.prototype.OnMouseUp = function (event) {
	var editor = this.editor;
	var rnd = editor.render;
	var struct = rnd.ctab.molecule;
	var ci = editor.findItem(event, ['atoms']);
	if (ci && ci.map == 'atoms' && element.map[struct.atoms.get(ci.id).label]) {
		this.hoverHelper.hover(null);
		this.editor.update(Action.fromAtomsAttrs(ci.id, {
			charge: struct.atoms.get(ci.id).charge + this.charge
		}));
	}
	return true;
};

module.exports = ChargeTool;
