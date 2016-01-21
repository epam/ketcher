var Action = require('./action');
var HoverHelper = require('./hoverhelper');
var EditorTool = require('./editortool');

var ui = global.ui;

var APointTool = function (editor) {
	this.editor = editor;

	this._hoverHelper = new HoverHelper(this);
};
APointTool.prototype = new EditorTool();
APointTool.prototype.OnMouseMove = function (event) {
	this._hoverHelper.hover(this.editor.render.findItem(event, ['atoms']));
};
APointTool.prototype.OnMouseUp = function (event) {
	var ci = this.editor.render.findItem(event, ['atoms']);
	if (ci && ci.map == 'atoms') {
		this._hoverHelper.hover(null);
		var apOld = this.editor.render.ctab.molecule.atoms.get(ci.id).attpnt;
		ui.showAtomAttachmentPoints({
			selection: apOld,
			onOk: function (apNew) {
				if (apOld != apNew) {
					ui.addUndoAction(Action.fromAtomsAttrs(ci.id, { attpnt: apNew }), true);
					ui.render.update();
				}
			}.bind(this)
		});
		return true;
	}
};

module.exports = APointTool;
