var Struct = require('../../chem/struct');

var Action = require('../action');
var HoverHelper = require('./helper/hover');
var EditorTool = require('./base');

function RGroupFragmentTool(editor) {
	if (!(this instanceof RGroupFragmentTool)) {
		// TODO: check if it's a fragments already
		editor.selection(null);
		return new RGroupFragmentTool(editor);
	}

	this.editor = editor;

	this.hoverHelper = new HoverHelper(this);
}

RGroupFragmentTool.prototype = new EditorTool();
RGroupFragmentTool.prototype.OnMouseMove = function (event) {
	this.hoverHelper.hover(this.editor.findItem(event, ['frags', 'rgroups']));
};

RGroupFragmentTool.prototype.OnMouseUp = function (event) {
	var editor = this.editor;
	var struct = editor.render.ctab.molecule;
	var ci = editor.findItem(event, ['frags', 'rgroups']);
	if (ci) {
		this.hoverHelper.hover(null);

		var label = (ci.map == 'rgroups') ? ci.id :
		    Struct.RGroup.findRGroupByFragment(struct.rgroups, ci.id) || null;
		var rg = Object.assign({ label: label },
		                       ci.map == 'frags' ? null :
		                       struct.rgroups.get(ci.id));
		var res = editor.event.rgroupEdit.dispatch(rg);

		Promise.resolve(res).then(function (newRg) {
			var action = ci.map == 'rgroups' ?
			    Action.fromRGroupAttrs(editor.render.ctab, ci.id, newRg) :
			    Action.fromRGroupFragment(editor.render.ctab, newRg.label, ci.id);

			editor.update(action);
		});
		return true;
	}
};

module.exports = RGroupFragmentTool;
