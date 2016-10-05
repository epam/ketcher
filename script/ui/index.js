var ui = global.ui = {};

var keymage = require('keymage');

var Set = require('../util/set');
var Vec2 = require('../util/vec2');

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

var structFormat = require('./structformat');

var SCALE = 40;  // const
var HISTORY_LENGTH = 32;

var undoStack = [];
var redoStack = [];

var ketcherWindow;
var toolbar;
var lastSelected;
var clientArea = null;
var server;
var options;


var serverActions = ['layout', 'clean', 'arom', 'dearom', 'cip',
                     'reaction-automap', 'template-lib', 'recognize',
                     'check', 'analyse'];
var addionalAtoms = {
	storage: [],
	capacity: 7,
	current: 0
};

var clipActions = ['cut', 'copy', 'paste'];

function init (opts, apiServer) {
	ketcherWindow = $$('[role=application]')[0] || $$('body')[0];
	toolbar = ketcherWindow.select('[role=toolbar]')[0];
	clientArea = $('canvas');

	server = apiServer ||
		Promise.reject("Standalone mode!");
	options = opts;

	var currentOptions = {};
	var defOpts = JSON.parse(localStorage.getItem("ketcher-opts"));
    for (var key in defOpts) {
    	if (defOpts.hasOwnProperty(key)) {
    		if (defOpts[key] === "on")
	            currentOptions[key] = true;
	        else if (defOpts[key] === "off")
	            currentOptions[key] = false;
	        else
	            currentOptions[key] = defOpts[key];
      	}
    }

	// Init renderer
	ui.render =  new Render(clientArea, SCALE,
	                        Object.assign({ atomColoring: true }, options, currentOptions));
	ui.editor = new Editor(ui.render);
	ui.render.setMolecule(ui.ctab);
	ui.render.update();

	initDropdown(toolbar);
	initCliparea(ketcherWindow);
	initZoom();

	initHotKeys(toolbar, 'editor');
	labelEditKeys('editor.label', 'a-z0-9');
	keymage.setScope('editor');

	var watchScope = keymage.setScope.bind(keymage);
	keymage.setScope = function (scope) {
		console.info('KEY SCOPE', scope);
		watchScope(scope);
	};

	updateHistoryButtons();
	updateClipboardButtons();
	updateServerButtons(true);
	server.then(function () {
		updateServerButtons();
	}, function (err) {
		echo(err);
	});

	clientArea.on('mousedown', function (event) {
		if (dropdownToggle(toolbar))
			event.stop();       // TODO: don't delegate to editor
		if (!keymage.getScope().startsWith('editor'))
			keymage.setScope('editor');
	});
	//setScrollOffset(0, 0);
	selectAction('select-lasso');

	Event.observe(window, 'resize', function () {
		$$('menu').filter(function (menu) {
			return parseFloat(menu.style.marginTop) < 0;
		}).each(function (menu) {
			menu.style.marginTop = 0;
		});
		// TODO: pop all active
		popAction(toolbar);
	});
};

function updateAtoms() {
	if (addionalAtoms.storage.length > 0) {
		var al = "<menu>" + addionalAtoms.storage.reduce(function (res, atom) {
			return res + "<li id=\"atom-" + atom.toLowerCase() +
			           "\"><button data-number=\"" + element.getElementByLabel(atom) + "\">" +
			            atom + "</button></li>";
		}, "") + "</menu>";
		var cont = toolbar.select('#freq-atoms')[0];
		if (!cont) {
			var sa = toolbar.select('#atom')[0];
			sa.insert({ after: "<li id=\"freq-atoms\"/>" });
			cont = sa.nextElementSibling;
		}
		cont.update(al);
		initDropdown(cont);
	}
}

function shortcutStr(key) {
	var isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
	return key.replace(/Defmod/g, isMac ? '⌘' : 'Ctrl')
			  .replace(/-(?!$)/g, '+');
}

function subEl (id) {
	return $(id).children[0];
};

function hiddenAncestor(el, base) {
	base = base || document.body;
	var res = el.parentNode;
	while (res.getStyle('overflow') != 'hidden') {
		if (res == base)
			return null;
		res = res.parentNode;
	}
	return res;
}

function initDropdown(toolbar) {
	toolbar.select('li').each(function (el) {
		el.on('click', function (event) {
			if (event.target.tagName == 'BUTTON' &&
			    event.target.parentNode == this) {
				if (!this.hasClassName('selected')) {
					event.stop();
				}
				selectAction(this.id);
			}

			if (this.getStyle('overflow') == 'hidden') {
				dropdownToggle(toolbar, this);
				event.stop();
			}
		});
	});
}

function dropdownToggle(toolbar, el) {
	var dropdown = toolbar.select('.opened')[0];
	if (dropdown)
		dropdown.removeClassName('opened');
	if (el && el != dropdown)
		el.addClassName('opened');
	return !!dropdown && !el;
};

function popAction(toolbar, action) {
	var sel = action ? $(action) : toolbar.select('.selected')[0];
	var dropdown = sel && hiddenAncestor(sel);
	if (dropdown) {
		// var index = sel[0].previousSiblings().size();
		var menu = subEl(dropdown);
		menu.style.marginTop = (-sel.offsetTop + menu.offsetTop) + 'px';
	}
};

function selectAction (action) {
	// TODO: lastSelected -> prevtool_id
	action = action || lastSelected;
	var el = $(action);
	var args = [].slice.call(arguments, 1);
	console.assert(action.startsWith, 'id is not a string', action);

	dropdownToggle(toolbar);

	if (clipActions.indexOf(action) != -1 && args.length == 0)
		return delegateCliparea(action);

	// TODO: refactor !el - case when there are no such id
	if (!el || !subEl(el).disabled) {
		args.unshift(action);
		var act = mapTool.apply(null, args);
		if (act && act.tool) {
			var oldel = toolbar.select('.selected')[0];
			//console.assert(!lastSelected || oldel,
			//               "No last mode selected!");

			if (el != oldel || !el) { // tool canceling needed when dialog opens
				// if el.selected not changed
				ui.editor.tool(act.tool, act.opts);
				if (action.startsWith('select-')) {
					lastSelected = action;
				}
				if (el) {
					el.addClassName('selected');
					popAction(toolbar, el);
				}
				if (oldel) {
					oldel.removeClassName('selected');
				}
			}
		}
		return act;
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
		if (keymage.getScope().startsWith('editor')) {
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
				// cb.setData('chemical/x-daylight-smiles',
				// 		   smiles.stringify(struct));
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

	// ? events should be attached to documen\t
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

function initHotKeys(toolbar, scope) {
	// Initial keymap
	var keyMap = {
		'a': ['atom-any'],
		'defmod-a': ['select-all'],
		'defmod-shift-a': ['deselect-all'],
		'ctrl-shift-r': ['force-update'],
		'alt-shift-r': ['qs-serialize']
	};

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

	Object.keys(keyMap).forEach(function (key) {
		keymage(scope, key, function (event) {
			var group = keyMap[key];
			var index = group.index || 0; // TODO: store index in dom to revert on resize and
			                              //       sync mouse with keyboard
			var prevEl = toolbar.select('.selected')[0];
			if (group.length != 1 && group.indexOf(prevEl && prevEl.id) != -1) {
				group.index = index = (index + 1) % group.length;
			}
			var action = group[index];
			if (clipActions.indexOf(action) == -1) {
				// else delegate to cliparea
				selectAction(action);
				event.preventDefault();
			}
		});
	});
}

function labelEditKeys(scope, range) {
	function bindLetter(letter) {
		keymage(scope, letter, function() {
			dialog(modal.labelEdit, { letter: letter }).then(function (res) {
				addUndoAction(Action.fromAtomsAttrs(ui.editor.getSelection().atoms, res), true);
				ui.render.update();
				ui.editor.deselectAll();
			});
		});
	}
	var re = /(\S)-(\S)/g;
	var match;
	while ((match = re.exec(range)) !== null) {
		var from = match[1], to = match[2];
		var len = to.charCodeAt(0) - from.charCodeAt(0);
		Array.apply(null, { length: len + 1 }).forEach(function(_, i) {
			bindLetter(String.fromCharCode(from.charCodeAt(0) + i));
		});
	}
}

function updateClipboardButtons () {
	var selected = ui.editor.hasSelection(true);
	subEl('copy').disabled = subEl('cut').disabled = !selected;
	keymage.setScope(selected && ui.editor.getSelection().atoms.length ? 'editor.label' : 'editor');
};

function updateHistoryButtons () {
	subEl('undo').disabled = (undoStack.length == 0);
	subEl('redo').disabled = (redoStack.length == 0);
};

function updateServerButtons (standalone) {
	serverActions.forEach(function (action) {
		subEl(action).disabled = standalone;
	});
};

function createDialog(name, container) {
	var dn = name.replace(/([A-Z])/g, function (l) {
		return '-' + l.toLowerCase();
	});
	var tmpl = $(dn + '-tmpl').innerHTML;
	var dialog = new Element('form', { role: 'dialog', className: dn });
	container.insert(dialog);
	return dialog.update(tmpl);
}

function showDialog (name) {
	var cover = $$('.overlay')[0];
	var dialog = createDialog(name, cover);
	keymage.setScope('modal');
	cover.style.display = '';

	utils.animate(cover, 'show');
	utils.animate(dialog, 'show');
	return dialog;
};

function hideDialog (name) {
	var cover = $$('.overlay')[0];
	var dialog = cover.lastChild;

	utils.animate(cover, 'hide');
	utils.animate(dialog, 'hide').then(function () {
		cover.style.display = 'none';
		dialog.remove();
		keymage.setScope('editor');
	});
};

function dialog(modal, params, noAnimate) {
	var cover = $$('.overlay')[0];
	cover.style.display = '';
	keymage.setScope('modal');

	function close(fn, res) {
		keymage.setScope('editor');
		cover.style.display = 'none';
		// var node = this.getDOMNode();
		// React.unmountComponentAtNode(node);
		var dialog = cover.lastChild;
		dialog.remove();
		console.info('output', res);
		if (fn) fn(res);
	}

	function open(resolve, reject) {
		modal(Object.assign({}, params, {
			onOk: function (res) { close(params && params.onOk, res); resolve(res); },
			onCancel: function (res) { close(params && params.onCancel, res); reject(res); }
		}));
	}
	return new Promise(function (resolve, reject) {
		console.info('input', params);
		if (noAnimate)
			open(resolve, reject);
		else
			utils.animate(cover, 'show').then(open.bind(null, resolve, reject));
	});
}

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
	dialog(modal.open).then(function (res) {
			if (res.fragment)
				loadFragment(res.structStr, true);
			else
				loadMolecule(res.structStr, true);
	});
}

function save () {
	dialog(modal.save, { server: server, struct: ui.ctab });
}

function serverTransform(method, options, struct) {
	if (!struct) {
		struct = ui.ctab.clone();
		var implicitReaction = !struct.hasRxnArrow() && struct.hasRxnProps();
		if (implicitReaction)
			struct.rxnArrows.add(new Struct.RxnArrow());
	}

	var request = server.then(function () {
		return server[method](Object.assign({
			struct: molfile.stringify(struct, { ignoreErrors: true })
		}, options));
	});
	//utils.loading('show');
	request.then(function (res) {
		var resmol = molfile.parse(res.struct);
		if (implicitReaction)
			resmol.rxnArrows.clear();
		updateMolecule(resmol);
		//utils.loading('hide');
	}).then(null, function (er) {
		//utils.loading('hide');
		echo(er);
	});
}

function serverTransformSelected(method) {
	var aidMap = {};
	var struct = ui.ctab.clone(null, null, false, aidMap);

	var selectedAtoms = ui.editor.getSelection(true).atoms;
	selectedAtoms = selectedAtoms.map(function (aid) {
		return aidMap[aid];
	});
	return serverTransform(method, selectedAtoms.length > 0 ? { 'atom_list': selectedAtoms } : null, struct);
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
}

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

function automap () {
	if (!ui.ctab.hasRxnArrow())
		// not a reaction explicit or implicit
		echo('Auto-Mapping can only be applied to reactions');
	else {
		modal.automap({
			onOk: function (res) {
				return serverTransform('automap', res);
			}
		});
	}
};

function loadMolecule (structStr, checkEmptyLine) {
	return getStruct(structStr, checkEmptyLine).then(updateMolecule, echo);
}

function loadFragment (structStr, checkEmptyLine) {
	return getStruct(structStr, checkEmptyLine).then(function (struct) {
		struct.rescale();
		selectAction('paste', struct);
	}, echo);
}

function getStruct(structStr, checkEmptyLine) {
	//utils.loading('show');
	return structFormat.fromString(structStr, {
		badHeaderRecover: checkEmptyLine
	}, server).then(function (res) {
		//utils.loading('hide');
		return res;
	}, function (err) {
		utils.loading('hide');
		throw err;
	});
}

function removeSelected () {
	addUndoAction(Action.fromFragmentDeletion());
	ui.editor.deselectAll();
	ui.render.update();
};

function undo ()
{
	if (ui.editor.tool())
		ui.editor.tool().OnCancel();

	ui.editor.deselectAll();
	redoStack.push(undoStack.pop().perform());
	ui.render.update();
	updateHistoryButtons();
};

function redo ()
{
	if (ui.editor.tool())
		ui.editor.tool().OnCancel();

	ui.editor.deselectAll();
	undoStack.push(redoStack.pop().perform());
	ui.render.update();
	updateHistoryButtons();
};

function addAtoms(res) {
	var atoms = [];
	for (var i = 0; i < 10; i++) {
		var atomLabel = toolbar.select('#atom')[0].select('li')[i].id.substr(5);
		atomLabel = atomLabel.charAt(0).toUpperCase() + atomLabel.slice(1);
		atoms.push(atomLabel);
	}
	if (atoms.indexOf(element[res.values[0]].label) < 0) {
		if (addionalAtoms.current >= addionalAtoms.capacity)
			addionalAtoms.current = 0;
		addionalAtoms.storage[addionalAtoms.current] = element[res.values[0]].label;
		updateAtoms();
		addionalAtoms.current++;
	}
}

function elemTable () {
	modal.periodTable({
		onOk: function (res) {
			var props;
			if (res.mode == 'single') {
				props = {
					label: element[res.values[0]].label
				};
				addAtoms(res);
			} else
				props = {
					label: 'L#',
					atomList: new Struct.AtomList({
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

function templateLib () {
	dialog(modal.templates.bind(modal, '')).then(function (tmpl) {
		// C doesn't conflict with menu id
		console.info('result', tmpl);
		selectAction('template-C', tmpl);
		return true;
	});
};

var actionMap = {
	new: clear,
	open: open,
	save: save,
	undo: undo,
	redo: redo,
	'zoom-in': zoomIn,
	'zoom-out': zoomOut,
	'period-table': elemTable,
	'generic-groups': genericsTable,
	'template-lib': templateLib,

	layout: function () {
		return serverTransformSelected('layout');
	},
	clean: function () {
		return serverTransformSelected('clean');
	},
	arom:  function () {
		return serverTransform('aromatize');
	},
	dearom: function () {
		return serverTransform('dearomatize');
	},
	cip: function () {
		return serverTransform('calculateCip');
	},
	cut: function () {
		var struct = ui.editor.getSelectionStruct();
		removeSelected();
		return struct.isBlank() ? null : struct;
	},
	copy: function () {
		var struct = ui.editor.getSelectionStruct();
		ui.editor.deselectAll();
		return struct.isBlank() ? null : struct;
	},
	paste: function (struct) {
		if (struct.isBlank())
			throw 'Not a valid structure to paste';
		ui.editor.deselectAll();
		return { tool: 'paste', opts: struct };
	},
	info: function () {
		var about = dialog.bind(null, modal.about);
		server.then(function (res) {
			return about(Object.assign(res, options));
		}, function () {
			return about(options);
		});
	},
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
	'qs-serialize': function () {
		var molStr = molfile.stringify(ui.ctab);
		var molQs = 'mol=' + encodeURIComponent(molStr).replace(/%20/g, '+');
		var qs = document.location.search;
		document.location.search = !qs ? '?' + molQs :
			qs.search('mol=') == -1 ? qs + '&' + molQs :
			qs.replace(/mol=[^&$]*/, molQs);
	},
	'reaction-automap': automap,
	'recognize': function () {
		dialog(modal.recognizeMolecule, { server: server }).then(function (res) {
			if (res.fragment) {
				//struct.rescale();
				selectAction('paste', res.struct);
			}
			else
				updateMolecule(res.struct);
		});
	},
	'check': function () {
		dialog(modal.checkStruct, {
			struct: ui.ctab,
			server: server
		});
	},
	'analyse': function () {
		server.calculate({
			struct: molfile.stringify(ui.ctab),
			properties: ['molecular-weight', 'most-abundant-mass',
			             'monoisotopic-mass', 'gross', 'mass-composition']
		}).then(function (values) {
			return dialog(modal.calculatedValues, values, true);
		}, echo);
	},
	'settings': function () {
		dialog(modal.openSettings, { server: server }).then(function (res) {
			if (!res.onlyCurrentSession)
				localStorage.setItem("ketcher-opts",  JSON.stringify(res.localStorageOpts));
			// else
			// 	localStorage.setItem("ketcher-opts",  '{}');
			console.log("ketcher-opts", res.localStorageOpts);
			ui.render =  ui.editor.render = new Render(clientArea, SCALE, res.opts);
			ui.render.setMolecule(ui.ctab);
			ui.render.update();
		});
	}
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
			addUndoAction(Action.fromFlip(ui.editor.getSelection(), id.endsWith('h') ? 'horizontal' :
			                              'vertical'), true);
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
		return { tool: 'select', opts: 'lasso' };
	} else if (id == 'select-rectangle') {
		return { tool: 'select', opts: 'rectangle' };
	} else if (id == 'select-fragment') {
		return { tool: 'select', opts:'fragment' };
	} else if (id == 'erase') {
		return { tool: 'eraser', opts: 1 }; // TODO last selector mode is better
	} else if (id.startsWith('atom-')) {
		return { tool: 'atom', opts: args[0] || atomLabel(id) };
	} else if (id.startsWith('bond-')) {
		return { tool: 'bond', opts: id.substr(5) };
	} else if (id == 'chain') {
		return { tool: 'chain' };
	} else if (id.startsWith('template')) {
		return { tool: 'template',
		         opts: args[0] || {
			         struct: molfile.parse(templates[parseInt(id.split('-')[1])])
		         }
		       };
	} else if (id == 'charge-plus') {
		return { tool: 'charge', opts: 1 };
	} else if (id == 'charge-minus') {
		return { tool: 'charge', opts: -1 };
	} else if (id == 'sgroup') {
		return { tool: 'sgroup' };
	} else if (id == 'sgroup-data') {
		return { tool: 'sgroup', opts: 'DAT' };
	} else if (id == 'reaction-arrow') {
		return { tool: 'reactionarrow' };
	} else if (id == 'reaction-plus') {
		return { tool: 'reactionplus' };
	} else if (id == 'reaction-map') {
		return { tool: 'reactionmap' };
	} else if (id == 'reaction-unmap') {
		return { tool: 'reactionunmap' };
	} else if (id == 'rgroup-label') {
		return { tool: 'rgroupatom' };
	} else if (id == 'rgroup-fragment') {
		return { tool: 'rgroupfragment' };
	} else if (id == 'rgroup-attpoints') {
		return { tool: 'apoint' };
	} else if (id.startsWith('transform-rotate')) {
		return { tool: 'rotate' };
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

Object.assign(ui, module.exports);

Object.assign(ui, {
	ctab: new Struct(),
	render: null,
	editor: null,

	updateClipboardButtons: updateClipboardButtons,
	selectAction: selectAction,
	addUndoAction: addUndoAction,

	echo: echo,
	showDialog: showDialog,
	hideDialog: hideDialog,

	// TODO: search a way to pass dialogs to editor
	showSGroupProperties: modal.sgroup,
	showRGroupTable: dialog.bind(null, modal.rgroup),
	showElemTable: modal.periodTable,
	showReaGenericsTable: modal.genericGroups,
	showAtomAttachmentPoints: modal.attachmentPoints,
	showAtomProperties: modal.atomProps,
	showBondProperties: modal.bondProps,
	showRLogicTable: modal.rgroupLogic,
	showLabelEditor: function (val) {
		return dialog(modal.labelEdit, val, true);
	}
});
