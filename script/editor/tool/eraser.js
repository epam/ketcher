var Action = require('../action');
var HoverHelper = require('./helper/hover');
var LassoHelper = require('./helper/lasso');

function EraserTool(editor, mode) {
	if (!(this instanceof EraserTool)) {
		if (!editor.selection())
			return new EraserTool(editor, mode);

		var action = Action.fromFragmentDeletion(editor.render.ctab, editor.selection());
		editor.update(action);
		editor.selection(null);
		return null;
	}

	this.editor = editor;

	this.maps = ['atoms', 'bonds', 'rxnArrows', 'rxnPluses', 'sgroups', 'sgroupData', 'chiralFlags'];
	this.hoverHelper = new HoverHelper(this);
	this.lassoHelper = new LassoHelper(mode || 0, editor);
}

EraserTool.prototype.OnMouseDown = function (event) {
	var ci = this.editor.findItem(event, this.maps);
	if (!ci) //  ci.type == 'Canvas'
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
		this.editor.update(Action.fromFragmentDeletion(rnd.ctab, this.lassoHelper.end(event)));
		this.editor.selection(null);
	} else {
		var ci = this.editor.findItem(event, this.maps);
		if (ci) { //  ci.type != 'Canvas'
			this.hoverHelper.hover(null);
			if (ci.map == 'atoms') {
				this.editor.update(Action.fromAtomDeletion(rnd.ctab, ci.id));
			} else if (ci.map == 'bonds') {
				this.editor.update(Action.fromBondDeletion(rnd.ctab, ci.id));
			} else if (ci.map == 'sgroups' || ci.map == 'sgroupData') {
				this.editor.update(Action.fromSgroupDeletion(rnd.ctab, ci.id));
			} else if (ci.map == 'rxnArrows') {
				this.editor.update(Action.fromArrowDeletion(rnd.ctab, ci.id));
			} else if (ci.map == 'rxnPluses') {
				this.editor.update(Action.fromPlusDeletion(rnd.ctab, ci.id));
			} else if (ci.map == 'chiralFlags') {
				this.editor.update(Action.fromChiralFlagDeletion(rnd.ctab));
			} else {
				// TODO re-factoring needed - should be "map-independent"
				console.error('EraserTool: unable to delete the object ' + ci.map + '[' + ci.id + ']');
				return;
			}
			this.editor.selection(null);
		}
	}
};

module.exports = EraserTool;
