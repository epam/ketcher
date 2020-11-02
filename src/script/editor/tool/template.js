/****************************************************************************
 * Copyright 2018 EPAM Systems
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

import Vec2 from '../../util/vec2';
import utils from '../shared/utils';
import { fromTemplateOnCanvas, fromTemplateOnAtom, fromTemplateOnBondAction } from '../actions/template';
import { fromItemsFuse, getItemsToFuse, getHoverToFuse } from '../actions/closely-fusing';

function TemplateTool(editor, tmpl) { // eslint-disable-line max-statements
	if (!(this instanceof TemplateTool))
		return new TemplateTool(editor, tmpl);

	this.editor = editor;
	this.editor.selection(null);

	this.template = {
		aid: parseInt(tmpl.aid) || 0,
		bid: parseInt(tmpl.bid) || 0
	};

	const frag = tmpl.struct;
	frag.rescale();

	const xy0 = new Vec2();
	frag.atoms.forEach((atom) => {
		xy0.add_(atom.pp); // eslint-disable-line no-underscore-dangle
	});

	this.template.molecule = frag; // preloaded struct
	this.findItems = [];
	this.template.xy0 = xy0.scaled(1 / (frag.atoms.size || 1)); // template center

	const atom = frag.atoms.get(this.template.aid);
	if (atom) {
		this.template.angle0 = utils.calcAngle(atom.pp, this.template.xy0); // center tilt
		this.findItems.push('atoms');
	}

	const bond = frag.bonds.get(this.template.bid);
	if (bond) {
		// template location sign against attachment bond
		this.template.sign = getSign(frag, bond, this.template.xy0);
		this.findItems.push('bonds');
	}
}

TemplateTool.prototype.mousedown = function (event) { // eslint-disable-line max-statements
	const editor = this.editor;
	const restruct = editor.render.ctab;
	this.editor.hover(null);

	this.dragCtx = {
		xy0: editor.render.page2obj(event),
		item: editor.findItem(event, this.findItems)
	};

	const dragCtx = this.dragCtx;
	const ci = dragCtx.item;

	if (!ci) { //  ci.type == 'Canvas'
		delete dragCtx.item;
		return true;
	}

	if (ci.map === 'bonds') {
		// calculate fragment center
		const molecule = restruct.molecule;
		const xy0 = new Vec2();
		const bond = molecule.bonds.get(ci.id);
		const frid = molecule.atoms.get(bond.begin).fragment;
		const frIds = molecule.getFragmentIds(frid);
		let count = 0;

		let loop = molecule.halfBonds.get(bond.hb1).loop;

		if (loop < 0) loop = molecule.halfBonds.get(bond.hb2).loop;

		if (loop >= 0) {
			const loopHbs = molecule.loops.get(loop).hbs;
			loopHbs.forEach((hb) => {
				xy0.add_(molecule.atoms.get(molecule.halfBonds.get(hb).begin).pp); // eslint-disable-line no-underscore-dangle, max-len
				count++;
			});
		} else {
			frIds.forEach((id) => {
				xy0.add_(molecule.atoms.get(id).pp); // eslint-disable-line no-underscore-dangle
				count++;
			});
		}

		dragCtx.v0 = xy0.scaled(1 / count);

		const sign = getSign(molecule, bond, dragCtx.v0);

		// calculate default template flip
		dragCtx.sign1 = sign || 1;
		dragCtx.sign2 = this.template.sign;
	}

	return true;
};

TemplateTool.prototype.mousemove = function (event) { // eslint-disable-line max-statements
	const restruct = this.editor.render.ctab;

	if (!this.dragCtx) {
		this.editor.hover(this.editor.findItem(event, this.findItems));
		return true;
	}

	const dragCtx = this.dragCtx;
	const ci = dragCtx.item;
	let pos0 = null;
	const pos1 = this.editor.render.page2obj(event);
	const struct = restruct.molecule;

	/* moving when attached to bond */
	if (ci && ci.map === 'bonds') {
		const bond = struct.bonds.get(ci.id);
		let sign = getSign(struct, bond, pos1);

		if (dragCtx.sign1 * this.template.sign > 0)
			sign = -sign;

		if (sign !== dragCtx.sign2 || !dragCtx.action) {
			if (dragCtx.action)
				dragCtx.action.perform(restruct); // undo previous action

			dragCtx.sign2 = sign;
			[action, pasteItems] = fromTemplateOnBondAction(
				restruct,
				this.template,
				ci.id,
				this.editor.event,
				dragCtx.sign1 * dragCtx.sign2 > 0,
				false
			);

			dragCtx.action = action;
			this.editor.update(dragCtx.action, true);

			dragCtx.mergeItems = getItemsToFuse(this.editor, pasteItems);
			this.editor.hover(getHoverToFuse(dragCtx.mergeItems));
		}
		return true;
	}
	/* end */

	let extraBond = null;
	// calc initial pos and is extra bond needed
	if (!ci) { //  ci.type == 'Canvas'
		pos0 = dragCtx.xy0;
	} else if (ci.map === 'atoms') {
		pos0 = struct.atoms.get(ci.id).pp;
		extraBond = Vec2.dist(pos0, pos1) > 1;
	}

	// calc angle
	let angle = utils.calcAngle(pos0, pos1);
	if (!event.ctrlKey)
		angle = utils.fracAngle(angle);
	const degrees = utils.degrees(angle);
	this.editor.event.message.dispatch({ info: degrees + 'º' });

	// check if anything changed since last time
	if (dragCtx.hasOwnProperty('angle') && dragCtx.angle === degrees && // eslint-disable-line no-prototype-builtins
		(!dragCtx.hasOwnProperty('extra_bond') || dragCtx.extra_bond === extraBond)) // eslint-disable-line no-prototype-builtins
		return true;

	// undo previous action
	if (dragCtx.action)
		dragCtx.action.perform(restruct);

	// create new action
	dragCtx.angle = degrees;
	let action = null;
	let pasteItems;

	if (!ci) { // ci.type == 'Canvas'
		[action, pasteItems] = fromTemplateOnCanvas(
			restruct,
			this.template,
			pos0,
			angle
		);
	} else if (ci.map === 'atoms') {
		[action, pasteItems] = fromTemplateOnAtom(
			restruct,
			this.template,
			ci.id,
			angle,
			extraBond
		);
		dragCtx.extra_bond = extraBond;
	}
	dragCtx.action = action;

	this.editor.update(dragCtx.action, true);

	dragCtx.mergeItems = getItemsToFuse(this.editor, pasteItems);
	this.editor.hover(getHoverToFuse(dragCtx.mergeItems));

	return true;
};

TemplateTool.prototype.mouseup = function (event) { // eslint-disable-line max-statements
	const dragCtx = this.dragCtx;
	if (!dragCtx)
		return true;
	delete this.dragCtx;

	const restruct = this.editor.render.ctab;
	const struct = restruct.molecule;
	const ci = dragCtx.item;

	/* after moving around bond */
	if (dragCtx.action && ci && ci.map === 'bonds') {
		dragCtx.action.perform(restruct); // revert drag action
		fromTemplateOnBondAction(
			restruct,
			this.template,
			ci.id,
			this.editor.event,
			dragCtx.sign1 * dragCtx.sign2 > 0,
			true
		)
			.then(([action, pasteItems]) => {
				const mergeItems = getItemsToFuse(this.editor, pasteItems);
				action = fromItemsFuse(restruct, mergeItems).mergeWith(action);
				this.editor.update(action);
			});
		return true;
	}
	/* end */

	let action;
	let pasteItems = null;

	if (!dragCtx.action) {
		if (!ci) { //  ci.type == 'Canvas'
			[action, pasteItems] = fromTemplateOnCanvas(restruct, this.template, dragCtx.xy0, 0);
			dragCtx.action = action;
		} else if (ci.map === 'atoms') {
			const degree = restruct.atoms.get(ci.id).a.neighbors.length;
			let angle;
			let extraBond;

			if (degree > 1) { // common case
				angle = null;
				extraBond = true;
			} else if (degree === 1) { // on chain end
				const atom = struct.atoms.get(ci.id);
				const neiId = struct.halfBonds.get(atom.neighbors[0]).end;
				const nei = struct.atoms.get(neiId);

				angle = event.ctrlKey ?
					utils.calcAngle(nei.pp, atom.pp) :
					utils.fracAngle(utils.calcAngle(nei.pp, atom.pp));
				extraBond = false;
			} else { // on single atom
				angle = 0;
				extraBond = false;
			}

			[action, pasteItems] = fromTemplateOnAtom(
				restruct,
				this.template,
				ci.id,
				angle,
				extraBond
			);
			dragCtx.action = action;
		} else if (ci.map === 'bonds') {
			fromTemplateOnBondAction(
				restruct,
				this.template,
				ci.id,
				this.editor.event,
				dragCtx.sign1 * dragCtx.sign2 > 0,
				true
			)
				.then(([action, pasteItems]) => { // eslint-disable-line no-shadow
					const mergeItems = getItemsToFuse(this.editor, pasteItems);
					action = fromItemsFuse(restruct, mergeItems).mergeWith(action);
					this.editor.update(action);
				});

			return true;
		}
	}

	this.editor.selection(null);

	if (!dragCtx.mergeItems && pasteItems)
		dragCtx.mergeItems = getItemsToFuse(this.editor, pasteItems);
	dragCtx.action = dragCtx.action ?
		fromItemsFuse(restruct, dragCtx.mergeItems).mergeWith(dragCtx.action) :
		fromItemsFuse(restruct, dragCtx.mergeItems);

	this.editor.hover(null);
	const completeAction = dragCtx.action;
	if (completeAction && !completeAction.isDummy())
		this.editor.update(completeAction);
	this.editor.event.message.dispatch({
		info: false
	});

	return true;
};

TemplateTool.prototype.cancel = TemplateTool.prototype.mouseup;
TemplateTool.prototype.mouseleave = TemplateTool.prototype.mouseup;

function getSign(molecule, bond, v) {
	const begin = molecule.atoms.get(bond.begin).pp;
	const end = molecule.atoms.get(bond.end).pp;

	const sign = Vec2.cross(Vec2.diff(begin, end), Vec2.diff(v, end));

	if (sign > 0) return 1;
	if (sign < 0) return -1;
	return 0;
}

export default TemplateTool;
