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

/* eslint-disable guard-for-in,no-prototype-builtins */ // todo

// ReStruct is to store all the auxiliary information for
//  Struct while rendering
import Box2Abs from '../../util/box2abs';
import Pool from '../../util/pool';
import Pile from '../../util/pile';
import Vec2 from '../../util/vec2';

import util from '../util';

import Struct from '../../chem/struct';

import ReAtom from './reatom';
import ReBond from './rebond';
import ReRxnPlus from './rerxnplus';
import ReRxnArrow from './rerxnarrow';
import ReFrag from './refrag';
import ReRGroup from './rergroup';
import ReDataSGroupData from './redatasgroupdata';
import ReChiralFlag from './rechiralflag';
import ReSGroup from './resgroup';
import ReLoop from './reloop';

var LAYER_MAP = {
	background: 0,
	selectionPlate: 1,
	highlighting: 2,
	warnings: 3,
	data: 4,
	indices: 5
};

function ReStruct(molecule, render) { // eslint-disable-line max-statements
	this.render = render;
	this.atoms = new Pool();
	this.bonds = new Pool();
	this.reloops = new Pool();
	this.rxnPluses = new Pool();
	this.rxnArrows = new Pool();
	this.frags = new Pool();
	this.rgroups = new Pool();
	this.sgroups = new Pool();
	this.sgroupData = new Pool();
	this.chiralFlags = new Pool();
	this.molecule = molecule || new Struct();
	this.initialized = false;
	this.layers = [];
	this.initLayers();

	this.connectedComponents = new Pool();
	this.ccFragmentType = new Pool();

	this.clearMarks();

	this.structChanged = false;

	// TODO: eachItem ?

	molecule.atoms.forEach((atom, aid) => { this.atoms.set(aid, new ReAtom(atom)); });

	molecule.bonds.forEach((bond, bid) => { this.bonds.set(bid, new ReBond(bond)); });

	molecule.loops.forEach((loop, lid) => { this.reloops.set(lid, new ReLoop(loop)); });

	molecule.rxnPluses.forEach((item, id) => { this.rxnPluses.set(id, new ReRxnPlus(item)); });

	molecule.rxnArrows.forEach((item, id) => { this.rxnArrows.set(id, new ReRxnArrow(item)); });

	molecule.frags.forEach((item, id) => { this.frags.set(id, new ReFrag(item)); });

	molecule.rgroups.forEach((item, id) => { this.rgroups.set(id, new ReRGroup(item)); });

	molecule.sgroups.forEach((item, id) => {
		this.sgroups.set(id, new ReSGroup(item));
		if (item.type === 'DAT' && !item.data.attached)
			this.sgroupData.set(id, new ReDataSGroupData(item)); // [MK] sort of a hack, we use the SGroup id for the data field id
	});

	if (molecule.isChiral) {
		var bb = molecule.getCoordBoundingBox();
		this.chiralFlags.set(0, new ReChiralFlag(new Vec2(bb.max.x, bb.min.y - 1)));
	}
}

/**
 * @param aid { number }
 * @param atom { Atom }
 */
ReStruct.prototype.connectedComponentRemoveAtom = function (aid, atom = null) {
	atom = atom || this.atoms.get(aid);
	if (atom.component < 0)
		return;
	var cc = this.connectedComponents.get(atom.component);

	cc.delete(aid);
	if (cc.size < 1)
		this.connectedComponents.delete(atom.component);

	atom.component = -1;
};

ReStruct.prototype.clearConnectedComponents = function () {
	this.connectedComponents.clear();
	this.atoms.forEach((atom) => { atom.component = -1; });
};

/**
 * @param aid { Array<number>|number }
 * @param adjacentComponents { Pile }
 * @returns { Pile }
 */
ReStruct.prototype.getConnectedComponent = function (aid, adjacentComponents) {
	const list = Array.isArray(aid) ? Array.from(aid) : [aid];
	const ids = new Pile();

	while (list.length > 0) {
		const aid = list.pop();
		ids.add(aid);
		const atom = this.atoms.get(aid);

		if (atom.component >= 0)
			adjacentComponents.add(atom.component);

		atom.a.neighbors.forEach((neighbor) => {
			const neiId = this.molecule.halfBonds.get(neighbor).end;
			if (!ids.has(neiId))
				list.push(neiId);
		});
	}

	return ids;
};

/**
 * @param idSet { Pile<number> }
 * @returns { number }
 */
ReStruct.prototype.addConnectedComponent = function (idSet) {
	const compId = this.connectedComponents.add(idSet);
	const adjacentComponents = new Pile();
	const aidSet = this.getConnectedComponent(Array.from(idSet), adjacentComponents);

	adjacentComponents.delete(compId);

	let type = -1;
	aidSet.forEach((aid) => {
		const atom = this.atoms.get(aid);
		atom.component = compId;
		if (atom.a.rxnFragmentType !== -1)
			type = atom.a.rxnFragmentType;
	});

	this.ccFragmentType.set(compId, type);
	return compId;
};

/**
 * @param ccid { number }
 * @returns { number }
 */
ReStruct.prototype.removeConnectedComponent = function (ccid) {
	this.connectedComponents.get(ccid).forEach((aid) => {
		this.atoms.get(aid).component = -1;
	});

	return this.connectedComponents.delete(ccid);
};

ReStruct.prototype.assignConnectedComponents = function () {
	this.atoms.forEach((atom, aid) => {
		if (atom.component >= 0)
			return;

		const adjacentComponents = new Pile();
		const idSet = this.getConnectedComponent(aid, adjacentComponents);
		adjacentComponents.forEach((ccid) => {
			this.removeConnectedComponent(ccid);
		});

		this.addConnectedComponent(idSet);
	});
};

ReStruct.prototype.initLayers = function () {
	for (const group in LAYER_MAP) {
		this.layers[LAYER_MAP[group]] =
			this.render.paper.rect(0, 0, 10, 10)
				.attr({
					class: group + 'Layer',
					fill: '#000',
					opacity: '0.0'
				})
				.toFront();
	}
};

ReStruct.prototype.addReObjectPath = function (group, visel, path, pos, visible) { // eslint-disable-line max-params
	if (!path || !this.layers[LAYER_MAP[group]].node.parentNode)
		return;

	const offset = this.render.options.offset;
	let bb = visible ? Box2Abs.fromRelBox(util.relBox(path.getBBox())) : null;
	const ext = pos && bb ? bb.translate(pos.negated()) : null;
	if (offset !== null) {
		path.translateAbs(offset.x, offset.y);
		bb = bb ? bb.translate(offset) : null;
	}
	visel.add(path, bb, ext);
	path.insertBefore(this.layers[LAYER_MAP[group]]);
};

ReStruct.prototype.clearMarks = function () {
	Object.keys(ReStruct.maps).forEach((map) => {
		this[map + 'Changed'] = new Map();
	});

	this.structChanged = false;
};

ReStruct.prototype.markItemRemoved = function () {
	this.structChanged = true;
};

ReStruct.prototype.markBond = function (bid, mark) {
	this.markItem('bonds', bid, mark);
};

ReStruct.prototype.markAtom = function (aid, mark) {
	this.markItem('atoms', aid, mark);
};

ReStruct.prototype.markItem = function (map, id, mark) {
	const mapChanged = this[map + 'Changed'];

	const value = mapChanged.has(id) ?
		Math.max(mark, mapChanged.get(id)) :
		mark;

	mapChanged.set(id, value);

	if (this[map].has(id))
		this.clearVisel(this[map].get(id).visel);
};

ReStruct.prototype.clearVisel = function (visel) {
	visel.paths.forEach((path) => {
		path.remove();
	});
	visel.clear();
};

ReStruct.prototype.eachItem = function (func) {
	Object.keys(ReStruct.maps).forEach((map) => {
		this[map].forEach(func);
	});
};

ReStruct.prototype.getVBoxObj = function (selection) {
	selection = selection || {};

	if (isSelectionEmpty(selection)) {
		Object.keys(ReStruct.maps).forEach((map) => {
			selection[map] = Array.from(this[map].keys());
		});
	}

	let vbox = null;
	Object.keys(ReStruct.maps).forEach((map) => {
		if (!selection[map])
			return;

		selection[map].forEach((id) => {
			const box = this[map].get(id).getVBoxObj(this.render);
			if (box)
				vbox = vbox ? Box2Abs.union(vbox, box) : box.clone();
		});
	});

	vbox = vbox || new Box2Abs(0, 0, 0, 0);
	return vbox;
};

function isSelectionEmpty(selection) {
	if (!selection)
		return true;

	const anySelection = Object.keys(ReStruct.maps)
		.some(map => selection[map] && selection[map].length > 0);

	return !anySelection;
}

ReStruct.prototype.translate = function (d) {
	this.eachItem(item => item.visel.translate(d));
};

ReStruct.prototype.scale = function (s) {
	// NOTE: bounding boxes are not valid after scaling
	this.eachItem(item => scaleVisel(item.visel, s));
};

function scaleRPath(path, s) {
	if (path.type == 'set') { // TODO: rework scaling
		for (var i = 0; i < path.length; ++i)
			scaleRPath(path[i], s);
	} else {
		if (!(typeof path.attrs === 'undefined')) {
			if ('font-size' in path.attrs)
				path.attr('font-size', path.attrs['font-size'] * s);
			else if ('stroke-width' in path.attrs)
				path.attr('stroke-width', path.attrs['stroke-width'] * s);
		}
		path.scale(s, s, 0, 0);
	}
}

function scaleVisel(visel, s) {
	for (let i = 0; i < visel.paths.length; ++i)
		scaleRPath(visel.paths[i], s);
}

ReStruct.prototype.clearVisels = function () {
	this.eachItem(item => this.clearVisel(item.visel));
};

ReStruct.prototype.update = function (force) { // eslint-disable-line max-statements
	force = force || !this.initialized;

	// check items to update
	Object.keys(ReStruct.maps).forEach((map) => {
		const mapChanged = this[map + 'Changed'];

		if (force) {
			this[map].forEach((item, id) => mapChanged.set(id, 1));
		} else {
			// check if some of the items marked are already gone
			mapChanged.forEach((value, id) => {
				if (!this[map].has(id))
					mapChanged.delete(id);
			});
		}
	});

	this.atomsChanged.forEach((value, aid) => this.connectedComponentRemoveAtom(aid));

	// clean up empty fragments
	// TODO: fragment removal should be triggered by the action responsible for the fragment contents removal and form an operation of its own
	const emptyFrags = this.frags
		.filter((fid, frag) => !frag.calcBBox(this.render.ctab, fid, this.render));

	emptyFrags.forEach((frag, fid) => {
		this.clearVisel(frag.visel);
		this.frags.delete(fid);
		this.molecule.frags.delete(fid);
	});

	Object.keys(ReStruct.maps).forEach((map) => {
		const mapChanged = this[map + 'Changed'];

		mapChanged.forEach((value, id) => {
			this.clearVisel(this[map].get(id).visel);
			this.structChanged |= mapChanged.get(id) > 0;
		});
	});

	// TODO: when to update sgroup?
	this.sgroups.forEach((sgroup) => {
		this.clearVisel(sgroup.visel);
		sgroup.highlighting = null;
		sgroup.selectionPlate = null;
	});

	// TODO [RB] need to implement update-on-demand for fragments and r-groups
	this.frags.forEach((frag) => {
		this.clearVisel(frag.visel);
	});

	this.rgroups.forEach((rgroup) => {
		this.clearVisel(rgroup.visel);
	});

	if (force) { // clear and recreate all half-bonds
		this.clearConnectedComponents();
		this.molecule.initHalfBonds();
		this.molecule.initNeighbors();
	}

	// only update half-bonds adjacent to atoms that have moved
	const atomsChangedArray = Array.from(this.atomsChanged.keys());
	this.molecule.updateHalfBonds(atomsChangedArray);
	this.molecule.sortNeighbors(atomsChangedArray);

	this.assignConnectedComponents();
	this.initialized = true;

	this.verifyLoops();
	const updLoops = force || this.structChanged;
	if (updLoops)
		this.updateLoops();
	this.setImplicitHydrogen();
	this.showLabels();
	this.showBonds();
	if (updLoops)
		this.showLoops();
	this.showReactionSymbols();
	this.showSGroups();

	this.showFragments();
	this.showRGroups();
	this.showChiralFlags();
	this.clearMarks();
	return true;
};

ReStruct.prototype.updateLoops = function () {
	this.reloops.forEach((reloop) => {
		this.clearVisel(reloop.visel);
	});
	const ret = this.molecule.findLoops();
	ret.bondsToMark.forEach((bid) => {
		this.markBond(bid, 1);
	});
	ret.newLoops.forEach((loopId) => {
		this.reloops.set(loopId, new ReLoop(this.molecule.loops.get(loopId)));
	});
};

ReStruct.prototype.showLoops = function () {
	const options = this.render.options;
	this.reloops.forEach((reloop, rlid) => {
		reloop.show(this, rlid, options);
	});
};

ReStruct.prototype.showReactionSymbols = function () {
	const options = this.render.options;

	this.rxnArrowsChanged.forEach((value, id) => {
		const arrow = this.rxnArrows.get(id);
		arrow.show(this, id, options);
	});

	this.rxnPlusesChanged.forEach((value, id) => {
		const plus = this.rxnPluses.get(id);
		plus.show(this, id, options);
	});
};

ReStruct.prototype.showSGroups = function () {
	const options = this.render.options;

	this.molecule.sGroupForest.getSGroupsBFS().reverse().forEach((id) => {
		const resgroup = this.sgroups.get(id);
		resgroup.show(this, id, options);
	});
};

ReStruct.prototype.showFragments = function () {
	this.frags.forEach((frag, id) => {
		const path = frag.draw(this.render, id);
		if (path)
			this.addReObjectPath('data', frag.visel, path, null, true);
		// TODO fragment selection & highlighting
	});
};

ReStruct.prototype.showRGroups = function () {
	const options = this.render.options;
	this.rgroups.forEach((rgroup, id) => {
		rgroup.show(this, id, options);
	});
};

ReStruct.prototype.setImplicitHydrogen = function () {
	// calculate implicit hydrogens for atoms that have been modified
	this.molecule.setImplicitHydrogen(Array.from(this.atomsChanged.keys()));
};

ReStruct.prototype.loopRemove = function (loopId) {
	if (!this.reloops.has(loopId))
		return;

	const reloop = this.reloops.get(loopId);
	this.clearVisel(reloop.visel);

	const bondlist = [];

	reloop.loop.hbs.forEach((hbid) => {
		if (!this.molecule.halfBonds.has(hbid))
			return;

		const hb = this.molecule.halfBonds.get(hbid);
		hb.loop = -1;
		this.markBond(hb.bid, 1);
		this.markAtom(hb.begin, 1);
		bondlist.push(hb.bid);
	});

	this.reloops.delete(loopId);
	this.molecule.loops.delete(loopId);
};

ReStruct.prototype.verifyLoops = function () {
	this.reloops.forEach((reloop, rlid) => {
		if (!reloop.isValid(this.molecule, rlid))
			this.loopRemove(rlid);
	});
};

ReStruct.prototype.showLabels = function () { // eslint-disable-line max-statements
	const options = this.render.options;

	this.atomsChanged.forEach((value, aid) => {
		const atom = this.atoms.get(aid);
		atom.show(this, aid, options);
	});
};

ReStruct.prototype.showChiralFlags = function () { // eslint-disable-line max-statements
	const options = this.render.options;

	if (this.render.options.hideChiralFlag !== true) {
		this.chiralFlagsChanged.forEach((value, chid) => {
			const flag = this.chiralFlags.get(chid);
			flag.show(this, chid, options);
		});
	}
};

ReStruct.prototype.showBonds = function () { // eslint-disable-line max-statements
	const options = this.render.options;

	this.bondsChanged.forEach((value, bid) => {
		const bond = this.bonds.get(bid);
		bond.show(this, bid, options);
	});
};

ReStruct.prototype.setSelection = function (selection) {
	const redraw = arguments.length === 0; // render.update only

	Object.keys(ReStruct.maps).forEach((map) => {
		if (ReStruct.maps[map].isSelectable()) {
			this[map].forEach((item, id) => {
				const selected = redraw ?
					item.selected :
					selection && selection[map] && selection[map].indexOf(id) > -1;

				this.showItemSelection(item, selected);
			});
		}
	});
};

ReStruct.prototype.showItemSelection = function (item, selected) {
	var exists = item.selectionPlate !== null && !item.selectionPlate.removed;
	// TODO: simplify me, who sets `removed`?
	item.selected = selected;
	if (item instanceof ReDataSGroupData) item.sgroup.selected = selected;
	if (selected) {
		if (!exists) {
			var render = this.render;
			var options = render.options;
			var paper = render.paper;

			item.selectionPlate = item.makeSelectionPlate(this, paper, options);
			this.addReObjectPath('selectionPlate', item.visel, item.selectionPlate);
		}
		if (item.selectionPlate)
			item.selectionPlate.show(); // TODO [RB] review
	} else if (exists && item.selectionPlate) {
		item.selectionPlate.hide(); // TODO [RB] review
	}
};

ReStruct.maps = {
	atoms: ReAtom,
	bonds: ReBond,
	rxnPluses: ReRxnPlus,
	rxnArrows: ReRxnArrow,
	frags: ReFrag,
	rgroups: ReRGroup,
	sgroupData: ReDataSGroupData,
	chiralFlags: ReChiralFlag,
	sgroups: ReSGroup,
	reloops: ReLoop
};

export default ReStruct;
export {
	ReAtom,
	ReBond,
	ReRxnPlus,
	ReRxnArrow,
	ReFrag,
	ReRGroup,
	ReChiralFlag,
	ReSGroup
};
