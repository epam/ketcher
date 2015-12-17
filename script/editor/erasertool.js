var Action = require('../ui/action');
var EditorTool = require('./editortool');
var HoverHelper = require('./hoverhelper');
var LassoHelper = require('./lassohelper');

var ui = global.ui;

var EraserTool = function (editor, mode) {
	this.editor = editor;

	this.maps = ['atoms', 'bonds', 'rxnArrows', 'rxnPluses', 'sgroups', 'sgroupData', 'chiralFlags'];
	this._hoverHelper = new HoverHelper(this);
	this._lassoHelper = new LassoHelper(mode || 0, editor);
};
EraserTool.prototype = new EditorTool();
EraserTool.prototype.OnMouseDown = function (event) {
	var ci = this.editor.render.findItem(event, this.maps);
	if (!ci || ci.type == 'Canvas') {
		this._lassoHelper.begin(event);
	}
};
EraserTool.prototype.OnMouseMove = function (event) {
	if (this._lassoHelper.running()) {
		this.editor._selectionHelper.setSelection(
		this._lassoHelper.addPoint(event)
		);
	} else {
		this._hoverHelper.hover(this.editor.render.findItem(event, this.maps));
	}
};
EraserTool.prototype.OnMouseUp = function (event) {
	if (this._lassoHelper.running()) { // TODO it catches more events than needed, to be re-factored
		ui.addUndoAction(Action.fromFragmentDeletion(this._lassoHelper.end(event)));
		this.editor.deselectAll();
		ui.render.update();
	} else {
		var ci = this.editor.render.findItem(event, this.maps);
		if (ci && ci.type != 'Canvas') {
			this._hoverHelper.hover(null);
			if (ci.map == 'atoms') {
				ui.addUndoAction(Action.fromAtomDeletion(ci.id));
			} else if (ci.map == 'bonds') {
				ui.addUndoAction(Action.fromBondDeletion(ci.id));
			} else if (ci.map == 'sgroups' || ci.map == 'sgroupData') {
				ui.addUndoAction(Action.fromSgroupDeletion(ci.id));
			} else if (ci.map == 'rxnArrows') {
				ui.addUndoAction(Action.fromArrowDeletion(ci.id));
			} else if (ci.map == 'rxnPluses') {
				ui.addUndoAction(Action.fromPlusDeletion(ci.id));
			} else if (ci.map == 'chiralFlags') {
				ui.addUndoAction(Action.fromChiralFlagDeletion());
			} else {
				// TODO re-factoring needed - should be "map-independent"
				console.log('EraserTool: unable to delete the object ' + ci.map + '[' + ci.id + ']');
				return;
			}
			this.editor.deselectAll();
			ui.render.update();
		}
	}
};

module.exports = EraserTool;