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
	throw new Error("Prototype.js should be loaded first");
if (!window.rnd || !rnd.ReStruct)
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
rnd.entities = ['Atom', 'RxnArrow', 'RxnPlus', 'Bond', 'Canvas'];

rnd.actions = [
	'atomSetAttr',
	'atomAddToSGroup',
	'atomRemoveFromSGroup',
	'atomClearSGroups',
	'atomAdd',
	'atomMove',
	'atomMoveRel',
	'multipleMoveRel',
	'atomRemove',
	'bondSetAttr',
	'bondAdd',
	'bondFlip',
	'bondRemove',
	'sGroupSetHighlight',
	'sGroupSetAttr',
	'sGroupSetType',
	'sGroupSetPos', // data s-group label position
	'rxnPlusAdd',
	'rxnPlusMove',
	'rxnPlusMoveRel',
	'rxnPlusRemove',
	'rxnArrowAdd',
	'rxnArrowMove',
	'rxnArrowMoveRel',
	'rxnArrowRemove'
];

rnd.logMethod = function () { };
//rnd.logMethod = function (method) {console.log("METHOD: " + method);}

rnd.RenderDummy = function (clientArea, scale, opt, viewSz)
{
	this.clientArea = clientArea = $(clientArea);
	clientArea.innerHTML = "";
	this.paper = new Raphael(clientArea);
	this.paper.rect(0, 0, 100, 100).attr({
		'fill':'#0F0',
		'stroke':'none'
	});
	this.setMolecule = function(){};
	this.update = function(){};
};

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
	this.opt.hideImplicitHydrogen = this.opt.hideImplicitHydrogen || false;
	this.opt.hideTerminalLabels = this.opt.hideTerminalLabels || false;
	this.opt.ignoreMouseEvents = this.opt.ignoreMouseEvents || false;
	this.opt.selectionDistanceCoefficient = (this.opt.selectionDistanceCoefficient || 0.4) - 0;

	this.useOldZoom = Prototype.Browser.IE;
	this.scale = scale || 100;
	this.baseScale = this.scale;
	this.offset = new util.Vec2();
	this.clientArea = clientArea = $(clientArea);
	clientArea.innerHTML = "";
	this.paper = new Raphael(clientArea);
	this.size = new util.Vec2();
	this.viewSz = viewSz || new util.Vec2(clientArea['clientWidth'] || 100, clientArea['clientHeight'] || 100);
	this.bb = new util.Box2Abs(new util.Vec2(), this.viewSz);
	this.curItem = {
		'type':'Canvas',
		'id':-1
	};
	this.pagePos = new util.Vec2();
	this.muteMouseOutMouseOver = false;
	this.dirty = true;
	this.selectionRect = null;
	this.rxnArrow = null;
	this.rxnMode = false;
	this.zoom = 1.0;

	var render = this;
	var valueT = 0, valueL = 0;
	var element = clientArea;
	do {
		valueT += element.offsetTop  || 0;
		valueL += element.offsetLeft || 0;
		element = element.offsetParent;
	} while (element);

	this.clientAreaPos = new util.Vec2(valueL, valueT);

    // rbalabanov: two-fingers scrolling & zooming for iPad
    // TODO should be moved to touch.js module, re-factoring needed
    //BEGIN
    clientArea.observe('touchstart', function(event) {
        if (event.touches.length == 2) {
            this._tui = this._tui || {};
            this._tui.center = {
                pageX : (event.touches[0].pageX + event.touches[1].pageX) / 2,
                pageY : (event.touches[0].pageY + event.touches[1].pageY) / 2
            };
            ui.setZoomStaticPointInit(ui.page2obj(this._tui.center));
        }
    });
    clientArea.observe('touchmove', function(event) {
        if ('_tui' in this && event.touches.length == 2) {
            this._tui.center = {
                pageX : (event.touches[0].pageX + event.touches[1].pageX) / 2,
                pageY : (event.touches[0].pageY + event.touches[1].pageY) / 2
            };
        }
    });
    clientArea.observe('gesturestart', function(event) {
        this._tui = this._tui || {};
        this._tui.scale0 = ui.render.zoom;
        event.preventDefault();
    });
    clientArea.observe('gesturechange', function(event) {
        ui.setZoomStaticPoint(this._tui.scale0 * event.scale, ui.page2canvas2(this._tui.center));
        ui.render.update();
        event.preventDefault();
    });
    clientArea.observe('gestureend', function(event) {
        delete this._tui;
        event.preventDefault();
    });
    //END
	
	clientArea.observe('onresize', function(event) {
        render.onResize();
    });

    // rbalabanov: here is temporary fix for "drag issue" on iPad
    //BEGIN
    if ('hiddenPaths' in rnd.ReStruct.prototype) {
        clientArea.observe('touchend', function(event) {
            if (event.touches.length == 0) {
                while (rnd.ReStruct.prototype.hiddenPaths.length > 0) rnd.ReStruct.prototype.hiddenPaths.pop().remove();
            }
        });
    }
    //END

    //rbalabanov: temporary
    //BEGIN
    clientArea.observe('mouseup', function(event) {
        ui.render.current_tool && ui.render.current_tool.processEvent('OnMouseUp', event);
    });
    clientArea.observe('touchend', function(event) {
        if (event.touches.length == 0) {
            ui.render.current_tool && ui.render.current_tool.processEvent('OnMouseUp', new rnd.MouseEvent(event));
        }
    });
    //END

	if (!this.opt.ignoreMouseEvents) {
		// assign canvas events handlers
		rnd.mouseEventNames.each(function(eventName){
            var bindEventName = eventName.toLowerCase();
            bindEventName = EventMap[bindEventName] || bindEventName;
			clientArea.observe(bindEventName, function(event) {
                var ntHandled = ui.render.current_tool && ui.render.current_tool.processEvent('On' + eventName, event);
                var name = '_onCanvas' + eventName;
				if (!(ui.render.current_tool) && (!('touches' in event) || event.touches.length == 1) && render[name])
					render[name](new rnd.MouseEvent(event));
				util.stopEventPropagation(event);
                if (bindEventName != 'touchstart' && (bindEventName != 'touchmove' || event.touches.length != 2))
                    return util.preventDefault(event);
			});
		}, this);
	}

	this.ctab = new rnd.ReStruct(new chem.Struct(), this);
	this.settings = null;
	this.styles = null;
	this.checkCurItem = true;

	// function(event, id){};
	this.onAtomClick = null;
	this.onAtomDblClick = null;
	this.onAtomMouseDown = null;
	this.onAtomMouseOver = null;
	this.onAtomMouseMove = null;
	this.onAtomMouseOut = null;
	this.onBondClick = null;
	this.onBondDblClick = null;
	this.onBondMouseDown = null;
	this.onBondMouseOver = null;
	this.onBondMouseMove = null;
	this.onBondMouseOut = null;

	this.onSGroupClick = null;
	this.onSGroupDblClick = null;
	this.onSGroupMouseDown = null;
	this.onSGroupMouseOver = null;
	this.onSGroupMouseMove = null;
	this.onSGroupMouseOut = null;

	this.onRxnArrowClick = null;
	this.onRxnArrowDblClick = null;
	this.onRxnArrowMouseDown = null;
	this.onRxnArrowMouseOver = null;
	this.onRxnArrowMouseMove = null;
	this.onRxnArrowMouseOut = null;

	this.onRxnPlusClick = null;
	this.onRxnPlusDblClick = null;
	this.onRxnPlusMouseDown = null;
	this.onRxnPlusMouseOver = null;
	this.onRxnPlusMouseMove = null;
	this.onRxnPlusMouseOut = null;

	this.onCanvasClick = null;
	this.onCanvasDblClick = null;
	this.onCanvasMouseDown = null;
	this.onCanvasMouseOver = null;
	this.onCanvasMouseMove = null;
	this.onCanvasMouseOut = null;
	this.onCanvasOffsetChanged = null; //function(newOffset, oldOffset){};
	this.onCanvasSizeChanged = null; //function(newSize, oldSize){};
};

rnd.Render.prototype.setCurrentItem = function (type, id, event) {
    if (this.current_tool) return;
	var oldType = this.curItem.type, oldId = this.curItem.id;
	if (type != oldType || id != oldId) {
		this.curItem = {
			'type':type,
			'id':id
		};
		if (oldType == 'Canvas'
			|| (oldType == 'Atom' && this.ctab.atoms.has(oldId))
			|| (oldType == 'RxnArrow' && this.ctab.rxnArrows.has(oldId))
			|| (oldType == 'RxnPlus' && this.ctab.rxnPluses.has(oldId))
			|| (oldType == 'Bond' && this.ctab.bonds.has(oldId))
			|| (oldType == 'SGroup' && this.ctab.molecule.sgroups.has(oldId))) {
			this.callEventHandler(event, 'MouseOut', oldType, oldId);
		}
		this.callEventHandler(event, 'MouseOver', type, id);
	}
};

rnd.Render.prototype.view2scaled = function (p, isRelative) {
	if (!this.useOldZoom)
		p = p.scaled(1/this.zoom);
	p = isRelative ? p : p.add(ui.scrollPos().scaled(1/this.zoom)).sub(this.offset);
	return p;
};

rnd.Render.prototype.scaled2view = function (p, isRelative) {
	p = isRelative ? p : p.add(this.offset).sub(ui.scrollPos().scaled(1/this.zoom));
	if (!this.useOldZoom)
		p = p.scaled(this.zoom);
	return p;
};

rnd.Render.prototype.scaled2obj = function (v) {
	return v.scaled(1 / this.settings.scaleFactor);
};

rnd.Render.prototype.obj2scaled = function (v) {
	return v.scaled(this.settings.scaleFactor);
};

rnd.Render.prototype.view2obj = function (v, isRelative) {
	return this.scaled2obj(this.view2scaled(v, isRelative));
};

rnd.Render.prototype.obj2view = function (v, isRelative) {
	return this.scaled2view(this.obj2scaled(v, isRelative));
};

rnd.Render.prototype.checkCurrentItem = function (event) {
    if (this.current_tool) return;
	if (this.offset) {
		this.pagePos = new util.Vec2(event.pageX, event.pageY);
		var clientPos = null;
		if ('ui' in window && 'page2obj' in ui) // TODO: the render shouldn't be aware of the page coordinates
			clientPos = new util.Vec2(ui.page2obj(event));
		else
			clientPos = this.pagePos.sub(this.clientAreaPos);
		var item = this.findClosestItem(clientPos);
		this.setCurrentItem(item.type, item.id, event);
	}
};

rnd.Render.prototype.findItem = function(event, maps, skip) {
    var ci = this.findClosestItem(
        'ui' in window && 'page2obj' in ui
            ? new util.Vec2(ui.page2obj(event))
            : new util.Vec2(event.pageX, event.pageY).sub(this.clientAreaPos),
        maps,
        skip
    );
    //rbalabanov: let it be this way at the moment
    if (ci.type == 'Atom') ci.map = 'atoms';
    else if (ci.type == 'Bond') ci.map = 'bonds';
    else if (ci.type == 'SGroup') ci.map = 'sgroups';
    else if (ci.type == 'RxnArrow') ci.map = 'rxnArrows';
    else if (ci.type == 'RxnPlus') ci.map = 'rxnPluses';
    return ci;
};

rnd.Render.prototype.client2Obj = function (clientPos) {
	return new util.Vec2(clientPos).sub(this.offset);
};

rnd.Render.prototype.callEventHandler = function (event, eventName, type, id) {
    if (this.current_tool) return;
	var name = 'on' + type + eventName;
	var handled = false;
	if (this[name])
		handled = this[name](event, id);
	if (!handled && type != 'Canvas') {
		var name1 = 'onCanvas' + eventName;
		if (this[name1])
			handled = this[name1](event);
	}
};

util.each(['MouseMove','MouseDown','MouseUp','Click','DblClick'],
	function(eventName) {
		rnd.Render.prototype['_onCanvas' + eventName] = function(event){
			this.checkCurrentItem(event);
			this.callEventHandler(event, eventName, this.curItem.type, this.curItem.id);
		}
	}
);

rnd.Render.prototype.setMolecule = function (ctab)
{
	rnd.logMethod("setMolecule");
	this.paper.clear();
	this.ctab = new rnd.ReStruct(ctab, this);
	this.offset = null;
	this.size = null;
	this.bb = null;
	this.rxnMode = ctab.isReaction;
};

util.each(rnd.actions, function(action){
	rnd.Render.prototype[action] = function () {
		return this.processAction(action, util.array(arguments));
	}
});

// molecule manipulation interface
rnd.Render.prototype.atomGetAttr = function (aid, name)
{
	rnd.logMethod("atomGetAttr");
	// TODO: check attribute names
	return this.ctab.atoms.get(aid).a[name];
};

rnd.Render.prototype.invalidateAtom = function (aid, level)
{
	var atom = this.ctab.atoms.get(aid);
	this.ctab.markAtom(aid, level ? 1 : 0);
	var hbs = this.ctab.molecule.halfBonds;
	for (var i = 0; i < atom.a.neighbors.length; ++i) {
		var hbid = atom.a.neighbors[i];
		if (hbs.has(hbid)) {
			var hb = hbs.get(hbid);
			this.ctab.markBond(hb.bid, 1);
			this.ctab.markAtom(hb.end, 0);
		}
	}
};

rnd.Render.prototype.invalidateBond = function (bid, invalidateLoops)
{
	var bond = this.ctab.bonds.get(bid);
	this.invalidateAtom(bond.b.begin, 0);
	this.invalidateAtom(bond.b.end, 0);
	if (invalidateLoops) {
		var lid1 = this.ctab.molecule.halfBonds.get(bond.b.hb1).loop;
		var lid2 = this.ctab.molecule.halfBonds.get(bond.b.hb2).loop;
		if (lid1 >= 0)
			this.ctab.loopRemove(lid1);
		if (lid2 >= 0)
			this.ctab.loopRemove(lid2);
	}
};

rnd.Render.prototype.invalidateItem = function (map, id, level)
{
	if (map == 'atoms')
		this.invalidateAtom(id, level);
	else if (map == 'bonds')
		this.invalidateBond(id, level);
	else
		this.ctab.markItem(map, id, level);
};

rnd.Render.prototype.atomGetDegree = function (aid)
{
	rnd.logMethod("atomGetDegree");
	return this.ctab.atoms.get(aid).a.neighbors.length;
};

rnd.Render.prototype.isBondInRing = function (bid) {
	var bond = this.ctab.bonds.get(bid);
	return this.ctab.molecule.halfBonds.get(bond.b.hb1).loop >= 0 ||
	this.ctab.molecule.halfBonds.get(bond.b.hb2).loop >= 0;
};

rnd.Render.prototype.atomGetNeighbors = function (aid)
{
	var atom = this.ctab.atoms.get(aid);
	var neiAtoms = [];
	for (var i = 0; i < atom.a.neighbors.length; ++i) {
		var hb = this.ctab.molecule.halfBonds.get(atom.a.neighbors[i]);
		neiAtoms.push({
			'aid': hb.end - 0,
			'bid': hb.bid - 0
		});
	}
	return neiAtoms;
};

// returns an array of nested s-group id's, innermost first
rnd.Render.prototype.atomGetSGroups = function (aid)
{
	rnd.logMethod("atomGetSGroups");
	var atom = this.ctab.atoms.get(aid);
	return util.Set.list(atom.a.sgs);
};

// creates an empty s-group of given type, e.g. "MUL" or "SRU",
// returns group id
rnd.Render.prototype.sGroupCreate = function (type)
{
	rnd.logMethod("sGroupCreate");
	var sg = new chem.SGroup(type);
	return chem.SGroup.addGroup(this.ctab.molecule, sg);
};

// receives group id
rnd.Render.prototype.sGroupDelete = function (sgid)
{
	rnd.logMethod("sGroupDelete");
	this.ctab.clearVisel(this.ctab.molecule.sgroups.get(sgid).visel);
	var atoms = this.ctab.sGroupDelete(sgid);
	for (var i = 0; i < atoms.length; ++i) {
		var aid = atoms[i];
		this.invalidateAtom(aid);
	}
};

// set group attributes, such as multiplication index for MUL group or HT/HH/EU connectivity for SRU
rnd.Render.prototype._sGroupSetAttr = function (sgid, name, value)
{
	rnd.logMethod("_sGroupSetAttr");
	// TODO: fix update
	var sg = this.ctab.molecule.sgroups.get(sgid);
	sg.data[name] = value;
};

rnd.Render.prototype._sGroupSetType = function (sgid, type)
{
	rnd.logMethod("_sGroupSetType");
    var mol = this.ctab.molecule;
    var sg = mol.sgroups.get(sgid);
	this.ctab.clearVisel(sg.visel);
	this.ctab.removeBracketHighlighting(sgid, sg);
	this.ctab.removeBracketSelection(sgid, sg);
	var newSg = new chem.SGroup(type);
	newSg.atoms = chem.SGroup.getAtoms(mol, sg);
	newSg.p = sg.p;
	newSg.pa = sg.pa;
	newSg.pr = sg.pr;
	newSg.data = Object.clone(sg.data);
	mol.sgroups.set(sgid, newSg);
};

rnd.Render.prototype.chiralSetPos = function (pos)
{
	rnd.logMethod("chiralSetPos");
	this.ctab.chiral.pos = (pos == null) ? null : new util.Vec2(pos);
};

rnd.Render.prototype._sGroupSetPos = function (sgid, pos)
{
	rnd.logMethod("_sGroupSetPos");
	var sg = this.ctab.molecule.sgroups.get(sgid);
	if (!sg.p)
		return;
	chem.SGroup.setPos(this.ctab, sg, new util.Vec2(pos), false);
};

rnd.Render.prototype.sGroupGetAttr = function (sgid, name)
{
	rnd.logMethod("sGroupGetAttr");
	var sg = this.ctab.molecule.sgroups.get(sgid);
	return sg.data[name];
};

rnd.Render.prototype.sGroupGetAtoms = function (sgid)
{
	rnd.logMethod("sGroupGetAtoms");
    var mol = this.ctab.molecule;
	var sg = mol.sgroups.get(sgid);
	return chem.SGroup.getAtoms(mol, sg);
};

rnd.Render.prototype.sGroupGetType = function (sgid)
{
	rnd.logMethod("sGroupGetType");
	var sg = this.ctab.molecule.sgroups.get(sgid);
	return sg.type;
};

rnd.Render.prototype._sGroupSetHighlight = function (sgid, value)
{
	rnd.logMethod("_sGroupSetHighlight");
	var sg = this.ctab.molecule.sgroups.get(sgid);
	sg.highlight = value;
	this.ctab.showBracketHighlighting(sgid, sg, value);
};

rnd.Render.prototype.sGroupsFindCrossBonds = function ()
{
	rnd.logMethod("sGroupsFindCrossBonds");
	this.ctab.molecule.sGroupsRecalcCrossBonds();
};

rnd.Render.prototype.sGroupGetCrossBonds = function (sgid)
{
	rnd.logMethod("sGroupGetCrossBonds");
	var sg = this.ctab.molecule.sgroups.get(sgid);
	return sg.xBonds;
};

rnd.Render.prototype.sGroupGetNeighborAtoms = function (sgid)
{
	rnd.logMethod("sGroupGetNeighborAtoms");
	var sg = this.ctab.molecule.sgroups.get(sgid);
	return sg.neiAtoms;
};

rnd.Render.prototype._atomSetAttr = function (aid, name, value)
{
	rnd.logMethod("_atomSetAttr");
	// TODO: rewrite with special methods for each attribute?
	// TODO: allow multiple attributes at once?
	var atom = this.ctab.atoms.get(aid);
	if (name == 'label' && value != null) // HACK
		atom.a['atomList'] = null;
	atom.a[name] = value;
	this.invalidateAtom(aid);
};

rnd.Render.prototype.atomIsPlainCarbon = function (aid)
{
	rnd.logMethod("atomIsPlainCarbon");
	return this.ctab.atoms.get(aid).a.isPlainCarbon();
};

rnd.Render.prototype._atomAddToSGroup = function (aid, value)
{
	rnd.logMethod("_atomAddToSGroup");
	var atom = this.ctab.atoms.get(aid);
	var sg = this.ctab.molecule.sgroups.get(value);
	chem.SGroup.addAtom(sg, aid);
	util.Set.add(atom.a.sgs, value);
	this.invalidateAtom(aid);
};

rnd.Render.prototype._atomRemoveFromSGroup = function (aid, value)
{
	rnd.logMethod("_atomRemoveFromSGroup");
	var atom = this.ctab.atoms.get(aid);
	var sg = this.ctab.molecule.sgroups.get(value);
	chem.SGroup.removeAtom(sg, aid);
	util.Set.remove(atom.a.sgs, value);
	this.invalidateAtom(aid);
};

rnd.Render.prototype._atomClearSGroups = function (aid)
{
	rnd.logMethod("_atomClearSGroups");
	var atom = this.ctab.atoms.get(aid);
	util.Set.each(atom.a.sgs, function(sgid){
		var sg = this.ctab.molecule.sgroups.get(sgid);
		chem.SGroup.removeAtom(sg, aid);
	}, this);
	atom.a.sgs = util.Set.empty();
	this.invalidateAtom(aid);
};

// TODO to be removed
/** @deprecated please use ReAtom.setHighlight instead */
rnd.Render.prototype.atomSetHighlight = function (aid, value)
{
	rnd.logMethod("atomSetHighlight");
	var atom = this.ctab.atoms.get(aid);
	atom.highlight = value;
	this.ctab.showAtomHighlighting(aid, atom, value);
};

rnd.Render.prototype.atomSetSGroupHighlight = function (aid, value)
{
	rnd.logMethod("atomSetSGroupHighlight");
	var atom = this.ctab.atoms.get(aid);
	atom.sGroupHighlight = value;
	this.ctab.showAtomSGroupHighlighting(aid, atom, value);
};

rnd.Render.prototype.highlightObject = function(obj, visible) {
    if (['atoms', 'bonds', 'rxnArrows', 'rxnPluses'].indexOf(obj.map) > -1) {
        this.ctab[obj.map].get(obj.id).setHighlight(visible, this);
    } else if (obj.map == 'atoms') {
        //this.atomSetHighlight(obj.id, visible);
    } else if (obj.map == 'bonds') {
        //this.bondSetHighlight(obj.id, visible);
    } else if (obj.map == 'sgroups') {
        ui.highlightSGroup(obj.id, visible);
    } else {
        return false;
    }
    return true;
};

rnd.Render.prototype._atomAdd = function (pos, params)
{
	rnd.logMethod("_atomAdd");
	var aid = this.ctab.atomAdd(new util.Vec2(pos), params);
	this.ctab.markAtom(aid, 1);
	return aid;
};

rnd.Render.prototype._rxnPlusAdd = function (pos, params)
{
	rnd.logMethod("_rxnPlusAdd");
	var id = this.ctab.rxnPlusAdd(new util.Vec2(pos), params);
	this.invalidateItem('rxnPluses', id, 1);
	return id;
};

rnd.Render.prototype._rxnArrowAdd = function (pos, params)
{
	rnd.logMethod("_rxnArrowAdd");
	var id = this.ctab.rxnArrowAdd(new util.Vec2(pos), params);
	this.invalidateItem('rxnArrows', id, 1);
	return id;
};

rnd.Render.prototype._itemMove = function (map, id, pos)
{
	this.ctab.molecule._itemSetPos(map, id, new util.Vec2(pos));
	this.invalidateItem(map, id, 1);
};

rnd.Render.prototype._itemMoveRel = function (map, id, d)
{
	this._itemMove(map, id, this.itemGetPos(map, id).add(d));
};

rnd.Render.prototype._atomMove = function (id, pos)
{
	rnd.logMethod("_atomMove");
	var atom = this.ctab.atoms.get(id);
	var hbs = this.ctab.molecule.halfBonds;
	for (var i = 0; i < atom.a.neighbors.length; ++i) {
		var hbid = atom.a.neighbors[i];
		if (hbs.has(hbid)) {
			var hb = hbs.get(hbid);
			this.invalidateAtom(hb.end, 1);
			if (hb.loop >= 0) {
				this.ctab.loopRemove(hb.loop);
			}
		}
	}
	this.invalidateAtom(id, 1);
	this.ctab.molecule._itemSetPos('atoms', id, new util.Vec2(pos));
};

rnd.Render.prototype._rxnArrowMove = function (id, pos)
{
	rnd.logMethod("_rxnArrowMove");
	this._itemMove('rxnArrows', id, pos);
};

rnd.Render.prototype._rxnArrowMoveRel = function (id, d)
{
	rnd.logMethod("_rxnArrowMoveRel");
	this._itemMoveRel('rxnArrows', id, d);
};

rnd.Render.prototype._rxnPlusMoveRel = function (id, d)
{
	rnd.logMethod("_rxnPlusMoveRel");
	this._itemMoveRel('rxnPluses', id, d);
};

rnd.Render.prototype.itemGetPos = function (map, id)
{
	var p = this.ctab.molecule[map].get(id).pp;
	return p;
};

rnd.Render.prototype.atomGetPos = function (id)
{
	rnd.logMethod("atomGetPos");
	return this.itemGetPos('atoms', id);
};

rnd.Render.prototype.rxnArrowGetPos = function (id)
{
	rnd.logMethod("rxnArrowGetPos");
	return this.itemGetPos('rxnArrows', id);
};

rnd.Render.prototype.rxnPlusGetPos = function (id)
{
	rnd.logMethod("rxnPlusGetPos");
	return this.itemGetPos('rxnPluses', id);
};

rnd.Render.prototype._atomMoveRel = function (aid, d)
{
	rnd.logMethod("_atomMoveRel");
	this.atomsMultipleMoveRel([aid], new util.Vec2(d));
};

rnd.Render.prototype.getAdjacentBonds = function (atoms) {
	var aidSet = util.Set.fromList(atoms);
	var bidSetInner = util.Set.empty(), bidSetCross = util.Set.empty();
	for (var i = 0; i < atoms.length; ++i) {
		var aid = atoms[i];
		var atom = this.ctab.atoms.get(aid);
		for (var j = 0; j < atom.a.neighbors.length; ++j) {
			var hbid = atom.a.neighbors[j];
			var hb = this.ctab.molecule.halfBonds.get(hbid);
			var endId = hb.end;
			var set = util.Set.contains(aidSet, endId) ?
				bidSetInner : bidSetCross;
			util.Set.add(set, hb.bid);
		}
	}
	return {'inner': bidSetInner, 'cross': bidSetCross};
};

rnd.Render.prototype.atomsMultipleMoveRel = function (atoms, d)
{
	for (var i = 0; i < atoms.length; ++i) { // TMP
		this.itemMoveRel('atoms', atoms[i], d);
	}
};

rnd.Render.prototype.itemMoveRel = function (map, id, d) {
	this.invalidateItem(map, id, 1);
	this.ctab.molecule._itemSetPos(map, id,
		this.itemGetPos(map, id).add(d), this.settings.scaleFactor);
};

rnd.Render.prototype._multipleMoveRel = function (lists, d)
{
	rnd.logMethod("_multipleMoveRel");
	d = new util.Vec2(d.x, d.y);

	if (lists.atoms.length > 0) {
		this.atomsMultipleMoveRel(lists.atoms, d);
	}

	for (var map in {'rxnArrows':0, 'rxnPluses':0}) {
		var list = lists[map];
		if (list) {
			for (var k = 0; k < list.length; ++k) {
				this.itemMoveRel(map, list[k], d);
			}
		}
	}
};

rnd.Render.prototype._atomRemove = function (aid)
{
	rnd.logMethod("_atomRemove");
	this.ctab.atomRemove(aid);
};

rnd.Render.prototype._rxnPlusRemove = function (id)
{
	rnd.logMethod("_rxnPlusRemove");
	this.ctab.rxnPlusRemove(id);
};

rnd.Render.prototype._rxnArrowRemove = function (id)
{
	rnd.logMethod("_rxnArrowRemove");
	this.ctab.rxnArrowRemove(id);
};

rnd.Render.prototype.bondGetAttr = function (bid, name)
{
	rnd.logMethod("bondGetAttr");
	return this.ctab.bonds.get(bid).b[name];
};

rnd.Render.prototype._bondSetAttr = function (bid, name, value)
{
	rnd.logMethod("_bondSetAttr");
	var bond = this.ctab.bonds.get(bid);
	bond.b[name] = value;
	this.invalidateBond(bid, name == 'type' ? 1 : 0);
// update loops involving this bond
};

// TODO to be removed
/** @deprecated please use ReBond.setHighlight instead */
rnd.Render.prototype.bondSetHighlight = function (bid, value)
{
	rnd.logMethod("bondSetHighlight");
	var bond = this.ctab.bonds.get(bid);
	bond.highlight = value;
	this.ctab.showBondHighlighting(bid, bond, value);
};

rnd.Render.prototype._bondAdd = function (begin, end, params)
{
	rnd.logMethod("_bondAdd");
	this.invalidateAtom(begin, 1);
	this.invalidateAtom(end, 1);
	var bid = this.ctab.bondAdd(begin, end, params);
	this.ctab.markBond(bid, 1);
	return bid;
};

rnd.Render.prototype._bondRemove = function (bid)
{
	rnd.logMethod("_bondRemove");
	this.invalidateBond(bid);
	this.ctab.bondRemove(bid);
};

rnd.Render.prototype._bondFlip = function (bid)
{
	rnd.logMethod("_bondFlip");
	var bond = this.ctab.bonds.get(bid);
	this.invalidateAtom(bond.b.begin, 1);
	this.invalidateAtom(bond.b.end, 1);
	var newBid = this.ctab.bondFlip(bid);
	this.ctab.markBond(newBid, 1);
	return newBid;
};

rnd.Render.prototype.setSelection = function (selection)
{
	rnd.logMethod("setSelection");
	for (var map in rnd.ReStruct.maps) {
		this.ctab[map].each(function(id, item){
			item.selected = false;
			this.ctab.showItemSelection(id, item, false);
		}, this);
		for (var i = 0; i < selection[map].length; ++i) {
			var id = selection[map][i];
			var item = this.ctab[map].get(id);
			item.selected = true;
			this.ctab.showItemSelection(id, item, true);
		}
	}
};

rnd.Render.prototype.initStyles = function ()
{
	// TODO move fonts, dashed lines, etc. here
	var settings = this.settings;
	this.styles = {};
	this.styles.lineattr = {
		stroke: '#000',
		'stroke-width': settings.lineWidth,
		'stroke-linecap' : 'round',
		'stroke-linejoin' : 'round'
	};
	this.styles.selectionStyle = {
		'fill':'#7f7',
		'stroke':'none'
	};
	this.styles.selectionZoneStyle = {
		'fill':'#000',
		'stroke':'none',
		'opacity':0.0
	};
	this.styles.highlightStyle = {
		'stroke':'#0c0',
		'stroke-width':0.6*settings.lineWidth
		};
	this.styles.sGroupHighlightStyle = {
		'stroke':'#9900ff',
		'stroke-width':0.6*settings.lineWidth
		};
	this.styles.sgroupBracketStyle = {
		'stroke':'#000',
		'stroke-width':0.5*settings.lineWidth
		};
	this.styles.atomSelectionPlateRadius = settings.labelFontSize * 1.2 ;
};

rnd.Render.prototype.initSettings = function()
{
	var settings = this.settings = {};
	settings.delta = this.ctab.molecule.getCoordBoundingBox();
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
};

rnd.Render.prototype.getBoundingBox = function ()
{
	var bb = null, vbb;
	this.ctab.eachVisel(function(visel){
		vbb = visel.boundingBox;
		if (vbb)
			bb = bb ? util.Box2Abs.union(bb, vbb) : vbb.clone();
	}, this);
	if (!bb)
		bb = new util.Box2Abs(0, 0, 0, 0);
	return bb;
};

rnd.Render.prototype.getStructCenter = function ()
{
	var bb = this.getBoundingBox();
	return this.scaled2obj(util.Vec2.lc2(bb.p0, 0.5, bb.p1, 0.5));
};

rnd.Render.prototype.onResize = function ()
{
	this.setViewSize(new util.Vec2(this.clientArea['clientWidth'], this.clientArea['clientHeight']));
}

rnd.Render.prototype.setViewSize = function (viewSz)
{
     this.viewSz = new util.Vec2(viewSz);
}

rnd.Render.prototype._setPaperSize = function (sz)
{
	var z = this.zoom;
	this.paper.setSize(sz.x * z, sz.y * z);
	this.setViewBox(z);
};

rnd.Render.prototype.setPaperSize = function (sz)
{
	rnd.logMethod("setPaperSize");
	var oldSz = this.sz;
	this.sz = sz;
	this._setPaperSize(sz);
	if (this.onCanvasSizeChanged)
		this.onCanvasSizeChanged(sz, oldSz);
};

rnd.Render.prototype.setOffset = function (offset)
{
	rnd.logMethod("setOffset");
	var oldOffset = this.offset;
	this.offset = offset;
	if (this.onCanvasOffsetChanged)
		this.onCanvasOffsetChanged(offset, oldOffset);
};

rnd.Render.prototype.getElementPos = function (obj)
{
	var curleft = 0, curtop = 0;

	if (obj.offsetParent) {
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while ((obj = obj.offsetParent));
	}
	return new util.Vec2(curleft,curtop);
};

rnd.Render.prototype.drawSelectionLine = function (p0, p1) {
	rnd.logMethod("drawSelectionLine");
	if (this.selectionRect) {
		this.selectionRect.remove();
	    this.selectionRect = null;
    }
	if (p0 && p1) {
		p0 = this.obj2scaled(p0).add(this.offset);
		p1 = this.obj2scaled(p1).add(this.offset);
		this.selectionRect = this.paper.path(
            'M' + p0.x.toString() + ',' + p0.y.toString() + 'L' + p1.x.toString() + ',' + p1.y.toString()
        ).attr({ 'stroke':'gray', 'stroke-width':'1px' });
	}
};

rnd.Render.prototype.drawSelectionRectangle = function (p0, p1) {
	rnd.logMethod("drawSelectionRectangle");
	if (this.selectionRect) {
		this.selectionRect.remove();
	    this.selectionRect = null;
    }
	if (p0 && p1) {
		p0 = this.obj2scaled(p0).add(this.offset);
		p1 = this.obj2scaled(p1).add(this.offset);
		this.selectionRect = this.paper.rect(
            Math.min(p0.x, p1.x), Math.min(p0.y, p1.y), Math.abs(p1.x - p0.x), Math.abs(p1.y - p0.y)
        ).attr({ 'stroke':'gray', 'stroke-width':'1px' });
	}
};

rnd.Render.prototype.getElementsInRectangle = function (p0,p1) {
	rnd.logMethod("getElementsInRectangle");
	var bondList = new Array();
	var atomList = new Array();

	var x0 = Math.min(p0.x, p1.x), x1 = Math.max(p0.x, p1.x), y0 = Math.min(p0.y, p1.y), y1 = Math.max(p0.y, p1.y);
	this.ctab.bonds.each(function (bid, bond){
		var centre = util.Vec2.lc2(this.ctab.atoms.get(bond.b.begin).a.pp, 0.5,
			this.ctab.atoms.get(bond.b.end).a.pp, 0.5);
		if (centre.x > x0 && centre.x < x1 && centre.y > y0 && centre.y < y1)
			bondList.push(bid);
	}, this);
	this.ctab.atoms.each(function(aid, atom) {
		if (atom.a.pp.x > x0 && atom.a.pp.x < x1 && atom.a.pp.y > y0 && atom.a.pp.y < y1)
			atomList.push(aid);
	}, this);
	var rxnArrowsList = new Array();
	var rxnPlusesList = new Array();
	this.ctab.rxnArrows.each(function(id, item){
		if (item.item.pp.x > x0 && item.item.pp.x < x1 && item.item.pp.y > y0 && item.item.pp.y < y1)
			rxnArrowsList.push(id);
	}, this);
	this.ctab.rxnPluses.each(function(id, item){
		if (item.item.pp.x > x0 && item.item.pp.x < x1 && item.item.pp.y > y0 && item.item.pp.y < y1)
			rxnPlusesList.push(id);
	}, this);
	return {
		'atoms':atomList,
		'bonds':bondList,
		'rxnArrows':rxnArrowsList,
		'rxnPluses':rxnPlusesList
	};
};

rnd.Render.prototype.drawSelectionPolygon = function (r) {
	rnd.logMethod("drawSelectionPolygon");
	if (this.selectionRect) {
		this.selectionRect.remove();
	    this.selectionRect = null;
    }
	if (r && r.length > 1) {
		var v = this.obj2scaled(r[r.length - 1]).add(this.offset);
		var pstr = "M" + v.x.toString() + "," + v.y.toString();
		for (var i = 0; i < r.length; ++i) {
			v = this.obj2scaled(r[i]).add(this.offset);
			pstr += "L" + v.x.toString() + "," + v.y.toString();
		}
		this.selectionRect = this.paper.path(pstr).attr({ 'stroke':'gray', 'stroke-width':'1px' });
	}
};

rnd.Render.prototype.isPointInPolygon = function (r, p) {
	var d = new util.Vec2(0, 1);
	var n = d.rotate(Math.PI/2);
	var v0 = util.Vec2.diff(r[r.length - 1], p);
	var n0 = util.Vec2.dot(n, v0);
	var d0 = util.Vec2.dot(d, v0);
	var counter = 0;
	var eps = 1e-5;

	for (var i = 0; i < r.length; ++i) {
		var v1 = util.Vec2.diff(r[i], p);
		var n1 = util.Vec2.dot(n, v1);
		var d1 = util.Vec2.dot(d, v1);
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
};

rnd.Render.prototype.getElementsInPolygon = function (rr) {
	rnd.logMethod("getElementsInPolygon");
	var bondList = new Array();
	var atomList = new Array();
	var r = [];
	for (var i = 0; i < rr.length; ++i) {
		r[i] = new util.Vec2(rr[i].x, rr[i].y);
	}
	this.ctab.bonds.each(function (bid, bond){
		var centre = util.Vec2.lc2(this.ctab.atoms.get(bond.b.begin).a.ps, 0.5,
			this.ctab.atoms.get(bond.b.end).a.pp, 0.5);
		if (this.isPointInPolygon(r, centre))
			bondList.push(bid);
	}, this);
	this.ctab.atoms.each(function(aid, atom){
		if (this.isPointInPolygon(r, atom.a.pp))
			atomList.push(aid);
	}, this);
	var rxnArrowsList = new Array();
	var rxnPlusesList = new Array();
	this.ctab.rxnArrows.each(function(id, item){
		if (this.isPointInPolygon(r, item.item.pp))
			rxnArrowsList.push(id);
	}, this);
	this.ctab.rxnPluses.each(function(id, item){
		if (this.isPointInPolygon(r, item.item.pp))
			rxnPlusesList.push(id);
	}, this);

	return {
		'atoms':atomList,
		'bonds':bondList,
		'rxnArrows':rxnArrowsList,
		'rxnPluses':rxnPlusesList
	};
};

rnd.Render.prototype.testPolygon = function (rr) {
	rr = rr || [
	{
		x:50,
		y:10
	},

	{
		x:20,
		y:90
	},

	{
		x:90,
		y:30
	},

	{
		x:10,
		y:30
	},

	{
		x:90,
		y:80
	}
	];
	if (rr.length < 3)
		return;
	var min = rr[0], max = rr[0];
	for (var j = 1; j < rr.length; ++j) {
		min = util.Vec2.min(min, rr[j]);
		max = util.Vec2.max(max, rr[j]);
	}
	this.drawSelectionPolygon(rr);
	for (var k = 0; k < 1000; ++k) {
		var p = new util.Vec2(Math.random() * zz, Math.random() * zz);
		var isin = this.isPointInPolygon(rr, p);
		var color = isin ? '#0f0' : '#f00';
		this.paper.circle(p.x, p.y, 2).attr({
			'fill':color,
			'stroke':'none'
		});
	}
	this.drawSelectionPolygon(rr);
};

rnd.Render.prototype.processAction = function (action, args)
{
	var id = parseInt(args[0]);
	if (action == 'atomRemove' && this.curItem.type == 'Atom'
		&& this.curItem.id == id && this._onAtomMouseOut) {
		this._onAtomMouseOut({
			'pageX':this.pagePos.x,
			'pageY':this.pagePos.y
			},
		this.curItem.id);
	}
	if (action == 'bondRemove' && this.curItem.type == 'Bond'
		&& this.curItem.id == id && this._onBondMouseOut) {
		this._onBondMouseOut({
			'pageX':this.pagePos.x,
			'pageY':this.pagePos.y
			},
		this.curItem.id);
	}
	if (action == 'rxnArrowRemove' && this.curItem.type == 'RxnArrow'
		&& this.curItem.id == id && this._onRxnArrowMouseOut) {
		this._onRxnArrowMouseOut({
			'pageX':this.pagePos.x,
			'pageY':this.pagePos.y
			},
		this.curItem.id);
	}
	if (action == 'rxnPlusRemove' && this.curItem.type == 'RxnPlus'
		&& this.curItem.id == id && this._onRxnPlusMouseOut) {
		this.onRxnArrowMouseOut({
			'pageX':this.pagePos.x,
			'pageY':this.pagePos.y
			},
		this.curItem.id);
	}
	this.muteMouseOutMouseOver = true;
	var ret = this['_' + action].apply(this, args);
	this.muteMouseOutMouseOver = false;
	if (action.endsWith('Add'))
		this.checkCurItem = true;
	return ret;
};

rnd.Render.prototype.update = function (force)
{
	rnd.logMethod("update");
	this.muteMouseOutMouseOver = true;

	if (!this.settings || this.dirty) {
		if (this.opt.autoScale)
		{
			var cbb = this.ctab.molecule.getCoordBoundingBox();
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
			var ext = util.Vec2.UNIT.scaled(sf);
			bb = bb.extend(ext, ext);
			if (this.bb)
				this.bb = util.Box2Abs.union(this.bb, bb);
			else
			{
				var d = this.viewSz.sub(bb.sz()).scaled(0.5).max(util.Vec2.ZERO);
				this.bb = bb.extend(d, d);
			}
			bb = this.bb.clone();

			var sz = util.Vec2.max(bb.sz().floor(), this.viewSz);
			var offset = bb.p0.negated().ceil();
			if (!this.sz || sz.x > this.sz.x || sz.y > this.sz.y)
				this.setPaperSize(sz);

			var oldOffset = this.offset || new util.Vec2();
			var delta = offset.sub(oldOffset);
			if (!this.offset || delta.x > 0 || delta.y > 0) {
				this.setOffset(offset);
				this.ctab.translate(delta);
				this.bb.translate(delta);
			}
		} else {
			var sz1 = bb.sz();
			var marg = new util.Vec2(this.opt.autoScaleMargin, this.opt.autoScaleMargin);
			var csz = this.viewSz.sub(marg.scaled(2));
			if (csz.x < 1 || csz.y < 1)
				throw new Error("View box too small for the given margin");
			var rescale = Math.min(csz.x / sz1.x, csz.y / sz1.y);
			this.ctab.scale(rescale);
			var offset1 = csz.sub(sz1.scaled(rescale)).scaled(0.5).add(marg).sub(bb.pos().scaled(rescale));
			this.ctab.translate(offset1);
		}
	}

	this.muteMouseOutMouseOver = false;
	if (this.checkCurItem) {
		this.checkCurItem = false;
		var event = new rnd.MouseEvent({
			'pageX':this.pagePos.x,
			'pageY':this.pagePos.y
			});
		this.checkCurrentItem(event);
	}
};

rnd.Render.prototype.checkBondExists = function (begin, end) {
	return this.ctab.molecule.checkBondExists(begin, end);
};

rnd.Render.prototype.findClosestAtom = function (pos, minDist, skip) {
	var closestAtom = null;
	var maxMinDist = this.opt.selectionDistanceCoefficient;
	minDist = minDist || maxMinDist;
	minDist	= Math.min(minDist, maxMinDist);
	this.ctab.atoms.each(function(aid, atom){
        if (aid != skip) {
            var dist = util.Vec2.dist(pos, atom.a.pp);
            if (dist < minDist) {
                closestAtom = aid;
                minDist = dist;
            }
        }
	}, this);
	if (closestAtom != null)
		return {
			'id':closestAtom,
			'dist':minDist
		};
	return null;
};

rnd.Render.prototype.findClosestBond = function (pos, minDist) {
	var closestBond = null;
	var maxMinDist = this.opt.selectionDistanceCoefficient;
	minDist = minDist || maxMinDist;
	minDist = Math.min(minDist, maxMinDist);
	this.ctab.bonds.each(function(bid, bond){
		var hb = this.ctab.molecule.halfBonds.get(bond.b.hb1);
		var d = hb.dir;
		var n = hb.norm;
		var p1 = this.ctab.atoms.get(bond.b.begin).a.pp,
		p2 = this.ctab.atoms.get(bond.b.end).a.pp;

		var inStripe = util.Vec2.dot(pos.sub(p1),d) * util.Vec2.dot(pos.sub(p2),d) < 0;
		if (inStripe) {
			var dist = Math.abs(util.Vec2.dot(pos.sub(p1),n));
			if (dist < minDist) {
				closestBond = bid;
				minDist = dist;
			}
		}
	}, this);
	if (closestBond != null)
		return {
			'id':closestBond,
			'dist':minDist
		};
	return null;
};

rnd.Render.prototype.findClosestSGroup = function (pos, minDist) {
	var closestSg = null;
	var maxMinDist = this.opt.selectionDistanceCoefficient; // TODO: ???
	minDist = minDist || maxMinDist;
	minDist = Math.min(minDist, maxMinDist);
	var lw = this.settings.lineWidth;
	var vext = new util.Vec2(lw*4, lw*6);
	this.ctab.molecule.sgroups.each(function(sgid, sg){
		if (sg.selectionBoxes != null) {
			for (var i = 0; i < sg.selectionBoxes.length; ++i) {
				var bbi = sg.selectionBoxes[i];
				var inBoxi = bbi.p0.y < pos.y && bbi.p1.y > pos.y && bbi.p0.x < pos.x && bbi.p1.x > pos.x;
				var xDisti = util.Vec2.dist(pos, util.Vec2.lc2(bbi.p0, 0.5, bbi.p1, 0.5));
				if (inBoxi && (closestSg == null || xDisti < minDist)) {
					closestSg = sgid;
					minDist = xDisti;
				}
			}
		} else {
			var box = sg.bracketBox;
			if (!box)
				return;
			var bb = box.extend(vext, vext);
			var inBox = bb.p0.y < pos.y && bb.p1.y > pos.y && bb.p0.x < pos.x && bb.p1.x > pos.x;
			var xDist = Math.min(Math.abs(bb.p0.x - pos.x), Math.abs(bb.p1.x - pos.x));
			if (inBox && (closestSg == null || xDist < minDist)) {
				closestSg = sgid;
				minDist = xDist;
			}
		}
	}, this);
	if (closestSg != null)
		return {
			'id':closestSg,
			'dist':minDist
		};
	return null;
};

rnd.Render.prototype.findClosest = function (map, pos, minDist) {
	var closestItem = null;
	var maxMinDist = this.opt.selectionDistanceCoefficient;
	minDist = minDist || maxMinDist;
	minDist = Math.min(minDist, maxMinDist);
	this.ctab.molecule[map].each(function(id, item){
		var dist = util.Vec2.dist(pos, item.pp);
		if (dist < minDist) {
			closestItem = id;
			minDist = dist;
		}
	}, this);
	if (closestItem != null)
		return {
			'id':closestItem,
			'dist':minDist
		};
	return null;
};

rnd.Render.prototype.findClosestItem = function (pos, maps, skip) {
	var ret = null;
	var updret = function(type, item) {
		if (item != null && (ret == null || ret.dist > item.dist)) {
			ret = {
				'type':type,
				'id':item.id,
				'dist':item.dist
			};
		}
	};

    // TODO make it "map-independent", each object should be able to "report" its distance to point (something like ReAtom.dist(point))
    if (!maps || maps.indexOf('atoms') >= 0) {
        var atom = this.findClosestAtom(
            pos, undefined, !Object.isUndefined(skip) && skip.map == 'atoms' ? skip.id : undefined
        );
        updret('Atom', atom);
    }
    if (!maps || maps.indexOf('bonds') >= 0) {
        var bond = this.findClosestBond(pos);
        if (ret == null || ret.dist > 0.4 * this.scale) // hack
            updret('Bond', bond);
    }
    if (!maps || maps.indexOf('sgroups') >= 0) {
        var sg = this.findClosestSGroup(pos);
        updret('SGroup', sg);
    }
    if (!maps || maps.indexOf('rxnArrows') >= 0) {
        var arrow = this.findClosest('rxnArrows', pos);
        updret('RxnArrow',arrow);
    }
    if (!maps || maps.indexOf('rxnPluses') >= 0) {
        var plus = this.findClosest('rxnPluses', pos);
        updret('RxnPlus',plus);
    }

	ret = ret || {
		'type':'Canvas',
		'id':-1
	};
	return ret;
};

rnd.Render.prototype.addItemPath = function (visel, group, path, rbb)
{
	var bb = rbb ? util.Box2Abs.fromRelBox(rbb) : null;
	var offset = this.offset;
	if (offset != null) {
		if (bb != null)
			bb.translate(offset);
		path.translate(offset.x, offset.y);
	}
	visel.add(path, bb);
	this.ctab.insertInLayer(rnd.ReStruct.layerMap[group], path);
};

rnd.Render.prototype.setZoom = function (zoom) {
	this.zoom = zoom;
	this._setPaperSize(this.sz);
};

rnd.Render.prototype.extendCanvas = function (x0, y0, x1, y1) {
	var ex = 0, ey = 0, dx = 0, dy = 0;
	x0 = x0-0;
	x1 = x1-0;
	y0 = y0-0;
	y1 = y1-0;

	if (x0 < 0) {
		ex += -x0;
		dx += -x0;
	}
	if (y0 < 0) {
		ey += -y0;
		dy += -y0;
	}

	var szx = this.sz.x * this.zoom, szy = this.sz.y * this.zoom;
	if (szx < x1) {
		ex += x1 - szx;
	}
	if (szy < y1) {
		ey += y1 - szy;
	}

	var d = new util.Vec2(dx, dy).scaled(1 / this.zoom);
	if (ey > 0 || ex > 0) {
		var e = new util.Vec2(ex, ey).scaled(1 / this.zoom);
		var sz = this.sz.add(e);

		this.setPaperSize(sz);
		if (d.x > 0 || d.y > 0) {
			this.setOffset(this.offset.add(d));
			this.ctab.translate(d);
			this.bb.translate(d);
		}
	}
	return d;
};

rnd.Render.prototype.setScale = function (z) {
	if (this.offset)
		this.offset = this.offset.scaled(1/z).scaled(this.zoom);
	this.scale = this.baseScale * this.zoom;
	this.settings = null;
	this.update(true);
}

rnd.Render.prototype.setViewBox = function (z) {
	if (!this.useOldZoom)
		this.paper.canvas.setAttribute("viewBox",'0 0 ' + this.sz.x + ' ' + this.sz.y);
	else
		this.setScale(z);
};
