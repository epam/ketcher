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
ui.SCALE_MIN  = 20;
ui.SCALE_MAX  = 120;
ui.SCALE_INCR = 20;

ui.DBLCLICK_INTERVAL = 300;

ui.HISTORY_LENGTH = 8;

ui.DEBUG = false;

ui.render = null;

ui.ctab = new chem.Molecule();

ui.client_area = null;
ui.mode_button = null;

ui.undoStack = new Array();
ui.redoStack = new Array();

ui.is_osx = false;
ui.initialized = false;

ui.MODE = {SIMPLE: 1, ERASE: 2, ATOM: 3, BOND: 4, PATTERN: 5, SGROUP: 6, PASTE: 7};

ui.patterns =
{
    six1: [1, 2, 1, 2, 1, 2],
    six2: [1, 1, 1, 1, 1, 1],
    //sixa: [4, 4, 4, 4, 4, 4],
    five: [1, 1, 1, 1, 1]
}

//
// Init section
//
ui.initButton = function (el)
{
    el.observe('mousedown', function (event) 
    {
        if (this.hasClassName('buttonDisabled'))
            return;
        this.addClassName('buttonPressed');
    });
    el.observe('mouseup', function (event) 
    {
        this.removeClassName('buttonPressed');
    });
    el.observe('mouseover', function (event) 
    {
        if (this.hasClassName('buttonDisabled'))
            return;
        this.addClassName('buttonHighlight');
        
        var status = this.getAttribute('status');
        if (status != null)
            window.status = status;
    });
    el.observe('mouseout', function (event) 
    {
        this.removeClassName('buttonPressed');
        this.removeClassName('buttonHighlight');
        window.status = '';
    });
};

ui.onClick_SideButton = function (event)
{
    if (this.hasClassName('buttonDisabled'))
        return;
    ui.selectMode(this.id);
};

ui.init = function ()
{
    if (this.initialized)
    {
        this.Action.fromNewCanvas(new chem.Molecule());
        this.render.update();
        this.undoStack.clear();
        this.redoStack.clear();
        this.updateActionButtons();
        this.selectMode('select_simple');
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
        $$('.toolButton > img, .sideButton').each(function (button)
        {
            button.title = button.title.replace("Ctrl", "Cmd");
        }, this);
    }

    // Document events
    document.observe('keypress', ui.onKeyPress_Ketcher);
    document.observe('keydown', ui.onKeyDown_IE);
    document.observe('keyup', ui.onKeyUp);
    document.observe('mouseup', ui.onMouseUp_Ketcher);
    
    // Button events
    $$('.toolButton').each(ui.initButton);
    $$('.sideButton').each(function (el)
    {
        ui.initButton(el);
        el.observe('click', ui.onClick_SideButton);
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
    
    // S-group properties dialog events
    $('sgroup_type').observe('change', ui.onChange_SGroupType);
    $('sgroup_label').observe('change', ui.onChange_SGroupLabel);
    $('sgroup_prop_cancel').observe('click', function ()
    {
        ui.hideDialog('sgroup_properties');
    });
    $('sgroup_prop_ok').observe('click', function ()
    {
        ui.applySGroupProperties();
    });
    
    // Label input events
    $('input_label').observe('blur', function ()
    {
        this.hide();
    });
    $('input_label').observe('keypress', ui.onKeyPress_InputLabel);
    $('input_label').observe('keyup', ui.onKeyUp);
    
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
        setTimeout(ui.loadMoleculeFromFile, 500);
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
    
    var request = new Ajax.Request(ui.path + 'knocknock',
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
        
    this.selectMode('select_simple');
    
    // Init renderer
    this.render =  new rnd.Render(this.client_area, this.scale, {atomColoring: true}, new chem.Vec2(ui.client_area.clientWidth, ui.client_area.clientHeight - 4));
    
    this.render.onAtomClick = this.onClick_Atom;
    this.render.onAtomDblClick = this.onDblClick_Atom;
    this.render.onAtomMouseDown = this.onMouseDown_Atom;
    this.render.onAtomMouseOver = this.onMouseOver_Atom;
    this.render.onAtomMouseOut = this.onMouseOut_Atom;
    
    this.render.onBondClick = this.onClick_Bond;
    this.render.onBondMouseDown = this.onMouseDown_Bond;
    this.render.onBondMouseOver = this.onMouseOver_Bond;
    this.render.onBondMouseOut = this.onMouseOut_Bond;

    this.render.onCanvasClick = this.onClick_Canvas;
    this.render.onCanvasMouseMove = this.onMouseMove_Canvas;
    this.render.onCanvasMouseDown = this.onMouseDown_Canvas;
    this.render.onCanvasOffsetChanged = this.onOffsetChanged;

    this.render.onSGroupClick = this.onClick_SGroup;
    this.render.onSGroupDblClick = this.onDblClick_SGroup;
    this.render.onSGroupMouseDown = function () { return true; };
    this.render.onSGroupMouseOver = this.onMouseOver_SGroup;
    this.render.onSGroupMouseOut = this.onMouseOut_SGroup;
    
    this.render.setMolecule(this.ctab);
    this.render.update();
    
    this.initialized = true;
};

ui.showDialog = function (name)
{
    $('window_cover').show();
    $(name).show();
}

ui.hideDialog = function (name)
{
    $(name).hide();
    $('window_cover').hide();
}

ui.onResize_Ketcher = function ()
{
    $('window_cover').style.width = $('ketcher_window').getWidth().toString() + 'px';
    $('window_cover').style.height = $('ketcher_window').getHeight().toString() + 'px';
    
    if (Prototype.Browser.IE)
        ui.client_area.style.width = (Element.getWidth(ui.client_area.parentNode) - 2).toString() + 'px';
    
    //ui.client_area.style.width = (Element.getWidth(ui.client_area.parentNode) - 2).toString() + 'px';
    ui.client_area.style.height = (Element.getHeight(ui.client_area.parentNode) - 2).toString() + 'px';
}

//
// Main section
//
ui.updateMolecule = function (mol)
{
    if (typeof(mol) == 'undefined' || mol == null)
    {
        this.console.writeLine('Molfile parsing failed');
        return;
    }

    if (ui.selected())
        ui.updateSelection();
        
    this.addUndoAction(this.Action.fromNewCanvas(mol));
    
    ui.showDialog('loading');
    setTimeout(function ()
    {
        try
        {
            ui.render.update()
        } catch (er)
        {
            alert(er.message);
        } finally
        {
            ui.hideDialog('loading');
        }
    }, 50);
};

ui.parseMolfile = function (molfile)
{
    var lines = molfile.split('\n');
    
    if (lines.length > 0 && lines[0] == 'Ok.')
        lines.shift();
    
    return chem.Molfile.parseMolfile(lines);
};

//
// Mode functions
//
ui.selectMode = function (mode)
{
    if (mode != null)
    {
        if ($(mode).hasClassName('buttonDisabled'))
            return;
        
        if (ui.selected())
        {
            if (mode == 'select_erase')
            {
                ui.removeSelected();
                return;
            }
            if (mode.startsWith('atom_'))
            {
                ui.addUndoAction(ui.Action.fromSelectedAtomsAttrs({label: ui.atomLabel(mode)}), true);
                ui.render.update();
                return;
            }
            if (mode.startsWith('bond_'))
            {
                ui.addUndoAction(ui.Action.fromSelectedBondsAttrs(ui.bondType(mode)), true);
                ui.render.update();
                return;
            }
            if (mode == 'sgroup')
            {
                ui.showSGroupProperties(null);
                return;
            }
        }
        
        if (ui.mode_button == null) // ui.MODE.PASTE
            ui.cancelPaste();
    }

    if (this.mode_button != null && this.mode_button.id != mode)
        this.mode_button.removeClassName('buttonSelected');
        
    if (mode == null)
        this.mode_button = null;
    else
    {
        this.mode_button = $(mode);
        this.mode_button.addClassName('buttonSelected');
    }
}

ui.modeType = function ()
{
    if (ui.mode_button == null)
        return ui.MODE.PASTE;
    if (ui.mode_button.id == 'select_simple')
        return ui.MODE.SIMPLE;
    if (ui.mode_button.id == 'select_erase')
        return ui.MODE.ERASE;
    if (ui.mode_button.id.startsWith('atom_'))
        return ui.MODE.ATOM;
    if (ui.mode_button.id.startsWith('bond_'))
        return ui.MODE.BOND;
    if (ui.mode_button.id == 'sgroup')
        return ui.MODE.SGROUP;
    if (ui.mode_button.id.startsWith('pattern_'))
        return ui.MODE.PATTERN;
}

ui.bondType = function (mode)
{
    var type_str;

    if (Object.isUndefined(mode))
        type_str = ui.mode_button.id.substr(5);
    else
        type_str = mode.substr(5);
        
    switch (type_str)
    {
    case 'single':
        return {type: 1, stereo: chem.Molecule.BOND.STEREO.NONE};
    case 'up':
        return {type: 1, stereo: chem.Molecule.BOND.STEREO.UP};
    case 'down':
        return {type: 1, stereo: chem.Molecule.BOND.STEREO.DOWN};
    case 'double':
        return {type: 2, stereo: chem.Molecule.BOND.STEREO.NONE};
    case 'triple':
        return {type: 3, stereo: chem.Molecule.BOND.STEREO.NONE};
    case 'aromatic':
        return {type: 4, stereo: chem.Molecule.BOND.STEREO.NONE};
    case 'single_double':
        return {type: 5, stereo: chem.Molecule.BOND.STEREO.NONE};
    case 'single_aromatic':
        return {type: 6, stereo: chem.Molecule.BOND.STEREO.NONE};
    case 'double_aromatic':
        return {type: 7, stereo: chem.Molecule.BOND.STEREO.NONE};
    case 'any':
        return {type: 8, stereo: chem.Molecule.BOND.STEREO.NONE};
    }
}

ui.atomLabel = function (mode)
{
    var label;
    
    if (Object.isUndefined(mode))
        label = ui.mode_button.id.substr(5);
    else
        label = mode.substr(5);
    
    if (label == 'any')
        return 'A';
    else
        return label.capitalize();
}

ui.pattern = function ()
{
    return ui.patterns[ui.mode_button.id.substr(8)];
}

//
// New document
//
ui.onClick_NewFile = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;
    
    if (ui.modeType() == ui.MODE.PASTE)
        ui.cancelPaste();

    ui.selectMode('select_simple');
    
    if (ui.ctab.atoms.count() != 0)
    {
        ui.addUndoAction(ui.Action.fromNewCanvas(new chem.Molecule()));
        ui.render.update();
    }
}

//
// Hot keys
//
ui.onKeyPress_Ketcher = function (event) 
{
    chem.stopEventPropagation(event);
    
    if ($('window_cover').visible())
        return chem.preventDefault(event);

    if (ui.isDrag())
    {
        if (event.keyCode == 27)
        {
            ui.endDrag();
            if (ui.selected())
                ui.updateSelection();
        }
        return chem.preventDefault(event);
    }

    switch (event.keyCode)
    {
    case 27: // Esc
        if (!Prototype.Browser.WebKit)
        {
            if (ui.modeType() == ui.MODE.PASTE)
                ui.cancelPaste();
            else if (ui.modeType() == ui.MODE.SIMPLE)
                ui.updateSelection();
            ui.selectMode('select_simple');
        }
        return chem.preventDefault(event);
    case 46: // Delete
        if (!Prototype.Browser.WebKit && !Prototype.Browser.IE)
            if (ui.selected())
                ui.removeSelected();
        return chem.preventDefault(event);
    }

    switch (Prototype.Browser.IE ? event.keyCode : event.which)
    {
    case 43: // +
    case 61:
        ui.onClick_ZoomIn.call($('zoom_in'));
        return chem.preventDefault(event);
    case 45: // -
    case 95:
        ui.onClick_ZoomOut.call($('zoom_out'));
        return chem.preventDefault(event);
    case 8: // Back space
        if (ui.is_osx && ui.selected())
            ui.removeSelected();
        return chem.preventDefault(event);
    case 48: // 0
        ui.selectMode('bond_any');
        return chem.preventDefault(event);
    case 49: // 1
        var singles = ['bond_single', 'bond_up', 'bond_down'];
        ui.selectMode(singles[(singles.indexOf(ui.mode_button.id) + 1) % singles.length]);
        return chem.preventDefault(event);
    case 50: // 2
        ui.selectMode('bond_double');
        return chem.preventDefault(event);
    case 51: // 3
        ui.selectMode('bond_triple');
        return chem.preventDefault(event);
    case 52: // 4
        ui.selectMode('bond_aromatic');
        return chem.preventDefault(event);
    case 66: // Shift+B
        ui.selectMode('atom_br');
        return chem.preventDefault(event);
    case 67: // Shift+C
        ui.selectMode('atom_cl');
        return chem.preventDefault(event);
    case 90: // Ctrl+Shift+Z
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_Redo.call($('redo'));
        return chem.preventDefault(event);
    case 97: // a
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.selectAll();
        else
            ui.selectMode('atom_any');
        return chem.preventDefault(event);
    case 99: // c
        if (!event.altKey)
        {
            if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
                ui.onClick_Copy.call($('copy'));
            else if (!event.metaKey)
                ui.selectMode('atom_c');
        }
        return chem.preventDefault(event);
    case 102: // f
        ui.selectMode('atom_f');
        return chem.preventDefault(event);
    case 103: // Ctrl+G
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_SideButton.call($('sgroup'));
        return chem.preventDefault(event);
    case 104: // h
        ui.selectMode('atom_h');
        return chem.preventDefault(event);
    case 105: // i
        ui.selectMode('atom_i');
        return chem.preventDefault(event);
    case 108: // Ctrl+L
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_CleanUp.call($('clean_up'));
        return chem.preventDefault(event);
    case 110: // n or Ctrl+N
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_NewFile.call($('new'));
        else
            ui.selectMode('atom_n');
        return chem.preventDefault(event);
    case 111: // o or Ctrl+O
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_OpenFile.call($('open'));
        else
            ui.selectMode('atom_o');
        return chem.preventDefault(event);
    case 112: // p
        ui.selectMode('atom_p');
        return chem.preventDefault(event);
    case 114: // r
        var rings = ['pattern_six1', 'pattern_six2', 'pattern_five'];
        ui.selectMode(rings[(rings.indexOf(ui.mode_button.id) + 1) % rings.length]);
        return chem.preventDefault(event);
    case 115: // s or Ctrl+S
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_SaveFile.call($('save'));
        else
            ui.selectMode('atom_s');
        return chem.preventDefault(event);
    case 118: // Ctrl+V
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_Paste.call($('paste'));
        return chem.preventDefault(event);
    case 120: // Ctrl+X
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            ui.onClick_Cut.call($('cut'));
        return chem.preventDefault(event);
    case 122: // Ctrl+Z or Ctrl+Shift+Z (in Safari)
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
        {
            if (event.shiftKey)
                ui.onClick_Redo.call($('redo'));
            else
                ui.onClick_Undo.call($('undo'));
        }
        return chem.preventDefault(event);
    case 126: // ~
        ui.render.update(true);
        return chem.preventDefault(event);
    }
}

// Button handler specially for IE to prevent default actions
ui.onKeyDown_IE = function (event)
{
    if (!Prototype.Browser.IE)
        return;

    // Ctrl+A, Ctrl+C, Ctrl+N, Ctrl+O, Ctrl+S, Ctrl+V, Ctrl+X, Ctrl+Z
    //if ([65, 67, 78, 79, 83, 86, 88, 90].indexOf(event.keyCode) != -1 && event.ctrlKey)
    // Ctrl+A, Ctrl+G, Ctrl+L, Ctrl+N, Ctrl+O, Ctrl+S, Ctrl+Z
    if ([65, 71, 76, 78, 79, 83, 90].indexOf(event.keyCode) != -1 && event.ctrlKey)
    {
        chem.stopEventPropagation(event);
        return chem.preventDefault(event);
    }
}

// Button handler specially for Safari and IE
ui.onKeyUp = function (event)
{
    if (!Prototype.Browser.WebKit && !Prototype.Browser.IE)
        return;
        
    // Esc
    if (Prototype.Browser.WebKit && event.keyCode == 27)
    {
        if (ui.isDrag())
        {
            ui.endDrag();
            if (ui.selected())
                ui.updateSelection();
        } else if (this == document)
        {
            if (!$('window_cover').visible())
            {
                if (ui.modeType() == ui.MODE.PASTE)
                    ui.cancelPaste();
                else if (ui.modeType() == ui.MODE.SIMPLE)
                    ui.updateSelection();
                ui.selectMode('select_simple');
            }
        } else if (this.hasClassName('dialogWindow'))
            ui.hideDialog(this.id);
        else
            this.hide();
        chem.stopEventPropagation(event);
        return chem.preventDefault(event);
    }

    // The rest is for IE
    if (event.keyCode != 46 && Prototype.Browser.WebKit)
        return;

    if (this != document)
        return;

    chem.stopEventPropagation(event);
    
    switch (event.keyCode)
    {
    case 46: // Delete
        if (!ui.isDrag() && ui.selected())
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
}

ui.onKeyPress_Dialog = function (event) 
{
    chem.stopEventPropagation(event);
    if (event.keyCode == 27)
    {
        ui.hideDialog(this.id);
        return chem.preventDefault(event);
    }
}

ui.onKeyPress_InputLabel = function (event) 
{
    chem.stopEventPropagation(event);
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
            
        if (label == 'A' || chem.Element.getElementByLabel(label) != null)
        {
            ui.addUndoAction(ui.Action.fromAtomAttrs(this.atom_id, {label: label, charge: charge}), true);
            ui.render.update();
        }
        return chem.preventDefault(event);
    }
    if (event.keyCode == 27)
    {
        this.hide();
        return chem.preventDefault(event);
    }
}

//
// Open file section
//
ui.onClick_OpenFile = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;
    if (ui.modeType() == ui.MODE.PASTE)
    {
        ui.cancelPaste();
        ui.selectMode('select_simple');
    }
    ui.showDialog('open_file');
    $('radio_open_from_input').checked = true;
    ui.onSelect_OpenFromInput();
}

ui.getFile = function ()
{
    var frame_body;

    if ('contentDocument' in $('buffer_frame'))
        frame_body = $('buffer_frame').contentDocument.body;
    else // IE7
        frame_body = document.frames['buffer_frame'].document.body;

    return chem.getElementTextContent(frame_body);
}

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
        var request = new Ajax.Request(ui.path + 'layout?smiles=' + encodeURIComponent(smiles),
                {
                    method: 'get',
                    asynchronous : true,
                    onComplete: function (res)
                    {
                        if (res.responseText.startsWith('Ok.'))
                            ui.updateMolecule(ui.parseMolfile(res.responseText));
                    }
                });
    } else if (!ui.standalone && force_layout)
    {
        var request = new Ajax.Request(ui.path + 'layout',
                {
                    method: 'post',
                    asynchronous : true,
                    parameters: {moldata: mol_string},
                    onComplete: function (res)
                    {
                        if (res.responseText.startsWith('Ok.'))
                            ui.updateMolecule(ui.parseMolfile(res.responseText));
                    }
                });
    } else {
        ui.updateMolecule(ui.parseMolfile(mol_string));
    }
};

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
    if (ui.modeType() == ui.MODE.PASTE)
    {
        ui.cancelPaste();
        ui.selectMode('select_simple');
    }
    ui.showDialog('save_file');
    ui.onChange_FileFormat(null, true);
}

ui.onChange_FileFormat = function (event, update)
{
    var output = $('output_mol');
    var el = $('file_format');
    
    if (update == true)
    {
        var saver = new chem.MolfileSaver();
        output.molfile = saver.saveMolecule(ui.ctab);
        
        try
        {
            saver = new chem.SmilesSaver();
            output.smiles = saver.saveMolecule(ui.ctab);
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
}

//
// Zoom section
//
ui.onClick_ZoomIn = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;
        
    ui.scale += ui.SCALE_INCR;
        
    if (ui.scale >= ui.SCALE_MAX)
        this.addClassName('buttonDisabled');
    $('zoom_out').removeClassName('buttonDisabled');

    ui.render.setScale(ui.scale);
    ui.render.update();
}

ui.onClick_ZoomOut = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;
        
    ui.scale -= ui.SCALE_INCR;
        
    if (ui.scale <= ui.SCALE_MIN)
        this.addClassName('buttonDisabled');
    $('zoom_in').removeClassName('buttonDisabled');

    ui.render.setScale(ui.scale);
    ui.render.update();
}

//
// Automatic layout
//
ui.onClick_CleanUp = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;
        
    if (ui.modeType() == ui.MODE.PASTE)
    {
        ui.cancelPaste();
        ui.selectMode('select_simple');
    }
    
    var ms = new chem.MolfileSaver();
    
    try
    {
        ui.loadMolecule(ms.saveMolecule(ui.ctab), true);
    } catch (er)
    {
        alert("Molfile: " + er.message);
    }
}

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
    bonds: []
};

ui.page2canvas = function (pos)
{
    var offset = ui.client_area.cumulativeOffset();
    
    return {
            x: pos.pageX - offset.left + ui.client_area.scrollLeft,
            y: pos.pageY - offset.top + ui.client_area.scrollTop
           };
}

ui.page2canvas2 = function (pos)
{
    var offset = ui.client_area.cumulativeOffset();
    
    return {
            x: pos.pageX - offset.left,
            y: pos.pageY - offset.top
           };
}

//
// Scrolling
//
ui.scrollLeft = null;
ui.scrollTop = null;

ui.onScroll_ClientArea = function ()
{
    if ($('input_label').visible())
        $('input_label').hide();
        
    if (ui.scrollLeft != null && ui.isDrag())
    {
        var delta_x = ui.client_area.scrollLeft - ui.scrollLeft;
        var delta_y = ui.client_area.scrollTop - ui.scrollTop;
        
        ui.drag.start_pos.x -= delta_x;
        ui.drag.start_pos.y -= delta_y;
        ui.drag.last_pos.x -= delta_x;
        ui.drag.last_pos.y -= delta_y;
    }

    ui.scrollLeft = ui.client_area.scrollLeft;
    ui.scrollTop = ui.client_area.scrollTop;
}

//
// Clicking
//
ui.dbl_click = false;

ui.onClick_Atom = function (event, id)
{
    if (ui.mouse_moved)
        return true;
        
    if (event.altKey)
    {
        ui.showAtomProperties(id);
        return true;
    }

    ui.dbl_click = false;
    
    setTimeout(function ()
    {
        if (ui.dbl_click)
            return true;
            
        switch (ui.modeType())
        {
        case ui.MODE.SIMPLE:
            
            /* // TODO: Add to selection
            if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
            {
                var idx = ui.selection.atoms.indexOf(id);
                if (idx != -1)
                    ui.selection.atoms.splice(idx, 1);
                else
                    ui.selection.atoms = ui.selection.atoms.concat(id);
                ui.updateSelection(ui.selection.atoms, ui.selection.bonds);
                break;
            }
            */
            
            var input_el = $('input_label');

            var offset_client = ui.client_area.cumulativeOffset();
            var atom_pos = ui.render.atomGetPos(id);
            var offset_atom =
            {
                left: offset_client.left + atom_pos.x - ui.client_area.scrollLeft,
                top: offset_client.top + atom_pos.y - ui.client_area.scrollTop
            };
            
            var offset = Math.ceil(ui.render.settings.labelFontSize * ui.scale / 100);
            var d = Math.ceil(4 * ui.scale / 100);
            
            if (offset > 16)
                offset = 16;
                
            input_el.atom_id = id;
            input_el.value = ui.render.atomGetAttr(id, 'label');
            input_el.style.fontSize = (offset * 2).toString() + 'px';
            
            input_el.show();

            var offset_parent = Element.cumulativeOffset(input_el.offsetParent);
                
            input_el.style.left = (offset_atom.left - offset_parent.left - offset - d).toString() + 'px';
            input_el.style.top = (offset_atom.top - offset_parent.top - offset - d).toString() + 'px';
            
            input_el.activate();
            break;

        case ui.MODE.ERASE:
            ui.addUndoAction(ui.Action.fromAtomDeletion(id));
            ui.render.update();
            break;

        case ui.MODE.ATOM:
            ui.addUndoAction(ui.Action.fromAtomAttrs(id, {label: ui.atomLabel()}), true);
            ui.render.update();
            break;

        case ui.MODE.BOND:
            var atom = ui.atomForNewBond(id);
            ui.addUndoAction(ui.Action.fromBondAddition(ui.bondType(), id, atom.atom, atom.pos)[0]);
            ui.render.update();
            break;

        case ui.MODE.PATTERN:
            ui.addUndoAction(ui.Action.fromPatternOnAtom(id, ui.pattern()), true);
            ui.render.update();
            break;

        case ui.MODE.SGROUP:
            ui.updateSelection([id], []);
            ui.showSGroupProperties(null);
            break;
        }
    }, ui.DBLCLICK_INTERVAL);
	return true;
}

ui.onDblClick_Atom = function (event, id)
{
    if (event.altKey)
        return true;

    ui.dbl_click = true;

    if (ui.modeType() != ui.MODE.PASTE)
        ui.showAtomProperties(id);
	return true;
}

ui.onClick_Bond = function (event, id)
{
    if (ui.mouse_moved)
        return true;
    
    switch (ui.modeType())
    {
    case ui.MODE.SIMPLE:
    case ui.MODE.ATOM:
        /* // TODO: Add to selection
        if ((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx))
        {
            var idx = ui.selection.bonds.indexOf(id);
            if (idx != -1)
                ui.selection.bonds.splice(idx, 1);
            else
                ui.selection.bonds = ui.selection.bonds.concat(id);
            ui.updateSelection(ui.selection.atoms, ui.selection.bonds);
            break;
        }
        */

        var bond_type = ui.render.bondGetAttr(id, 'type');
        
        if (bond_type >= 4)
            bond_type = 1;
        else
            bond_type = (bond_type % 3) + 1;
            
        ui.addUndoAction(ui.Action.fromBondAttrs(id, {type: bond_type}));
        ui.render.update();
        break;

    case ui.MODE.ERASE:
        ui.addUndoAction(ui.Action.fromBondDeletion(id));
        ui.render.update();
        break;

    case ui.MODE.BOND:
        var attrs = ui.bondType();
        var bond = ui.ctab.bonds.get(id);
        
        if (attrs.stereo != chem.Molecule.BOND.STEREO.NONE &&
            bond.type == chem.Molecule.BOND.TYPE.SINGLE && attrs.type == chem.Molecule.BOND.TYPE.SINGLE &&
            bond.stereo == attrs.stereo)
        {
            ui.addUndoAction(ui.Action.fromBondFlipping(id));
        } else
        {
            if (bond.type == attrs.type)
            {
                if (bond.type == chem.Molecule.BOND.TYPE.SINGLE)
                {
                    if (bond.stereo == chem.Molecule.BOND.STEREO.NONE && bond.stereo == attrs.stereo)
                    {
                        attrs.type = chem.Molecule.BOND.TYPE.DOUBLE;
                    }
                } else if (bond.type == chem.Molecule.BOND.TYPE.DOUBLE)
                {
                    attrs.type = chem.Molecule.BOND.TYPE.TRIPLE;
                }
            }
            ui.addUndoAction(ui.Action.fromBondAttrs(id, attrs), true);
        }        
        ui.render.update();
        break;

    case ui.MODE.PATTERN:
        ui.addUndoAction(ui.Action.fromPatternOnElement(id, ui.pattern(), false), true);
        ui.render.update();
        break;
        
    case ui.MODE.SGROUP:
        var bond = ui.ctab.bonds.get(id);
        
        ui.updateSelection([bond.begin, bond.end], [id]);
        ui.showSGroupProperties(null);
        break;
    }
	return true;
}

ui.onClick_SGroup = function (event, sid)
{
    ui.dbl_click = false;
    
    setTimeout(function ()
    {
        if (ui.dbl_click)
            return true;
            
        if (ui.modeType() == ui.MODE.ERASE)
        {
            // remove highlighting
            ui.highlightSGroup(sid, false);

            ui.addUndoAction(ui.Action.fromSgroupDeletion(sid));
            ui.render.update();
        }
    }, ui.DBLCLICK_INTERVAL);
    
	return true;
}

ui.onDblClick_SGroup = function (event, sid)
{
    ui.dbl_click = true;
    
    if (ui.modeType() != ui.MODE.PASTE)
    {
        if (ui.selected())
            ui.updateSelection();
        ui.showSGroupProperties(sid);
    }
        
	return true;
}

ui.onClick_Canvas = function (event)
{
    if (ui.mouse_moved)
        return;
    
    switch (ui.modeType())
    {
    case ui.MODE.ATOM:
        var pos = ui.page2canvas(event);
        
        ui.addUndoAction(ui.Action.fromAtomAddition(pos, {label: ui.atomLabel()}));
        ui.render.update();
        break;
        
    case ui.MODE.BOND:
        var pos = ui.page2canvas(event);
        var bond = ui.bondType();
        
        var v = new chem.Vec2(ui.scale / 2, 0);
        
        if (bond.type == chem.Molecule.BOND.TYPE.SINGLE)
            v = v.rotate(-Math.PI / 6);
        
        ui.addUndoAction(ui.Action.fromBondAddition(bond, {label: 'C'}, {label: 'C'}, {x: pos.x - v.x, y: pos.y - v.y}, {x: pos.x + v.x, y: pos.y + v.y})[0]);
        ui.render.update();
        break;

    case ui.MODE.PATTERN:
        var pos = ui.page2canvas(event);
        
        ui.addUndoAction(ui.Action.fromPatternOnCanvas(pos, ui.pattern()));
        ui.render.update();
        break;
        
    case ui.MODE.PASTE:
        ui.addUndoAction(ui.Action.fromFragmentAddition(ui.pasted.atoms, ui.pasted.bonds, ui.pasted.sgroups));
        ui.render.update();
        ui.pasted.atoms.clear();
        ui.pasted.bonds.clear();
        ui.pasted.sgroups.clear();
        ui.selectMode('select_simple');
        break;
    }
}

// Get new atom id/label and pos for bond being added to existing atom
ui.atomForNewBond = function (id)
{
    var neighbours = new Array();
    var pos = ui.render.atomGetPos(id);
    
    ui.render.atomGetNeighbors(id).each(function (nei)
    {
        var nei_pos = ui.render.atomGetPos(nei.aid);
        
        if (chem.Vec2.dist(pos, nei_pos) < ui.scale * 0.1)
            return;
        
        neighbours.push({id: nei.aid, v: chem.Vec2.diff(nei_pos, pos)});
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
        angle = chem.Vec2.angle(neighbours[i].v, neighbours[(i + 1) % neighbours.length].v);
        
        if (angle < 0)
            angle += 2 * Math.PI;
        
        if (angle > max_angle)
            max_i = i, max_angle = angle;
    }
    
    var v = new chem.Vec2(ui.scale, 0);
    
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
                var nei_v = chem.Vec2.diff(pos, nei_pos);
                var nei_angle = Math.atan2(nei_v.y, nei_v.x);
                
                ui.render.atomGetNeighbors(nei.aid).each(function (nei_nei)
                {
                    var nei_nei_pos = ui.render.atomGetPos(nei_nei.aid);
                    
                    if (nei_nei.bid == nei.bid || chem.Vec2.dist(nei_pos, nei_nei_pos) < ui.scale * 0.1)
                        return;
                        
                    var v_diff = chem.Vec2.diff(nei_nei_pos, nei_pos);
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
            
        angle = (max_angle / 2) + Math.atan2(neighbours[max_i].v.y, neighbours[max_i].v.x)

        v = v.rotate(angle);
    }
    
    v.add_(pos);
    
    var a = ui.render.findClosestAtom(ui.render.client2Obj(v), ui.scale * 0.1);
    
    if (a == null)
        a = {label: 'C'};
    else
        a = a.id;

    return {atom: a, pos: v};
}

//
// Canvas size
//
ui.onOffsetChanged = function (newOffset, oldOffset)
{
    if (oldOffset == null)
        return;
        
    var delta = new chem.Vec2(newOffset.x - oldOffset.x, newOffset.y - oldOffset.y);
        
    ui.client_area.scrollLeft += delta.x;
    ui.client_area.scrollTop += delta.y;
    
    ui.undoStack.each(function (action)
    {
        action.operations.each(function (op)
        {
            if (op.type == ui.Action.OPERATION.ATOM_POS || op.type == ui.Action.OPERATION.ATOM_ADD)
            {
                op.params.pos.add_(delta);
            }
        }, this);
    }, this);
}

//
// Dragging
//
ui.endDrag = function ()
{
    if (ui.drag.action != null)
    {
        ui.addUndoAction(ui.drag.action);
        
        if (ui.modeType() == ui.MODE.SIMPLE)
            ui.removeDummyAction();
    }
    
    ui.drag.atom_id = null;
    ui.drag.bond_id = null;
    
    ui.drag.selection = false;
    
    ui.drag.new_atom_id = null;
    
    ui.drag.start_pos = null;
    ui.drag.last_pos = null;
    
    ui.drag.action = null;
    
    ui.render.drawSelectionRectangle(null);
    ui.updateClipboardButtons();
}

ui.isDrag = function ()
{
    return ui.drag.start_pos != null;
}

ui.updateSelection = function (atoms, bonds)
{
    if (Object.isUndefined(atoms))
        atoms = [];
    if (Object.isUndefined(bonds))
        bonds = [];

    bonds = bonds.filter(function (bid)
    {
        var bond = ui.ctab.bonds.get(bid);
        if (atoms.indexOf(bond.begin) != -1 && atoms.indexOf(bond.end) != -1)
            return true;
        return false;
    });

    ui.selection.atoms = atoms;
    ui.selection.bonds = bonds;
    ui.render.setSelection(atoms, bonds);
    ui.render.update();
    
    ui.updateClipboardButtons();
}

ui.selected = function ()
{
    return ui.selection.atoms.length > 0; // bond is selected only if both atoms are
}

ui.selectAll = function ()
{
    var mode = ui.modeType();
    if (mode == ui.MODE.ERASE || mode == ui.MODE.SGROUP)
        ui.selectMode('select_simple');

    var alist = [], blist = [];
    
    ui.ctab.atoms.each(function(aid) {
        alist.push(aid);
    });

    ui.ctab.bonds.each(function(bid) {
        blist.push(bid);
    });

    ui.updateSelection(alist, blist);
}

ui.removeSelected = function ()
{
    ui.addUndoAction(ui.Action.fromFragmentDeletion());
    ui.selection.atoms = [];
    ui.selection.bonds = [];
    ui.render.update();
    ui.updateClipboardButtons();
}

ui.onMouseDown_Atom = function (event, aid)
{
    if ($('input_label').visible())
        $('input_label').hide();

    if (ui.modeType() == ui.MODE.PASTE)
        return false;
    
    ui.mouse_moved = false;
    ui.drag.atom_id = aid;
    ui.drag.start_pos = {x: event.pageX, y: event.pageY};
    ui.drag.last_pos = {x: event.pageX, y: event.pageY};
    
    if (ui.selection.atoms.indexOf(aid) == -1)
    {
        if (ui.modeType() == ui.MODE.SIMPLE)
            ui.drag.action = ui.Action.fromAtomPos(aid);
        ui.drag.selection = false;
        ui.updateSelection();
    } else
    {
        if (ui.modeType() == ui.MODE.SIMPLE)
            ui.drag.action = ui.Action.fromSelectedAtomsPos();
        ui.drag.selection = true;
    }
	return true;
}

ui.onMouseDown_Bond = function (event, bid)
{
    if ($('input_label').visible())
        $('input_label').hide();

    if (ui.modeType() == ui.MODE.PASTE)
        return false;

    ui.mouse_moved = false;
    ui.drag.bond_id = bid;
    ui.drag.start_pos = {x: event.pageX, y: event.pageY};
    ui.drag.last_pos = {x: event.pageX, y: event.pageY};

    if (ui.selection.bonds.indexOf(bid) == -1)
    {
        if (ui.modeType() == ui.MODE.SIMPLE)
            ui.drag.action = ui.Action.fromBondPos(bid);
        ui.drag.selection = false;
        ui.updateSelection();
    } else
    {
        if (ui.modeType() == ui.MODE.SIMPLE)
            ui.drag.action = ui.Action.fromSelectedAtomsPos();
        ui.drag.selection = true;
    }
	return true;
}

ui.onMouseDown_Canvas = function (event)
{
    if ($('input_label').visible())
        $('input_label').hide();
    
    if (ui.modeType() == ui.MODE.PASTE)
    {
        ui.mouse_moved = true; // to avoid further handling of the click
        ui.addUndoAction(ui.Action.fromFragmentAddition(ui.pasted.atoms, ui.pasted.bonds, ui.pasted.sgroups));
        ui.render.update();
        ui.pasted.atoms.clear();
        ui.pasted.bonds.clear();
        ui.pasted.sgroups.clear();
        ui.selectMode('select_simple');

        return;
    }

    ui.mouse_moved = false;

    var pos = ui.page2canvas2(event);
    
    if (pos.x < ui.client_area.clientWidth && pos.y < ui.client_area.clientHeight)
    {
        ui.drag.start_pos = {x: event.pageX, y: event.pageY};
        ui.drag.last_pos = {x: event.pageX, y: event.pageY};
    }
    
    ui.updateSelection();
}

ui.onMouseMove_Canvas = function (event)
{
    ui.mouse_moved = true;
    
    var mode = ui.modeType();
    
    if (mode == ui.MODE.BOND || mode == ui.MODE.ATOM)
    {
        var type = {type: 1, stereo: chem.Molecule.BOND.STEREO.NONE};
        var label = 'C';
        
        if (mode == ui.MODE.BOND)
            type = ui.bondType();
        else // mode == ui.MODE.ATOM
            label = ui.atomLabel();
        
        if (ui.drag.atom_id == null)
            if (ui.drag.start_pos == null || mode == ui.MODE.ATOM)
                return;
        
        if (mode == ui.MODE.BOND && ui.drag.new_atom_id == -1) // Connect existent atom
            return;
            
        var pos_cursor = ui.page2canvas(event);
        var pos = null;
        
        if (ui.drag.atom_id != null)
            pos = ui.render.atomGetPos(ui.drag.atom_id);
        else
            pos = ui.page2canvas({pageX: ui.drag.start_pos.x, pageY: ui.drag.start_pos.y});
        
        if (chem.Vec2.dist(pos, pos_cursor) < 0.01 * ui.scale)
        {
            if (ui.drag.new_atom_id != null)
                return;
            pos_cursor.x += 10, pos_cursor.y += 10; // Hack to avoid return
        }
            
        var v = chem.Vec2.diff(pos_cursor, pos);
        
        var angle = Math.atan2(v.y, v.x);
        var sign = 1;
        
        if (angle < 0)
            sign = -1;
            
        angle = Math.abs(angle);
        
        var floor = Math.floor(angle / (Math.PI / 12)) * (Math.PI / 12);
        
        if (angle - floor < Math.PI / 24)
            angle = floor;
        else
            angle = floor + (Math.PI / 12);
            
        angle *= sign;
        
        v = new chem.Vec2(ui.scale, 0);
        v = v.rotate(angle);
        v.add_(pos);
            
        if (ui.drag.new_atom_id == null)
        {
            var action_ret = null;
            var begin = ui.drag.atom_id;
            
            if (ui.drag.action != null)
            {
                ui.drag.action.perform();
                
                if (begin != null && Object.isUndefined(ui.ctab.atoms.get(begin)))
                    begin = null;
            }
                
            if (begin == null)
            {
                begin = {label: label};
                pos = ui.page2canvas({pageX: ui.drag.start_pos.x, pageY: ui.drag.start_pos.y});
            } else
                pos = v;
            
            action_ret = ui.Action.fromBondAddition(type, begin, {label: label}, pos, v);
            
            ui.drag.action = action_ret[0];
            ui.drag.atom_id = action_ret[1];
            ui.drag.new_atom_id = action_ret[2];
        } else
            ui.render.atomMove(ui.drag.new_atom_id, v);
    }  else if (mode == ui.MODE.PASTE)
    {
        var anchor_pos = ui.render.atomGetPos(ui.pasted.atoms[0]);
        var cur_pos = ui.page2canvas(event);
        var delta = {x: cur_pos.x - anchor_pos.x, y: cur_pos.y - anchor_pos.y};
        
        ui.render.atomMoveRelMultiple(ui.pasted.atoms, delta);
    } else
    {
        if (ui.drag.atom_id == null && ui.drag.bond_id == null)
        {
            if ((mode == ui.MODE.SIMPLE || mode == ui.MODE.ERASE || mode == ui.MODE.SGROUP) && ui.drag.start_pos != null) // rectangle selection
            {
                var start_pos = ui.page2canvas({pageX: ui.drag.start_pos.x, pageY:ui.drag.start_pos.y});
                var cur_pos = ui.page2canvas(event);
                var rect = {
                    x0: Math.min(start_pos.x, cur_pos.x),
                    x1: Math.max(start_pos.x, cur_pos.x),
                    y0: Math.min(start_pos.y, cur_pos.y),
                    y1: Math.max(start_pos.y, cur_pos.y)
                };
                ui.render.drawSelectionRectangle(rect);
                var sel_list = ui.render.getElementsInRectangle(rect);
                ui.updateSelection(sel_list[0], sel_list[1]);
            }
            return;
        }
            
        if (mode == ui.MODE.ERASE)
            return;
            
        if (mode == ui.MODE.SIMPLE && ui.drag.new_atom_id == -1) // Merging two atoms
            return;
            
        var delta = {x: event.pageX - ui.drag.last_pos.x, y: event.pageY - ui.drag.last_pos.y};
        
        if (ui.drag.atom_id != null || ui.drag.bond_id != null)
        {
            if (ui.drag.selection)
                ui.render.atomMoveRelMultiple(ui.selection.atoms, delta);
            else if (ui.drag.atom_id != null)
                ui.render.atomMoveRel(ui.drag.atom_id, delta);
            else if (ui.drag.bond_id != null)
            {
                var bond = ui.ctab.bonds.get(ui.drag.bond_id);
                ui.render.atomMoveRel(bond.begin, delta);
                ui.render.atomMoveRel(bond.end, delta);
            }
        }

        ui.drag.last_pos = {x: event.pageX, y: event.pageY};
    }
    ui.render.update();
}

ui.onMouseUp_Ketcher = function (event)
{
    if (ui.modeType() == ui.MODE.ERASE)
        if (ui.selected() && ui.isDrag())
            ui.removeSelected();
    if (ui.modeType() == ui.MODE.SGROUP)
        if (ui.selected() && ui.isDrag())
            ui.showSGroupProperties(null);
    ui.endDrag();
    chem.stopEventPropagation(event);
}

//
// Hightlighting and joining
//
ui.onMouseOver_Atom = function (event, aid)
{
    if (!ui.isDrag() && ui.modeType() != ui.MODE.PASTE)
        ui.render.atomSetHighlight(aid, true);
    else if (ui.modeType() == ui.MODE.BOND && ui.drag.atom_id != null && ui.drag.atom_id != aid && ui.drag.new_atom_id != aid)
    {
        if (!Object.isUndefined(ui.render.atomGetNeighbors(ui.drag.atom_id).detect(function (nei)
        {
            if (nei.aid == aid)
                return true;
            return false;
        }, this)))
            return true;
            
        var begin = ui.drag.atom_id;
        var pos = null;
        
        if (ui.drag.action != null)
        {
            ui.drag.action.perform();
            
            if (Object.isUndefined(ui.ctab.atoms.get(begin)))
            {
                begin = {label: 'C'};
                pos = ui.page2canvas({pageX: ui.drag.start_pos.x, pageY: ui.drag.start_pos.y});
            }
        }
        
        var action_ret = ui.Action.fromBondAddition(ui.bondType(), begin, aid, pos);
        ui.drag.action = action_ret[0];
        ui.drag.atom_id = action_ret[1];

        ui.render.update();
        ui.drag.new_atom_id = -1; // after update() to avoid mousout

        ui.render.atomSetHighlight(aid, true);
    } else if (ui.modeType() == ui.MODE.SIMPLE && ui.drag.atom_id != null && ui.drag.atom_id != aid && 
        ui.drag.new_atom_id == null && !ui.drag.selection)
    {
        if (ui.drag.action == null)
            throw new Error("action is null")
            
        ui.drag.action.perform();
        ui.drag.action = ui.Action.fromAtomMerge(ui.drag.atom_id, aid);
        ui.drag.atom_id = ui.atomMap.indexOf(ui.drag.atom_id);

        ui.render.update();
        ui.drag.new_atom_id = -1; // after update() to avoid mousout
        ui.render.atomSetHighlight(aid, true);
    }
	return true;
}

ui.onMouseOut_Atom = function (event, aid)
{
    ui.render.atomSetHighlight(aid, false);
    if (ui.modeType() == ui.MODE.BOND && ui.drag.atom_id != null && ui.drag.atom_id != aid && ui.drag.new_atom_id == -1)
        ui.drag.new_atom_id = null;
    else if (ui.modeType() == ui.MODE.SIMPLE && ui.drag.atom_id != null && ui.drag.atom_id != ui.atomMap.indexOf(aid) && ui.drag.new_atom_id == -1)
    {
        ui.drag.action.perform();
        ui.drag.atom_id = ui.atomMap[ui.drag.atom_id];
        ui.drag.new_atom_id = null;
        ui.drag.action = ui.Action.fromAtomPos(ui.drag.atom_id);
        ui.drag.last_pos = Object.clone(ui.drag.start_pos);
    }
	return true;
}

ui.onMouseOver_Bond = function (event, bid)
{
    if (!ui.isDrag() && ui.modeType() != ui.MODE.PASTE)
        ui.render.bondSetHighlight(bid, true);
	return true;
}

ui.onMouseOut_Bond = function (event, bid)
{
    ui.render.bondSetHighlight(bid, false);
	return true;
}

ui.highlightSGroup = function (sid, highlight)
{
    ui.render.sGroupSetHighlight(sid, highlight);
    
    var atoms = ui.render.sGroupGetAtoms(sid);
    
    atoms.each(function (id)
    {
        ui.render.atomSetSGroupHighlight(id, highlight);
    }, this);
}

ui.onMouseOver_SGroup = function (event, sid)
{
    if (!ui.isDrag() && ui.modeType() != ui.MODE.PASTE)
        ui.highlightSGroup(sid, true);
	return true;
}

ui.onMouseOut_SGroup = function (event, sid)
{
    ui.highlightSGroup(sid, false);
	return true;
}

//
// Atom properties dialog
//
ui.showAtomProperties = function (id)
{
    $('atom_properties').atom_id = id;
    $('atom_label').value = ui.render.atomGetAttr(id, 'label');
    ui.onChange_AtomLabel.call($('atom_label'));
    $('atom_charge').value = ui.render.atomGetAttr(id, 'charge');
    var value = ui.render.atomGetAttr(id, 'isotope');
    $('atom_isotope').value = (value == 0 ? '' : value);
    value = ui.render.atomGetAttr(id, 'valence');
    $('atom_valence').value = (value == 0 ? '' : value);
    $('atom_radical').value = ui.render.atomGetAttr(id, 'radical');
    
    ui.showDialog('atom_properties');
    $('atom_label').activate();
}

ui.applyAtomProperties = function ()
{
    ui.hideDialog('atom_properties');
    
    var id = $('atom_properties').atom_id;
    
    ui.addUndoAction(ui.Action.fromAtomAttrs(id, 
    {
        label: $('atom_label').value,
        charge: parseInt($('atom_charge').value),
        isotope: $('atom_isotope').value == '' ? 0 : parseInt($('atom_isotope').value),
        valence: $('atom_valence').value == '' ? 0 : parseInt($('atom_valence').value),
        radical: parseInt($('atom_radical').value)
    }), true);
        
    ui.render.update();
}

ui.onChange_AtomLabel = function ()
{
    this.value = this.value.strip().capitalize();
    
    var element = chem.Element.getElementByLabel(this.value);
    
    if (element == null && this.value != 'A' && this.value != '*')
    {
        this.value = ui.render.atomGetAttr($('atom_properties').atom_id, 'label');

        if (this.value != 'A' && this.value != '*')
            element = chem.Element.getElementByLabel(this.value);
    }
    
    if (this.value == 'A')
        chem.setElementTextContent($('atom_number'), "any");
    else if (this.value == '*')
        chem.setElementTextContent($('atom_number'), "*");
    else
        chem.setElementTextContent($('atom_number'), element.toString());
}

ui.onChange_AtomCharge = function ()
{
}

ui.onChange_AtomIsotope = function ()
{
    if (this.value == chem.getElementTextContent($('atom_number')) || this.value.strip() == '' || this.value == '0')
        this.value = '';
    else if (!this.value.match(/^[1-9][0-9]{0,2}$/))
        this.value = ui.render.atomGetAttr($('atom_properties').atom_id, 'isotope');
}

ui.onChange_AtomValence = function ()
{
    if (this.value.strip() == '' || this.value == '0')
        this.value = '';
    else if (!this.value.match(/^[1-9]$/))
        this.value = ui.render.atomGetAttr($('atom_properties').atom_id, 'valence');
}

//
// S-Group properties
//
ui.showSGroupProperties = function (id)
{
    if ($('sgroup_properties').visible())
        return;
        
    var type = (id == null) ? 'GEN' : ui.render.sGroupGetType(id);
    
    $('sgroup_properties').sgroup_id = id;
    $('sgroup_type').value = type;
    ui.onChange_SGroupType.call($('sgroup_type'));
    
    if (type == 'SRU')
    {
        $('sgroup_connection').value = ui.render.sGroupGetAttr(id, 'connectivity');
        $('sgroup_label').value = ui.render.sGroupGetAttr(id, 'subscript');
    } else if (type == 'MUL')
        $('sgroup_label').value = ui.render.sGroupGetAttr(id, 'mul');
    else if (type == 'SUP')
        $('sgroup_label').value = ui.render.sGroupGetAttr(id, 'name');
    
    ui.showDialog('sgroup_properties');
    $('sgroup_type').activate();
}

ui.applySGroupProperties = function ()
{
    ui.hideDialog('sgroup_properties');
    
    var id = $('sgroup_properties').sgroup_id;
    
    var type = $('sgroup_type').value;
    var attrs = 
    {
        mul: null,
        connectivity: '',
        name: '',
        subscript: ''
    };

    if (type == 'SRU')
    {
        attrs.connectivity = $('sgroup_connection').value;
        attrs.subscript = $('sgroup_label').value;
    } else if (type == 'MUL')
        attrs.mul = parseInt($('sgroup_label').value);
    else if (type == 'SUP')
        attrs.name = $('sgroup_label').value;

    if (id == null)
    {
        ui.addUndoAction(ui.Action.fromSgroupAddition(type, attrs, ui.selection.atoms));
        ui.updateSelection();
    } else
    {
        ui.addUndoAction(ui.Action.fromSgroupAttrs(id, type, attrs), true);
        ui.render.update();
    }
}

ui.onChange_SGroupLabel = function ()
{
    if ($('sgroup_type').value == 'MUL' && !this.value.match(/^[1-9][0-9]{0,2}$/))
        this.value = '1';
}

ui.onChange_SGroupType = function ()
{
    var type = $('sgroup_type').value;

    $('sgroup_label').disabled = (type != 'SRU') && (type != 'MUL') && (type != 'SUP');
    $('sgroup_connection').disabled = (type != 'SRU');
    
    if (type == 'MUL' && !$('sgroup_label').value.match(/^[1-9][0-9]{0,2}$/))
        $('sgroup_label').value = '1';
    else if (type == 'SRU')
        $('sgroup_label').value = 'n';
    else if (type == 'GEN')
        $('sgroup_label').value = '';
    else if (type == 'SUP')
        $('sgroup_label').value = 'name';
}

//
// Clipboard actions 
//

ui.clipboard = null;
ui.pasted = {atoms: [], bonds: [], sgroups: []};

ui.isClipboardEmpty = function ()
{
    return ui.clipboard == null;
}

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
}

ui.copy = function ()
{
    ui.clipboard = 
    {
        atoms: new Array(),
        bonds: new Array(),
        sgroups: new Array()
    };
    
    var mapping = {};
    var sgroup_counts = {};

    ui.selection.atoms.each(function (id)
    {
        var new_atom = Object.clone(ui.ctab.atoms.get(id));
        new_atom.pos = ui.render.atomGetPos(id);
        
        if (new_atom.sgroup != -1)
            new_atom.sgroup = -1;
        
        mapping[id] = ui.clipboard.atoms.push(new chem.Molecule.Atom(new_atom)) - 1;
    });
    
    ui.selection.bonds.each(function (id)
    {
        var new_bond = Object.clone(ui.ctab.bonds.get(id));
        new_bond.begin = mapping[new_bond.begin];
        new_bond.end = mapping[new_bond.end];
        ui.clipboard.bonds.push(new chem.Molecule.Bond(new_bond));
    });

    // determine selected sgroups
    ui.selection.atoms.each(function (id)
    {
        var sg = ui.render.atomGetSGroups(id);
        
        if (sg.length > 0)
        {
            if (sg[0] in sgroup_counts)
                sgroup_counts[sg[0]]++;
            else
                sgroup_counts[sg[0]] = 1;
        }
    });
    
    ui.ctab.sgroups.each(function (sid, sg)
    {
        if ((sid in sgroup_counts) && (sgroup_counts[sid] == ui.render.sGroupGetAttr(sid, 'atoms').length))
        {
            var new_sgroup = 
            {
                type: ui.render.sGroupGetType(sid),
                mul: ui.render.sGroupGetAttr(sid, 'mul'),
                connectivity: ui.render.sGroupGetAttr(sid, 'connectivity'),
                name: ui.render.sGroupGetAttr(sid, 'name'),
                subscript: ui.render.sGroupGetAttr(sid, 'subscript'),
                atoms: ui.render.sGroupGetAttr(sid, 'atoms').clone()
            }
            
            for (var i = 0; i < new_sgroup.atoms.length; i++)
            {
                new_sgroup.atoms[i] = mapping[new_sgroup.atoms[i]];
            }
            
            ui.clipboard.sgroups.push(new_sgroup) - 1;
        }
    });
}

ui.paste = function ()
{
    var mapping = {};
    var id, i;
    
    for (id = 0; id < ui.clipboard.atoms.length; id++)
    {
        var atom = ui.clipboard.atoms[id];
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
        
        sgroup.atoms.each(function(id)
        {
            ui.render.atomSetSGroup(mapping[id], sid);
        }, this);    
            
        ui.pasted.sgroups.push(sid);
    }, this);

    ui.selectMode(null);
    ui.render.update();
}

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
}

ui.onClick_Cut = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;
        
    ui.copy();
    ui.removeSelected();
}

ui.onClick_Copy = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;
        
    ui.copy();
    ui.updateSelection();
}

ui.onClick_Paste = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;
        
    if (ui.modeType() == ui.MODE.PASTE)
        ui.cancelPaste();
    ui.paste();
}

//
// Undo/redo actions
//
ui.atomMap = new Array();
ui.bondMap = new Array();
ui.sgroupMap = new Array();

ui.Action = function ()
{
    this.operations = new Array();
}

ui.Action.OPERATION =
{
    ATOM_POS:        1,
    ATOM_ATTR:       2,
    ATOM_ADD:        3,
    ATOM_DEL:        4,
    BOND_ATTR:       5,
    BOND_ADD:        6,
    BOND_DEL:        7, 
    BOND_FLIP:       8, 
    CANVAS_LOAD:     9,
    SGROUP_ATTR:     10,
    SGROUP_ADD:      11,
    SGROUP_DEL:      12,
    SGROUP_ATOM_ADD: 13,
    SGROUP_ATOM_DEL: 14
};

ui.Action.prototype.addOperation = function (type, params)
{
    var op = 
    {
        type: type,
        params: params,
        inverted: 
        {
            type: null,
            params: null,
            inverted: null
        }
    };
    
    op.inverted.inverted = op;
    this.operations.push(op);
    return op;
}

ui.Action.prototype.mergeWith = function (action)
{
    this.operations = this.operations.concat(action.operations);
}

// Perform action and return inverted one
ui.Action.prototype.perform = function ()
{
    var action = new ui.Action();
    var prev_op = null;
    var idx = 0;
    
    this.operations.each(function (op)
    {
        switch (op.type)
        {
        case ui.Action.OPERATION.ATOM_POS:
            op.inverted.type = ui.Action.OPERATION.ATOM_POS;
            op.inverted.params =
            {
                id: op.params.id,
                pos: ui.render.atomGetPos(ui.atomMap[op.params.id])
            };
            ui.render.atomMove(ui.atomMap[op.params.id], op.params.pos);
            break;
            
        case ui.Action.OPERATION.ATOM_ATTR:
            op.inverted.type = ui.Action.OPERATION.ATOM_ATTR;
            op.inverted.params =
            {
                id: op.params.id,
                attr_name: op.params.attr_name,
                attr_value: ui.render.atomGetAttr(ui.atomMap[op.params.id], op.params.attr_name)
            };
            ui.render.atomSetAttr(ui.atomMap[op.params.id], op.params.attr_name, op.params.attr_value);
            break;
            
        case ui.Action.OPERATION.ATOM_ADD:
            op.inverted.type = ui.Action.OPERATION.ATOM_DEL;
            
            var id = ui.render.atomAdd(op.params.pos, op.params.atom);
            
            if (op.inverted.params == null)
            {
                op.inverted.params =
                {
                    id: ui.atomMap.push(id) - 1
                };
            } else
                ui.atomMap[op.inverted.params.id] = id;
            break;
            
        case ui.Action.OPERATION.ATOM_DEL:
            op.inverted.type = ui.Action.OPERATION.ATOM_ADD;
            op.inverted.params =
            {
                pos: ui.render.atomGetPos(ui.atomMap[op.params.id]),
                atom: ui.ctab.atoms.get(ui.atomMap[op.params.id])
            };
            ui.render.atomRemove(ui.atomMap[op.params.id]);
            break;
            
        case ui.Action.OPERATION.BOND_ATTR:
            op.inverted.type = ui.Action.OPERATION.BOND_ATTR;
            op.inverted.params =
            {
                id: op.params.id,
                attr_name: op.params.attr_name,
                attr_value: ui.render.bondGetAttr(ui.bondMap[op.params.id], op.params.attr_name)
            };
            ui.render.bondSetAttr(ui.bondMap[op.params.id], op.params.attr_name, op.params.attr_value);
            break;
            
        case ui.Action.OPERATION.BOND_ADD:
            op.inverted.type = ui.Action.OPERATION.BOND_DEL;
            
            var id = ui.render.bondAdd(ui.atomMap[op.params.begin], ui.atomMap[op.params.end], op.params.bond);
            
            if (op.inverted.params == null)
            {
                op.inverted.params =
                {
                    id: ui.bondMap.push(id) - 1
                };
            } else
                ui.bondMap[op.inverted.params.id] = id;
            break;
            
        case ui.Action.OPERATION.BOND_DEL:
            var bond = ui.ctab.bonds.get(ui.bondMap[op.params.id]);
            var begin = ui.atomMap.indexOf(bond.begin);
            var end = ui.atomMap.indexOf(bond.end);

            op.inverted.type = ui.Action.OPERATION.BOND_ADD;
            op.inverted.params =
            {
                begin: begin,
                end:   end,
                bond:  bond
            };
            ui.render.bondRemove(ui.bondMap[op.params.id]);
            break;
            
        case ui.Action.OPERATION.BOND_FLIP:
            op.inverted.type = ui.Action.OPERATION.BOND_FLIP;
            op.inverted.params =
            {
                id: op.params.id
            };
            
            ui.bondMap[op.params.id] = ui.render.bondFlip(ui.bondMap[op.params.id]);
            break;
            
        case ui.Action.OPERATION.CANVAS_LOAD:
            op.inverted.type = ui.Action.OPERATION.CANVAS_LOAD;
            
            if (op.params.atom_map == null)
            {
                op.params.atom_map = new Array();
                op.params.bond_map = new Array();
                op.params.sgroup_map = new Array();
                
                op.params.ctab.atoms.each(function (aid)
                {
                    op.params.atom_map.push(parseInt(aid));
                }, this);
                
                op.params.ctab.bonds.each(function (bid)
                {
                    op.params.bond_map.push(parseInt(bid));
                }, this);

                op.params.ctab.sgroups.each(function (sid)
                {
                    op.params.sgroup_map.push(parseInt(sid));
                }, this);
            }
            
            op.inverted.params =
            {
                ctab: ui.ctab,
                atom_map: ui.atomMap,
                bond_map: ui.bondMap,
                sgroup_map: ui.sgroupMap
            };

            ui.render.ctab.clearVisels();
            ui.ctab = op.params.ctab;
            ui.render.setMolecule(ui.ctab);
            ui.atomMap = op.params.atom_map;
            ui.bondMap = op.params.bond_map;
            ui.sgroupMap = op.params.sgroup_map;
            break;
            
        case ui.Action.OPERATION.SGROUP_ATTR:
            op.inverted.type = ui.Action.OPERATION.SGROUP_ATTR;
            
            var id = ui.sgroupMap[op.params.id];
            var cur_type = ui.render.sGroupGetType(id);
            
            op.inverted.params =
            {
                id: op.params.id,
                type: cur_type,
                attrs:
                {
                    mul: ui.render.sGroupGetAttr(id, 'mul'),
                    connectivity: ui.render.sGroupGetAttr(id, 'connectivity'),
                    name: ui.render.sGroupGetAttr(id, 'name'),
                    subscript: ui.render.sGroupGetAttr(id, 'subscript')
                }
            };
            
            if (op.params.type != op.inverted.params.type)
                ui.render.sGroupSetType(id, op.params.type);
                
            var attrs_hash = new Hash(op.params.attrs);
            attrs_hash.each(function (attr)
            {
                ui.render.sGroupSetAttr(id, attr.key, attr.value);
            }, this);
            break;
            
        case ui.Action.OPERATION.SGROUP_ATOM_ADD:
            op.inverted.type = ui.Action.OPERATION.SGROUP_ATOM_DEL;
            op.inverted.params =
            {
                id: op.params.id
            };
            ui.render.atomSetSGroup(ui.atomMap[op.params.id],  ui.sgroupMap[op.params.sid]);

            break;
            
        case ui.Action.OPERATION.SGROUP_ATOM_DEL:
            op.inverted.type = ui.Action.OPERATION.SGROUP_ATOM_ADD;
            op.inverted.params =
            {
                id: op.params.id,
                sid: ui.sgroupMap.indexOf(ui.render.atomGetSGroups(ui.atomMap[op.params.id])[0])
            };
            ui.render.atomSetSGroup(ui.atomMap[op.params.id], -1);
            break;
            
        case ui.Action.OPERATION.SGROUP_ADD:
            op.inverted.type = ui.Action.OPERATION.SGROUP_DEL;
            
            var id = ui.render.sGroupCreate(op.params.type);
            
            var attrs_hash = new Hash(op.params.attrs);
            attrs_hash.each(function (attr)
            {
                ui.render.sGroupSetAttr(id, attr.key, attr.value);
            }, this);
            
            op.params.atoms.each(function (aid)
            {
                ui.render.atomSetSGroup(ui.atomMap[aid], id);
            }, this);
            
            if (op.inverted.params == null)
            {
                op.inverted.params =
                {
                    id: ui.sgroupMap.push(id) - 1
                };
            } else
                ui.sgroupMap[op.inverted.params.id] = id;
            break;
            
        case ui.Action.OPERATION.SGROUP_DEL:
            var id = ui.sgroupMap[op.params.id];
            var type = ui.render.sGroupGetType(id);
            var atoms = ui.render.sGroupGetAttr(id, 'atoms').clone();
            var i;
            
            for (i = 0; i < atoms.length; i++)
                atoms[i] = ui.atomMap.indexOf(atoms[i]);

            op.inverted.type = ui.Action.OPERATION.SGROUP_ADD;
            op.inverted.params =
            {
                type: type,
                attrs:
                {
                    mul: ui.render.sGroupGetAttr(id, 'mul'),
                    connectivity: ui.render.sGroupGetAttr(id, 'connectivity'),
                    name: ui.render.sGroupGetAttr(id, 'name'),
                    subscript: ui.render.sGroupGetAttr(id, 'subscript')
                },
                atoms: atoms
            };
            // remove highlighting
            ui.highlightSGroup(id, false);
            ui.render.sGroupDelete(id);
            break;
            
        default:
            return;
        }
        action.operations.push(op.inverted);
        idx++;
    }, this);
    
    action.operations.reverse();
    
    return action;
}

ui.Action.prototype.isDummy = function ()
{
    if (this.operations.detect(function (op)
    {
        switch (op.type)
        {
        case ui.Action.OPERATION.ATOM_POS:
            if (ui.render.atomGetPos(ui.atomMap[op.params.id]).equals(op.params.pos))
                return false;
            return true;
        case ui.Action.OPERATION.ATOM_ATTR:
            if (ui.render.atomGetAttr(ui.atomMap[op.params.id], op.params.attr_name) == op.params.attr_value)
                return false;
            return true;
        case ui.Action.OPERATION.BOND_ATTR:
            if (ui.render.bondGetAttr(ui.bondMap[op.params.id], op.params.attr_name) == op.params.attr_value)
                return false;
            return true;
        case ui.Action.OPERATION.SGROUP_ATTR:
            if (ui.render.sGroupGetType(ui.sgroupMap[op.params.id]) == op.params.type)
            {
                var attr_hash = new Hash(op.params.attrs);
                
                if (Object.isUndefined(attr_hash.detect(function (attr)
                {
                    if (ui.render.sGroupGetAttr(ui.sgroupMap[op.params.id], attr.key) == attr.value)
                        return false;
                    return true;
                }, this)))
                    return false;
            }
            return true;
        }
        return true;
    }, this) != null)
    {
        return false;
    }
    
    return true;
}

ui.Action.fromAtomPos = function (id, pos)
{
    var action = new ui.Action();

    action.addOperation(ui.Action.OPERATION.ATOM_POS,
    {
        id: ui.atomMap.indexOf(id),
        pos: ui.render.atomGetPos(id)
    });
    
    if (arguments.length > 1)
        ui.render.atomMove(id, pos);
    
    return action;
}

ui.Action.fromSelectedAtomsPos = function ()
{
    var action = new ui.Action();

    ui.selection.atoms.each(function (id)
    {
        action.addOperation(ui.Action.OPERATION.ATOM_POS,
        {
            id: ui.atomMap.indexOf(id),
            pos: ui.render.atomGetPos(id)
        });
    }, this);
    
    return action;
}

ui.Action.fromBondPos = function (id)
{
    var action = new ui.Action();
    var bond = ui.ctab.bonds.get(id);

    action.addOperation(ui.Action.OPERATION.ATOM_POS,
    {
        id: ui.atomMap.indexOf(bond.begin),
        pos: ui.render.atomGetPos(bond.begin)
    });
    action.addOperation(ui.Action.OPERATION.ATOM_POS,
    {
        id: ui.atomMap.indexOf(bond.end),
        pos: ui.render.atomGetPos(bond.end)
    });
    
    return action;
}

ui.Action.fromAtomAttrs = function (id, attrs)
{
    var action = new ui.Action();
    var id_map = ui.atomMap.indexOf(id);

    attrs = new Hash(attrs);
    
    attrs.each(function (attr)
    {
        action.addOperation(ui.Action.OPERATION.ATOM_ATTR,
        {
            id: id_map,
            attr_name: attr.key,
            attr_value: ui.render.atomGetAttr(id, attr.key)
        });
        ui.render.atomSetAttr(id, attr.key, attr.value);
    }, this);
    
    return action;
}

ui.Action.fromSelectedAtomsAttrs = function (attrs)
{
    var action = new ui.Action();
    
    attrs = new Hash(attrs);
        
    ui.selection.atoms.each(function (id)
    {
        var id_map = ui.atomMap.indexOf(id);

        attrs.each(function (attr)
        {
            action.addOperation(ui.Action.OPERATION.ATOM_ATTR,
            {
                id: id_map,
                attr_name: attr.key,
                attr_value: ui.render.atomGetAttr(id, attr.key)
            });
            ui.render.atomSetAttr(id, attr.key, attr.value);
        }, this);
    }, this);
    
    return action;
}

ui.Action.fromBondAttrs = function (id, attrs)
{
    var action = new ui.Action();
    var id_map = ui.bondMap.indexOf(id);

    attrs = new Hash(attrs);

    attrs.each(function (attr)
    {
        action.addOperation(ui.Action.OPERATION.BOND_ATTR,
        {
            id: id_map,
            attr_name: attr.key,
            attr_value: ui.render.bondGetAttr(id, attr.key)
        });
        ui.render.bondSetAttr(id, attr.key, attr.value);
    }, this);
    return action;
}

ui.Action.fromSelectedBondsAttrs = function (attrs)
{
    var action = new ui.Action();

    attrs = new Hash(attrs);

    ui.selection.bonds.each(function (id)
    {
        var id_map = ui.bondMap.indexOf(id);

        attrs.each(function (attr)
        {
            action.addOperation(ui.Action.OPERATION.BOND_ATTR,
            {
                id: id_map,
                attr_name: attr.key,
                attr_value: ui.render.bondGetAttr(id, attr.key)
            });
            ui.render.bondSetAttr(id, attr.key, attr.value);
        }, this);
    }, this);
    return action;
}

ui.Action.fromAtomAddition = function (pos, atom)
{
    var action = new ui.Action();
    
    action.addOperation(ui.Action.OPERATION.ATOM_DEL,
    {
        id: ui.atomMap.push(ui.render.atomAdd(pos, atom)) - 1
    });
    
    return action;
}

ui.Action.fromBondAddition = function (bond, begin, end, pos, pos2)
{
    var action = new ui.Action();
    var begin_op = null;
    var end_op = null;
    
    if (!Object.isNumber(begin))
    {
        begin = ui.atomMap.push(ui.render.atomAdd(pos, begin)) - 1;
        begin_op = action.addOperation(ui.Action.OPERATION.ATOM_DEL,
        {
            id: begin
        });
        
        pos = pos2;
        begin = ui.atomMap[begin];
    }
    
    if (!Object.isNumber(end))
    {
        end = ui.atomMap.push(ui.render.atomAdd(pos, end)) - 1;
        end_op = action.addOperation(ui.Action.OPERATION.ATOM_DEL,
        {
            id: end
        });

        end = ui.atomMap[end];
    }
    
    action.addOperation(ui.Action.OPERATION.BOND_DEL,
    {
        id: ui.bondMap.push(ui.render.bondAdd(begin, end, bond)) - 1
    });
    
    action.operations.reverse();
    
    return [action, begin, end];
}

// Add action operation to remove atom from s-group if needed
ui.Action.prototype.removeAtomFromSgroupIfNeeded = function (id)
{
    var sgroups = ui.render.atomGetSGroups(id);
    
    if (sgroups.length > 0)
    {
        this.addOperation(ui.Action.OPERATION.SGROUP_ATOM_DEL,
        {
            id: ui.atomMap.indexOf(id)
        });
        
        return true;
    }
    
    return false;
}

// Add action operations to remove whole s-group if needed
ui.Action.prototype.removeSgroupIfNeeded = function (atoms)
{
    var i;
    
    while (atoms.length > 0)
    {
        var id = atoms[0];
        var sgroups = ui.render.atomGetSGroups(id);
        
        atoms.splice(0, 1);

        var atoms_in_group = new Array();
        
        atoms_in_group.push(id);
        
        atoms = atoms.findAll(function (aid)
        {
            var sg = ui.render.atomGetSGroups(aid);

            if (sg.length > 0 && sg[0] == sgroups[0])
            {
                atoms_in_group.push(aid);
                return false;
            }
            return true;
        }, this);
        
        var sg_atoms = ui.render.sGroupGetAttr(sgroups[0], 'atoms');
        
        if (sg_atoms.length == atoms_in_group.length)
        { // delete whole s-group
            this.addOperation(ui.Action.OPERATION.SGROUP_DEL,
            {
                id: ui.sgroupMap.indexOf(sgroups[0])
            });
        }
    }
}

ui.Action.fromAtomDeletion = function (id)
{
    var action = new ui.Action();
    var atoms_to_remove = new Array();
    
    ui.render.atomGetNeighbors(id).each(function (nei)
    {
        action.addOperation(ui.Action.OPERATION.BOND_DEL,
        {
            id: ui.bondMap.indexOf(nei.bid)
        });
        if (ui.render.atomGetDegree(nei.aid) == 1)
        {
            if (action.removeAtomFromSgroupIfNeeded(nei.aid))
                atoms_to_remove.push(nei.aid);
            
            action.addOperation(ui.Action.OPERATION.ATOM_DEL,
            {
                id: ui.atomMap.indexOf(nei.aid)
            });
        }
    }, this);
    
    if (action.removeAtomFromSgroupIfNeeded(id))
        atoms_to_remove.push(id);
        
    action.addOperation(ui.Action.OPERATION.ATOM_DEL,
    {
        id: ui.atomMap.indexOf(id)
    });

    action.removeSgroupIfNeeded(atoms_to_remove);
    
    return action.perform();
}

ui.Action.fromBondDeletion = function (id)
{
    var action = new ui.Action();
    var bond = ui.ctab.bonds.get(id);
    var atoms_to_remove = new Array();
    
    action.addOperation(ui.Action.OPERATION.BOND_DEL,
    {
        id: ui.bondMap.indexOf(id)
    });
    
    if (ui.render.atomGetDegree(bond.begin) == 1)
    {
        if (action.removeAtomFromSgroupIfNeeded(bond.begin))
            atoms_to_remove.push(bond.begin);
            
        action.addOperation(ui.Action.OPERATION.ATOM_DEL,
        {
            id: ui.atomMap.indexOf(bond.begin)
        });
    }
    
    if (ui.render.atomGetDegree(bond.end) == 1)
    {
        if (action.removeAtomFromSgroupIfNeeded(bond.end))
            atoms_to_remove.push(bond.end);
            
        action.addOperation(ui.Action.OPERATION.ATOM_DEL,
        {
            id: ui.atomMap.indexOf(bond.end)
        });
    }

    action.removeSgroupIfNeeded(atoms_to_remove);
    
    return action.perform();
}

ui.Action.fromFragmentAddition = function (atoms, bonds, sgroups)
{
    var action = new ui.Action();
    
    /*
    atoms.each(function (aid)
    {
        ui.render.atomGetNeighbors(aid).each(function (nei)
        {
            if (ui.selection.bonds.indexOf(nei.bid) == -1)
                ui.selection.bonds = ui.selection.bonds.concat([nei.bid]);
        }, this);
    }, this);
    */
    
    // TODO: merge close atoms and bonds
    
    sgroups.each(function (sid)
    {
        var idx = ui.sgroupMap.indexOf(sid);
        
        if (idx == -1)
            idx = ui.sgroupMap.push(sid) - 1;
            
        action.addOperation(ui.Action.OPERATION.SGROUP_DEL,
        {
            id: idx
        });
    }, this);
    

    bonds.each(function (bid)
    {
        var idx = ui.bondMap.indexOf(bid);
        
        if (idx == -1)
            idx = ui.bondMap.push(bid) - 1;
            
        action.addOperation(ui.Action.OPERATION.BOND_DEL,
        {
            id: idx
        });
    }, this);
    

    atoms.each(function (aid)
    {
        var idx = ui.atomMap.indexOf(aid);
        
        if (idx == -1)
            idx = ui.atomMap.push(aid) - 1;
            
        action.addOperation(ui.Action.OPERATION.ATOM_DEL,
        {
            id: idx
        });
    }, this);
    
    return action;
}

ui.Action.fromFragmentDeletion = function ()
{
    var action = new ui.Action();
    var atoms_to_remove = new Array();
    
    ui.selection.atoms.each(function (aid)
    {
        ui.render.atomGetNeighbors(aid).each(function (nei)
        {
            if (ui.selection.bonds.indexOf(nei.bid) == -1)
                ui.selection.bonds = ui.selection.bonds.concat([nei.bid]);
        }, this);
    }, this);
    
    ui.selection.bonds.each(function (bid)
    {
        action.addOperation(ui.Action.OPERATION.BOND_DEL,
        {
            id: ui.bondMap.indexOf(bid)
        });
        
        var bond = ui.ctab.bonds.get(bid);
        
        if (ui.selection.atoms.indexOf(bond.begin) == -1 && ui.render.atomGetDegree(bond.begin) == 1)
        {
            if (action.removeAtomFromSgroupIfNeeded(bond.begin))
                atoms_to_remove.push(bond.begin);
            
            action.addOperation(ui.Action.OPERATION.ATOM_DEL,
            {
                id: ui.atomMap.indexOf(bond.begin)
            });
        }
        if (ui.selection.atoms.indexOf(bond.end) == -1 && ui.render.atomGetDegree(bond.end) == 1)
        {
            if (action.removeAtomFromSgroupIfNeeded(bond.end))
                atoms_to_remove.push(bond.end);
            
            action.addOperation(ui.Action.OPERATION.ATOM_DEL,
            {
                id: ui.atomMap.indexOf(bond.end)
            });
        }
    }, this);
    

    ui.selection.atoms.each(function (aid)
    {
        if (action.removeAtomFromSgroupIfNeeded(aid))
            atoms_to_remove.push(aid);
            
        action.addOperation(ui.Action.OPERATION.ATOM_DEL,
        {
            id: ui.atomMap.indexOf(aid)
        });
    }, this);

    action.removeSgroupIfNeeded(atoms_to_remove);
    
    return action.perform();
}

ui.Action.fromAtomMerge = function (src_id, dst_id)
{
    var action = new ui.Action();
    var dst_idx = ui.atomMap.indexOf(dst_id);
    
    ui.render.atomGetNeighbors(src_id).each(function (nei)
    {
        var bond = ui.ctab.bonds.get(nei.bid);
        var begin, end;
        
        if (bond.begin == nei.aid)
        {
            begin = ui.atomMap.indexOf(nei.aid);
            end = dst_idx;
        } else 
        {
            begin = dst_idx;
            end = ui.atomMap.indexOf(nei.aid);
        }
        if (dst_id != bond.begin && dst_id != bond.end && ui.ctab.findBondId(ui.atomMap[begin], ui.atomMap[end]) == -1) // TODO: improve this
        {
            action.addOperation(ui.Action.OPERATION.BOND_ADD,
            {
                begin: begin,
                end: end,
                bond: bond
            });
        }
        action.addOperation(ui.Action.OPERATION.BOND_DEL,
        {
            id: ui.bondMap.indexOf(nei.bid)
        });
    }, this);
    
    var attrs = new Hash(ui.ctab.atoms.get(src_id));
    
    attrs.each(function (attr)
    {
        action.addOperation(ui.Action.OPERATION.ATOM_ATTR,
        {
            id: dst_idx,
            attr_name: attr.key,
            attr_value: attr.value
        });
    }, this);

    var sg_changed = action.removeAtomFromSgroupIfNeeded(src_id);

    action.addOperation(ui.Action.OPERATION.ATOM_DEL,
    {
        id: ui.atomMap.indexOf(src_id)
    });

    if (sg_changed)
        action.removeSgroupIfNeeded([src_id]);

    return action.perform();
}

ui.Action.fromBondFlipping = function (id)
{
    var action = new ui.Action();
    
    action.addOperation(ui.Action.OPERATION.BOND_FLIP,
    {
        id: ui.bondMap.indexOf(id)
    });
    
    return action.perform();
}

ui.Action.fromPatternOnCanvas = function (pos, pattern)
{
    var angle = 2 * Math.PI / pattern.length;
    var l = ui.scale / (2 * Math.sin(angle / 2));
    var v = new chem.Vec2(0, -l);

    var action = new ui.Action();

    pattern.each(function ()
    {
        action.addOperation(ui.Action.OPERATION.ATOM_DEL,
        {
            id: ui.atomMap.push(ui.render.atomAdd(chem.Vec2.sum(pos, v), {label: 'C'})) - 1
        });
        
        v = v.rotate(angle);
    }, this);
    
    var i = 0;
    
    action.operations.each(function (op)
    {
        var begin = ui.atomMap[op.params.id];
        var end = ui.atomMap[action.operations[(i + 1) % pattern.length].params.id];
        
        action.addOperation(ui.Action.OPERATION.BOND_DEL,
        {
            id: ui.bondMap.push(ui.render.bondAdd(begin, end, {type: pattern[i]})) - 1
        });
        
        i++;
    }, this);
    
    action.operations.reverse();
    
    return action;
}

ui.Action.fromPatternOnAtom = function (aid, pattern)
{
    if (ui.render.atomGetDegree(aid) != 1)
    {
        var atom = ui.atomForNewBond(aid);
        var action_res = ui.Action.fromBondAddition({type: 1}, aid, atom.atom, atom.pos);
        
        var action = ui.Action.fromPatternOnElement(action_res[2], pattern, true);
        
        action.mergeWith(action_res[0]);
        
        return action;
    }
    
    return ui.Action.fromPatternOnElement(aid, pattern, true);
}

ui.Action.fromPatternOnElement = function (id, pattern, on_atom)
{
    var angle = (pattern.length - 2) * Math.PI / (2 * pattern.length);
    var first_idx = 0; //pattern.indexOf(bond.type) + 1; // 0 if there's no
    var pos = null; // center pos
    var v = null; // rotating vector from center
    
    if (on_atom)
    {
        var nei_id = ui.render.atomGetNeighbors(id)[0].aid;
        var atom_pos = ui.render.atomGetPos(id);
        
        pos = chem.Vec2.diff(atom_pos, ui.render.atomGetPos(nei_id));
        pos = pos.scaled(ui.scale / pos.length());
        v = pos.negated();
        pos.add_(atom_pos);
        angle = Math.PI - 2 * angle;
    } else
    {
        var bond = ui.ctab.bonds.get(id);
        var begin_pos = ui.render.atomGetPos(bond.begin);
        var end_pos = ui.render.atomGetPos(bond.end);
        
        var v = chem.Vec2.diff(end_pos, begin_pos);
        var l = v.length() / (2 * Math.cos(angle));
        
        v = v.scaled(l / v.length());

        var v_sym = v.rotate(-angle);
        v = v.rotate(angle);
        
        var pos = chem.Vec2.sum(begin_pos, v);
        var pos_sym = chem.Vec2.sum(begin_pos, v_sym);
        
        var cnt = 0, bcnt = 0;
        var cnt_sym = 0, bcnt_sym = 0;
        
        // TODO: improve this enumeration
        ui.ctab.atoms.each(function (a_id)
        {
            if (chem.Vec2.dist(pos, ui.render.atomGetPos(a_id)) < l * 1.1)
            {
                cnt++;
                bcnt += ui.render.atomGetDegree(a_id);
            } else if (chem.Vec2.dist(pos_sym, ui.render.atomGetPos(a_id)) < l * 1.1)
            {
                cnt_sym++;
                bcnt_sym += ui.render.atomGetDegree(a_id);
            }
        });
        
        angle = Math.PI - 2 * angle;
        
        if (cnt > cnt_sym || (cnt == cnt_sym && bcnt > bcnt_sym))
        {
            pos = pos_sym;
            v = v_sym;
        } else
            angle = -angle;
        
        v = v.negated();
    }

    var action = new ui.Action();
    var atom_ids = new Array(pattern.length);
    
    if (!on_atom)
    {
        atom_ids[0] = bond.begin;
        atom_ids[pattern.length - 1] = bond.end;
    }
    
    (on_atom ? pattern.length : pattern.length-1).times(function (idx)
    {
        if (idx > 0 || on_atom)
        {
            var new_pos = chem.Vec2.sum(pos, v);
            
            var a = ui.render.findClosestAtom(ui.render.client2Obj(new_pos), ui.scale * 0.1);
            
            if (a == null)
            {
                atom_ids[idx] = ui.render.atomAdd(new_pos, {label: 'C'});
                
                action.addOperation(ui.Action.OPERATION.ATOM_DEL,
                {
                    id: ui.atomMap.push(atom_ids[idx]) - 1
                });
            } else
                atom_ids[idx] = a.id;
        }
        
        v = v.rotate(angle);
    }, this);
    
    var i = 0;
    
    pattern.length.times(function (idx)
    {
        var begin = atom_ids[idx];
        var end = atom_ids[(idx + 1) % pattern.length];
        var bond_type = pattern[(first_idx + idx) % pattern.length];

        if (!ui.render.checkBondExists(begin, end))
        {
            var bond_id = ui.render.bondAdd(begin, end, {type: bond_type});
            
            action.addOperation(ui.Action.OPERATION.BOND_DEL,
            {
                id: ui.bondMap.push(bond_id) - 1
            });
        } else
        {
            if (bond_type == chem.Molecule.BOND.TYPE.AROMATIC)
            {
                var nei = ui.render.atomGetNeighbors(begin);
                
                nei.find(function (n)
                {
                    if (n.aid == end)
                    {
                        var src_type = ui.render.bondGetAttr(n.bid, 'type');
                        
                        if (src_type != bond_type)
                        {
                            action.addOperation(ui.Action.OPERATION.BOND_ATTR,
                            {
                                id: ui.bondMap.indexOf(n.bid),
                                attr_name: 'type',
                                attr_value: src_type
                            });
                            ui.render.bondSetAttr(n.bid, 'type', bond_type);
                        }
                        return true;
                    }
                    return false;
                }, this);
            }
        }
        
        i++;
    }, this);
    
    action.operations.reverse();
    
    return action;
}

ui.Action.fromNewCanvas = function (ctab)
{
    var action = new ui.Action();
    
    action.addOperation(ui.Action.OPERATION.CANVAS_LOAD,
    {
        ctab: ctab,
        atom_map:   null,
        bond_map:   null,
        sgroup_map: null
    });
    
    return action.perform();
}

ui.Action.fromSgroupAttrs = function (id, type, attrs)
{
    var action = new ui.Action();
    var id_map = ui.sgroupMap.indexOf(id);

    action.addOperation(ui.Action.OPERATION.SGROUP_ATTR,
    {
        id: id_map,
        type: type,
        attrs: attrs
    });
    
    return action.perform();
}

ui.Action.fromSgroupDeletion = function (id)
{
    var action = new ui.Action();
    
    action.addOperation(ui.Action.OPERATION.SGROUP_DEL,
    {
        id: ui.sgroupMap.indexOf(id)
    });

    return action.perform();
}

ui.Action.fromSgroupAddition = function (type, attrs, atoms)
{
    var action = new ui.Action();
    var atoms_to_remove = new Array();
    var i;
    
    for (i = 0; i < atoms.length; i++)
    {
        if (action.removeAtomFromSgroupIfNeeded(atoms[i]))
            atoms_to_remove.push(atoms[i]);

        atoms[i] = ui.atomMap.indexOf(atoms[i]);
    }
    
    action.removeSgroupIfNeeded(atoms_to_remove);
    
    action.addOperation(ui.Action.OPERATION.SGROUP_ADD,
    {
        type: type,
        attrs: attrs,
        atoms: atoms
    });

    return action.perform();
}

ui.addUndoAction = function (action, check_dummy)
{
    if (action == null)
        return;
        
    if (check_dummy != true || !action.isDummy())
    {
        ui.undoStack.push(action);
        ui.redoStack.clear();
        if (ui.undoStack.length > ui.HISTORY_LENGTH)
            ui.undoStack.splice(0, 1);
        ui.updateActionButtons();
    }
}

ui.removeDummyAction = function ()
{
    if (ui.undoStack.length != 0 && ui.undoStack.last().isDummy())
    {
        ui.undoStack.pop();
        ui.updateActionButtons();
    }
}

ui.updateActionButtons = function ()
{
    if (ui.undoStack.length == 0)
        $('undo').addClassName('buttonDisabled');
    else
        $('undo').removeClassName('buttonDisabled');

    if (ui.redoStack.length == 0)
        $('redo').addClassName('buttonDisabled');
    else
        $('redo').removeClassName('buttonDisabled');
}

ui.undo = function ()
{
    ui.redoStack.push(ui.undoStack.pop().perform());
    ui.updateActionButtons();
    ui.updateSelection();
}

ui.redo = function ()
{
    ui.undoStack.push(ui.redoStack.pop().perform());
    ui.updateActionButtons();
    ui.updateSelection();
}

ui.onClick_Undo = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;
        
    ui.undo();
}

ui.onClick_Redo = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;
        
    ui.redo();
}
