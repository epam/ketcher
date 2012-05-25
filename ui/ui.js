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

ui.path = '/';
ui.base_url = '';

ui.scale = 40;

ui.zoomValues = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
ui.zoomIdx = ui.zoomValues.indexOf(1.0);
ui.zoom = 1.0;

ui.DBLCLICK_INTERVAL = 300;

ui.HISTORY_LENGTH = 8;

ui.DEBUG = false;

ui.render = null;

ui.ctab = new chem.Struct();

ui.client_area = null;
ui.mode_id = null;

ui.undoStack = new Array();
ui.redoStack = new Array();

ui.is_osx = false;
ui.initialized = false;

ui.MODE = {SIMPLE: 1, ERASE: 2, ATOM: 3, BOND: 4, PATTERN: 5, SGROUP: 6, PASTE: 7, CHARGE: 8, RXN_ARROW: 9, RXN_PLUS: 10, CHAIN: 11};

ui.patterns =
{
    six1: [1, 2, 1, 2, 1, 2],
    six2: [1, 1, 1, 1, 1, 1],
    //sixa: [4, 4, 4, 4, 4, 4],
    five: [1, 1, 1, 1, 1]
};

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

ui.onClick_SideButton = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;
    if (this.hasClassName('buttonSelected'))
        ui.toggleDropdownList(this.id + '_dropdown');
    else
        ui.selectMode(this.getAttribute('selid') || this.id);
};

ui.onClick_DropdownButton = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;
    ui.toggleDropdownList(this.id);
};

ui.onMouseDown_DropdownListItem = function (event)
{
    ui.selectMode(this.id);
    var dropdown_mode_id = this.id.split('_')[0];
    $(dropdown_mode_id + '_dropdown_list').hide();
    if (ui.mode_id == this.id)
    {
        if ($(dropdown_mode_id).getAttribute('src')) {
            $(dropdown_mode_id).setAttribute('src', this.select('img')[0].getAttribute('src'));
        } else {
            ketcher.showMolfileOpts(dropdown_mode_id, ketcher.templates[ui.mode_id], 20, {
                'autoScale':true,
                'autoScaleMargin':4,
                'hideImplicitHydrogen':true,
                'hideTerminalLabels':true,
                'ignoreMouseEvents':true
            });
        }
        $(dropdown_mode_id).title = this.title;
        $(dropdown_mode_id).setAttribute('selid', ui.mode_id);
    }
    if (event)
    {
        util.stopEventPropagation(event);
        return util.preventDefault(event);
    }
};

ui.defaultSelector = 'selector_lasso';

ui.init = function ()
{
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
    if (ui.is_osx)
    {
        $$('.toolButton, .toolButton > img, .sideButton').each(function (button)
        {
            button.title = button.title.replace("Ctrl", "Cmd");
        }, this);
    }

    // Document events
    document.observe('keypress', ui.onKeyPress_Ketcher);
    document.observe('keydown', ui.onKeyDown_IE);
    document.observe('keyup', ui.onKeyUp);
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
        el.observe('keyup', ui.onKeyUp);
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
    $('input_label').observe('keyup', ui.onKeyUp);

    // Element table
    $('elem_table_cancel').observe('click', function ()
    {
        ui.elem_table_obj.restore();
        ui.hideDialog('elem_table');
    });
    $('elem_table_ok').observe('click', function (event)
    {
        ui.hideDialog('elem_table');
        ui.onClick_SideButton.apply($('atom_table'), [event]);
    });

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

    ui.onResize_Ketcher();
    if (Prototype.Browser.IE)
    {
        ui.client_area.absolutize(); // Needed for clipping and scrollbars in IE
        $('ketcher_window').observe('resize', ui.onResize_Ketcher);
    }

    ui.path = document.location.pathname.substring(0, document.location.pathname.lastIndexOf('/') + 1);
    ui.base_url = document.location.href.substring(0, document.location.href.lastIndexOf('/') + 1);

    new Ajax.Request(ui.path + 'knocknock',
    {
        method: 'get',
        asynchronous : false,
        onComplete: function (res)
        {
            if (res.responseText == 'You are welcome!')
                ui.standalone = false;
        }
    });

    if (this.standalone)
    {
        $$('.serverRequired').each(function (el)
        {
            if (el.hasClassName('toolButton'))
                el.addClassName('buttonDisabled');
            else
                el.hide();
        });
        document.title += ' (standalone)';
    } else
    {
        if (ui.path != '/')
        {
            $('upload_mol').action = ui.base_url + 'open';
            $('download_mol').action = ui.base_url + 'save';
        }
    }

    // Init renderer
    this.render =  new rnd.Render(this.client_area, ui.scale, {atomColoring: true});
    this.editor = new rnd.Editor(this.render);

    this.selectMode('selector_lasso');

    this.render.onAtomClick = this.onClick_Atom;
    this.render.onAtomDblClick = this.onDblClick_Atom;
    this.render.onAtomMouseDown = this.onMouseDown_Atom;
    this.render.onAtomMouseOver = this.onMouseOver_Atom;
    this.render.onAtomMouseOut = this.onMouseOut_Atom;

    this.render.onRxnArrowClick = this.onClick_RxnArrow;
    //this.render.onRxnArrowDblClick = this.onDblClick_RxnArrow;
    this.render.onRxnArrowMouseDown = this.onMouseDown_RxnArrow;
    //this.render.onRxnArrowMouseOver = this.onMouseOver_RxnArrow;
    //this.render.onRxnArrowMouseOut = this.onMouseOut_RxnArrow;

    this.render.onRxnPlusClick = this.onClick_RxnPlus;
    //this.render.onRxnPlusDblClick = this.onDblClick_RxnPlus;
    this.render.onRxnPlusMouseDown = this.onMouseDown_RxnPlus;
    //this.render.onRxnPlusMouseOver = this.onMouseOver_RxnPlus;
    //this.render.onRxnPlusMouseOut = this.onMouseOut_RxnPlus;

    this.render.onBondClick = this.onClick_Bond;
    this.render.onBondDblClick = this.onDblClick_Bond;
    this.render.onBondMouseDown = this.onMouseDown_Bond;
    this.render.onBondMouseOver = this.onMouseOver_Bond;
    this.render.onBondMouseOut = this.onMouseOut_Bond;

    this.render.onCanvasClick = this.onClick_Canvas;
    this.render.onCanvasMouseMove = this.onMouseMove_Canvas;
    this.render.onCanvasMouseDown = this.onMouseDown_Canvas;
    this.render.onCanvasOffsetChanged = this.onOffsetChanged;

    this.render.onSGroupClick = this.onClick_SGroup;
    this.render.onSGroupDblClick = this.onDblClick_SGroup;
    this.render.onSGroupMouseDown = function () {return true;};
    this.render.onSGroupMouseOver = this.onMouseOver_SGroup;
    this.render.onSGroupMouseOut = this.onMouseOut_SGroup;

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
    {
        $(list_id).show();
        if ($(list_id).hasClassName('renderFirst'))
        {
            var renderOpts = {
                'autoScale':true,
                'autoScaleMargin':4,
                'hideImplicitHydrogen':true,
                'hideTerminalLabels':true
            };

            $(list_id).select("tr").each(function (item)
            {
                if ($(item.id + '_preview'))
                    ketcher.showMolfileOpts(item.id + '_preview', ketcher.templates[item.id], 20, renderOpts);
            });

            $(list_id).removeClassName('renderFirst');
        }
    }
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

    if (ui.selected())
        ui.updateSelection();

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
            alert(er.message);
        } finally
        {
            ui.hideDialog('loading');
        }
    }, 50);
};

ui.parseCTFile = function (molfile)
{
    var lines = molfile.split('\n');

    if (lines.length > 0 && lines[0] == 'Ok.')
        lines.shift();

    try
    {
        return chem.Molfile.parseCTFile(lines);
    } catch (er)
    {
        alert("Error loading molfile.\n"+er.toString());
        return null;
    }
};

//
// Mode functions
//
ui.selectMode = function (mode)
{
    if (mode == 'reaction_automap') {
        ui.showAutomapProperties({
            onOk: function(mode) {
                var moldata = new chem.MolfileSaver().saveMolecule(ui.ctab/*.clone()*/, true);
                new Ajax.Request(ui.path + 'automap',
                {
                    method: 'post',
                    asynchronous : true,
                    parameters : { moldata : moldata, mode : mode },
                    onComplete: function (res)
                    {
                        if (res.responseText.startsWith('Ok.')) {
/*
                            var aam = ui.parseCTFile(res.responseText);
                            var action = new ui.Action();
                            for (var aid = aam.atoms.count() - 1; aid >= 0; aid--) {
                                action.mergeWith(ui.Action.fromAtomAttrs(aid, { aam : aam.atoms.get(aid).aam }));
                            }
                            ui.addUndoAction(action, true);
*/
                            ui.updateMolecule(ui.parseCTFile(res.responseText));
/*
                            ui.render.update();
*/
                        }
                    }
                });
            }
        });
        return;
    }

    if (mode != null)
    {
        if ($(mode).hasClassName('buttonDisabled'))
            return;

        if (ui.selected()) {
            if (mode == 'select_erase') {
                ui.removeSelected();
                return;
            }
            // BK: TODO: add this ability to mass-change atom labels to the keyboard handler
            if (mode.startsWith('atom_')) {
                ui.addUndoAction(ui.Action.fromSelectedAtomsAttrs(ui.atomLabel(mode)), true);
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

ui.modeType = function ()
{
    if (ui.mode_id == null)
        return ui.MODE.PASTE;
    if (ui.mode_id == 'select_simple')
        return ui.MODE.SIMPLE;
    if (ui.mode_id == 'select_erase')
        return ui.MODE.ERASE;
    if (ui.mode_id.startsWith('atom_'))
        return ui.MODE.ATOM;
    if (ui.mode_id.startsWith('charge_'))
        return ui.MODE.CHARGE;
    if (ui.mode_id.startsWith('bond_'))
        return ui.MODE.BOND;
    if (ui.mode_id == 'sgroup')
        return ui.MODE.SGROUP;
    if (ui.mode_id.startsWith('pattern_'))
        return ui.MODE.PATTERN;
    if (ui.mode_id == 'rxn_arrow')
        return ui.MODE.RXN_ARROW;
    if (ui.mode_id == 'rxn_plus')
        return ui.MODE.RXN_PLUS;
    if (ui.mode_id == 'chain')
        return ui.MODE.CHAIN;
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

ui.pattern = function ()
{
    return ui.patterns[ui.mode_id.substr(8)];
};

//
// New document
//
ui.onClick_NewFile = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;

    ui.selectMode(ui.defaultSelector);

    if (!ui.ctab.isBlank())
    {
        ui.addUndoAction(ui.Action.fromNewCanvas(new chem.Struct()));
        ui.render.update();
    }
};

//
// Hot keys
//
ui.onKeyPress_Ketcher = function (event)
{
    util.stopEventPropagation(event);

    if ($('window_cover').visible())
        return util.preventDefault(event);

    //rbalabanov: here we try to handle event using current editor tool
    //BEGIN
    if (ui && ui.render.current_tool) {
        if (ui.render.current_tool.processEvent('OnKeyPress', event)) {
            return util.preventDefault(event);
        }
    }
    //END

    switch (Prototype.Browser.IE ? event.keyCode : event.which)
    {
    case 43: // +
    case 61:
        ui.onClick_ZoomIn.call($('zoom_in'));
        return util.preventDefault(event);
    case 45: // -
    case 95:
        ui.onClick_ZoomOut.call($('zoom_out'));
        return util.preventDefault(event);
    case 8: // Back space
        if (ui.is_osx && ui.selected())
            ui.removeSelected();
        return util.preventDefault(event);
    case 48: // 0
        ui.onMouseDown_DropdownListItem.call($('bond_any'));
        return util.preventDefault(event);
    case 49: // 1
        var singles = ['bond_single', 'bond_up', 'bond_down', 'bond_updown'];
        ui.onMouseDown_DropdownListItem.call($(singles[(singles.indexOf(ui.mode_id) + 1) % singles.length]));
        return util.preventDefault(event);
    case 50: // 2
        var doubles = ['bond_double', 'bond_crossed'];
        ui.onMouseDown_DropdownListItem.call($(doubles[(doubles.indexOf(ui.mode_id) + 1) % doubles.length]));
        return util.preventDefault(event);
    case 51: // 3
        ui.onMouseDown_DropdownListItem.call($('bond_triple'));
        return util.preventDefault(event);
    case 52: // 4
        ui.onMouseDown_DropdownListItem.call($('bond_aromatic'));
        return util.preventDefault(event);
    case 53: // 5
        var charge = ['charge_plus', 'charge_minus'];
        ui.selectMode(charge[(charge.indexOf(ui.mode_id) + 1) % charge.length]);
        return util.preventDefault(event);
    case 66: // Shift+B
        ui.selectMode('atom_br');
        return util.preventDefault(event);
    case 67: // Shift+C
        ui.selectMode('atom_cl');
        return util.preventDefault(event);
    case 82: // Shift+R
        ui.selectMode('rgroup');
        return util.preventDefault(event);
    case 90: // Ctrl+Shift+Z
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_Redo.call($('redo'));
        return util.preventDefault(event);
    case 97: // a
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.selectAll();
        else
            ui.selectMode('atom_any');
        return util.preventDefault(event);
    case 99: // c
        if (!event.altKey)
        {
            if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
                ui.onClick_Copy.call($('copy'));
            else if (!event.metaKey)
                ui.selectMode('atom_c');
        }
        return util.preventDefault(event);
    case 102: // f
        ui.selectMode('atom_f');
        return util.preventDefault(event);
    case 103: // Ctrl+G
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_SideButton.call($('sgroup'));
        return util.preventDefault(event);
    case 104: // h
        ui.selectMode('atom_h');
        return util.preventDefault(event);
    case 105: // i
        ui.selectMode('atom_i');
        return util.preventDefault(event);
    case 108: // Ctrl+L
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_CleanUp.call($('clean_up'));
        return util.preventDefault(event);
    case 110: // n or Ctrl+N
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_NewFile.call($('new'));
        else
            ui.selectMode('atom_n');
        return util.preventDefault(event);
    case 111: // o or Ctrl+O
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_OpenFile.call($('open'));
        else
            ui.selectMode('atom_o');
        return util.preventDefault(event);
    case 112: // p
        ui.selectMode('atom_p');
        return util.preventDefault(event);
    case 115: // s or Ctrl+S
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_SaveFile.call($('save'));
        else
            ui.selectMode('atom_s');
        return util.preventDefault(event);
    case 116: // t
        if (ui.mode_id.startsWith('template_')) {
            var templates = rnd.Editor.TemplateTool.prototype.templates;
            ui.onMouseDown_DropdownListItem.apply(
                { id : 'template_' + (parseInt(ui.mode_id.split('_')[1]) + 1) % templates.length }
            );
        } else {
            ui.onMouseDown_DropdownListItem.apply({ id : $('template').getAttribute('selid') });
        }
        return util.preventDefault(event);
    case 118: // Ctrl+V
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_Paste.call($('paste'));
        return util.preventDefault(event);
    case 120: // Ctrl+X
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_Cut.call($('cut'));
        return util.preventDefault(event);
    case 122: // Ctrl+Z or Ctrl+Shift+Z (in Safari)
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
        {
            if (event.shiftKey)
                ui.onClick_Redo.call($('redo'));
            else
                ui.onClick_Undo.call($('undo'));
        }
        return util.preventDefault(event);
    case 126: // ~
        ui.render.update(true);
        return util.preventDefault(event);
    }
};

ui.ctrlShortcuts = [65, 67, 71, 76, 78, 79, 83, 86, 88, 90];

// Button handler specially for IE to prevent default actions
ui.onKeyDown_IE = function (event)
{
    if (Prototype.Browser.Gecko && event.which == 46)
    {
        util.stopEventPropagation(event);
        return util.preventDefault(event);
    }
        
    if (Prototype.Browser.WebKit && ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx)) && ui.ctrlShortcuts.indexOf(event.which) != -1)
    {
        // don't handle the shrtcuts in the regular fashion, e.g. saving the page, opening a document, etc.
        util.stopEventPropagation(event);
        return util.preventDefault(event);
    }

   if (!Prototype.Browser.IE)
        return;

    // Ctrl+A, Ctrl+C, Ctrl+N, Ctrl+O, Ctrl+S, Ctrl+V, Ctrl+X, Ctrl+Z
    //if ([65, 67, 78, 79, 83, 86, 88, 90].indexOf(event.keyCode) != -1 && event.ctrlKey)
    // Ctrl+A, Ctrl+G, Ctrl+L, Ctrl+N, Ctrl+O, Ctrl+S, Ctrl+Z
    if (ui.ctrlShortcuts.indexOf(event.keyCode) != -1 && event.ctrlKey)
    {
        util.stopEventPropagation(event);
        return util.preventDefault(event);
    }
};

// Button handler specially for Safari and IE
ui.onKeyUp = function (event)
{
    // Esc
    if (event.keyCode == 27)
    {
        if (this == document)
        {
            if (!$('window_cover').visible())
            {
                if (ui.modeType() == ui.MODE.SIMPLE)
                    ui.updateSelection();
                ui.selectMode(ui.defaultSelector);
            }
        } else if (this.hasClassName('dialogWindow'))
            ui.hideDialog(this.id);
        else
            this.hide();
        util.stopEventPropagation(event);
        return util.preventDefault(event);
    }
    
    if (event.keyCode == 46)
    {
        if (ui.selected())
            ui.removeSelected();
        util.stopEventPropagation(event);
        return util.preventDefault(event);
    }

    if (!Prototype.Browser.WebKit && !Prototype.Browser.IE)
        return;

    if (!(Prototype.Browser.WebKit &&
        ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx)) &&
        ui.ctrlShortcuts.indexOf(event.which) != -1) && (event.keyCode != 46 && Prototype.Browser.WebKit))
        return;

    if (this != document)
        return;

    util.stopEventPropagation(event);

    switch (event.keyCode)
    {
    case 46: // Delete
        if (ui.selected())
            ui.removeSelected();
        return;
    case 65: // Ctrl+A
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.selectAll();
        return;
    case 67: // Ctrl+C
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_Copy.call($('copy'));
        return;
    case 71: // Ctrl+G
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_SideButton.call($('sgroup'));
        return;
    case 76: // Ctrl+L
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_CleanUp.call($('clean_up'));
        return;
    case 78: // Ctrl+N
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_NewFile.call($('new'));
        return;
    case 79: // Ctrl+O
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_OpenFile.call($('open'));
        return;
    case 83: // Ctrl+S
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_SaveFile.call($('save'));
        return;
    case 86: // Ctrl+V
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_Paste.call($('paste'));
        return;
    case 88: // Ctrl+X
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_Cut.call($('cut'));
        return;
    case 90: // Ctrl+Z
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
        {
            if (event.shiftKey)
                ui.onClick_Redo.call($('redo'));
            else
                ui.onClick_Undo.call($('undo'));
        }
        return;
    }
};

ui.onKeyPress_Dialog = function (event)
{
    util.stopEventPropagation(event);
    if (event.keyCode == 27)
    {
        ui.hideDialog(this.id);
        return util.preventDefault(event);
    }
};

ui.onKeyPress_InputLabel = function (event)
{
    util.stopEventPropagation(event);
    if (event.keyCode == 13)
    {
        this.hide();

        var label = '';
        var charge = 0;
        var value_arr = this.value.toArray();

        if (this.value == '*')
        {
            label = 'A';
        } else if (this.value.match(/^[*][1-9]?[+-]$/i))
        {
            label = 'A';

            if (this.value.length == 2)
                charge = 1;
            else
                charge = parseInt(value_arr[1]);

            if (value_arr[2] == '-')
                charge *= -1;
        } else if (this.value.match(/^[A-Z]{1,2}$/i))
        {
            label = this.value.capitalize();
        } else if (this.value.match(/^[A-Z]{1,2}[0][+-]?$/i))
        {
            if (this.value.match(/^[A-Z]{2}/i))
                label = this.value.substr(0, 2).capitalize();
            else
                label = value_arr[0].capitalize();
        } else if (this.value.match(/^[A-Z]{1,2}[1-9]?[+-]$/i))
        {
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

        if (label == 'A' || label == 'Q' || label == 'X' || label == 'R' || chem.Element.getElementByLabel(label) != null)
        {
            ui.addUndoAction(ui.Action.fromAtomAttrs(this.atom_id, {label: label, charge: charge}), true);
            ui.render.update();
        }
        return util.preventDefault(event);
    }
    if (event.keyCode == 27)
    {
        this.hide();
        return util.preventDefault(event);
    }
};

//
// Open file section
//
ui.onClick_OpenFile = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;
    ui.showDialog('open_file');
    $('radio_open_from_input').checked = true;
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

ui.loadMolecule = function (mol_string, force_layout)
{
    var smiles = mol_string.strip();

    if (smiles.indexOf('\n') == -1)
    {
        if (ui.standalone)
        {
            if (smiles != '')
            {
                alert('SMILES is not supported in a standalone mode.');
            }
            return;
        }
        new Ajax.Request(ui.path + 'layout?smiles=' + encodeURIComponent(smiles),
        {
            method: 'get',
            asynchronous : true,
            onComplete: function (res)
            {
                if (res.responseText.startsWith('Ok.'))
                    ui.updateMolecule(ui.parseCTFile(res.responseText));
            }
        });
    } else if (!ui.standalone && force_layout)
    {
        new Ajax.Request(ui.path + 'layout',
        {
            method: 'post',
            asynchronous : true,
            parameters: {moldata: mol_string},
            onComplete: function (res)
            {
                if (res.responseText.startsWith('Ok.'))
                    ui.updateMolecule(ui.parseCTFile(res.responseText));
            }
        });
    } else {
        ui.updateMolecule(ui.parseCTFile(mol_string));
    }
};

ui.dearomatizeMolecule = function (mol_string, aromatize)
{
    if (!ui.standalone)
    {
        new Ajax.Request(ui.path + (aromatize ? 'aromatize' : 'dearomatize'),
        {
            method: 'post',
            asynchronous : true,
            parameters: {moldata: mol_string},
            onComplete: function (res)
            {
                if (res.responseText.startsWith('Ok.')) {
                    ui.updateMolecule(ui.parseCTFile(res.responseText));
                } else if (res.responseText.startsWith('Error.')) {
                    alert(res.responseText);
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
        ui.loadMolecule(file.substr(file.indexOf('\n') + 1));
};

ui.loadMoleculeFromInput = function ()
{
    ui.hideDialog('open_file');
    ui.loadMolecule($('input_mol').value);
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

    setTimeout(function ()
    {
        if (el.value.strip().indexOf('\n') != -1)
        {
            if (el.style.wordWrap != 'normal')
                el.style.wordWrap = 'normal';
        } else
        {
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
    ui.showDialog('save_file');
    ui.onChange_FileFormat(null, true);
};

ui.onChange_FileFormat = function (event, update)
{
    var output = $('output_mol');
    var el = $('file_format');

    if (update)
    {
        var saver = new chem.MolfileSaver();
        output.molfile = saver.saveMolecule(ui.ctab, true);

        try
        {
            saver = new chem.SmilesSaver();
            output.smiles = saver.saveMolecule(ui.ctab, true);
        } catch (er)
        {
            output.smiles = er.message;
        }
    }

    if (el.value == 'mol')
    {
        output.value = output.molfile;
        output.style.wordWrap = 'normal';
    } else // if (el.value == 'smi')
    {
        output.value = output.smiles;
        output.style.wordWrap = 'break-word';
    }

    $('mol_data').value = el.value + '\n' + output.value;
    output.activate();
};

//
// Zoom section
//
ui.onClick_ZoomIn = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;

    ui.zoomIdx++;

    if (ui.zoomIdx >= ui.zoomValues.length - 1)
        this.addClassName('buttonDisabled');
    $('zoom_out').removeClassName('buttonDisabled');
    if (ui.zoomIdx < 0 || ui.zoomIdx >= ui.zoomValues.length)
        throw new Error ("Zoom index out of range");
    ui.setZoomCentered(ui.zoomValues[ui.zoomIdx], ui.render.view2obj(ui.render.viewSz.scaled(0.5)));
    ui.render.update();
};

ui.onClick_ZoomOut = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;

    ui.zoomIdx--;

    if (ui.zoomIdx <= 0)
        this.addClassName('buttonDisabled');
    $('zoom_in').removeClassName('buttonDisabled');
    if (ui.zoomIdx < 0 || ui.zoomIdx >= ui.zoomValues.length)
        throw new Error ("Zoom index out of range");
    ui.setZoomCentered(ui.zoomValues[ui.zoomIdx], ui.render.view2obj(ui.render.viewSz.scaled(0.5)));
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
    var d = ui.render.extendCanvas(x, y, cx + x, cy + y);
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


    var ms = new chem.MolfileSaver();

    try
    {
        ui.loadMolecule(ms.saveMolecule(ui.ctab), true);
    } catch (er)
    {
        alert("Molfile: " + er.message);
    }
};

ui.onClick_Aromatize = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;

    var ms = new chem.MolfileSaver();

    try
    {
        ui.dearomatizeMolecule(ms.saveMolecule(ui.ctab), true);
    } catch (er)
    {
        alert("Molfile: " + er.message);
    }
};

ui.onClick_Dearomatize = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;

    var ms = new chem.MolfileSaver();

    try
    {
        ui.dearomatizeMolecule(ms.saveMolecule(ui.ctab), false);
    } catch (er)
    {
        alert("Molfile: " + er.message);
    }
};

//
// Interactive section
//
ui.mouse_moved = false;
ui.drag =
{
    atom_id:   null,
    bond_id:   null,
    selection: false,
    start_pos: null,
    last_pos:  null,
    new_atom_id: null,
    action:  null
};
ui.selection =
{
    atoms: [],
    bonds: [],
    rxnArrows: [],
    rxnPluses: []
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

ui.onScroll_ClientArea = function ()
{
    if ($('input_label').visible())
        $('input_label').hide();

    ui.scrollLeft = ui.client_area.scrollLeft;
    ui.scrollTop = ui.client_area.scrollTop;
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

    for (i = 0; i < neighbours.length; i++)
    {
        angle = util.Vec2.angle(neighbours[i].v, neighbours[(i + 1) % neighbours.length].v);

        if (angle < 0)
            angle += 2 * Math.PI;

        if (angle > max_angle)
            max_i = i, max_angle = angle;
    }

    var v = new util.Vec2(1, 0);

    if (neighbours.length > 0)
    {
        if (neighbours.length == 1)
        {
            max_angle = -(4 * Math.PI / 3);

            // zig-zag
            var nei = ui.render.atomGetNeighbors(id)[0];
            if (ui.render.atomGetDegree(nei.aid) > 1)
            {
                var nei_neighbours = new Array();
                var nei_pos = ui.render.atomGetPos(nei.aid);
                var nei_v = util.Vec2.diff(pos, nei_pos);
                var nei_angle = Math.atan2(nei_v.y, nei_v.x);

                ui.render.atomGetNeighbors(nei.aid).each(function (nei_nei)
                {
                    var nei_nei_pos = ui.render.atomGetPos(nei_nei.aid);

                    if (nei_nei.bid == nei.bid || util.Vec2.dist(nei_pos, nei_nei_pos) < 0.1)
                        return;

                    var v_diff = util.Vec2.diff(nei_nei_pos, nei_pos);
                    var ang = Math.atan2(v_diff.y, v_diff.x) - nei_angle;

                    if (ang < 0)
                        ang += 2 * Math.PI;

                    nei_neighbours.push(ang);
                });
                nei_neighbours.sort(function (nei1, nei2)
                {
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

ui.updateSelection = function (selection, nodraw)
{
    selection = selection || {};
    for (var map in rnd.ReStruct.maps) {
        if (Object.isUndefined(selection[map]))
            ui.selection[map] = [];
        else
            ui.selection[map] = selection[map];
    }

    ui.selection.bonds = ui.selection.bonds.filter(function (bid)
    {
        var bond = ui.ctab.bonds.get(bid);
        return (ui.selection.atoms.indexOf(bond.begin) != -1 && ui.selection.atoms.indexOf(bond.end) != -1);
    });

    if (!nodraw) {
        ui.render.setSelection(ui.selection);
        ui.render.update();
    }

    ui.updateClipboardButtons();
};

ui.selected = function ()
{
    for (var map in rnd.ReStruct.maps) {
        if (!Object.isUndefined(ui.selection[map]) && ui.selection[map].length > 0) {
            return true;
        }
    }
    return false;
};

ui.selectedAtom = function ()
{
	return !Object.isUndefined(ui.selection.atoms) && ui.selection.atoms.length > 0;
};

ui.selectAll = function ()
{
    // TODO cleanup
/*
    var mode = ui.modeType();
    if (mode == ui.MODE.ERASE || mode == ui.MODE.SGROUP)
        ui.selectMode(ui.defaultSelector);

    var selection = {};
    for (var map in rnd.ReStruct.maps) {
        selection[map] = ui.ctab[map].ikeys();
    }

    ui.updateSelection(selection);
*/
    if (!ui.ctab.isBlank()) {
        ui.selectMode($('selector').getAttribute('selid'));
        ui.editor.selectAll();
    }
};

ui.removeSelected = function ()
{
    ui.addUndoAction(ui.Action.fromFragmentDeletion());
    for (var map in rnd.ReStruct.maps)
        ui.selection[map] = [];
    ui.render.update();
    ui.updateClipboardButtons();
};

ui.hideBlurredControls = function ()
{
    var ret = false;
    [
        'input_label',
        'selector_dropdown_list',
        'bond_dropdown_list',
        'template_dropdown_list',
        'reaction_dropdown_list',
        'rgroup_dropdown_list'
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
        ui.hideDialog('atom_attpoints');
        if ('onOk' in params) params['onOk'](($('atom_ap1').checked ? 1 : 0) + ($('atom_ap2').checked ? 2 : 0));
        _onOk.stop();
    }).start();
    var _onCancel = new Event.Handler('atom_attpoints_cancel', 'click', undefined, function() {
        ui.hideDialog('atom_attpoints');
        if ('onCancel' in params) params['onCancel']();
        _onCancel.stop();
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
    var value = ui.render.atomGetAttr(id, 'charge');
    $('atom_charge').value = (value == 0 ? '' : value);
    value = ui.render.atomGetAttr(id, 'isotope');
    $('atom_isotope').value = (value == 0 ? '' : value);
    $('atom_valence').value = (!ui.render.atomGetAttr(id, 'explicitValence') ? '' : ui.render.atomGetAttr(id, 'valence'));
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

    ui.addUndoAction(ui.Action.fromAtomAttrs(id,
    {
        label: $('atom_label').value,
        charge: $('atom_charge').value == '' ? 0 : parseInt($('atom_charge').value),
        isotope: $('atom_isotope').value == '' ? 0 : parseInt($('atom_isotope').value),
        explicitValence: $('atom_valence').value != '',
        valence: $('atom_valence').value == '' ? ui.render.atomGetAttr(id, 'valence') : parseInt($('atom_valence').value),
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

    if (element == null && this.value != 'A' && this.value != '*' && this.value != 'Q' && this.value != 'X' && this.value != 'R')
    {
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

    for (var bond in ui.bondTypeMap)
    {
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
    }

    var onClickOk = function ()
    {
        ui.hideDialog('sgroup_properties');
        resetListeners();

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
            attrs.connectivity = $('sgroup_connection').value;
            attrs.subscript = $('sgroup_label').value;
            break;
        case 'MUL':
            attrs.mul = parseInt($('sgroup_label').value);
            break;
        case 'SUP':
            attrs.name = $('sgroup_label').value;
            break;
        case 'DAT':
            attrs.fieldName = $('sgroup_field_name').value.strip();
            attrs.fieldValue = $('sgroup_field_value').value.strip();

            if (attrs.fieldName == '' || attrs.fieldValue == '')
            {
                alert("Please, specify data field name and value.");
                ui.showDialog('sgroup_properties');
                return;
            }
            break;
        }

        onOk.call(tool, id, type, attrs);
    };

    var resetListeners = function () {
        $('sgroup_prop_cancel').stopObserving('click', onClickCancel);
        $('sgroup_prop_ok').stopObserving('click', onClickOk);
    }

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

    if (type == 'DAT')
    {
        $$('.generalSGroup').each(function (el) {el.hide()});
        $$('.dataSGroup').each(function (el) {el.show()});

        $('sgroup_field_name').activate();

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

    if (type != 'GEN')
        $('sgroup_label').activate();
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
    ui.showElemTable();
};

ui.showElemTable = function ()
{
    if ($('elem_table').visible())
        return;

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
    $('elem_table_ok').focus();
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
    $('rlogic_resth').value = params.rlogic.resth || '0';
    $('rlogic_if').innerHTML = '<option value="0">Always</option>';
    for (var r = 1; r <= 32; r++) if (r != params.rgid && 0 != (params.rgmask & (1 << (r - 1)))) {
        $('rlogic_if').innerHTML += '<option value="' + r + '">IF R' + params.rgid + ' THEN R' + r + '</option>';
    }
    $('rlogic_if').value = params.rlogic.ifthen;
    ui.showDialog('rlogic_table');

    var _onOk = new Event.Handler('rlogic_ok', 'click', undefined, function() {
        _onOk.stop();
        _onCancel.stop();
        ui.hideDialog('rlogic_table');
        if (params && 'onOk' in params) params['onOk']({
            'occurrence' : $('rlogic_occurrence').value,
            'resth' : $('rlogic_resth').value == '1',
            'ifthen' : parseInt($('rlogic_if').value)
        });
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

    if (ui.selected())
    {
        $('copy').removeClassName('buttonDisabled');
        $('cut').removeClassName('buttonDisabled');
    } else
    {
        $('copy').addClassName('buttonDisabled');
        $('cut').addClassName('buttonDisabled');
    }
};

ui.copy = function ()
{
    ui.clipboard =
    {
        atoms: new Array(),
        bonds: new Array(),
        sgroups: new Array(),
        rxnArrows: new Array(),
        rxnPluses: new Array(),
        // RB: let it be here for the moment
        // TODO: "clipboard" support to be moved to editor module
        getAnchorPosition: function() {
            if (this.atoms.length) {
                return this.atoms[0].pos;
            } else if (this.rxnArrows.length) {
                return ui.editor.render.rxnArrowGetPos(this.rxnArrows[0]);
            } else if (this.rxnPluses.length) {
                return ui.editor.render.rxnPlusGetPos(this.rxnPluses[0]);
            }
        }
    };

    var mapping = {};

    ui.selection.atoms.each(function (id)
    {
        var new_atom = new chem.Struct.Atom(ui.ctab.atoms.get(id));
        new_atom.pos = ui.render.atomGetPos(id);

        if (new_atom.sgroup != -1)
            new_atom.sgroup = -1;

        mapping[id] = ui.clipboard.atoms.push(new chem.Struct.Atom(new_atom)) - 1;
    });

    ui.selection.bonds.each(function (id)
    {
        var new_bond = new chem.Struct.Bond(ui.ctab.bonds.get(id));
        new_bond.begin = mapping[new_bond.begin];
        new_bond.end = mapping[new_bond.end];
        ui.clipboard.bonds.push(new chem.Struct.Bond(new_bond));
    });

    var sgroup_counts = new Hash();

    // determine selected sgroups
    ui.selection.atoms.each(function (id)
    {
        var sg = ui.render.atomGetSGroups(id);

        sg.each(function (sid)
        {
            var n = sgroup_counts.get(sid);
            if (Object.isUndefined(n))
                n = 1;
            else
                n++;
            sgroup_counts.set(sid, n);
        }, this);
    }, this);

    sgroup_counts.each(function (sg)
    {
        var sid = parseInt(sg.key);

        if (sg.value == ui.render.sGroupGetAtoms(sid).length)
        {
            var new_sgroup =
            {
                type: ui.render.sGroupGetType(sid),
                mul: ui.render.sGroupGetAttr(sid, 'mul'),
                connectivity: ui.render.sGroupGetAttr(sid, 'connectivity'),
                name: ui.render.sGroupGetAttr(sid, 'name'),
                subscript: ui.render.sGroupGetAttr(sid, 'subscript'),
                fieldName: ui.render.sGroupGetAttr(sid, 'fieldName'),
                fieldValue: ui.render.sGroupGetAttr(sid, 'fieldValue'),
                atoms: ui.render.sGroupGetAtoms(sid).clone()
            };

            for (var i = 0; i < new_sgroup.atoms.length; i++)
            {
                new_sgroup.atoms[i] = mapping[new_sgroup.atoms[i]];
            }

            ui.clipboard.sgroups.push(new_sgroup);
        }
    });

    ui.selection.rxnArrows.each(function (id)
    {
        var arrow = new chem.Struct.RxnArrow(ui.ctab.rxnArrows.get(id));
        arrow.pos = ui.render.rxnArrowGetPos(id);
        ui.clipboard.rxnArrows.push(arrow);
    });

    ui.selection.rxnPluses.each(function (id)
    {
        var plus = new chem.Struct.RxnPlus(ui.ctab.rxnPluses.get(id));
        plus.pos = ui.render.rxnPlusGetPos(id);
        ui.clipboard.rxnPluses.push(plus);
    });

};

ui.paste = function ()
{
    var mapping = {};
    var id;

    for (id = 0; id < ui.clipboard.atoms.length; id++)
    {
        var atom = ui.clipboard.atoms[id];
        atom.fragment = -1;
        mapping[id] = ui.render.atomAdd(atom.pos, atom);
        ui.pasted.atoms.push(mapping[id]);
    }

    for (id = 0; id < ui.clipboard.bonds.length; id++)
    {
        var bond = ui.clipboard.bonds[id];
        ui.pasted.bonds.push(ui.render.bondAdd(mapping[bond.begin], mapping[bond.end], bond));
    }

    ui.clipboard.sgroups.each(function (sgroup)
    {
        var sid = ui.render.sGroupCreate(sgroup.type);

        ui.render.sGroupSetAttr(sid, 'mul', sgroup.mul);
        ui.render.sGroupSetAttr(sid, 'connectivity', sgroup.connectivity);
        ui.render.sGroupSetAttr(sid, 'name', sgroup.name);
        ui.render.sGroupSetAttr(sid, 'subscript', sgroup.subscript);
        ui.render.sGroupSetAttr(sid, 'fieldName', sgroup.fieldName);
        ui.render.sGroupSetAttr(sid, 'fieldValue', sgroup.fieldValue);

        sgroup.atoms.each(function(id)
        {
            ui.render.atomClearSGroups(mapping[id]);
            ui.render.atomAddToSGroup(mapping[id], sid);
        }, this);

        ui.pasted.sgroups.push(sid);
    }, this);

    for (id = 0; id < ui.clipboard.rxnArrows.length; id++) {
        var arrow = ui.clipboard.rxnArrows[id];
        if (ui.ctab.rxnArrows.count() < 1) {
            ui.pasted.rxnArrows.push(ui.render.rxnArrowAdd(arrow.pos, arrow));
        }
    }

    for (id = 0; id < ui.clipboard.rxnPluses.length; id++) {
        var plus = ui.clipboard.rxnPluses[id];
        ui.pasted.rxnPluses.push(ui.render.rxnPlusAdd(plus.pos, plus));
    }

    ui.pastedAnchorPos = null;
    if (ui.pasted.atoms.length) {
        ui.pastedAnchorPos = ui.render.atomGetPos(ui.pasted.atoms[0]);
    } else if (ui.pasted.rxnArrows.length) {
        ui.pastedAnchorPos = ui.render.rxnArrowGetPos(ui.pasted.rxnArrows[0]);
    } else if (ui.pasted.rxnPluses.length) {
        ui.pastedAnchorPos = ui.render.rxnPlusGetPos(ui.pasted.rxnPluses[0]);
    }

    ui.selectMode(null);
    ui.render.update();
};

ui.cancelPaste = function ()
{
    ui.pasted.sgroups.each(function (id)
    {
        ui.render.sGroupDelete(id);
    });

    ui.pasted.atoms.each(function (id)
    {
        ui.render.atomRemove(id);
    });

    ui.pasted.atoms.clear();
    ui.pasted.bonds.clear();
    ui.pasted.sgroups.clear();

    if (ui.render != null)
        ui.render.update();
};

ui.onClick_Cut = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;

    ui.copy();
    ui.removeSelected();
};

ui.onClick_Copy = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;

    ui.copy();
    ui.updateSelection();
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
