// rnd.ReStruct constructor and utilities are defined here
//
// ReStruct is to store all the auxiliary information for
//  Struct while rendering
var Box2Abs = require('../util/box2abs');
var Map = require('../util/map');
var Pool = require('../util/pool');
var Set = require('../util/set');
var Vec2 = require('../util/vec2');
var util = require('../util');
var element = require('../chem/element');
var Bond = require('../chem/bond');
var Struct = require('../chem/struct');
var SGroup = require('../chem/sgroup');

var Visel = require('./visel');

var rnd = global.rnd = global.rnd || {};
var tfx = util.tfx;

var ReObject = require("./reobject")
var ReRxnPlus = require("./rerxnplus")
var ReRxnArrow = require("./rerxnarrow")
var ReFrag = require('./refrag')
var ReRGroup = require('./rergroup')
var ReDataSGroupData = require('./redatasgroupdata')
var ReChiralFlag = require('./rechiralflag')

var ReAtom = function (/*chem.Atom*/atom)
{
	this.init(Visel.TYPE.ATOM);

	this.a = atom; // TODO rename a to item
	this.showLabel = false;

	this.hydrogenOnTheLeft = false;

	this.component = -1;
};

ReAtom.prototype = new ReObject();
ReAtom.isSelectable = function () { return true; }

ReAtom.prototype.getVBoxObj = function (render) {
	if (this.visel.boundingBox)
		return ReObject.prototype.getVBoxObj.call(this, render);
	return new Box2Abs(this.a.pp, this.a.pp);
};

ReAtom.prototype.drawHighlight = function (render) {
	var ret = this.makeHighlightPlate(render);
	render.ctab.addReObjectPath('highlighting', this.visel, ret);
	return ret;
};

ReAtom.prototype.makeHighlightPlate = function (render) {
	var paper = render.paper;
	var styles = render.styles;
	var ps = render.ps(this.a.pp);
	return paper.circle(ps.x, ps.y, styles.atomSelectionPlateRadius)
	.attr(styles.highlightStyle);
};

ReAtom.prototype.makeSelectionPlate = function (restruct, paper, styles) {
	var ps = restruct.render.ps(this.a.pp);
	return paper.circle(ps.x, ps.y, styles.atomSelectionPlateRadius)
	.attr(styles.selectionStyle);
};

var ReBond = function (/*chem.Bond*/bond)
{
	this.init(Visel.TYPE.BOND);

	this.b = bond; // TODO rename b to item
	this.doubleBondShift = 0;
};
ReBond.prototype = new ReObject();
ReBond.isSelectable = function () { return true; }

ReBond.prototype.drawHighlight = function (render) {
	var ret = this.makeHighlightPlate(render);
	render.ctab.addReObjectPath('highlighting', this.visel, ret);
	return ret;
};

ReBond.prototype.makeHighlightPlate = function (render) {
	render.ctab.bondRecalc(render.settings, this);
	var c = render.ps(this.b.center);
	return render.paper.circle(c.x, c.y, 0.8 * render.styles.atomSelectionPlateRadius)
	.attr(render.styles.highlightStyle);
};

ReBond.prototype.makeSelectionPlate = function (restruct, paper, styles) {
	restruct.bondRecalc(restruct.render.settings, this);
	var c = restruct.render.ps(this.b.center);
	return paper.circle(c.x, c.y, 0.8 * styles.atomSelectionPlateRadius)
	.attr(styles.selectionStyle);
};

rnd.ReStruct = function (molecule, render, norescale)
{
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

	for (var map in rnd.ReStruct.maps) {
		this[map + 'Changed'] = {};
	}
	this.structChanged = false;

	molecule.atoms.each(function (aid, atom){
		this.atoms.set(aid, new ReAtom(atom));
	}, this);

	molecule.bonds.each(function (bid, bond){
		this.bonds.set(bid, new ReBond(bond));
	}, this);

	molecule.loops.each(function (lid, loop){
		this.reloops.set(lid, new rnd.ReLoop(loop));
	}, this);

	molecule.rxnPluses.each(function (id, item){
		this.rxnPluses.set(id, new ReRxnPlus(item));
	}, this);

	molecule.rxnArrows.each(function (id, item){
		this.rxnArrows.set(id, new ReRxnArrow(item));
	}, this);

	molecule.frags.each(function (id, item) {
		this.frags.set(id, new ReFrag(item));
	}, this);

	molecule.rgroups.each(function (id, item) {
		this.rgroups.set(id, new ReRGroup(item));
	}, this);

	molecule.sgroups.each(function (id, item) {
		this.sgroups.set(id, new rnd.ReSGroup(item));
		if (item.type == 'DAT' && !item.data.attached) {
			this.sgroupData.set(id, new ReDataSGroupData(item)); // [MK] sort of a hack, we use the SGroup id for the data field id
		}
	}, this);

	if (molecule.isChiral && !this.render.opt.hideChiralFlag) {
		var bb = molecule.getCoordBoundingBox();
		this.chiralFlags.set(0,new ReChiralFlag(new Vec2(bb.max.x, bb.min.y - 1)));
	}

	this.coordProcess(norescale);
};

rnd.ReStruct.prototype.connectedComponentRemoveAtom = function (aid, atom) {
	atom = atom || this.atoms.get(aid);
	if (atom.component < 0)
		return;
	var cc = this.connectedComponents.get(atom.component);
	Set.remove(cc, aid);
	if (Set.size(cc) < 1)
		this.connectedComponents.remove(atom.component);

	atom.component = -1;
};

rnd.ReStruct.prototype.printConnectedComponents = function () {
	var strs = [];
	this.connectedComponents.each(function (ccid, cc){
		strs.push(' ' + ccid + ':[' + Set.list(cc).toString() + '].' + Set.size(cc).toString());
	}, this);
	console.log(strs.toString());
};

rnd.ReStruct.prototype.clearConnectedComponents = function () {
	this.connectedComponents.clear();
	this.atoms.each(function (aid, atom) {
		atom.component = -1;
	});
};

rnd.ReStruct.prototype.getConnectedComponent = function (aid, adjacentComponents) {
	var list = (typeof(aid['length']) == 'number') ? util.array(aid) : [aid];
	var ids = Set.empty();

	while (list.length > 0) {
		(function () {
			var aid = list.pop();
			Set.add(ids, aid);
			var atom = this.atoms.get(aid);
			if (atom.component >= 0) {
				Set.add(adjacentComponents, atom.component);
			}
			for (var i = 0; i < atom.a.neighbors.length; ++i) {
				var neiId = this.molecule.halfBonds.get(atom.a.neighbors[i]).end;
				if (!Set.contains(ids, neiId))
					list.push(neiId);
			}
		}).apply(this);
	}

	return ids;
};

rnd.ReStruct.prototype.addConnectedComponent = function (ids) {
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

rnd.ReStruct.prototype.removeConnectedComponent = function (ccid) {
	Set.each(this.connectedComponents.get(ccid), function (aid) {
		this.atoms.get(aid).component = -1;
	}, this);
	return this.connectedComponents.remove(ccid);
};

rnd.ReStruct.prototype.connectedComponentMergeIn = function (ccid, set) {
	Set.each(set, function (aid) {
		this.atoms.get(aid).component = ccid;
	}, this);
	Set.mergeIn(this.connectedComponents.get(ccid), set);
};

rnd.ReStruct.prototype.assignConnectedComponents = function () {
	this.atoms.each(function (aid,atom){
		if (atom.component >= 0)
			return;
		var adjacentComponents = Set.empty();
		var ids = this.getConnectedComponent(aid, adjacentComponents);
		Set.each(adjacentComponents, function (ccid){
			this.removeConnectedComponent(ccid);
		}, this);
		this.addConnectedComponent(ids);
	}, this);
};

rnd.ReStruct.prototype.connectedComponentGetBoundingBox = function (ccid, cc, bb) {
	cc = cc || this.connectedComponents.get(ccid);
	bb = bb || {'min':null, 'max':null};
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

rnd.ReStruct.prototype.initLayers = function () {
	for (var group in rnd.ReStruct.layerMap)
		this.layers[rnd.ReStruct.layerMap[group]] =
		this.render.paper.rect(0, 0, 10, 10)
		.attr({
			'fill':'#000',
			'opacity':'0.0'
		}).toFront();
};

rnd.ReStruct.prototype.insertInLayer = function (lid, path) {
	path.insertBefore(this.layers[lid]);
};

rnd.ReStruct.prototype.clearMarks = function () {
	for (var map in rnd.ReStruct.maps) {
		this[map + 'Changed'] = {};
	}
	this.structChanged = false;
};

rnd.ReStruct.prototype.markItemRemoved = function () {
	this.structChanged = true;
};

rnd.ReStruct.prototype.markBond = function (bid, mark) {
	this.markItem('bonds', bid, mark);
};

rnd.ReStruct.prototype.markAtom = function (aid, mark) {
	this.markItem('atoms', aid, mark);
};

rnd.ReStruct.prototype.markItem = function (map, id, mark) {
	var mapChanged = this[map + 'Changed'];
	mapChanged[id] = (typeof(mapChanged[id]) != 'undefined') ?
		Math.max(mark, mapChanged[id]) : mark;
	if (this[map].has(id))
		this.clearVisel(this[map].get(id).visel);
};

rnd.ReStruct.prototype.eachVisel = function (func, context) {
	for (var map in rnd.ReStruct.maps) {
		this[map].each(function (id, item) {
			func.call(context, item.visel);
		}, this);
	}
};

rnd.ReStruct.prototype.getVBoxObj = function (selection)
{
	selection = selection || {};
	if (this.selectionIsEmpty(selection)) {
		for (var map in rnd.ReStruct.maps) {
			selection[map] = this[map].keys();
		}
	}
	var vbox = null;
	for (var map in rnd.ReStruct.maps) {
		if (selection[map]) {
			util.each(selection[map], function (id) {
				var box = this[map].get(id).getVBoxObj(this.render);
				if (box)
					vbox = vbox ? Box2Abs.union(vbox, box) : box.clone();
			}, this);
		}
	}
	vbox = vbox || new Box2Abs(0, 0, 0, 0);
	return vbox;
};

rnd.ReStruct.prototype.selectionIsEmpty = function (selection) {
	util.assert(!util.isUndefined(selection), '\'selection\' is not defined');
	if (util.isNull(selection))
		return true;
	for (var map in rnd.ReStruct.maps)
		if (selection[map] && selection[map].length > 0)
			return false;
	return true;
}

rnd.ReStruct.prototype.translate = function (d) {
	this.eachVisel(function (visel){
		visel.translate(d);
	}, this);
};

rnd.ReStruct.prototype.scale = function (s) {
	// NOTE: bounding boxes are not valid after scaling
	this.eachVisel(function (visel){
		this.scaleVisel(visel, s);
	}, this);
};

rnd.ReStruct.prototype.scaleRPath = function (path, s) {
	if (path.type == 'set') { // TODO: rework scaling
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
};

rnd.ReStruct.prototype.scaleVisel = function (visel, s) {
	for (var i = 0; i < visel.paths.length; ++i)
		this.scaleRPath(visel.paths[i], s);
};

rnd.ReStruct.prototype.clearVisels = function () {
	this.eachVisel(function (visel){
		this.clearVisel(visel);
	}, this);
};

rnd.ReStruct.prototype.findIncomingStereoUpBond = function (atom, bid0, includeBoldStereoBond) {
	return util.findIndex(atom.neighbors, function (hbid) {
		var hb = this.molecule.halfBonds.get(hbid);
		var bid = hb.bid;
		if (bid === bid0)
			return false;
		var neibond = this.bonds.get(bid);
		if (neibond.b.type === Bond.PATTERN.TYPE.SINGLE && neibond.b.stereo === Bond.PATTERN.STEREO.UP)
			return neibond.b.end === hb.begin || (neibond.boldStereo && includeBoldStereoBond);
		if (neibond.b.type === Bond.PATTERN.TYPE.DOUBLE && neibond.b.stereo === Bond.PATTERN.STEREO.NONE && includeBoldStereoBond && neibond.boldStereo)
			return true;
		return false;
	}, this);
}

rnd.ReStruct.prototype.checkStereoBold = function (bid0, bond) {
	var halfbonds = util.map([bond.b.begin, bond.b.end], function (aid) {
		var atom = this.molecule.atoms.get(aid);
		var pos =  this.findIncomingStereoUpBond(atom, bid0, false);
		return pos < 0 ? -1 : atom.neighbors[pos];
	}, this);
	util.assert(halfbonds.length === 2);
	bond.boldStereo = halfbonds[0] >= 0 && halfbonds[1] >= 0;
};

rnd.ReStruct.prototype.findIncomingUpBonds = function (bid0, bond) {
	var halfbonds = util.map([bond.b.begin, bond.b.end], function (aid) {
		var atom = this.molecule.atoms.get(aid);
		var pos =  this.findIncomingStereoUpBond(atom, bid0, true);
		return pos < 0 ? -1 : atom.neighbors[pos];
	}, this);
	util.assert(halfbonds.length === 2);
	bond.neihbid1 = this.atoms.get(bond.b.begin).showLabel ? -1 : halfbonds[0];
	bond.neihbid2 = this.atoms.get(bond.b.end).showLabel ? -1 : halfbonds[1];
};

rnd.ReStruct.prototype.checkStereoBoldBonds = function () {
	this.bonds.each(this.checkStereoBold, this);
};

rnd.ReStruct.prototype.update = function (force)
{
	force = force || !this.initialized;

	// check items to update
	var id;
	if (force) {
		(function (){
			for (var map in rnd.ReStruct.maps) {
				var mapChanged = this[map + 'Changed'];
				this[map].each(function (id){
					mapChanged[id] = 1;
				}, this);
			}
		}).call(this);
	} else {
		// check if some of the items marked are already gone
		(function (){
			for (var map in rnd.ReStruct.maps) {
				var mapChanged = this[map + 'Changed'];
				for (id in mapChanged)
					if (!this[map].has(id))
						delete mapChanged[id];
			}
		}).call(this);
	}
	for (id in this.atomsChanged)
		this.connectedComponentRemoveAtom(id);

	// clean up empty fragments
	// TODO: fragment removal should be triggered by the action responsible for the fragment contents removal and form an operation of its own
	var emptyFrags = this.frags.findAll(function (fid, frag) {
		return !frag.calcBBox(this.render, fid);
	}, this);
	for (var j = 0; j < emptyFrags.length; ++j) {
		var fid = emptyFrags[j];
		this.clearVisel(this.frags.get(fid).visel);
		this.frags.unset(fid);
		this.molecule.frags.remove(fid);
	}

	(function (){
		for (var map in rnd.ReStruct.maps) {
			var mapChanged = this[map + 'Changed'];
			for (id in mapChanged) {
				this.clearVisel(this[map].get(id).visel);
				this.structChanged |= mapChanged[id] > 0;
			}
		}
	}).call(this);
	if (this.structChanged)
		util.each(this.render.structChangeHandlers, function (handler){handler.call();});

	// TODO: when to update sgroup?
	this.sgroups.each(function (sid, sgroup){
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
	this.molecule.updateHalfBonds(new Map(this.atomsChanged).findAll(function (aid, status){ return status >= 0; }, this));
	this.molecule.sortNeighbors(new Map(this.atomsChanged).findAll(function (aid, status){ return status >= 1; }, this));
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
		this.renderLoops();
	this.drawReactionSymbols();
	this.drawSGroups();
	this.drawFragments();
	this.drawRGroups();
	this.chiralFlags.each(function (id, item) {
		if (this.chiralFlagsChanged[id] > 0)
			item.draw(this.render);
	}, this);
	this.clearMarks();
	return true;
};

rnd.ReStruct.prototype.drawReactionSymbols = function ()
{
	var item;
	var id;
	for (id in this.rxnArrowsChanged) {
		item = this.rxnArrows.get(id);
		this.drawReactionArrow(id, item);
	}
	for (id in this.rxnPlusesChanged) {
		item = this.rxnPluses.get(id);
		this.drawReactionPlus(id, item);
	}
};

rnd.ReStruct.prototype.drawReactionArrow = function (id, item)
{
	var centre = this.render.ps(item.item.pp);
	var path = this.drawArrow(new Vec2(centre.x - this.render.scale, centre.y), new Vec2(centre.x + this.render.scale, centre.y));
	item.visel.add(path, Box2Abs.fromRelBox(util.relBox(path.getBBox())));
	var offset = this.render.offset;
	if (offset != null)
		path.translateAbs(offset.x, offset.y);
};

rnd.ReStruct.prototype.drawReactionPlus = function (id, item)
{
	var centre = this.render.ps(item.item.pp);
	var path = this.drawPlus(centre);
	item.visel.add(path, Box2Abs.fromRelBox(util.relBox(path.getBBox())));
	var offset = this.render.offset;
	if (offset != null)
		path.translateAbs(offset.x, offset.y);
};

var drawGroupMul = function (remol, sgroup) {
	var render = remol.render;
	var set = render.paper.set();
	var inBonds = [], xBonds = [];
	var atomSet = Set.fromList(sgroup.atoms);
	SGroup.getCrossBonds(inBonds, xBonds, remol.molecule, atomSet);
	SGroup.bracketPos(sgroup, render, remol.molecule, xBonds);
	var bb = sgroup.bracketBox;
	var d = sgroup.bracketDir, n = d.rotateSC(1, 0);
	sgroup.areas = [bb];
	SGroup.drawBrackets(set, render, sgroup, xBonds, atomSet, bb, d, n, sgroup.data.mul);
	return set;
}

var drawGroupSru = function (remol, sgroup) {
	var render = remol.render;
	var set = render.paper.set();
	var inBonds = [], xBonds = [];
	var atomSet = Set.fromList(sgroup.atoms);
	SGroup.getCrossBonds(inBonds, xBonds, remol.molecule, atomSet);
	SGroup.bracketPos(sgroup, render, remol.molecule, xBonds);
	var bb = sgroup.bracketBox;
	var d = sgroup.bracketDir, n = d.rotateSC(1, 0);
	sgroup.areas = [bb];
	var connectivity = sgroup.data.connectivity || 'eu';
	if (connectivity == 'ht')
		connectivity = '';
	var subscript = sgroup.data.subscript || 'n';
	SGroup.drawBrackets(set, render, sgroup, xBonds, atomSet, bb, d, n, subscript, connectivity);
	return set;
}

var drawGroupSup = function (remol, sgroup) {
	var render = remol.render;
	var set = render.paper.set();
	var inBonds = [], xBonds = [];
	var atomSet = Set.fromList(sgroup.atoms);
	SGroup.getCrossBonds(inBonds, xBonds, remol.molecule, atomSet);
	SGroup.bracketPos(sgroup, render, remol.molecule, xBonds);
	var bb = sgroup.bracketBox;
	var d = sgroup.bracketDir, n = d.rotateSC(1, 0);
	sgroup.areas = [bb];
	SGroup.drawBrackets(set, render, sgroup, xBonds, atomSet, bb, d, n, sgroup.data.name, null, {
		'font-style': 'italic'
	});
	return set;
}

var drawGroupGen = function (remol, sgroup) {
	var render = remol.render;
	var paper = render.paper;
	var set = paper.set();
	var inBonds = [], xBonds = [];
	var atomSet = Set.fromList(sgroup.atoms);
	SGroup.getCrossBonds(inBonds, xBonds, remol.molecule, atomSet);
	SGroup.bracketPos(sgroup, render, remol.molecule, xBonds);
	var bb = sgroup.bracketBox;
	var d = sgroup.bracketDir, n = d.rotateSC(1, 0);
	sgroup.areas = [bb];
	SGroup.drawBrackets(set, render, sgroup, xBonds, atomSet, bb, d, n);
	return set;
}

var drawGroupDat = function (remol, sgroup) {
	var render = remol.render;
	var settings = render.settings;
	var paper = render.paper;
	var set = paper.set();
	var atoms = SGroup.getAtoms(remol, sgroup);
	var i;
	SGroup.bracketPos(sgroup, render, remol.molecule);
	sgroup.areas = sgroup.bracketBox ? [sgroup.bracketBox] : [];
	if (sgroup.pp == null) {
		// NB: we did not pass xbonds parameter to the backetPos method above,
		//  so the result will be in the regular coordinate system
		SGroup.setPos(remol, sgroup, sgroup.bracketBox.p1.add(new Vec2(0.5, 0.5)));
	}
	var ps = sgroup.pp.scaled(settings.scaleFactor);
	
	if (sgroup.data.attached) {
		for (i = 0; i < atoms.length; ++i) {
			var atom = remol.atoms.get(atoms[i]);
			var p = render.ps(atom.a.pp);
			var bb = atom.visel.boundingBox;
			if (bb != null) {
				p.x = Math.max(p.x, bb.p1.x);
			}
			p.x += settings.lineWidth; // shift a bit to the right
			var name_i = sgroup.showValue(paper, p, sgroup, settings);
			var box_i = util.relBox(name_i.getBBox());
			name_i.translateAbs(0.5 * box_i.width, -0.3 * box_i.height);
			set.push(name_i);
			var sbox_i = Box2Abs.fromRelBox(util.relBox(name_i.getBBox()));
			sbox_i = sbox_i.transform(render.scaled2obj, render);
			sgroup.areas.push(sbox_i);
		}
	} else {
		var name = sgroup.showValue(paper, ps, sgroup, settings);
		var box = util.relBox(name.getBBox());
		name.translateAbs(0.5 * box.width, -0.5 * box.height);
		set.push(name);
		var sbox = Box2Abs.fromRelBox(util.relBox(name.getBBox()));
		sgroup.dataArea = sbox.transform(render.scaled2obj, render);
		if (!remol.sgroupData.has(sgroup.id))
			remol.sgroupData.set(sgroup.id, new ReDataSGroupData(sgroup));
	}
	return set;
}

var SGroup_draw = {
	'MUL': drawGroupMul,
	'SRU': drawGroupSru,
	'SUP': drawGroupSup,
	'DAT': drawGroupDat,
	'GEN': drawGroupGen
};

var sgroup_draw = function (remol, sgroup) {
//	console.log("Draw Sgroup: " + sgroup.type); //  sgroup.type == MUL || SRU ||...
	return SGroup_draw[sgroup.type](remol, sgroup);
} 

rnd.ReStruct.prototype.drawSGroups = function ()
{
	util.each(this.molecule.sGroupForest.getSGroupsBFS().reverse(), function (id) {
		var resgroup = this.sgroups.get(id);
		var sgroup = resgroup.item;
		var remol = this.render.ctab;
		var path = sgroup_draw(remol, sgroup);
		this.addReObjectPath('data', resgroup.visel, path, null, true);
		resgroup.setHighlight(resgroup.highlight, this.render); // TODO: fix this
	}, this);
};

rnd.ReStruct.prototype.drawFragments = function () {
	this.frags.each(function (id, frag) {
		var path = frag.draw(this.render, id);
		if (path) this.addReObjectPath('data', frag.visel, path, null, true);
		// TODO fragment selection & highlighting
	}, this);
};

rnd.ReStruct.prototype.drawRGroups = function () {
	this.rgroups.each(function (id, rgroup) {
		var drawing = rgroup.draw(this.render);
		for (var group in drawing) {
			while (drawing[group].length > 0) {
				this.addReObjectPath(group, rgroup.visel, drawing[group].shift(), null, true);
			}
		}
		// TODO rgroup selection & highlighting
	}, this);
};

rnd.ReStruct.prototype.eachCC = function (func, type, context) {
	this.connectedComponents.each(function (ccid, cc) {
		if (!type || this.ccFragmentType.get(ccid) == type)
			func.call(context || this, ccid, cc);
	}, this);
};

rnd.ReStruct.prototype.getGroupBB = function (type)
{
	var bb = {'min':null, 'max':null};

	this.eachCC(function (ccid, cc) {
		bb = this.connectedComponentGetBoundingBox(ccid, cc, bb);
	}, type, this);

	return bb;
};

rnd.ReStruct.prototype.setHydrogenPos = function () {
	// check where should the hydrogen be put on the left of the label
	for (var aid in this.atomsChanged) {
		var atom = this.atoms.get(aid);

		if (atom.a.neighbors.length == 0) {
			var elem = element.getElementByLabel(atom.a.label);
			if (elem != null) {
				atom.hydrogenOnTheLeft = element.get(elem).putHydrogenOnTheLeft;
			}
			continue;
		}
		var yl = 1, yr = 1, nl = 0, nr = 0;
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

rnd.ReStruct.prototype.setImplicitHydrogen = function () {
	// calculate implicit hydrogens for atoms that have been modified
	this.molecule.setImplicitHydrogen(util.idList(this.atomsChanged));
};

rnd.ReLoop = function (loop)
{
	this.loop = loop;
	this.visel = new Visel(Visel.TYPE.LOOP);
	this.centre = new Vec2();
	this.radius = new Vec2();
};
rnd.ReLoop.prototype = new ReObject();
rnd.ReLoop.isSelectable = function () { return false; }

rnd.ReStruct.prototype.coordProcess = function (norescale)
{
	if (!norescale) {
		this.molecule.rescale();
	}
};

rnd.ReStruct.prototype.notifyAtomAdded = function (aid) {
	var atomData = new ReAtom(this.molecule.atoms.get(aid));
	atomData.component = this.connectedComponents.add(Set.single(aid));
	this.atoms.set(aid, atomData);
	this.markAtom(aid, 1);
};

rnd.ReStruct.prototype.notifyRxnPlusAdded = function (plid) {
	this.rxnPluses.set(plid, new ReRxnPlus(this.molecule.rxnPluses.get(plid)));
};

rnd.ReStruct.prototype.notifyRxnArrowAdded = function (arid) {
	this.rxnArrows.set(arid, new ReRxnArrow(this.molecule.rxnArrows.get(arid)));
};

rnd.ReStruct.prototype.notifyRxnArrowRemoved = function (arid) {
	this.markItemRemoved();
	this.clearVisel(this.rxnArrows.get(arid).visel);
	this.rxnArrows.unset(arid);
};

rnd.ReStruct.prototype.notifyRxnPlusRemoved = function (plid) {
	this.markItemRemoved();
	this.clearVisel(this.rxnPluses.get(plid).visel);
	this.rxnPluses.unset(plid);
};

rnd.ReStruct.prototype.notifyBondAdded = function (bid) {
	this.bonds.set(bid, new ReBond(this.molecule.bonds.get(bid)));
	this.markBond(bid, 1);
};

rnd.ReStruct.prototype.notifyAtomRemoved = function (aid) {
	var atom = this.atoms.get(aid);
	var set = this.connectedComponents.get(atom.component);
	Set.remove(set, aid);
	if (Set.size(set) == 0) {
		this.connectedComponents.remove(atom.component);
	}
	this.clearVisel(atom.visel);
	this.atoms.unset(aid);
	this.markItemRemoved();
};

rnd.ReStruct.prototype.notifyBondRemoved = function (bid) {
	var bond = this.bonds.get(bid);
	[bond.b.hb1, bond.b.hb2].each(function (hbid) {
		var hb = this.molecule.halfBonds.get(hbid);
		if (hb.loop >= 0)
			this.loopRemove(hb.loop);
	}, this);
	this.clearVisel(bond.visel);
	this.bonds.unset(bid);
	this.markItemRemoved();
};

rnd.ReStruct.prototype.loopRemove = function (loopId)
{
	if (!this.reloops.has(loopId))
		return;
	var reloop = this.reloops.get(loopId);
	this.clearVisel(reloop.visel);
	var bondlist = [];
	for (var i = 0; i < reloop.loop.hbs.length; ++i) {
		var hbid = reloop.loop.hbs[i];
		if (!this.molecule.halfBonds.has(hbid))
			continue;
		var hb = this.molecule.halfBonds.get(hbid);
		hb.loop = -1;
		this.markBond(hb.bid, 1);
		this.markAtom(hb.begin, 1);
		bondlist.push(hb.bid);
	}
	this.reloops.unset(loopId);
	this.molecule.loops.remove(loopId);
};

rnd.ReStruct.prototype.loopIsValid = function (rlid, reloop) {
	var halfBonds = this.molecule.halfBonds;
	var loop = reloop.loop;
	var bad = false;
	loop.hbs.each(function (hbid){
		if (!halfBonds.has(hbid) || halfBonds.get(hbid).loop !== rlid) {
			bad = true;
		}
	}, this);
	return !bad;
};

rnd.ReStruct.prototype.verifyLoops = function ()
{
	var toRemove = [];
	this.reloops.each(function (rlid, reloop){
		if (!this.loopIsValid(rlid, reloop)) {
			toRemove.push(rlid);
		}
	}, this);
	for (var i = 0; i < toRemove.length; ++i) {
		this.loopRemove(toRemove[i]);
	}
};

rnd.ReStruct.prototype.BFS = function (onAtom, orig, context) {
	orig = orig - 0;
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
};

rnd.ReSGroup = function (sgroup) {
	this.init(Visel.TYPE.SGROUP);

	this.item = sgroup;
};
rnd.ReSGroup.prototype = new ReObject();
rnd.ReSGroup.isSelectable = function () { return false; }


rnd.ReSGroup.findClosest = function (render, p) {
	var ret = null;
	var minDist = render.opt.selectionDistanceCoefficient;
	render.ctab.molecule.sgroups.each(function (sgid, sg){
		var d = sg.bracketDir, n = d.rotateSC(1, 0);
		var pg = new Vec2(Vec2.dot(p, d), Vec2.dot(p, n));
		for (var i = 0; i < sg.areas.length; ++i) {
			var box = sg.areas[i];
			var inBox = box.p0.y < pg.y && box.p1.y > pg.y && box.p0.x < pg.x && box.p1.x > pg.x;
			var xDist = Math.min(Math.abs(box.p0.x - pg.x), Math.abs(box.p1.x - pg.x));
			if (inBox && (ret == null || xDist < minDist)) {
				ret = sgid;
				minDist = xDist;
			}
		}
	}, this);
	if (ret != null)
		return {
			'id':ret,
			'dist':minDist
		};
	return null;
};

rnd.ReSGroup.prototype.drawHighlight = function (render) {
	var styles = render.styles;
	var settings = render.settings;
	var paper = render.paper;
	var sg = this.item;
	var bb = sg.bracketBox.transform(render.obj2scaled, render);
	var lw = settings.lineWidth;
	var vext = new Vec2(lw * 4, lw * 6);
	bb = bb.extend(vext, vext);
	var d = sg.bracketDir, n = d.rotateSC(1,0);
	var a0 = Vec2.lc2(d, bb.p0.x, n, bb.p0.y);
	var a1 = Vec2.lc2(d, bb.p0.x, n, bb.p1.y);
	var b0 = Vec2.lc2(d, bb.p1.x, n, bb.p0.y);
	var b1 = Vec2.lc2(d, bb.p1.x, n, bb.p1.y);

	var set = paper.set();
	sg.highlighting = paper
	.path('M{0},{1}L{2},{3}L{4},{5}L{6},{7}L{0},{1}', tfx(a0.x), tfx(a0.y), tfx(a1.x), tfx(a1.y), tfx(b1.x), tfx(b1.y), tfx(b0.x), tfx(b0.y))
	.attr(styles.highlightStyle);
	set.push(sg.highlighting);

	SGroup.getAtoms(render.ctab.molecule, sg).each(function (aid) {
		set.push(render.ctab.atoms.get(aid).makeHighlightPlate(render));
	}, this);
	SGroup.getBonds(render.ctab.molecule, sg).each(function (bid) {
		set.push(render.ctab.bonds.get(bid).makeHighlightPlate(render));
	}, this);
	render.ctab.addReObjectPath('highlighting', this.visel, set);
};

rnd.ReStruct.maps = {
	'atoms':       ReAtom,
	'bonds':       ReBond,
	'rxnPluses':   ReRxnPlus,
	'rxnArrows':   ReRxnArrow,
	'frags':       ReFrag,
	'rgroups':     ReRGroup,
	'sgroupData':  ReDataSGroupData,
	'chiralFlags': ReChiralFlag,
	'sgroups':     rnd.ReSGroup,
	'reloops':     rnd.ReLoop
};
