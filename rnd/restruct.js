/****************************************************************************
 * Copyright (C) 2009-2010 GGA Software Services LLC
 * 
 * This file may be distributed and/or modified under the terms of the
 * GNU Affero General Public License version 3 as published by the Free
 * Software Foundation and appearing in the file LICENSE.GPL included in
 * the packaging of this file.
 * 
 * This file is provided AS IS with NO WARRANTY OF ANY KIND, INCLUDING THE
 * WARRANTY OF DESIGN, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
 ***************************************************************************/

// rnd.ReStruct constructor and utilities are defined here
//
// ReStruct is to store all the auxiliary information for
//  chem.Struct while rendering
if (!window.chem || !util.Vec2 || !chem.Struct || !window.rnd || !rnd.Visel)
	throw new Error("Vec2, Molecule and Visel should be defined first");

if (!window.rnd)
	rnd = {};

rnd.ReAtom = function (/*chem.Atom*/atom)
{
	this.a = atom;
	this.showLabel = false;
	this.visel = new rnd.Visel(rnd.Visel.TYPE.ATOM);
	this.hydrogenOnTheLeft = false;
	this.badConn = false;

	this.highlight = false;
	this.highlighting = null;
	this.sGroupHighlight = false;
	this.sGroupHighlighting = null;
	this.selected = false;
	this.selectionPlate = null;
	
	this.component = -1;
}

rnd.ReBond = function (/*chem.Bond*/bond)
{
	this.b = bond;
	this.doubleBondShift = 0;
	
	this.visel = new rnd.Visel(rnd.Visel.TYPE.BOND);

	this.highlight = false;
	this.highlighting = null;
	this.selected = false;
	this.selectionPlate = null;
}

rnd.ReStruct = function (molecule, render)
{
	this.render = render;
	this.atoms = new util.Map();
	this.bonds = new util.Map();
	this.reloops = new util.Map();
	this.molecule = molecule || new Struct();
	this.initialized = false;
	this.layers = [];
	this.initLayers();
	this.chiral = {
		p: null,
		ps: null,
		visel: new rnd.Visel(rnd.Visel.TYPE.CHIRAL)
	};

	this.connectedComponents = new util.Pool();
	this.bondsChanged = {};
	this.atomsChanged = {};
	this.structChanged = false;
	this.viselsChanged = {};

	molecule.atoms.each(function(aid, atom){
		this.atoms.set(aid, new rnd.ReAtom(atom));
	}, this);

	molecule.bonds.each(function(bid, bond){
		this.bonds.set(bid, new rnd.ReBond(bond));
	}, this);

	molecule.loops.each(function(lid, loop){
		this.reloops.set(lid, new rnd.ReLoop(loop));
	}, this);
	
	this.coordProcess();
	
	this.tmpVisels = [];
}

rnd.ReStruct.prototype.connectedComponentRemoveAtom = function (aid, atom) {
	atom = atom || this.atoms.get(aid);
	if (atom.component < 0)
		return;
	var cc = this.connectedComponents.get(atom.component);
	util.Set.remove(cc, aid);
	if (util.Set.size(cc) < 1)
		this.connectedComponents.remove(atom.component);
	atom.component = -1;
}

rnd.ReStruct.prototype.printConnectedComponents = function () {
	var strs = [];
	this.connectedComponents.each(function(ccid, cc){
		strs.push(' ' + ccid + ':[' + util.Set.list(cc).toString() + '].' + util.Set.size(cc).toString());
	}, this);
	console.log(strs.toString());
}

rnd.ReStruct.prototype.clearConnectedComponents = function () {
	this.connectedComponents.clear();
	this.atoms.each(function(aid, atom) {
		atom.component = -1;
	});
}

rnd.ReStruct.prototype.getConnectedComponent = function (aid, adjacentComponents) {
	var list = [aid];
	var ids = util.Set.empty();

	while (list.length > 0) {
		(function() {
			var aid = list.pop();
			util.Set.add(ids, aid);
			var atom = this.atoms.get(aid);
			if (atom.component >= 0) {
				util.Set.add(adjacentComponents, atom.component);
				return;
			}
			for (var i = 0; i < atom.a.neighbors.length; ++i) {
				var neiId = this.molecule.halfBonds.get(atom.a.neighbors[i]).end;
				if (!util.Set.contains(ids, neiId))
					list.push(neiId);
			}
		}).apply(this);
	}
	
	return ids;
}

rnd.ReStruct.prototype.addConnectedComponent = function (ids) {
	var compId = this.connectedComponents.add(ids);
	util.Set.each(ids, function(aid) {
		this.atoms.get(aid).component = compId;
	}, this);
	return compId;
}

rnd.ReStruct.prototype.removeConnectedComponent = function (ccid) {
	util.Set.each(this.connectedComponents.get(ccid), function(aid) {
		this.atoms.get(aid).component = -1;
	}, this);
	return this.connectedComponents.remove(ccid);
}

rnd.ReStruct.prototype.connectedComponentMergeIn = function (ccid, set) {
	util.Set.each(set, function(aid) {
		this.atoms.get(aid).component = ccid;
	}, this);
	util.Set.mergeIn(this.connectedComponents.get(ccid), set);
}

rnd.ReStruct.prototype.assignConnectedComponents = function () {
	this.atoms.each(function(aid,atom){
		if (atom.component >= 0)
			return;
		var adjacentComponents = util.Set.empty();
		var ids = this.getConnectedComponent(aid, adjacentComponents);
		var ccid0 = this.addConnectedComponent(ids);
		util.Set.each(adjacentComponents, function(ccid1){
			var ids = this.connectedComponents.get(ccid1);
			this.connectedComponentMergeIn(ccid0, ids);
			this.connectedComponents.remove(ccid1);
		}, this);			
	}, this);
}

rnd.ReStruct.prototype.initLayers = function () {
	for (var group in rnd.ReStruct.layerMap)
		this.layers[rnd.ReStruct.layerMap[group]] =
		this.render.paper.rect(0, 0, 10, 10)
		.attr({
			'fill':'#000',
			'opacity':'0.0'
		}).toFront();
}

rnd.ReStruct.prototype.insertInLayer = function (lid, path) {
	path.insertBefore(this.layers[lid]);
}

rnd.ReStruct.prototype.clearMarks = function () {
	this.bondsChanged = {};
	this.atomsChanged = {};
	this.structChanged = false;
}

rnd.ReStruct.prototype.markBondRemoved = function () {
	this.structChanged = true;
}

rnd.ReStruct.prototype.markAtomRemoved = function () {
	this.structChanged = true;
}

rnd.ReStruct.prototype.markBond = function (bid, mark) {
	this.bondsChanged[bid] = (bid in this.bondsChanged) ?
	Math.max(mark, this.bondsChanged[bid]) : mark;
	this.clearVisel(this.bonds.get(bid).visel);
}

rnd.ReStruct.prototype.markAtom = function (aid, mark) {
	this.atomsChanged[aid] = (aid in this.atomsChanged) ?
	Math.max(mark, this.atomsChanged[aid]) : mark;
	this.clearVisel(this.atoms.get(aid).visel);
}

rnd.ReStruct.prototype.eachVisel = function (func, context) {
	this.atoms.each(function(aid, atom){
		func.call(context, atom.visel);
	}, this);
	this.bonds.each(function(bid, bond){
		func.call(context, bond.visel);
	}, this);
	if (this.rxnArrow != null)
		func.call(context, this.rxnArrow.visel);
	if (this.chiral.p != null)
		func.call(context, this.chiral.visel);
	this.molecule.sgroups.each(function(sid, sgroup){
		func.call(context, sgroup.visel);
	}, this);
	this.reloops.each(function(rlid, reloop) {
		func.call(context, reloop.visel);
	}, this);
	for (var i = 0; i < this.tmpVisels.length; ++i)
		func.call(context, this.tmpVisels[i]);
}

rnd.ReStruct.prototype.translate = function (d) {
	this.eachVisel(function(visel){
		this.translateVisel(visel, d);
	}, this);
}

rnd.ReStruct.prototype.scale = function (s) {
	// NOTE: bounding boxes are not valid after scaling
	this.eachVisel(function(visel){
		this.scaleVisel(visel, s);
	}, this);
}

rnd.ReStruct.prototype.translateVisel = function (visel, d) {
	var i;
	for (i = 0; i < visel.paths.length; ++i)
		visel.paths[i].translate(d.x, d.y);
	for (i = 0; i < visel.boxes.length; ++i)
		visel.boxes[i].translate(d);
	if (visel.boundingBox != null)
		visel.boundingBox.translate(d);
}

rnd.ReStruct.prototype.scaleRPath = function (path, s) {
	if (path.type == "set") { // TODO: rework scaling
		for (var i = 0; i < path.length; ++i)
			this.scaleRPath(path[i], s);
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

rnd.ReStruct.prototype.scaleVisel = function (visel, s) {
	for (var i = 0; i < visel.paths.length; ++i)
		this.scaleRPath(visel.paths[i], s);
}

rnd.ReStruct.prototype.clearVisels = function () {
	// TODO: check if we need this
	this.eachVisel(function(visel){
		this.clearVisel(visel);
	}, this);
}

rnd.ReStruct.prototype.update = function (force)
{
	force = force || !this.initialized;

	// check items to update
	var id;
	if (force) {
		this.atoms.each(function(aid){
			this.atomsChanged[aid] = 1;
		}, this);
		this.bonds.each(function(bid){
			this.bondsChanged[bid] = 1;
		}, this);
	} else {
		// check if some of the items marked are already gone
		for (id in this.atomsChanged)
			if (!this.atoms.has(id))
				delete this.atomsChanged[id];
		for (id in this.bondsChanged)
			if (!this.bonds.has(id))
				delete this.bondsChanged[id];
	}
	for (id in this.atomsChanged)
		this.connectedComponentRemoveAtom(id);

	for (id in this.atomsChanged) {
		this.clearVisel(this.atoms.get(id).visel);
		this.structChanged |= this.atomsChanged[id] > 0;
	}
	for (id in this.bondsChanged) {
		this.clearVisel(this.bonds.get(id).visel);
		this.structChanged |= this.bondsChanged[id] > 0;
	}
	if (this.rxnArrow != null)
		this.clearVisel(this.rxnArrow.visel);
	if (this.chiral.visel != null)
		this.clearVisel(this.chiral.visel);
	// TODO: when to update sgroup?
	this.molecule.sgroups.each(function(sid, sgroup){
		this.clearVisel(sgroup.visel);
	}, this);
	for (var i = 0; i < this.tmpVisels.length; ++i)
		this.clearVisel(this.tmpVisels[i]);
	this.tmpVisels.clear();

	if (force) { // clear and recreate all half-bonds
		this.clearConnectedComponents();
		this.molecule.initHalfBonds();
		this.molecule.initNeighbors();
	}

	// only update half-bonds adjacent to atoms that have moved
	this.updateHalfBonds();
	this.sortNeighbors();
	this.assignConnectedComponents();
//	this.printConnectedComponents();
	this.setImplicitHydrogen();
	this.setHydrogenPos();
	this.initialized = true;

	this.scaleCoordinates();
	var updLoops = force || this.structChanged;
	if (updLoops)
		this.updateLoops();
	this.setDoubleBondShift();
	this.checkLabelsToShow();
	this.showLabels();
	this.shiftBonds();
	this.showBonds();
	if (updLoops)
		this.renderLoops();
	this.clearMarks();
	this.drawReactionArrow();
	this.drawSGroups();
	this.drawChiralLabel();
	
//	this.connectedComponents.each(function(ccid, cc){
//		var min = null;
//		var max = null;
//		util.Set.each(cc, function(aid){
//			var p = this.atoms.get(aid).a.ps;
//			if (min == null) {
//				min = max = p;
//			} else {
//				min = min.min(p);
//				max = max.max(p);
//			}
//		}, this);
//		if (max == null || min == null)
//			return;
//		var sz = max.sub(min);
//		var path = this.render.paper.rect(min.x, min.y, sz.x, sz.y)
//		.attr({
//			'fill':'#999',
//			'stroke':null
//		});
//		this.addTmpPath('background', path);
//	}, this);

	return true;
}

rnd.ReStruct.prototype.drawReactionArrow = function ()
{
	if (this.render.rxnMode) {
		var bbReact = this.getGroupBB(chem.Struct.FRAGMENT.REACTANT);
		var bbProd = this.getGroupBB(chem.Struct.FRAGMENT.PRODUCT);

		var centre = new util.Vec2(
			(bbReact.max.x + bbProd.min.x) / 2,
			(Math.min(bbReact.min.y, bbProd.min.y) + Math.max(bbReact.max.y, bbProd.max.y)) / 2);

		if (this.rxnArrow == null) {
			this.rxnArrow = {};
			this.rxnArrow.path = this.drawArrow(new util.Vec2(centre.x - this.render.scale, centre.y), new util.Vec2(centre.x + this.render.scale, centre.y));
			this.rxnArrow.visel = new rnd.Visel(rnd.Visel.TYPE.ARROW);
			// TODO: when to update reaction arrow?
			this.rxnArrow.visel.add(this.rxnArrow.path, util.Box2Abs.fromRelBox(this.rxnArrow.path.getBBox()));
		}
	}
}

rnd.ReStruct.prototype.drawSGroups = function ()
{
	this.molecule.sgroups.each(function (id, sgroup) {
		var path = sgroup.draw(this);
		this.addSGroupPath('data', sgroup.visel, path);
		if (sgroup.selected)
			this.showBracketSelection(id, sgroup, true);
		if (sgroup.highlight)
			this.showBracketHighlighting(id, sgroup, true);
	}, this);
}

rnd.ReStruct.prototype.drawChiralLabel = function ()
{
	var render = this.render;
	var paper = render.paper;
	var settings = render.settings;
	if (this.chiral.p != null) {
		if (this.chiral.ps == null) {
			this.chiral.ps = this.chiral.p.scaled(settings.scaleFactor);
		}

		this.chiral.path = paper.text(this.chiral.ps.x, this.chiral.ps.y, "Chiral")
		.attr({
			'font' : settings.font,
			'font-size' : settings.fontsz,
			'fill' : '#000'
		});
		this.addChiralPath('data', this.chiral.visel, this.chiral.path);
	}
}

rnd.ReStruct.prototype.getGroupBB = function (type)
{
	var min = null, max = null;
	// TODO: modify to use connected components
//	this.atoms.each(function(aid, atom){
//		if (chem.Struct.fragments.get(atom.a.fragment) == type) {
//			if (min == null) {
//				min = max = atom.a.ps;
//			} else {
//				min = min.min(atom.a.ps);
//				max = max.max(atom.a.ps);
//			}
//		}
//	}, this);
	return {
		'min': min,
		'max': max
	};
}

rnd.ReStruct.prototype.updateHalfBonds = function () {
	for (var aid in this.atomsChanged) {
		if (this.atomsChanged[aid] < 1)
			continue;
		this.molecule.atomUpdateHalfBonds(aid);
	}
}

rnd.ReStruct.prototype.sortNeighbors = function () {
	// sort neighbor halfbonds in CCW order
	for (var aid in this.atomsChanged) {
		if (this.atomsChanged[aid] < 1)
			continue;
		this.molecule.atomSortNeighbors(aid);
	}
}

rnd.ReStruct.prototype.setHydrogenPos = function () {
	// check where should the hydrogen be put on the left of the label
	for (var aid in this.atomsChanged) {
		var atom = this.atoms.get(aid);

		if (atom.a.neighbors.length == 0) {
			var elem = chem.Element.getElementByLabel(atom.a.label);
			if (elem != null) {
				atom.hydrogenOnTheLeft = chem.Element.elements.get(elem).putHydrogenOnTheLeft;
			}
			continue;
		}
		var yl = 1, yr = 1, nl = 0, nr = 0;
		for (var i = 0; i < atom.a.neighbors.length; ++i) {
			var d = this.molecule.halfBonds.get(atom.a.neighbors[i]).dir;
			var y = Math.abs(d.y);
			if (d.x <= 0) {
				yl = Math.min(yl, Math.abs(d.y));
				nl++;
			} else {
				yr = Math.min(yr, Math.abs(d.y));
				nr++;
			}
		}
		if (yl < 0.5 || yr < 0.5)
			atom.hydrogenOnTheLeft = yr < yl;
		else
			atom.hydrogenOnTheLeft = nr > nl;
	}
}

rnd.ReStruct.prototype.setImplicitHydrogen = function () {
	// calculate implicit hydrogens
	for (var aid in this.atomsChanged) {
		this.calcImplicitHydrogen(aid);
	}
}

rnd.ReLoop = function (loop)
{
	this.loop = loop;
	this.visel = new rnd.Visel(rnd.Visel.TYPE.LOOP);
	this.centre = new util.Vec2();
	this.radius = new util.Vec2();
}

rnd.ReStruct.prototype.findLoops = function ()
{
	var struct = this.molecule;
	// Starting from each half-bond not known to be in a loop yet,
	//  follow the 'next' links until the initial half-bond is reached or
	//  the length of the sequence exceeds the number of half-bonds available.
	// In a planar graph, as long as every bond is a part of some "loop" -
	//  either an outer or an inner one - every iteration either yields a loop
	//  or doesn't start at all. Thus this has linear complexity in the number
	//  of bonds for planar graphs.
	var i = 0, j, k, c, loop, loopId;
	struct.halfBonds.each(function (i, hb) {
		if (hb.loop == -1)
		{
			for (j = i, c = 0, loop = [];
				c <= struct.halfBonds.count();
				j = struct.halfBonds.get(j).next, ++c)
				{
				if (c > 0 && j == i) {
					var totalAngle = 2 * Math.PI;
					var convex = true;
					for (k = 0; k < loop.length; ++k)
					{
						var hba = struct.halfBonds.get(loop[k]);
						var hbb = struct.halfBonds.get(loop[(k + 1) % loop.length]);
						var angle = Math.atan2(
								util.Vec2.cross(hba.dir, hbb.dir),
								util.Vec2.dot(hba.dir, hbb.dir));
						if (angle > 0)
							convex = false;
						if (hbb.contra == loop[k]) // back and force one edge
							totalAngle += Math.PI;
						else
							totalAngle += angle;
					}
					if (Math.abs(totalAngle) < Math.PI) // loop is internal
						loopId = struct.loops.add(new chem.Loop(loop, struct, convex));
					else
						loopId = -2;
					loop.each(function(hbid){
						struct.halfBonds.get(hbid).loop = loopId;
						this.markBond(struct.halfBonds.get(hbid).bid, 1);
					}, this);
					if (loopId >= 0)
						this.reloops.set(loopId, new rnd.ReLoop(struct.loops.get(loopId)));
					break;
				} else {
					loop.push(j);
				}
			}
		}
	}, this);
}
	
rnd.ReStruct.prototype.coordProcess = function ()
{
	this.molecule.coordProject();
	var bb = this.molecule.getCoordBoundingBox();
	var avg = this.molecule.getAvgBondLength();
	if (avg < 0)
		avg = this.molecule.getAvgClosestAtomDistance();
	if (avg < 1e-3)
		avg = 1;
	var scale = 1 / avg;

	if (this.molecule.isChiral)
		this.chiral.p = new util.Vec2((bb.max.x - bb.min.x) * scale, -(bb.max.y - bb.min.y) * scale - 1);
	this.molecule.coordShiftFlipScale(bb.min, scale, bb.max.y - bb.min.y);
}

rnd.ReStruct.prototype.scaleCoordinates = function()
{
	var settings = this.render.settings;
	for (var aid in this.atomsChanged) {
		var atom = this.atoms.get(aid);
		atom.a.ps = atom.a.pp.scaled(settings.scaleFactor);
	}
}

rnd.ReStruct.prototype.atomAdd = function (pos, params)
{
	var pp = {};
	if (params)
		for (var p in params)
			pp[p] = params[p];
	pp.label = pp.label || 'C';
	var aid = this.molecule.atoms.add(new chem.Struct.Atom(pp));
	var atom = this.molecule.atoms.get(aid);
	var atomData = new rnd.ReAtom(atom);
	atomData.component = this.connectedComponents.add(util.Set.single(aid));
	this.atoms.set(aid, atomData);
	this.molecule._atomSetPos(aid, pos);
	return aid;
}

rnd.ReStruct.prototype.bondAdd = function (begin, end, params)
{
	if (begin == end)
		throw new Error("Distinct atoms expected");
	if (rnd.DEBUG && this.molecule.checkBondExists(begin, end))
		throw new Error("Bond already exists");
	var pp = {};
	if (params)
		for (var p in params)
			pp[p] = params[p];

	pp.type = pp.type || chem.Struct.BOND.TYPE.SINGLE;
	pp.begin = begin;
	pp.end = end;
	
	var bid = this.molecule.bonds.add(new chem.Struct.Bond(pp));
	var bond = this.molecule.bonds.get(bid);
	this.bonds.set(bid, new rnd.ReBond(bond));
	this.molecule.bondInitHalfBonds(bid);
	this.molecule.atomAddNeighbor(this.bonds.get(bid).b.hb1);
	this.molecule.atomAddNeighbor(this.bonds.get(bid).b.hb2);
	return bid;
}

rnd.ReStruct.prototype.bondFlip = function (bid)
{
	var data = this.bonds.get(bid).b;
	this.bondRemove(bid);
	return this.bondAdd(data.end, data.begin, data);
}

rnd.ReStruct.prototype.atomRemove = function (aid)
{
	var atom = this.atoms.get(aid);
	var set = this.connectedComponents.get(atom.component);
	util.Set.remove(set, aid);
	if (util.Set.size(set) == 0) {
		this.connectedComponents.remove(atom.component);
	}
	
	// clone neighbors array, as it will be modified
	var neiHb = Array.from(atom.a.neighbors);
	neiHb.each(function(hbid){
		var hb = this.molecule.halfBonds.get(hbid);
		this.bondRemove(hb.bid);
	},this);
	this.markAtomRemoved();
	this.clearVisel(atom.visel);
	this.atoms.unset(aid);
	this.molecule.atoms.remove(aid);
}

rnd.ReStruct.prototype.bondRemove = function (bid)
{
	var bond = this.bonds.get(bid);
	this.halfBondUnref(bond.b.hb1);
	this.halfBondUnref(bond.b.hb2);
	this.molecule.halfBonds.unset(bond.b.hb1);
	this.molecule.halfBonds.unset(bond.b.hb2);
	this.markBondRemoved();
	this.clearVisel(bond.visel);
	this.bonds.unset(bid);
	this.molecule.bonds.remove(bid);
}

rnd.ReStruct.prototype.loopRemove = function (loopId)
{
	var reloop = this.reloops.get(loopId);
	this.clearVisel(reloop.visel);
	for (var i = 0; i < reloop.loop.hbs.length; ++i) {
		var hb = this.molecule.halfBonds.get(reloop.loop.hbs[i]);
		hb.loop = -1;
		this.markBond(hb.bid, 1);
	}
	this.reloops.unset(loopId);
	this.molecule.loops.remove(loopId);
}

rnd.ReStruct.prototype.halfBondUnref = function (hbid)
{
	var hb = this.molecule.halfBonds.get(hbid);
	var atom = this.atoms.get(hb.begin);
	if (hb.loop >= 0)
		this.loopRemove(hb.loop);

	var pos = atom.a.neighbors.indexOf(hbid);
	var prev = (pos + atom.a.neighbors.length - 1) % atom.a.neighbors.length;
	var next = (pos + 1) % atom.a.neighbors.length;
	this.molecule.setHbNext(atom.a.neighbors[prev], atom.a.neighbors[next]);
	atom.a.neighbors.splice(pos, 1);
}

rnd.ReStruct.prototype.BFS = function (onAtom, orig, context) {
	orig = orig-0;
	var queue = new Array();
	var mask = {};
	queue.push(orig);
	mask[orig] = 1;
	while (queue.length > 0) {
		var aid = queue.shift();
		onAtom.call(context, aid);
		var atom = this.atoms.get(aid);
		for (var i = 0; i < atom.a.neighbors.length; ++i) {
			var nei = atom.a.neighbors[i];
			var hb = this.molecule.halfBonds.get(nei);
			if (!mask[hb.end]) {
				mask[hb.end] = 1;
				queue.push(hb.end);
			}
		}
	}
}

rnd.ReStruct.prototype.sGroupDelete = function (sgid)
{
	var sg = this.molecule.sgroups.get(sgid);
	var atoms = [];
	for (var i = 0; i < sg.atoms.length; ++i) {
		var aid = sg.atoms[i];
		util.Set.remove(this.atoms.get(aid).a.sgs, sgid);
		atoms.push(aid);
	}
	this.molecule.sgroups.remove(sgid);
	return atoms;
}
