var ui = global.ui = {};

var keyNorm = require('./keynorm');

var element = require('../chem/element');
var Struct = require('../chem/struct');

var molfile = require('../chem/molfile');
var smiles = require('../chem/smiles');

var Editor = require('../editor');

var templates = require('./templates');

var utils = require('./utils');
var modal = require('./modal');

var structFormat = require('./structformat');
var structConv = require('./structconv');

var HISTORY_LENGTH = 32;

var undoStack = [];
var redoStack = [];

var ketcherWindow;
var toolbar;
var lastSelected;
var clientArea = null;
var server;
var options;
var scope;

var libTmpls = null;

var serverActions = ['layout', 'clean', 'arom', 'dearom', 'cip',
                     'reaction-automap', 'recognize', 'check',
                     'analyse', 'miew'];

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

	server = apiServer || Promise.reject("Standalone mode!");
	options = opts;

	var currentOptions = JSON.parse(localStorage.getItem("ketcher-opts"));

	// Init renderer
	ui.editor = new Editor(clientArea,
	                       Object.assign(options, currentOptions));
	ui.render = ui.editor.render;

	initDropdown(toolbar);
	initCliparea(ketcherWindow);
	initZoom();
	initEditor(ui.editor);

	updateHistoryButtons();
	updateClipboardButtons(null);
	updateServerButtons(true);
	server.then(function () {
		updateServerButtons();
	}, function (err) {
		alert(err);
	});

	subEl('template-lib').disabled = true;
	modal.templates.init('', $$('.cellar')[0]).then(function (res) {
		libTmpls = res;
		subEl('template-lib').disabled = false;
	});

	scope = 'editor';
	var hotKeys = initHotKeys(toolbar);
	ketcherWindow.on('keydown', function (event) {
		if (scope == 'editor')
			keyHandle(toolbar, hotKeys, event);
	});
	clientArea.on('mousedown', function (event) {
		if (dropdownToggle(toolbar))
			event.stop();       // TODO: don't delegate to editor
		scope = 'editor';
	});
	selectAction('select-lasso');

	addEventListener('resize', function () {
		$$('menu').filter(function (menu) {
			return parseFloat(menu.style.marginTop) < 0;
		}).each(function (menu) {
			menu.style.marginTop = 0;
		});
		// TODO: pop all active
		popAction(toolbar);
	});
};


function initEditor(editor) {
	editor.on('bondEdit', function (bond) {
		var dlg = dialog(modal.bondProps,
		                 structConv.fromBond(bond));
		return dlg.then(function (res) {
			return structConv.toBond(res);
		});
	});
	editor.on('elementEdit', function (atom) {
		if (element.getElementByLabel(atom.label)) {
			var dlg = dialog(modal.atomProps,
			                 structConv.fromAtom(atom));
			return dlg.then(function (res) {
				return structConv.toAtom(res);
			});
		} else if (atom.label == 'L#') {
			return elemTable(structConv.fromAtomList(atom));
		} else {
			return genericsTable(atom);
		}
	});
	editor.on('rgroupEdit', function (rgroup) {
		if (Object.keys(rgroup).length > 1) {
			var rgids = [];
			editor.struct().rgroups.each(function (rgid) {
				rgids.push(rgid);
			});
			return dialog(modal.rgroupLogic,
			              Object.assign({ rgroupLabels: rgids },
			                            rgroup));
		} else {
			var dlg = dialog(modal.rgroup, {
				values: rgroup.label && ['R' + rgroup.label]
			});
			return dlg.then(function (res) {
				console.assert(res.values.length <= 1,
				               'Too much elements');
				return {
					label: res.values.length == 0 ? null :
						res.values[0].substr(1) - 0
				};
			});
		}
	});
	editor.on('sgroupEdit', function (sgroup) {
		return dialog(modal.sgroup, sgroup);
	});
	editor.on('sdataEdit', function (sgroup) {
		return dialog(modal.sgroup, sgroup);
	});
	editor.on('apointEdit', function (ap) {
		var dlg = dialog(modal.attachmentPoints,
		                 structConv.fromApoint(ap));
		return dlg.then(function (res) {
			return structConv.toApoint(res);
		});
	});
	editor.on('rlabelEdit', function (props) {
		// props.label == 'R#'
		var dlg = dialog(modal.rgroup, {
			type: 'multiple',
			values: structConv.fromRlabel(props.rglabel)
		});
		return dlg.then(function (res) {
			return {
				label: 'R#',
				rglabel: structConv.toRlabel(res)
			};
		});
	});
	editor.on('message', function (msg) {
		if (msg.error)
			alert(msg.error);
		else {
			var act = Object.keys(msg)[0];
			console[act](msg[act]);
		}
	});
	editor.on('selectionChange', updateClipboardButtons);
}

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
	var isMac = /Mac/.test(navigator.platform);
	return key.replace(/Mod/g, isMac ? '⌘' : 'Ctrl')
		.replace(/-(?!$)/g, '+')
		.replace(/\+?([^+]+)$/, function (key) {
			return key.length == 1 ? key.toUpperCase() : key;
		});
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
    // TODO: lastSelected -> selected pool
	action = action || lastSelected;
	var el = $(action);
	var args = [].slice.call(arguments, 1);
	console.assert(action.startsWith, 'id is not a string', action);

	dropdownToggle(toolbar);

	console.info('action', action);
	if (clipActions.indexOf(action) != -1 && args.length == 0)
		return delegateCliparea(action);

	// TODO: refactor !el - case when there are no such id
	if (!el || !subEl(el).disabled) {
		args.unshift(action);
		var act = mapAction.apply(null, args);
		if (act && !act.then) {
			var oldel = toolbar.select('.selected')[0];
			//console.assert(!lastSelected || oldel,
			//               "No last mode selected!");

			if (el != oldel || !el) { // tool canceling needed when dialog opens
				// if el.selected not changed
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
		alert('These action is unavailble via menu.\n' +
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
		if (scope == 'editor') {
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
			var structStr = paste(event.clipboardData);
			if (structStr)
				load(structStr, {
					fragment: true
				});
			event.preventDefault();
		}
	});
}

function initHotKeys(toolbar) {
	// Initial keymap
	var hotKeys = {
		'a': ['atom-any'],
		'Mod-a': ['select-all'],
		'Mod-Shift-a': ['deselect-all'],
		'Ctrl-Shift-r': ['force-update'],
		'Alt-Shift-r': ['qs-serialize']
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
				if (Array.isArray(hotKeys[kb]))
					hotKeys[kb].push(action);
				else
					hotKeys[kb] = [action];
			});
		}
	});
	return keyNorm(hotKeys);
}

function keyHandle(toolbar, hotKeys, event) {
	var key = keyNorm(event);
	var atomsSelected = ui.editor.selection() &&
	                    ui.editor.selection().atoms;
	var group;

	if (key.length == 1 && atomsSelected && key.match(/\w/)) {
		console.assert(atomsSelected.length > 0);
		dialog(modal.labelEdit, { letter: key }).then(function (res) {
			selectAction('atom', res);
		});
		event.preventDefault();
	} else if (group = keyNorm.lookup(hotKeys, event)) {
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
	}
}

function updateClipboardButtons (selection) {
	var selected = selection &&  // if not only sgroupData selected
	    (Object.keys(selection).length > 1 || !selection.sgroupData);
	console.info('selected', selection, selected);
	subEl('copy').disabled = subEl('cut').disabled = !selected;
};

function updateHistoryButtons () {
	subEl('undo').disabled = (undoStack.length == 0);
	subEl('redo').disabled = (redoStack.length == 0);
};

function updateServerButtons (standalone) {
	serverActions.forEach(function (action) {
		if ($(action))
			subEl(action).disabled = !!standalone;
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
	scope = 'modal';
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
		scope = 'editor';
	});
};

function dialog(modal, params, noAnimate) {
	var cover = $$('.overlay')[0];
	cover.style.display = '';
	scope = 'modal';

	function close(fn, res) {
		scope = 'editor';
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
		if (noAnimate === false)
			utils.animate(cover, 'show').then(open.bind(null, resolve, reject));
		else
			open(resolve, reject);
	});
}

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
	if (!ui.editor.struct().isBlank())
		ui.editor.struct(new Struct());
}

function open () {
	dialog(modal.open).then(function (res) {
		load(res.structStr, {
			badHeaderRecover: true,
			fragment: res.fragment
		});
	});
}

function save () {
	dialog(modal.save, { server: server,
	                     struct: ui.editor.struct() });
}

function serverCall(method, options, struct) {
	if (!struct) {
		var aidMap = {};
		struct = ui.editor.struct().clone(null, null, false, aidMap);
		var selectedAtoms = ui.editor.explicitSelected().atoms || [];
		selectedAtoms = selectedAtoms.map(function (aid) {
			return aidMap[aid];
		});
	}

	var request = server.then(function () {
		return server[method](Object.assign({
			struct: molfile.stringify(struct, { ignoreErrors: true })
		}, selectedAtoms && selectedAtoms.length > 0 ? {
			selected: selectedAtoms
		} : null, options));
	});
	//utils.loading('show');
	request.catch(function (err) {
		alert(err);
	}).then(function (er) {
		//utils.loading('hide');
	});
	return request;
}

function serverTransform(method, options, struct) {
	return serverCall(method, options, struct).then(function (res) {
		return load(res.struct, {       // Let it be an exception
			rescale: method == 'layout' // for now as layout does not
		});                             // preserve bond lengths
	});
}

function initZoom() {
	var zoomSelect = subEl('zoom-list');
	// TODO: need a way to setup zoom range
	//       e.g. if (zoom < 0.1 || zoom > 10)
	zoomSelect.on('focus', function () {
		scope = 'zoom';
	});
	zoomSelect.on('blur', function () {
		scope = 'editor';
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
	if (refresh)
		ui.editor.zoom(value);
}

function automap () {
	if (!ui.editor.struct().hasRxnArrow())
		// not a reaction explicit or implicit
		alert('Auto-Mapping can only be applied to reactions');
	else {
		modal.automap({
			onOk: function (res) {
				return serverTransform('automap', res);
			}
		});
	}
};

function load(structStr, options) {
	options = options || {};
	// TODO: check if structStr is parsed already
	//utils.loading('show');
	var parsed = structFormat.fromString(structStr,
	                                     options, server);

	parsed.catch(function (err) {
		//utils.loading('hide');
		alert("Can't parse molecule!");
	});

	return parsed.then(function (struct) {
		//utils.loading('hide');
		console.assert(struct, 'No molecule to update');
		if (options.rescale)
			struct.rescale();   // TODO: move out parsing?
		if (options.fragment)
			selectAction('paste', struct);
		else
			ui.editor.struct(struct);
		return struct;
	}, function (err) {
		alert(err);
	});
}

function undo ()
{
	if (ui.editor.tool())
		ui.editor.tool().OnCancel();

	ui.editor.selection(null);
	redoStack.push(undoStack.pop().perform());
	ui.render.update();
	updateHistoryButtons();
};

function redo ()
{
	if (ui.editor.tool())
		ui.editor.tool().OnCancel();

	ui.editor.selection(null);
	undoStack.push(redoStack.pop().perform());
	ui.render.update();
	updateHistoryButtons();
};

function addAtoms(label) {
	var atoms = [];
	for (var i = 0; i < 10; i++) {
		var atomLabel = toolbar.select('#atom')[0].select('li')[i].id.substr(5);
		atomLabel = atomLabel.charAt(0).toUpperCase() + atomLabel.slice(1);
		atoms.push(atomLabel);
	}
	if (atoms.indexOf(label) < 0) {
		if (addionalAtoms.current >= addionalAtoms.capacity)
			addionalAtoms.current = 0;
		addionalAtoms.storage[addionalAtoms.current] = label;
		updateAtoms();
		addionalAtoms.current++;
	}
}

function elemTable(atom) {
	// TODO: convertion ouside is not so good
	return dialog(modal.periodTable, atom && atom.type ? atom : {
		type: 'single',
		values: atom && [element.getElementByLabel(atom.label)]
	}).then(function (res) {
		if (res.type != 'single')
			return structConv.toAtomList(res);

		var label = element[res.values[0]].label;
		addAtoms(label);
		return { label: label };
	});
};

function genericsTable(atom) {
	return dialog(modal.genericGroups, {
		values: atom && [atom.label]
	}).then(function (res) {
		return { label: res.values[0] };
	});
};

function templateLib () {
	var store = JSON.parse(localStorage['ketcher-tmpl'] || 'null') || [];
	var userTmpls = store.map(function (structStr) {
		return {
			struct: molfile.parse(structStr),
			props: { group: 'User' }
		};
	});

	dialog(modal.templates, { tmpls: libTmpls, userTmpls: userTmpls }, true).then(function (tmpl) {
		// C doesn't conflict with menu id
		selectAction('template-custom', tmpl);
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
	'period-table': function () {
		elemTable().then(function (res) {
			selectAction('atom-table', res);
		});
	},
	'generic-groups': function () {
		genericsTable().then(function (res) {
			selectAction('atom-generics', res);
		});
	},
	'template-lib': templateLib,

	layout: function () {
		return serverTransform('layout');
	},
	clean: function () {
		return serverTransform('clean');
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
		var struct = ui.editor.structSelected();
		selectAction('erase');
		return struct.isBlank() ? null : struct;
	},
	copy: function () {
		var struct = ui.editor.structSelected();
		ui.editor.selection(null);
		return struct.isBlank() ? null : struct;
	},
	paste: function (struct) {
		if (struct.isBlank())
			throw 'Not a valid structure to paste';
		return ui.editor.tool('paste', struct);
	},
	about: function () {
		var about = dialog.bind(null, modal.about);
		server.then(function (res) {
			return about(Object.assign(res, options), true);
		}, function () {
			return about(options, true);
		});
	},
	'select-all': function () {
		ui.editor.selection('all');
		selectAction(null);
	},
	'deselect-all': function () {
		ui.editor.selection(null);
	},
	'force-update': function () {
		// original: for dev purposes
		ui.render.update(true);
	},
	'qs-serialize': function () {
		var molStr = molfile.stringify(ui.editor.struct());
		var molQs = 'mol=' + encodeURIComponent(molStr).replace(/%20/g, '+');
		var qs = document.location.search;
		document.location.search = !qs ? '?' + molQs :
			qs.search('mol=') == -1 ? qs + '&' + molQs :
			qs.replace(/mol=[^&$]*/, molQs);
	},
	'reaction-automap': automap,
	'recognize': function () {
		dialog(modal.recognize, { server: server }).then(function (res) {
			load(res.structStr, {
				rescale: true,
				fragment: res.fragment
			});
		});
	},
	'check': function () {
		dialog(modal.check, {
			check: serverCall.bind(null, 'check')
		});
	},
	'analyse': function () {
		serverCall('calculate', {
			properties: ['molecular-weight', 'most-abundant-mass',
			             'monoisotopic-mass', 'gross', 'mass-composition']
		}).then(function (values) {
			return dialog(modal.calculatedValues, values, true);
		});
	},
	'settings': function () {
		dialog(modal.settings, { server: server }).then(function (res) {
			if (!res.onlyCurrentSession)
				localStorage.setItem("ketcher-opts",  JSON.stringify(res.localStorageOpts));
			console.log("ketcher-opts", res.localStorageOpts);
			ui.editor.options(res.opts);
			ui.render = ui.editor.render;
		});
	},
	'help': function () {
		dialog(modal.help);
	},
	'miew': function() {
		var convert = structFormat.toString(ui.editor.struct(),
		                                    'cml', server);
		convert.then(function (cml) {
			dialog(modal.miew, {
				structStr: cml
			}, true).then(function(res) {
			if (res.structStr)
				load(res.structStr);
			});
		});
	}
};

function mapAction(id) {
	console.assert(id, 'The null tool');
	var args = [].slice.call(arguments, 1);
	if (actionMap[id])
		return actionMap[id].apply(null, args);
	var mt = mapTool.apply(null, arguments);
	return mt ? ui.editor.tool(mt.tool, mt.opts) : null;
}

// TODO: rewrite declaratively, merge to actionMap
function mapTool (id) {
	var args = [].slice.call(arguments, 1);
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
		return {
			tool: 'bond',
			opts: structConv.caption2BondType(id.substr(5))
		};
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
	} else if (id.startsWith('transform-')) {
		if (/flip/.test(id))    // TODO: rename consistently
			return {
				tool: 'rotate',
				opts: id.endsWith('h') ? 'horizontal' :
					'vertical'
			};
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
	ui.editor.struct(new Struct());
	undoStack.clear();
	redoStack.clear();
	updateHistoryButtons();
	selectAction(null);
}

// The expose guts two way
module.exports = {
	init: init,
	load: load
};

Object.assign(ui, module.exports);

Object.assign(ui, {
	render: null,
	editor: null,

	selectAction: selectAction,
	addUndoAction: addUndoAction,

	showDialog: showDialog,
	hideDialog: hideDialog,

	// TODO: search a way to pass dialogs to editor
	showLabelEditor: function (val) {
		return dialog(modal.labelEdit, val, true);
	}
});
