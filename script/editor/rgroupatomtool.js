var EditorTool = require('./editortool');
var HoverHelper = require('./hoverhelper');
var EditorGlobal = require('./editorglobal');

var RGroupAtomTool = function (editor) {
	this.editor = editor;

	this._hoverHelper = new HoverHelper(this);
};
RGroupAtomTool.prototype = new EditorTool();
RGroupAtomTool.prototype.OnMouseMove = function (event) {
	this._hoverHelper.hover(this.editor.render.findItem(event, ['atoms']));
};
RGroupAtomTool.prototype.OnMouseUp = EditorGlobal.RGroupAtomTool_OnMouseUp;

module.exports = RGroupAtomTool