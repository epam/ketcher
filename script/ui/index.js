/*global require, module, alert, global, $$*/

/*eslint-disable*/

var ui = global.ui = {};

require('../chem');
require('../rnd');

var chem = global.chem;
var rnd = global.rnd;

var keymage = require('keymage');

var Set = require('../util/set');
var Vec2 = require('../util/vec2');
var util = require('../util');
var server = require('./server.js');
var Action = require('./action.js');

var templates = require('./templates');
var element = require('../chem/element');

var openDialog = require('./dialog/open.js');
var saveDialog = require('./dialog/save.js');
var selectDialog = require('./dialog/select');
var templatesDialog = require('./dialog/templates');
var sgroupDialog = require('./dialog/sgroup');
var obsolete = require('./dialog/obsolete');

var DEBUG = { forwardExceptions: false };
var SCALE = 40;  // const
var HISTORY_LENGTH = 32;

var undoStack = [];
var redoStack = [];

var initialized = false;
var ketcherWindow;
var toolbar;
var zoomSelect;
var lastSelected;
var clientArea = null;
var dropdownOpened;
var zspObj;

//
// Init section
//
function init (parameters, opts) {
	ketcherWindow = $$('[role=application]')[0] || $$('body')[0];
	toolbar = ketcherWindow.select('[role=toolbar]')[0];
	clientArea = $('ketcher');

	ui.api_path = parameters.api_path || ui.api_path;
	ui.static_path = parameters.static_path || ui.static_path;

	if (initialized)
	{
		Action.fromNewCanvas(new chem.Struct());
		ui.render.update();
		undoStack.clear();
		redoStack.clear();
		updateHistoryButtons();
		selectAction(null);
		return;
	}

	if (['http:', 'https:'].indexOf(window.location.protocol) >= 0) { // don't try to knock if the file is opened locally ("file:" protocol)
		// TODO: check if this is nesessary
		server.knocknock().then(function (res) {
			ui.standalone = false;
		}, function (val) {
			document.title += ' (standalone)';
			// probably must be disabled by default
			$$('#cleanup', '#arom', '#dearom', '#calc-cip',
				'#reaction-automap', '#template-custom').each(function (el) {
				subEl(el).disabled = true;
			});
		}).then(function () {
			// TODO: move it out there as server incapsulates
			// standalone
			if (parameters.mol) {
				loadMolecule(parameters.mol);
			}
		});
	}

	obsolete.initDialogs();

	// Button events
	var keyMap = {};
	toolbar.select('button').each(function (el) {
		// window.status onhover?
		var caption =  el.textContent || el.innerText;
		var kd = el.dataset ? el.dataset.keys : el.getAttribute('data-keys');
		if (!kd)
			el.title = shortcutStr(el.title || caption);
		else {
			var keys = kd.split(',').map(function (s) { return s.strip(); });
			var mk = shortcutStr(keys[0]);
			var action = el.parentNode.id;
			el.title = (el.title || caption) + ' (' + mk + ')';
			el.innerHTML += ' <kbd>' + mk + '</kbd>';

			keys.forEach(function (kb) {
				var nk = kb.toLowerCase();
				if (Array.isArray(keyMap[nk]))
				    keyMap[nk].push(action);
				else
					keyMap[nk] = [action];
			});
		}
	});
	keyMap = util.extend(keyMap, {
		'a': ['atom-any'],
		'defmod-a': ['select-all'],
		'defmod-shift-a': ['deselect-all'],
		'ctrl-alt-r': ['force-update']
	});

	Object.keys(keyMap).forEach(function (key) {
		keymage('editor', key, keyMap[key].length == 1 ? function (event) {
			// TODO: handle disabled
			selectAction(keyMap[key][0]);
			event.preventDefault();
		} : function () {
			console.info('actions', keyMap[key]);
		});
	});
	keymage.setScope('editor');

	toolbar.select('li').each(function (el) {
		el.on('click', function (event) {
			if (event.target.tagName == 'BUTTON' &&
			    event.target.parentNode == this) {
				if (!this.hasClassName('selected')) {
					event.stop();
				}
				selectAction(this.id);
			}

			if (hideBlurredControls()) {
				event.stop();
			}
			else if (this.getStyle('overflow') == 'hidden') {
				this.addClassName('opened');
				dropdownOpened = this;
				event.stop();
			}
		});
	});

	initCliparea(ketcherWindow);

	zoomSelect = subEl('zoom-list');
	// TODO: remove this shit (used in rnd.Render guts
	// only in dialog/crap and render one time
	ui.zoom = parseFloat(zoomSelect.options[zoomSelect.selectedIndex].innerHTML) / 100;

	zoomSelect.on('change', updateZoom);
	clientArea.on('scroll', onScroll_ClientArea);
	updateHistoryButtons();

	// Init renderer
	opts = new rnd.RenderOptions(opts);
	opts.atomColoring = true;
	ui.render =  new rnd.Render(clientArea, SCALE, opts);
	ui.editor = new rnd.Editor(ui.render);

	ui.render.onCanvasOffsetChanged = onOffsetChanged;

	selectAction('select-lasso');
	setScrollOffset(0, 0);

	ui.render.setMolecule(ui.ctab);
	ui.render.update();

	initialized = true;
};

function shortcutStr(key) {
	var isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
	return key.replace(/Defmod/g, isMac ? '⌘' : 'Ctrl')
		      .replace(/-(?!$)/g, '+');
}

function subEl (id) {
	return $(id).children[0];
};

function hideBlurredControls () {
	if (!dropdownOpened) {
		return false;
	}

	dropdownOpened.removeClassName('opened');
	var sel = dropdownOpened.select('.selected');
	if (sel.length == 1) {
		//var index = sel[0].previousSiblings().size();
		var menu = subEl(dropdownOpened);
		menu.style.marginTop = (-sel[0].offsetTop + menu.offsetTop) + 'px';
	}

	// FIX: Quick fix of Chrome (Webkit probably) box-shadow
	// repaint bug: http://bit.ly/1iiSMgy
	// needs investigation, performance
	clientArea.style.visibility = 'hidden';
	setTimeout(function () {
		clientArea.style.visibility = 'visible';
	}, 0);
	// ?? ui.render.update(true);
	// END
	dropdownOpened = null;
	return true;
};

function selectAction (id) {
	// TODO: lastSelected -> prevtool_id
	id = id || lastSelected;
	console.assert(id.startsWith, 'id is not a string', id);
	var el = $(id);

	// TODO: refactor !el - case when there are no such id
	if (!el || !subEl(el).disabled) {
		var action = actionMap[id],
		tool = action ? action() : mapTool(id);
		if (tool) {
			var oldel = toolbar.select('.selected')[0];
			//console.assert(!lastSelected || oldel,
			//               "No last mode selected!");

			if (el != oldel || !el) { // tool canceling needed when dialog opens
				// if el.selected not changed
				if (ui.render.current_tool) {
					ui.render.current_tool.OnCancel();
				}
				ui.render.current_tool = tool;

				if (id.startsWith('select-')) {
					lastSelected = id;
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
	subEl('undo').disabled = (undoStack.length == 0);
	subEl('redo').disabled = (redoStack.length == 0);
};

function initCliparea(parent) {
	var cliparea = new Element('input', { type: 'text', 'class': 'cliparea', autofocus: true});
	var autofocus = function() {
		if (keymage.getScope() == 'editor') {
			cliparea.value = ' ';
			cliparea.focus();
			cliparea.select();
			return true;
		}
		return false;
	};

	parent.insert(cliparea);
	parent.on('mouseup', autofocus);
	parent.on('focus', autofocus);
	// ? should be document
	parent.on('copy', function (event) {
		if (autofocus()) {
			console.info('copy');
			var cb = structToClipboard(ui.ctab, ui.editor.getSelection(true));
			if (!cb.getAnchorPosition())
				return;
			ui.editor.deselectAll();
			event.preventDefault();
		}
	});
	parent.on('cut', function (event) {
		if (autofocus()) {
			console.info('cut');
			var cb = structToClipboard(ui.ctab, ui.editor.getSelection(true));
			if (!cb.getAnchorPosition())
				return;
			removeSelected();
			event.preventDefault();
		}
	});
	parent.on('paste', function (event) {
		if (autofocus()) {
			console.info('paste');
			var cb = event.clipboardData;
			console.info(cb.types,
			             cb.getData('text/plain'),
			             cb.getData('chemical/x-mdl-molfile'));
			event.preventDefault();
			return new rnd.Editor.PasteTool(ui.editor);
		}
	});
}

function updateClipboardButtons () {
	subEl('copy').disabled = subEl('cut').disabled = !ui.editor.hasSelection(true);
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
	ketcherWindow.addClassName('animate');
	var transitionEnd = transitionEndEvent(),
	animateStop = function (cb) {
		setTimeout(function () {
				cb && cb();
			ketcherWindow.removeClassName('animate');
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

function showDialog (name) {
	var dialog = $(name);
	keymage.setScope('dialog');
	animateToggle(function () {
		$$('.overlay')[0].show();
		// dialog.show();
		dialog.style.display = '';
	});
	return dialog;
};

function hideDialog (name) {
	var cover = $$('.overlay')[0];
	animateToggle(cover, function () {
		// $(name).hide();
		$(name).style.display = 'none';
		cover.hide();
		keymage.setScope('editor');
	});
};

function showElemTable (params) {
	params.required = true;
	selectDialog('elem-table', params);
};

function showRGroupTable (params) {
	selectDialog('rgroup-table', params);
};

function showReaGenericsTable (params) {
	params.required = true;
	selectDialog('generics-table', params);
};

function echo (message) {
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

	addUndoAction(Action.fromNewCanvas(mol));

	showDialog('loading');
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
		hideDialog('loading');
	}
//    }, 50);
};


function addUndoAction (action, check_dummy)
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
	}
};

//
// New document
//
function onClick_NewFile ()
{
	selectAction(null);

	if (!ui.ctab.isBlank()) {
		addUndoAction(Action.fromNewCanvas(new chem.Struct()));
		ui.render.update();
	}
}

function onClick_OpenFile ()
{
	openDialog({
		onOk: function (res) {
			loadMolecule(res.value, false, true, res.fragment);
		}
	});
}

function onClick_SaveFile ()
{
	saveDialog({molecule: ui.ctab});
}

function aromatize(mol, arom)
{
	mol = mol.clone();
	var implicitReaction = mol.addRxnArrowIfNecessary();
	var mol_string = new chem.MolfileSaver().saveMolecule(mol);

	if (!ui.standalone) {
		var method = arom ? 'aromatize' : 'dearomatize',
		request = server[method]({moldata: mol_string});
		request.then(function (data) {
			var resmol = parseMayBeCorruptedCTFile(data);
			if (implicitReaction)
				resmol.rxnArrows.clear();
			updateMolecule(resmol);
		}, echo);
	} else {
		throw new Error('Aromatization and dearomatization are not supported in the standalone mode.');
	}
};

// TODO: merge with arom/dearom + spinner
function calculateCip() {
	util.assert(!ui.standalone, 'Can\'t calculate in standalone mode!'); // it's assert error now
	var mol = ui.ctab.clone();
	var implicitReaction = mol.addRxnArrowIfNecessary();
	var mol_string = new chem.MolfileSaver().saveMolecule(mol);

	var request = server.calculateCip({moldata: mol_string});
	request.then(function (data) {
		var resmol = parseMayBeCorruptedCTFile(data);
		if (implicitReaction)
			resmol.rxnArrows.clear();
		updateMolecule(resmol);
	}, echo);
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

	subEl('zoom-in').disabled = (i == len - 1);
	subEl('zoom-out').disabled = (i == 0);

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
function setZoomStaticPointInit (s) {
	zspObj = new Vec2(s);
};

// vp is the point where the reference point should now be (in view coordinates)
function setZoomStaticPoint (zoom, vp) {
	setZoomRegular(zoom);
	setScrollOffset(0, 0);
	var avp = ui.render.obj2view(zspObj);
	var so = avp.sub(vp);
	setScrollOffset(so.x, so.y);
};

function setScrollOffset (x, y) {
	var cx = clientArea.clientWidth;
	var cy = clientArea.clientHeight;
	ui.render.extendCanvas(x, y, cx + x, cy + y);
	clientArea.scrollLeft = x;
	clientArea.scrollTop = y;
	scrollLeft = clientArea.scrollLeft; // TODO: store drag position in scaled systems
	scrollTop = clientArea.scrollTop;
};

function setScrollOffsetRel (dx, dy) {
	setScrollOffset(clientArea.scrollLeft + dx, clientArea.scrollTop + dy);
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
		loadMolecule(new chem.MolfileSaver().saveMolecule(mol), true, false, false, implicitReaction, selective);
	} catch (er) {
			if (DEBUG.forwardExceptions)
				throw er;
			alert('ERROR: ' + er.message); // TODO [RB] ??? global re-factoring needed on error-reporting
		}
};

function onClick_Aromatize ()
{
	try {
		aromatize(ui.ctab, true);
	} catch (er) {
			if (DEBUG.forwardExceptions)
				throw er;
			alert('Molfile: ' + er.message);
		}
};

function onClick_Dearomatize ()
{
	try {
		aromatize(ui.ctab, false);
	} catch (er) {
			if (DEBUG.forwardExceptions)
				throw er;
			alert('Molfile: ' + er.message);
		}
};

function onClick_Automap () {
	obsolete.showAutomapProperties({
		onOk: function (mode) {
			var mol = ui.ctab;
			var implicitReaction = mol.addRxnArrowIfNecessary();
			if (mol.rxnArrows.count() == 0) {
				echo('Auto-Mapping can only be applied to reactions');
				return;
			}
			var moldata = new chem.MolfileSaver().saveMolecule(mol, true),
			request = server.automap({
				moldata: moldata,
				mode: mode
			});

			request.then(function (res) {
				var mol = parseMayBeCorruptedCTFile(res);
				if (implicitReaction) {
					mol.rxnArrows.clear();
				}
				/*
                 var aam = parseCTFile(res.responseText);
                 var action = new Action();
                 for (var aid = aam.atoms.count() - 1; aid >= 0; aid--) {
                 action.mergeWith(Action.fromAtomAttrs(aid, { aam : aam.atoms.get(aid).aam }));
                 }
                 addUndoAction(action, true);
                 */
				updateMolecule(mol);
				/*
                 ui.render.update();
                 */

			}, echo);
		}
	});
};

// TODO: refactor me
function loadMolecule (mol_string, force_layout, check_empty_line, paste, discardRxnArrow, selective_layout)
{
	var updateFunc = function (struct) {
		if (discardRxnArrow)
			struct.rxnArrows.clear();
		if (paste) {
			(function (struct) {
				struct.rescale();
				var cb = structToClipboard(struct);
				if (!cb.getAnchorPosition()) {
					alert('Not a valid structure to paste');
					return;
				}
				ui.editor.deselectAll();
				//selectAction('paste');
			}).call(this, struct);
		} else {
			updateMolecule.call(this, struct);
		}
	};

	if (mol_string.indexOf('<cml ') != -1 ) {
		if (ui.standalone) {
			echo('CML is not supported in a standalone mode.');
			return;
		}
		var request = server.molfile({moldata: mol_string});
		request.then(function (res) {
			updateFunc.call(ui, parseMayBeCorruptedCTFile(res));
		});
	} else if (mol_string.strip().indexOf('\n') == -1) {
		var smiles = mol_string.strip();
		if (ui.standalone) {
			if (smiles != '') {
				echo('SMILES is not supported in a standalone mode.');
			}
			return;
		}
		request = server.layout_smiles(null, {smiles: smiles});
		request.then(function (res) {
			updateFunc.call(ui, parseMayBeCorruptedCTFile(res));
		});
	} else if (!ui.standalone && force_layout) {
		var req = server.layout({moldata: mol_string},
			selective_layout ? {'selective': 1} : null);
		req.then(function (res) {
			updateFunc.call(ui, parseMayBeCorruptedCTFile(res));
		});
	} else {
		updateFunc.call(ui, parseMayBeCorruptedCTFile(mol_string, check_empty_line));
	}
};

function page2canvas2 (pos)
{
	var offset = clientArea.cumulativeOffset();
	return new Vec2(pos.pageX - offset.left, pos.pageY - offset.top);
};

function page2obj (pagePos)
{
	return ui.render.view2obj(page2canvas2(pagePos));
};

function scrollPos ()
{
	return new Vec2(clientArea.scrollLeft, clientArea.scrollTop);
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

	scrollLeft = clientArea.scrollLeft;
	scrollTop = clientArea.scrollTop;

	util.stopEventPropagation(event);
};

//
// Clicking
//

// Get new atom id/label and pos for bond being added to existing atom
function atomForNewBond (id)
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

	clientArea.scrollLeft += delta.x;
	clientArea.scrollTop += delta.y;
};

function removeSelected ()
{
	addUndoAction(Action.fromFragmentDeletion());
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
};

function redo ()
{
	if (ui.render.current_tool)
		ui.render.current_tool.OnCancel();

	ui.editor.deselectAll();
	undoStack.push(redoStack.pop().perform());
	ui.render.update();
	updateHistoryButtons();
};

// RB: let it be here for the moment
// TODO: "clipboard" support to be moved to editor module
// move to struct
function getAnchorPosition() {
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

function structToClipboard (struct, selection) {
	// these will be copied automatically along with the
	//  corresponding s-groups
	if (selection && selection.sgroupData) {
		selection.sgroupData.clear();
	}

	var clipboard = Object.create({
		getAnchorPosition: getAnchorPosition
	});
	clipboard = util.extend(clipboard, {
		atoms: [],
		bonds: [],
		sgroups: [],
		rxnArrows: [],
		rxnPluses: [],
		chiralFlags: [],
		rgmap: {},
		rgroups: {}
	});

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

	return clipboard;
};

var current_elemtable_props = null;
function onClick_ElemTableButton ()
{
	showElemTable({
		onOk: function (res) {
			var props;
			if (res.mode == 'single')
				props = {
					label: element.get(res.values[0]).label
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
			selectAction('atom-table');
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
	showReaGenericsTable({
		onOk: function (res) {
			current_reagenerics = {label: res.values[0]};
			selectAction('atom-reagenerics');
			return true;
		}
	});
};

// TODO: remove this crap (quick hack to pass parametr to selectAction)
var current_template_custom = null;
function onClick_TemplateCustom () {
	templatesDialog(ui.static_path,{
		onOk: function (tmpl) {
			current_template_custom = tmpl;
			selectAction('template-custom-select');
			return true;
		}
	});
};

// try to reconstruct molfile string instead parsing multiple times
// TODO: move this logic to chem.Molfile
function parseMayBeCorruptedCTFile (molfile, check_empty_line) {
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

var actionMap = {
	'new': onClick_NewFile,
	'open': onClick_OpenFile,
	'save': onClick_SaveFile,
	'undo': undo,
	'redo': redo,
	'zoom-in': onClick_ZoomIn,
	'zoom-out': onClick_ZoomOut,
	'cleanup': onClick_CleanUp,
	'arom': onClick_Aromatize,
	'dearom': onClick_Dearomatize,
	'period-table': onClick_ElemTableButton,
	'generic-groups': onClick_ReaGenericsTableButton,
	'template-custom': onClick_TemplateCustom,
	'cut': function () {
		document.execCommand('cut');
	},
	'copy': function () {
		document.execCommand('copy');
	},
	'paste': function () {
		document.execCommand('paste');
	},
	'info': function (el) {
		showDialog('about_dialog');
	},
	'select-all': function () {
		ui.editor.selectAll();
	},
	'deselect-all': function () {
		ui.editor.deselectAll();
	},
	'force-update': function () {
		// original: for dev purposes
		ui.render.update(true);
	},
	'reaction-automap': onClick_Automap,
	'calc-cip': calculateCip
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
		if (id.startsWith('atom-')) {
			addUndoAction(Action.fromAtomsAttrs(ui.editor.getSelection().atoms, atomLabel(id)), true);
			ui.render.update();
			return null;
		}

		if (id.startsWith('transform-flip')) {
			addUndoAction(Action.fromFlip(ui.editor.getSelection(),
				id.endsWith('h') ? 'horizontal' :
					'vertical'),
				true);
			ui.render.update();
			return null;
		}

		/* BK: TODO: add this ability to change the bond under cursor to the editor tool
         else if (mode.startsWith('bond_')) {
         var cBond = ui.render.findClosestBond(page2obj(ui.cursorPos));
         if (cBond) {
         addUndoAction(Action.fromBondAttrs(cBond.id, { type: bondType(mode).type, stereo: chem.Struct.BOND.STEREO.NONE }), true);
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
	} else if (id.startsWith('atom-')) {
		return new rnd.Editor.AtomTool(ui.editor, atomLabel(id));
	} else if (id.startsWith('bond-')) {
		return new rnd.Editor.BondTool(ui.editor, bondType(id));
	} else if (id == 'chain') {
		return new rnd.Editor.ChainTool(ui.editor);
	} else if (id.startsWith('template-custom')) {
		return new rnd.Editor.TemplateTool(ui.editor, current_template_custom);
	} else if (id.startsWith('template')) {
		return new rnd.Editor.TemplateTool(ui.editor, templates[parseInt(id.split('-')[1])]);
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

// TODO: remove. only in obsolete dialogs
var bondTypeMap = {
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
	return bondTypeMap[type_str];
};

function atomLabel (mode) {
	var label = mode.substr(5);
	switch (label) {
	case 'table':
		return current_elemtable_props;
	case 'reagenerics':
		return current_reagenerics;
	case 'any':
		return {label:'A'};
	default:
		label = label.capitalize();
		console.assert(element.getElementByLabel(label),
		              "No such atom exist");
		return {label: label};
	}
};

// The expose guts two way
module.exports = {
	init: init,
	loadMolecule: loadMolecule
};

util.extend(ui, module.exports);

util.extend(ui, {
	api_path: '',
	static_path: '',
	standalone: true,
	ctab: new chem.Struct(),
	render: null,
	editor: null,

	clipboard: null,
	hideBlurredControls: hideBlurredControls,
	updateClipboardButtons: updateClipboardButtons,
	atomForNewBond: atomForNewBond,
	selectAction: selectAction,
	addUndoAction: addUndoAction,

	// TODO: remove me as we get better server API
	loadMoleculeFromFile: openDialog.loadHook,

	echo: echo,
	showDialog: showDialog,
	hideDialog: hideDialog,
	bondTypeMap: bondTypeMap,

	// TODO: move schrool/zoom machinery to render
	zoom: 1.0,
	setZoomStaticPointInit: setZoomStaticPointInit,
	setZoomStaticPoint: setZoomStaticPoint,
	page2canvas2: page2canvas2,
	scrollPos: scrollPos,
	page2obj: page2obj,

	// TODO: search a way to pass dialogs to editor
	showSGroupProperties: sgroupDialog,
	showRGroupTable: showRGroupTable,
	showElemTable: showElemTable,
	showReaGenericsTable: showReaGenericsTable,
	showAtomAttachmentPoints: obsolete.showAtomAttachmentPoints,
	showAtomProperties: obsolete.showAtomProperties,
	showBondProperties: obsolete.showBondProperties,
	showRLogicTable: obsolete.showRLogicTable,
	showLabelEditor: obsolete.showLabelEditor
});
