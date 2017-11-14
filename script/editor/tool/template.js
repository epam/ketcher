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

import Set from '../../util/set';
import Vec2 from '../../util/vec2';
import * as Actions from '../actions';
import utils from '../shared/utils';

function TemplateTool(editor, tmpl) { // eslint-disable-line max-statements
	if (!(this instanceof TemplateTool))
		return new TemplateTool(editor, tmpl);

	this.editor = editor;
	this.editor.selection(null);
	this.template = {
		aid: parseInt(tmpl.aid) || 0,
		bid: parseInt(tmpl.bid) || 0
	};

	var frag = tmpl.struct;
	frag.rescale();

	var xy0 = new Vec2();
	frag.atoms.each(function (aid, atom) {
		xy0.add_(atom.pp); // eslint-disable-line no-underscore-dangle
	});

	this.template.molecule = frag; // preloaded struct
	this.findItems = [];
	this.template.xy0 = xy0.scaled(1 / (frag.atoms.count() || 1)); // template center

	const atom = frag.atoms.get(this.template.aid);
	if (atom) {
		this.template.angle0 = utils.calcAngle(atom.pp, this.template.xy0); // center tilt
		this.findItems.push('atoms');
	}

	const bond = frag.bonds.get(this.template.bid);
	if (bond) {
		this.template.sign = getSign(frag, bond, this.template.xy0); // template location sign against attachment bond
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
			loopHbs.forEach(function (hb) {
				xy0.add_(molecule.atoms.get(molecule.halfBonds.get(hb).begin).pp); // eslint-disable-line no-underscore-dangle
				count++;
			});
		} else {
			Set.each(frIds, function (id) {
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
	if (this.dragCtx) {
		const dragCtx = this.dragCtx;
		const ci = dragCtx.item;
		let pos0;
		let pos1 = this.editor.render.page2obj(event);
		let angle;
		let extraBond;

		dragCtx.mouse_moved = true;

		const struct = restruct.molecule;
		// calc initial pos and is extra bond needed
		if (!ci) { //  ci.type == 'Canvas'
			pos0 = dragCtx.xy0;
		} else if (ci.map === 'atoms') {
			pos0 = struct.atoms.get(ci.id).pp;
			extraBond = Vec2.dist(pos0, pos1) > 1;
		} else if (ci.map === 'bonds') {
			const bond = struct.bonds.get(ci.id);
			let sign = getSign(struct, bond, pos1);

			if (dragCtx.sign1 * this.template.sign > 0)
				sign = -sign;
			if (sign !== dragCtx.sign2 || !dragCtx.action) {
				if ('action' in dragCtx)
					dragCtx.action.perform(restruct); // undo previous action
				dragCtx.sign2 = sign;
				dragCtx.action = Actions.fromTemplateOnBondAction(
					restruct, this.editor.event,
					ci.id, this.template,
					dragCtx.sign1 * dragCtx.sign2 > 0, false
				);
				this.editor.update(dragCtx.action, true);
			}
			return true;
		}

		angle = utils.calcAngle(pos0, pos1);
		if (!event.ctrlKey)
			angle = utils.fracAngle(angle);

		const degrees = utils.degrees(angle);
		// check if anything changed since last time
		if (dragCtx.hasOwnProperty('angle') && dragCtx.angle === degrees &&
			(!dragCtx.hasOwnProperty('extra_bond') || dragCtx.extra_bond === extraBond))
			return true;

		// undo previous action
		if (dragCtx.action)
			dragCtx.action.perform(restruct);
		// create new action
		dragCtx.angle = degrees;
		if (!ci) { // ci.type == 'Canvas'
			dragCtx.action = Actions.fromTemplateOnCanvas(
				restruct,
				pos0,
				angle,
				this.template
			);
		} else if (ci.map === 'atoms') {
			dragCtx.action = Actions.fromTemplateOnAtom(
				restruct,
				ci.id,
				angle,
				extraBond,
				this.template
			);
			dragCtx.extra_bond = extraBond;
		}
		this.editor.update(dragCtx.action, true);
		return true;
	}
	this.editor.hover(this.editor.findItem(event, this.findItems));
	return true;
};

TemplateTool.prototype.mouseup = function (event) { // eslint-disable-line max-statements
	if (!this.dragCtx) return true;

	const dragCtx = this.dragCtx;
	const ci = dragCtx.item;
	const restruct = this.editor.render.ctab;
	const struct = restruct.molecule;

	if (!dragCtx.action) {
		if (!ci) { //  ci.type == 'Canvas'
			dragCtx.action = Actions.fromTemplateOnCanvas(restruct, dragCtx.xy0, 0, this.template);
		} else if (ci.map === 'atoms') {
			const degree = restruct.atoms.get(ci.id).a.neighbors.length;

			if (degree > 1) { // common case
				dragCtx.action = Actions.fromTemplateOnAtom(
					restruct,
					ci.id,
					null,
					true,
					this.template
				);
			} else if (degree === 1) { // on chain end
				const neiId = struct.halfBonds.get(struct.atoms.get(ci.id).neighbors[0]).end;
				const atom = struct.atoms.get(ci.id);
				const nei = struct.atoms.get(neiId);
				const angle = utils.calcAngle(nei.pp, atom.pp);

				dragCtx.action = Actions.fromTemplateOnAtom(
					restruct,
					ci.id,
					event.ctrlKey ? angle : utils.fracAngle(angle),
					false,
					this.template
				);
			} else { // on single atom
				dragCtx.action = Actions.fromTemplateOnAtom(
					restruct,
					ci.id,
					0,
					false,
					this.template
				);
			}
		} else if (ci.map === 'bonds') {
			Actions.fromTemplateOnBondAction(
				restruct, this.editor.event,
				ci.id, this.template,
				dragCtx.sign1 * dragCtx.sign2 > 0, true
			)
				.then(action => {
					this.editor.update(action);
					delete this.dragCtx;
				});

			return true;
		}
	}

	if (dragCtx.action && ci && ci.map === 'bonds') {
		this.dragCtx.action.perform(restruct); // revert drag action
		Actions.fromTemplateOnBondAction(
			restruct, this.editor.event,
			ci.id, this.template,
			dragCtx.sign1 * dragCtx.sign2 > 0, true
		)
			.then(action => {
				this.editor.update(action);
				delete this.dragCtx;
			});
		return true;
	}

	const action = this.dragCtx.action;
	delete this.dragCtx;

	if (action && !action.isDummy())
		this.editor.update(action);
};

TemplateTool.prototype.cancel = TemplateTool.prototype.mouseleave =
	TemplateTool.prototype.mouseup;

function getSign(molecule, bond, v) {
	const begin = molecule.atoms.get(bond.begin).pp;
	const end = molecule.atoms.get(bond.end).pp;

	const sign = Vec2.cross(Vec2.diff(begin, end), Vec2.diff(v, end));

	if (sign > 0) return 1;
	if (sign < 0) return -1;
	return 0;
}

export default TemplateTool;
