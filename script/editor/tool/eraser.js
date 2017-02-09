var Action = require('../action');
var EditorTool = require('./base');
var HoverHelper = require('./helper/hover');
var LassoHelper = require('./helper/lasso');

var ui = global.ui;

function EraserTool(editor, mode) {
	this.editor = editor;

	this.maps = ['atoms', 'bonds', 'rxnArrows', 'rxnPluses', 'sgroups', 'sgroupData', 'chiralFlags'];
	this.hoverHelper = new HoverHelper(this);
	this.lassoHelper = new LassoHelper(mode || 0, editor);
}
EraserTool.prototype = new EditorTool();
EraserTool.prototype.OnMouseDown = function (event) {
	var ci = this.editor.findItem(event, this.maps);
	if (!ci || ci.type == 'Canvas')
		this.lassoHelper.begin(event);
};
EraserTool.prototype.OnMouseMove = function (event) {
	if (this.lassoHelper.running())
		this.editor.selection(this.lassoHelper.addPoint(event));
	else
		this.hoverHelper.hover(this.editor.findItem(event, this.maps));
};
EraserTool.prototype.OnMouseUp = function (event) { // eslint-disable-line max-statements
	var rnd = this.editor.render;
	if (this.lassoHelper.running()) { // TODO it catches more events than needed, to be re-factored
		ui.addUndoAction(Action.fromFragmentDeletion(this.lassoHelper.end(event)));
		this.editor.selection(null);
		rnd.update();
	} else {
		var ci = this.editor.findItem(event, this.maps);
		if (ci && ci.type != 'Canvas') {
			this.hoverHelper.hover(null);
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
			this.editor.selection(null);
			rnd.update();
		}
	}
};

module.exports = EraserTool;
