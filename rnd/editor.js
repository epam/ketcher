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

if (!window.Prototype)
	throw new Error("Prototype.js should be loaded first");
if (!window.rnd || !rnd.ReStruct)
	throw new Error("rnd.MolData should be defined prior to loading this file");

// TODO re-factoring needed: client_area parameter is excessive, should be available in render
rnd.Editor = function(render)
{
    this.ui = ui; // TODO ui ref should be passed as a parameter
    this.render = render;

    this._selectionHelper = new rnd.Editor.SelectionHelper(this);
};
rnd.Editor.prototype.selectAll = function() {
    var selection = {};
    for (var map in rnd.ReStruct.maps) {
        selection[map] = ui.render.ctab[map].ikeys();
    }
    this._selectionHelper.setSelection(selection);
};
rnd.Editor.prototype.deselectAll = function() {
    this._selectionHelper.setSelection();
};
rnd.Editor.prototype.toolFor = function(tool) {
    if (tool == 'selector_lasso') {
        return new rnd.Editor.LassoTool(this, 0);
    } else if (tool == 'selector_square') {
        return new rnd.Editor.LassoTool(this, 1);
    } else if (tool == 'selector_fragment') {
        return new rnd.Editor.LassoTool(this, 1, true);
    } else if (tool == 'select_erase') {
        return new rnd.Editor.EraserTool(this, 1); // TODO last selector mode is better
    } else if (tool.startsWith('atom_')) {
        return new rnd.Editor.AtomTool(this, ui.atomLabel(tool)); // TODO should not refer ui directly, re-factoring needed
    } else if (tool.startsWith('bond_')) {
        return new rnd.Editor.BondTool(this, ui.bondType(tool)); // TODO should not refer ui directly, re-factoring needed
    } else if (tool == 'chain') {
        return new rnd.Editor.ChainTool(this);
    } else if (tool.startsWith('template_')) {
        return new rnd.Editor.TemplateTool(this, parseInt(tool.split('_')[1]));
    } else if (tool == 'charge_plus') {
        return new rnd.Editor.ChargeTool(this, 1);
    } else if (tool == 'charge_minus') {
        return new rnd.Editor.ChargeTool(this, -1);
    } else if (tool == 'sgroup') {
        return new rnd.Editor.SGroupTool(this);
    } else if (tool == 'paste') {
        return new rnd.Editor.PasteTool(this);
    } else if (tool == 'reaction_arrow') {
        return new rnd.Editor.ReactionArrowTool(this);
    } else if (tool == 'reaction_plus') {
        return new rnd.Editor.ReactionPlusTool(this);
    } else if (tool == 'reaction_map') {
        return new rnd.Editor.ReactionMapTool(this);
    } else if (tool == 'reaction_unmap') {
        return new rnd.Editor.ReactionUnmapTool(this);
    } else if (tool == 'rgroup_label') {
        return new rnd.Editor.RGroupAtomTool(this);
    } else if (tool == 'rgroup_fragment') {
        return new rnd.Editor.RGroupFragmentTool(this);
    } else if (tool == 'rgroup_attpoints') {
        return new rnd.Editor.APointTool(this);
    }
    return null;
};


rnd.Editor.SelectionHelper = function(editor) {
    this.editor = editor;
};
rnd.Editor.SelectionHelper.prototype.setSelection = function(selection, add) {
    if (!('selection' in this) || !add) {
        this.selection = {};
        for (var map1 in rnd.ReStruct.maps) this.selection[map1] = []; // TODO it should NOT be mandatory
    }
    if (selection && 'id' in selection && 'map' in selection) {
        (selection[selection.map] = selection[selection.map] || []).push(selection.id);
    }
    if (selection) {
        for (var map2 in this.selection) {
            if (map2 in selection) {
                for (var i = 0; i < selection[map2].length; i++) {
                    if (this.selection[map2].indexOf(selection[map2][i]) < 0) {
                        this.selection[map2].push(selection[map2][i]);
                    }
                }
            }
        }
    }
    // "auto-select" the atoms for the bonds in selection
    if (!Object.isUndefined(this.selection.bonds)) {
        this.selection.bonds.each(
            function(bid) {
                var bond = this.editor.render.ctab.molecule.bonds.get(bid);
                selection.atoms = selection.atoms || [];
                if (this.selection.atoms.indexOf(bond.begin) < 0) {
                    this.selection.atoms.push(bond.begin);
                }
                if (this.selection.atoms.indexOf(bond.end) < 0) {
                    this.selection.atoms.push(bond.end);
                }
            },
            this
        );
    }
    // "auto-select" the bonds with both atoms selected
    if ('atoms' in this.selection) {
        this.editor.render.ctab.molecule.bonds.each(
            function(bid) {
                if (!('bonds' in this.selection) || this.selection.bonds.indexOf(bid) < 0) {
                    var bond = this.editor.render.ctab.molecule.bonds.get(bid);
                    if (this.selection.atoms.indexOf(bond.begin) >= 0 && this.selection.atoms.indexOf(bond.end) >= 0) {
                        this.selection.bonds = this.selection.bonds || [];
                        this.selection.bonds.push(bid);
                    }
                }
            },
            this
        );
    }
    this.editor.render.setSelection(this.selection);
    this.editor.render.update();

    ui.updateSelection(this.selection, true); // TODO to be removed (used temporary until no new Undo/Redo tools implemented)
    ui.updateClipboardButtons(); // TODO notify ui about selection
};
rnd.Editor.SelectionHelper.prototype.isSelected = function(item) {
    return 'selection' in this
        && !Object.isUndefined(this.selection[item.map])
        && this.selection[item.map].indexOf(item.id) > -1;
};


rnd.Editor.EditorTool = function(editor) {
    this.editor = editor;
};
rnd.Editor.EditorTool.prototype.processEvent = function(name, event) {
    if (!('touches' in event) || event.touches.length == 1) {
        if (name + '0' in this) 
            return this[name + '0'](event); 
        else if (name in this) 
            return this[name](event);
        console.log('EditorTool.dispatchEvent: event \'' + name + '\' is not handled.');
    } else if ('lastEvent' in this.OnMouseDown0) {
        // here we finish previous MouseDown and MouseMoves with simulated MouseUp
        // before gesture (canvas zoom, scroll, rotate) started
        return this.OnMouseUp0(event);
    }
};
rnd.Editor.EditorTool.prototype.OnMouseOver = function() {};
rnd.Editor.EditorTool.prototype.OnMouseDown = function() {};
rnd.Editor.EditorTool.prototype.OnMouseMove = function() {};
rnd.Editor.EditorTool.prototype.OnMouseUp = function() {};
rnd.Editor.EditorTool.prototype.OnClick = function() {};
rnd.Editor.EditorTool.prototype.OnDblClick = function() {};
rnd.Editor.EditorTool.prototype.OnMouseOut = function() {};
rnd.Editor.EditorTool.prototype.OnKeyPress = function() {};
rnd.Editor.EditorTool.prototype.OnCancel = function() {}; // called when we abandon the tool
rnd.Editor.EditorTool.prototype.OnMouseDown0 = function(event) {
    if (this.editor.ui.hideBlurredControls()) return true; // TODO review

    this.OnMouseDown0.lastEvent = event;
    this.OnMouseMove0.lastEvent = event;

    if ('OnMouseDown' in this) return this.OnMouseDown(event);
};
rnd.Editor.EditorTool.prototype.OnMouseMove0 = function(event) {
    this.OnMouseMove0.lastEvent = event;

    if ('OnMouseMove' in this) return this.OnMouseMove(event);
};
rnd.Editor.EditorTool.prototype.OnMouseUp0 = function(event) {
    // here we suppress event we got when second touch released in guesture
    if (!('lastEvent' in this.OnMouseDown0)) return true;

    if ('lastEvent' in this.OnMouseMove0) {
        // this data is missing for 'touchend' event when last finger is out
        event = Object.clone(event); // pageX & pageY properties are readonly in Opera
        event.pageX = this.OnMouseMove0.lastEvent.pageX;
        event.pageY = this.OnMouseMove0.lastEvent.pageY;
    }

    try {
        if ('OnMouseUp' in this) return this.OnMouseUp(event);
    } finally {
        delete this.OnMouseDown0.lastEvent;
    }
};
rnd.Editor.EditorTool.prototype.OnKeyPress0 = function(event) {
    if (!((event.metaKey && ui.is_osx) || (event.ctrlKey && !ui.is_osx)) && !event.altKey && ('lastEvent' in this.OnMouseMove0)) {
        if (114 == (Prototype.Browser.IE ? event.keyCode : event.which)) { // 'r'
            return rnd.Editor.RGroupAtomTool.prototype.OnMouseUp.call(this, this.OnMouseMove0.lastEvent);
        }
        var ci = this.editor.render.findItem(this.OnMouseMove0.lastEvent);
        if (ci) {
            var labels = {
                Br : 66, Cl : 67, A: 97, C: 99, F : 102, H : 104, I : 105, N : 110, O : 111, P : 112, S : 115
            };
            for (var label in labels) {
                if (labels[label] == (Prototype.Browser.IE ? event.keyCode : event.which)) {
                    ci.label = { label : label };
                    if (ci.map == 'atoms') {
                        this.editor.ui.addUndoAction(ui.Action.fromAtomAttrs(ci.id, ci.label));
                    } else if (ci.id == -1) {
                        this.editor.ui.addUndoAction(
                            this.editor.ui.Action.fromAtomAddition(
                                this.editor.ui.page2obj(this.OnMouseMove0.lastEvent),
                                ci.label
                            ),
                            true
                        );
                    }
                    this.editor.ui.render.update();
                    return true;
                }
            }
        }
    }
    if ('OnKeyPress' in this) return this.OnKeyPress(event);
    return false;
};
rnd.Editor.EditorTool.prototype._calcAngle = function (pos0, pos1) {
    var v = util.Vec2.diff(pos1, pos0);
    var angle = Math.atan2(v.y, v.x);
    var sign = angle < 0 ? - 1 : 1;
    var floor = Math.floor(Math.abs(angle) / (Math.PI / 12)) * (Math.PI / 12);
    angle = sign * (floor + ((Math.abs(angle) - floor < Math.PI / 24) ? 0 : Math.PI / 12));
    return angle;
};
rnd.Editor.EditorTool.prototype._calcNewAtomPos = function(pos0, pos1) {
    var v = new util.Vec2(1, 0).rotate(this._calcAngle(pos0, pos1));
    v.add_(pos0);
    return v;
};


rnd.Editor.EditorTool.HoverHelper = function(editorTool) {
    this.editorTool = editorTool;
};
rnd.Editor.EditorTool.HoverHelper.prototype.hover = function(ci) {
    if (ci && ci.type == 'Canvas')
        ci = null;
    // TODO add custom highlight style parameter, to be used when fusing atoms, sgroup children highlighting, etc
    if ('ci' in this && (!ci || this.ci.type != ci.type || this.ci.id != ci.id)) {
        this.editorTool.editor.render.highlightObject(this.ci, false);
        delete this.ci;
    }
    if (ci && this.editorTool.editor.render.highlightObject(ci, true)) {
        this.ci = ci;
    }
};

rnd.Editor.LassoTool = function(editor, mode, fragment) {
    this.editor = editor;

    this._hoverHelper = new rnd.Editor.EditorTool.HoverHelper(this);
    this._lassoHelper = new rnd.Editor.LassoTool.LassoHelper(mode || 0, editor, fragment);
    this._sGroupHelper = new rnd.Editor.SGroupTool.SGroupHelper(editor);
};
rnd.Editor.LassoTool.prototype = new rnd.Editor.EditorTool();
rnd.Editor.LassoTool.prototype.OnMouseDown = function(event) {
    var render = this.editor.render;
    var ctab = render.ctab;
    this._hoverHelper.hover(null); // TODO review hovering for touch devices
    var selectFragment = (this._lassoHelper.fragment || event.ctrlKey);
    var ci = this.editor.render.findItem(event, selectFragment ? ['frags', 'rxnArrows', 'rxnPluses', 'chiralFlags'] : ['atoms', 'bonds', 'sgroups', 'sgroupData', 'rxnArrows', 'rxnPluses', 'chiralFlags']);
    if (!ci || ci.type == 'Canvas') {
        if (!this._lassoHelper.fragment)
            this._lassoHelper.begin(event);
    } else {
        this._hoverHelper.hover(null);
        if ('onShowLoupe' in this.editor.render)
            this.editor.render.onShowLoupe(true);
        if (ci.map == 'frags') {
            var frag = ctab.frags.get(ci.id);
            var atoms = frag.fragGetAtoms(render, ci.id);
            this.editor._selectionHelper.setSelection({'atoms':atoms}, event.shiftKey);
        } else if (!this.editor._selectionHelper.isSelected(ci)) {
            this.editor._selectionHelper.setSelection(ci, event.shiftKey);
        }
        this.dragCtx = {
            item : ci,
            xy0 : this.editor.ui.page2obj(event)
        };
        if (ci.map == 'atoms') {
            var self = this;
            this.dragCtx.timeout = setTimeout(
                function() {
                    delete self.dragCtx;
                    self.editor._selectionHelper.setSelection(null);
                    self.editor.ui.showLabelEditor(ci.id);
                },
                750
            );
            this.dragCtx.stopTapping = function() {
                if ('timeout' in self.dragCtx) {
                    clearTimeout(self.dragCtx.timeout);
                    delete self.dragCtx.timeout;
                }
            }
        }
    }
    return true;
};
rnd.Editor.LassoTool.prototype.OnMouseMove = function(event) {
    if ('dragCtx' in this) {
        if ('stopTapping' in this.dragCtx) this.dragCtx.stopTapping();
        // moving selected objects
        if (this.dragCtx.action)
            this.dragCtx.action.perform();
        this.dragCtx.action = ui.Action.fromMultipleMove(
            this.editor._selectionHelper.selection,
            this.editor.ui.page2obj(event).sub(this.dragCtx.xy0));
        // finding & highlighting object to stick to
        if (['atoms'/*, 'bonds'*/].indexOf(this.dragCtx.item.map) >= 0) {
            // TODO add bond-to-bond fusing
            var ci = this.editor.render.findItem(event, [this.dragCtx.item.map], this.dragCtx.item);
            this._hoverHelper.hover(ci.map == this.dragCtx.item.map ? ci : null);
        }
        this.editor.render.update();
    } else if (this._lassoHelper.running()) {
        this.editor._selectionHelper.setSelection(this._lassoHelper.addPoint(event), event.shiftKey);
    } else {
        this._hoverHelper.hover(
            this.editor.render.findItem(event, (this._lassoHelper.fragment || event.ctrlKey) ? ['frags', 'rxnArrows', 'rxnPluses', 'chiralFlags'] : ['atoms', 'bonds', 'sgroups', 'sgroupData', 'rxnArrows', 'rxnPluses', 'chiralFlags'])
        );
    }
    return true;
};
rnd.Editor.LassoTool.prototype.OnMouseUp = function(event) {
    if ('dragCtx' in this) {
        if ('stopTapping' in this.dragCtx) this.dragCtx.stopTapping();
        if (['atoms'/*, 'bonds'*/].indexOf(this.dragCtx.item.map) >= 0) {
            // TODO add bond-to-bond fusing
            var ci = this.editor.render.findItem(event, [this.dragCtx.item.map], this.dragCtx.item);
            if (ci.map == this.dragCtx.item.map) {
                this._hoverHelper.hover(null);
                this.editor._selectionHelper.setSelection();
                this.dragCtx.action = this.dragCtx.action
                    ? this.editor.ui.Action.fromAtomMerge(this.dragCtx.item.id, ci.id).mergeWith(this.dragCtx.action)
                    : this.editor.ui.Action.fromAtomMerge(this.dragCtx.item.id, ci.id);
            }
        }
        this.editor.ui.addUndoAction(this.dragCtx.action, true);
        this.editor.render.update();
        delete this.dragCtx;
    } else {
        if (this._lassoHelper.running()) { // TODO it catches more events than needed, to be re-factored
            this.editor._selectionHelper.setSelection(this._lassoHelper.end(event), event.shiftKey);
        } else if (this._lassoHelper.fragment) {
            this.editor._selectionHelper.setSelection();
        }
    }
    return true;
};
rnd.Editor.LassoTool.prototype.OnDblClick = function(event) {
    var ci = this.editor.render.findItem(event);
    if (ci.map == 'atoms') {
        this.editor.ui.showAtomProperties(ci.id);
    } else if (ci.map == 'bonds') {
        this.editor.ui.showBondProperties(ci.id);
    } else if (ci.map == 'sgroups') {
        this._sGroupHelper.showPropertiesDialog(ci.id);
//    } else if (ci.map == 'sgroupData') {
//        this._sGroupHelper.showPropertiesDialog(ci.sgid);
    }
    return true;
};
rnd.Editor.LassoTool.prototype.OnCancel = function() {
    if ('dragCtx' in this) {
        if ('stopTapping' in this.dragCtx) this.dragCtx.stopTapping();
        this.editor.ui.addUndoAction(this.dragCtx.action, true);
        this.editor.render.update();
        delete this.dragCtx;
    }
    this.editor._selectionHelper.setSelection();
};


rnd.Editor.LassoTool.LassoHelper = function(mode, editor, fragment) {
    this.mode = mode;
    this.fragment = fragment;
    this.editor = editor;
};
rnd.Editor.LassoTool.LassoHelper.prototype.getSelection = function() {
    if (this.mode == 0) {
        return this.editor.ui.render.getElementsInPolygon(this.points);
    } else if (this.mode == 1) {
        return this.editor.ui.render.getElementsInRectangle(this.points[0], this.points[1]);
    } else {
        throw new Error("Selector mode unknown");
    }
};
rnd.Editor.LassoTool.LassoHelper.prototype.begin = function(event) {
    this.points = [ this.editor.ui.page2obj(event) ];
    if (this.mode == 1) {
        this.points.push(this.points[0]);
    }
};
rnd.Editor.LassoTool.LassoHelper.prototype.running = function() {
    return 'points' in this;
};
rnd.Editor.LassoTool.LassoHelper.prototype.addPoint = function(event) {
    if (!this.running()) return false;
    if (this.mode == 0) {
        this.points.push(this.editor.ui.page2obj(event));
        this.editor.render.drawSelectionPolygon(this.points);
    } else if (this.mode == 1) {
        this.points = [ this.points[0], this.editor.ui.page2obj(event) ];
        this.editor.render.drawSelectionRectangle(this.points[0], this.points[1]);
    }
    return this.getSelection();
};
rnd.Editor.LassoTool.LassoHelper.prototype.end = function() {
    var ret = this.getSelection();
    if ('points' in this) {
        this.editor.render.drawSelectionPolygon(null);
        delete this.points;
    }
    return ret;
};


rnd.Editor.EraserTool = function(editor, mode) {
    this.editor = editor;

    this.maps = ['atoms', 'bonds', 'rxnArrows', 'rxnPluses', 'rgroups', 'sgroups', 'sgroupData', 'chiralFlags'];
    this._hoverHelper = new rnd.Editor.EditorTool.HoverHelper(this);
    this._lassoHelper = new rnd.Editor.LassoTool.LassoHelper(mode || 0, editor);
};
rnd.Editor.EraserTool.prototype = new rnd.Editor.EditorTool();
rnd.Editor.EraserTool.prototype.OnMouseDown = function(event) {
    var ci = this.editor.render.findItem(event, this.maps);
    if (!ci || ci.type == 'Canvas') {
        this._lassoHelper.begin(event);
    }
};
rnd.Editor.EraserTool.prototype.OnMouseMove = function(event) {
    if (this._lassoHelper.running()) {
        this.editor._selectionHelper.setSelection(
            this._lassoHelper.addPoint(event)
            // TODO add "no-auto-atoms-selection" option (see selection left on canvas after erasing)
        );
    } else {
        this._hoverHelper.hover(this.editor.render.findItem(event, this.maps));
    }
};
rnd.Editor.EraserTool.prototype.OnMouseUp = function(event) {
    if (this._lassoHelper.running()) { // TODO it catches more events than needed, to be re-factored
        this.editor.ui.addUndoAction(this.editor.ui.Action.fromFragmentDeletion(this._lassoHelper.end(event)));
        for (var map1 in rnd.ReStruct.maps) ui.selection[map1] = []; // TODO to be deleted when ui.selection eliminated
        this.editor.ui.render.update();
        this.editor.ui.updateClipboardButtons(); // TODO review
    } else {
        var ci = this.editor.render.findItem(event, this.maps);
        if (ci && ci.type != 'Canvas') {
            this._hoverHelper.hover(null);
            if (ci.map == 'atoms') {
                this.editor.ui.addUndoAction(this.editor.ui.Action.fromAtomDeletion(ci.id));
            } else if (ci.map == 'bonds') {
                this.editor.ui.addUndoAction(this.editor.ui.Action.fromBondDeletion(ci.id));
            } else if (ci.map == 'sgroups' || ci.map == 'sgroupData') {
                this.editor.ui.addUndoAction(this.editor.ui.Action.fromSgroupDeletion(ci.id));
            } else if (ci.map == 'rxnArrows') {
                this.editor.ui.addUndoAction(this.editor.ui.Action.fromArrowDeletion(ci.id));
            } else if (ci.map == 'rxnPluses') {
                this.editor.ui.addUndoAction(this.editor.ui.Action.fromPlusDeletion(ci.id));
            } else if (ci.map == 'chiralFlags') {
                this.editor.ui.addUndoAction(this.editor.ui.Action.fromChiralFlagDeletion());
            } else {
                // TODO re-factoring needed - should be "map-independent"
                console.log('EraserTool: unable to delete the object ' + ci.map + '[' + ci.id + ']');
                return;
            }
            for (var map2 in rnd.ReStruct.maps) ui.selection[map2] = []; // TODO to be deleted when ui.selection eliminated
            this.editor.ui.render.update();
            this.editor.ui.updateClipboardButtons(); // TODO review
            this.editor._selectionHelper.setSelection();
        }
    }
};


rnd.Editor.AtomTool = function(editor, atomProps) {
    this.editor = editor;
    this.atomProps = atomProps;
    this.bondProps = { type : 1, stereo : chem.Struct.BOND.STEREO.NONE };

    this._hoverHelper = new rnd.Editor.EditorTool.HoverHelper(this);
};
rnd.Editor.AtomTool.prototype = new rnd.Editor.EditorTool();
rnd.Editor.AtomTool.prototype.OnMouseDown = function(event) {
    this._hoverHelper.hover(null);
    var ci = this.editor.render.findItem(event, ['atoms']);
    if (!ci || ci.type == 'Canvas') {
        this.dragCtx = {
            xy0 : this.editor.ui.page2obj(event)
        };
    } else if (ci.map == 'atoms') {
        this.dragCtx = {
            item : ci,
            xy0 : this.editor.ui.page2obj(event)
        };
    }
};
rnd.Editor.AtomTool.prototype.OnMouseMove = function(event) {
    var _E_ = this.editor, _R_ = _E_.render;
    if ('dragCtx' in this && 'item' in this.dragCtx) {
        var _DC_ = this.dragCtx;
        var newAtomPos = this._calcNewAtomPos(
            _R_.atomGetPos(_DC_.item.id), _E_.ui.page2obj(event)
        );
        if ('action' in _DC_) {
            _DC_.action.perform();
        }
        // TODO [RB] kludge fix for KETCHER-560. need to review
        //BEGIN
        /*
        var action_ret = _E_.ui.Action.fromBondAddition(
            this.bondProps, _DC_.item.id, this.atomProps, newAtomPos, newAtomPos
        );
        */
        var action_ret = _E_.ui.Action.fromBondAddition(
            this.bondProps, _DC_.item.id, Object.clone(this.atomProps), newAtomPos, newAtomPos
        );
        //END
        _DC_.action = action_ret[0];
        _DC_.aid2 = action_ret[2];
        _R_.update();
    } else {
        this._hoverHelper.hover(_R_.findItem(event, ['atoms']));
    }
};
rnd.Editor.AtomTool.prototype.OnMouseUp = function(event) {
    if ('dragCtx' in this) {
        var _UI_ = this.editor.ui, _DC_ = this.dragCtx;
        _UI_.addUndoAction(
            'action' in _DC_
                ? _DC_.action
                : 'item' in _DC_
                    ? _UI_.Action.fromAtomAttrs(_DC_.item.id, this.atomProps)
                    : _UI_.Action.fromAtomAddition(_UI_.page2obj(event), this.atomProps),
            true
        );
        this.editor.render.update();
        delete this.dragCtx;
    }
};


rnd.Editor.BondTool = function(editor, bondProps) {
    this.editor = editor;
    this.atomProps = { label : 'C' };
    this.bondProps = bondProps;

    this._hoverHelper = new rnd.Editor.EditorTool.HoverHelper(this);
};
rnd.Editor.BondTool.prototype = new rnd.Editor.EditorTool();
rnd.Editor.BondTool.prototype.OnMouseDown = function(event) {
    this._hoverHelper.hover(null);
    this.dragCtx = {
        xy0 : this.editor.ui.page2obj(event),
        item : this.editor.render.findItem(event, ['atoms', 'bonds'])
    };
    if (!this.dragCtx.item || this.dragCtx.item.type == 'Canvas') delete this.dragCtx.item;
    return true;
};
rnd.Editor.BondTool.prototype.OnMouseMove = function(event) {
    var _E_ = this.editor, _R_ = _E_.render;
    if ('dragCtx' in this) {
        var _DC_ = this.dragCtx;
        if (!('item' in _DC_) || _DC_.item.map == 'atoms') {
            if ('action' in _DC_) _DC_.action.perform();
            var i1, i2, p1, p2;
            if (('item' in _DC_ && _DC_.item.map == 'atoms')) {
                i1 = _DC_.item.id;
                i2 = _R_.findItem(event, ['atoms'], _DC_.item);
            } else {
                i1 = this.atomProps;
                p1 = _DC_.xy0;
                i2 = _R_.findItem(event, ['atoms']);
            }
            if (i2 && i2.map == 'atoms') {
                i2 = i2.id;
            } else {
                i2 = this.atomProps;
                if (p1) {
                    p2 = this._calcNewAtomPos(p1, _E_.ui.page2obj(event))
                } else {
                    p1 = this._calcNewAtomPos(_R_.atomGetPos(i1), _E_.ui.page2obj(event));
                }
            }
            _DC_.action = _E_.ui.Action.fromBondAddition(this.bondProps, i1, i2, p1, p2)[0];
            _R_.update();
            return true;
        }
    }
    this._hoverHelper.hover(_R_.findItem(event, ['atoms', 'bonds']));
    return true;
};
rnd.Editor.BondTool.prototype.OnMouseUp = function(event) {
    if ('dragCtx' in this) {
        var _UI_ = this.editor.ui, _DC_ = this.dragCtx;
        if ('action' in _DC_) {
            _UI_.addUndoAction(_DC_.action);
        } else if (!('item' in _DC_)) {
            var xy = this.editor.ui.page2obj(event);
            var v = new util.Vec2(1.0 / 2, 0).rotate(
                this.bondProps.type == chem.Struct.BOND.TYPE.SINGLE ? -Math.PI / 6 : 0
            );
            _UI_.addUndoAction(
                _UI_.Action.fromBondAddition(
                    this.bondProps,
                    { label : 'C' },
                    { label : 'C' },
                    { x : xy.x - v.x, y : xy.y - v.y},
                    { x : xy.x + v.x, y : xy.y + v.y}
                )[0]
            );
        } else if (_DC_.item.map == 'atoms') {
            var atom = _UI_.atomForNewBond(_DC_.item.id);
            _UI_.addUndoAction(
                _UI_.Action.fromBondAddition(this.bondProps, _DC_.item.id, atom.atom, atom.pos)[0]
            );
        } else if (_DC_.item.map == 'bonds') {
            var bondProps = Object.clone(this.bondProps);
            var bond = _UI_.ctab.bonds.get(_DC_.item.id);

            if (bondProps.stereo != chem.Struct.BOND.STEREO.NONE
                && bond.type == chem.Struct.BOND.TYPE.SINGLE
                && bondProps.type == chem.Struct.BOND.TYPE.SINGLE
                && bond.stereo == bondProps.stereo)
            {
                _UI_.addUndoAction(_UI_.Action.fromBondFlipping(_DC_.item.id));
            } else {
                if (bond.type == bondProps.type) {
                    if (bond.type == chem.Struct.BOND.TYPE.SINGLE) {
                        if (bond.stereo == chem.Struct.BOND.STEREO.NONE && bond.stereo == bondProps.stereo) {
                            bondProps.type = chem.Struct.BOND.TYPE.DOUBLE;
                        }
                    } else if (bond.type == chem.Struct.BOND.TYPE.DOUBLE) {
                        bondProps.type = chem.Struct.BOND.TYPE.TRIPLE;
                    } else if (bond.type == chem.Struct.BOND.TYPE.TRIPLE) {
                        bondProps.type = chem.Struct.BOND.TYPE.SINGLE;
                    }
                }
                _UI_.addUndoAction(
                    _UI_.Action.fromBondAttrs(_DC_.item.id, bondProps, _UI_.bondFlipRequired(bond, bondProps)),
                    true
                );
            }
        }
        this.editor.render.update();
        delete this.dragCtx;
    }
    return true;
};


rnd.Editor.ChainTool = function(editor) {
    this.editor = editor;

    this._hoverHelper = new rnd.Editor.EditorTool.HoverHelper(this);
};
rnd.Editor.ChainTool.prototype = new rnd.Editor.EditorTool();
rnd.Editor.ChainTool.prototype.OnMouseDown = function(event) {
    this._hoverHelper.hover(null);
    this.dragCtx = {
        xy0 : this.editor.ui.page2obj(event),
        item : this.editor.render.findItem(event, ['atoms'])
    };
    if (!this.dragCtx.item || this.dragCtx.item.type == 'Canvas') delete this.dragCtx.item;
    return true;
};
rnd.Editor.ChainTool.prototype.OnMouseMove = function(event) {
    var _E_ = this.editor, _R_ = _E_.render;
    if ('dragCtx' in this) {
        var _DC_ = this.dragCtx;
        if ('action' in _DC_) _DC_.action.perform();
        var pos0 = 'item' in _DC_ ? _R_.atomGetPos(_DC_.item.id) : _DC_.xy0;
        var pos1 = _E_.ui.page2obj(event);
        _DC_.action = _E_.ui.Action.fromChain(
            pos0,
            this._calcAngle(pos0, pos1),
            Math.ceil(util.Vec2.diff(pos1, pos0).length()),
            'item' in _DC_ ? _DC_.item.id : null
        );
        _R_.update();
        return true;
    }
    this._hoverHelper.hover(_R_.findItem(event, ['atoms']));
    return true;
};
rnd.Editor.ChainTool.prototype.OnMouseUp = function() {
    if ('dragCtx' in this) {
        if ('action' in this.dragCtx) {
            this.editor.ui.addUndoAction(this.dragCtx.action);
        }
        delete this.dragCtx;
    }
    return true;
};


rnd.Editor.TemplateTool = function(editor, template) {
    this.editor = editor;
    this.template = template;

    this._hoverHelper = new rnd.Editor.EditorTool.HoverHelper(this);
};
rnd.Editor.TemplateTool.prototype = new rnd.Editor.EditorTool();
rnd.Editor.TemplateTool.prototype.templates = [
    [1, 2, 1, 2, 1, 2],
    [1, 2, 1, 2, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
];
// TODO implement rotation around fusing atom / flipping over fusing bond
rnd.Editor.TemplateTool.prototype.OnMouseMove = function(event) {
    this._hoverHelper.hover(this.editor.render.findItem(event, ['atoms', 'bonds']));
};
rnd.Editor.TemplateTool.prototype.OnMouseUp = function(event) {
    this._hoverHelper.hover(null);
    var ci = this.editor.render.findItem(event, ['atoms', 'bonds']);
    if (!ci || ci.type == 'Canvas') {
        this.editor.ui.addUndoAction(
            this.editor.ui.Action.fromPatternOnCanvas(this.editor.ui.page2obj(event), this.templates[this.template]),
            true
        );
        this.editor.ui.render.update();
    } else if (ci.map == 'atoms') {
        this.editor.ui.addUndoAction(
            this.editor.ui.Action.fromPatternOnAtom(ci.id, this.templates[this.template]),
            true
        );
        this.editor.ui.render.update();
    } else if (ci.map == 'bonds') {
        this.editor.ui.addUndoAction(
            this.editor.ui.Action.fromPatternOnElement(ci.id, this.templates[this.template], false),
            true
        );
        this.editor.ui.render.update();
    }
};


rnd.Editor.ChargeTool = function(editor, charge) { // TODO [RB] should be "pluggable"
    this.editor = editor;
    this.charge = charge;

    this._hoverHelper = new rnd.Editor.EditorTool.HoverHelper(this);
};
rnd.Editor.ChargeTool.prototype = new rnd.Editor.EditorTool();
rnd.Editor.ChargeTool.prototype.OnMouseMove = function(event) {
    this._hoverHelper.hover(this.editor.render.findItem(event, ['atoms']));
    return true;
};
rnd.Editor.ChargeTool.prototype.OnMouseUp = function(event) {
    var _E_ = this.editor, _R_ = _E_.render;
    var ci = _R_.findItem(event, ['atoms']);
    if (ci && ci.map == 'atoms') {
        this._hoverHelper.hover(null);
        _E_.ui.addUndoAction(
            _E_.ui.Action.fromAtomAttrs(ci.id, { charge : _R_.ctab.molecule.atoms.get(ci.id).charge + this.charge })
        );
        _R_.update();
    }
    return true;
};


rnd.Editor.RGroupAtomTool = function(editor) {
    this.editor = editor;

    this._hoverHelper = new rnd.Editor.EditorTool.HoverHelper(this);
};
rnd.Editor.RGroupAtomTool.prototype = new rnd.Editor.EditorTool();
rnd.Editor.RGroupAtomTool.prototype.OnMouseMove = function(event) {
    this._hoverHelper.hover(this.editor.render.findItem(event, ['atoms']));
};
rnd.Editor.RGroupAtomTool.prototype.OnMouseUp = function(event) {
    var ci = this.editor.render.findItem(event, ['atoms']);
    if (!ci || ci.type == 'Canvas') {
        this._hoverHelper.hover(null);
        this.editor.ui.showRGroupTable({
            onOk : function(rgNew) {
                if (rgNew) {
                    this.editor.ui.addUndoAction(
                        this.editor.ui.Action.fromAtomAddition(
                            this.editor.ui.page2obj(this.OnMouseMove0.lastEvent),
                            { label : 'R#', rglabel : rgNew}
                        ),
                        true
                    );
                    this.editor.ui.render.update();
                }
            }.bind(this)
        });
        return true;
    } else if (ci && ci.map == 'atoms') {
        this._hoverHelper.hover(null);
        var lbOld = this.editor.render.ctab.molecule.atoms.get(ci.id).label;
        var rgOld = this.editor.render.ctab.molecule.atoms.get(ci.id).rglabel;
        this.editor.ui.showRGroupTable({
            selection : rgOld,
            onOk : function(rgNew) {
                if (rgOld != rgNew || lbOld != 'R#') {
                    var newProps = Object.clone(chem.Struct.Atom.attrlist); // TODO review: using Atom.attrlist as a source of default property values
                    if (rgNew) {
                        newProps.label = 'R#';
                        newProps.rglabel = rgNew;
                    } else {
                        newProps.label = 'C';
                    }
                    this.editor.ui.addUndoAction(this.editor.ui.Action.fromAtomAttrs(ci.id, newProps), true);
                    this.editor.ui.render.update();
                }
            }.bind(this)
        });
        return true;
    }
};


rnd.Editor.RGroupFragmentTool = function(editor) {
    this.editor = editor;

    this._hoverHelper = new rnd.Editor.EditorTool.HoverHelper(this);
};
rnd.Editor.RGroupFragmentTool.prototype = new rnd.Editor.EditorTool();
rnd.Editor.RGroupFragmentTool.prototype.OnMouseMove = function(event) {
    this._hoverHelper.hover(this.editor.render.findItem(event, ['frags', 'rgroups']));
};
rnd.Editor.RGroupFragmentTool.prototype.OnMouseUp = function(event) {
    var ci = this.editor.render.findItem(event, ['frags', 'rgroups']);
    if (ci && ci.map == 'frags') {
        this._hoverHelper.hover(null);
        var rgOld = chem.Struct.RGroup.findRGroupByFragment(this.editor.render.ctab.molecule.rgroups, ci.id);
        this.editor.ui.showRGroupTable({
            mode : 'single',
            selection : rgOld ? 1 << (rgOld - 1) : 0,
            onOk : function(rgNew) {
                for (var i = 0; i < 32; i++) 
                    if (rgNew & (1 << i)) { 
                        rgNew = i + 1; 
                        break; 
                    }
                if (rgOld != rgNew) {
                    this.editor.ui.addUndoAction(
                        this.editor.ui.Action.fromRGroupFragment(rgNew, ci.id),
                        true
                    );
                    this.editor.ui.render.update();
                }
            }.bind(this)
        });
        return true;
    }
    else if (ci && ci.map == 'rgroups') {
        this._hoverHelper.hover(null);
        var rg = this.editor.render.ctab.molecule.rgroups.get(ci.id);
        var rgmask = 0; this.editor.render.ctab.molecule.rgroups.each(function(rgid) { rgmask |= (1 << (rgid - 1)); });
        var oldLogic = {
            occurrence : rg.range,
            resth : rg.resth,
            ifthen : rg.ifthen
        };
        this.editor.ui.showRLogicTable({
            rgid : ci.id,
            rlogic : oldLogic,
            rgmask : rgmask,
            onOk : function(newLogic) {
                var props = {};
                if (oldLogic.occurrence != newLogic.occurrence) props.range = newLogic.occurrence;
                if (oldLogic.resth != newLogic.resth) props.resth = newLogic.resth;
                if (oldLogic.ifthen != newLogic.ifthen) props.ifthen = newLogic.ifthen;
                if ('range' in props || 'resth' in props || 'ifthen' in props) {
                    this.editor.ui.addUndoAction(this.editor.ui.Action.fromRGroupAttrs(ci.id, props));
                    this.editor.render.update();
                }
            }.bind(this)
        });
        return true;
    }
};

rnd.Editor.APointTool = function(editor) {
    this.editor = editor;

    this._hoverHelper = new rnd.Editor.EditorTool.HoverHelper(this);
};
rnd.Editor.APointTool.prototype = new rnd.Editor.EditorTool();
rnd.Editor.APointTool.prototype.OnMouseMove = function(event) {
    this._hoverHelper.hover(this.editor.render.findItem(event, ['atoms']));
};
rnd.Editor.APointTool.prototype.OnMouseUp = function(event) {
    var ci = this.editor.render.findItem(event, ['atoms']);
    if (ci && ci.map == 'atoms') {
        this._hoverHelper.hover(null);
        var apOld = this.editor.render.ctab.molecule.atoms.get(ci.id).attpnt;
        this.editor.ui.showAtomAttachmentPoints({
            selection : apOld,
            onOk : function(apNew) {
                if (apOld != apNew) {
                    this.editor.ui.addUndoAction(this.editor.ui.Action.fromAtomAttrs(ci.id, { attpnt : apNew }), true);
                    this.editor.ui.render.update();
                }
            }.bind(this)
        });
        return true;
    }
};


rnd.Editor.ReactionArrowTool = function(editor) {
    this.editor = editor;

    this._hoverHelper = new rnd.Editor.EditorTool.HoverHelper(this);
};
rnd.Editor.ReactionArrowTool.prototype = new rnd.Editor.EditorTool();
rnd.Editor.ReactionArrowTool.prototype.OnMouseDown = function(event) {
    var ci = this.editor.render.findItem(event, ['rxnArrows']);
    if (ci && ci.map == 'rxnArrows') {
        this._hoverHelper.hover(null);
        this.editor._selectionHelper.setSelection(ci);
        this.dragCtx = {
            xy0 : this.editor.ui.page2obj(event)
        };
    }
};
rnd.Editor.ReactionArrowTool.prototype.OnMouseMove = function(event) {
    if ('dragCtx' in this) {
        if (this.dragCtx.action)
            this.dragCtx.action.perform();
        this.dragCtx.action = ui.Action.fromMultipleMove(
            this.editor._selectionHelper.selection,
            this.editor.ui.page2obj(event).sub(this.dragCtx.xy0)
        );
        this.editor.ui.render.update();
    } else {
        this._hoverHelper.hover(this.editor.render.findItem(event, ['rxnArrows']));
    }
};
rnd.Editor.ReactionArrowTool.prototype.OnMouseUp = function(event) {
    if ('dragCtx' in this) {
        this.editor.ui.addUndoAction(this.dragCtx.action, false); // TODO investigate, subsequent undo/redo fails
        this.editor.render.update();
        delete this.dragCtx;
    } else if (this.editor.render.ctab.molecule.rxnArrows.count() < 1) {
        this.editor.ui.addUndoAction(this.editor.ui.Action.fromArrowAddition(this.editor.ui.page2obj(event)));
        this.editor.render.update();
    }
};


rnd.Editor.ReactionPlusTool = function(editor) {
    this.editor = editor;

    this._hoverHelper = new rnd.Editor.EditorTool.HoverHelper(this);
};
rnd.Editor.ReactionPlusTool.prototype = new rnd.Editor.EditorTool();
rnd.Editor.ReactionPlusTool.prototype.OnMouseDown = function(event) {
    var ci = this.editor.render.findItem(event, ['rxnPluses']);
    if (ci && ci.map == 'rxnPluses') {
        this._hoverHelper.hover(null);
        this.editor._selectionHelper.setSelection(ci);
        this.dragCtx = {
            xy0 : this.editor.ui.page2obj(event)
        };
    }
};
rnd.Editor.ReactionPlusTool.prototype.OnMouseMove = function(event) {
    if ('dragCtx' in this) {
        if (this.dragCtx.action)
            this.dragCtx.action.perform();
        this.dragCtx.action = ui.Action.fromMultipleMove(
            this.editor._selectionHelper.selection,
            this.editor.ui.page2obj(event).sub(this.dragCtx.xy0)
        );
        this.editor.ui.render.update();
    } else {
        this._hoverHelper.hover(this.editor.render.findItem(event, ['rxnPluses']));
    }
};
rnd.Editor.ReactionPlusTool.prototype.OnMouseUp = function(event) {
    if ('dragCtx' in this) {
        this.editor.ui.addUndoAction(this.dragCtx.action, false); // TODO investigate, subsequent undo/redo fails
        this.editor.render.update();
        delete this.dragCtx;
    } else {
        this.editor.ui.addUndoAction(this.editor.ui.Action.fromPlusAddition(this.editor.ui.page2obj(event)));
        this.editor.render.update();
    }
};


rnd.Editor.ReactionMapTool = function(editor) {
    this.editor = editor;

    this._hoverHelper = new rnd.Editor.EditorTool.HoverHelper(this);

    this.editor._selectionHelper.setSelection(null);

    this.rcs = chem.MolfileSaver.getComponents(this.editor.render.ctab.molecule);
};
rnd.Editor.ReactionMapTool.prototype = new rnd.Editor.EditorTool();
rnd.Editor.ReactionMapTool.prototype.OnMouseDown = function(event) {
    var ci = this.editor.render.findItem(event, ['atoms']);
    if (ci && ci.map == 'atoms') {
        this._hoverHelper.hover(null);
        this.dragCtx = {
            item : ci,
            xy0 : this.editor.ui.page2obj(event)
        }
    }
};
rnd.Editor.ReactionMapTool.prototype.OnMouseMove = function(event) {
    var rnd = this.editor.render;
    if ('dragCtx' in this) {
        var ci = rnd.findItem(event, ['atoms'], this.dragCtx.item);
        if (ci && ci.map == 'atoms' && this._isValidMap(this.dragCtx.item.id, ci.id)) {
            this._hoverHelper.hover(ci);
            rnd.drawSelectionLine(rnd.atomGetPos(this.dragCtx.item.id), rnd.atomGetPos(ci.id));
        } else {
            this._hoverHelper.hover(null);
            rnd.drawSelectionLine(rnd.atomGetPos(this.dragCtx.item.id), this.editor.ui.page2obj(event));
        }
    } else {
        this._hoverHelper.hover(rnd.findItem(event, ['atoms']));
    }
};
rnd.Editor.ReactionMapTool.prototype.OnMouseUp = function(event) {
    if ('dragCtx' in this) {
        var rnd = this.editor.render;
        var ci = rnd.findItem(event, ['atoms'], this.dragCtx.item);
        if (ci && ci.map == 'atoms' && this._isValidMap(this.dragCtx.item.id, ci.id)) {
            var action = new this.editor.ui.Action();
            var atoms = rnd.ctab.molecule.atoms;
            var atom1 = atoms.get(this.dragCtx.item.id), atom2 = atoms.get(ci.id);
            var aam1 = atom1.aam, aam2 = atom2.aam;
            if (!aam1 || aam1 != aam2) {
                if (aam1 && aam1 != aam2 || !aam1 && aam2) {
                    atoms.each(
                        function(aid, atom) {
                            if (aid != this.dragCtx.item.id && (aam1 && atom.aam == aam1 || aam2 && atom.aam == aam2)) {
                                action.mergeWith(this.editor.ui.Action.fromAtomAttrs(aid, { aam : 0 }));
                            }
                        },
                        this
                    );
                }
                if (aam1) {
                    action.mergeWith(this.editor.ui.Action.fromAtomAttrs(ci.id, { aam : aam1 }));
                } else {
                    var aam = 0; atoms.each(function(aid, atom) { aam = Math.max(aam, atom.aam || 0); });
                    action.mergeWith(this.editor.ui.Action.fromAtomAttrs(this.dragCtx.item.id, { aam : aam + 1 }));
                    action.mergeWith(this.editor.ui.Action.fromAtomAttrs(ci.id, { aam : aam + 1 }));
                }
                this.editor.ui.addUndoAction(action, true);
                rnd.update();
            }
        }
        rnd.drawSelectionLine(null);
        delete this.dragCtx;
    }
    this._hoverHelper.hover(null);
};
rnd.Editor.ReactionMapTool.prototype._isValidMap = function(aid1, aid2) {
    var t1, t2;
    for (var ri = 0; (!t1 || !t2) && ri < this.rcs.reactants.length; ri++) {
        var ro = util.Set.list(this.rcs.reactants[ri]);
        if (!t1 && ro.indexOf(aid1) >= 0) t1 = 'r';
        if (!t2 && ro.indexOf(aid2) >= 0) t2 = 'r';
    }
    for (var pi = 0; (!t1 || !t2) && pi < this.rcs.products.length; pi++) {
        var po = util.Set.list(this.rcs.products[pi]);
        if (!t1 && po.indexOf(aid1) >= 0) t1 = 'p';
        if (!t2 && po.indexOf(aid2) >= 0) t2 = 'p';
    }
    return t1 && t2 && t1 != t2;
};


rnd.Editor.ReactionUnmapTool = function(editor) {
    this.editor = editor;

    this._hoverHelper = new rnd.Editor.EditorTool.HoverHelper(this);

    this.editor._selectionHelper.setSelection(null);
};
rnd.Editor.ReactionUnmapTool.prototype = new rnd.Editor.EditorTool();
rnd.Editor.ReactionUnmapTool.prototype.OnMouseMove = function(event) {
    var ci = this.editor.render.findItem(event, ['atoms']);
    if (ci && ci.map == 'atoms') {
        this._hoverHelper.hover(this.editor.render.ctab.molecule.atoms.get(ci.id).aam ? ci : null);
    } else {
        this._hoverHelper.hover(null);
    }
};
rnd.Editor.ReactionUnmapTool.prototype.OnMouseUp = function(event) {
    var ci = this.editor.render.findItem(event, ['atoms']);
    var atoms = this.editor.render.ctab.molecule.atoms;
    if (ci && ci.map == 'atoms' && atoms.get(ci.id).aam) {
        var action = new this.editor.ui.Action();
        var aam = atoms.get(ci.id).aam;
        atoms.each(
            function(aid, atom) {
                if (atom.aam == aam) {
                    action.mergeWith(this.editor.ui.Action.fromAtomAttrs(aid, { aam : 0 }));
                }
            },
            this
        );
        this.editor.ui.addUndoAction(action, true);
        this.editor.render.update();
    }
    this._hoverHelper.hover(null);
};

rnd.Editor.SGroupTool = function(editor) {
    this.editor = editor;

    this.maps = ['atoms', 'bonds', 'sgroups', 'sgroupData'];
    this._hoverHelper = new rnd.Editor.EditorTool.HoverHelper(this);
    this._lassoHelper = new rnd.Editor.LassoTool.LassoHelper(1, editor);
    this._sGroupHelper = new rnd.Editor.SGroupTool.SGroupHelper(editor);

    var selection = this.editor.ui.selection;
    if (selection.atoms && selection.atoms.length > 0) {
        // if the selection contrain atoms, create an s-group out of those
        this._sGroupHelper.showPropertiesDialog(null, selection);
    } else {
        // otherwise, clear selection
        this.editor.ui.updateSelection();
    }
};
rnd.Editor.SGroupTool.prototype = new rnd.Editor.EditorTool();
rnd.Editor.SGroupTool.prototype.OnMouseDown = function(event) {
    var ci = this.editor.render.findItem(event, this.maps);
    if (!ci || ci.type == 'Canvas') {
        this._lassoHelper.begin(event);
    }
};
rnd.Editor.SGroupTool.prototype.OnMouseMove = function(event) {
    if (this._lassoHelper.running()) {
        this.editor._selectionHelper.setSelection(
            this._lassoHelper.addPoint(event)
            // TODO add "no-auto-atoms-selection" option (see selection left on canvas after erasing)
        );
    } else {
        this._hoverHelper.hover(this.editor.render.findItem(event, this.maps));
    }
};

rnd.Editor.SGroupTool.SGroupHelper = function(editor) {
    this.editor = editor;
    this.selection = null;
};

rnd.Editor.SGroupTool.SGroupHelper.prototype.showPropertiesDialog = function(id, selection) {
    this.selection = selection;

    var render = this.editor.render;
    // check s-group overlappings
    if (id == null)
    {
        var verified = {};
        var atoms_hash = {};

        selection.atoms.each(function (id)
        {
            atoms_hash[id] = true;
        }, this);

        if (!Object.isUndefined(selection.atoms.detect(function (id)
        {
            var sgroups = render.atomGetSGroups(id);

            return !Object.isUndefined(sgroups.detect(function (sid)
            {
                if (sid in verified)
                    return false;

                var sg_atoms = render.sGroupGetAtoms(sid);

                if (sg_atoms.length < selection.atoms.length)
                {
                    if (!Object.isUndefined(sg_atoms.detect(function (aid)
                    {
                        return !(aid in atoms_hash);
                    }, this)))
                    {
                        return true;
                    }
                } else if (!Object.isUndefined(selection.atoms.detect(function (aid)
                {
                    return (sg_atoms.indexOf(aid) == -1);
                }, this)))
                {
                    return true;
                }

                return false;
            }, this));
        }, this)))
        {
            alert("Partial S-group overlapping is not allowed.");
            return;
        }
    }

    this.editor.ui.showSGroupProperties(id, this, this.selection, this.OnPropertiesDialogOk, this.OnPropertiesDialogCancel);
};

rnd.Editor.SGroupTool.prototype.OnMouseUp = function(event) {
    var id = null; // id of an existing group, if we're editing one
    var selection = null; // atoms to include in a newly created group
    if (this._lassoHelper.running()) { // TODO it catches more events than needed, to be re-factored
        selection = this._lassoHelper.end(event);
    } else {
        var ci = this.editor.render.findItem(event, this.maps);
        if (!ci || ci.type == 'Canvas')
            return;
        this._hoverHelper.hover(null);

        if (ci.map == 'atoms') {
            // if we click the SGroup tool on a single atom or bond, make a group out of those
            selection = {'atoms': [ci.id]};
        } else if (ci.map == 'bonds') {
            var bond = this.editor.render.ctab.bonds.get(ci.id);
            selection = {'atoms': [bond.b.begin, bond.b.end]};
        } else if (ci.map == 'sgroups') {
            id = ci.id;
        } else {
            return;
        }
    }
    // TODO: handle click on an existing group?
    if (id != null || (selection && selection.atoms && selection.atoms.length > 0))
        this._sGroupHelper.showPropertiesDialog(id, selection);
};

rnd.Editor.SGroupTool.SGroupHelper.prototype.postClose = function() {
    this.editor.ui.updateSelection();
    this.editor.ui.updateClipboardButtons(); // TODO review
    this.editor.render.update();
};

rnd.Editor.SGroupTool.SGroupHelper.prototype.OnPropertiesDialogOk = function(id, type, attrs) {
    if (id == null) {
        id = ui.render.ctab.molecule.sgroups.newId();
        this.editor.ui.addUndoAction(this.editor.ui.Action.fromSgroupAddition(type, this.selection.atoms, attrs, id), true);
    } else {
        this.editor.ui.addUndoAction(this.editor.ui.Action.fromSgroupAttrs(id, attrs).mergeWith(this.editor.ui.Action.fromSgroupType(id, type)), true);
    }
    this.postClose();
};

rnd.Editor.SGroupTool.SGroupHelper.prototype.OnPropertiesDialogCancel = function() {
    this.postClose();
};

rnd.Editor.PasteTool = function(editor) {
    this.editor = editor;
    this.action = this.editor.ui.Action.fromPaste(
        this.editor.ui.clipboard,
        'lastEvent' in this.OnMouseMove0
            ? util.Vec2.diff(
                this.editor.ui.page2obj(this.OnMouseMove0.lastEvent),
                this.editor.ui.clipboard.getAnchorPosition())
            : undefined
    );
    this.editor.render.update();
};
rnd.Editor.PasteTool.prototype = new rnd.Editor.EditorTool();
rnd.Editor.PasteTool.prototype.OnMouseMove = function(event) {
    this.action.perform(this.editor);
    this.action = this.editor.ui.Action.fromPaste(
        this.editor.ui.clipboard,
        util.Vec2.diff(this.editor.ui.page2obj(event), this.editor.ui.clipboard.getAnchorPosition())
    );
    this.editor.render.update();
};
rnd.Editor.PasteTool.prototype.OnMouseUp = function() {
    this.editor.ui.addUndoAction(this.action);
    delete this.action;
    this.editor.ui.selectMode(this.editor.ui.defaultSelector);
};
rnd.Editor.PasteTool.prototype.OnCancel = function() {
    if ('action' in this) {
        this.action.perform(this.editor);
        delete this.action;
    }
};

