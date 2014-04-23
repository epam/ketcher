/****************************************************************************
 * Copyright (C) 2009-2010 GGA Software Services LLC
 *
 * This file may be distributed and/or modified under the terms of the
 * GNU Affero General Public License version 3 as published by the Free
 * Software Foundation and appearing in the file LICENSE.GPL included in
 * the packaging of this file.
 *
 * This file is provided AS IS with NO WARRANTY OF ANY KIND, INCLUDING THE
 * WARRANTY OF DESIGN, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
 ***************************************************************************/

if (typeof(ui) == 'undefined')
    ui = function () {};

ui.standalone = true;
ui.forwardExceptions = false;

ui.scale = 40;

ui.zoomValues = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 2.0, 2.5, 3.0, 3.5, 4.0];
ui.zoomIdx = ui.zoomValues.indexOf(1.0);
ui.zoom = 1.0;

ui.DBLCLICK_INTERVAL = 300;

ui.HISTORY_LENGTH = 32;

ui.DEBUG = false;

ui.render = null;

ui.ctab = new chem.Struct();

ui.client_area = null;
ui.mode_id = null;

ui.undoStack = new Array();
ui.redoStack = new Array();

// ui.is_osx = false;
// ui.is_touch = false;
ui.initialized = false;


//
// Init section
//

ui.initTemplates = function (base_url)
{
    function parseSdf(sdf) {
        var items = sdf.split(/^[$][$][$][$]$/m);
        var parsed = [];

        items.each(function (item) {
            item = item.replace(/\r/g, '');
            item = item.strip();
            var end_idx = item.indexOf('M  END');

            if (end_idx == -1) {
                return;
            }

            var iparsed = {};

            iparsed.molfile = item.substring(0, end_idx + 6);
            iparsed.name = item.substring(0, item.indexOf('\n')).strip();
            item = item.substr(end_idx + 7).strip();

            var entries = item.split(/^$/m);

            entries.each(function (entry) {
                entry = entry.strip();
                if (!entry.startsWith('> <')) {
                    return;
                }
                var lines = entry.split('\n');
                var field = lines[0].strip().substring(3, lines[0].lastIndexOf('>')).strip();

                iparsed[field] = parseInt(lines[1].strip()) || lines[1].strip();
            });
            parsed.push(iparsed);
        });

        return parsed;
    }

    // Init templates
    new Ajax.Request(base_url + 'templates.sdf',
    {
        method: 'get',
        requestHeaders: {Accept: 'application/octet-stream'},
        asynchronous : false,
        onComplete: function (res)
        {
            try {
                var sdf_items = parseSdf(res.responseText);
            } catch (er) {
                if (ui.forwardExceptions)
                    throw er;
                return;
            }

            if (sdf_items.length == 0) {
                return;
            }

            rnd.customtemplates = [];
            ui.customtemplate_tool_modes.clear();
            var tbody = $('customtemplate_dropdown_list').select('table > tbody')[0];
            tbody.update();

            var idx = 0;
            sdf_items.each(function (item) {
                var tmpl = {
                    name: (item.name || ('customtemplate ' + (idx+1))).capitalize(),
                    molfile: item.molfile,
                    aid: (item.atomid || 1) - 1,
                    bid: (item.bondid || 1) - 1
                };

                rnd.customtemplates.push(tmpl);
                ui.customtemplate_tool_modes.push('customtemplate_' + idx);

                tbody.insert('<tr class="dropdownListItem" id="customtemplate_' + idx +
                        '" title="' + tmpl.name + ' (Shift+T)">' + '<td><div id="customtemplate_' + idx +
                        '_preview" style="float:right"><img style="align:right" class="dropdownIconTemplate" src="icons/png/customtemplate/customtemplate' +
                        idx + '.dropdown.png" alt="" /></div></td><td>' + tmpl.name + '</td></tr>');
                idx++;
            });
            ui.DropdownListSetIconAndTitle($('customtemplate'), $('customtemplate_0'));
        }
    });
};

ui.defaultSelector = 'select-last';

ui.init = function (parameters, opts)
{
    this.buttons = $$('[role=toolbar] button');
    this.ketcher_window = $$('[role=application]')[0] || $$('body')[0];
    this.client_area = $('ketcher');

	opts = new rnd.RenderOptions(opts);

	parameters = Object.extend({
		api_path: '',
		static_path: ''
	}, parameters);
	this.api_path = parameters.api_path; // move to api-side

    this.actionComplete = parameters.actionComplete || function(){};
    if (this.initialized)
    {
        this.Action.fromNewCanvas(new chem.Struct());
        this.render.update();
        this.undoStack.clear();
        this.redoStack.clear();
        this.updateHistoryButtons();
        this.selectMode(ui.defaultSelector);
        return;
    }

    this.is_osx = (navigator.userAgent.indexOf('Mac OS X') != -1);
    //this.is_touch = 'ontouchstart' in document && util.isNull(document.ontouchstart);

    // OS X specific stuff
    // if (ui.is_osx) {
    //     this.buttons.each(function (button) {
    //          if (button.title)
    //              button.title = button.title.replace("Ctrl", "Cmd");
    //     }, this);
    // }

    // Touch device stuff
    // if (ui.is_touch) {
    //     EventMap =
    //     {
    //         mousemove: 'touchmove',
    //         mousedown: 'touchstart',
    //         mouseup  : 'touchend'
    //     };

    //     // to enable copy to clipboard on iOS
    //     $('output_mol').removeAttribute('readonly');

    //     // rbalabanov: here is temporary fix for "drag issue" on iPad
    //     //BEGIN
    //     rnd.ReStruct.prototype.hiddenPaths = [];

    //     rnd.ReStruct.prototype.clearVisel = function (visel) {
    //         for (var i = 0; i < visel.paths.length; ++i) {
    //             visel.paths[i].hide();
    //             this.hiddenPaths.push(visel.paths[i]);
    //         }
    //         visel.clear();
    //     };
    //     //END
    // }

    if (['http:','https:'].indexOf(window.location.protocol) >= 0) { // don't try to knock if the file is opened locally ("file:" protocol)
        new Ajax.Request(ui.api_path + 'knocknock', {
            method: 'get',
            asynchronous : false,
            onComplete: function (res)
            {
                if (res.responseText == 'You are welcome!')
                    ui.standalone = false;
            }
        });
    }

    if (!this.standalone) {
        this.initTemplates(parameters.static_path);
        this.initDialogs();
    }

    // Document events
    //document.observe('keypress', ui.onKeyPress_Ketcher);
    //document.observe('keydown', ui.onKeyDown_IE);
    //document.observe('keyup', ui.onKeyUp);
    ui.setKeyboardShortcuts();

    // Button events
    ui.buttons.each(function (el)
    {
        ui.initButton(el);
        if (!ui.isToolButton(el))
            el.observe('click', ui.onClick_SideButton);
    });

    $$('li').each(function(el) {
        el.observe('click', function(event) {
            if (ui.hideBlurredControls())
                event.stop();

            if (this.getStyle('overflow') == 'hidden') {
                this.addClassName('opened');
                ui.dropdown_opened = this;
                event.stop();
            }
        });
    });

    $('new').observe('click', ui.onClick_NewFile);
    $('open').observe('click', ui.onClick_OpenFile);
    $('save').observe('click', ui.onClick_SaveFile);
    $('undo').observe('click', ui.onClick_Undo);
    $('redo').observe('click', ui.onClick_Redo);
    $('cut').observe('click', ui.onClick_Cut);
    $('copy').observe('click', ui.onClick_Copy);
    $('paste').observe('click', ui.onClick_Paste);
    $('zoom-in').observe('click', ui.onClick_ZoomIn);
    $('zoom-out').observe('click', ui.onClick_ZoomOut);
    $('cleanup').observe('click', ui.onClick_CleanUp);
    $('arom').observe('click', ui.onClick_Aromatize);
    $('dearom').observe('click', ui.onClick_Dearomatize);
    $('period-table').observe('click', ui.onClick_ElemTableButton);
    // $('elem_table_list').observe('click', ui.onSelect_ElemTableNotList);
    // $('elem_table_notlist').observe('click', ui.onSelect_ElemTableNotList);
    $('generic-groups').observe('click', ui.onClick_ReaGenericsTableButton); // TODO need some other way, in general tools should be pluggable
    $('info').observe('click', function (el) {
        ui.showDialog('about_dialog');
    });

    // Disable undo
    $('undo').setAttribute('disabled', true);
    $('redo').setAttribute('disabled', true);

    // Client area events
    this.client_area.observe('scroll', ui.onScroll_ClientArea);

    var zoom_list = $('zoom-list');
    while (zoom_list.options.length > 0) {
        zoom_list.options.remove(0);
    }
    for (var z = 0; z < ui.zoomValues.length; ++z) {
        var opt = document.createElement('option');
        opt.text = (100*ui.zoomValues[z]).toFixed(0) + '%';
        opt.value = z;
        zoom_list.options.add(opt);
    }
    zoom_list.selectedIndex = ui.zoomIdx;
    zoom_list.observe('change', function(){
        ui.zoomSet(zoom_list.value - 0);
        zoom_list.blur();
    });

    ui.onResize_Ketcher();
    // if (Prototype.Browser.IE) {
    //      ui.client_area.absolutize(); // Needed for clipping and scrollbars in IE
    //     ui.ketcher_window.observe('resize', ui.onResize_Ketcher);
    // }

    if (this.standalone) {
	    $$('#cleanup', '#arom', '#dearom', '#reaction-automap').each(function(el) {
            if (ui.isToolButton(el)) // .hasClassName('toolButton')
                el.setAttribute('disabled', true);
            else
                el.hide();
        });
        document.title += ' (standalone)';
    }

    // Init renderer
    opts.atomColoring = true;
    this.render =  new rnd.Render(this.client_area, ui.scale, opts);
    this.editor = new rnd.Editor(this.render);

    this.selectMode('select-lasso');

    this.render.onCanvasOffsetChanged = this.onOffsetChanged;

    ui.setScrollOffset(0, 0);
    this.render.setMolecule(this.ctab);
    this.render.update();

    this.initialized = true;
};

ui.hideBlurredControls = function () {
    if (!this.dropdown_opened)
        return false;

	this.dropdown_opened.removeClassName('opened');

	// FIX: Quick fix of Chrome (Webkit probably) box-shadow
	// repaint bug: http://bit.ly/1iiSMgy
	// needs investigation, performance
	this.client_area.style.visibility = 'hidden';
	setTimeout(function () {
		ui.client_area.style.visibility = 'visible';
	}, 0);
	// END

    var sel = this.dropdown_opened.select('li.selected');
    if (sel.length == 1) {
        //var index = sel[0].previousSiblings().size();
        var menu = this.dropdown_opened.children[0],
            margin = parseFloat(menu.getStyle('margin-top'));
        menu.setStyle({'margin-top':
                       (-sel[0].offsetTop + margin) + 'px'});
    }

    this.dropdown_opened = null;
    return true;
};

ui.isToolButton = function (el) {
    return !!el.up('#mainmenu') || el.identify() == 'period-table' ||
        el.identify() == 'generic-groups';
};

ui.initButton = function (el)
{
    el.observe('mouseover', function ()
    {
        if (this.hasAttribute('disabled'))
            return;

        //! TITLE ME, toolText
        // var status = this.getAttribute('title');
        var status = this.innerHTML;
        if (status != null)
            window.status = status;
    });
};

ui.onClick_SideButton = function ()
{
    if (this.hasAttribute('disabled'))
        return;
    ui.selectMode(this.id);
};

ui.updateHistoryButtons = function ()
{
    if (ui.undoStack.length == 0)
        $('undo').setAttribute('disabled', true);
    else
        $('undo').removeAttribute('disabled');

    if (ui.redoStack.length == 0)
        $('redo').setAttribute('disabled', true);
    else
        $('redo').removeAttribute('disabled');
};

ui.showDialog = function (name)
{
    $('window_cover').style.width = ui.ketcher_window.getWidth().toString() + 'px';
    $('window_cover').style.height = ui.ketcher_window.getHeight().toString() + 'px';
    $('window_cover').show();
    $(name).show();
};

ui.hideDialog = function (name)
{
    $(name).hide();
    $('window_cover').hide();
    $('window_cover').style.width = '0px';
    $('window_cover').style.height = '0px';
};

ui.onResize_Ketcher = function ()
{
    //if (Prototype.Browser.IE)
    //     ui.client_area.style.width = (Element.getWidth(ui.client_area.parentNode) - 2).toString() + 'px';

    // ui.client_area.style.height = (Element.getHeight(ui.client_area.parentNode) - 2).toString() + 'px';
};

//
// Main section
//
ui.updateMolecule = function (mol)
{
    if (typeof(mol) == 'undefined' || mol == null)
        return;

    ui.editor.deselectAll();

    this.addUndoAction(this.Action.fromNewCanvas(mol));

    ui.showDialog('loading');
    setTimeout(function ()
    {
        try
        {
            ui.render.onResize(); // TODO: this methods should be called in the resize-event handler
            ui.render.update();
            ui.setZoomCentered(null, ui.render.getStructCenter());
        } catch (er)
        {
            if (ui.forwardExceptions)
                throw er;
            alert(er.message);
        } finally
        {
            ui.hideDialog('loading');
        }
    }, 50);
};

ui.parseCTFile = function (molfile, check_empty_line)
{
    var lines = molfile.split('\n');

    if (lines.length > 0 && lines[0] == 'Ok.')
        lines.shift();

    try {
        try {
            return chem.Molfile.parseCTFile(lines);
        } catch (ex) {
            if (ui.forwardExceptions)
                throw ex;
            if (check_empty_line) {
                try {
                // check whether there's an extra empty line on top
                // this often happens when molfile text is pasted into the dialog window
                    return chem.Molfile.parseCTFile(lines.slice(1));
                } catch (ex1) {
                    if (ui.forwardExceptions)
                        throw ex1;
                }
                try {
                // check for a missing first line
                // this sometimes happens when pasting
                    return chem.Molfile.parseCTFile([''].concat(lines));
                } catch (ex2) {
                    if (ui.forwardExceptions)
                        throw ex2;
                }
            }
            throw ex;
        }
    } catch (er) {
        if (ui.forwardExceptions)
            throw er;
        alert("Error loading molfile.\n"+er.toString());
        return null;
    }
};

//
// Mode functions
//
// moved from 'rnd.Editor.prototype' as it concerns UI level only
// TODO: rewrite declaratively
ui.editorToolFor = function(mode) {
    if (mode == 'select-lasso') {
        return new rnd.Editor.LassoTool(this.editor, 0);
    } else if (mode == 'select-rectangle') {
        return new rnd.Editor.LassoTool(this.editor, 1);
    } else if (mode == 'select-fragment') {
        return new rnd.Editor.LassoTool(this.editor, 1, true);
    } else if (mode == 'erase') {
        return new rnd.Editor.EraserTool(this.editor, 1); // TODO last selector mode is better
    } else if (mode.startsWith('atom-')) {
        return new rnd.Editor.AtomTool(this.editor, ui.atomLabel(mode));
    } else if (mode.startsWith('bond-')) {
        return new rnd.Editor.BondTool(this.editor, ui.bondType(mode));
    } else if (mode == 'chain') {
        return new rnd.Editor.ChainTool(this.editor);
    } else if (mode.startsWith('template')) {
        return new rnd.Editor.TemplateTool(this.editor, rnd.templates[parseInt(mode.split('-')[1])]);
    } else if (mode.startsWith('customtemplate')) {
        return new rnd.Editor.TemplateTool(this.editor, rnd.customtemplates[parseInt(mode.split('-')[1])]);
    } else if (mode == 'charge-plus') {
        return new rnd.Editor.ChargeTool(this.editor, 1);
    } else if (mode == 'charge-minus') {
        return new rnd.Editor.ChargeTool(this.editor, -1);
    } else if (mode == 'sgroup') {
        return new rnd.Editor.SGroupTool(this.editor);
    } else if (mode == 'paste') {
        return new rnd.Editor.PasteTool(this.editor);
    } else if (mode == 'reaction-arrow') {
        return new rnd.Editor.ReactionArrowTool(this.editor);
    } else if (mode == 'reaction-plus') {
        return new rnd.Editor.ReactionPlusTool(this.editor);
    } else if (mode == 'reaction-map') {
        return new rnd.Editor.ReactionMapTool(this.editor);
    } else if (mode == 'reaction-unmap') {
        return new rnd.Editor.ReactionUnmapTool(this.editor);
    } else if (mode == 'rgroup-label') {
        return new rnd.Editor.RGroupAtomTool(this.editor);
    } else if (mode == 'rgroup-fragment') {
        return new rnd.Editor.RGroupFragmentTool(this.editor);
    } else if (mode == 'rgroup-attpoints') {
        return new rnd.Editor.APointTool(this.editor);
    } else if (mode.startsWith('transform-rotate')) {
        return new rnd.Editor.RotateTool(this.editor);
    }
    return null;
};

ui.selectMode = function (mode)
{
    if (mode == 'select-last')
        mode = this.selector_last || 'select-lasso';
    if (mode.startsWith('select-'))
        this.selector_last = mode;

    if (mode == 'reaction-automap') {
        ui.showAutomapProperties({
            onOk: function(mode) {
        var mol = ui.ctab;
        var implicitReaction = mol.addRxnArrowIfNecessary();
        if (mol.rxnArrows.count() == 0) {
            alert("Auto-Mapping can only be applied to reactions");
            return;
        }
        var moldata = new chem.MolfileSaver().saveMolecule(mol, true);
                new Ajax.Request(ui.api_path + 'automap',
                {
                    method: 'post',
                    asynchronous : true,
                    parameters : { moldata : moldata, mode : mode },
                    onComplete: function (res)
                    {
                        if (res.responseText.startsWith('Ok.')) {
                var resmol = ui.parseCTFile(res.responseText);
                if (implicitReaction) {
                resmol.rxnArrows.clear();
                }
/*
                            var aam = ui.parseCTFile(res.responseText);
                            var action = new ui.Action();
                            for (var aid = aam.atoms.count() - 1; aid >= 0; aid--) {
                                action.mergeWith(ui.Action.fromAtomAttrs(aid, { aam : aam.atoms.get(aid).aam }));
                            }
                            ui.addUndoAction(action, true);
*/
                            ui.updateMolecule(resmol);
/*
                            ui.render.update();
*/
                        }
                        else if (res.responseText.startsWith('Error.'))
                            alert(res.responseText.split('\n')[1]);
                        else
                            throw new Error('Something went wrong' + res.responseText);
                    }
                });
            }
        });
        return;
    }

    if (mode != null) {
        if ($(mode).hasAttribute('disabled'))
            return;

        if (ui.editor.hasSelection()) {
            if (mode == 'select-erase') {
                ui.removeSelected();
                return;
            }
            // BK: TODO: add this ability to mass-change atom labels to the keyboard handler
            if (mode.startsWith('atom-')) {
                ui.addUndoAction(ui.Action.fromAtomsAttrs(ui.editor.getSelection().atoms, ui.atomLabel(mode)), true);
                ui.render.update();
                return;
            }
        }
        /* BK: TODO: add this ability to change the bond under cursor to the editor tool
        else if (mode.startsWith('bond_')) {
            var cBond = ui.render.findClosestBond(ui.page2obj(ui.cursorPos));
            if (cBond) {
                ui.addUndoAction(ui.Action.fromBondAttrs(cBond.id, { type: ui.bondType(mode).type, stereo: chem.Struct.BOND.STEREO.NONE }), true);
                ui.render.update();
                return;
            }
        } */
        if (mode.startsWith('transform-flip-')) {
            if (mode.endsWith('h')) {
                ui.addUndoAction(ui.Action.fromFlip(ui.editor.getSelection(), 'horizontal'), true);
            } else {
                ui.addUndoAction(ui.Action.fromFlip(ui.editor.getSelection(), 'vertical'), true);
            }
            ui.render.update();
            return;
        }
    }

    if (this.mode_id != null && this.mode_id != mode) {
        var button_id = this.mode_id.split('-')[0];
        var state_button = ($(button_id) && $(button_id).hasClassName('stateButton')) || false;

        if (state_button) {
            if (mode && !mode.startsWith(button_id))
                $(button_id).removeClassName('selected');
        } else {
            $(this.mode_id).removeClassName('selected');
            $(this.mode_id).parentNode.removeClassName('selected');
        }

    }

    if (mode != 'transform-rotate')
        this.editor.deselectAll();

    if (this.render.current_tool)
        this.render.current_tool.OnCancel();

    if (mode == null) {
        this.mode_id = null;
        delete this.render.current_tool;
    } else {
        this.render.current_tool = this.editorToolFor(mode);
        this.mode_id = mode;

        button_id = this.mode_id.split('-')[0];
        state_button = ($(button_id) && $(button_id).hasClassName('stateButton')) || false;

        if (state_button)
            $(button_id).addClassName('selected');
        else {
            $(this.mode_id).addClassName('selected');
            $(this.mode_id).parentNode.addClassName('selected');
        }
    }
};

ui.bondTypeMap = {
    'single'   : {type: 1, stereo: chem.Struct.BOND.STEREO.NONE},
    'up'       : {type: 1, stereo: chem.Struct.BOND.STEREO.UP},
    'down'     : {type: 1, stereo: chem.Struct.BOND.STEREO.DOWN},
    'updown'   : {type: 1, stereo: chem.Struct.BOND.STEREO.EITHER},
    'double'   : {type: 2, stereo: chem.Struct.BOND.STEREO.NONE},
    'crossed'  : {type: 2, stereo: chem.Struct.BOND.STEREO.CIS_TRANS},
    'triple'   : {type: 3, stereo: chem.Struct.BOND.STEREO.NONE},
    'aromatic' : {type: 4, stereo: chem.Struct.BOND.STEREO.NONE},
    'singledouble'   : {type: 5, stereo: chem.Struct.BOND.STEREO.NONE},
    'singlearomatic' : {type: 6, stereo: chem.Struct.BOND.STEREO.NONE},
    'doublearomatic' : {type: 7, stereo: chem.Struct.BOND.STEREO.NONE},
    'any'      :  {type: 8, stereo: chem.Struct.BOND.STEREO.NONE}
};

ui.bondType = function (mode)
{
    var type_str;

    if (Object.isUndefined(mode))
        type_str = ui.mode_id.substr(5);
    else
        type_str = mode.substr(5);

    return ui.bondTypeMap[type_str];
};

ui.atomLabel = function (mode)
{
    var label;

    if (Object.isUndefined(mode))
        label = ui.mode_id.substr(5);
    else
        label = mode.substr(5);

    if (label == 'table')
        return ui.elem_table_obj.getAtomProps();
    if (label == 'reagenerics') // TODO need some other way, in general tools should be pluggable
        return ui.reagenerics_table_obj.getAtomProps();
    if (label == 'any')
        return {'label':'A'};
    else
        return {'label':label.capitalize()};
};

//
// New document
//
ui.onClick_NewFile = function ()
{
    if (this.hasAttribute('disabled'))
        return;

    ui.selectMode(ui.defaultSelector);

    if (!ui.ctab.isBlank()) {
        ui.addUndoAction(ui.Action.fromNewCanvas(new chem.Struct()));
        ui.render.update();
    }
};

ui.onKeyPress_Pre = function (action, event, handler, doNotStopIfCoverIsVisible) {
    util.stopEventPropagation(event); // TODO: still need this?

    if ($('window_cover').visible() && !doNotStopIfCoverIsVisible)
        return false;

    //rbalabanov: here we try to handle event using current editor tool
    //BEGIN
    if (ui && ui.render.current_tool) {
        ui.render.resetLongTapTimeout(true);
        if (ui.render.current_tool.processEvent('OnKeyPress', event, action))
            return false;
    }
    //END

    return true;
}

ui.keyboardShortcuts_OSX = {
    remove_selected: 'backspace'
}

ui.keyboardShortcuts_nonOSX = {
    remove_selected: 'delete'
}

ui.setKeyboardShortcuts = function() {
    var setShortcuts = function(action, shortcuts) {
        if (!(action in ui.keyboardActions))
            throw new Error("Keyboard action not defined for action \"" +  action + "\"");
        if (ui.is_osx)
            shortcuts = shortcuts.replace(/ctrl/g, '⌘');
        key.apply(this, [shortcuts, ui.keyboardCallbackProxy(action, function(action, event, handler) {
                if (!ui.onKeyPress_Pre(action, event, handler, ui.doNotStopIfCoverIsVisible[action]))
                    return false;
                var ret = ui.keyboardActions[action].call(this, event, handler);
                if (!ret)
                    util.preventDefault(event);
                return ret;
            })]);
    };
    util.map_each(ui.keyboardShortcuts, setShortcuts);
    util.map_each((ui.is_osx ? ui.keyboardShortcuts_OSX : ui.keyboardShortcuts_nonOSX), setShortcuts);
};

ui.keyboardShortcuts = {
    copy: 'ctrl+C',
    cut: 'ctrl+X',
    paste: 'ctrl+V',
    'zoom-in': '=, shift+=, plus, shift+plus, equals, shift+equals',
    'zoom-out': '-, minus',
    undo: 'ctrl+Z',
    redo: 'ctrl+shift+Z,ctrl+Y',
    bond_tool_any: '0',
    bond_tool_single: '1',
    bond_tool_double: '2',
    bond_tool_triple: '3',
    bond_tool_aromatic: '4',
    select_charge_tool: '5',
    selector: '`',
    atom_tool_any: 'A',
    atom_tool_h: 'H',
    atom_tool_c: 'C',
    atom_tool_n: 'N',
    atom_tool_o: 'O',
    atom_tool_s: 'S',
    atom_tool_p: 'P',
    atom_tool_f: 'F',
    atom_tool_br: 'shift+B',
    atom_tool_cl: 'shift+C',
    atom_tool_i: 'I',
    rgroup_tool_label: 'R',
    rgroup_tool_select: 'shift+R',
    select_all: 'ctrl+A',
    sgroup_tool: 'ctrl+G',
    cleanup_tool: 'ctrl+L',
    new_document: 'ctrl+N',
    open_document: 'ctrl+O',
    save_document: 'ctrl+S',
    rotate_tool: 'ctrl+R',
    template_tool: 'T',
    customtemplate_tool: 'shift+T',
    escape: 'escape',

    force_update: 'ctrl+alt+shift+R'
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
    'zoom-in': function() { ui.onClick_ZoomIn.call($('zoom-in')); },
    'zoom-out': function() { ui.onClick_ZoomOut.call($('zoom-out')); },
    copy: function() { ui.onClick_Copy.call($('copy')); },
    cut: function() { ui.onClick_Cut.call($('cut')); },
    paste: function() { ui.onClick_Paste.call($('paste')); },
    undo: function() { ui.onClick_Undo.call($('undo')); },
    redo: function() { ui.onClick_Redo.call($('redo')); },
    remove_selected: function() { if (ui.editor.hasSelection()) ui.removeSelected(); },
    bond_tool_any: function() { ui.onMouseDown_DropdownListItem.call($('bond_any')); },
    bond_tool_single: function() { ui.onMouseDown_DropdownListItem.call($(util.listNextRotate(ui.bond_tool_single_bonds, ui.mode_id))); },
    bond_tool_double: function() { ui.onMouseDown_DropdownListItem.call($(util.listNextRotate(ui.bond_tool_double_bonds, ui.mode_id))); },
    bond_tool_triple: function() { ui.onMouseDown_DropdownListItem.call($('bond_triple')); },
    bond_tool_aromatic: function() { ui.onMouseDown_DropdownListItem.call($('bond_aromatic')); },
    select_charge_tool: function() { ui.selectMode(util.listNextRotate(ui.charge_tool_modes, ui.mode_id)); },
    atom_tool_any: function() { ui.selectMode('atom_any'); },
    atom_tool_h: function() { ui.selectMode('atom_h'); },
    atom_tool_c: function() { ui.selectMode('atom_c'); },
    atom_tool_n: function() { ui.selectMode('atom_n'); },
    atom_tool_o: function() { ui.selectMode('atom_o'); },
    atom_tool_s: function() { ui.selectMode('atom_s'); },
    atom_tool_p: function() { ui.selectMode('atom_p'); },
    atom_tool_f: function() { ui.selectMode('atom_f'); },
    atom_tool_br: function() { ui.selectMode('atom_br'); },
    atom_tool_cl: function() { ui.selectMode('atom_cl'); },
    atom_tool_i: function() { ui.selectMode('atom_i'); },
    rgroup_tool_label: function() { /* do nothing here, this may be handled inside the tool */ },
    rgroup_tool_select: function() { ui.onMouseDown_DropdownListItem.call($(util.listNextRotate(ui.rgroup_tool_modes, ui.mode_id))); },
    select_all: function() { ui.selectAll(); },
    sgroup_tool: function() { ui.onClick_SideButton.call($('sgroup')); },
    cleanup_tool: function() { ui.onClick_CleanUp.call($('clean_up')); },
    new_document: function() { ui.onClick_NewFile.call($('new')); },
    open_document: function() { ui.onClick_OpenFile.call($('open')); },
    save_document: function() { ui.onClick_SaveFile.call($('save')); },
    rotate_tool: function() { ui.selectMode('transform_rotate'); },
    template_tool: function() { ui.onMouseDown_DropdownListItem.call($(util.listNextRotate(ui.template_tool_modes, ui.mode_id))); },
    customtemplate_tool: function() { if (ui.customtemplate_tool_modes.length < 1) return; ui.onMouseDown_DropdownListItem.call($(util.listNextRotate(ui.customtemplate_tool_modes, ui.mode_id))); },
    escape: function(event) { if (!$('window_cover').visible()) ui.selectMode(ui.defaultSelector); },
    selector: function() { ui.onMouseDown_DropdownListItem.call($(util.listNextRotate(ui.selector_tool_modes, ui.mode_id))); },

    // for dev purposes
    force_update: function() { ui.render.update(true); }
};

// create a proxy handler to bind "action" parameter for use in the actual handler
ui.keyboardCallbackProxy = function(action, method){
    var action_ = action;
    return (function(event, handler){
        return method.call(this, action_, event, handler);
    });
};

ui.doNotStopIfCoverIsVisible = {
    escape:true
};

//
// Open file section
//
ui.onClick_OpenFile = function ()
{
    if (this.hasAttribute('disabled'))
        return;
    ui.showDialog('open_file');
    $('radio_open_from_input').checked = true;
    $('checkbox_open_copy').checked = false;
    ui.onSelect_OpenFromInput();
};

ui.dearomatizeMolecule = function (mol, aromatize)
{
    mol = mol.clone();
    var implicitReaction = mol.addRxnArrowIfNecessary();
    var mol_string = new chem.MolfileSaver().saveMolecule(mol);

    if (!ui.standalone) {
        new Ajax.Request(ui.api_path + (aromatize ? 'aromatize' : 'dearomatize'),
        {
            method: 'post',
            asynchronous : true,
            parameters: {moldata: mol_string},
            onComplete: function (res)
            {
                if (res.responseText.startsWith('Ok.')) {
                    var resmol = ui.parseCTFile(res.responseText);
                    if (implicitReaction)
                        resmol.rxnArrows.clear();
                    ui.updateMolecule(resmol);
                } else if (res.responseText.startsWith('Error.')) {
                    alert(res.responseText.split('\n')[1]);
                } else {
                    throw new Error('Something went wrong' + res.responseText);
                }
            }
        });
    } else {
        throw new Error('Aromatization and dearomatization are not supported in the standalone mode.');
    }
};

//
// Save file section
//
ui.onClick_SaveFile = function ()
{
    if (this.hasAttribute('disabled'))
        return;
    $('file_format').value = 'mol';
    $('file_format_inchi').disabled = ui.standalone;
    ui.showDialog('save_file');
    ui.onChange_FileFormat(null);
};

//
// Zoom section
//
ui.onClick_ZoomIn = function ()
{
    if (this.hasAttribute('disabled'))
        return;
    ui.zoomSet(ui.zoomIdx + 1);
};

ui.onClick_ZoomOut = function ()
{
    if (this.hasAttribute('disabled'))
        return;
    ui.zoomSet(ui.zoomIdx - 1);
};

ui.zoomSet = function (idx)
{
    if (idx < 0 || idx >= ui.zoomValues.length)
        throw new Error ("Zoom index out of range");

    if (idx >= ui.zoomValues.length - 1)
        $('zoom-in').setAttribute('disabled', true);
    else
        $('zoom-in').removeAttribute('disabled');
    if (idx <= 0)
        $('zoom-out').setAttribute('disabled', true);
    else
        $('zoom-out').removeAttribute('disabled');
    ui.zoomIdx = idx;
    ui.setZoomCentered(ui.zoomValues[ui.zoomIdx], ui.render.getStructCenter(ui.editor.getSelection()));
    $('zoom-list').selectedIndex = ui.zoomIdx;
    ui.render.update();
};


ui.setZoomRegular = function (zoom) {
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
ui.getViewSz = function () {
    return new util.Vec2(ui.render.viewSz);
};

// c is a point in scaled coordinates, which will be positioned in the center of the view area after zooming
ui.setZoomCentered = function (zoom, c) {
    if (!c)
        throw new Error("Center point not specified");
    if (zoom) {
        ui.setZoomRegular(zoom);
    }
    ui.setScrollOffset(0, 0);
    var sp = ui.render.obj2view(c).sub(ui.render.viewSz.scaled(0.5));
    ui.setScrollOffset(sp.x, sp.y);
};

// set the reference point for the "static point" zoom (in object coordinates)
ui.setZoomStaticPointInit = function (s) {
    ui.zspObj = new util.Vec2(s);
};

// vp is the point where the reference point should now be (in view coordinates)
ui.setZoomStaticPoint = function (zoom, vp) {
    ui.setZoomRegular(zoom);
    ui.setScrollOffset(0, 0);
    var avp = ui.render.obj2view(ui.zspObj);
    var so = avp.sub(vp);
    ui.setScrollOffset(so.x, so.y);
};

ui.setScrollOffset = function (x, y) {
    var cx = ui.client_area.clientWidth;
    var cy = ui.client_area.clientHeight;
    ui.render.extendCanvas(x, y, cx + x, cy + y);
    ui.client_area.scrollLeft = x;
    ui.client_area.scrollTop = y;
    ui.scrollLeft = ui.client_area.scrollLeft; // TODO: store drag position in scaled systems
    ui.scrollTop = ui.client_area.scrollTop;
};

ui.setScrollOffsetRel = function (dx, dy) {
    ui.setScrollOffset(ui.client_area.scrollLeft + dx, ui.client_area.scrollTop + dy);
};

//
// Automatic layout
//
ui.onClick_CleanUp = function ()
{
    if (this.hasAttribute('disabled'))
        return;
    var atoms = util.array(ui.editor.getSelection(true).atoms);
    var selective = atoms.length > 0;
    if (selective) {
        var atomSet = util.Set.fromList(atoms);
        atomSetExtended = util.Set.empty();
        ui.ctab.loops.each(function(lid, loop) {
            // if selection contains any of the atoms in this loop, add all the atoms in the loop to selection
            if (util.find(loop.hbs, function(hbid) {
                return util.Set.contains(atomSet, ui.ctab.halfBonds.get(hbid).begin);
            }) >= 0)
                util.each(loop.hbs, function(hbid) {
                    util.Set.add(atomSetExtended, ui.ctab.halfBonds.get(hbid).begin);
                }, this);
        }, this);
        util.Set.mergeIn(atomSetExtended, atomSet);
        atoms = util.Set.list(atomSetExtended);
    }
    ui.editor.deselectAll();
    try {
        var aidMap = {};
        var mol = ui.ctab.clone(null, null, false, aidMap);
        if (selective) {
            util.each(atoms, function(aid){
                aid = aidMap[aid];
                var dsg = new chem.SGroup('DAT');
                var dsgid = mol.sgroups.add(dsg);
                dsg.id = dsgid;
                dsg.pp = new util.Vec2();
                dsg.data.fieldName = '_ketcher_selective_layout'
                dsg.data.fieldValue = '1'
                mol.atomAddToSGroup(dsgid, aid);
            }, this);
        }
        var implicitReaction = mol.addRxnArrowIfNecessary();
        ui.loadMolecule(new chem.MolfileSaver().saveMolecule(mol), true, false, false, implicitReaction, selective);
    } catch (er) {
        if (ui.forwardExceptions)
            throw er;
        alert("ERROR: " + er.message); // TODO [RB] ??? global re-factoring needed on error-reporting
    }
};

ui.onClick_Aromatize = function ()
{
    if (this.hasAttribute('disabled'))
        return;

    try {
        ui.dearomatizeMolecule(ui.ctab, true);
    } catch (er) {
        if (ui.forwardExceptions)
            throw er;
        alert("Molfile: " + er.message);
    }
};

ui.onClick_Dearomatize = function ()
{
    if (this.hasAttribute('disabled'))
        return;

    try {
        ui.dearomatizeMolecule(ui.ctab, false);
    } catch (er) {
        if (ui.forwardExceptions)
            throw er;
        alert("Molfile: " + er.message);
    }
};

ui.page2canvas2 = function (pos)
{
    var offset = ui.client_area.cumulativeOffset();

    return new util.Vec2(pos.pageX - offset.left, pos.pageY - offset.top);
};

ui.page2obj = function (pagePos)
{
    return ui.render.view2obj(ui.page2canvas2(pagePos));
};

ui.scrollPos = function ()
{
    return new util.Vec2(ui.client_area.scrollLeft, ui.client_area.scrollTop);
};

//
// Scrolling
//
ui.scrollLeft = null;
ui.scrollTop = null;

ui.onScroll_ClientArea = function(event)
{
    // ! DIALOG ME
    // if ($('input_label').visible())
    //      $('input_label').hide();

    ui.scrollLeft = ui.client_area.scrollLeft;
    ui.scrollTop = ui.client_area.scrollTop;

    util.stopEventPropagation(event);
};

//
// Clicking
//
ui.dbl_click = false;

ui.bondFlipRequired = function (bond, attrs) {
    return attrs.type == chem.Struct.BOND.TYPE.SINGLE &&
    bond.stereo == chem.Struct.BOND.STEREO.NONE &&
    attrs.stereo != chem.Struct.BOND.STEREO.NONE &&
    ui.ctab.atoms.get(bond.begin).neighbors.length <
    ui.ctab.atoms.get(bond.end).neighbors.length;
};

// Get new atom id/label and pos for bond being added to existing atom
ui.atomForNewBond = function (id)
{
    var neighbours = new Array();
    var pos = ui.render.atomGetPos(id);

    ui.render.atomGetNeighbors(id).each(function (nei)
    {
        var nei_pos = ui.render.atomGetPos(nei.aid);

        if (util.Vec2.dist(pos, nei_pos) < 0.1)
            return;

        neighbours.push({id: nei.aid, v: util.Vec2.diff(nei_pos, pos)});
    });

    neighbours.sort(function (nei1, nei2)
    {
        return Math.atan2(nei1.v.y, nei1.v.x) - Math.atan2(nei2.v.y, nei2.v.x);
    });

    var i, max_i = 0;
    var angle, max_angle = 0;

    // TODO: impove layout: tree, ...

    for (i = 0; i < neighbours.length; i++) {
        angle = util.Vec2.angle(neighbours[i].v, neighbours[(i + 1) % neighbours.length].v);

        if (angle < 0)
            angle += 2 * Math.PI;

        if (angle > max_angle)
            max_i = i, max_angle = angle;
    }

    var v = new util.Vec2(1, 0);

    if (neighbours.length > 0) {
        if (neighbours.length == 1) {
            max_angle = -(4 * Math.PI / 3);

            // zig-zag
            var nei = ui.render.atomGetNeighbors(id)[0];
            if (ui.render.atomGetDegree(nei.aid) > 1) {
                var nei_neighbours = new Array();
                var nei_pos = ui.render.atomGetPos(nei.aid);
                var nei_v = util.Vec2.diff(pos, nei_pos);
                var nei_angle = Math.atan2(nei_v.y, nei_v.x);

                ui.render.atomGetNeighbors(nei.aid).each(function (nei_nei) {
                    var nei_nei_pos = ui.render.atomGetPos(nei_nei.aid);

                    if (nei_nei.bid == nei.bid || util.Vec2.dist(nei_pos, nei_nei_pos) < 0.1)
                        return;

                    var v_diff = util.Vec2.diff(nei_nei_pos, nei_pos);
                    var ang = Math.atan2(v_diff.y, v_diff.x) - nei_angle;

                    if (ang < 0)
                        ang += 2 * Math.PI;

                    nei_neighbours.push(ang);
                });
                nei_neighbours.sort(function (nei1, nei2) {
                    return nei1 - nei2;
                });

                if (nei_neighbours[0] <= Math.PI * 1.01 && nei_neighbours[nei_neighbours.length-1] <= 1.01 * Math.PI)
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
ui.onOffsetChanged = function (newOffset, oldOffset)
{
    if (oldOffset == null)
        return;

    var delta = new util.Vec2(newOffset.x - oldOffset.x, newOffset.y - oldOffset.y);

    ui.client_area.scrollLeft += delta.x;
    ui.client_area.scrollTop += delta.y;
};

ui.selectAll = function ()
{
    if (!ui.ctab.isBlank()) {
        ui.selectMode($('selector').getAttribute('selid'));
        ui.editor.selectAll();
    }
};

ui.removeSelected = function ()
{
    ui.addUndoAction(ui.Action.fromFragmentDeletion());
    ui.editor.deselectAll();
    ui.render.update();
};

//
// Clipboard actions
//

ui.clipboard = null;

ui.isClipboardEmpty = function ()
{
    return ui.clipboard == null;
};

ui.updateClipboardButtons = function ()
{
    if (ui.isClipboardEmpty())
        $('paste').setAttribute('disabled', true);
    else
        $('paste').removeAttribute('disabled');

    if (ui.editor.hasSelection(true)) {
        $('copy').removeAttribute('disabled');
        $('cut').removeAttribute('disabled');
    } else {
        $('copy').setAttribute('disabled', true);
        $('cut').setAttribute('disabled', true);
    }
};

ui.copy = function (struct, selection)
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
        atoms: new Array(),
        bonds: new Array(),
        sgroups: new Array(),
        rxnArrows: new Array(),
        rxnPluses: new Array(),
        chiralFlags: new Array(),
        rgmap: {},
        rgroups: {},
        // RB: let it be here for the moment
        // TODO: "clipboard" support to be moved to editor module
        getAnchorPosition: function() {
            if (this.atoms.length) {
                var xmin = 1e50, ymin = xmin, xmax = -xmin, ymax = -ymin;
                for (var i = 0; i < this.atoms.length; i++) {
                    xmin = Math.min(xmin, this.atoms[i].pp.x); ymin = Math.min(ymin, this.atoms[i].pp.y);
                    xmax = Math.max(xmax, this.atoms[i].pp.x); ymax = Math.max(ymax, this.atoms[i].pp.y);
                }
                return new util.Vec2((xmin + xmax) / 2, (ymin + ymax) / 2); // TODO: check
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

    ui.structToClipboard(ui.clipboard, struct, selection);
    return !!ui.clipboard.getAnchorPosition();
};

ui.structToClipboard = function (clipboard, struct, selection)
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
    var fragments = util.Set.empty();
    selection.atoms.each(function (id) {
        var atom = struct.atoms.get(id);
        var frag = atom.fragment;
        atomFragments[id] = frag;
        util.Set.add(fragments, frag);
    });

    var rgids = util.Set.empty();
    util.Set.each(fragments, function(frid){
        var atoms = chem.Struct.Fragment.getAtoms(struct, frid);
        for (var i = 0; i < atoms.length; ++i)
            if (!util.Set.contains(atomFragments, atoms[i]))
                return;
        var rgid = chem.Struct.RGroup.findRGroupByFragment(struct.rgroups, frid);
        clipboard.rgmap[frid] = rgid;
        util.Set.add(rgids, rgid);
    }, this);

    util.Set.each(rgids, function(id){
        clipboard.rgroups[id] = struct.rgroups.get(id).getAttrs();
    }, this);
};

ui.onClick_Cut = function ()
{
    if (this.hasAttribute('disabled'))
        return;

    if (!ui.copy())
        return;
    ui.removeSelected();
};

ui.onClick_Copy = function ()
{
    if (this.hasAttribute('disabled'))
        return;

    if (!ui.copy())
        return;
    ui.editor.deselectAll();
};

ui.onClick_Paste = function ()
{
    if (this.hasAttribute('disabled'))
        return;
    ui.selectMode('paste');
};

ui.onClick_Undo = function ()
{
    if (this.hasAttribute('disabled'))
        return;

    ui.undo();
};

ui.onClick_Redo = function ()
{
    if (this.hasAttribute('disabled'))
        return;

    ui.redo();
};
