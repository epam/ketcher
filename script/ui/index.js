/*global require, module, alert, global, $$*/

/*eslint-disable*/

var ui = global.ui = {};

require('../chem');
require('../rnd');

var chem = global.chem;
var rnd = global.rnd;

var Promise = require('promise-polyfill');
var keymage = require('keymage');

var Set = require('../util/set');
var Vec2 = require('../util/vec2');
var util = require('../util');
var Action = require('./action.js');

var templates = require('./templates');
var element = require('../chem/element');

var openDialog = require('./dialog/open.js');
var saveDialog = require('./dialog/save.js');
var selectDialog = require('./dialog/select');
var templatesDialog = require('./dialog/templates');
var sgroupDialog = require('./dialog/sgroup');
var sgroupSpecialDialog = require('./dialog/sgroup-special');
var obsolete = require('./dialog/obsolete');

var SCALE = 40;  // const
var HISTORY_LENGTH = 32;

var undoStack = [];
var redoStack = [];

var ketcherWindow;
var toolbar;
var lastSelected;
var clientArea = null;
var dropdownOpened;
var zspObj;
var server;

var serverActions = ['cleanup', 'arom', 'dearom', 'calc-cip',
                     'reaction-automap', 'template-custom'];
var clipActions = ['cut', 'copy', 'paste'];

function init (options, apiServer) {
	ketcherWindow = $$('[role=application]')[0] || $$('body')[0];
	toolbar = ketcherWindow.select('[role=toolbar]')[0];
	clientArea = $('canvas');
	server = apiServer;

	updateServerButtons();
	if (server) { // && ['http:', 'https:'].indexOf(window.location.protocol) >= 0) {
		// don't try to knock if the file is opened locally ("file:" protocol)
		// TODO: check when this is nesessary
		server.knocknock().then(function (res) {
			ui.standalone = false;
			updateServerButtons();
		}, function (val) {
			document.title += ' (standalone)';
			// TODO: echo instead
		}).then(function () {
			// TODO: move it out there as server incapsulates
			// standalone
			if (options.mol) {
				loadMolecule(options.mol);
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
			el.title = el.title || caption;
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
			var action = keyMap[key][0];
			if (clipActions.indexOf(action) == -1) {
				// else delegate to cliparea
				selectAction(keyMap[key][0]);
				event.preventDefault();
			}
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
	initZoom();
	updateHistoryButtons();

	clientArea.on('scroll', onScroll_ClientArea);
	clientArea.on('mousedown', function () {
		keymage.setScope('editor');
	});

	// Init renderer
	var opts = new rnd.RenderOptions(options);
	opts.atomColoring = true;
	ui.render =  new rnd.Render(clientArea, SCALE, opts);
	ui.editor = new rnd.Editor(ui.render);

	ui.render.onCanvasOffsetChanged = onOffsetChanged;

	selectAction('select-lasso');
	setScrollOffset(0, 0);

	ui.render.setMolecule(ui.ctab);
	ui.render.update();
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

function selectAction (action) {
	// TODO: lastSelected -> prevtool_id
	action = action || lastSelected;
	var el = $(action);
	var args = [].slice.call(arguments, 1);
	console.assert(action.startsWith, 'id is not a string', action);

	if (clipActions.indexOf(action) != -1 && args.length == 0)
		return delegateCliparea(action);

	// TODO: refactor !el - case when there are no such id
	if (!el || !subEl(el).disabled) {
		args.unshift(action);
		var tool = mapTool.apply(null, args);
		if (tool instanceof rnd.Editor.EditorTool) {
			var oldel = toolbar.select('.selected')[0];
			//console.assert(!lastSelected || oldel,
			//               "No last mode selected!");

			if (el != oldel || !el) { // tool canceling needed when dialog opens
				// if el.selected not changed
				if (ui.render.current_tool) {
					ui.render.current_tool.OnCancel();
				}
				ui.render.current_tool = tool;

				if (action.startsWith('select-')) {
					lastSelected = action;
				}
				if (el) {
					el.addClassName('selected');
				}
				if (oldel) {
					oldel.removeClassName('selected');
				}
			}
		}
		return tool;
	}
	return null;
};

function delegateCliparea(action) {
	var enabled = document.queryCommandSupported(action);
	if (enabled) try {
		document.execCommand(action);
	} catch (ex) {
		// FF < 41
		enabled = false;
	}
	if (!enabled) {
		var el = subEl(action);
		var key = el.dataset ? el.dataset.keys : el.getAttribute('data-keys');
		echo('These action is unavailble via menu.\n' +
		     'Instead, use ' + shortcutStr(key) + ' to ' + action + '.');
	}
	return null;
}

function initCliparea(parent) {
	var cliparea = new Element('input', { type: 'text', 'class': 'cliparea', autofocus: true});
	var ieCb = window.clipboardData;
	var pasteFormats = [
		'chemical/x-mdl-molfile',
		'chemical/x-mdl-rxnfile',
		'chemical/x-cml',
		'text/plain',
		'chemical/x-daylight-smiles',
		'chemical/x-inchi'
	];
	var autofocus = function() {
		if (keymage.getScope() == 'editor') {
			cliparea.value = ' ';
			cliparea.focus();
			cliparea.select();
			return true;
		}
		return false;
	};
	var copyCut = function (struct, cb) {
		var moldata = new chem.MolfileSaver().saveMolecule(struct);
		if (!cb && ieCb) {
			ieCb.setData('text', moldata);
		} else {
			cb.setData('text/plain', moldata);
			try {
				cb.setData(!struct.isReaction ?
				           'chemical/x-mdl-molfile': 'chemical/x-mdl-rxnfile',
				           moldata);
				cb.setData('chemical/x-daylight-smiles',
				           new chem.SmilesSaver().saveMolecule(struct));
			} catch (ex) {
				console.info('Could not write exact type', ex);
			}
		}
	};
	var paste = function (cb) {
		var data = '';
		if (!cb && ieCb) {
			data = ieCb.getData('text');
		} else {
			for (var i = 0; i < pasteFormats.length; i++) {
				data = cb.getData(pasteFormats[i]);
				if (data)
					break;
			}
		}
		console.info('paste', i >= 0 && pasteFormats[i], data.slice(0, 50), '..');
		return data;
	};

	parent.insert(cliparea);
	parent.on('mouseup', autofocus);

	// ? events should be attached to document
	['copy', 'cut'].forEach(function (action) {
		parent.on(action, function (event) {
			if (autofocus()) {
				var struct = selectAction(action, true);
				if (struct)
					copyCut(struct, event.clipboardData);
				event.preventDefault();
			}
		});
	});
	parent.on('paste', function (event) {
		if (autofocus()) {
			var data = paste(event.clipboardData);
			if (data)
				loadFragment(data);
			event.preventDefault();
		}
	});
}

function updateClipboardButtons () {
	subEl('copy').disabled = subEl('cut').disabled = !ui.editor.hasSelection(true);
};

function updateHistoryButtons () {
	subEl('undo').disabled = (undoStack.length == 0);
	subEl('redo').disabled = (redoStack.length == 0);
};

function updateServerButtons () {
	serverActions.forEach(function (action) {
		subEl(action).disabled = ui.standalone;
	});
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
	try {
		ui.render.onResize(); // TODO: this methods should be called in the resize-event handler
		ui.render.update();
		setZoomCentered(null, ui.render.getStructCenter());
	}
	catch (er) {
		alert(er.message);
	}
	finally {
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
			if (res.fragment)
				loadFragment(res.value, true);
			else
				loadMolecule(res.value, true);
		}
	});
}

function onClick_SaveFile ()
{
	saveDialog({molecule: ui.ctab}, server);
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
function initZoom() {
	var zoomSelect = subEl('zoom-list');
	zoomSelect.on('focus', function () {
		keymage.pushScope('zoom');
	});
	zoomSelect.on('blur', function () {
		keymage.popScope('zoom');
	});
	zoomSelect.on('change', updateZoom);
	updateZoom(true);
}

function onClick_ZoomIn () {
	subEl('zoom-list').selectedIndex++;
	updateZoom();
};

function onClick_ZoomOut () {
	subEl('zoom-list').selectedIndex--;
	updateZoom();
};

function updateZoom (noRefresh) {
	var zoomSelect = subEl('zoom-list');
	var i = zoomSelect.selectedIndex,
	    len = zoomSelect.length;
	console.assert(0 <= i && i < len, 'Zoom out of range');

	subEl('zoom-in').disabled = (i == len - 1);
	subEl('zoom-out').disabled = (i == 0);

	var value = parseFloat(zoomSelect.options[i].innerHTML) / 100;
	// TODO: remove this shit (used in rnd.Render guts
	// only in dialog/crap and render one time
	ui.zoom = value;
	if (!noRefresh) {
		setZoomCentered(value,
		                ui.render.getStructCenter(ui.editor.getSelection()));
		ui.render.update();
	}
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
			if (util.findIndex(loop.hbs, function (hbid) {
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
		var req = server.layout({
			moldata: new chem.MolfileSaver().saveMolecule(mol)
		}, selective ? {'selective': 1} : null);
		req.then(function (res) {
			var struct = parseMayBeCorruptedCTFile(res);
			if (implicitReaction)
				struct.rxnArrows.clear();
			updateMolecule(struct);
		});
	} catch (er) {
			alert('ERROR: ' + er.message); // TODO [RB] ??? global re-factoring needed on error-reporting
		}
};

function onClick_Aromatize ()
{
	try {
		aromatize(ui.ctab, true);
	} catch (er) {
		alert('Molfile: ' + er.message);
	}
};

function onClick_Dearomatize ()
{
	try {
		aromatize(ui.ctab, false);
	} catch (er) {
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

function loadMolecule (mol, checkEmptyLine) {
	return getStruct(mol,
	                 checkEmptyLine).then(updateMolecule);
}

function loadFragment (mol, checkEmptyLine) {
	return getStruct(mol, checkEmptyLine).then(function (struct) {
		struct.rescale();
		selectAction('paste', struct);
	});
}

function guessType(mol, strict) {
	// Mimic Indigo/molecule_auto_loader.cpp as much as possible
	var molStr = mol.trim();
	var molMatch = molStr.match(/^(M  END|\$END MOL)$/m);
	if (molMatch) {
		var end = molMatch.index + molMatch[0].length;
		if (end == molStr.length ||
		    molStr.slice(end, end + 20).search(/^\$(MOL|END CTAB)$/m) != -1)
			return 'mol';
	}
	if (molStr[0] == '<' && molStr.indexOf('<molecule') != -1)
		return 'cml';
	if (molStr.slice(0, 5) == 'InChI')
		return 'inchi';
	if (molStr.indexOf('\n') == -1)
		return 'smiles';
	// Molfile by default as Indigo does
	return strict ? null : 'mol';
}

function getStruct(mol, checkEmptyLine) {
	return new Promise(function (resolve, reject) {
		var type = guessType(mol);
		if (type == 'mol') {
			var struct = parseMayBeCorruptedCTFile(mol,
			                                       checkEmptyLine);
			resolve(struct);
		} else if (ui.standalone)
			throw type ? type.toUpperCase() : 'Format' +
			      ' is not supported in a standalone mode.';
		else {
			var req = (type == 'smiles') ?
			    server.layout_smiles(null, {smiles: mol.trim()}) :
			    server.molfile({moldata: mol});
			resolve(req.then(function (res) {
				return parseMayBeCorruptedCTFile(res);
			}));
		}
	});
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
	templatesDialog('', {
		onOk: function (tmpl) {
			current_template_custom = tmpl;
			selectAction('template-custom-select');
			return true;
		}
	});
};

function showSgroupDialog(params) {
	if (__SGROUP_SPECIAL__ && sgroupSpecialDialog.match(params))
		return sgroupSpecialDialog(params);
	return sgroupDialog(params);
};

// try to reconstruct molfile string instead parsing multiple times
// TODO: move this logic to chem.Molfile
function parseMayBeCorruptedCTFile (molfile, checkEmptyLine) {
	var lines = util.splitNewlines(molfile);
	try {
		return chem.Molfile.parseCTFile(lines);
	} catch (ex) {
		if (checkEmptyLine) {
			try {
				// check whether there's an extra empty line on top
				// this often happens when molfile text is pasted into the dialog window
				return chem.Molfile.parseCTFile(lines.slice(1));
			} catch (ex1) {
			}
			try {
				// check for a missing first line
				// this sometimes happens when pasting
				return chem.Molfile.parseCTFile([''].concat(lines));
			} catch (ex2) {
			}
		}
		throw ex;
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
		var struct = ui.editor.getSelectionStruct();
		removeSelected();
		return struct.isBlank() ? null : struct;
	},
	'copy': function () {
		var struct = ui.editor.getSelectionStruct();
		ui.editor.deselectAll();
		return struct.isBlank() ? null : struct;
	},
	'paste': function (struct) {
		if (struct.isBlank())
			throw 'Not a valid structure to paste';
		ui.editor.deselectAll();
		return new rnd.Editor.PasteTool(ui.editor, struct);
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

	var args = [].slice.call(arguments, 1);
	if (actionMap[id])
		return actionMap[id].apply(null, args);
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

function clean () {
	// latter if (initialized)
	Action.fromNewCanvas(new chem.Struct());
	ui.render.update();
	undoStack.clear();
	redoStack.clear();
	updateHistoryButtons();
	selectAction(null);
}

// The expose guts two way
module.exports = {
	init: init,
	clean: clean,
	loadMolecule: loadMolecule,
	loadFragment: loadFragment
};

util.extend(ui, module.exports);

util.extend(ui, {
	standalone: true,
	ctab: new chem.Struct(),
	render: null,
	editor: null,

	hideBlurredControls: hideBlurredControls,
	updateClipboardButtons: updateClipboardButtons,
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
	showSGroupProperties: showSgroupDialog,
	showRGroupTable: showRGroupTable,
	showElemTable: showElemTable,
	showReaGenericsTable: showReaGenericsTable,
	showAtomAttachmentPoints: obsolete.showAtomAttachmentPoints,
	showAtomProperties: obsolete.showAtomProperties,
	showBondProperties: obsolete.showBondProperties,
	showRLogicTable: obsolete.showRLogicTable,
	showLabelEditor: obsolete.showLabelEditor
});
