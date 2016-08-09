var EditorTool = require('./base');
var HoverHelper = require('./helper/hover');
var LassoHelper = require('./helper/lasso');
var SGroupHelper = require('./helper/sgroup');

function SGroupTool(editor, type) {
	this.editor = editor;

	this.maps = ['atoms', 'bonds', 'sgroups', 'sgroupData'];
	this.hoverHelper = new HoverHelper(this);
	this.lassoHelper = new LassoHelper(1, editor);
	this._sGroupHelper = new SGroupHelper(editor, type);

	var selection = this.editor.getSelection();
	if (selection.atoms && selection.atoms.length > 0)
		// if the selection contains atoms, create an s-group out of those
		this._sGroupHelper.showPropertiesDialog(null, selection);
	else
		// otherwise, clear selection
		this.editor.deselectAll();
}
SGroupTool.prototype = new EditorTool();
SGroupTool.prototype.OnMouseDown = function (event) {
	var ci = this.editor.render.findItem(event, this.maps);
	if (!ci || ci.type == 'Canvas')
		this.lassoHelper.begin(event);
};
SGroupTool.prototype.OnMouseMove = function (event) {
	if (this.lassoHelper.running()) {
		this.editor._selectionHelper.setSelection(
		this.lassoHelper.addPoint(event)
		);
	} else {
		this.hoverHelper.hover(this.editor.render.findItem(event, this.maps));
	}
};
SGroupTool.prototype.OnMouseUp = function (event) {
	var id = null; // id of an existing group, if we're editing one
	var selection = null; // atoms to include in a newly created group
	if (this.lassoHelper.running()) { // TODO it catches more events than needed, to be re-factored
		selection = this.lassoHelper.end(event);
	} else {
		var ci = this.editor.render.findItem(event, this.maps);
		if (!ci || ci.type == 'Canvas')
			return;
		this.hoverHelper.hover(null);

		if (ci.map == 'atoms') {
			// if we click the SGroup tool on a single atom or bond, make a group out of those
			selection = { atoms: [ci.id] };
		} else if (ci.map == 'bonds') {
			var bond = this.editor.render.ctab.bonds.get(ci.id);
			selection = { atoms: [bond.b.begin, bond.b.end] };
		} else if (ci.map == 'sgroups') {
			id = ci.id;
		} else {
			return;
		}
	}
	// TODO: handle click on an existing group?
	if (id != null || (selection && selection.atoms && selection.atoms.length > 0))
		this._sGroupHelper.showPropertiesDialog(id, selection);
};

module.exports = SGroupTool;
