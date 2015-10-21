// Document events
//document.observe('keypress', ui.onKeyPress_Ketcher);
//document.observe('keydown', ui.onKeyDown_IE);
//document.observe('keyup', ui.onKeyUp);
//ui.setKeyboardShortcuts();

/*global require, global, key*/

ui.onKeyPress_Pre = function (action, event, handler, doNotStopIfCoverIsVisible) {
	util.stopEventPropagation(event); // TODO: still need this?

	if ($('window_cover').visible() && !doNotStopIfCoverIsVisible) {
		return false;
	}

	//rbalabanov: here we try to handle event using current editor tool
	//BEGIN
	if (ui && ui.render.current_tool) {
		ui.render.resetLongTapTimeout(true);
		if (ui.render.current_tool.processEvent('OnKeyPress', event, action)) {
			return false;
		}
	}
	//END

	return true;
};

ui.keyboardShortcuts_OSX = {
	remove_selected: 'backspace'
};

ui.keyboardShortcuts_nonOSX = {
	remove_selected: 'delete'
};

ui.setKeyboardShortcuts = function () {
	var setShortcuts = function (action, keys) {
		var shortcuts = keys;

		if (!(action in ui.keyboardActions)) {
			throw new Error('Keyboard action not defined for action "' + action + '"');
		}
		if (ui.is_osx) {
			shortcuts = shortcuts.replace(/ctrl/g, '⌘');
		}
		key.apply(this, [shortcuts, ui.keyboardCallbackProxy(action, function (action2, event, handler) {
				if (!ui.onKeyPress_Pre(action2, event, handler, ui.doNotStopIfCoverIsVisible[action2])) {
					return false;
				}
				var ret = ui.keyboardActions[action2].call(this, event, handler);
				if (!ret) {
					util.preventDefault(event);
				}
				return ret;
			})]);
	};
	util.map_each(ui.keyboardShortcuts, setShortcuts);
	util.map_each((ui.is_osx ? ui.keyboardShortcuts_OSX : ui.keyboardShortcuts_nonOSX), setShortcuts);
};

ui.keyboardShortcuts = {
// ? 'zoom-in': '=, shift+=, plus, shift+plus, equals, shift+equals',
	atom_tool_any: 'A',
//? rgroup_tool_label: 'R',
	select_all: 'ctrl+A',
//? escape: 'escape',

	force_update: 'ctrl+alt+R'
};

ui.selector_tool_modes = ['selector_lasso', 'selector_square', 'selector_fragment'];
ui.bond_tool_single_bonds = ['bond_single', 'bond_up', 'bond_down', 'bond_updown'];
ui.bond_tool_double_bonds = ['bond_double', 'bond_crossed'];
ui.charge_tool_modes = ['charge_plus', 'charge_minus'];
ui.rgroup_tool_modes = ['rgroup_label', 'rgroup_fragment', 'rgroup_attpoints'];
ui.template_tool_modes = ['template_0', 'template_1', 'template_2', 'template_3', 'template_4', 'template_5', 'template_6', 'template_7'];
ui.customtemplate_tool_modes = [];

ui.keyboardActions = {
	// sample: function(event, handler) { do_sample(); },
	'zoom-in': function () { ui.onClick_ZoomIn.call($('zoom-in')); },
	'zoom-out': function () { ui.onClick_ZoomOut.call($('zoom-out')); },
	copy: function () { ui.onClick_Copy.call($('copy')); },
	cut: function () { ui.onClick_Cut.call($('cut')); },
	paste: function () { ui.onClick_Paste.call($('paste')); },
	undo: function () { ui.onClick_Undo.call($('undo')); },
	redo: function () { ui.onClick_Redo.call($('redo')); },
	remove_selected: function () { if (ui.editor.hasSelection()) ui.removeSelected(); },
	bond_tool_any: function () { ui.onMouseDown_DropdownListItem.call($('bond_any')); },
	bond_tool_single: function () { ui.onMouseDown_DropdownListItem.call($(util.listNextRotate(ui.bond_tool_single_bonds, ui.mode_id))); },
	bond_tool_double: function () { ui.onMouseDown_DropdownListItem.call($(util.listNextRotate(ui.bond_tool_double_bonds, ui.mode_id))); },
	bond_tool_triple: function () { ui.onMouseDown_DropdownListItem.call($('bond_triple')); },
	bond_tool_aromatic: function () { ui.onMouseDown_DropdownListItem.call($('bond_aromatic')); },
	select_charge_tool: function () { ui.selectAction(util.listNextRotate(ui.charge_tool_modes, ui.mode_id)); },
	atom_tool_any: function () { ui.selectAction('atom_any'); },
	atom_tool_h: function () { ui.selectAction('atom_h'); },
	atom_tool_c: function () { ui.selectAction('atom_c'); },
	atom_tool_n: function () { ui.selectAction('atom_n'); },
	atom_tool_o: function () { ui.selectAction('atom_o'); },
	atom_tool_s: function () { ui.selectAction('atom_s'); },
	atom_tool_p: function () { ui.selectAction('atom_p'); },
	atom_tool_f: function () { ui.selectAction('atom_f'); },
	atom_tool_br: function () { ui.selectAction('atom_br'); },
	atom_tool_cl: function () { ui.selectAction('atom_cl'); },
	atom_tool_i: function () { ui.selectAction('atom_i'); },
	rgroup_tool_label: function () { /* do nothing here, this may be handled inside the tool */ },
	rgroup_tool_select: function () { ui.onMouseDown_DropdownListItem.call($(util.listNextRotate(ui.rgroup_tool_modes, ui.mode_id))); },
	select_all: function () { ui.selectAll(); },
	sgroup_tool: function () { ui.selectAction('sgroup'); },
	cleanup_tool: function () { ui.onClick_CleanUp.call($('clean_up')); },
	new_document: function () { ui.onClick_NewFile.call($('new')); },
	open_document: function () { ui.onClick_OpenFile.call($('open')); },
	save_document: function () { ui.onClick_SaveFile.call($('save')); },
	rotate_tool: function () { ui.selectAction('transform_rotate'); },
	template_tool: function () { ui.onMouseDown_DropdownListItem.call($(util.listNextRotate(ui.template_tool_modes, ui.mode_id))); },
	customtemplate_tool: function () { if (ui.customtemplate_tool_modes.length < 1) return; ui.onMouseDown_DropdownListItem.call($(util.listNextRotate(ui.customtemplate_tool_modes, ui.mode_id))); },
	escape: function (event) { if (!$('window_cover').visible()) ui.selectMode(ui.defaultSelector); },
	selector: function () { ui.onMouseDown_DropdownListItem.call($(util.listNextRotate(ui.selector_tool_modes, ui.mode_id))); },

	// for dev purposes
	force_update: function () { ui.render.update(true); }
};

// create a proxy handler to bind "action" parameter for use in the actual handler
ui.keyboardCallbackProxy = function (action, method) {
	var action_ = action;
	return function (event, handler) {
		return method.call(this, action_, event, handler);
	};
};

ui.doNotStopIfCoverIsVisible = {
	escape: true
};
