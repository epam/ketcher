var Struct = require('../chem/struct');

var Action = require('./action');
var HoverHelper = require('./hoverhelper');
var EditorTool = require('./editortool');

var ui = global.ui;

var RGroupFragmentTool = function (editor) {
	this.editor = editor;

	this._hoverHelper = new HoverHelper(this);
};

RGroupFragmentTool.prototype = new EditorTool();
RGroupFragmentTool.prototype.OnMouseMove = function (event) {
	this._hoverHelper.hover(this.editor.render.findItem(event, ['frags', 'rgroups']));
};

RGroupFragmentTool.prototype.OnMouseUp = function (event) {
	var rnd = this.editor.render;
	var ci = rnd.findItem(event, ['frags', 'rgroups']);
	if (ci && ci.map == 'frags') {
		this._hoverHelper.hover(null);
		var rgOld = Struct.RGroup.findRGroupByFragment(rnd.ctab.molecule.rgroups, ci.id);
		ui.showRGroupTable({
			values: rgOld && ['R' + rgOld],
			onOk: function (rgNew) {
				console.assert(rgNew.values.length <= 1, 'Too much elements');
				rgNew = rgNew.values.length ? rgNew.values[0].substr(1) - 0 : 0;
				if (rgOld != rgNew) {
					ui.addUndoAction(
					Action.fromRGroupFragment(rgNew, ci.id),
						true
					);
					rnd.update();
				}
			}.bind(this)
		});
		return true;
	}
	else if (ci && ci.map == 'rgroups') {
		this._hoverHelper.hover(null);
		var rg = rnd.ctab.molecule.rgroups.get(ci.id);
		var rgmask = 0; rnd.ctab.molecule.rgroups.each(function (rgid) { rgmask |= (1 << (rgid - 1)); });
		var oldLogic = {
			occurrence: rg.range,
			resth: rg.resth,
			ifthen: rg.ifthen
		};
		ui.showRLogicTable({
			rgid: ci.id,
			rlogic: oldLogic,
			rgmask: rgmask,
			onOk: function (newLogic) {
				var props = {};
				if (oldLogic.occurrence != newLogic.occurrence) {
					var isValid = newLogic.occurrence.split(',').all(function (s){
						return s.match(/^[>,<,=]?[0-9]+$/g) || s.match(/^[0-9]+\-[0-9]+$/g);
					});
					if (!isValid) {
						alert('Bad occurrence value');
						return false;
					}
					props.range = newLogic.occurrence;
				}
				if (oldLogic.resth != newLogic.resth) props.resth = newLogic.resth;
				if (oldLogic.ifthen != newLogic.ifthen) props.ifthen = newLogic.ifthen;
				if ('range' in props || 'resth' in props || 'ifthen' in props) {
					ui.addUndoAction(Action.fromRGroupAttrs(ci.id, props));
					rnd.update();
				}
				return true;
			}.bind(this)
		});
		return true;
	}
};

module.exports = RGroupFragmentTool;
