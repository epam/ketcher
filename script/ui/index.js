var ui = global.ui = {};

var Promise = require('promise-polyfill');
var keymage = require('keymage');

var util = require('../util');
var Set = require('../util/set');
var Vec2 = require('../util/vec2');

var AtomList = require('../chem/atomlist');
var SGroup = require('../chem/sgroup');
var element = require('../chem/element');
var Struct = require('../chem/struct');

var molfile = require('../chem/molfile');
var smiles = require('../chem/smiles');

var Render = require('../render');
var Editor = require('../editor');

var Action = require('../editor/action.js');
var templates = require('./templates');

var utils = require('./utils');
var modal = require('./modal');
var contextEdit = require('./contextedit.js');

var SCALE = 40;  // const
var HISTORY_LENGTH = 32;

var undoStack = [];
var redoStack = [];

var ketcherWindow;
var toolbar;
var lastSelected;
var clientArea = null;
var dropdownOpened;
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

	clientArea.on('scroll', function () {
		if ($('input_label').visible())
			$('input_label').hide();
	});
	clientArea.on('mousedown', function () {
		keymage.setScope('editor');
	});

	// Init renderer
	ui.render =  new Render(clientArea, SCALE,
	                        util.extend({ atomColoring: true }, options));
	ui.editor = new Editor(ui.render);

	selectAction('select-lasso');
	//setScrollOffset(0, 0);

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
		if (tool instanceof Editor.tool.base) {
			var oldel = toolbar.select('.selected')[0];
			//console.assert(!lastSelected || oldel,
			//               "No last mode selected!");

			if (el != oldel || !el) { // tool canceling needed when dialog opens
				// if el.selected not changed
				if (ui.editor.current_tool) {
					ui.editor.current_tool.OnCancel();
				}
				ui.editor.current_tool = tool;

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
		var moldata = molfile.stringify(struct);
		if (!cb && ieCb) {
			ieCb.setData('text', moldata);
		} else {
			cb.setData('text/plain', moldata);
			try {
				cb.setData(!struct.isReaction ?
						   'chemical/x-mdl-molfile': 'chemical/x-mdl-rxnfile',
						   moldata);
				cb.setData('chemical/x-daylight-smiles',
						   smiles.stringify(struct));
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

function showDialog (name) {
	var dialog = $(name);
	var cover = $$('.overlay')[0];
	keymage.setScope('modal');
	dialog.style.display = '';
	cover.style.display = '';

	utils.animate(cover, 'show');
	utils.animate(dialog, 'show');
	return dialog;
};

function hideDialog (name) {
	var dialog = $(name);
	var cover = $$('.overlay')[0];
	utils.animate(cover, 'hide');
	utils.animate(dialog, 'hide').then(function () {
		cover.style.display = 'none';
		dialog.style.display = 'none';
		keymage.setScope('editor');
	});
};

function echo (message) {
	// TODO: make special area for messages
	alert(message);
};

function updateMolecule (mol) {
	console.assert(mol, 'No molecule to update');
	ui.editor.deselectAll();
	addUndoAction(Action.fromNewCanvas(mol));
	ui.render.onResize(); // TODO: this methods should be called in the resize-event handler
	ui.render.update();
	ui.render.recoordinate(ui.render.getStructCenter());
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

function clear () {
	selectAction(null);

	if (!ui.ctab.isBlank()) {
		addUndoAction(Action.fromNewCanvas(new Struct()));
		ui.render.update();
	}
}

function open () {
	modal.open({
		onOk: function (res) {
			if (res.fragment)
				loadFragment(res.value, true);
			else
				loadMolecule(res.value, true);
		}
	});
}

function save () {
	modal.save({molecule: ui.ctab}, server);
}

function serverTransform(method, mol, options) {
	util.assert(!ui.standalone, 'Call server in standalone mode!');
	if (!mol)
		mol = ui.ctab.clone();
	var implicitReaction = mol.addRxnArrowIfNecessary();
	var request = server[method](util.extend({
		moldata: molfile.stringify(mol, { ignoreErrors: true })
	}, options));
	utils.loading('show');
	request.then(function (data) {
		var resmol = molfile.parse(data);
		if (implicitReaction)
			resmol.rxnArrows.clear();
		updateMolecule(resmol);
		utils.loading('hide');
	}).then(null, function (er) {
		utils.loading('hide');
		echo(er);
	});
}

function initZoom() {
	var zoomSelect = subEl('zoom-list');
	// TODO: need a way to setup zoom range
	//       e.g. if (zoom < 0.1 || zoom > 10)
	zoomSelect.on('focus', function () {
		keymage.pushScope('zoom');
	});
	zoomSelect.on('blur', function () {
		keymage.popScope('zoom');
	});
	zoomSelect.on('change', updateZoom);
	updateZoom();
}

function zoomIn () {
	subEl('zoom-list').selectedIndex++;
	updateZoom(true);
};

function zoomOut () {
	subEl('zoom-list').selectedIndex--;
	updateZoom(true);
};

function updateZoom (refresh) {
	var zoomSelect = subEl('zoom-list');
	var i = zoomSelect.selectedIndex,
		len = zoomSelect.length;
	console.assert(0 <= i && i < len, 'Zoom out of range');

	subEl('zoom-in').disabled = (i == len - 1);
	subEl('zoom-out').disabled = (i == 0);

	var value = parseFloat(zoomSelect.value) / 100;
	if (refresh) {
		ui.render.setZoom(value);
		ui.render.recoordinate(ui.render.getStructCenter(ui.editor.getSelection()));
		ui.render.update();
	}
}

function layout () {
	var atoms = util.array(ui.editor.getSelection(true).atoms);
	var selective = atoms.length > 0;

	return !selective ? serverTransform('layout') :
		serverTransform('layout',
		                SGroup.packDataGroup('_ketcher_selective_layout', '1', ui.ctab, atoms),
		                {selective: '1'});
};

function aromatize () {
	return serverTransform('aromatize');
};

function dearomatize () {
	return serverTransform('dearomatize');
};

function calculateCip() {
	return serverTransform('calculateCip');
};

function automap () {
	var mol = ui.ctab.clone();
	mol.addRxnArrowIfNecessary();    // TODO: better way to check reaction
	if (mol.rxnArrows.count() == 0)  // without cloning
		echo('Auto-Mapping can only be applied to reactions');
	else {
		modal.automap({
			onOk: function (mode) {
				return serverTransform('automap', mol, { mode: mode });
			}
		});
	}
};

function loadMolecule (mol, checkEmptyLine) {
	return getStruct(mol, checkEmptyLine).then(updateMolecule);
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
			var struct = molfile.parse(mol, {
				badHeaderRecover: checkEmptyLine
			});
			resolve(struct);
		} else if (ui.standalone)
			throw type ? type.toUpperCase() : 'Format' +
				  ' is not supported in a standalone mode.';
		else {
			var req = (type == 'smiles') ?
				server.layout_smiles(null, {smiles: mol.trim()}) :
			    server.molfile({moldata: mol});
			utils.loading('show');
			resolve(req.then(function (res) {
				utils.loading('hide');
				return molfile.parse(res);
			}, function (err) {
				utils.loading('hide');
				throw err;
			}));
		}
	});
};

function removeSelected ()
{
	addUndoAction(Action.fromFragmentDeletion());
	ui.editor.deselectAll();
	ui.render.update();
};

function undo ()
{
	if (ui.editor.current_tool)
		ui.editor.current_tool.OnCancel();

	ui.editor.deselectAll();
	redoStack.push(undoStack.pop().perform());
	ui.render.update();
	updateHistoryButtons();
};

function redo ()
{
	if (ui.editor.current_tool)
		ui.editor.current_tool.OnCancel();

	ui.editor.deselectAll();
	undoStack.push(redoStack.pop().perform());
	ui.render.update();
	updateHistoryButtons();
};

function elemTable () {
	modal.periodTable({
		onOk: function (res) {
			var props;
			if (res.mode == 'single')
				props = {
					label: element.get(res.values[0]).label
				};
			else
				props = {
					label: 'L#',
					atomList: new AtomList({
						notList: res.mode == 'not-list',
						ids: res.values
					})
				};
			selectAction('atom-table', props);
			return true;
		}
	});
};

function genericsTable () {
	modal.genericGroups({
		onOk: function (res) {
			var props = {label: res.values[0]};
			selectAction('atom-reagenerics', props);
			return true;
		}
	});
};

function templateCustom () {
	modal.templates('', {
		onOk: function (tmpl) {
			// C doesn't conflict with menu id
			selectAction('template-C', tmpl);
			return true;
		}
	});
};

var actionMap = {
	'new': clear,
	'open': open,
	'save': save,
	'undo': undo,
	'redo': redo,
	'zoom-in': zoomIn,
	'zoom-out': zoomOut,
	'cleanup': layout,
	'arom': aromatize,
	'dearom': dearomatize,
	'period-table': elemTable,
	'generic-groups': genericsTable,
	'template-custom': templateCustom,
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
		return new Editor.tool.paste(ui.editor, struct);
	},
	'info': modal.about,
	'select-all': function () {
		ui.editor.selectAll();
		selectAction(null);
	},
	'deselect-all': function () {
		ui.editor.deselectAll();
	},
	'force-update': function () {
		// original: for dev purposes
		ui.render.update(true);
	},
	'reaction-automap': automap,
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
			addUndoAction(Action.fromAtomsAttrs(ui.editor.getSelection().atoms, args[0] || atomLabel(id)), true);
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
		 var cBond = ui.render.findClosestBond(ui.render.page2obj(ui.cursorPos));
		 if (cBond) {
		 addUndoAction(Action.fromBondAttrs(cBond.id, { type: bondType(mode).type, stereo: Bond.PATTERN.STEREO.NONE }), true);
		 ui.render.update();
		 return;
		 }
		 } */
	}

	if (id != 'transform-rotate' && !id.startsWith('select-'))
		ui.editor.deselectAll();

	if (id == 'select-lasso') {
		return new Editor.tool.select(ui.editor, 'lasso');
	} else if (id == 'select-rectangle') {
		return new Editor.tool.select(ui.editor, 'rectangle');
	} else if (id == 'select-fragment') {
		return new Editor.tool.select(ui.editor, 'fragment');
	} else if (id == 'erase') {
		return new Editor.tool.eraser(ui.editor, 1); // TODO last selector mode is better
	} else if (id.startsWith('atom-')) {
		return new Editor.tool.atom(ui.editor, args[0] || atomLabel(id));
	} else if (id.startsWith('bond-')) {
		return new Editor.tool.bond(ui.editor, id.substr(5));
	} else if (id == 'chain') {
		return new Editor.tool.chain(ui.editor);
	} else if (id.startsWith('template')) {
		return new Editor.tool.template(ui.editor, args[0] || templates[parseInt(id.split('-')[1])]);
	} else if (id == 'charge-plus') {
		return new Editor.tool.charge(ui.editor, 1);
	} else if (id == 'charge-minus') {
		return new Editor.tool.charge(ui.editor, -1);
	} else if (id == 'sgroup') {
		return new Editor.tool.sgroup(ui.editor);
	} else if (id == 'sgroup-data') {
		return new Editor.tool.sgroup(ui.editor, 'DAT');
	} else if (id == 'reaction-arrow') {
		return new Editor.tool.reactionarrow(ui.editor);
	} else if (id == 'reaction-plus') {
		return new Editor.tool.reactionplus(ui.editor);
	} else if (id == 'reaction-map') {
		return new Editor.tool.reactionmap(ui.editor);
	} else if (id == 'reaction-unmap') {
		return new Editor.tool.reactionunmap(ui.editor);
	} else if (id == 'rgroup-label') {
		return new Editor.tool.rgroupatom(ui.editor);
	} else if (id == 'rgroup-fragment') {
		return new Editor.tool.rgroupfragment(ui.editor);
	} else if (id == 'rgroup-attpoints') {
		return new Editor.tool.apoint(ui.editor);
	} else if (id.startsWith('transform-rotate')) {
		return new Editor.tool.rotate(ui.editor);
	}
	return null;
};

function atomLabel (mode) {
	var label = mode.substr(5);
	switch (label) {
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
	Action.fromNewCanvas(new Struct());
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
	ctab: new Struct(),
	render: null,
	editor: null,

	hideBlurredControls: hideBlurredControls,
	updateClipboardButtons: updateClipboardButtons,
	selectAction: selectAction,
	addUndoAction: addUndoAction,

	// TODO: remove me as we get better server API
	loadMoleculeFromFile: modal.open.loadHook,

	echo: echo,
	showDialog: showDialog,
	hideDialog: hideDialog,

	// TODO: search a way to pass dialogs to editor
	showSGroupProperties: modal.sgroup,
	showRGroupTable: modal.rgroup,
	showElemTable: modal.periodTable,
	showReaGenericsTable: modal.genericGroups,
	showAtomAttachmentPoints: modal.attachmentPoints,
	showAtomProperties: modal.atomProps,
	showBondProperties: modal.bondProps,
	showRLogicTable: modal.rgroupLogic,
	showLabelEditor: contextEdit
});
