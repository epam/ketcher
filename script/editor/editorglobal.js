var Atom = require('../chem/atom');
var Action = require('./action');

var ui = global.ui;

var EditorGlobal = function () {};

EditorGlobal.RGroupAtomTool_OnMouseUp = function (event) {
	function sel2Values(rg) {
		var res = [];
		for (var rgi = 0; rgi < 32; rgi++)
			if (rg & (1 << rgi)) {
				var val = 'R' + (rgi + 1);
				res.push(val); // push the string
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
	var ci = this.editor.render.findItem(event, ['atoms']);
	if (!ci || ci.type == 'Canvas') {
		this._hoverHelper.hover(null);
		ui.showRGroupTable({
			mode: 'multiple',
			onOk: function (rgNew) {
				rgNew = values2Sel(rgNew);
				if (rgNew) {
					ui.addUndoAction(
					Action.fromAtomAddition(
					ui.page2obj(this.OnMouseMove0.lastEvent),
					{ label: 'R#', rglabel: rgNew}
					),
						true
					);
					ui.render.update();
				}
			}.bind(this)
		});
		return true;
	} else if (ci && ci.map == 'atoms') {
		this._hoverHelper.hover(null);
		var atom = this.editor.render.ctab.molecule.atoms.get(ci.id);
		var lbOld = atom.label;
		var rgOld = atom.rglabel;
		ui.showRGroupTable({
			mode: 'multiple',
			values: sel2Values(rgOld),
			onOk: function (rgNew) {
				rgNew = values2Sel(rgNew);
				if (rgOld != rgNew || lbOld != 'R#') {
					var newProps = Object.clone(Atom.attrlist); // TODO review: using Atom.attrlist as a source of default property values
					if (rgNew) {
						newProps.label = 'R#';
						newProps.rglabel = rgNew;
						newProps.aam = atom.aam;
					} else {
						newProps.label = 'C';
						newProps.aam = atom.aam;
					}
					ui.addUndoAction(Action.fromAtomsAttrs(ci.id, newProps), true);
					ui.render.update();
				}
			}.bind(this)
		});
		return true;
	}
};

module.exports = EditorGlobal;
