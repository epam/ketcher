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

if (!window.Prototype)
    throw new Error("Prototype.js should be loaded first")
if (!window.rnd || !rnd.MolData)
    throw new Error("rnd.MolData should be defined prior to loading this file");

rnd.DEBUG = false;

rnd.logcnt = 0;
rnd.logmouse = false;
rnd.hl = false;

rnd.mouseEventNames = [
    'Click',
    'DblClick',
    'MouseOver',
    'MouseDown',
    'MouseMove',
    'MouseOut'
	];
rnd.entities = ['Atom', 'Bond', 'Canvas'];

rnd.actions = [
    'atomSetAttr',
    'atomSetHighlight',
    'atomAdd',
    'atomMove',
    'atomMoveRel',
    'atomMoveRelMultiple',
    'atomRemove',
    'bondSetAttr',
    'bondSetHighlight',
    'bondAdd',
    'bondFlip',
    'bondRemove'
];

rnd.RenderDummy = function (clientArea, scale, opt, viewSz)
{
    clientArea = $(clientArea);
    clientArea.innerHTML = "";
    this.paper = new Raphael(clientArea);
    this.paper.rect(0, 0, 100, 100).attr({'fill':'#0F0','stroke':'none'});
    this.setMolecule = function(){};
    this.update = function(){};
}

rnd.Render = function (clientArea, scale, opt, viewSz)
{
    this.opt = opt || {};
    this.opt.showSelectionRegions = this.opt.showSelectionRegions || false;
    this.opt.showAtomIds = this.opt.showAtomIds || false;
    this.opt.showBondIds = this.opt.showBondIds || false;
    this.opt.showHalfBondIds = this.opt.showHalfBondIds || false;
    this.opt.showLoopIds = this.opt.showLoopIds || false;
    this.opt.showValenceWarnings = !Object.isUndefined(this.opt.showValenceWarnings) ? this.opt.showValenceWarnings : true;
    this.opt.autoScale = this.opt.autoScale || false;
    this.opt.autoScaleMargin = this.opt.autoScaleMargin || 0;
    this.opt.atomColoring = this.opt.atomColoring || 0;

    this.scale = scale || 100;
	this.maxMinDist = this.scale / 3;
    this.offset = new chem.Vec2();
    clientArea = $(clientArea);
    clientArea.innerHTML = "";
    this.paper = new Raphael(clientArea);
    this.size = new chem.Vec2();
    this.viewSz = viewSz || new chem.Vec2(clientArea['clientWidth'] || 100, clientArea['clientHeight'] || 100);
    this.bb = new chem.Box2Abs(new chem.Vec2(), this.viewSz);
    this.curItem = {'type':'Canvas', 'id':-1};
    this.pagePos = new chem.Vec2();
    this.muteMouseOutMouseOver = false;
    this.dirty = true;
	this.selectionRect = null;
    this.rxnArrow = null;
    this.rxnMode = false;

    var render = this;
	var valueT = 0, valueL = 0;
	var element = clientArea;
	do {
	  valueT += element.offsetTop  || 0;
	  valueL += element.offsetLeft || 0;
	  element = element.offsetParent;
	} while (element);

	this.clientAreaPos = new chem.Vec2(valueL, valueT);

    // assign canvas events handlers
    rnd.mouseEventNames.each(function(eventName){
        clientArea.observe(eventName.toLowerCase(), function(event) {
			var name = '_onCanvas' + eventName;
			if (render[name])
				render[name](new rnd.MouseEvent(event));
            chem.stopEventPropagation(event);
			return chem.preventDefault(event);
            });
    }, this);

    this.ctab = new rnd.MolData(new chem.Molecule(), this);
    this.settings = null;
    this.styles = null;
    this.checkCurItem = true;

	// function(event, id){};
    this.onAtomClick = null;
    this.onAtomDblClick = null;
    this.onAtomMouseUp = null;
    this.onAtomMouseDown = null;
    this.onAtomMouseOver = null;
    this.onAtomMouseMove = null;
    this.onAtomMouseOut = null;
    this.onBondClick = null;
    this.onBondDblClick = null;
    this.onBondMouseUp = null;
    this.onBondMouseDown = null;
    this.onBondMouseOver = null;
    this.onBondMouseMove = null;
    this.onBondMouseOut = null;
    this.onCanvasClick = null;
    this.onCanvasDblClick = null;
    this.onCanvasMouseUp = null;
    this.onCanvasMouseDown = null;
    this.onCanvasMouseOver = null;
    this.onCanvasMouseMove = null;
    this.onCanvasMouseOut = null;
    this.onCanvasOffsetChanged = null; //function(newOffset, oldOffset){};
    this.onCanvasSizeChanged = null; //function(newSize, oldSize){};
}

rnd.Render.prototype.setCurrentItem = function (type, id, event) {
    var oldType = this.curItem.type, oldId = this.curItem.id;
    if (type != oldType || id != oldId) {
        this.curItem = {'type':type, 'id':id};
        if (oldType == 'Canvas' 
                || (oldType == 'Atom' && this.ctab.atoms.has(oldId))
                || (oldType == 'Bond' && this.ctab.bonds.has(oldId))) {
            var nameOut = 'on' + oldType + 'MouseOut';
            if (this[nameOut])
                this[nameOut](event, oldId);
        }
        var nameOver = 'on' + type + 'MouseOver';
        if (this[nameOver])
            this[nameOver](event, id);
    }
}

rnd.Render.prototype.checkCurrentItem = function (event) {
    if (this.offset) {
        this.pagePos = new chem.Vec2(event.pageX, event.pageY);
		var clientPos = null;
		if ('ui' in window && 'page2canvas' in ui)
			clientPos = new chem.Vec2(ui.page2canvas(event));
		else
			clientPos = this.pagePos.sub(this.clientAreaPos);
        var item = this.findClosestItem(this.client2Obj(clientPos));
        this.setCurrentItem(item.type, item.id, event);
    }
}

rnd.Render.prototype.client2Obj = function (clientPos) {
	return new chem.Vec2(clientPos).sub(this.offset);
}

chem.each(['MouseMove','MouseDown','MouseUp','Click','DblClick'],
	function(eventName) {
		rnd.Render.prototype['_onCanvas' + eventName] = function(event){
			this.checkCurrentItem(event);

			var name = 'on' + this.curItem.type + eventName;
			if (this[name])
				this[name](event, this.curItem.id);
		}
	}
);

rnd.Render.prototype.setScale = function (scale)
{
    this.scale = scale;
    this.dirty = true;
}

rnd.Render.prototype.setMolecule = function (ctab)
{
    this.paper.clear();
    this.ctab = new rnd.MolData(ctab, this);
    this.offset = null;
    this.size = null;
    this.bb = null;
}

chem.each(rnd.actions, function(action){
    rnd.Render.prototype[action] = function () {
        return this.processAction(action, chem.array(arguments));
    }
});

rnd.Render.prototype.coordViewToObj = function (v) {
    return v.sub(this.offset).scaled(1 / this.settings.scaleFactor);
}

rnd.Render.prototype.vecViewToObj = function (v) {
    return v.scaled(1 / this.settings.scaleFactor);
}

// molecule manipulation interface
rnd.Render.prototype.atomGetAttr = function (aid, name)
{
    // TODO: check attribute names
    return this.ctab.atoms.get(aid).a[name];
}

rnd.Render.prototype.invalidateAtom = function (aid, level)
{
    var atom = this.ctab.atoms.get(aid);
    this.ctab.markAtom(aid, level ? 1 : 0);
    for (var i = 0; i < atom.neighbors.length; ++i) {
        var hb = this.ctab.halfBonds.get(atom.neighbors[i]);
        this.ctab.markBond(hb.bid, 1);
        this.ctab.markAtom(hb.end, 0);
    }
}

rnd.Render.prototype.invalidateBond = function (bid)
{
    var bond = this.ctab.bonds.get(bid);
    this.invalidateAtom(bond.b.begin, 0);
    this.invalidateAtom(bond.b.end, 0);
}

rnd.Render.prototype.atomGetDegree = function (aid)
{
    return this.ctab.atoms.get(aid).neighbors.length;
}

rnd.Render.prototype.isBondInRing = function (bid) {
    var bond = this.ctab.bonds.get(bid);
    return this.ctab.halfBonds.get(bond.hb1).loop >= 0 ||
        this.ctab.halfBonds.get(bond.hb2).loop >= 0;
}

rnd.Render.prototype.atomGetNeighbors = function (aid)
{
    var atom = this.ctab.atoms.get(aid);
    var neiAtoms = [];
    for (var i = 0; i < atom.neighbors.length; ++i) {
        var hb = this.ctab.halfBonds.get(atom.neighbors[i]);
        neiAtoms.push({
            'aid': hb.end - 0,
            'bid': hb.bid - 0});
    }
    return neiAtoms;
}

rnd.Render.prototype._atomSetAttr = function (aid, name, value)
{
    // TODO: allow multiple attributes at once?
    var atom = this.ctab.atoms.get(aid);
    atom.a[name] = value;
    this.invalidateAtom(aid);
}

rnd.Render.prototype._atomSetHighlight = function (aid, value)
{
    var atom = this.ctab.atoms.get(aid);
    atom.highlight = value;
	this.ctab.showAtomHighlighting(aid, atom, value);
}

rnd.Render.prototype._atomAdd = function (pos, params)
{
    var aid = this.ctab.atomAdd(this.coordViewToObj(new chem.Vec2(pos.x, pos.y)), params);
    this.ctab.markAtom(aid, 1);
    return aid;
}

rnd.Render.prototype._atomMove = function (aid, pos)
{
    this.ctab._atomSetPos(aid, this.coordViewToObj(new chem.Vec2(pos.x, pos.y)));
    this.invalidateAtom(aid, 1);
}

rnd.Render.prototype.atomGetPos = function (aid)
{
    return this.ctab.atoms.get(aid).pp.scaled(this.settings.scaleFactor)
        .add(this.offset);
}

rnd.Render.prototype._atomMoveRel = function (aid, d)
{    
    this.atomMove(aid, this.atomGetPos(aid).add(new chem.Vec2(d.x, d.y)));
}

rnd.Render.prototype._atomMoveRelMultiple = function (aidList, d)
{
    for (var i = 0; i < aidList.length; ++i) {
        var aid = aidList[i];
        this.atomMove(aid, this.atomGetPos(aid).add(new chem.Vec2(d.x, d.y)));
    }
}

rnd.Render.prototype._atomRemove = function (aid)
{
    this.ctab.atomRemove(aid);
}

rnd.Render.prototype.bondGetAttr = function (bid, name)
{
    return this.ctab.bonds.get(bid).b[name];
}

rnd.Render.prototype._bondSetAttr = function (bid, name, value)
{
    var bond = this.ctab.bonds.get(bid);
    bond.b[name] = value;
    this.invalidateBond(bid);
    // update loops involving this bond
}

rnd.Render.prototype._bondSetHighlight = function (bid, value)
{
    var bond = this.ctab.bonds.get(bid);
    bond.highlight = value;
	this.ctab.showBondHighlighting(bid, bond, value);
}

rnd.Render.prototype._bondAdd = function (begin, end, params)
{
    this.invalidateAtom(begin, 1);
    this.invalidateAtom(end, 1);
    var bid = this.ctab.bondAdd(begin, end, params);
    this.ctab.markBond(bid, 1);
    return bid;
}

rnd.Render.prototype._bondRemove = function (bid)
{
    this.invalidateBond(bid);
    this.ctab.bondRemove(bid);
}

rnd.Render.prototype._bondFlip = function (bid)
{
    var bond = this.ctab.bonds.get(bid);
    this.invalidateAtom(bond.b.begin, 1);
    this.invalidateAtom(bond.b.end, 1);
    var newBid = this.ctab.bondFlip(bid);
    this.ctab.markBond(newBid, 1);
    return newBid;
}

rnd.Render.prototype.setSelection = function (atomList, bondList)
{
    this.ctab.atoms.each(function(aid, atom){
        atom.selected = false;
		this.ctab.showAtomSelection(aid, atom, false);
    }, this);
    var i;
    for (i = 0; i < atomList.length; ++i) {
        var atom = this.ctab.atoms.get(atomList[i]);
        atom.selected = true;
		this.ctab.showAtomSelection(atomList[i], atom, true);
    }

    this.ctab.bonds.each(function(bid, bond){
        bond.selected = false;
		this.ctab.showBondSelection(bid, bond, false);
    }, this);
    for (i = 0; i < bondList.length; ++i) {
        var bond = this.ctab.bonds.get(bondList[i]);
        bond.selected = true;
		this.ctab.showBondSelection(bondList[i], bond, true);
    }
}

rnd.Render.prototype.initStyles = function ()
{
    // TODO move fonts, dashed lines, etc. here
    var settings = this.settings;
    this.styles = {};
    this.styles.lineattr = {stroke: '#000',
        'stroke-width': settings.lineWidth, 'stroke-linecap' : 'round',
        'stroke-linejoin' : 'round'};
    this.styles.selectionStyle = {'fill':'#7f7', 'stroke':'none'};
    this.styles.selectionZoneStyle = {'fill':'#000', 'stroke':'none', 'opacity':0.0};
    this.styles.highlightStyle = {'stroke':'#0c0', 'stroke-width':0.8*settings.lineWidth};
    this.styles.sgroupBracketStyle = {'stroke':'#000', 'stroke-width':0.5*settings.lineWidth};
    this.styles.atomSelectionPlateRadius = settings.labelFontSize * 1.2 ;
}

rnd.Render.prototype.initSettings = function()
{
    var settings = this.settings = {};
    settings.delta = this.ctab.getCoordBoundingBox();
    settings.margin = 0.1;
    settings.scaleFactor = this.scale;
    settings.lineWidth = settings.scaleFactor / 20;
    settings.bondShift = settings.scaleFactor / 6;
    settings.bondSpace = settings.scaleFactor / 7;
    settings.labelFontSize = Math.ceil(1.9 * (settings.scaleFactor / 6)); // TODO: don't round?
    settings.subFontSize = Math.ceil(0.7 * settings.labelFontSize);
    // font size is not determined by the number in this string,
    //  but by the 'font-size' property
    settings.font = '30px "Arial"';
    settings.fontsz = this.settings.labelFontSize;
    settings.fontszsub = this.settings.subFontSize;
}

rnd.Render.prototype.getBoundingBox = function ()
{
    var bb = null, vbb;
    this.ctab.eachVisel(function(visel){
        vbb = visel.boundingBox;
        if (vbb)
            bb = bb ? chem.Box2Abs.union(bb, vbb) : vbb.clone();
    }, this);
    if (!bb)
        bb = new chem.Box2Abs(0, 0, 0, 0);
    return bb;
}

rnd.Render.prototype.setPaperSize = function (sz)
{
    var oldSz = this.sz;
    this.sz = sz;
    this.paper.setSize(sz.x, sz.y);
	if (this.onCanvasSizeChanged)
		this.onCanvasSizeChanged(sz, oldSz);
}

rnd.Render.prototype.setOffset = function (offset)
{
    var oldOffset = this.offset;
    this.offset = offset;
	if (this.onCanvasOffsetChanged)
		this.onCanvasOffsetChanged(offset, oldOffset);
}

rnd.Render.prototype.getElementPos = function (obj)
{
	var curleft = 0, curtop = 0;

    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while ((obj = obj.offsetParent));
    }
    return new chem.Vec2(curleft,curtop);
}

rnd.Render.prototype.drawSelectionRectangle = function (r) {
	if (this.selectionRect)
		this.selectionRect.remove();
	this.selectionRect = null;
	if (r) {
		if (!('x0' in r && 'x1' in r && 'y0' in r && 'y1' in r)) // DBG
			throw "Rectangle format invalid";
		this.selectionRect = this.paper.rect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0).
			attr({'stroke':'#000', 'stroke-width':'1px'});
	}	
}

rnd.Render.prototype.getElementsInRectangle = function (rect) {
    var bondList = new Array();
    var atomList = new Array();
    var x0 = rect.x0 - 0, x1 = rect.x1 - 0, y0 = rect.y0 - 0, y1 = rect.y1 - 0;
    x0 -= this.offset.x;
    x1 -= this.offset.x;
    y0 -= this.offset.y;
    y1 -= this.offset.y;
    this.ctab.bonds.each(function (bid, bond){
        var centre = chem.Vec2.lc2(this.ctab.atoms.get(bond.b.begin).ps, 0.5,
             this.ctab.atoms.get(bond.b.end).ps, 0.5);
        if (centre.x > x0 && centre.x < x1 && centre.y > y0 && centre.y < y1)
            bondList.push(bid);
    }, this);
    this.ctab.atoms.each(function(aid, atom){
        if (atom.ps.x > x0 && atom.ps.x < x1 && atom.ps.y > y0 && atom.ps.y < y1)
            atomList.push(aid);
    }, this);
    return [atomList, bondList];
}

rnd.Render.prototype.drawSelectionPolygon = function (r) {
	if (this.selectionRect)
		this.selectionRect.remove();
	this.selectionRect = null;
	if (r) {
		var v = r[r.length - 1];
		var pstr = "M"+v.x.toString()+","+v.y.toString();
		for (var i = 0; i < r.length; ++i) {
			v = r[i];
			pstr += "L"+v.x.toString()+","+v.y.toString();
		}
		this.selectionRect = this.paper.path(pstr).
			attr({'stroke':'#000', 'stroke-width':'1px'});
	}
}

rnd.Render.prototype.isPointInPolygon = function (r, p) {
	var d = new chem.Vec2(0, 1);
	var n = d.rotate(Math.PI/2);
	var v0 = chem.Vec2.diff(r[r.length - 1], p);
	var n0 = chem.Vec2.dot(n, v0);
	var d0 = chem.Vec2.dot(d, v0);
	var counter = 0;
	var eps = 1e-5;

	for (var i = 0; i < r.length; ++i) {
		var v1 = chem.Vec2.diff(r[i], p);
		var n1 = chem.Vec2.dot(n, v1);
		var d1 = chem.Vec2.dot(d, v1);
		if (n1 * n0 < eps)
		{
			if (d1 * d0 > -eps) {
				if (d0 > -eps)
					counter++;
			} else if ((Math.abs(n0) * Math.abs(d1) - Math.abs(n1) * Math.abs(d0)) * d1 > 0) {
					counter++;
			}
		}
		v0 = v1;
		n0 = n1;
		d0 = d1;
	}
	return (counter % 2) != 0;
}

rnd.Render.prototype.getElementsInPolygon = function (rr) {
    var bondList = new Array();
    var atomList = new Array();
	var r = [];
	for (var i = 0; i < rr.length; ++i) {
		r[i] = new chem.Vec2(rr[i].x, rr[i].y).sub(this.offset);
	}
    this.ctab.bonds.each(function (bid, bond){
        var centre = chem.Vec2.lc2(this.ctab.atoms.get(bond.b.begin).ps, 0.5,
             this.ctab.atoms.get(bond.b.end).ps, 0.5);
        if (this.isPointInPolygon(r, centre))
            bondList.push(bid);
    }, this);
    this.ctab.atoms.each(function(aid, atom){
        if (this.isPointInPolygon(r, atom.ps))
            atomList.push(aid);
    }, this);
    return [atomList, bondList];
}

rnd.Render.prototype.testPolygon = function () {
	var rr = []
	var zz = 100;
//	rr = [
//		{x:10,y:10},
//		{x:90,y:10},
//		{x:30,y:80},
//		{x:90,y:60}
//	];
	rr = [
		{x:50,y:10},
		{x:20,y:90},
		{x:90,y:30},
		{x:10,y:30},
		{x:90,y:80}
	];
//	for (var j = 0; j < 4; ++j) {
//		rr.push({'x':Math.random() * zz, 'y':Math.random() * zz}) ;
//	}
	this.drawSelectionPolygon(rr);
	for (var k = 0; k < 1000; ++k) {
		var p = new chem.Vec2(Math.random() * zz, Math.random() * zz);
		var isin = this.isPointInPolygon(rr, p);
		var color = isin ? '#0f0' : '#f00';
		this.paper.circle(p.x, p.y, 2).attr({'fill':color,'stroke':'none'});
	}
	this.drawSelectionPolygon(rr);
}

rnd.Render.prototype.processAction = function (action, args)
{
    var id = parseInt(args[0]);
    if (action == 'atomRemove' && this.curItem.type == 'Atom'
        && this.curItem.id == id && this._onAtomMouseOut) {
        this._onAtomMouseOut({'pageX':this.pagePos.x, 'pageY':this.pagePos.y},
            this.curItem.id);
    }
	if (action == 'bondRemove' && this.curItem.type == 'Bond'
        && this.curItem.id == id && this._onBondMouseOut) {
        this._onBondMouseOut({'pageX':this.pagePos.x, 'pageY':this.pagePos.y},
            this.curItem.id);
    }
    this.muteMouseOutMouseOver = true;
    var ret = this['_' + action].apply(this, args);
    this.muteMouseOutMouseOver = false;
    if (action == 'atomAdd' || action == 'bondAdd')
        this.checkCurItem = true;
    return ret;
}

rnd.Render.prototype.update = function (force)
{
    this.muteMouseOutMouseOver = true;

    if (!this.settings || this.dirty) {
        if (this.opt.autoScale)
        {
            var cbb = this.ctab.getCoordBoundingBox();
            // this is only an approximation to select some scale that's close enough to the target one
		    var sy = cbb.max.y - cbb.min.y > 0 ? this.viewSz.y / (cbb.max.y - cbb.min.y) : 100;
		    var sx = cbb.max.x - cbb.min.x > 0 ? this.viewSz.x / (cbb.max.x - cbb.min.x) : 100;
            this.scale = Math.max(sy, sx);
        }
        this.initSettings();
        this.initStyles();
        this.dirty = false;
        force = true;
    }

	var start = (new Date).getTime();
	var changes = this.ctab.update(force);
	var time = (new Date).getTime() - start;
	if (force && $('log'))
		$('log').innerHTML = time.toString() + '\n';
    if (changes) {
        var sf = this.settings.scaleFactor;
        var bb = this.getBoundingBox();

        if (!this.opt.autoScale) {
            var ext = chem.Vec2.UNIT.scaled(sf);
            bb = bb.extend(ext, ext);
            if (this.bb)
                this.bb = chem.Box2Abs.union(this.bb, bb);
            else
            {
                var d = this.viewSz.sub(bb.sz()).scaled(0.5).max(chem.Vec2.ZERO);
                this.bb = bb.extend(d, d);
            }
            bb = this.bb.clone();

            var sz = chem.Vec2.max(bb.sz().floor(), this.viewSz);
            var offset = bb.p0.negated().ceil();
            if (!this.sz || sz.sub(this.sz).length() > 0)
                this.setPaperSize(sz);

            var oldOffset = this.offset || new chem.Vec2();
            var delta = offset.sub(oldOffset);
            if (!this.offset || delta.length() > 0) {
                this.setOffset(offset);
                this.ctab.translate(delta);
                this.bb.translate(delta);
            }
        } else {
            var sz1 = bb.sz();
            var marg = new chem.Vec2(this.opt.autoScaleMargin, this.opt.autoScaleMargin)
            var csz = this.viewSz.sub(marg.scaled(2));
            if (csz.x < 1 || csz.y < 1)
                throw new Error("View box too small for the given margin");
            var rescale = Math.min(csz.x / sz1.x, csz.y / sz1.y);
            this.ctab.scale(rescale);
            var offset1 = csz.sub(sz1.scaled(rescale)).scaled(0.5).add(marg).sub(bb.pos().scaled(rescale));
            this.ctab.translate(offset1);
        }
    }
	this.ctab.viselsChanged = {};

    this.muteMouseOutMouseOver = false;
    if (this.checkCurItem) {
        this.checkCurItem = false;
		var event = new rnd.MouseEvent({'pageX':this.pagePos.x, 'pageY':this.pagePos.y});
        this.checkCurrentItem(event);
    }
}

rnd.Render.prototype.testMoveRel = function () {
    this.atomMoveRel(31, {'x':0,'y':0});
    this.update();
}

rnd.Render.prototype.checkBondExists = function (begin, end) {
    return this.ctab.checkBondExists(begin, end);
}

rnd.Render.prototype.findClosestAtom = function (pos, minDist) {
	var closestAtom = null;
	minDist = minDist || this.maxMinDist;
	minDist = Math.min(minDist, this.maxMinDist);
	this.ctab.atoms.each(function(aid, atom){
		var dist = chem.Vec2.dist(pos, atom.ps);
		if (dist < minDist) {
			closestAtom = aid;
			minDist = dist;
		}
	}, this);
	if (closestAtom != null)
		return {'id':closestAtom,'dist':minDist};
	return null;
}

rnd.Render.prototype.findClosestBond = function (pos, minDist) {
	var closestBond = null;
	minDist = minDist || this.maxMinDist;
	minDist = Math.min(minDist, this.maxMinDist);
	this.ctab.bonds.each(function(bid, bond){
		var hb = this.ctab.halfBonds.get(bond.hb1);
		var d = hb.dir;
		var n = hb.norm;
		var p1 = this.ctab.atoms.get(bond.b.begin).ps,
			p2 = this.ctab.atoms.get(bond.b.end).ps;

		var inStripe = chem.Vec2.dot(pos.sub(p1),d) * chem.Vec2.dot(pos.sub(p2),d) < 0;
		if (inStripe) {
			var dist = Math.abs(chem.Vec2.dot(pos.sub(p1),n));
			if (dist < minDist) {
				closestBond = bid;
				minDist = dist;
			}
		}
	}, this);
	if (closestBond != null)
		return {'id':closestBond,'dist':minDist};
	return null;
}

rnd.Render.prototype.findClosestItem = function (pos) {
	var atom = this.findClosestAtom(pos);
	if (atom != null)
		return {'type':'Atom', 'id':atom.id, 'dist':atom.dist};

	var bond = this.findClosestBond(pos);
	if (bond != null)
		return {'type':'Bond', 'id':bond.id, 'dist':bond.dist};

	return {'type':'Canvas','id':-1};
}
