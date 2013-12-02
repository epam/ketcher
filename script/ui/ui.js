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

ui.api_path = '/';
ui.base_url = '';

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

ui.is_osx = false;
ui.is_touch = false;
ui.initialized = false;

//console.log = function(msg)
//{
//    new Ajax.Request(ui.api_path + 'log', {
//        method: 'post',
//        asynchronous: false,
//        parameters: {message: msg}
//    });
//};


//
// Init section
//
ui.initButton = function (el)
{
    el.observe(EventMap['mousedown'], function (event)
    {
        if (this.hasClassName('buttonDisabled'))
            return;
        this.addClassName('buttonPressed');
        // manually toggle off all active dropdowns
        ui.hideBlurredControls();
        util.stopEventPropagation(event);
    });
    el.observe(EventMap['mouseup'], function ()
    {
        this.removeClassName('buttonPressed');
    });
    el.observe('mouseover', function ()
    {
        if (this.hasClassName('buttonDisabled'))
            return;
        this.addClassName('buttonHighlight');

        var status = this.getAttribute('title');
        if (status != null)
            window.status = status;
    });
    el.observe('mouseout', function ()
    {
        this.removeClassName('buttonPressed');
        this.removeClassName('buttonHighlight');
        window.status = '';
    });
};

ui.initTemplates = function ()
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
    new Ajax.Request(ui.base_url + 'templates.sdf',
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

ui.onClick_SideButton = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;
    if (this.hasClassName('stateButton') && this.hasClassName('buttonSelected'))
    {
        ui.toggleDropdownList(this.id + '_dropdown');
    } else {
        ui.selectMode(this.getAttribute('selid') || this.id);
    }
};

ui.onClick_DropdownButton = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;
    ui.toggleDropdownList(this.id);
};

ui.DropdownListSetIconAndTitle = function(dropdown, selected) {
    dropdown.setAttribute('src', selected.select('img')[0].getAttribute('src').replace('.dropdown.','.sidebar.'));
    dropdown.title = selected.title;
}

ui.onMouseDown_DropdownListItem = function (event)
{
    ui.selectMode(this.id);
    var dropdown_mode_id = this.id.split('_')[0];
    $(dropdown_mode_id + '_dropdown_list').hide();
    if (ui.mode_id == this.id)
    {
        ui.DropdownListSetIconAndTitle($(dropdown_mode_id), this);
        $(dropdown_mode_id).setAttribute('selid', ui.mode_id);
    }
    if (event)
    {
        util.stopEventPropagation(event);
        return util.preventDefault(event);
    }
};

ui.defaultSelector = 'selector_last';

ui.init = function (parameters, opts)
{
    opts = new rnd.RenderOptions(opts);
    parameters = parameters || {};
    this.actionComplete = parameters.actionComplete || function(){};
    if (this.initialized)
    {
        this.Action.fromNewCanvas(new chem.Struct());
        this.render.update();
        this.undoStack.clear();
        this.redoStack.clear();
        this.updateActionButtons();
        this.selectMode(ui.defaultSelector);
        return;
    }

    this.is_osx = (navigator.userAgent.indexOf('Mac OS X') != -1);
    this.is_touch = 'ontouchstart' in document && util.isNull(document.ontouchstart);

    ui.api_path = parameters.ketcher_api_url || document.location.pathname.substring(0, document.location.pathname.lastIndexOf('/') + 1);
    ui.base_url = document.location.pathname.substring(0, document.location.pathname.lastIndexOf('/') + 1);

    // IE specific styles
    if (Prototype.Browser.IE)
    {
        $$('.chemicalText').each(function (el)
        {
            el.addClassName('chemicalText_IE');
        });

        // IE6
        if (navigator.userAgent.indexOf('MSIE 6.0') != -1)
        {
            $$('.dialogWindow').each(function (dlg)
            {
                dlg.style.width = "300px";
            });
        }
    }

    // OS X specific stuff
    if (ui.is_osx) {
        $$('.toolButton, .toolButton > img, .sideButton').each(function (button)
        {
            button.title = button.title.replace("Ctrl", "Cmd");
        }, this);
    }

    // Touch device stuff
    if (ui.is_touch) {
        EventMap =
        {
            mousemove: 'touchmove',
            mousedown: 'touchstart',
            mouseup  : 'touchend'
        };

        // to enable copy to clipboard on iOS
        $('output_mol').removeAttribute('readonly');

        // rbalabanov: here is temporary fix for "drag issue" on iPad
        //BEGIN
        rnd.ReStruct.prototype.hiddenPaths = [];

        rnd.ReStruct.prototype.clearVisel = function (visel) {
            for (var i = 0; i < visel.paths.length; ++i) {
                visel.paths[i].hide();
                this.hiddenPaths.push(visel.paths[i]);
            }
            visel.clear();
        };
        //END
    }

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

    if (!this.standalone)
    	this.initTemplates();

    // Document events
    //document.observe('keypress', ui.onKeyPress_Ketcher);
    //document.observe('keydown', ui.onKeyDown_IE);
    //document.observe('keyup', ui.onKeyUp);
    ui.setKeyboardShortcuts();
    document.observe(EventMap['mousedown'], ui.onMouseDown_Ketcher);
    document.observe(EventMap['mouseup'], ui.onMouseUp_Ketcher);

    // Button events
    $$('.toolButton').each(ui.initButton);
    $$('.modeButton').each(function (el)
    {
        ui.initButton(el);
        if (el.identify() != 'atom_table' && el.identify() != 'atom_reagenerics')
            el.observe('click', ui.onClick_SideButton); // TODO need some other way, in general tools should be pluggable
    });
    $$('.dropdownButton').each(function (el)
    {
        el.observe('click', ui.onClick_DropdownButton);
    });
    $$('.dropdownListItem').each(function (el)
    {
        el.observe(EventMap['mousedown'], ui.onMouseDown_DropdownListItem);
        el.observe('mouseover', function ()
        {
            this.addClassName('highlightedItem');
        });
        el.observe('mouseout', function ()
        {
            this.removeClassName('highlightedItem');
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
    $('zoom_in').observe('click', ui.onClick_ZoomIn);
    $('zoom_out').observe('click', ui.onClick_ZoomOut);
    $('clean_up').observe('click', ui.onClick_CleanUp);
    $('aromatize').observe('click', ui.onClick_Aromatize);
    $('dearomatize').observe('click', ui.onClick_Dearomatize);
    $('atom_table').observe('click', ui.onClick_ElemTableButton);
    $('elem_table_list').observe('click', ui.onSelect_ElemTableNotList);
    $('elem_table_notlist').observe('click', ui.onSelect_ElemTableNotList);
    $('atom_reagenerics').observe('click', ui.onClick_ReaGenericsTableButton); // TODO need some other way, in general tools should be pluggable

    // Client area events
    this.client_area = $('client_area');
    this.client_area.observe('scroll', ui.onScroll_ClientArea);

    // Dialog events
    $$('.dialogWindow').each(function (el)
    {
        el.observe('keypress', ui.onKeyPress_Dialog);
        el.observe('keyup', ui.onKeyPress_Dialog);
    });

    // Atom properties dialog events
    $('atom_label').observe('change', ui.onChange_AtomLabel);
    $('atom_charge').observe('change', ui.onChange_AtomCharge);
    $('atom_isotope').observe('change', ui.onChange_AtomIsotope);
    $('atom_valence').observe('change', ui.onChange_AtomValence);
    $('atom_prop_cancel').observe('click', function ()
    {
        ui.hideDialog('atom_properties');
    });
    $('atom_prop_ok').observe('click', function ()
    {
        ui.applyAtomProperties();
    });
    $('bond_prop_cancel').observe('click', function ()
    {
        ui.hideDialog('bond_properties');
    });
    $('bond_prop_ok').observe('click', function ()
    {
        ui.applyBondProperties();
    });

    // S-group properties dialog events
    $('sgroup_type').observe('change', ui.onChange_SGroupType);
    $('sgroup_label').observe('change', ui.onChange_SGroupLabel);

    // Label input events
    $('input_label').observe('blur', function ()
    {
        this.hide();
    });
    $('input_label').observe('keypress', ui.onKeyPress_InputLabel);
    $('input_label').observe('keyup', ui.onKeyUp_InputLabel);

    // Load dialog events
    $('radio_open_from_input').observe('click', ui.onSelect_OpenFromInput);
    $('radio_open_from_file').observe('click', ui.onSelect_OpenFromFile);
    $('input_mol').observe('keyup', ui.onChange_Input);
    $('input_mol').observe('click', ui.onChange_Input);
    $('read_cancel').observe('click', function ()
    {
        ui.hideDialog('open_file');
    });
    $('read_ok').observe('click', function ()
    {
        ui.loadMoleculeFromInput();
    });
    $('upload_mol').observe('submit', function ()
    {
        ui.hideDialog('open_file');
    });
    $('upload_cancel').observe('click', function ()
    {
        ui.hideDialog('open_file');
    });

    // Save dialog events
    $('file_format').observe('change', ui.onChange_FileFormat);
    $('save_ok').observe('click', function ()
    {
        ui.hideDialog('save_file');
    });


    var zoom_list = $('zoom_list');
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
        ui.zoomSet(zoom_list.value-0);
	zoom_list.blur();
    });

    ui.onResize_Ketcher();
    if (Prototype.Browser.IE) {
        ui.client_area.absolutize(); // Needed for clipping and scrollbars in IE
        $('ketcher_window').observe('resize', ui.onResize_Ketcher);
    }

    if (this.standalone) {
        $$('.serverRequired').each(function(el) {
            if (el.hasClassName('toolButton'))
                el.addClassName('buttonDisabled');
            else
                el.hide();
        });
        document.title += ' (standalone)';
    } else {
            $('upload_mol').action = ui.api_path + 'open';
            $('download_mol').action = ui.api_path + 'save';
    }

    // Init renderer
    opts.atomColoring = true;
    this.render =  new rnd.Render(this.client_area, ui.scale, opts);
    this.editor = new rnd.Editor(this.render);

    this.selectMode('selector_lasso');

    this.render.onCanvasOffsetChanged = this.onOffsetChanged;

    ui.setScrollOffset(0, 0);
    this.render.setMolecule(this.ctab);
    this.render.update();

    this.initialized = true;
};

ui.showDialog = function (name)
{
    $('window_cover').style.width = $('ketcher_window').getWidth().toString() + 'px';
    $('window_cover').style.height = $('ketcher_window').getHeight().toString() + 'px';
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

ui.toggleDropdownList = function (name)
{
    var list_id = name + '_list';
    if ($(list_id).visible())
        $(list_id).hide();
    else
        $(list_id).show();
};


ui.onResize_Ketcher = function ()
{
    if (Prototype.Browser.IE)
        ui.client_area.style.width = (Element.getWidth(ui.client_area.parentNode) - 2).toString() + 'px';

    ui.client_area.style.height = (Element.getHeight(ui.client_area.parentNode) - 2).toString() + 'px';
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
ui.selectMode = function (mode)
{
    if (mode.startsWith('selector_')) {
        if (mode == 'selector_last') {
            mode = this.selector_last || 'selector_lasso';
        } else {
            this.selector_last = mode;
        }
    }
    if (mode == 'reaction_automap') {
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
        if ($(mode).hasClassName('buttonDisabled'))
            return;

        if (ui.editor.hasSelection()) {
            if (mode == 'select_erase') {
                ui.removeSelected();
                return;
            }
            // BK: TODO: add this ability to mass-change atom labels to the keyboard handler
            if (mode.startsWith('atom_')) {
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
        if (mode.startsWith('transform_flip_')) {
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
        var button_id = this.mode_id.split('_')[0];
        var state_button = ($(button_id) && $(button_id).hasClassName('stateButton')) || false;

        if (state_button) {
            if (mode && !mode.startsWith(button_id))
                $(button_id).removeClassName('buttonSelected');
        } else
            $(this.mode_id).removeClassName('buttonSelected');
    }

    if (mode != 'transform_rotate')
        this.editor.deselectAll();

    if (this.render.current_tool)
        this.render.current_tool.OnCancel();

    if (mode == null) {
        this.mode_id = null;
        delete this.render.current_tool;
    } else {
        this.render.current_tool = this.editor.toolFor(mode);
        this.mode_id = mode;

        button_id = this.mode_id.split('_')[0];
        state_button = ($(button_id) && $(button_id).hasClassName('stateButton')) || false;

        if (state_button)
            $(button_id).addClassName('buttonSelected');
        else
            $(this.mode_id).addClassName('buttonSelected');
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
    if (this.hasClassName('buttonDisabled'))
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
    zoom_in: '=, shift+=, plus, shift+plus, equals, shift+equals',
    zoom_out: '-, minus',
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
    zoom_in: function() { ui.onClick_ZoomIn.call($('zoom_in')); },
    zoom_out: function() { ui.onClick_ZoomOut.call($('zoom_out')); },
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
}

ui.onKeyPress_Dialog = function (event)
{
    util.stopEventPropagation(event);
    if (event.keyCode === 27) {
        ui.hideDialog(this.id);
        return util.preventDefault(event);
    }
};

ui.onKeyPress_InputLabel = function (event)
{
    util.stopEventPropagation(event);
    if (event.keyCode == 13) {
        this.hide();

        var label = '';
        var charge = 0;
        var value_arr = this.value.toArray();

        if (this.value == '*') {
            label = 'A';
        }
        else if (this.value.match(/^[*][1-9]?[+-]$/i)) {
            label = 'A';

            if (this.value.length == 2)
                charge = 1;
            else
                charge = parseInt(value_arr[1]);

            if (value_arr[2] == '-')
                charge *= -1;
        }
        else if (this.value.match(/^[A-Z]{1,2}$/i)) {
            label = this.value.capitalize();
        }
        else if (this.value.match(/^[A-Z]{1,2}[0][+-]?$/i)) {
            if (this.value.match(/^[A-Z]{2}/i))
                label = this.value.substr(0, 2).capitalize();
            else
                label = value_arr[0].capitalize();
        }
        else if (this.value.match(/^[A-Z]{1,2}[1-9]?[+-]$/i)) {
            if (this.value.match(/^[A-Z]{2}/i))
                label = this.value.substr(0, 2).capitalize();
            else
                label = value_arr[0].capitalize();

            var match = this.value.match(/[0-9]/i);

            if (match != null)
                charge = parseInt(match[0]);
            else
                charge = 1;

            if (value_arr[this.value.length - 1] == '-')
                charge *= -1;
        }

        if (label == 'A' || label == 'Q' || label == 'X' || label == 'R' || chem.Element.getElementByLabel(label) != null) {
            ui.addUndoAction(ui.Action.fromAtomsAttrs(this.atom_id, {label: label, charge: charge}), true);
            ui.render.update();
        }
        return util.preventDefault(event);
    }
    if (event.keyCode == 27) {
        this.hide();
        return util.preventDefault(event);
    }
};

ui.onKeyUp_InputLabel = function (event)
{
    util.stopEventPropagation(event);
    if (event.keyCode == 27) {
        this.hide();
        return util.preventDefault(event);
    }
}

//
// Open file section
//
ui.onClick_OpenFile = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;
    ui.showDialog('open_file');
    $('radio_open_from_input').checked = true;
    $('checkbox_open_copy').checked = false;
    ui.onSelect_OpenFromInput();
};

ui.getFile = function ()
{
    var frame_body;

    if ('contentDocument' in $('buffer_frame'))
        frame_body = $('buffer_frame').contentDocument.body;
    else // IE7
        frame_body = document.frames['buffer_frame'].document.body;

    return Base64.decode(frame_body.title);
};

ui.loadMolecule = function (mol_string, force_layout, check_empty_line, paste, discardRxnArrow, selective_layout)
{
    var smiles = mol_string.strip();
    var updateFunc = function(struct) {
        if (discardRxnArrow)
            struct.rxnArrows.clear();
        if (paste) {
            (function(struct) {
                struct.rescale();
                if (!ui.copy(struct)) {
                    alert("Not a valid structure to paste");
                    return;
                }
                ui.editor.deselectAll();
                ui.selectMode('paste');
            }).call(this, struct);
        } else {
            ui.updateMolecule.call(this, struct);
        }
    }

    if (smiles.indexOf('\n') == -1) {
        if (ui.standalone) {
            if (smiles != '') {
                alert('SMILES is not supported in a standalone mode.');
            }
            return;
        }
        new Ajax.Request(ui.api_path + 'layout?smiles=' + encodeURIComponent(smiles),
        {
            method: 'get',
            asynchronous : true,
            onComplete: function (res)
            {
                if (res.responseText.startsWith('Ok.'))
                    updateFunc.call(ui, ui.parseCTFile(res.responseText));
                else if (res.responseText.startsWith('Error.'))
                    alert(res.responseText.split('\n')[1]);
                else
                    throw new Error('Something went wrong' + res.responseText);
            }
        });
    } else if (!ui.standalone && force_layout) {
        new Ajax.Request(ui.api_path + 'layout' + (selective_layout ? '?selective' : ''),
        {
            method: 'post',
            asynchronous : true,
            parameters: {moldata: mol_string},
            onComplete: function (res)
            {
                if (res.responseText.startsWith('Ok.'))
                    updateFunc.call(ui, ui.parseCTFile(res.responseText));
                else if (res.responseText.startsWith('Error.'))
                    alert(res.responseText.split('\n')[1]);
                else
                    throw new Error('Something went wrong' + res.responseText);
            }
        });
    } else {
        updateFunc.call(ui, ui.parseCTFile(mol_string, check_empty_line));
    }
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

// Called from iframe's 'onload'
ui.loadMoleculeFromFile = function ()
{
    var file = ui.getFile();
    if (file.startsWith('Ok.'))
        ui.loadMolecule(file.substr(file.indexOf('\n') + 1), false, false, $('checkbox_open_copy').checked);
};

ui.loadMoleculeFromInput = function ()
{
    if (!util.strip($('input_mol').value)) {
        alert("The inpus field is empty. Please enter a structure in SMILES or MOLFile/RXNFile format.");
        return;
    }
    ui.hideDialog('open_file');
    ui.loadMolecule($('input_mol').value, false, true, $('checkbox_open_copy').checked);
};

ui.onSelect_OpenFromInput = function ()
{
    $('open_from_input').show();
    $('open_from_file').hide();
    ui.onChange_Input.call($('input_mol'));
    $('input_mol').activate();
};

ui.onSelect_OpenFromFile = function ()
{
    $('open_from_file').show();
    $('open_from_input').hide();
    $('molfile_path').focus();
};

ui.onChange_Input = function ()
{
    var el = this;
    setTimeout(function() {
        if (el.value.strip().startsWith('InChI=') && ui.standalone) {
            alert('InChI are not supported in the standalone mode');
        } else if (el.value.strip().indexOf('\n') != -1) {
            if (el.style.wordWrap != 'normal')
                el.style.wordWrap = 'normal';
        } else {
            if (el.style.wordWrap != 'break-word')
                el.style.wordWrap = 'break-word';
        }
    }, 200);
};

//
// Save file section
//
ui.onClick_SaveFile = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;
    $('file_format').value = 'mol';
    $('file_format_inchi').disabled = ui.standalone;
    ui.showDialog('save_file');
    ui.onChange_FileFormat(null);
};

ui.onChange_FileFormat = function (event)
{
    var format = $('file_format').value;
    var output = $('output_mol');
    try {
        if (format == 'mol') {
            output.value = new chem.MolfileSaver().saveMolecule(ui.ctab);
            output.style.wordWrap = 'normal';
        } else if (format == 'smi') {
            output.value = new chem.SmilesSaver().saveMolecule(ui.ctab);
            output.style.wordWrap = 'break-word';
        } else if (format == 'inchi') {
            output.value = new chem.InChiSaver().saveMolecule(ui.ctab);
            output.style.wordWrap = 'break-word';
        } else {
            //noinspection ExceptionCaughtLocallyJS
            throw { message : 'Unsupported data format' };
        }
    } catch (er) {
        if (ui.forwardExceptions)
            throw er;
        output.value = '';
        ui.hideDialog('save_file');
        alert('ERROR: ' + er.message);
    }
    $('mol_data').value = format + '\n' + output.value;
    output.activate();
};

//
// Zoom section
//
ui.onClick_ZoomIn = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;
    ui.zoomSet(ui.zoomIdx + 1);
};

ui.onClick_ZoomOut = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;
    ui.zoomSet(ui.zoomIdx - 1);
};

ui.zoomSet = function (idx)
{
    if (idx < 0 || idx >= ui.zoomValues.length)
        throw new Error ("Zoom index out of range");

    if (idx >= ui.zoomValues.length - 1)
        $('zoom_in').addClassName('buttonDisabled');
    else
        $('zoom_in').removeClassName('buttonDisabled');
    if (idx <= 0)
        $('zoom_out').addClassName('buttonDisabled');
    else
        $('zoom_out').removeClassName('buttonDisabled');
    ui.zoomIdx = idx;
    ui.setZoomCentered(ui.zoomValues[ui.zoomIdx], ui.render.getStructCenter(ui.editor.getSelection()));
    zoom_list.selectedIndex = ui.zoomIdx;
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
    if (this.hasClassName('buttonDisabled'))
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
    if (this.hasClassName('buttonDisabled'))
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
    if (this.hasClassName('buttonDisabled'))
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
    if ($('input_label').visible())
        $('input_label').hide();

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

ui.hideBlurredControls = function ()
{
    var ret = false;
    [
        'input_label',
        'selector_dropdown_list',
        'bond_dropdown_list',
        'template_dropdown_list',
        'customtemplate_dropdown_list',
        'reaction_dropdown_list',
        'rgroup_dropdown_list',
        'transform_dropdown_list'
    ].each(
        function(el) { el = $(el); if (el.visible()) { el.hide(); ret = true; }}
    );
    return ret;
};

ui.onMouseDown_Ketcher = function (event)
{
    ui.hideBlurredControls();
    //util.stopEventPropagation(event);
};

ui.onMouseUp_Ketcher = function (event)
{
    util.stopEventPropagation(event);
};

//
// Atom attachment points dialog
//
ui.showAtomAttachmentPoints = function(params)
{
    $('atom_ap1').checked = ((params.selection || 0) & 1) > 0;
    $('atom_ap2').checked = ((params.selection || 0) & 2) > 0;
    ui.showDialog('atom_attpoints');
    var _onOk = new Event.Handler('atom_attpoints_ok', 'click', undefined, function() {
        _onOk.stop();
        _onCancel.stop();
        ui.hideDialog('atom_attpoints');
        if ('onOk' in params) params['onOk'](($('atom_ap1').checked ? 1 : 0) + ($('atom_ap2').checked ? 2 : 0));
    }).start();
    var _onCancel = new Event.Handler('atom_attpoints_cancel', 'click', undefined, function() {
        _onOk.stop();
        _onCancel.stop();
        ui.hideDialog('atom_attpoints');
        if ('onCancel' in params) params['onCancel']();
    }).start();
    $('atom_attpoints_ok').focus();
};

//
// Atom properties dialog
//
ui.showAtomProperties = function (id)
{
    $('atom_properties').atom_id = id;
    $('atom_label').value = ui.render.atomGetAttr(id, 'label');
    ui.onChange_AtomLabel.call($('atom_label'));
    var value = ui.render.atomGetAttr(id, 'charge') - 0;
    $('atom_charge').value = (value == 0 ? '' : value);
    value = ui.render.atomGetAttr(id, 'isotope') - 0;
    $('atom_isotope').value = (value == 0 ? '' : value);
    value = ui.render.atomGetAttr(id, 'explicitValence') - 0;
    $('atom_valence').value =  value < 0 ? '' : value;
    $('atom_radical').value = ui.render.atomGetAttr(id, 'radical');

    $('atom_inversion').value = ui.render.atomGetAttr(id, 'invRet');
    $('atom_exactchange').value = ui.render.atomGetAttr(id, 'exactChangeFlag') ? 1 : 0;
    $('atom_ringcount').value = ui.render.atomGetAttr(id, 'ringBondCount');
    $('atom_substitution').value = ui.render.atomGetAttr(id, 'substitutionCount');
    $('atom_unsaturation').value = ui.render.atomGetAttr(id, 'unsaturatedAtom');
    $('atom_hcount').value = ui.render.atomGetAttr(id, 'hCount');

    ui.showDialog('atom_properties');
    $('atom_label').activate();
};

ui.applyAtomProperties = function ()
{
    ui.hideDialog('atom_properties');

    var id = $('atom_properties').atom_id;

    ui.addUndoAction(ui.Action.fromAtomsAttrs(id,
    {
        label: $('atom_label').value,
        charge: $('atom_charge').value == '' ? 0 : parseInt($('atom_charge').value),
        isotope: $('atom_isotope').value == '' ? 0 : parseInt($('atom_isotope').value),
        explicitValence: $('atom_valence').value == '' ? -1 : parseInt($('atom_valence').value),
        radical: parseInt($('atom_radical').value),
        // reaction flags
        invRet: parseInt($('atom_inversion').value),
        exactChangeFlag: parseInt($('atom_exactchange').value) ? true : false,
        // query flags
        ringBondCount: parseInt($('atom_ringcount').value),
        substitutionCount: parseInt($('atom_substitution').value),
        unsaturatedAtom: parseInt($('atom_unsaturation').value),
        hCount: parseInt($('atom_hcount').value)
    }), true);

    ui.render.update();
};

ui.onChange_AtomLabel = function ()
{
    this.value = this.value.strip().capitalize();

    var element = chem.Element.getElementByLabel(this.value);

    if (element == null && this.value != 'A' && this.value != '*' && this.value != 'Q' && this.value != 'X' && this.value != 'R') {
        this.value = ui.render.atomGetAttr($('atom_properties').atom_id, 'label');

        if (this.value != 'A' && this.value != '*')
            element = chem.Element.getElementByLabel(this.value);
    }

    if (this.value == 'A' || this.value == '*')
        $('atom_number').value = "any";
    else if (!element)
        $('atom_number').value = "";
    else
        $('atom_number').value = element.toString();
};

ui.onChange_AtomCharge = function ()
{
    if (this.value.strip() == '' || this.value == '0')
        this.value = '';
    else if (this.value.match(/^[1-9][0-9]{0,1}[-+]$/))
        this.value = (this.value.endsWith('-') ? '-' : '') + this.value.substr(0, this.value.length - 1);
    else if (!this.value.match(/^[+-]?[1-9][0-9]{0,1}$/))
        this.value = ui.render.atomGetAttr($('atom_properties').atom_id, 'charge');
};

ui.onChange_AtomIsotope = function ()
{
    if (this.value == util.getElementTextContent($('atom_number')) || this.value.strip() == '' || this.value == '0')
        this.value = '';
    else if (!this.value.match(/^[1-9][0-9]{0,2}$/))
        this.value = ui.render.atomGetAttr($('atom_properties').atom_id, 'isotope');
};

ui.onChange_AtomValence = function ()
{
    /*
    if (this.value.strip() == '')
        this.value = '';
    else if (!this.value.match(/^[0-9]$/))
        this.value = ui.render.atomGetAttr($('atom_properties').atom_id, 'valence');
    */
};

//
// Bond properties dialog
//
ui.showBondProperties = function (id)
{
    $('bond_properties').bond_id = id;

    var type = ui.render.bondGetAttr(id, 'type');
    var stereo = ui.render.bondGetAttr(id, 'stereo');

    for (var bond in ui.bondTypeMap) {
        if (ui.bondTypeMap[bond].type == type && ui.bondTypeMap[bond].stereo == stereo)
            break;
    }

    $('bond_type').value = bond;
    $('bond_topology').value = ui.render.bondGetAttr(id, 'topology') || 0;
    $('bond_center').value = ui.render.bondGetAttr(id, 'reactingCenterStatus') || 0;

    ui.showDialog('bond_properties');
    $('bond_type').activate();
};

ui.applyBondProperties = function ()
{
    ui.hideDialog('bond_properties');

    var id = $('bond_properties').bond_id;
    var bond = Object.clone(ui.bondTypeMap[$('bond_type').value]);

    bond.topology = parseInt($('bond_topology').value);
    bond.reactingCenterStatus = parseInt($('bond_center').value);

    ui.addUndoAction(ui.Action.fromBondAttrs(id, bond), true);

    ui.render.update();
};

//
// S-Group properties
//
ui.showSGroupProperties = function (id, tool, selection, onOk, onCancel)
{
    if (!tool) {
        throw new Error("Tool not specified. Note: this method should only be invoked by rnd.Editor.SGroupTool.SGroupHelper, all other usages are obsolete.");
    }
    if ($('sgroup_properties').visible())
        return;

    var type = (id == null) ? 'GEN' : ui.render.sGroupGetType(id);

    $('sgroup_properties').sgroup_id = id;
    $('sgroup_type').value = type;
    ui.onChange_SGroupType.call($('sgroup_type'));

    switch (type)
    {
    case 'SRU':
        $('sgroup_connection').value = ui.render.sGroupGetAttr(id, 'connectivity');
        $('sgroup_label').value = ui.render.sGroupGetAttr(id, 'subscript');
        break;
    case 'MUL':
        $('sgroup_label').value = ui.render.sGroupGetAttr(id, 'mul');
        break;
    case 'SUP':
        $('sgroup_label').value = ui.render.sGroupGetAttr(id, 'name');
        break;
    case 'DAT':
        $('sgroup_field_name').value = ui.render.sGroupGetAttr(id, 'fieldName');
        $('sgroup_field_value').value = ui.render.sGroupGetAttr(id, 'fieldValue');
        var isAttached = ui.render.sGroupGetAttr(id, 'attached');
        var isAbsolute = ui.render.sGroupGetAttr(id, 'absolute');
        (isAttached ? $('sgroup_pos_attached') : (isAbsolute ? $('sgroup_pos_absolute') : $('sgroup_pos_relative'))).checked = true;
        break;
    }

    if (type != 'DAT')
    {
        $('sgroup_field_name').value = '';
        $('sgroup_field_value').value = '';
    }

    var onClickCancel = function ()
    {
        ui.hideDialog('sgroup_properties');
        resetListeners();
        onCancel.call(tool);
    };

    var onClickOk = function ()
    {
        ui.hideDialog('sgroup_properties');
        var id = $('sgroup_properties').sgroup_id;

        var type = $('sgroup_type').value;
        var attrs =
        {
            mul: null,
            connectivity: '',
            name: '',
            subscript: '',
            fieldName: '',
            fieldValue: ''
        };

        switch (type)
        {
        case 'SRU':
            attrs.connectivity = $('sgroup_connection').value.strip();
            attrs.subscript = $('sgroup_label').value.strip();
            if (attrs.subscript.length != 1 || !attrs.subscript.match(/^[a-zA-Z]$/)) {
                alert(attrs.subscript.length ? "SRU subscript should consist of a single letter." : "Please provide an SRU subscript.");
                ui.showDialog('sgroup_properties');
                return;
            }
            break;
        case 'MUL':
            attrs.mul = parseInt($('sgroup_label').value);
            break;
        case 'SUP':
            attrs.name = $('sgroup_label').value.strip();
            if (!attrs.name) {
                alert("Please provide a name for the superatom.");
                ui.showDialog('sgroup_properties');
                return;
            }
            break;
        case 'DAT':
            attrs.fieldName = $('sgroup_field_name').value.strip();
            attrs.fieldValue = $('sgroup_field_value').value.strip();
            attrs.absolute = $('sgroup_pos_absolute').checked;
            attrs.attached = $('sgroup_pos_attached').checked;

            if (attrs.fieldName == '' || attrs.fieldValue == '') {
                alert("Please, specify data field name and value.");
                ui.showDialog('sgroup_properties');
                return;
            }
            break;
        }

        resetListeners();
        onOk.call(tool, id, type, attrs);
    };

    var resetListeners = function () {
        $('sgroup_prop_cancel').stopObserving('click', onClickCancel);
        $('sgroup_prop_ok').stopObserving('click', onClickOk);
    };

    $('sgroup_prop_cancel').observe('click', onClickCancel);
    $('sgroup_prop_ok').observe('click', onClickOk);

    ui.showDialog('sgroup_properties');
    ui.sGroupDlgSelection = selection;
    $('sgroup_type').activate();
};

ui.onChange_SGroupLabel = function ()
{
    if ($('sgroup_type').value == 'MUL' && !this.value.match(/^[1-9][0-9]{0,2}$/))
        this.value = '1';
};

ui.onChange_SGroupType = function ()
{
    var type = $('sgroup_type').value;

    if (type == 'DAT') {
        $$('.generalSGroup').each(function (el) {el.hide()});
        $$('.dataSGroup').each(function (el) {el.show()});

        return;
    }

    $$('.generalSGroup').each(function (el) {el.show()});
    $$('.dataSGroup').each(function (el) {el.hide()});

    $('sgroup_label').disabled = (type != 'SRU') && (type != 'MUL') && (type != 'SUP');
    $('sgroup_connection').disabled = (type != 'SRU');

    if (type == 'MUL' && !$('sgroup_label').value.match(/^[1-9][0-9]{0,2}$/))
        $('sgroup_label').value = '1';
    else if (type == 'SRU')
        $('sgroup_label').value = 'n';
    else if (type == 'GEN' || type == 'SUP')
        $('sgroup_label').value = '';
};

//
// Reaction auto-mapping
//

ui.showAutomapProperties = function(params)
{
    ui.showDialog('automap_properties');

    var _onOk = new Event.Handler('automap_ok', 'click', undefined, function() {
        _onOk.stop();
        _onCancel.stop();
        if (params && 'onOk' in params) params['onOk']($('automap_mode').value);
        ui.hideDialog('automap_properties');
    }).start();
    var _onCancel = new Event.Handler('automap_cancel', 'click', undefined, function() {
        _onOk.stop();
        _onCancel.stop();
        ui.hideDialog('automap_properties');
        if (params && 'onCancel' in params) params['onCancel']();
    }).start();

    $('automap_mode').activate();
};

//
// Element table
//

ui.onClick_ElemTableButton = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;
    ui.showElemTable({
        onOk: function() {
            ui.onClick_SideButton.apply($('atom_table'));
            return true;
        },
        onCancel: function() {
            ui.elem_table_obj.restore();
        }
    });
};


ui.showElemTable = function(params)
{
    if (!$('elem_table').visible()) {
        params = params || {};
        ui.showDialog('elem_table');
        if (typeof(ui.elem_table_obj) == 'undefined') {
            ui.elem_table_obj = new rnd.ElementTable('elem_table_area', {
                'fillColor':'#DADADA',
                'fillColorSelected':'#FFFFFF',
                'frameColor':'#E8E8E8',
                'fontSize':23,
                'buttonHalfSize':18
            }, true);
            ui.elem_table_area = ui.elem_table_obj.renderTable();
            $('elem_table_single').checked = true;
        }
        ui.elem_table_obj.store();
        ui.elem_table_obj.setSelection(params.selection);
        var _onOk = new Event.Handler('elem_table_ok', 'click', undefined, function() {
            if (!params || !('onOk' in params) || params['onOk'](ui.elem_table_obj.getAtomProps())) {
                _onOk.stop(); _onCancel.stop();
                ui.hideDialog('elem_table');
            }
        }).start();
        var _onCancel = new Event.Handler('elem_table_cancel', 'click', undefined, function() {
            _onOk.stop(); _onCancel.stop();
            ui.hideDialog('elem_table');
            if (params && 'onCancel' in params) params['onCancel']();
        }).start();
        $('elem_table_ok').focus();
    }
};


ui.showRGroupTable = function(params)
{
    if (!$('rgroup_table').visible()) {
        params = params || {};
        ui.showDialog('rgroup_table');
        if (typeof(ui.rgroup_table_obj) == 'undefined') {
            ui.rgroup_table_obj = new rnd.RGroupTable('rgroup_table_area', {
                'fillColor':'#DADADA',
                'fillColorSelected':'#FFFFFF',
                'frameColor':'#E8E8E8',
                'fontSize':18,
                'buttonHalfSize':18
            }, true);
        }
        ui.rgroup_table_obj.setMode(params.mode || 'multiple');
        ui.rgroup_table_obj.setSelection(params.selection || 0);
        var _onOk = new Event.Handler('rgroup_table_ok', 'click', undefined, function() {
            _onOk.stop();
            _onCancel.stop();
            ui.hideDialog('rgroup_table');
            if ('onOk' in params) params['onOk'](ui.rgroup_table_obj.selection);
        }).start();
        var _onCancel = new Event.Handler('rgroup_table_cancel', 'click', undefined, function() {
            _onOk.stop();
            _onCancel.stop();
            ui.hideDialog('rgroup_table');
            if ('onCancel' in params) params['onCancel']();
        }).start();
        $('rgroup_table_ok').focus();
    }
};

ui.showRLogicTable = function(params)
{
    params = params || {};
    params.rlogic = params.rlogic || {};
    $('rlogic_occurrence').value = params.rlogic.occurrence || '>0';
    $('rlogic_resth').value = params.rlogic.resth ? '1' : '0';
    var ifOptHtml = '<option value="0">Always</option>';
    for (var r = 1; r <= 32; r++) if (r != params.rgid && 0 != (params.rgmask & (1 << (r - 1)))) {
        ifOptHtml += '<option value="' + r + '">IF R' + params.rgid + ' THEN R' + r + '</option>';
    }
    $('rlogic_if').outerHTML = '<select id="rlogic_if">' + ifOptHtml + '</select>'; // [RB] thats tricky because IE8 fails to set innerHTML
    $('rlogic_if').value = params.rlogic.ifthen;
    ui.showDialog('rlogic_table');

    var _onOk = new Event.Handler('rlogic_ok', 'click', undefined, function() {
        var result = {
            'occurrence' : $('rlogic_occurrence').value
                .replace(/\s*/g, '').replace(/,+/g, ',').replace(/^,/, '').replace(/,$/, ''),
            'resth' : $('rlogic_resth').value == '1',
            'ifthen' : parseInt($('rlogic_if').value)
        };
        if (!params || !('onOk' in params) || params['onOk'](result)) {
            _onOk.stop();
            _onCancel.stop();
            ui.hideDialog('rlogic_table');
        }
    }).start();
    var _onCancel = new Event.Handler('rlogic_cancel', 'click', undefined, function() {
        _onOk.stop();
        _onCancel.stop();
        ui.hideDialog('rlogic_table');
        if (params && 'onCancel' in params) params['onCancel']();
    }).start();

    $('rlogic_occurrence').activate();
};

ui.onSelect_ElemTableNotList = function ()
{
    try {
        ui.elem_table_obj.updateAtomProps();
    } catch(e) {
        if (ui.forwardExceptions)
            throw e;
        ErrorHandler.handleError(e);
    }
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
        $('paste').addClassName('buttonDisabled');
    else
        $('paste').removeClassName('buttonDisabled');

    if (ui.editor.hasSelection(true)) {
        $('copy').removeClassName('buttonDisabled');
        $('cut').removeClassName('buttonDisabled');
    } else {
        $('copy').addClassName('buttonDisabled');
        $('cut').addClassName('buttonDisabled');
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
    if (this.hasClassName('buttonDisabled'))
        return;

    if (!ui.copy())
        return;
    ui.removeSelected();
};

ui.onClick_Copy = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;

    if (!ui.copy())
        return;
    ui.editor.deselectAll();
};

ui.onClick_Paste = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;
    ui.selectMode('paste');
};

ui.onClick_Undo = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;

    ui.undo();
};

ui.onClick_Redo = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;

    ui.redo();
};

ui.showLabelEditor = function(aid)
{
    // TODO: RB: to be refactored later, need to attach/detach listeners here as anon-functions, not on global scope (ui.onKeyPress_InputLabel, onBlur, etc)
    var input_el = $('input_label');

    var offset = Math.min(6 * ui.zoom, 16);

    input_el.atom_id = aid;
    input_el.value = ui.render.atomGetAttr(aid, 'label');
    input_el.style.fontSize = (offset * 2).toString() + 'px';

    input_el.show();

    var atom_pos = ui.render.obj2view(ui.render.atomGetPos(aid));
    var offset_client = ui.client_area.cumulativeOffset();
    var offset_parent = Element.cumulativeOffset(input_el.offsetParent);
    var d = 0; // TODO: fix/Math.ceil(4 * ui.abl() / 100);
    input_el.style.left = (atom_pos.x + offset_client.left - offset_parent.left - offset - d).toString() + 'px';
    input_el.style.top = (atom_pos.y + offset_client.top - offset_parent.top - offset - d).toString() + 'px';

    input_el.activate();
};
