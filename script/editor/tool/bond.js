/****************************************************************************
 * Copyright 2017 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

var Vec2 = require('../../util/vec2');
var Struct = require('../../chem/struct');
var Actions = require('../actions');
var utils = require('./utils');

function BondTool(editor, bondProps) {
	if (!(this instanceof BondTool)) {
		// Actions.fromBondAttrs(editor.render.ctab,
		// editor.selection().bonds, {
		// type: bondType(mode).type,
		// stereo: Bond.PATTERN.STEREO.NONE })
		editor.selection(null);
		return new BondTool(editor, bondProps);
	}

	this.editor = editor;
	this.atomProps = { label: 'C' };
	this.bondProps = bondProps;
}

BondTool.prototype.mousedown = function (event) {
	var rnd = this.editor.render;
	this.editor.hover(null);
	this.dragCtx = {
		xy0: rnd.page2obj(event),
		item: this.editor.findItem(event, ['atoms', 'bonds'])
	};
	if (!this.dragCtx.item) // ci.type == 'Canvas'
		delete this.dragCtx.item;
	return true;
};

BondTool.prototype.mousemove = function (event) { // eslint-disable-line max-statements
	var editor = this.editor;
	var rnd = editor.render;
	if ('dragCtx' in this) {
		var dragCtx = this.dragCtx;
		if (!('item' in dragCtx) || dragCtx.item.map === 'atoms') {
			if ('action' in dragCtx)
				dragCtx.action.perform(rnd.ctab);
			var i1, i2, p1, p2;
			if (('item' in dragCtx && dragCtx.item.map === 'atoms')) {
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
			if (i2 && i2.map === 'atoms') {
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
				dragCtx.action = Actions.fromBondAddition(rnd.ctab, this.bondProps, i1, i2, p1, p2)[0];
			else
				delete dragCtx.action;
			this.editor.update(dragCtx.action, true);
			return true;
		}
	}
	this.editor.hover(this.editor.findItem(event, ['atoms', 'bonds']));
	return true;
};

BondTool.prototype.mouseup = function (event) { // eslint-disable-line max-statements
	if ('dragCtx' in this) {
		var dragCtx = this.dragCtx;
		var rnd = this.editor.render;
		var struct = rnd.ctab.molecule;
		if ('action' in dragCtx) {
			this.editor.update(dragCtx.action);
		} else if (!('item' in dragCtx)) {
			var xy = rnd.page2obj(event);
			var v = new Vec2(1.0 / 2, 0).rotate(
				this.bondProps.type == Struct.Bond.PATTERN.TYPE.SINGLE ? -Math.PI / 6 : 0
			);
			var bondAddition = Actions.fromBondAddition(rnd.ctab,
				this.bondProps, { label: 'C' }, { label: 'C' },
			    Vec2.diff(xy, v), Vec2.sum(xy, v));

			this.editor.update(bondAddition[0]);
		} else if (dragCtx.item.map === 'atoms') {
			// when does it hapend?
			this.editor.update(Actions.fromBondAddition(rnd.ctab, this.bondProps, dragCtx.item.id)[0]);
		} else if (dragCtx.item.map === 'bonds') {
			var bondProps = Object.assign({}, this.bondProps);
			var bond = struct.bonds.get(dragCtx.item.id);

			this.editor.update(bondChangingAction(rnd.ctab, dragCtx.item.id, bond, bondProps));
		}
		delete this.dragCtx;
	}
	return true;
};

/**
 * @param itemID - bond id in structure
 * @param bond - bond for change
 * @param bondProps - bondTool properties
 * @returns Action
 */
function bondChangingAction(restruct, itemID, bond, bondProps) {
	if (bondProps.stereo !== Struct.Bond.PATTERN.STEREO.NONE && //
		bondProps.type === Struct.Bond.PATTERN.TYPE.SINGLE &&
		bond.type === bondProps.type && bond.stereo === bondProps.stereo)
	// if bondTool is stereo and equal to bond for change
		return Actions.fromBondFlipping(restruct, itemID);

	var loop = plainBondTypes.indexOf(bondProps.type) >= 0 ? plainBondTypes : null;
	if (bondProps.stereo === Struct.Bond.PATTERN.STEREO.NONE &&
		bondProps.type === Struct.Bond.PATTERN.TYPE.SINGLE &&
		bond.stereo === Struct.Bond.PATTERN.STEREO.NONE &&
		loop)
	// if `Single bond` tool is chosen and bond for change in `plainBondTypes`
		bondProps.type = loop[(loop.indexOf(bond.type) + 1) % loop.length];

	return Actions.fromBondAttrs(restruct, itemID, bondProps,
		bondFlipRequired(restruct.molecule, bond, bondProps));
}

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

module.exports = Object.assign(BondTool, {
	bondChangingAction: bondChangingAction
});
