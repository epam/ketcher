var Action = require('../action');
var HoverHelper = require('./helper/hover');
var EditorTool = require('./base');
var element = require('../../chem/element');

var ui = global.ui;

var ChargeTool = function (editor, charge) { // TODO [RB] should be "pluggable"
	this.editor = editor;
	this.charge = charge;

	this._hoverHelper = new HoverHelper(this);
};
ChargeTool.prototype = new EditorTool();
ChargeTool.prototype.OnMouseMove = function (event) {
	var rnd = this.editor.render;
	var ci = rnd.findItem(event, ['atoms']);
	var struct = rnd.ctab.molecule;
	if (ci && ci.map == 'atoms' && element.getElementByLabel(struct.atoms.get(ci.id).label) != null)
		this._hoverHelper.hover(ci);
	else
		this._hoverHelper.hover(null);
	return true;
};
ChargeTool.prototype.OnMouseUp = function (event) {
	var _E_ = this.editor;
	var rnd = _E_.render;
	var struct = rnd.ctab.molecule;
	var ci = rnd.findItem(event, ['atoms']);
	if (ci && ci.map == 'atoms' && element.getElementByLabel(struct.atoms.get(ci.id).label) != null) {
		this._hoverHelper.hover(null);
		ui.addUndoAction(
		Action.fromAtomsAttrs(ci.id, { charge: struct.atoms.get(ci.id).charge + this.charge })
		);
		rnd.update();
	}
	return true;
};

module.exports = ChargeTool;
