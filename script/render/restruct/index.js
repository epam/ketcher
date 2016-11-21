// ReStruct is to store all the auxiliary information for
//  Struct while rendering
var Box2Abs = require('../../util/box2abs');
var Map = require('../../util/map');
var Pool = require('../../util/pool');
var Set = require('../../util/set');
var Vec2 = require('../../util/vec2');
var scale = require('../../util/scale');
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

//	TODO: remove? not used
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

//	TODO: remove? not used
ReStruct.prototype.connectedComponentGetBoundingBox = function (ccid, cc, bb) {
	cc = cc || this.connectedComponents.get(ccid);
	bb = bb || { min: null, max: null };
	Set.each(cc, function (aid) {
		var ps = scale.obj2scaled(this.atoms.get(aid).a.pp, this.render.options);
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
	var offset = this.render.options.offset;
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

ReStruct.prototype.checkStereoBold = function (bid0, bond) {
	var halfbonds = [bond.b.begin, bond.b.end].map(function (aid) {
		var atom = this.molecule.atoms.get(aid);
		var pos =  bond.findIncomingStereoUpBond(atom, bid0, false, this);
		return pos < 0 ? -1 : atom.neighbors[pos];
	}, this);
	util.assert(halfbonds.length === 2);
	bond.boldStereo = halfbonds[0] >= 0 && halfbonds[1] >= 0;
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
			var apos = scale.obj2scaled(this.atoms.get(hb.begin).a.pp, render.options);
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
			var apos = scale.obj2scaled(this.atoms.get(hb.begin).a.pp, render.options);
			var bpos = scale.obj2scaled(this.atoms.get(hb.end).a.pp, render.options);
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
		if (loop.convex && options.aromaticCircle) {
			path = paper.circle(reloop.centre.x, reloop.centre.y, reloop.radius)
				.attr({
					'stroke': '#000',
					'stroke-width': options.lineattr['stroke-width']
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
				var pi = scale.obj2scaled(this.atoms.get(hbb.begin).a.pp, render.options);
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
					'stroke-width': options.lineattr['stroke-width'],
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
	var centre = scale.obj2scaled(item.item.pp, this.render.options);
	var path = draw.arrow(this.render,
		new Vec2(centre.x - this.render.options.scale, centre.y),
		new Vec2(centre.x + this.render.options.scale, centre.y));
	item.visel.add(path, Box2Abs.fromRelBox(util.relBox(path.getBBox())));
	var offset = this.render.options.offset;
	if (offset != null)
		path.translateAbs(offset.x, offset.y);
};

ReStruct.prototype.showReactionPlus = function (id, item) {
	var centre = scale.obj2scaled(item.item.pp, this.render.options);
	var path = draw.plus(this.render, centre);
	item.visel.add(path, Box2Abs.fromRelBox(util.relBox(path.getBBox())));
	var offset = this.render.options.offset;
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

//	TODO: remove? not used
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
	var options = this.render.options;

	for (var aid in this.atomsChanged) {
		var atom = this.atoms.get(aid);
		atom.show(this, aid, options);
	}
};

ReStruct.prototype.showBonds = function () { // eslint-disable-line max-statements
	var options = this.render.options;

	for (var bid in this.bondsChanged) {
		var bond = this.bonds.get(bid);
		this.bondRecalc(options, bond);
		bond.show(this, bid, options);
	}
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

ReStruct.prototype.bondRecalc = function (options, bond) {
	var render = this.render;
	var atom1 = this.atoms.get(bond.b.begin);
	var atom2 = this.atoms.get(bond.b.end);
	var p1 = scale.obj2scaled(atom1.a.pp, render.options);
	var p2 = scale.obj2scaled(atom2.a.pp, render.options);
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
