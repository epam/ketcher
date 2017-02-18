var Struct = require('../../chem/struct');
var Action = require('../action');
var EditorTool = require('./base');
var HoverHelper = require('./helper/hover');

function RGroupAtomTool(editor) {
	if (!(this instanceof RGroupAtomTool)) {
		// TODO: map atoms with labels
		editor.selection(null);
		return new RGroupAtomTool(editor);
	}

	this.editor = editor;

	this.hoverHelper = new HoverHelper(this);
}

RGroupAtomTool.prototype = new EditorTool();

RGroupAtomTool.prototype.OnMouseMove = function (event) {
	this.hoverHelper.hover(this.editor.findItem(event, ['atoms']));
};

RGroupAtomTool.prototype.OnMouseUp = function (event) {
	var rnd = this.editor.render;
	var ci = this.editor.findItem(event, ['atoms']);
	if (!ci || ci.type == 'Canvas') {
		this.hoverHelper.hover(null);
		propsDialog(this.editor, null,
		            rnd.page2obj(this.OnMouseMove0.lastEvent));
		return true;
	} else if (ci && ci.map == 'atoms') {
		this.hoverHelper.hover(null);
		propsDialog(this.editor, ci.id);
		return true;
	}
};

function propsDialog(editor, id, pos) {
	var struct = editor.render.ctab.molecule;
	var atom = id ? struct.atoms.get(id) : null;
	var rglabel = atom ? atom.rglabel : 0;
	var label = atom ? atom.label : 'R#';

	var res = editor.event.elementEdit.dispatch({
		label: 'R#', rglabel: rglabel
	});

	Promise.resolve(res).then(function (props) {
		props = Object.assign({}, Struct.Atom.attrlist, props); // TODO review: using Atom.attrlist as a source of default property values
		if (!id && props.rglabel) {
			editor.update(Action.fromAtomAddition(pos, props));
		} else if (rglabel != props.rglabel || label != 'R#') {
			if (!props.rglabel)
				props.label = 'C';
			props.aam = atom.aam;
			editor.update(Action.fromAtomsAttrs(id, props));
		}
	});
}

module.exports = RGroupAtomTool;
