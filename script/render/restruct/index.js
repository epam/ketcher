// ReStruct is to store all the auxiliary information for
//  Struct while rendering
var Box2Abs = require('../../util/box2abs');
var Map = require('../../util/map');
var Pool = require('../../util/pool');
var Set = require('../../util/set');
var Vec2 = require('../../util/vec2');
var util = require('../../util');
var element = require('../../chem/element');
var Struct = require('../../chem/struct');

var draw = require('../draw');

var ReAtom = require('./reatom');
var ReBond = require('./rebond');
var ReRxnPlus = require('./rerxnplus');
var ReRxnArrow = require('./rerxnarrow');
var ReFrag = require('./refrag');
var ReRGroup = require('./rergroup');
var ReDataSGroupData = require('./redatasgroupdata');
var ReChiralFlag = require('./rechiralflag');
var ReSGroup = require('./resgroup');
var ReLoop = require('./reloop');

var tfx = util.tfx;

var LAYER_MAP = {
	background: 0,
	selectionPlate: 1,
	highlighting: 2,
	warnings: 3,
	data: 4,
	indices: 5
};

function ReStruct(molecule, render, norescale) { // eslint-disable-line max-statements
	this.render = render;
	this.atoms = new Map();
	this.bonds = new Map();
	this.reloops = new Map();
	this.rxnPluses = new Map();
	this.rxnArrows = new Map();
	this.frags = new Map();
	this.rgroups = new Map();
	this.sgroups = new Map();
	this.sgroupData = new Map();
	this.chiralFlags = new Map();
	this.molecule = molecule || new Struct();
	this.initialized = false;
	this.layers = [];
	this.initLayers();

	this.connectedComponents = new Pool();
	this.ccFragmentType = new Map();

	for (var map in ReStruct.maps)
		this[map + 'Changed'] = {};
	this.structChanged = false;

	// TODO: eachItem ?
	molecule.atoms.each(function (aid, atom) {
		this.atoms.set(aid, new ReAtom(atom));
	}, this);

	molecule.bonds.each(function (bid, bond) {
		this.bonds.set(bid, new ReBond(bond));
	}, this);

	molecule.loops.each(function (lid, loop) {
		this.reloops.set(lid, new ReLoop(loop));
	}, this);

	molecule.rxnPluses.each(function (id, item) {
		this.rxnPluses.set(id, new ReRxnPlus(item));
	}, this);

	molecule.rxnArrows.each(function (id, item) {
		this.rxnArrows.set(id, new ReRxnArrow(item));
	}, this);

	molecule.frags.each(function (id, item) {
		this.frags.set(id, new ReFrag(item));
	}, this);

	molecule.rgroups.each(function (id, item) {
		this.rgroups.set(id, new ReRGroup(item));
	}, this);

	molecule.sgroups.each(function (id, item) {
		this.sgroups.set(id, new ReSGroup(item));
		if (item.type == 'DAT' && !item.data.attached)
			this.sgroupData.set(id, new ReDataSGroupData(item)); // [MK] sort of a hack, we use the SGroup id for the data field id
	}, this);

	if (molecule.isChiral && !this.render.options.hideChiralFlag) {
		var bb = molecule.getCoordBoundingBox();
		this.chiralFlags.set(0, new ReChiralFlag(new Vec2(bb.max.x, bb.min.y - 1)));
	}

	if (!norescale)
		this.molecule.rescale();
}

ReStruct.prototype.connectedComponentRemoveAtom = function (aid, atom) {
	atom = atom || this.atoms.get(aid);
	if (atom.component < 0)
		return;
	var cc = this.connectedComponents.get(atom.component);
	Set.remove(cc, aid);
	if (Set.size(cc) < 1)
		this.connectedComponents.remove(atom.component);

	atom.component = -1;
};

ReStruct.prototype.clearConnectedComponents = function () {
	this.connectedComponents.clear();
	this.atoms.each(function (aid, atom) {
		atom.component = -1;
	});
};

ReStruct.prototype.getConnectedComponent = function (aid, adjacentComponents) {
	var list = (typeof (aid['length']) == 'number') ? [].slice.call(aid) : [aid];
	var ids = Set.empty();

	while (list.length > 0) {
		(function () {
			var aid = list.pop();
			Set.add(ids, aid);
			var atom = this.atoms.get(aid);
			if (atom.component >= 0)
				Set.add(adjacentComponents, atom.component);
			for (var i = 0; i < atom.a.neighbors.length; ++i) {
				var neiId = this.molecule.halfBonds.get(atom.a.neighbors[i]).end;
				if (!Set.contains(ids, neiId))
					list.push(neiId);
			}
		}).apply(this);
	}

	return ids;
};

ReStruct.prototype.addConnectedComponent = function (ids) {
	var compId = this.connectedComponents.add(ids);
	var adjacentComponents = Set.empty();
	var atomIds = this.getConnectedComponent(Set.list(ids), adjacentComponents);
	Set.remove(adjacentComponents, compId);
	var type = -1;
	Set.each(atomIds, function (aid) {
		var atom = this.atoms.get(aid);
		atom.component = compId;
		if (atom.a.rxnFragmentType != -1) {
			if (type != -1 && atom.a.rxnFragmentType != type)
				throw new Error('reaction fragment type mismatch');
			type = atom.a.rxnFragmentType;
		}
	}, this);

	this.ccFragmentType.set(compId, type);
	return compId;
};

ReStruct.prototype.removeConnectedComponent = function (ccid) {
	Set.each(this.connectedComponents.get(ccid), function (aid) {
		this.atoms.get(aid).component = -1;
	}, this);
	return this.connectedComponents.remove(ccid);
};

ReStruct.prototype.connectedComponentMergeIn = function (ccid, set) {
	Set.each(set, function (aid) {
		this.atoms.get(aid).component = ccid;
	}, this);
	Set.mergeIn(this.connectedComponents.get(ccid), set);
};

ReStruct.prototype.assignConnectedComponents = function () {
	this.atoms.each(function (aid, atom) {
		if (atom.component >= 0)
			return;
		var adjacentComponents = Set.empty();
		var ids = this.getConnectedComponent(aid, adjacentComponents);
		Set.each(adjacentComponents, function (ccid) {
			this.removeConnectedComponent(ccid);
		}, this);
		this.addConnectedComponent(ids);
	}, this);
};

ReStruct.prototype.connectedComponentGetBoundingBox = function (ccid, cc, bb) {
	cc = cc || this.connectedComponents.get(ccid);
	bb = bb || { min: null, max: null };
	Set.each(cc, function (aid) {
		var ps = this.render.ps(this.atoms.get(aid).a.pp);
		if (bb.min == null) {
			bb.min = bb.max = ps;
		} else {
			bb.min = bb.min.min(ps);
			bb.max = bb.max.max(ps);
		}
	}, this);
	return bb;
};

ReStruct.prototype.initLayers = function () {
	for (var group in LAYER_MAP) {
		this.layers[LAYER_MAP[group]] =
			this.render.paper.rect(0, 0, 10, 10)
			.attr({
				fill: '#000',
				opacity: '0.0'
			}).toFront();
	}
};

ReStruct.prototype.addReObjectPath = function (group, visel, path, pos, visible) { // eslint-disable-line max-params
	if (!path)
		return;
	var offset = this.render.offset;
	var bb = visible ? Box2Abs.fromRelBox(util.relBox(path.getBBox())) : null;
	var ext = pos && bb ? bb.translate(pos.negated()) : null;
	if (offset !== null) {
		path.translateAbs(offset.x, offset.y);
		bb = bb ? bb.translate(offset) : null;
	}
	visel.add(path, bb, ext);
	path.insertBefore(this.layers[LAYER_MAP[group]]);
};

ReStruct.prototype.clearMarks = function () {
	for (var map in ReStruct.maps)
		this[map + 'Changed'] = {};
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
	var mapChanged = this[map + 'Changed'];
	mapChanged[id] = (typeof (mapChanged[id]) != 'undefined') ?
		Math.max(mark, mapChanged[id]) : mark;
	if (this[map].has(id))
		this.clearVisel(this[map].get(id).visel);
};

ReStruct.prototype.clearVisel = function (visel) {
	for (var i = 0; i < visel.paths.length; ++i)
		visel.paths[i].remove();
	visel.clear();
};

ReStruct.prototype.eachItem = function (func, context) {
	for (var map in ReStruct.maps) {
		this[map].each(function (id, item) {
			func.call(context, item);
		});
	}
};

ReStruct.prototype.getVBoxObj = function (selection) {
	selection = selection || {};
	if (isSelectionEmpty(selection)) {
		for (var map in ReStruct.maps)
			selection[map] = this[map].keys();
	}
	var vbox = null;
	for (map in ReStruct.maps) {
		if (selection[map]) {
			selection[map].forEach(function (id) {
				var box = this[map].get(id).getVBoxObj(this.render);
				if (box)
					vbox = vbox ? Box2Abs.union(vbox, box) : box.clone();
			}, this);
		}
	}
	vbox = vbox || new Box2Abs(0, 0, 0, 0);
	return vbox;
};

function isSelectionEmpty(selection) {
	if (selection) {
		for (var map in ReStruct.maps) {
			if (selection[map] && selection[map].length > 0)
				return false;
		}
	}
	return true;
}

ReStruct.prototype.translate = function (d) {
	this.eachItem(function (item) {
		item.visel.translate(d);
	});
};

ReStruct.prototype.scale = function (s) {
	// NOTE: bounding boxes are not valid after scaling
	this.eachItem(function (item) {
		scaleVisel(item.visel, s);
	});
};

function scaleRPath(path, s) {
	if (path.type == 'set') { // TODO: rework scaling
		for (var i = 0; i < path.length; ++i)
			scaleRPath(path[i], s);
	} else {
		if (!Object.isUndefined(path.attrs)) {
			if ('font-size' in path.attrs)
				path.attr('font-size', path.attrs['font-size'] * s);
			else if ('stroke-width' in path.attrs)
				path.attr('stroke-width', path.attrs['stroke-width'] * s);
		}
		path.scale(s, s, 0, 0);
	}
}

function scaleVisel(visel, s) {
	for (var i = 0; i < visel.paths.length; ++i)
		scaleRPath(visel.paths[i], s);
}

ReStruct.prototype.clearVisels = function () {
	this.eachItem(function (item) {
		this.clearVisel(item.visel);
	}, this);
};

ReStruct.prototype.findIncomingStereoUpBond = function (atom, bid0, includeBoldStereoBond) {
	return atom.neighbors.findIndex(function (hbid) {
		var hb = this.molecule.halfBonds.get(hbid);
		var bid = hb.bid;
		if (bid === bid0)
			return false;
		var neibond = this.bonds.get(bid);
		if (neibond.b.type === Struct.Bond.PATTERN.TYPE.SINGLE && neibond.b.stereo === Struct.Bond.PATTERN.STEREO.UP)
			return neibond.b.end === hb.begin || (neibond.boldStereo && includeBoldStereoBond);
		if (neibond.b.type === Struct.Bond.PATTERN.TYPE.DOUBLE && neibond.b.stereo === Struct.Bond.PATTERN.STEREO.NONE && includeBoldStereoBond && neibond.boldStereo)
			return true;
		return false;
	}, this);
};

ReStruct.prototype.checkStereoBold = function (bid0, bond) {
	var halfbonds = [bond.b.begin, bond.b.end].map(function (aid) {
		var atom = this.molecule.atoms.get(aid);
		var pos =  this.findIncomingStereoUpBond(atom, bid0, false);
		return pos < 0 ? -1 : atom.neighbors[pos];
	}, this);
	util.assert(halfbonds.length === 2);
	bond.boldStereo = halfbonds[0] >= 0 && halfbonds[1] >= 0;
};

ReStruct.prototype.findIncomingUpBonds = function (bid0, bond) {
	var halfbonds = [bond.b.begin, bond.b.end].map(function (aid) {
		var atom = this.molecule.atoms.get(aid);
		var pos =  this.findIncomingStereoUpBond(atom, bid0, true);
		return pos < 0 ? -1 : atom.neighbors[pos];
	}, this);
	util.assert(halfbonds.length === 2);
	bond.neihbid1 = this.atoms.get(bond.b.begin).showLabel ? -1 : halfbonds[0];
	bond.neihbid2 = this.atoms.get(bond.b.end).showLabel ? -1 : halfbonds[1];
};

ReStruct.prototype.checkStereoBoldBonds = function () {
	this.bonds.each(this.checkStereoBold, this);
};

ReStruct.prototype.update = function (force) { // eslint-disable-line max-statements
	force = force || !this.initialized;

	// check items to update
	var id;
	if (force) {
		(function () {
			for (var map in ReStruct.maps) {
				var mapChanged = this[map + 'Changed'];
				this[map].each(function (id) {
					mapChanged[id] = 1;
				}, this);
			}
		}).call(this);
	} else {
		// check if some of the items marked are already gone
		(function () {
			for (var map in ReStruct.maps) {
				var mapChanged = this[map + 'Changed'];
				for (id in mapChanged) {
					if (!this[map].has(id))
						delete mapChanged[id];
				}
			}
		}).call(this);
	}
	for (id in this.atomsChanged)
		this.connectedComponentRemoveAtom(id);

	// clean up empty fragments
	// TODO: fragment removal should be triggered by the action responsible for the fragment contents removal and form an operation of its own
	var emptyFrags = this.frags.findAll(function (fid, frag) {
		return !frag.calcBBox(this.render.ctab, fid, this.render);
	}, this);
	for (var j = 0; j < emptyFrags.length; ++j) {
		var fid = emptyFrags[j];
		this.clearVisel(this.frags.get(fid).visel);
		this.frags.unset(fid);
		this.molecule.frags.remove(fid);
	}

	(function () {
		for (var map in ReStruct.maps) {
			var mapChanged = this[map + 'Changed'];
			for (id in mapChanged) {
				this.clearVisel(this[map].get(id).visel);
				this.structChanged |= mapChanged[id] > 0;
			}
		}
	}).call(this);
	if (this.structChanged)
		this.render.structChangeHandlers.forEach(function (handler) { handler.call(); });

	// TODO: when to update sgroup?
	this.sgroups.each(function (sid, sgroup) {
		this.clearVisel(sgroup.visel);
		sgroup.highlighting = null;
		sgroup.selectionPlate = null;
	}, this);

	// TODO [RB] need to implement update-on-demand for fragments and r-groups
	this.frags.each(function (frid, frag) {
		this.clearVisel(frag.visel);
	}, this);
	this.rgroups.each(function (rgid, rgroup) {
		this.clearVisel(rgroup.visel);
	}, this);

	if (force) { // clear and recreate all half-bonds
		this.clearConnectedComponents();
		this.molecule.initHalfBonds();
		this.molecule.initNeighbors();
	}

	// only update half-bonds adjacent to atoms that have moved
	this.molecule.updateHalfBonds(new Map(this.atomsChanged).findAll(function (aid, status) {
		return status >= 0;
	}, this));
	this.molecule.sortNeighbors(new Map(this.atomsChanged).findAll(function (aid, status) {
		return status >= 1;
	}, this));
	this.assignConnectedComponents();
	this.setImplicitHydrogen();
	this.setHydrogenPos();
	this.initialized = true;

	this.verifyLoops();
	var updLoops = force || this.structChanged;
	if (updLoops)
		this.updateLoops();
	this.setDoubleBondShift();
	this.checkLabelsToShow();
	this.checkStereoBoldBonds();
	this.showLabels();
	this.showBonds();
	if (updLoops)
		this.showLoops();
	this.showReactionSymbols();
	this.showSGroups();
	this.showFragments();
	this.showRGroups();
	this.chiralFlags.each(function (id, item) {
		if (this.chiralFlagsChanged[id] > 0)
			item.draw(this.render);
	}, this);
	this.clearMarks();
	return true;
};

ReStruct.prototype.setDoubleBondShift = function () {
	var struct = this.molecule;
	// double bonds in loops
	for (var bid in this.bondsChanged) {
		var bond = this.bonds.get(bid);
		var loop1, loop2;
		loop1 = struct.halfBonds.get(bond.b.hb1).loop;
		loop2 = struct.halfBonds.get(bond.b.hb2).loop;
		if (loop1 >= 0 && loop2 >= 0) {
			var d1 = struct.loops.get(loop1).dblBonds;
			var d2 = struct.loops.get(loop2).dblBonds;
			var n1 = struct.loops.get(loop1).hbs.length;
			var n2 = struct.loops.get(loop2).hbs.length;
			bond.doubleBondShift = selectDoubleBondShift(n1, n2, d1, d2);
		} else if (loop1 >= 0) {
			bond.doubleBondShift = -1;
		} else if (loop2 >= 0) {
			bond.doubleBondShift = 1;
		} else {
			bond.doubleBondShift = selectDoubleBondShiftChain(struct, bond);
		}
	}
};

ReStruct.prototype.updateLoops = function () {
	this.reloops.each(function (rlid, reloop) {
		this.clearVisel(reloop.visel);
	}, this);
	var ret = this.molecule.findLoops();
	ret.bondsToMark.forEach(function (bid) {
		this.markBond(bid, 1);
	}, this);
	ret.newLoops.forEach(function (loopId) {
		this.reloops.set(loopId, new ReLoop(this.molecule.loops.get(loopId)));
	}, this);
};

ReStruct.prototype.showLoops = function () {
	var render = this.render;
	var options = render.options;
	var paper = render.paper;
	var molecule = this.molecule;
	this.reloops.each(function (rlid, reloop) { // eslint-disable-line max-statements
		var loop = reloop.loop;
		reloop.centre = new Vec2();
		loop.hbs.each(function (hbid) {
			var hb = molecule.halfBonds.get(hbid);
			var bond = this.bonds.get(hb.bid);
			var apos = render.ps(this.atoms.get(hb.begin).a.pp);
			if (bond.b.type != Struct.Bond.PATTERN.TYPE.AROMATIC)
				loop.aromatic = false;
			reloop.centre.add_(apos); // eslint-disable-line no-underscore-dangle
		}, this);
		loop.convex = true;
		for (var k = 0; k < reloop.loop.hbs.length; ++k) {
			var hba = molecule.halfBonds.get(loop.hbs[k]);
			var hbb = molecule.halfBonds.get(loop.hbs[(k + 1) % loop.hbs.length]);
			var angle = Math.atan2(
			Vec2.cross(hba.dir, hbb.dir),
			Vec2.dot(hba.dir, hbb.dir));
			if (angle > 0)
				loop.convex = false;
		}

		reloop.centre = reloop.centre.scaled(1.0 / loop.hbs.length);
		reloop.radius = -1;
		loop.hbs.each(function (hbid) {
			var hb = molecule.halfBonds.get(hbid);
			var apos = render.ps(this.atoms.get(hb.begin).a.pp);
			var bpos = render.ps(this.atoms.get(hb.end).a.pp);
			var n = Vec2.diff(bpos, apos).rotateSC(1, 0).normalized();
			var dist = Vec2.dot(Vec2.diff(apos, reloop.centre), n);
			if (reloop.radius < 0)
				reloop.radius = dist;
			 else
				reloop.radius = Math.min(reloop.radius, dist);
		}, this);
		reloop.radius *= 0.7;
		if (!loop.aromatic)
			return;
		var path = null;
		if (loop.convex) {
			path = paper.circle(reloop.centre.x, reloop.centre.y, reloop.radius)
				.attr({
					'stroke': '#000',
					'stroke-width': options.lineWidth
				});
		} else {
			var pathStr = '';
			for (k = 0; k < loop.hbs.length; ++k) {
				hba = molecule.halfBonds.get(loop.hbs[k]);
				hbb = molecule.halfBonds.get(loop.hbs[(k + 1) % loop.hbs.length]);
				angle = Math.atan2(
				Vec2.cross(hba.dir, hbb.dir),
				Vec2.dot(hba.dir, hbb.dir));
				var halfAngle = (Math.PI - angle) / 2;
				var dir = hbb.dir.rotate(halfAngle);
				var pi = render.ps(this.atoms.get(hbb.begin).a.pp);
				var sin = Math.sin(halfAngle);
				var minSin = 0.1;
				if (Math.abs(sin) < minSin)
					sin = sin * minSin / Math.abs(sin);
				var offset = options.bondSpace / sin;
				var qi = pi.addScaled(dir, -offset);
				pathStr += (k == 0 ? 'M' : 'L');
				pathStr += tfx(qi.x) + ',' + tfx(qi.y);
			}
			pathStr += 'Z';
			path = paper.path(pathStr)
				.attr({
					'stroke': '#000',
					'stroke-width': options.lineWidth,
					'stroke-dasharray': '- '
				});
		}
		this.addReObjectPath('data', reloop.visel, path, null, true);
	}, this);
};

ReStruct.prototype.showReactionSymbols = function () {
	var item;
	var id;
	for (id in this.rxnArrowsChanged) {
		item = this.rxnArrows.get(id);
		this.showReactionArrow(id, item);
	}
	for (id in this.rxnPlusesChanged) {
		item = this.rxnPluses.get(id);
		this.showReactionPlus(id, item);
	}
};

ReStruct.prototype.showReactionArrow = function (id, item) {
	var centre = this.render.ps(item.item.pp);
	var path = draw.arrow(this.render, new Vec2(centre.x - this.render.scale, centre.y), new Vec2(centre.x + this.render.scale, centre.y));
	item.visel.add(path, Box2Abs.fromRelBox(util.relBox(path.getBBox())));
	var offset = this.render.offset;
	if (offset != null)
		path.translateAbs(offset.x, offset.y);
};

ReStruct.prototype.showReactionPlus = function (id, item) {
	var centre = this.render.ps(item.item.pp);
	var path = draw.plus(this.render, centre);
	item.visel.add(path, Box2Abs.fromRelBox(util.relBox(path.getBBox())));
	var offset = this.render.offset;
	if (offset != null)
		path.translateAbs(offset.x, offset.y);
};

ReStruct.prototype.showSGroups = function () {
	this.molecule.sGroupForest.getSGroupsBFS().reverse().forEach(function (id) {
		var resgroup = this.sgroups.get(id);
		var sgroup = resgroup.item;
		if (sgroup.data.fieldName != "MRV_IMPLICIT_H") {
			var remol = this.render.ctab;
			var path = resgroup.draw(remol, sgroup);
			this.addReObjectPath('data', resgroup.visel, path, null, true);
			resgroup.setHighlight(resgroup.highlight, this.render); // TODO: fix this
		}
	}, this);
};

ReStruct.prototype.showFragments = function () {
	this.frags.each(function (id, frag) {
		var path = frag.draw(this.render, id);
		if (path) this.addReObjectPath('data', frag.visel, path, null, true);
		// TODO fragment selection & highlighting
	}, this);
};

ReStruct.prototype.showRGroups = function () {
	this.rgroups.each(function (id, rgroup) {
		var drawing = rgroup.draw(this.render);
		for (var group in drawing) {
			while (drawing[group].length > 0)
				this.addReObjectPath(group, rgroup.visel, drawing[group].shift(), null, true);
		}
		// TODO rgroup selection & highlighting
	}, this);
};

ReStruct.prototype.eachCC = function (func, type, context) {
	this.connectedComponents.each(function (ccid, cc) {
		if (!type || this.ccFragmentType.get(ccid) == type)
			func.call(context || this, ccid, cc);
	}, this);
};

ReStruct.prototype.getGroupBB = function (type) {
	var bb = { min: null, max: null };

	this.eachCC(function (ccid, cc) {
		bb = this.connectedComponentGetBoundingBox(ccid, cc, bb);
	}, type, this);

	return bb;
};

ReStruct.prototype.setHydrogenPos = function () {
	// check where should the hydrogen be put on the left of the label
	for (var aid in this.atomsChanged) {
		var atom = this.atoms.get(aid);

		if (atom.a.neighbors.length == 0) {
			var elem = element.getElementByLabel(atom.a.label);
			if (elem != null)
				atom.hydrogenOnTheLeft = element[elem].putHydrogenOnTheLeft;
			continue;// eslint-disable-line no-continue
		}
		var yl = 1,
			yr = 1,
			nl = 0,
			nr = 0;
		for (var i = 0; i < atom.a.neighbors.length; ++i) {
			var d = this.molecule.halfBonds.get(atom.a.neighbors[i]).dir;
			if (d.x <= 0) {
				yl = Math.min(yl, Math.abs(d.y));
				nl++;
			} else {
				yr = Math.min(yr, Math.abs(d.y));
				nr++;
			}
		}
		if (yl < 0.51 || yr < 0.51)
			atom.hydrogenOnTheLeft = yr < yl;
		else
			atom.hydrogenOnTheLeft = nr > nl;
	}
};

ReStruct.prototype.setImplicitHydrogen = function () {
	// calculate implicit hydrogens for atoms that have been modified
	this.molecule.setImplicitHydrogen(Object.keys(this.atomsChanged));
};

ReStruct.prototype.loopRemove = function (loopId) {
	if (!this.reloops.has(loopId))
		return;
	var reloop = this.reloops.get(loopId);
	this.clearVisel(reloop.visel);
	var bondlist = [];
	for (var i = 0; i < reloop.loop.hbs.length; ++i) {
		var hbid = reloop.loop.hbs[i];
		if (!this.molecule.halfBonds.has(hbid))
			continue;// eslint-disable-line no-continue
		var hb = this.molecule.halfBonds.get(hbid);
		hb.loop = -1;
		this.markBond(hb.bid, 1);
		this.markAtom(hb.begin, 1);
		bondlist.push(hb.bid);
	}
	this.reloops.unset(loopId);
	this.molecule.loops.remove(loopId);
};

ReStruct.prototype.loopIsValid = function (rlid, reloop) {
	var halfBonds = this.molecule.halfBonds;
	var loop = reloop.loop;
	var bad = false;
	loop.hbs.each(function (hbid) {
		if (!halfBonds.has(hbid) || halfBonds.get(hbid).loop !== rlid)
			bad = true;
	}, this);
	return !bad;
};

ReStruct.prototype.verifyLoops = function () {
	var toRemove = [];
	this.reloops.each(function (rlid, reloop) {
		if (!this.loopIsValid(rlid, reloop))
			toRemove.push(rlid);
	}, this);
	for (var i = 0; i < toRemove.length; ++i)
		this.loopRemove(toRemove[i]);
};

ReStruct.prototype.showLabels = function () { // eslint-disable-line max-statements
	var render = this.render;
	var options = render.options;
	var paper = render.paper;
	var delta = 0.5 * options.lineWidth;
	for (var aid in this.atomsChanged) {
		var atom = this.atoms.get(aid);

		var ps = render.ps(atom.a.pp);
		var index = null;
		if (options.showAtomIds) {
			index = {};
			index.text = aid.toString();
			index.path = paper.text(ps.x, ps.y, index.text)
				.attr({
					'font': options.font,
					'font-size': options.fontszsub,
					'fill': '#070'
				});
			index.rbb = util.relBox(index.path.getBBox());
			draw.recenterText(index.path, index.rbb);
			this.addReObjectPath('indices', atom.visel, index.path, ps);
		}
		atom.setHighlight(atom.highlight, render);

		var color = '#000000';
		if (atom.showLabel) {
			var rightMargin = 0,
				leftMargin = 0;
			// label
			var label = {};
			if (atom.a.atomList != null) {
				label.text = atom.a.atomList.label();
			} else if (atom.a.label == 'R#' && atom.a.rglabel != null) {
				label.text = '';
				for (var rgi = 0; rgi < 32; rgi++) {
					if (atom.a.rglabel & (1 << rgi)) // eslint-disable-line max-depth
						label.text += ('R' + (rgi + 1).toString());
				}
				if (label.text == '') label = 'R#'; // for structures that missed 'M  RGP' tag in molfile
			} else {
				label.text = atom.a.label;
				var elem = element.getElementByLabel(label.text);
				if (options.atomColoring && elem)
					color = element[elem].color;
			}
			label.path = paper.text(ps.x, ps.y, label.text)
				.attr({
					'font': options.font,
					'font-size': options.fontsz,
					'fill': color
				});
			label.rbb = util.relBox(label.path.getBBox());
			draw.recenterText(label.path, label.rbb);
			if (atom.a.atomList != null)
				pathAndRBoxTranslate(label.path, label.rbb, (atom.hydrogenOnTheLeft ? -1 : 1) * (label.rbb.width - label.rbb.height) / 2, 0);
			this.addReObjectPath('data', atom.visel, label.path, ps, true);
			rightMargin = label.rbb.width / 2;
			leftMargin = -label.rbb.width / 2;
			var implh = Math.floor(atom.a.implicitH);
			var isHydrogen = label.text == 'H';
			var hydrogen = {},
				hydroIndex = null;
			var hydrogenLeft = atom.hydrogenOnTheLeft;
			if (isHydrogen && implh > 0) {
				hydroIndex = {};
				hydroIndex.text = (implh + 1).toString();
				hydroIndex.path =
				paper.text(ps.x, ps.y, hydroIndex.text)
					.attr({
						'font': options.font,
						'font-size': options.fontszsub,
						'fill': color
					});
				hydroIndex.rbb = util.relBox(hydroIndex.path.getBBox());
				draw.recenterText(hydroIndex.path, hydroIndex.rbb);
				/* eslint-disable no-mixed-operators*/
				pathAndRBoxTranslate(hydroIndex.path, hydroIndex.rbb,
					rightMargin + 0.5 * hydroIndex.rbb.width + delta,
					0.2 * label.rbb.height);
				/* eslint-enable no-mixed-operators*/
				rightMargin += hydroIndex.rbb.width + delta;
				this.addReObjectPath('data', atom.visel, hydroIndex.path, ps, true);
			}

			var radical = {};
			if (atom.a.radical != 0) {
				var hshift;
				switch (atom.a.radical) {
				case 1:
					radical.path = paper.set();
					hshift = 1.6 * options.lineWidth;
					radical.path.push(
						draw.radicalBullet(this.render, ps.add(new Vec2(-hshift, 0))),
						draw.radicalBullet(this.render, ps.add(new Vec2(hshift, 0))));
					radical.path.attr('fill', color);
					break;
				case 2:
					radical.path = draw.radicalBullet(this.render, ps)
						.attr('fill', color);
					break;
				case 3:
					radical.path = paper.set();
					hshift = 1.6 * options.lineWidth;
					radical.path.push(
						draw.radicalCap(this.render, ps.add(new Vec2(-hshift, 0))),
						draw.radicalCap(this.render, ps.add(new Vec2(hshift, 0))));
					radical.path.attr('stroke', color);
					break;
				}
				radical.rbb = util.relBox(radical.path.getBBox());
				var vshift = -0.5 * (label.rbb.height + radical.rbb.height);
				if (atom.a.radical == 3)
					vshift -= options.lineWidth / 2;
				pathAndRBoxTranslate(radical.path, radical.rbb,
					0, vshift);
				this.addReObjectPath('data', atom.visel, radical.path, ps, true);
			}

			var isotope = {};
			if (atom.a.isotope != 0) {
				isotope.text = atom.a.isotope.toString();
				isotope.path = paper.text(ps.x, ps.y, isotope.text)
					.attr({
						'font': options.font,
						'font-size': options.fontszsub,
						'fill': color
					});
				isotope.rbb = util.relBox(isotope.path.getBBox());
				draw.recenterText(isotope.path, isotope.rbb);
				/* eslint-disable no-mixed-operators*/
				pathAndRBoxTranslate(isotope.path, isotope.rbb,
					leftMargin - 0.5 * isotope.rbb.width - delta,
					-0.3 * label.rbb.height);
				/* eslint-enable no-mixed-operators*/
				leftMargin -= isotope.rbb.width + delta;
				this.addReObjectPath('data', atom.visel, isotope.path, ps, true);
			}
			if (!isHydrogen && implh > 0 && !render.options.hideImplicitHydrogen) {
				hydrogen.text = 'H';
				hydrogen.path = paper.text(ps.x, ps.y, hydrogen.text)
					.attr({
						'font': options.font,
						'font-size': options.fontsz,
						'fill': color
					});
				hydrogen.rbb = util.relBox(hydrogen.path.getBBox());
				draw.recenterText(hydrogen.path, hydrogen.rbb);
				if (!hydrogenLeft) {
					 /* eslint-disable no-mixed-operators*/
					pathAndRBoxTranslate(hydrogen.path, hydrogen.rbb,
						rightMargin + 0.5 * hydrogen.rbb.width + delta, 0);
					/* eslint-enable no-mixed-operators*/
					rightMargin += hydrogen.rbb.width + delta;
				}
				if (implh > 1) {
					hydroIndex = {};
					hydroIndex.text = implh.toString();
					hydroIndex.path =
					paper.text(ps.x, ps.y, hydroIndex.text)
						.attr({
							'font': options.font,
							'font-size': options.fontszsub,
							'fill': color
						});
					hydroIndex.rbb = util.relBox(hydroIndex.path.getBBox());
					draw.recenterText(hydroIndex.path, hydroIndex.rbb);
					if (!hydrogenLeft) {
						/* eslint-disable no-mixed-operators*/
						pathAndRBoxTranslate(hydroIndex.path, hydroIndex.rbb,
							rightMargin + 0.5 * hydroIndex.rbb.width + delta,
							0.2 * label.rbb.height);
						/* eslint-enable no-mixed-operators*/
						rightMargin += hydroIndex.rbb.width + delta;
					}
				}
				if (hydrogenLeft) {
					if (hydroIndex != null) {
						/* eslint-disable no-mixed-operators*/
						pathAndRBoxTranslate(hydroIndex.path, hydroIndex.rbb,
							leftMargin - 0.5 * hydroIndex.rbb.width - delta,
							0.2 * label.rbb.height);
						/* eslint-enable no-mixed-operators*/
						leftMargin -= hydroIndex.rbb.width + delta;
					}
					/* eslint-disable no-mixed-operators*/
					pathAndRBoxTranslate(hydrogen.path, hydrogen.rbb,
						leftMargin - 0.5 * hydrogen.rbb.width - delta, 0);
					/* eslint-enable no-mixed-operators*/
					leftMargin -= hydrogen.rbb.width + delta;
				}
				this.addReObjectPath('data', atom.visel, hydrogen.path, ps, true);
				if (hydroIndex != null)
					this.addReObjectPath('data', atom.visel, hydroIndex.path, ps, true);
			}

			var charge = {};
			if (atom.a.charge != 0) {
				charge.text = '';
				var absCharge = Math.abs(atom.a.charge);
				if (absCharge != 1)
					charge.text = absCharge.toString();
				if (atom.a.charge < 0)
					charge.text += '\u2013';
				else
					charge.text += '+';

				charge.path = paper.text(ps.x, ps.y, charge.text)
					.attr({
						'font': options.font,
						'font-size': options.fontszsub,
						'fill': color
					});
				charge.rbb = util.relBox(charge.path.getBBox());
				draw.recenterText(charge.path, charge.rbb);
				/* eslint-disable no-mixed-operators*/
				pathAndRBoxTranslate(charge.path, charge.rbb,
					rightMargin + 0.5 * charge.rbb.width + delta,
					-0.3 * label.rbb.height);
				/* eslint-enable no-mixed-operators*/
				rightMargin += charge.rbb.width + delta;
				this.addReObjectPath('data', atom.visel, charge.path, ps, true);
			}

			var valence = {};
			var mapValence = {
				0: '0',
				1: 'I',
				2: 'II',
				3: 'III',
				4: 'IV',
				5: 'V',
				6: 'VI',
				7: 'VII',
				8: 'VIII',
				9: 'IX',
				10: 'X',
				11: 'XI',
				12: 'XII',
				13: 'XIII',
				14: 'XIV'
			};
			if (atom.a.explicitValence >= 0) {
				valence.text = mapValence[atom.a.explicitValence];
				if (!valence.text)
					throw new Error('invalid valence ' + atom.a.explicitValence.toString());
				valence.text = '(' + valence.text + ')';
				valence.path = paper.text(ps.x, ps.y, valence.text)
					.attr({
						'font': options.font,
						'font-size': options.fontszsub,
						'fill': color
					});
				valence.rbb = util.relBox(valence.path.getBBox());
				draw.recenterText(valence.path, valence.rbb);
				/* eslint-disable no-mixed-operators*/
				pathAndRBoxTranslate(valence.path, valence.rbb,
					rightMargin + 0.5 * valence.rbb.width + delta,
					-0.3 * label.rbb.height);
				/* eslint-enable no-mixed-operators*/
				rightMargin += valence.rbb.width + delta;
				this.addReObjectPath('data', atom.visel, valence.path, ps, true);
			}

			if (atom.a.badConn && options.showValenceWarnings) {
				var warning = {};
				/* eslint-disable no-mixed-operators*/
				var y = ps.y + label.rbb.height / 2 + delta;
				/* eslint-enable no-mixed-operators*/
				warning.path = paper.path('M{0},{1}L{2},{3}',
				tfx(ps.x + leftMargin), tfx(y), tfx(ps.x + rightMargin), tfx(y))
					.attr(this.render.options.lineattr)
					.attr({ stroke: '#F00' });
				warning.rbb = util.relBox(warning.path.getBBox());
				this.addReObjectPath('warnings', atom.visel, warning.path, ps, true);
			}
			if (index) {
				/* eslint-disable no-mixed-operators*/
				pathAndRBoxTranslate(index.path, index.rbb,
					-0.5 * label.rbb.width - 0.5 * index.rbb.width - delta,
					0.3 * label.rbb.height);
				/* eslint-enable no-mixed-operators*/
			}
		}

		var lsb = bisectLargestSector(atom, this.molecule);

		var asterisk = Prototype.Browser.IE ? '*' : '∗';
		if (atom.a.attpnt) {
			var i, c, j; // eslint-disable-line no-unused-vars
			for (i = 0, c = 0; i < 4; ++i) {
				var attpntText = '';
				if (atom.a.attpnt & (1 << i)) {
					if (attpntText.length > 0)
						attpntText += ' ';
					attpntText += asterisk;
					for (j = 0; j < (i == 0 ? 0 : (i + 1)); ++j)
						attpntText += '\'';
					var pos0 = new Vec2(ps);
					var pos1 = ps.addScaled(lsb, 0.7 * options.scaleFactor);

					var attpntPath1 = paper.text(pos1.x, pos1.y, attpntText)
						.attr({
							'font': options.font,
							'font-size': options.fontsz,
							'fill': color
						});
					var attpntRbb = util.relBox(attpntPath1.getBBox());
					draw.recenterText(attpntPath1, attpntRbb);

					var lsbn = lsb.negated();
					/* eslint-disable no-mixed-operators*/
					pos1 = pos1.addScaled(lsbn, Vec2.shiftRayBox(pos1, lsbn, Box2Abs.fromRelBox(attpntRbb)) + options.lineWidth / 2);
					/* eslint-enable no-mixed-operators*/
					pos0 = shiftBondEnd(atom, pos0, lsb, options.lineWidth);
					var n = lsb.rotateSC(1, 0);
					var arrowLeft = pos1.addScaled(n, 0.05 * options.scaleFactor).addScaled(lsbn, 0.09 * options.scaleFactor);
					var arrowRight = pos1.addScaled(n, -0.05 * options.scaleFactor).addScaled(lsbn, 0.09 * options.scaleFactor);
					var attpntPath = paper.set();
					attpntPath.push(
						attpntPath1,
					paper.path('M{0},{1}L{2},{3}M{4},{5}L{2},{3}L{6},{7}', tfx(pos0.x), tfx(pos0.y), tfx(pos1.x), tfx(pos1.y), tfx(arrowLeft.x), tfx(arrowLeft.y), tfx(arrowRight.x), tfx(arrowRight.y))
						.attr(options.lineattr).attr({ 'stroke-width': options.lineWidth / 2 })
					);
					this.addReObjectPath('indices', atom.visel, attpntPath, ps);
					lsb = lsb.rotate(Math.PI / 6);
				}
			}
		}

		var aamText = '';
		if (atom.a.aam > 0)
			aamText += atom.a.aam;
		if (atom.a.invRet > 0) {
			if (aamText.length > 0)
				aamText += ',';
			if (atom.a.invRet == 1)
				aamText += 'Inv';
			else if (atom.a.invRet == 2)
				aamText += 'Ret';
			else
				throw new Error('Invalid value for the invert/retain flag');
		}

		var queryAttrsText = '';
		if (atom.a.ringBondCount != 0) {
			if (atom.a.ringBondCount > 0)
				queryAttrsText += 'rb' + atom.a.ringBondCount.toString();
			else if (atom.a.ringBondCount == -1)
				queryAttrsText += 'rb0';
			else if (atom.a.ringBondCount == -2)
				queryAttrsText += 'rb*';
			else
				throw new Error('Ring bond count invalid');
		}
		if (atom.a.substitutionCount != 0) {
			if (queryAttrsText.length > 0)
				queryAttrsText += ',';

			if (atom.a.substitutionCount > 0)
				queryAttrsText += 's' + atom.a.substitutionCount.toString();
			else if (atom.a.substitutionCount == -1)
				queryAttrsText += 's0';
			else if (atom.a.substitutionCount == -2)
				queryAttrsText += 's*';
			else
				throw new Error('Substitution count invalid');
		}
		if (atom.a.unsaturatedAtom > 0) {
			if (queryAttrsText.length > 0)
				queryAttrsText += ',';

			if (atom.a.unsaturatedAtom == 1)
				queryAttrsText += 'u';
			else
				throw new Error('Unsaturated atom invalid value');
		}
		if (atom.a.hCount > 0) {
			if (queryAttrsText.length > 0)
				queryAttrsText += ',';

			queryAttrsText += 'H' + (atom.a.hCount - 1).toString();
		}


		if (atom.a.exactChangeFlag > 0) {
			if (aamText.length > 0)
				aamText += ',';
			if (atom.a.exactChangeFlag == 1)
				aamText += 'ext';
			else
				throw new Error('Invalid value for the exact change flag');
		}

		// this includes both aam flags, if any, and query features, if any
		// we render them together to avoid possible collisions
		aamText = (queryAttrsText.length > 0 ? queryAttrsText + '\n' : '') + (aamText.length > 0 ? '.' + aamText + '.' : '');
		if (aamText.length > 0) {
			var aamPath = paper.text(ps.x, ps.y, aamText)
				.attr({
					'font': options.font,
					'font-size': options.fontszsub,
					'fill': color
				});
			var aamBox = util.relBox(aamPath.getBBox());
			draw.recenterText(aamPath, aamBox);
			var dir = bisectLargestSector(atom, this.molecule);
			var visel = atom.visel;
			var t = 3;
			// estimate the shift to clear the atom label
			for (i = 0; i < visel.exts.length; ++i)
				t = Math.max(t, Vec2.shiftRayBox(ps, dir, visel.exts[i].translate(ps)));
			// estimate the shift backwards to account for the size of the aam/query text box itself
			t += Vec2.shiftRayBox(ps, dir.negated(), Box2Abs.fromRelBox(aamBox));
			dir = dir.scaled(8 + t);
			pathAndRBoxTranslate(aamPath, aamBox, dir.x, dir.y);
			this.addReObjectPath('data', atom.visel, aamPath, ps, true);
		}
	}
};

ReStruct.prototype.showBonds = function () { // eslint-disable-line max-statements
	var render = this.render;
	var options = render.options;
	var paper = render.paper;
	for (var bid in this.bondsChanged) {
		var bond = this.bonds.get(bid);
		var hb1 = this.molecule.halfBonds.get(bond.b.hb1),
			hb2 = this.molecule.halfBonds.get(bond.b.hb2);
		this.bondRecalc(options, bond);
		bond.path = this.showBond(bond, hb1, hb2);
		bond.rbb = util.relBox(bond.path.getBBox());
		this.addReObjectPath('data', bond.visel, bond.path, null, true);
		var reactingCenter = {};
		reactingCenter.path = draw.reactingCenter(this.render, bond, hb1, hb2);
		if (reactingCenter.path) {
			reactingCenter.rbb = util.relBox(reactingCenter.path.getBBox());
			this.addReObjectPath('data', bond.visel, reactingCenter.path, null, true);
		}
		var topology = {};
		topology.path = draw.topologyMark(this.render, bond, hb1, hb2);
		if (topology.path) {
			topology.rbb = util.relBox(topology.path.getBBox());
			this.addReObjectPath('data', bond.visel, topology.path, null, true);
		}
		bond.setHighlight(bond.highlight, render);
		var bondIdxOff = options.subFontSize * 0.6;
		var ipath = null,
			 irbb = null;
		if (options.showBondIds) {
			var pb = Vec2.lc(hb1.p, 0.5, hb2.p, 0.5, hb1.norm, bondIdxOff);
			ipath = paper.text(pb.x, pb.y, bid.toString());
			irbb = util.relBox(ipath.getBBox());
			draw.recenterText(ipath, irbb);
			this.addReObjectPath('indices', bond.visel, ipath);
		}
		if (options.showHalfBondIds) {
			var phb1 = Vec2.lc(hb1.p, 0.8, hb2.p, 0.2, hb1.norm, bondIdxOff);
			ipath = paper.text(phb1.x, phb1.y, bond.b.hb1.toString());
			irbb = util.relBox(ipath.getBBox());
			draw.recenterText(ipath, irbb);
			this.addReObjectPath('indices', bond.visel, ipath);
			var phb2 = Vec2.lc(hb1.p, 0.2, hb2.p, 0.8, hb2.norm, bondIdxOff);
			ipath = paper.text(phb2.x, phb2.y, bond.b.hb2.toString());
			irbb = util.relBox(ipath.getBBox());
			draw.recenterText(ipath, irbb);
			this.addReObjectPath('indices', bond.visel, ipath);
		}
		if (options.showLoopIds && !options.showBondIds) {
			var pl1 = Vec2.lc(hb1.p, 0.5, hb2.p, 0.5, hb2.norm, bondIdxOff);
			ipath = paper.text(pl1.x, pl1.y, hb1.loop.toString());
			irbb = util.relBox(ipath.getBBox());
			draw.recenterText(ipath, irbb);
			this.addReObjectPath('indices', bond.visel, ipath);
			var pl2 = Vec2.lc(hb1.p, 0.5, hb2.p, 0.5, hb1.norm, bondIdxOff);
			ipath = paper.text(pl2.x, pl2.y, hb2.loop.toString());
			irbb = util.relBox(ipath.getBBox());
			draw.recenterText(ipath, irbb);
			this.addReObjectPath('indices', bond.visel, ipath);
		}
	}
};

ReStruct.prototype.showBond = function (bond, hb1, hb2) {
	var path = null;
	var struct = this.molecule;
	var shiftA = !this.atoms.get(hb1.begin).showLabel;
	var shiftB = !this.atoms.get(hb2.begin).showLabel;

	switch (bond.b.type) {
	case Struct.Bond.PATTERN.TYPE.SINGLE:
		switch (bond.b.stereo) {
		case Struct.Bond.PATTERN.STEREO.UP:
			this.findIncomingUpBonds(hb1.bid, bond);
			if (bond.boldStereo && bond.neihbid1 >= 0 && bond.neihbid2 >= 0)
				path = draw.bondSingleStereoBold(this.render, hb1, hb2, bond, shiftA, shiftB);
			else
				path = draw.bondSingleUp(this.render, hb1, hb2, bond, struct);
			break;
		case Struct.Bond.PATTERN.STEREO.DOWN:
			path = draw.bondSingleDown(this.render, hb1, hb2);
			break;
		case Struct.Bond.PATTERN.STEREO.EITHER:
			path = draw.bondSingleEither(this.render, hb1, hb2);
			break;
		default:
			path = draw.bondSingle(this.render, hb1, hb2);
			break;
		}
		break;
	case Struct.Bond.PATTERN.TYPE.DOUBLE:
		this.findIncomingUpBonds(hb1.bid, bond);
		if (bond.b.stereo === Struct.Bond.PATTERN.STEREO.NONE && bond.boldStereo &&
			bond.neihbid1 >= 0 && bond.neihbid2 >= 0) {
			path = draw.bondSingleStereoBold(this.render, hb1, hb2, bond, shiftA, shiftB);
		} else {
			path = draw.bondDouble(this.render, hb1, hb2, bond,
			                       bond.b.stereo === Struct.Bond.PATTERN.STEREO.CIS_TRANS, shiftA, shiftB);
		}
		break;
	case Struct.Bond.PATTERN.TYPE.TRIPLE:
		path = draw.bondTriple(this.render, hb1, hb2);
		break;
	case Struct.Bond.PATTERN.TYPE.AROMATIC:
		var inAromaticLoop = (hb1.loop >= 0 && struct.loops.get(hb1.loop).aromatic) ||
			(hb2.loop >= 0 && struct.loops.get(hb2.loop).aromatic);
		path = inAromaticLoop ? draw.bondSingle(this.render, hb1, hb2) :
			draw.bondAromatic(this.render, hb1, hb2,
			                  bond.doubleBondShift, shiftA, shiftB);
		break;
	case Struct.Bond.PATTERN.TYPE.SINGLE_OR_DOUBLE:
		path = draw.bondSingleOrDouble(this.render, hb1, hb2);
		break;
	case Struct.Bond.PATTERN.TYPE.SINGLE_OR_AROMATIC:
		path = draw.bondSingleOrAromatic(this.render, hb1, hb2,
		                                 bond.doubleBondShift, shiftA, shiftB);
		break;
	case Struct.Bond.PATTERN.TYPE.DOUBLE_OR_AROMATIC:
		path = draw.bondDoubleOrAromatic(this.render, hb1, hb2,
		                                 bond.doubleBondShift, shiftA, shiftB);

		break;
	case Struct.Bond.PATTERN.TYPE.ANY:
		path = draw.bondAny(this.render, hb1, hb2);
		break;
	default:
		throw new Error('Bond type ' + bond.b.type + ' not supported');
	}
	return path;
};

ReStruct.prototype.setSelection = function (selection) {
	for (var map in ReStruct.maps) {
		if (ReStruct.maps[map].isSelectable() && (!selection || selection[map])) {
			// TODO: iterate over selection ids
			this[map].each(function (id, item) {
				var selected = selection ? selection[map].indexOf(id) > -1 :
				                           item.selected; // for render.update only
				this.showItemSelection(item, selected);
			}, this);
		}
	}
};

ReStruct.prototype.showItemSelection = function (item, selected) {
	var exists = item.selectionPlate != null && !item.selectionPlate.removed;
	// TODO: simplify me, who sets `removed`?
	item.selected = selected;
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
	} else
		if (exists && item.selectionPlate) {
			item.selectionPlate.hide(); // TODO [RB] review
		}
};

ReStruct.prototype.labelIsVisible = function (aid, atom) {
	if (atom.a.neighbors.length == 0 ||
		(atom.a.neighbors.length < 2 && !this.render.options.hideTerminalLabels) ||
	atom.a.label.toLowerCase() != 'c' ||
		(atom.a.badConn && this.render.options.showValenceWarnings) ||
	atom.a.isotope != 0 ||
	atom.a.radical != 0 ||
	atom.a.charge != 0 ||
	atom.a.explicitValence >= 0 ||
	atom.a.atomList != null ||
	atom.a.rglabel != null)
		return true;
	if (atom.a.neighbors.length == 2) {
		var n1 = atom.a.neighbors[0];
		var n2 = atom.a.neighbors[1];
		var hb1 = this.molecule.halfBonds.get(n1);
		var hb2 = this.molecule.halfBonds.get(n2);
		var b1 = this.bonds.get(hb1.bid);
		var b2 = this.bonds.get(hb2.bid);
		if (b1.b.type == b2.b.type && b1.b.stereo == Struct.Bond.PATTERN.STEREO.NONE && b2.b.stereo == Struct.Bond.PATTERN.STEREO.NONE) {
			if (Math.abs(Vec2.cross(hb1.dir, hb2.dir)) < 0.2)
				return true;
		}
	}
	return false;
};

ReStruct.prototype.checkLabelsToShow = function () {
	for (var aid in this.atomsChanged) {
		var atom = this.atoms.get(aid);
		atom.showLabel = this.labelIsVisible(aid, atom);
	}
};

ReStruct.prototype.bondRecalc = function (options, bond) {
	var render = this.render;
	var atom1 = this.atoms.get(bond.b.begin);
	var atom2 = this.atoms.get(bond.b.end);
	var p1 = render.ps(atom1.a.pp);
	var p2 = render.ps(atom2.a.pp);
	var hb1 = this.molecule.halfBonds.get(bond.b.hb1);
	var hb2 = this.molecule.halfBonds.get(bond.b.hb2);
	hb1.p = shiftBondEnd(atom1, p1, hb1.dir, 2 * options.lineWidth);
	hb2.p = shiftBondEnd(atom2, p2, hb2.dir, 2 * options.lineWidth);
	bond.b.center = Vec2.lc2(atom1.a.pp, 0.5, atom2.a.pp, 0.5);
	bond.b.len = Vec2.dist(p1, p2);
	bond.b.sb = options.lineWidth * 5;
	/* eslint-disable no-mixed-operators*/
	bond.b.sa = Math.max(bond.b.sb,  bond.b.len / 2 - options.lineWidth * 2);
	/* eslint-enable no-mixed-operators*/
	bond.b.angle = Math.atan2(hb1.dir.y, hb1.dir.x) * 180 / Math.PI;
};

function pathAndRBoxTranslate(path, rbb, x, y) {
	path.translateAbs(x, y);
	rbb.x += x;
	rbb.y += y;
}

function bisectLargestSector(atom, struct) {
	var angles = [];
	atom.a.neighbors.each(function (hbid) {
		var hb = struct.halfBonds.get(hbid);
		angles.push(hb.ang);
	});
	angles = angles.sort(function (a, b) {
		return a - b;
	});
	var da = [];
	for (var i = 0; i < angles.length - 1; ++i)
		da.push(angles[(i + 1) % angles.length] - angles[i]);
	/* eslint-disable no-mixed-operators*/
	da.push(angles[0] - angles[angles.length - 1] + 2 * Math.PI);
	/* eslint-enable no-mixed-operators*/
	var daMax = 0;
	var ang = -Math.PI / 2;
	for (i = 0; i < angles.length; ++i) {
		if (da[i] > daMax) {
			daMax = da[i];
			/* eslint-disable no-mixed-operators*/
			ang = angles[i] + da[i] / 2;
			/* eslint-enable no-mixed-operators*/
		}
	}
	return new Vec2(Math.cos(ang), Math.sin(ang));
}

function shiftBondEnd(atom, pos0, dir, margin) {
	var t = 0;
	var visel = atom.visel;
	for (var k = 0; k < visel.exts.length; ++k) {
		var box = visel.exts[k].translate(pos0);
		t = Math.max(t, Vec2.shiftRayBox(pos0, dir, box));
	}
	if (t > 0)
		pos0 = pos0.addScaled(dir, t + margin);
	return pos0;
}

function selectDoubleBondShift(n1, n2, d1, d2) {
	if (n1 == 6 && n2 != 6 && (d1 > 1 || d2 == 1))
		return -1;
	if (n2 == 6 && n1 != 6 && (d2 > 1 || d1 == 1))
		return 1;
	if (n2 * d1 > n1 * d2)
		return -1;
	if (n2 * d1 < n1 * d2)
		return 1;
	if (n2 > n1)
		return -1;
	return 1;
}

function selectDoubleBondShiftChain(struct, bond) {
	var hb1 = struct.halfBonds.get(bond.b.hb1);
	var hb2 = struct.halfBonds.get(bond.b.hb2);
	var nLeft = (hb1.leftSin > 0.3 ? 1 : 0) + (hb2.rightSin > 0.3 ? 1 : 0);
	var nRight = (hb2.leftSin > 0.3 ? 1 : 0) + (hb1.rightSin > 0.3 ? 1 : 0);
	if (nLeft > nRight)
		return -1;
	if (nLeft < nRight)
		return 1;
	if ((hb1.leftSin > 0.3 ? 1 : 0) + (hb1.rightSin > 0.3 ? 1 : 0) == 1)
		return 1;
	return 0;
}

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

module.exports = Object.assign(ReStruct, {
	Atom: ReAtom,
	Bond: ReBond,
	RxnPlus: ReRxnPlus,
	RxnArrow: ReRxnArrow,
	Frag: ReFrag,
	RGroup: ReRGroup,
	ChiralFlag: ReChiralFlag,
	SGroup: ReSGroup
});
