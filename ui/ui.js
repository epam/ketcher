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
        return;

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
    
    try
    {
        var ctab = chem.Molfile.parseMolfile(lines);
        return ctab;
    } catch (er)
    {
        alert("Error loading molfile.");
        return null;
    }
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

    return Base64.decode(frame_body.title);
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
    
    // check s-group overlappings
    if (id == null)
    {
        var verified = {};
        var atoms_hash = {};

        ui.selection.atoms.each(function (id)
        {
            atoms_hash[id] = true;
        }, this);
        
        if (!Object.isUndefined(ui.selection.atoms.detect(function (id)
        {
            var sgroups = ui.render.atomGetSGroups(id);
            
            if (!Object.isUndefined(sgroups.detect(function (sid)
            {
                if (sid in verified)
                    return false;
                
                var sg_atoms = ui.render.sGroupGetAtoms(sid);
                
                if (sg_atoms.length < ui.selection.atoms.length)
                {                    
                    if (!Object.isUndefined(sg_atoms.detect(function (aid)
                    {
                        if (aid in atoms_hash)
                            return false;
                        return true;
                    }, this)))
                    {
                        return true;
                    }
                } else if (!Object.isUndefined(ui.selection.atoms.detect(function (aid)
                {
                    if (sg_atoms.indexOf(aid) != -1)
                        return false;
                    return true;
                }, this)))
                {
                    return true;
                }
                
                return false;
            }, this)))
            {
                return true;
            }
            return false;
        }, this)))
        {
            alert("Partial S-group overlapping is not allowed.");
            return;
        }
    }
        
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
    
    if (type == 'DAT')
    {
        $$('.generalSGroup').each(function (el) { el.hide() });
        $$('.dataSGroup').each(function (el) { el.show() });
        
        $('sgroup_field_name').activate();
        
        return;
    }

    $$('.generalSGroup').each(function (el) { el.show() });
    $$('.dataSGroup').each(function (el) { el.hide() });

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
            }
            
            for (var i = 0; i < new_sgroup.atoms.length; i++)
            {
                new_sgroup.atoms[i] = mapping[new_sgroup.atoms[i]];
            }
            
            ui.clipboard.sgroups.push(new_sgroup);
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
