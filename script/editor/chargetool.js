var Action = require('../ui/action');
var HoverHelper = require('./hoverhelper');
var EditorTool = require('./editortool');
var element = require('../chem/element');

var ui = global.ui;

var ChargeTool = function (editor, charge) { // TODO [RB] should be "pluggable"
	this.editor = editor;
	this.charge = charge;

	this._hoverHelper = new HoverHelper(this);
};
ChargeTool.prototype = new EditorTool();
ChargeTool.prototype.OnMouseMove = function (event) {
	var ci = this.editor.render.findItem(event, ['atoms']);
	if (ci && ci.map == 'atoms' && element.getElementByLabel(ui.ctab.atoms.get(ci.id).label) != null) {
		this._hoverHelper.hover(ci);
	} else {
		this._hoverHelper.hover(null);
	}
	return true;
};
ChargeTool.prototype.OnMouseUp = function (event) {
	var _E_ = this.editor, _R_ = _E_.render;
	var ci = _R_.findItem(event, ['atoms']);
	if (ci && ci.map == 'atoms' && element.getElementByLabel(ui.ctab.atoms.get(ci.id).label) != null) {
		this._hoverHelper.hover(null);
		ui.addUndoAction(
		Action.fromAtomsAttrs(ci.id, { charge: _R_.ctab.molecule.atoms.get(ci.id).charge + this.charge })
		);
		_R_.update();
	}
	return true;
};

module.exports = ChargeTool;