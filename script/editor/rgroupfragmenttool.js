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
		var rgroupLabels = [];
		rnd.ctab.molecule.rgroups.each(function (rgid) {
			rgroupLabels.push(rgid);
		});
		ui.showRLogicTable({
			label: ci.id,
			rgroupLabels: rgroupLabels,
			range: rg.range || '>0',
			resth: rg.resth,
			ifthen: rg.ifthen,
			onOk: function (res) {
				var props = {};
				if (rg.range != res.range) {
					var isValid = res.range.split(',').all(function (s){
						return s.match(/^[>,<,=]?[0-9]+$/g) || s.match(/^[0-9]+\-[0-9]+$/g);
					});
					if (!isValid) {
						alert('Bad occurrence value');
						return false;
					}
					props.range = res.range;
				}
				if (rg.resth != res.resth) props.resth = res.resth;
				if (rg.ifthen != res.ifthen) props.ifthen = res.ifthen;
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
