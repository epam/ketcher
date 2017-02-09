var Vec2 = require('../../util/vec2');
var Struct = require('../../chem/struct');
var Action = require('../action');
var HoverHelper = require('./helper/hover');
var EditorTool = require('./base');
var utils = require('./utils');

var ui = global.ui;

function BondTool(editor, bondProps) {
	if (!(this instanceof BondTool)) {
		// Action.fromBondAttrs(editor.selection().bonds, {
		// type: bondType(mode).type,
		// stereo: Bond.PATTERN.STEREO.NONE })
		editor.selection(null);
		return new BondTool(editor, bondProps);
	}

	this.editor = editor;
	this.atomProps = { label: 'C' };
	this.bondProps = bondProps;

	this.hoverHelper = new HoverHelper(this);
}
BondTool.prototype = new EditorTool();

BondTool.prototype.OnMouseDown = function (event) {
	var rnd = this.editor.render;
	this.hoverHelper.hover(null);
	this.dragCtx = {
		xy0: rnd.page2obj(event),
		item: this.editor.findItem(event, ['atoms', 'bonds'])
	};
	if (!this.dragCtx.item || this.dragCtx.item.type == 'Canvas') delete this.dragCtx.item;
	return true;
};

BondTool.prototype.OnMouseMove = function (event) { // eslint-disable-line max-statements
	var editor = this.editor;
	var rnd = editor.render;
	if ('dragCtx' in this) {
		var dragCtx = this.dragCtx;
		if (!('item' in dragCtx) || dragCtx.item.map == 'atoms') {
			if ('action' in dragCtx) dragCtx.action.perform();
			var i1, i2, p1, p2;
			if (('item' in dragCtx && dragCtx.item.map == 'atoms')) {
				// first mousedown event intersect with any atom
				i1 = dragCtx.item.id;
				i2 = editor.findItem(event, ['atoms'], dragCtx.item);
			} else {
				// first mousedown event intersect with any canvas
				i1 = this.atomProps;
				p1 = dragCtx.xy0;
				i2 = editor.findItem(event, ['atoms']);
			}
			var dist = Number.MAX_VALUE;
			if (i2 && i2.map == 'atoms') {
				// after mousedown events is appered, cursor is moved and then cursor intersects any atoms
				i2 = i2.id;
			} else {
				i2 = this.atomProps;
				var xy1 = rnd.page2obj(event);
				dist = Vec2.dist(dragCtx.xy0, xy1);
				if (p1) {
					// rotation only, leght of bond = 1;
					p2 = utils.calcNewAtomPos(p1, xy1);
				} else {
					// first mousedown event intersect with any atom and
					// rotation only, leght of bond = 1;
					var atom = rnd.ctab.molecule.atoms.get(i1);
					p1 = utils.calcNewAtomPos(atom.pp.get_xy0(), xy1);
				}
			}
			// don't rotate the bond if the distance between the start and end point is too small
			if (dist > 0.3)
				dragCtx.action = Action.fromBondAddition(this.bondProps, i1, i2, p1, p2)[0];
			else
				delete dragCtx.action;
			rnd.update();
			return true;
		}
	}
	this.hoverHelper.hover(this.editor.findItem(event, ['atoms', 'bonds']));
	return true;
};

BondTool.prototype.OnMouseUp = function (event) { // eslint-disable-line max-statements
	if ('dragCtx' in this) {
		var dragCtx = this.dragCtx;
		var rnd = this.editor.render;
		var struct = rnd.ctab.molecule;
		if ('action' in dragCtx) {
			ui.addUndoAction(dragCtx.action);
		} else if (!('item' in dragCtx)) {
			var xy = rnd.page2obj(event);
			var v = new Vec2(1.0 / 2, 0).rotate(
				this.bondProps.type == Struct.Bond.PATTERN.TYPE.SINGLE ? -Math.PI / 6 : 0
			);
			var bondAddition = Action.fromBondAddition(
				this.bondProps,
			{ label: 'C' },
			{ label: 'C' },
			Vec2.diff(xy, v),
			Vec2.sum(xy, v)
			);
			ui.addUndoAction(bondAddition[0]);
		} else if (dragCtx.item.map == 'atoms') {
			// when does it hapend?
			ui.addUndoAction(Action.fromBondAddition(this.bondProps, dragCtx.item.id)[0]);
		} else if (dragCtx.item.map == 'bonds') {
			var bondProps = Object.clone(this.bondProps);
			var bond = struct.bonds.get(dragCtx.item.id);

			if (
			bondProps.stereo != Struct.Bond.PATTERN.STEREO.NONE &&
			bond.type == Struct.Bond.PATTERN.TYPE.SINGLE &&
			bondProps.type == Struct.Bond.PATTERN.TYPE.SINGLE &&
			bond.stereo == bondProps.stereo
			) {
				ui.addUndoAction(Action.fromBondFlipping(dragCtx.item.id));
			} else {
				var loop = plainBondTypes.indexOf(bondProps.type) >= 0 ? plainBondTypes : null;
				if (
				bondProps.type === Struct.Bond.PATTERN.TYPE.SINGLE &&
				bond.stereo === Struct.Bond.PATTERN.STEREO.NONE &&
				bondProps.stereo === Struct.Bond.PATTERN.STEREO.NONE &&
				loop
				)
					bondProps.type = loop[(loop.indexOf(bond.type) + 1) % loop.length];

				ui.addUndoAction(
					Action.fromBondAttrs(dragCtx.item.id, bondProps,
					                     bondFlipRequired(struct, bond, bondProps)), true);
			}
		}
		rnd.update();
		delete this.dragCtx;
	}
	return true;
};

function bondFlipRequired(struct, bond, attrs) {
	return attrs.type == Struct.Bond.PATTERN.TYPE.SINGLE &&
		   bond.stereo == Struct.Bond.PATTERN.STEREO.NONE &&
		   attrs.stereo != Struct.Bond.PATTERN.STEREO.NONE &&
		   struct.atoms.get(bond.begin).neighbors.length <
		   struct.atoms.get(bond.end).neighbors.length;
}

var plainBondTypes = [
	Struct.Bond.PATTERN.TYPE.SINGLE,
	Struct.Bond.PATTERN.TYPE.DOUBLE,
	Struct.Bond.PATTERN.TYPE.TRIPLE
];

module.exports = BondTool;
