var util = require('../util');
var Set = require('../util/set');
var Vec2 = require('../util/vec2');

var ReStruct = require('../render/restruct');
var SelectionHelper = require('./tool/helper/selection');

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

var Editor = function (render)
{
	this.render = render;
	this._selectionHelper = new SelectionHelper(this);
	this._tool = null;
	this.setupEvents();
};

Editor.prototype.tool = function(name, opts) {
	if (name != undefined) {
		if (this._tool) {
			this._tool.OnCancel();
		}
		this._tool = new toolMap[name](this, opts);
	}
	return this._tool;
};

// Events setup extracted from render
Editor.prototype.setupEvents = function () {
	var editor = this;
	var render = this.render;
	var clientArea = render.clientArea;
	// rbalabanov: here is temporary fix for "drag issue" on iPad
	//BEGIN
	if ('hiddenPaths' in ReStruct.prototype) {
		clientArea.observe('touchend', function (event) {
			if (event.touches.length == 0) {
				while (ReStruct.prototype.hiddenPaths.length > 0) ReStruct.prototype.hiddenPaths.pop().remove();
			}
		});
	}
	//END

	// rbalabanov: two-fingers scrolling & zooming for iPad
	// TODO should be moved to touch.js module, re-factoring needed
	//BEGIN
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
	//END

	// [RB] KETCHER-396 (Main toolbar is grayed after the Shift-selection of some atoms/bonds)
	// here we prevent that freaking "accelerators menu" on IE8
	//BEGIN
	clientArea.observe('selectstart', function (event) {
		util.stopEventPropagation(event);
		return util.preventDefault(event);
	});
	//END

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
	//END

	clientArea.observe('onresize', function (event) {
		render.onResize();
	});

	// assign canvas events handlers
	['Click', 'DblClick', 'MouseDown', 'MouseMove', 'MouseUp', 'MouseLeave'].each(function (eventName){
		var bindEventName = eventName.toLowerCase();
		clientArea.observe(bindEventName, function (event) {
			if (eventName != 'MouseLeave') if (!ui || !ui.is_touch) {
				// TODO: karulin: fix this on touch devices if needed
				var co = clientArea.cumulativeOffset();
				co = new Vec2(co[0], co[1]);
				var vp = new Vec2(event.clientX, event.clientY).sub(co);
				var sz = new Vec2(clientArea.clientWidth, clientArea.clientHeight);
				if (!(vp.x > 0 && vp.y > 0 && vp.x < sz.x && vp.y < sz.y)) {// ignore events on the hidden part of the canvas
					if (eventName == 'MouseMove') {
						// [RB] here we alse emulate mouseleave when user drags mouse over toolbar (see KETCHER-433)
						editor._tool.processEvent('OnMouseLeave', event);
					}
					return util.preventDefault(event);
				}
			}

			editor._tool.processEvent('On' + eventName, event);
			if (eventName != 'MouseUp') {
				// [NK] do not stop mouseup propagation
				// to maintain cliparea focus.
				// Do we really need total stop here?
				util.stopEventPropagation(event);
			}
			if (bindEventName != 'touchstart' && (bindEventName != 'touchmove' || event.touches.length != 2))
				return util.preventDefault(event);
		});
	}, this);

};

Editor.prototype.selectAll = function () {
	var selection = {};
	for (var map in ReStruct.maps) {
		selection[map] = this.render.ctab[map].ikeys();
	}
	this._selectionHelper.setSelection(selection);
};

Editor.prototype.deselectAll = function () {
	this._selectionHelper.setSelection();
};

Editor.prototype.hasSelection = function (copyable) {
	if ('selection' in this._selectionHelper)
		for (var map in this._selectionHelper.selection)
			if (this._selectionHelper.selection[map].length > 0)
			if (!copyable || map !== 'sgroupData')
				return true;
	return false;
};

Editor.prototype.getSelection = function (explicit) {
	var selection = {};
	if ('selection' in this._selectionHelper) {
		for (var map in this._selectionHelper.selection) {
			selection[map] = this._selectionHelper.selection[map].slice(0);
		}
	}
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
			},
				this
			);
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
			},
				this
			);
		}
	}
	return selection;
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

	// TODO: should be reaction only if arrwos? check this logic
	dst.isReaction = struct.isReaction &&
		(dst.rxnArrows.count() || dst.rxnPluses.count());

	return dst;
};

module.exports = Editor;
