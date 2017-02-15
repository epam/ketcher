var Action = require('../action');
var HoverHelper = require('./helper/hover');
var EditorTool = require('./base');

function APointTool(editor) {
	if (!(this instanceof APointTool))
		return new APointTool(editor);

	this.editor = editor;
	this.editor.selection(null);

	this.hoverHelper = new HoverHelper(this);
}

APointTool.prototype = new EditorTool();

APointTool.prototype.OnMouseMove = function (event) {
	this.hoverHelper.hover(this.editor.findItem(event, ['atoms']));
};

APointTool.prototype.OnMouseUp = function (event) {
	var editor = this.editor;
	var struct = editor.render.ctab.molecule;
	var ci = editor.findItem(event, ['atoms']);

	if (ci && ci.map == 'atoms') {
		this.hoverHelper.hover(null);
		var ap = struct.atoms.get(ci.id).attpnt;
		var res = editor.event.apointEdit.dispatch(ap);
		Promise.resolve(res).then(function (newAp) {
			if (ap != newAp) {
				var action = Action.fromAtomsAttrs(ci.id, { attpnt: newAp });
				editor.update(action);
			}
		});
		return true;
	}
};

module.exports = APointTool;
