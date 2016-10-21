var Struct = require('../../chem/struct');
var Action = require('../action');
var EditorTool = require('./base');
var HoverHelper = require('./helper/hover');

var ui = global.ui;

function RGroupAtomTool(editor) {
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
		ui.showRGroupTable({
			mode: 'multiple',
			onOk: function (rgNew) {
				rgNew = values2Sel(rgNew);
				if (rgNew) {
					ui.addUndoAction(
					Action.fromAtomAddition(
					rnd.page2obj(this.OnMouseMove0.lastEvent),
					{ label: 'R#', rglabel: rgNew }
					),
						true
					);
					rnd.update();
				}
			}.bind(this)
		});
		return true;
	} else if (ci && ci.map == 'atoms') {
		this.hoverHelper.hover(null);
		var atom = rnd.ctab.molecule.atoms.get(ci.id);
		var lbOld = atom.label;
		var rgOld = atom.rglabel;
		ui.showRGroupTable({
			mode: 'multiple',
			values: sel2Values(rgOld),
			onOk: function (rgNew) {
				rgNew = values2Sel(rgNew);
				if (rgOld != rgNew || lbOld != 'R#') {
					var newProps = Object.clone(Struct.Atom.attrlist); // TODO review: using Atom.attrlist as a source of default property values
					if (rgNew) {
						newProps.label = 'R#';
						newProps.rglabel = rgNew;
						newProps.aam = atom.aam;
					} else {
						newProps.label = 'C';
						newProps.aam = atom.aam;
					}
					ui.addUndoAction(Action.fromAtomsAttrs(ci.id, newProps), true);
					rnd.update();
				}
			}.bind(this)
		});
		return true;
	}
};

function sel2Values(rg) {
	var res = [];
	for (var rgi = 0; rgi < 32; rgi++) {
		if (rg & (1 << rgi)) {
			var val = 'R' + (rgi + 1);
			res.push(val); // push the string
		}
	}
	return res;
}
function values2Sel(vals) {
	var res = 0;
	vals.values.forEach(function (val) {
		var rgi = val.substr(1) - 1;
		res |= 1 << rgi;
	});
	return res;
}

module.exports = RGroupAtomTool;
