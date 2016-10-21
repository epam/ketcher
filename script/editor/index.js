var util = require('../util');
var Set = require('../util/set');
var Vec2 = require('../util/vec2');

var ReStruct = require('../render/restruct');
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

var ui = global.ui;

function Editor(render) {
	this.render = render;
	this.selection = {};
	this._tool = null; // eslint-disable-line
	this.setupEvents();
}

Editor.prototype.tool = function (name, opts) {
	if (name != undefined) {
		/* eslint-disable no-underscore-dangle*/
		if (this._tool)
			this._tool.OnCancel(); // eslint-disable-line new-cap
		this._tool = new toolMap[name](this, opts);
	}
	return this._tool;
	/* eslint-enable no-underscore-dangle*/
};

// Events setup extracted from render
Editor.prototype.setupEvents = function () { // eslint-disable-line max-statements
	var editor = this;
	var render = this.render;
	var clientArea = render.clientArea;

	// rbalabanov: two-fingers scrolling & zooming for iPad
	// TODO should be moved to touch.js module, re-factoring needed
	// BEGIN
	this.longTapFlag = false;
	this.longTapTimeout = null;
	this.longTapTouchstart = null;

	editor.setLongTapTimeout = function (event) {
		editor.longTapFlag = false;
		editor.longTapTouchstart = event;
		editor.longTapTimeout = setTimeout(function () {
			editor.longTapFlag = true;
			editor.longTapTimeout = null;
		}, 500);
	};

	editor.resetLongTapTimeout = function (resetFlag) {
		clearTimeout(editor.longTapTimeout);
		editor.longTapTimeout = null;
		if (resetFlag) {
			editor.longTapTouchstart = null;
			editor.longTapFlag = false;
		}
	};
	// END

	// [RB] KETCHER-396 (Main toolbar is grayed after the Shift-selection of some atoms/bonds)
	// here we prevent that freaking "accelerators menu" on IE8
	// BEGIN
	clientArea.observe('selectstart', function (event) {
		util.stopEventPropagation(event);
		return util.preventDefault(event);
	});
	// END

	/* eslint-disable no-underscore-dangle*/
	var zoomStaticPoint = null;
	clientArea.observe('touchstart', function (event) {
		editor.resetLongTapTimeout(true);
		if (event.touches.length == 2) {
			this._tui = this._tui || {};
			this._tui.center = {
				pageX: (event.touches[0].pageX + event.touches[1].pageX) / 2,
				pageY: (event.touches[0].pageY + event.touches[1].pageY) / 2
			};
			// set the reference point for the "static point" zoom (in object coordinates)
			zoomStaticPoint = new Vec2(render.page2obj(this._tui.center));
		} else if (event.touches.length == 1) {
			editor.setLongTapTimeout(event);
		}
	});
	clientArea.observe('touchmove', function (event) {
		editor.resetLongTapTimeout(true);
		if ('_tui' in this && event.touches.length == 2) {
			this._tui.center = {
				pageX: (event.touches[0].pageX + event.touches[1].pageX) / 2,
				pageY: (event.touches[0].pageY + event.touches[1].pageY) / 2
			};
		}
	});
	clientArea.observe('gesturestart', function (event) {
		this._tui = this._tui || {};
		this._tui.scale0 = render.zoom;
		event.preventDefault();
	});
	clientArea.observe('gesturechange', function (event) {
		render.setZoom(this._tui.scale0 * event.scale);
		var offset = clientArea.cumulativeOffset();
		var pp = new Vec2(this._tui.center.pageX - offset.left,
						  this._tui.center.pageY - offset.top);
		render.recoordinate(pp, zoomStaticPoint);
		render.update();
		event.preventDefault();
	});
	clientArea.observe('gestureend', function (event) {
		delete this._tui;
		event.preventDefault();
	});
	// END
	/* eslint-enable no-underscore-dangle*/

	clientArea.observe('onresize', function (event) {  // eslint-disable-line no-unused-vars
		render.onResize();
	});

	// assign canvas events handlers
	['Click', 'DblClick', 'MouseDown', 'MouseMove', 'MouseUp', 'MouseLeave'].each(function (eventName) {
		var bindEventName = eventName.toLowerCase();
		clientArea.observe(bindEventName, function (event) {
			if (eventName != 'MouseLeave') {
				if (!ui || !ui.is_touch) {
					// TODO: karulin: fix this on touch devices if needed
					var co = clientArea.cumulativeOffset();
					co = new Vec2(co[0], co[1]);
					var vp = new Vec2(event.clientX, event.clientY).sub(co);
					var sz = new Vec2(clientArea.clientWidth, clientArea.clientHeight);
					if (!(vp.x > 0 && vp.y > 0 && vp.x < sz.x && vp.y < sz.y)) { // ignore events on the hidden part of the canvas
						if (eventName == 'MouseMove')
							// [RB] here we alse emulate mouseleave when user drags mouse over toolbar (see KETCHER-433)
							editor._tool.processEvent('OnMouseLeave', event); // eslint-disable-line no-underscore-dangle
						return util.preventDefault(event);
					}
				}
			}

			editor._tool.processEvent('On' + eventName, event); // eslint-disable-line no-underscore-dangle
			if (eventName != 'MouseUp')
				// [NK] do not stop mouseup propagation
				// to maintain cliparea focus.
				// Do we really need total stop here?
				util.stopEventPropagation(event);
			if (bindEventName != 'touchstart' && (bindEventName != 'touchmove' || event.touches.length != 2))
				return util.preventDefault(event);
		});
	}, this);
};

Editor.prototype.findItem = function (event, maps, skip) {
	var pos = 'ui' in window ? new Vec2(this.render.page2obj(event)) :
	    new Vec2(event.pageX, event.pageY).sub(this.render.clientAreaPos);
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

Editor.prototype.hasSelection = function (copyable) {
	for (var map in this.selection) {
		if (this.selection[map].length > 0 &&
		    (!copyable || map !== 'sgroupData'))
			return true;
	}
	return false;
};

Editor.prototype.getSelection = function (explicit) {
	var selection = {};
	for (var map in this.selection)
		selection[map] = this.selection[map].slice();

	if (explicit) {
		var struct = this.render.ctab.molecule;
		// "auto-select" the atoms for the bonds in selection
		if ('bonds' in selection) {
			selection.bonds.each(
			function (bid) {
				var bond = struct.bonds.get(bid);
				selection.atoms = selection.atoms || [];
				if (selection.atoms.indexOf(bond.begin) < 0) selection.atoms.push(bond.begin);
				if (selection.atoms.indexOf(bond.end) < 0) selection.atoms.push(bond.end);
			});
		}
		// "auto-select" the bonds with both atoms selected
		if ('atoms' in selection && 'bonds' in selection) {
			struct.bonds.each(
			function (bid) {
				if (!('bonds' in selection) || selection.bonds.indexOf(bid) < 0) {
					var bond = struct.bonds.get(bid);
					if (selection.atoms.indexOf(bond.begin) >= 0 && selection.atoms.indexOf(bond.end) >= 0) {
						selection.bonds = selection.bonds || [];
						selection.bonds.push(bid);
					}
				}
			});
		}
	}
	return selection;
};

Editor.prototype.setSelection = function (selection, add) {
	if (!add) {
		this.selection = {};
		for (var map1 in ReStruct.maps)
			this.selection[map1] = [];
	}

	if (selection) {
		if ('id' in selection && 'map' in selection)
			(selection[selection.map] = selection[selection.map] || []).push(selection.id); // NK: WTF??

		for (var map2 in this.selection) {
			if (map2 in selection) {
				for (var i = 0; i < selection[map2].length; i++) {
					if (this.selection[map2].indexOf(selection[map2][i]) < 0) // eslint-disable-line max-depth
						this.selection[map2].push(selection[map2][i]);
				}
			}
		}
	}
	console.assert(this.selection, 'Selection cannot be null');
	this.render.ctab.setSelection(this.selection);
	this.render.update();

	ui.updateClipboardButtons(); // TODO notify ui about selection
};

Editor.prototype.selectAll = function () {
	var selection = {};
	for (var map in ReStruct.maps)
		selection[map] = this.render.ctab[map].ikeys();
	this.setSelection(selection);
};

Editor.prototype.getSelectionStruct = function () {
	var struct = this.render.ctab.molecule;
	var selection = this.getSelection(true);
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
// TODO: Chiral
	// TODO: should be reaction only if arrwos? check this logic
	dst.isReaction = struct.isReaction &&
		(dst.rxnArrows.count() || dst.rxnPluses.count());

	return dst;
};

module.exports = Editor;
