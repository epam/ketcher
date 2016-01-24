var Vec2 = require('../util/vec2');
var Bond = require('../chem/bond');
var Action = require('./action');
var HoverHelper = require('./hoverhelper');
var EditorTool = require('./editortool');

var ui = global.ui;

var BondTool = function (editor, bondProps) {
	this.editor = editor;
	this.atomProps = { label: 'C' };
	this.bondProps = bondProps;
	this.plainBondTypes = [
			Bond.PATTERN.TYPE.SINGLE,
			Bond.PATTERN.TYPE.DOUBLE,
			Bond.PATTERN.TYPE.TRIPLE];

	this._hoverHelper = new HoverHelper(this);
};
BondTool.prototype = new EditorTool();

BondTool.prototype.OnMouseDown = function (event) {
	var rnd = this.editor.render;
	this._hoverHelper.hover(null);
	this.dragCtx = {
		xy0: rnd.page2obj(event),
		item: rnd.findItem(event, ['atoms', 'bonds'])
	};
	if (!this.dragCtx.item || this.dragCtx.item.type == 'Canvas') delete this.dragCtx.item;
	return true;
};

BondTool.prototype.OnMouseMove = function (event) {
	var _E_ = this.editor, rnd = _E_.render;
	if ('dragCtx' in this) {
		var _DC_ = this.dragCtx;
		if (!('item' in _DC_) || _DC_.item.map == 'atoms') {
			if ('action' in _DC_) _DC_.action.perform();
			var i1, i2, p1, p2;
			if (('item' in _DC_ && _DC_.item.map == 'atoms')) {
				i1 = _DC_.item.id;
				i2 = rnd.findItem(event, ['atoms'], _DC_.item);
			} else {
				i1 = this.atomProps;
				p1 = _DC_.xy0;
				i2 = rnd.findItem(event, ['atoms']);
			}
			var dist = Number.MAX_VALUE;
			if (i2 && i2.map == 'atoms') {
				i2 = i2.id;
			} else {
				i2 = this.atomProps;
				var xy1 = rnd.page2obj(event);
				dist = Vec2.dist(_DC_.xy0, xy1);
				if (p1) {
					p2 = this._calcNewAtomPos(p1, xy1);
				} else {
					p1 = this._calcNewAtomPos(rnd.atomGetPos(i1), xy1);
				}
			}
			// don't rotate the bond if the distance between the start and end point is too small
			if (dist > 0.3) {
				_DC_.action = Action.fromBondAddition(this.bondProps, i1, i2, p1, p2)[0];
			} else {
				delete _DC_.action;
			}
			rnd.update();
			return true;
		}
	}
	this._hoverHelper.hover(rnd.findItem(event, ['atoms', 'bonds']));
	return true;
};

BondTool.prototype.OnMouseUp = function (event) {
	if ('dragCtx' in this) {
		var _DC_ = this.dragCtx;
		var rnd = this.editor.render;
		var struct = rnd.ctab.molecule;
		if ('action' in _DC_) {
			ui.addUndoAction(_DC_.action);
		} else if (!('item' in _DC_)) {
			var xy = rnd.page2obj(event);
			var v = new Vec2(1.0 / 2, 0).rotate(
				this.bondProps.type == Bond.PATTERN.TYPE.SINGLE ? -Math.PI / 6 : 0
			);
			var bondAddition = Action.fromBondAddition(
				this.bondProps,
			{ label: 'C' },
			{ label: 'C' },
			{ x: xy.x - v.x, y: xy.y - v.y},
			{ x: xy.x + v.x, y: xy.y + v.y}
			);
			ui.addUndoAction(bondAddition[0]);
		} else if (_DC_.item.map == 'atoms') {
			ui.addUndoAction(Action.fromBondAddition(this.bondProps, _DC_.item.id)[0]);
		} else if (_DC_.item.map == 'bonds') {
			var bondProps = Object.clone(this.bondProps);
			var bond = struct.bonds.get(_DC_.item.id);

			if (
			bondProps.stereo != Bond.PATTERN.STEREO.NONE &&
			bond.type == Bond.PATTERN.TYPE.SINGLE &&
			bondProps.type == Bond.PATTERN.TYPE.SINGLE &&
			bond.stereo == bondProps.stereo
			) {
				ui.addUndoAction(Action.fromBondFlipping(_DC_.item.id));
			} else {
				if (
				bondProps.type === Bond.PATTERN.TYPE.SINGLE &&
				bond.stereo === Bond.PATTERN.STEREO.NONE &&
				bondProps.stereo === Bond.PATTERN.STEREO.NONE
				) {
					var loop = this.plainBondTypes.indexOf(bondProps.type) >= 0 ? this.plainBondTypes : null;
					if (loop) {
						bondProps.type = loop[(loop.indexOf(bond.type) + 1) % loop.length];
					}
				}
				ui.addUndoAction(
					Action.fromBondAttrs(_DC_.item.id, bondProps,
					                     bondFlipRequired(struct, bond, bondProps)), true);
			}
		}
		rnd.update();
		delete this.dragCtx;
	}
	return true;
};

function bondFlipRequired (struct, bond, attrs) {
	return attrs.type == Bond.PATTERN.TYPE.SINGLE &&
		   bond.stereo == Bond.PATTERN.STEREO.NONE &&
		   attrs.stereo != Bond.PATTERN.STEREO.NONE &&
		   struct.atoms.get(bond.begin).neighbors.length <
		   struct.atoms.get(bond.end).neighbors.length;
}


module.exports = BondTool;
