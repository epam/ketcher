/*global require, alert, global, $$, ui:false*/

/*eslint-disable*/

var Set = require('../util/set');
var Vec2 = require('../util/vec2');

var ui = global.ui = global.ui || {}; // jshint ignore:line

require('../chem');
require('../rnd');

var util = require('../util');
var server = require('./server.js');
var Action = require('./action.js');
var io = require('./dialog/io');

var chem = global.chem;
var rnd = global.rnd;


var DEBUG = { forwardExceptions: false };
var SCALE = 40;  // const
var HISTORY_LENGTH = 32;

ui.render = null;

ui.ctab = new chem.Struct();

ui.standalone = true;

// TODO: to delete (only in dialogs/crap)
ui.client_area = null;

var undoStack = [];
var redoStack = [];

var initialized = false;
var ketcher_window;
var toolbar;
var zoomSelect;
var actionComplete;
//
// Init section
//
ui.init = function (parameters, opts) {
	ketcher_window = $$('[role=application]')[0] || $$('body')[0];
	toolbar = ketcher_window.select('[role=toolbar]')[0];
	ui.client_area = $('ketcher');

	parameters = Object.extend({
		api_path: '',
		static_path: ''
	}, parameters);
	ui.api_path = parameters.api_path; // move to api-side
	ui.static_path = parameters.static_path;

	actionComplete = parameters.actionComplete || function (){};
	if (initialized)
	{
		Action.fromNewCanvas(new chem.Struct());
		ui.render.update();
		undoStack.clear();
		redoStack.clear();
		updateHistoryButtons();
		ui.selectAction(null);
		return;
	}

	if (['http:', 'https:'].indexOf(window.location.protocol) >= 0) { // don't try to knock if the file is opened locally ("file:" protocol)
		// TODO: check if this is nesessary
		server.knocknock().then(function (res) {
			ui.standalone = false;
		}, function (val) {
			document.title += ' (standalone)';
			// probably must be disabled by default
			$$('#cleanup', '#arom', '#dearom',
				'#reaction-automap', '#template-custom').each(function (el) {
				subEl(el).setAttribute('disabled', true);
			});
		}).then(function () {
			// TODO: move it out there as server incapsulates
			// standalone
			if (parameters.mol) {
				ui.loadMolecule(parameters.mol);
			}
		});
	}

	ui.initDialogs();

	// Button events
	toolbar.select('button').each(function (el) {
		el.on('mouseover', function () {
			if (this.hasAttribute('disabled')) {
				return;
			}

			//! TITLE ME, toolText
			// var status = this.getAttribute('title');
			var status = this.innerHTML;
			if (status != null) {
				window.status = status;
			}
		});
	});

	toolbar.select('li').each(function (el) {
		el.on('click', function (event) {
			if (event.target.tagName == 'BUTTON' &&
			event.target.parentNode == this) {
				if (!this.hasClassName('selected')) {
					event.stop();
				}
				ui.selectAction(this);
			}

			if (ui.hideBlurredControls()) {
				event.stop();
			}
			else if (this.getStyle('overflow') == 'hidden') {
				this.addClassName('opened');
				ui.dropdown_opened = this;
				event.stop();
			}
		});
	});

	zoomSelect = subEl('zoom-list');
	// TODO: only in dialog/crap and render one time
	ui.zoom = parseFloat(zoomSelect.options[zoomSelect.selectedIndex].innerHTML) / 100;

	// TODO: remove this^ shit (used in rnd.Render guts)
	zoomSelect.on('change', function () {
		updateZoom();
		//ui.blur();
	});
	ui.client_area.on('scroll', onScroll_ClientArea);

	updateHistoryButtons();

	// Init renderer
	opts = new rnd.RenderOptions(opts);
	opts.atomColoring = true;
	ui.render =  new rnd.Render(ui.client_area, SCALE, opts);
	ui.editor = new rnd.Editor(ui.render);

	ui.render.onCanvasOffsetChanged = onOffsetChanged;

	ui.selectAction('select-lasso');
	setScrollOffset(0, 0);

	ui.render.setMolecule(ui.ctab);
	ui.render.update();

	initialized = true;
};

function subEl (id) {
	return $(id).children[0];
};

ui.hideBlurredControls = function () {
	if (!ui.dropdown_opened) {
		return false;
	}

	ui.dropdown_opened.removeClassName('opened');
	var sel = ui.dropdown_opened.select('.selected');
	if (sel.length == 1) {
		//var index = sel[0].previousSiblings().size();
		var menu = subEl(ui.dropdown_opened);
		menu.style.marginTop = (-sel[0].offsetTop + menu.offsetTop) + 'px';
	}

	// FIX: Quick fix of Chrome (Webkit probably) box-shadow
	// repaint bug: http://bit.ly/1iiSMgy
	// needs investigation, performance
	ui.client_area.style.visibility = 'hidden';
	setTimeout(function () {
		ui.client_area.style.visibility = 'visible';
	}, 0);
	// ?? ui.render.update(true);
	// END
	ui.dropdown_opened = null;
	return true;
};

// TODO: split to selection by id (atom) and selection by element
ui.selectAction = function (query) {

	// TODO: last_selected -> prevtool_id
	query = query || ui.last_selected;
	var id = query.id || query,
	el = $(query);

	// TODO: refactor !el - case when there are no such id
	if (!el || !subEl(el).hasAttribute('disabled')) {
		var action = actionMap[id],
		tool = action ? action() : mapTool(id);
		if (tool) {
			var oldel = toolbar.select('.selected')[0];
			//console.assert(!ui.last_selected || oldel,
			//               "No last mode selected!");

			if (el != oldel || !el) { // tool canceling needed when dialog opens
				// if el.selected not changed
				if (ui.render.current_tool) {
					ui.render.current_tool.OnCancel();
				}
				ui.render.current_tool = tool;

				if (id.startsWith && id.startsWith('select-')) {
					// hack to ensure id is string (not element as in atom case)
					ui.last_selected = id;
				}
				if (el) {
					el.addClassName('selected');
				}
				if (oldel) {
					oldel.removeClassName('selected');
				}
			}
		}
	}
};

function updateHistoryButtons () {
	if (undoStack.length == 0) {
		subEl('undo').setAttribute('disabled', true);
	}
	else {
		subEl('undo').removeAttribute('disabled');
	}

	if (redoStack.length == 0) {
		subEl('redo').setAttribute('disabled', true);
	}
	else {
		subEl('redo').removeAttribute('disabled');
	}
};

ui.updateClipboardButtons = function () {
	if (isClipboardEmpty())
		subEl('paste').setAttribute('disabled', true);
	else {
		subEl('paste').removeAttribute('disabled');
	}

	if (ui.editor.hasSelection(true)) {
		subEl('copy').removeAttribute('disabled');
		subEl('cut').removeAttribute('disabled');
	} else {
		subEl('copy').setAttribute('disabled', true);
		subEl('cut').setAttribute('disabled', true);
	}
};

function transitionEndEvent () {
	var el = document.createElement('transitionTest'),
	transEndEventNames = {
		'WebkitTransition': 'webkitTransitionEnd',
		'MozTransition': 'transitionend',
		'OTransition': 'oTransitionEnd otransitionend',
		'transition': 'transitionend'
	},
	name;
	for (name in transEndEventNames) {
		if (el.style[name] !== undefined)
			return transEndEventNames[name];
	}
	return false;
};

function animateToggle (el, callback) {
	ketcher_window.addClassName('animate');
	var transitionEnd = transitionEndEvent(),
	animateStop = function (cb) {
		setTimeout(function () {
				cb && cb();
			ketcher_window.removeClassName('animate');
		}, 0);
	};

	if (!callback || !transitionEnd) {
		animateStop(callback);
			callback || el();
	}
	else {
		var fireOne = function () {
			animateStop(callback);
			el.removeEventListener(transitionEnd, fireOne, false);
		};
		el.addEventListener(transitionEnd, fireOne, false);
	}
};

ui.showDialog = function (name) {
	var dialog = $(name);
	animateToggle(function () {
		$$('.overlay')[0].show();
		// dialog.show();
		dialog.style.display = '';
	});
	return dialog;
};

ui.hideDialog = function (name) {
	var cover = $$('.overlay')[0];
	animateToggle(cover, function () {
		// $(name).hide();
		$(name).style.display = 'none';
		cover.hide();
	});
};

ui.echo = function (message) {
	// TODO: make special area for messages
	alert(message);
};

//
// Main section
//
function updateMolecule (mol)
{
	if (typeof(mol) == 'undefined' || mol == null)
		return;

	ui.editor.deselectAll();

	ui.addUndoAction(Action.fromNewCanvas(mol));

	ui.showDialog('loading');
	// setTimeout(function ()
	// {
	try
	{
		ui.render.onResize(); // TODO: this methods should be called in the resize-event handler
		ui.render.update();
		setZoomCentered(null, ui.render.getStructCenter());
	} catch (er)
		{
			if (DEBUG.forwardExceptions)
				throw er;
			alert(er.message);
		} finally
	{
		ui.hideDialog('loading');
	}
//    }, 50);
};


ui.addUndoAction = function (action, check_dummy)
{
	if (action == null)
		return;

	if (check_dummy != true || !action.isDummy())
	{
		undoStack.push(action);
		redoStack.clear();
		if (undoStack.length > HISTORY_LENGTH)
			undoStack.splice(0, 1);
		updateHistoryButtons();
		actionComplete();
	}
};

//
// New document
//
function onClick_NewFile ()
{
	ui.selectAction(null);

	if (!ui.ctab.isBlank()) {
		ui.addUndoAction(Action.fromNewCanvas(new chem.Struct()));
		ui.render.update();
	}
};

// TODO: remove it as we get better server
ui.loadMoleculeFromFile = io.loadHook;

function onClick_OpenFile ()
{
	io.openDialog({
		onOk: function (res) {
			ui.loadMolecule(res.value, false, true, res.fragment);
		}
	});
};

function onClick_SaveFile ()
{
	io.saveDialog({molecule: ui.ctab});
};


function dearomatizeMolecule (mol, aromatize)
{
	mol = mol.clone();
	var implicitReaction = mol.addRxnArrowIfNecessary();
	var mol_string = new chem.MolfileSaver().saveMolecule(mol);

	if (!ui.standalone) {
		var method = aromatize ? 'aromatize' : 'dearomatize',
		request = server[method]({moldata: mol_string});
		request.then(function (data) {
			var resmol = ui.parseCTFile(data);
			if (implicitReaction)
				resmol.rxnArrows.clear();
			updateMolecule(resmol);
		}, ui.echo);
	} else {
		throw new Error('Aromatization and dearomatization are not supported in the standalone mode.');
	}
};

//
// Zoom section
//
function onClick_ZoomIn () {
	zoomSelect.selectedIndex++;
	updateZoom();
};

function onClick_ZoomOut () {
	zoomSelect.selectedIndex--;
	updateZoom();
};

function updateZoom () {
	var i = zoomSelect.selectedIndex,
	len = zoomSelect.length;
	console.assert(0 <= i && i < len, 'Zoom out of range');

	if (i == len - 1)
		subEl('zoom-in').setAttribute('disabled', true);
	else
		subEl('zoom-in').removeAttribute('disabled');
	if (i == 0)
		subEl('zoom-out').setAttribute('disabled', true);
	else
		subEl('zoom-out').removeAttribute('disabled');

	var value = parseFloat(zoomSelect.options[i].innerHTML) / 100;
	setZoomCentered(value,
	ui.render.getStructCenter(ui.editor.getSelection()));
	ui.zoom = value;
	ui.render.update();
};

function setZoomRegular (zoom) {
	//mr: prevdent unbounded zooming
	//begin
	if (zoom < 0.1 || zoom > 10)
		return;
	//end
	ui.zoom = zoom;
	ui.render.setZoom(ui.zoom);
	// when scaling the canvas down it may happen that the scaled canvas is smaller than the view window
	// don't forget to call setScrollOffset after zooming (or use extendCanvas directly)
};

// get the size of the view window in pixels
function getViewSz () {
	return new Vec2(ui.render.viewSz);
};

// c is a point in scaled coordinates, which will be positioned in the center of the view area after zooming
function setZoomCentered (zoom, c) {
	if (!c)
		throw new Error('Center point not specified');
	if (zoom) {
		setZoomRegular(zoom);
	}
	setScrollOffset(0, 0);
	var sp = ui.render.obj2view(c).sub(ui.render.viewSz.scaled(0.5));
	setScrollOffset(sp.x, sp.y);
};

// set the reference point for the "static point" zoom (in object coordinates)
ui.setZoomStaticPointInit = function (s) {
	ui.zspObj = new Vec2(s);
};

// vp is the point where the reference point should now be (in view coordinates)
ui.setZoomStaticPoint = function (zoom, vp) {
	setZoomRegular(zoom);
	setScrollOffset(0, 0);
	var avp = ui.render.obj2view(ui.zspObj);
	var so = avp.sub(vp);
	setScrollOffset(so.x, so.y);
};

function setScrollOffset (x, y) {
	var cx = ui.client_area.clientWidth;
	var cy = ui.client_area.clientHeight;
	ui.render.extendCanvas(x, y, cx + x, cy + y);
	ui.client_area.scrollLeft = x;
	ui.client_area.scrollTop = y;
	scrollLeft = ui.client_area.scrollLeft; // TODO: store drag position in scaled systems
	scrollTop = ui.client_area.scrollTop;
};

function setScrollOffsetRel (dx, dy) {
	setScrollOffset(ui.client_area.scrollLeft + dx, ui.client_area.scrollTop + dy);
};

//
// Automatic layout
//
function onClick_CleanUp ()
{
	var atoms = util.array(ui.editor.getSelection(true).atoms);
	var selective = atoms.length > 0;
	if (selective) {
		var atomSet = Set.fromList(atoms);
		var atomSetExtended = Set.empty();
		ui.ctab.loops.each(function (lid, loop) {
			// if selection contains any of the atoms in this loop, add all the atoms in the loop to selection
			if (util.find(loop.hbs, function (hbid) {
				return Set.contains(atomSet, ui.ctab.halfBonds.get(hbid).begin);
			}) >= 0)
				util.each(loop.hbs, function (hbid) {
					Set.add(atomSetExtended, ui.ctab.halfBonds.get(hbid).begin);
				}, this);
		}, this);
		Set.mergeIn(atomSetExtended, atomSet);
		atoms = Set.list(atomSetExtended);
	}
	ui.editor.deselectAll();
	try {
		var aidMap = {};
		var mol = ui.ctab.clone(null, null, false, aidMap);
		if (selective) {
			util.each(atoms, function (aid){
				aid = aidMap[aid];
				var dsg = new chem.SGroup('DAT');
				var dsgid = mol.sgroups.add(dsg);
				dsg.id = dsgid;
				dsg.pp = new Vec2();
				dsg.data.fieldName = '_ketcher_selective_layout';
				dsg.data.fieldValue = '1';
				mol.atomAddToSGroup(dsgid, aid);
			}, this);
		}
		var implicitReaction = mol.addRxnArrowIfNecessary();
		ui.loadMolecule(new chem.MolfileSaver().saveMolecule(mol), true, false, false, implicitReaction, selective);
	} catch (er) {
			if (DEBUG.forwardExceptions)
				throw er;
			alert('ERROR: ' + er.message); // TODO [RB] ??? global re-factoring needed on error-reporting
		}
};

function onClick_Aromatize ()
{
	try {
		dearomatizeMolecule(ui.ctab, true);
	} catch (er) {
			if (DEBUG.forwardExceptions)
				throw er;
			alert('Molfile: ' + er.message);
		}
};

function onClick_Dearomatize ()
{
	try {
		dearomatizeMolecule(ui.ctab, false);
	} catch (er) {
			if (DEBUG.forwardExceptions)
				throw er;
			alert('Molfile: ' + er.message);
		}
};


function onClick_Automap () {
	ui.showAutomapProperties({
		onOk: function (mode) {
			var mol = ui.ctab;
			var implicitReaction = mol.addRxnArrowIfNecessary();
			if (mol.rxnArrows.count() == 0) {
				ui.echo('Auto-Mapping can only be applied to reactions');
				return;
			}
			var moldata = new chem.MolfileSaver().saveMolecule(mol, true),
			request = server.automap({
				moldata: moldata,
				mode: mode
			});

			request.then(function (res) {
				var mol = ui.parseCTFile(res);
				if (implicitReaction) {
					mol.rxnArrows.clear();
				}
				/*
                 var aam = ui.parseCTFile(res.responseText);
                 var action = new Action();
                 for (var aid = aam.atoms.count() - 1; aid >= 0; aid--) {
                 action.mergeWith(Action.fromAtomAttrs(aid, { aam : aam.atoms.get(aid).aam }));
                 }
                 ui.addUndoAction(action, true);
                 */
				updateMolecule(mol);
				/*
                 ui.render.update();
                 */

			}, ui.echo);
		}
	});
};

// TODO: refactor me
ui.loadMolecule = function (mol_string, force_layout, check_empty_line, paste, discardRxnArrow, selective_layout)
{
	var updateFunc = function (struct) {
		if (discardRxnArrow)
			struct.rxnArrows.clear();
		if (paste) {
			(function (struct) {
				struct.rescale();
				if (!copy(struct)) {
					alert('Not a valid structure to paste');
					return;
				}
				ui.editor.deselectAll();
				ui.selectAction('paste');
			}).call(this, struct);
		} else {
			updateMolecule.call(this, struct);
		}
	};

	var smiles = mol_string.strip();
	if (smiles.indexOf('\n') == -1) {
		if (ui.standalone) {
			if (smiles != '') {
				ui.echo('SMILES is not supported in a standalone mode.');
			}
			return;
		}
		var request = server.layout_smiles(null, {smiles: smiles});
		request.then(function (res) {
			updateFunc.call(ui, ui.parseCTFile(res));
		});
	} else if (!ui.standalone && force_layout) {
		var req = server.layout({moldata: mol_string},
			selective_layout ? {'selective': 1} : null);
		req.then(function (res) {
			updateFunc.call(ui, ui.parseCTFile(res));
		});
	} else {
		updateFunc.call(ui, ui.parseCTFile(mol_string, check_empty_line));
	}
};

ui.page2canvas2 = function (pos)
{
	var offset = ui.client_area.cumulativeOffset();

	return new Vec2(pos.pageX - offset.left, pos.pageY - offset.top);
};

ui.page2obj = function (pagePos)
{
	return ui.render.view2obj(ui.page2canvas2(pagePos));
};

ui.scrollPos = function ()
{
	return new Vec2(ui.client_area.scrollLeft, ui.client_area.scrollTop);
};

//
// Scrolling
//
var scrollLeft = null;
var scrollTop = null;

function onScroll_ClientArea (event)
{
	// ! DIALOG ME
	// if ($('input_label').visible())
	//      $('input_label').hide();

	scrollLeft = ui.client_area.scrollLeft;
	scrollTop = ui.client_area.scrollTop;

	util.stopEventPropagation(event);
};

//
// Clicking
//

// Get new atom id/label and pos for bond being added to existing atom
ui.atomForNewBond = function (id)
{
	var neighbours = [];
	var pos = ui.render.atomGetPos(id);

	ui.render.atomGetNeighbors(id).each(function (nei)
	{
		var nei_pos = ui.render.atomGetPos(nei.aid);

		if (Vec2.dist(pos, nei_pos) < 0.1)
			return;

		neighbours.push({id: nei.aid, v: Vec2.diff(nei_pos, pos)});
	});

	neighbours.sort(function (nei1, nei2)
	{
		return Math.atan2(nei1.v.y, nei1.v.x) - Math.atan2(nei2.v.y, nei2.v.x);
	});

	var i, max_i = 0;
	var angle, max_angle = 0;

	// TODO: impove layout: tree, ...

	for (i = 0; i < neighbours.length; i++) {
		angle = Vec2.angle(neighbours[i].v, neighbours[(i + 1) % neighbours.length].v);

		if (angle < 0)
			angle += 2 * Math.PI;

		if (angle > max_angle)
			max_i = i, max_angle = angle;
	}

	var v = new Vec2(1, 0);

	if (neighbours.length > 0) {
		if (neighbours.length == 1) {
			max_angle = -(4 * Math.PI / 3);

			// zig-zag
			var nei = ui.render.atomGetNeighbors(id)[0];
			if (ui.render.atomGetDegree(nei.aid) > 1) {
				var nei_neighbours = [];
				var nei_pos = ui.render.atomGetPos(nei.aid);
				var nei_v = Vec2.diff(pos, nei_pos);
				var nei_angle = Math.atan2(nei_v.y, nei_v.x);

				ui.render.atomGetNeighbors(nei.aid).each(function (nei_nei) {
					var nei_nei_pos = ui.render.atomGetPos(nei_nei.aid);

					if (nei_nei.bid == nei.bid || Vec2.dist(nei_pos, nei_nei_pos) < 0.1)
						return;

					var v_diff = Vec2.diff(nei_nei_pos, nei_pos);
					var ang = Math.atan2(v_diff.y, v_diff.x) - nei_angle;

					if (ang < 0)
						ang += 2 * Math.PI;

					nei_neighbours.push(ang);
				});
				nei_neighbours.sort(function (nei1, nei2) {
					return nei1 - nei2;
				});

				if (nei_neighbours[0] <= Math.PI * 1.01 && nei_neighbours[nei_neighbours.length - 1] <= 1.01 * Math.PI)
					max_angle *= -1;

			}
		}

		angle = (max_angle / 2) + Math.atan2(neighbours[max_i].v.y, neighbours[max_i].v.x);

		v = v.rotate(angle);
	}

	v.add_(pos);

	var a = ui.render.findClosestAtom(v, 0.1);

	if (a == null)
		a = {label: 'C'};
	else
		a = a.id;

	return {atom: a, pos: v};
};

//
// Canvas size
//
function onOffsetChanged (newOffset, oldOffset)
{
	if (oldOffset == null)
		return;

	var delta = new Vec2(newOffset.x - oldOffset.x, newOffset.y - oldOffset.y);

	ui.client_area.scrollLeft += delta.x;
	ui.client_area.scrollTop += delta.y;
};

function selectAll ()
{
	if (!ui.ctab.isBlank()) {
		ui.editor.selectAll();
	}
};

function removeSelected ()
{
	ui.addUndoAction(Action.fromFragmentDeletion());
	ui.editor.deselectAll();
	ui.render.update();
};

function undo ()
{
	if (ui.render.current_tool)
		ui.render.current_tool.OnCancel();

	ui.editor.deselectAll();
	redoStack.push(undoStack.pop().perform());
	ui.render.update();
	updateHistoryButtons();
	ui.actionComplete();
};

function redo ()
{
	if (ui.render.current_tool)
		ui.render.current_tool.OnCancel();

	ui.editor.deselectAll();
	undoStack.push(redoStack.pop().perform());
	ui.render.update();
	updateHistoryButtons();
	ui.actionComplete();
};

//
// Clipboard actions
//

ui.clipboard = null;

function isClipboardEmpty ()
{
	return ui.clipboard == null;
};

function copy (struct, selection)
{
	if (!struct) {
		struct = ui.ctab;
		selection = ui.editor.getSelection(true);
	}

	// these will be copied automatically along with the
	//  corresponding s-groups
	if (selection && selection.sgroupData) {
		selection.sgroupData.clear();
	}

	ui.clipboard =
	{
		atoms: [],
		bonds: [],
		sgroups: [],
		rxnArrows: [],
		rxnPluses: [],
		chiralFlags: [],
		rgmap: {},
		rgroups: {},
		// RB: let it be here for the moment
		// TODO: "clipboard" support to be moved to editor module
		getAnchorPosition: function () {
			if (this.atoms.length) {
				var xmin = 1e50, ymin = xmin, xmax = -xmin, ymax = -ymin;
				for (var i = 0; i < this.atoms.length; i++) {
					xmin = Math.min(xmin, this.atoms[i].pp.x); ymin = Math.min(ymin, this.atoms[i].pp.y);
					xmax = Math.max(xmax, this.atoms[i].pp.x); ymax = Math.max(ymax, this.atoms[i].pp.y);
				}
				return new Vec2((xmin + xmax) / 2, (ymin + ymax) / 2); // TODO: check
			} else if (this.rxnArrows.length) {
				return this.rxnArrows[0].pp;
			} else if (this.rxnPluses.length) {
				return this.rxnPluses[0].pp;
			} else if (this.chiralFlags.length) {
				return this.chiralFlags[0].pp;
			} else {
				return null;
			}
		}
	};

	structToClipboard(ui.clipboard, struct, selection);
	return !!ui.clipboard.getAnchorPosition();
};

function structToClipboard (clipboard, struct, selection)
{
	selection = selection || {
		atoms: struct.atoms.keys(),
		bonds: struct.bonds.keys(),
		rxnArrows: struct.rxnArrows.keys(),
		rxnPluses: struct.rxnPluses.keys()
		};

	var mapping = {};

	selection.atoms.each(function (id)
	{
		var new_atom = new chem.Struct.Atom(struct.atoms.get(id));
		new_atom.pos = new_atom.pp;
		mapping[id] = clipboard.atoms.push(new chem.Struct.Atom(new_atom)) - 1;
	});

	selection.bonds.each(function (id)
	{
		var new_bond = new chem.Struct.Bond(struct.bonds.get(id));
		new_bond.begin = mapping[new_bond.begin];
		new_bond.end = mapping[new_bond.end];
		clipboard.bonds.push(new chem.Struct.Bond(new_bond));
	});

	var sgroup_list = struct.getSGroupsInAtomSet(selection.atoms);

	util.each(sgroup_list, function (sid){
		var sgroup = struct.sgroups.get(sid);
		var sgAtoms = chem.SGroup.getAtoms(struct, sgroup);
		var sgroup_info = {
			type: sgroup.type,
			attrs: sgroup.getAttrs(),
			atoms: util.array(sgAtoms),
			pp: sgroup.pp
		};

		for (var i = 0; i < sgroup_info.atoms.length; i++)
			sgroup_info.atoms[i] = mapping[sgroup_info.atoms[i]];

		clipboard.sgroups.push(sgroup_info);
	}, this);

	selection.rxnArrows.each(function (id)
	{
		var arrow = new chem.Struct.RxnArrow(struct.rxnArrows.get(id));
		arrow.pos = arrow.pp;
		clipboard.rxnArrows.push(arrow);
	});

	selection.rxnPluses.each(function (id)
	{
		var plus = new chem.Struct.RxnPlus(struct.rxnPluses.get(id));
		plus.pos = plus.pp;
		clipboard.rxnPluses.push(plus);
	});

	// r-groups
	var atomFragments = {};
	var fragments = Set.empty();
	selection.atoms.each(function (id) {
		var atom = struct.atoms.get(id);
		var frag = atom.fragment;
		atomFragments[id] = frag;
		Set.add(fragments, frag);
	});

	var rgids = Set.empty();
	Set.each(fragments, function (frid){
		var atoms = chem.Struct.Fragment.getAtoms(struct, frid);
		for (var i = 0; i < atoms.length; ++i)
			if (!Set.contains(atomFragments, atoms[i]))
				return;
		var rgid = chem.Struct.RGroup.findRGroupByFragment(struct.rgroups, frid);
		clipboard.rgmap[frid] = rgid;
		Set.add(rgids, rgid);
	}, this);

	Set.each(rgids, function (id){
		clipboard.rgroups[id] = struct.rgroups.get(id).getAttrs();
	}, this);
};

var current_elemtable_props = null;
function onClick_ElemTableButton ()
{
	ui.showElemTable({
		onOk: function (res) {
			var props;
			if (res.mode == 'single')
				props = {
					label: chem.Element.elements.get(res.values[0]).label
				};
			else
				props = {
					label: 'L#',
					atomList: new chem.Struct.AtomList({
						notList: res.mode == 'not-list',
						ids: res.values
					})
				};
			current_elemtable_props = props;
			ui.selectAction('atom-table');
			return true;
		},
		onCancel: function () {
			//ui.elem_table_obj.restore();
		}
	});
};

var current_reagenerics = null;
function onClick_ReaGenericsTableButton ()
{
	ui.showReaGenericsTable({
		onOk: function (res) {
			current_reagenerics = {label: res.values[0]};
			ui.selectAction('atom-reagenerics');
			return true;
		}
	});
};

// TODO: remove this crap (quick hack to pass parametr to selectAction)
var current_template_custom = null;
function onClick_TemplateCustom () {
	ui.showTemplateCustom(ui.static_path,{
		onOk: function (tmpl) {
			current_template_custom = tmpl;
			ui.selectAction('template-custom-select');
			return true;
		}
	});
};

// try to reconstruct molfile string instead parsing multiple times
// TODO: move this logic to chem.Molfile
ui.parseCTFile = function (molfile, check_empty_line) {
	var lines = molfile.split('\n');

	try {
		try {
			return chem.Molfile.parseCTFile(lines);
		} catch (ex) {
				if (DEBUG.forwardExceptions)
					throw ex;
				if (check_empty_line) {
					try {
						// check whether there's an extra empty line on top
						// this often happens when molfile text is pasted into the dialog window
						return chem.Molfile.parseCTFile(lines.slice(1));
					} catch (ex1) {
							if (DEBUG.forwardExceptions)
								throw ex1;
						}
					try {
						// check for a missing first line
						// this sometimes happens when pasting
						return chem.Molfile.parseCTFile([''].concat(lines));
					} catch (ex2) {
							if (DEBUG.forwardExceptions)
								throw ex2;
						}
				}
				throw ex;
			}
	} catch (er) {
			if (DEBUG.forwardExceptions)
				throw er;
			alert('Error loading molfile.\n' + er.toString());
			return null;
		}
};

function onClick_Cut ()
{
	if (!copy())
		return;
	removeSelected();
};

function onClick_Copy ()
{
	if (!copy())
		return;
	ui.editor.deselectAll();
};

function onClick_Paste ()
{
	return new rnd.Editor.PasteTool(ui.editor);
};

var actionMap = {
	'new': onClick_NewFile,
	'open': onClick_OpenFile,
	'save': onClick_SaveFile,
	'undo': undo,
	'redo': redo,
	'cut': onClick_Cut,
	'copy': onClick_Copy,
	'paste': onClick_Paste,
	'zoom-in': onClick_ZoomIn,
	'zoom-out': onClick_ZoomOut,
	'cleanup': onClick_CleanUp,
	'arom': onClick_Aromatize,
	'dearom': onClick_Dearomatize,
	'period-table': onClick_ElemTableButton,
	'generic-groups': onClick_ReaGenericsTableButton,
	'template-custom': onClick_TemplateCustom,
	'info': function (el) {
		ui.showDialog('about_dialog');
	},
	'reaction-automap': onClick_Automap
};

// TODO: rewrite declaratively, merge to actionMap
function mapTool (id) {

	console.assert(id, 'The null tool');

	// special cases
	if (ui.editor.hasSelection()) {
		if (id == 'erase') {
			removeSelected();
			return null;
		}
		// BK: TODO: add this ability to mass-change atom labels to the keyboard handler
		if (atomLabel(id)) {
			ui.addUndoAction(Action.fromAtomsAttrs(ui.editor.getSelection().atoms, atomLabel(id)), true);
			ui.render.update();
			return null;
		}

		if (id.startsWith('transform-flip')) {
			ui.addUndoAction(Action.fromFlip(ui.editor.getSelection(),
				id.endsWith('h') ? 'horizontal' :
					'vertical'),
				true);
			ui.render.update();
			return null;
		}

		/* BK: TODO: add this ability to change the bond under cursor to the editor tool
         else if (mode.startsWith('bond_')) {
         var cBond = ui.render.findClosestBond(ui.page2obj(ui.cursorPos));
         if (cBond) {
         ui.addUndoAction(Action.fromBondAttrs(cBond.id, { type: bondType(mode).type, stereo: chem.Struct.BOND.STEREO.NONE }), true);
         ui.render.update();
         return;
         }
         } */
	}

	if (id != 'transform-rotate')
		ui.editor.deselectAll();

	if (id == 'select-lasso') {
		return new rnd.Editor.LassoTool(ui.editor, 0);
	} else if (id == 'select-rectangle') {
		return new rnd.Editor.LassoTool(ui.editor, 1);
	} else if (id == 'select-fragment') {
		return new rnd.Editor.LassoTool(ui.editor, 1, true);
	} else if (id == 'erase') {
		return new rnd.Editor.EraserTool(ui.editor, 1); // TODO last selector mode is better
	} else if (atomLabel(id)) {
		return new rnd.Editor.AtomTool(ui.editor, atomLabel(id));
	} else if (id.startsWith('bond-')) {
		return new rnd.Editor.BondTool(ui.editor, bondType(id));
	} else if (id == 'chain') {
		return new rnd.Editor.ChainTool(ui.editor);
	} else if (id.startsWith('template-custom')) {
		return new rnd.Editor.TemplateTool(ui.editor, current_template_custom);
	} else if (id.startsWith('template')) {
		return new rnd.Editor.TemplateTool(ui.editor, rnd.templates[parseInt(id.split('-')[1])]);
	} else if (id == 'charge-plus') {
		return new rnd.Editor.ChargeTool(ui.editor, 1);
	} else if (id == 'charge-minus') {
		return new rnd.Editor.ChargeTool(ui.editor, -1);
	} else if (id == 'sgroup') {
		return new rnd.Editor.SGroupTool(ui.editor);
	} else if (id == 'reaction-arrow') {
		return new rnd.Editor.ReactionArrowTool(ui.editor);
	} else if (id == 'reaction-plus') {
		return new rnd.Editor.ReactionPlusTool(ui.editor);
	} else if (id == 'reaction-map') {
		return new rnd.Editor.ReactionMapTool(ui.editor);
	} else if (id == 'reaction-unmap') {
		return new rnd.Editor.ReactionUnmapTool(ui.editor);
	} else if (id == 'rgroup-label') {
		return new rnd.Editor.RGroupAtomTool(ui.editor);
	} else if (id == 'rgroup-fragment') {
		return new rnd.Editor.RGroupFragmentTool(ui.editor);
	} else if (id == 'rgroup-attpoints') {
		return new rnd.Editor.APointTool(ui.editor);
	} else if (id.startsWith('transform-rotate')) {
		return new rnd.Editor.RotateTool(ui.editor);
	}
	return null;
};

// TODO: remove. only dialog/crap
ui.bondTypeMap = {
	'single': {type: 1, stereo: chem.Struct.BOND.STEREO.NONE},
	'up': {type: 1, stereo: chem.Struct.BOND.STEREO.UP},
	'down': {type: 1, stereo: chem.Struct.BOND.STEREO.DOWN},
	'updown': {type: 1, stereo: chem.Struct.BOND.STEREO.EITHER},
	'double': {type: 2, stereo: chem.Struct.BOND.STEREO.NONE},
	'crossed': {type: 2, stereo: chem.Struct.BOND.STEREO.CIS_TRANS},
	'triple': {type: 3, stereo: chem.Struct.BOND.STEREO.NONE},
	'aromatic': {type: 4, stereo: chem.Struct.BOND.STEREO.NONE},
	'singledouble': {type: 5, stereo: chem.Struct.BOND.STEREO.NONE},
	'singlearomatic': {type: 6, stereo: chem.Struct.BOND.STEREO.NONE},
	'doublearomatic': {type: 7, stereo: chem.Struct.BOND.STEREO.NONE},
	'any':  {type: 8, stereo: chem.Struct.BOND.STEREO.NONE}
};

function bondType (mode)
{
	var type_str = mode.substr(5);
	return ui.bondTypeMap[type_str];
};

// temporary hack as mode passed to mapTool is
// actually li element
function atomLabel (mode) {
	var label;
	if (!mode.up || !mode.up('#atom')) {
		label = mode.substr(5);

		if (label == 'table') {
			return current_elemtable_props;
		}
		if (label == 'reagenerics')
			return current_reagenerics;
		// how can we go here?
		// if (label == 'any')
		// 	return {'label':'A'};
		return null;
	}

	label = subEl(mode).innerHTML;
	return {'label': label.capitalize()};
};
