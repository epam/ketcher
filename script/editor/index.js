var s = require('subscription');

var Set = require('../util/set');
var Vec2 = require('../util/vec2');

var Render = require('../render');
var Action = require('./action');

var closest = require('./closest');

var toolMap = {
	base: require('./tool/base'),
	rgroupatom: require('./tool/rgroupatom'),
	select: require('./tool/select'),
	sgroup: require('./tool/sgroup'),
	eraser: require('./tool/eraser'),
	atom: require('./tool/atom'),
	bond: require('./tool/bond'),
	chain: require('./tool/chain'),
	template: require('./tool/template'),
	charge: require('./tool/charge'),
	rgroupfragment: require('./tool/rgroupfragment'),
	apoint: require('./tool/apoint'),
	reactionarrow: require('./tool/reactionarrow'),
	reactionplus: require('./tool/reactionplus'),
	reactionmap: require('./tool/reactionmap'),
	reactionunmap: require('./tool/reactionunmap'),
	paste: require('./tool/paste'),
	rotate: require('./tool/rotate')
};

var SCALE = 40;  // const
var ui = global.ui;

var structObjects = ['atoms', 'bonds', 'frags', 'sgroups', 'sgroupData', 'rgroups', 'rxnArrows', 'rxnPluses', 'chiralFlags'];

function Editor(clientArea, options) {
	this.render = new Render(clientArea, Object.assign({ atomColoring: true, scale: SCALE }, options));

	this._selection = null;
	this._tool = null; // eslint-disable-line

	domEventSetup(this, clientArea);
	eventSetup(this);
}

Editor.prototype.tool = function (name, opts) {
	if (arguments.length > 0) {
		/* eslint-disable no-underscore-dangle*/
		if (this._tool)
			this._tool.OnCancel(); // eslint-disable-line new-cap
		var tool = toolMap[name](this, opts);
		if (!tool)
			return null;
		this._tool = tool;
	}
	return this._tool;
	/* eslint-enable no-underscore-dangle*/
};

Editor.prototype.struct = function (value) {
	if (arguments.length > 0) {
		this.selection(null);
		this.event.change.dispatch(Action.fromNewCanvas(value));
		recoordinate(this, getStructCenter(this.render.ctab));
	}
	return this.render.ctab.molecule;
};

Editor.prototype.options = function (value) {
	if (arguments.length > 0) {
		var struct = this.render.ctab.molecule;
		var zoom = this.render.options.zoom;
		this.render.clientArea.innerHTML = '';
		this.render = new Render(this.render.clientArea, Object.assign({ scale: SCALE }, value));
		this.render.setMolecule(struct); // TODO: reuse this.struct here?
		this.render.setZoom(zoom);
		this.render.update();
	}
	return this.render.options;
};

Editor.prototype.zoom = function (value) {
	if (arguments.length > 0) {
		this.render.setZoom(value);
		recoordinate(this, getStructCenter(this.render.ctab,
		                                   this.selection()));
		this.render.update();
	}
	return this.render.options.zoom;
};

Editor.prototype.selection = function (selection) {
	if (arguments.length > 0) {
		this._selection = null;
		if (selection == 'all') {   // TODO: better way will be this.struct()
			var restruct = this.render.ctab;
			selection = structObjects.reduce(function (res, key) {
				res[key] = restruct[key].ikeys();
				return res;
			}, {});
		}
		if (selection) {
			var res = {};
			for (var key in selection) {
				if (selection[key].length > 0) // TODO: deep merge
					res[key] = selection[key].slice();
			}
			if (Object.keys(res) != 0)
				this._selection = res;
		}

		this.render.ctab.setSelection(this._selection);
		this.event.selectionChange.dispatch(this._selection);

		this.render.update();
	}
	return this._selection;
};

Editor.prototype.on = function (eventName, handler) {
	this.event[eventName].add(handler);
};

function domEventSetup(editor, clientArea) {
	// TODO: addEventListener('resize', ...);
	// assign canvas events handlers
	['OnClick', 'OnDblClick', 'OnMouseDown', 'OnMouseMove',
	 'OnMouseUp', 'OnMouseLeave'].forEach(function (method) {
		var eventName = method.slice(2).toLowerCase();
		clientArea.addEventListener(eventName, function (event) {
			/* eslint-disable no-underscore-dangle */
			if (method + '0' in editor._tool)
				editor._tool[method + '0'](event);
			else if (method in editor._tool)
				editor._tool[method](event);
			else
				console.warn("Can\'t process method");
			/* eslint-enable no-underscore-dangle */
			if (eventName != 'mouseup')
				// [NK] do not stop mouseup propagation
				// to maintain cliparea focus.
				// Do we really need total stop here?
				event.stopPropagation();
			return event.preventDefault();
		});
	});
}

function eventSetup(editor) {
	var pass = -1;
	editor.event = {
		message: new s.Subscription(),
		bondEdit: new s.PipelineSubscription(),
		apointEdit: new s.PipelineSubscription(),
		rgroupEdit: new s.PipelineSubscription(),
		sgroupEdit: new s.PipelineSubscription(),
		sdataEdit: new s.PipelineSubscription(),
		change: new s.PipelineSubscription(),
		selectionChange: new s.PipelineSubscription()
	};
	editor.event.change.add(function (action) {
		ui.addUndoAction(action, true);
		editor.render.update();
	}, pass);
}

Editor.prototype.findItem = function (event, maps, skip) {
	var pos = 'ui' in window ? new Vec2(this.render.page2obj(event)) :
	    new Vec2(event.pageX, event.pageY).sub(elementOffset(this.render.clientArea));
	var ci = closest.item(this.render.ctab, pos, maps, skip);

	// rbalabanov: let it be this way at the moment
	if (ci.type == 'Atom') ci.map = 'atoms';
	else if (ci.type == 'Bond') ci.map = 'bonds';
	else if (ci.type == 'SGroup') ci.map = 'sgroups';
	else if (ci.type == 'DataSGroupData') ci.map = 'sgroupData';
	else if (ci.type == 'RxnArrow') ci.map = 'rxnArrows';
	else if (ci.type == 'RxnPlus') ci.map = 'rxnPluses';
	else if (ci.type == 'Fragment') ci.map = 'frags';
	else if (ci.type == 'RGroup') ci.map = 'rgroups';
	else if (ci.type == 'ChiralFlag') ci.map = 'chiralFlags';
	return ci;
};

Editor.prototype.explicitSelected = function () {
	var selection = this.selection() || {};
	var res = structObjects.reduce(function (res, key) {
		res[key] = selection[key] ? selection[key].slice() : [];
		return res;
	}, {});

	var struct = this.render.ctab.molecule;
	// "auto-select" the atoms for the bonds in selection
	if ('bonds' in res) {
		res.bonds.forEach(function (bid) {
			var bond = struct.bonds.get(bid);
			res.atoms = res.atoms || [];
			if (res.atoms.indexOf(bond.begin) < 0) res.atoms.push(bond.begin);
			if (res.atoms.indexOf(bond.end) < 0) res.atoms.push(bond.end);
		});
	}
	// "auto-select" the bonds with both atoms selected
	if ('atoms' in res && 'bonds' in res) {
		struct.bonds.each(function (bid) {
			if (!('bonds' in res) || res.bonds.indexOf(bid) < 0) {
				var bond = struct.bonds.get(bid);
				if (res.atoms.indexOf(bond.begin) >= 0 && res.atoms.indexOf(bond.end) >= 0) {
					res.bonds = res.bonds || [];
					res.bonds.push(bid);
				}
			}
		});
	}

	return res;
};

Editor.prototype.structSelected = function () {
	var struct = this.render.ctab.molecule;
	var selection = this.explicitSelected();
	var dst = struct.clone(Set.fromList(selection.atoms),
						   Set.fromList(selection.bonds), true);

	// Copy by its own as Struct.clone doesn't support
	// arrows/pluses id sets
	struct.rxnArrows.each(function (id, item) {
		if (selection.rxnArrows.indexOf(id) != -1)
			dst.rxnArrows.add(item.clone());
	});
	struct.rxnPluses.each(function (id, item) {
		if (selection.rxnPluses.indexOf(id) != -1)
			dst.rxnPluses.add(item.clone());
	});
	dst.isChiral = (selection.chiralFlags.length > 0);

	// TODO: should be reaction only if arrwos? check this logic
	dst.isReaction = struct.isReaction &&
		(dst.rxnArrows.count() || dst.rxnPluses.count());

	return dst;
};

function recoordinate(editor, rp/* , vp*/) {
	// rp is a point in scaled coordinates, which will be positioned
	// vp is the point where the reference point should now be (in view coordinates)
	//    or the center if not set
	console.assert(rp, 'Reference point not specified');
	editor.render.setScrollOffset(0, 0);
	// var avp = this.render.obj2view(rp);
	// var so = avp.sub(vp || this.render.viewSz.scaled(0.5));
	// this.render.setScrollOffset(so.x, so.y);
}

function getStructCenter(restruct, selection) {
	var bb = restruct.getVBoxObj(selection || {});
	return Vec2.lc2(bb.p0, 0.5, bb.p1, 0.5);
}

// TODO: find DOM shorthand
function elementOffset(element) {
	var top = 0,
		left = 0;
	do {
		top += element.offsetTop  || 0;
		left += element.offsetLeft || 0;
		element = element.offsetParent;
	} while (element);
	return new Vec2(left, top);
}

module.exports = Editor;
