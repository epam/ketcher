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
rnd.Editor.prototype.toolFor = function(tool) {
    if (tool == 'select_simple') {
        return new rnd.Editor.LassoTool(this);
    } else if (tool == 'selector_lasso') {
        return new rnd.Editor.LassoTool(this, 0);
    } else if (tool == 'selector_square') {
        return new rnd.Editor.LassoTool(this, 1);
    } else if (tool == 'select_erase') {
        return new rnd.Editor.EraserTool(this, 1); // TODO last selector mode is better
    } else if (tool.startsWith('template_')) {
        return new rnd.Editor.TemplateTool(this, parseInt(tool.split('_')[1]));
    } else if (tool == 'reaction_arrow') {
        return new rnd.Editor.ReactionArrowTool(this);
    } else if (tool == 'reaction_plus') {
        return new rnd.Editor.ReactionPlusTool(this);
    } else if (tool == 'reaction_map') {
        return new rnd.Editor.ReactionMapTool(this);
    } else if (tool == 'reaction_unmap') {
        return new rnd.Editor.ReactionUnmapTool(this);
    } else if (tool == 'rgroup') {
        return new rnd.Editor.RGroupTool(this);
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
        if (name + '0' in this) return this[name + '0'](event); else if (name in this) return this[name](event);
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
    // here we surpress event we got when second touch released in guesture
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
    if (!event.ctrlKey && !event.altKey && ('lastEvent' in this.OnMouseMove0)) {
        if (114 == (Prototype.Browser.IE ? event.keyCode : event.which)) { // 'r'
            return rnd.Editor.RGroupTool.prototype.OnMouseUp.call(this, this.OnMouseMove0.lastEvent);
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
};


rnd.Editor.EditorTool.HoverHelper = function(editorTool) {
    this.editorTool = editorTool;
};
rnd.Editor.EditorTool.HoverHelper.prototype.hover = function(ci) {
    // TODO add custom highlight style parameter, to be used when fusing atoms, sgroup children highlighting, etc
    if ('ci' in this && (!ci || this.ci.type != ci.type || this.ci.id != ci.id)) {
        this.editorTool.editor.render.highlightObject(this.ci, false);
        delete this.ci;
    }
    if (ci && this.editorTool.editor.render.highlightObject(ci, true)) {
        this.ci = ci;
    }
};


rnd.Editor.LassoTool = function(editor, mode) {
    this.editor = editor;

    this._hoverHelper = new rnd.Editor.EditorTool.HoverHelper(this);
    this._lassoHelper = new rnd.Editor.LassoTool.LassoHelper(mode || 0, editor);
};
rnd.Editor.LassoTool.prototype = new rnd.Editor.EditorTool();
rnd.Editor.LassoTool.prototype.OnMouseDown = function(event) {
    this._hoverHelper.hover(null); // TODO review hovering for touch devices
    var ci = this.editor.render.findItem(event);
    if (!ci || ci.type == 'Canvas') {
        this._lassoHelper.begin(event);
    } else if (['atoms', 'bonds', 'sgroups', 'rxnArrows', 'rxnPluses'].indexOf(ci.map) > -1) {
        this._hoverHelper.hover(null);
        if ('onShowLoupe' in this.editor.render) this.editor.render.onShowLoupe(true);
        if (!this.editor._selectionHelper.isSelected(ci)) {
            this.editor._selectionHelper.setSelection(ci, event.shiftKey);
        }
        this.dragCtx = {
            item : ci,
            xy0 : this.editor.ui.page2obj(event),
            action : this.editor.ui.Action.fromSelectedAtomsPos(this.editor._selectionHelper.selection)
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
        this.editor.render._multipleMoveRel(
            this.editor._selectionHelper.selection,
            this.editor.ui.page2obj(event).sub(this.dragCtx.xy0)
        );
        // finding & highlighting object to stick to
        if (['atoms'/*, 'bonds'*/].indexOf(this.dragCtx.item.map) >= 0) {
            // TODO add bond-to-bond fusing
            var ci = this.editor.render.findItem(event, [this.dragCtx.item.map], this.dragCtx.item);
            this._hoverHelper.hover(ci.map == this.dragCtx.item.map ? ci : null);
        }
        this.editor.render.update();

        this.dragCtx.xy0 = this.editor.ui.page2obj(event);
    } else if (this._lassoHelper.running()) {
        //ui.updateSelection(this._lassoHelper.addPoint(event));
        this.editor._selectionHelper.setSelection(this._lassoHelper.addPoint(event), event.shiftKey);
    } else {
        this._hoverHelper.hover(this.editor.render.findItem(event));
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
                this.dragCtx.action = this.editor.ui.Action.fromAtomMerge(this.dragCtx.item.id, ci.id)
                    .mergeWith(this.dragCtx.action);
            }
        }
        this.editor.ui.addUndoAction(this.dragCtx.action, true);
        this.editor.render.update();
        delete this.dragCtx;
    } else {
        if (this._lassoHelper.running()) { // TODO it catches more events than needed, to be re-factored
            this.editor._selectionHelper.setSelection(this._lassoHelper.end(event), event.shiftKey);
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
        this.editor.ui.showSGroupProperties(ci.id);
    }
    return true;
};


rnd.Editor.LassoTool.LassoHelper = function(mode, editor) {
    this.mode = mode;
    this.editor = editor;
};
rnd.Editor.LassoTool.LassoHelper.prototype.getSelection = function() {
    if (this.mode == 0) {
        return this.editor.ui.render.getElementsInPolygon(this.points);
    } else if (this.mode == 1) {
        return this.editor.ui.render.getElementsInRectangle(this.points[0], this.points[1]);
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

    this._hoverHelper = new rnd.Editor.EditorTool.HoverHelper(this);
    this._lassoHelper = new rnd.Editor.LassoTool.LassoHelper(mode || 0, editor);
};
rnd.Editor.EraserTool.prototype = new rnd.Editor.EditorTool();
rnd.Editor.EraserTool.prototype.OnMouseDown = function(event) {
    var ci = this.editor.render.findItem(event);
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
        this._hoverHelper.hover(this.editor.render.findItem(event));
    }
};
rnd.Editor.EraserTool.prototype.OnMouseUp = function(event) {
    if (this._lassoHelper.running()) { // TODO it catches more events than needed, to be re-factored
        this.editor.ui.addUndoAction(this.editor.ui.Action.fromFragmentDeletion(this._lassoHelper.end(event)));
        for (var map1 in rnd.ReStruct.maps) ui.selection[map1] = []; // TODO to be deleted when ui.selection eliminated
        this.editor.ui.render.update();
        this.editor.ui.updateClipboardButtons(); // TODO review
    } else {
        var ci = this.editor.render.findItem(event);
        if (ci && ci.type != 'Canvas') {
            this._hoverHelper.hover(null);
            if (ci.map == 'atoms') {
                this.editor.ui.addUndoAction(this.editor.ui.Action.fromAtomDeletion(ci.id));
            } else if (ci.map == 'bonds') {
                this.editor.ui.addUndoAction(this.editor.ui.Action.fromBondDeletion(ci.id));
            } else if (ci.map == 'sgroups') {
                this.editor.ui.highlightSGroup(ci.id, false); // TODO
                this.editor.ui.addUndoAction(this.editor.ui.Action.fromSgroupDeletion(ci.id));
            } else if (ci.map == 'rxnArrows') {
                this.editor.ui.addUndoAction(this.editor.ui.Action.fromArrowDeletion(ci.id));
            } else if (ci.map == 'rxnPluses') {
                this.editor.ui.addUndoAction(this.editor.ui.Action.fromPlusDeletion(ci.id));
            } else {
                // TODO re-factoring needed - should be "map-independent"
                console.log('EraserTool: unable to delete the object ' + ci.map + '[' + ci.id + ']');
                return;
            }
            for (var map2 in rnd.ReStruct.maps) ui.selection[map2] = []; // TODO to be deleted when ui.selection eliminated
            this.editor.ui.render.update();
            this.editor.ui.updateClipboardButtons(); // TODO review
            this.editor.ui.render.setSelection()
        }
    }
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
    this._hoverHelper.hover(this.editor.render.findItem(event));
};
rnd.Editor.TemplateTool.prototype.OnMouseUp = function(event) {
    this._hoverHelper.hover(null);
    var ci = this.editor.render.findItem(event);
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


rnd.Editor.RGroupTool = function(editor) {
    this.editor = editor;

    this._hoverHelper = new rnd.Editor.EditorTool.HoverHelper(this);
};
rnd.Editor.RGroupTool.prototype = new rnd.Editor.EditorTool();
rnd.Editor.RGroupTool.prototype.OnMouseMove = function(event) {
    this._hoverHelper.hover(this.editor.render.findItem(event, ['atoms']));
};
rnd.Editor.RGroupTool.prototype.OnMouseUp = function(event) {
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
            action : this.editor.ui.Action.fromSelectedRxnArrowPos(),
            xy0 : this.editor.ui.page2obj(event)
        };
    }
};
rnd.Editor.ReactionArrowTool.prototype.OnMouseMove = function(event) {
    if ('dragCtx' in this) {
        this.editor.render._multipleMoveRel(
            this.editor._selectionHelper.selection,
            this.editor.ui.page2obj(event).sub(this.dragCtx.xy0)
        );
        this.editor.ui.render.update();
        this.dragCtx.xy0 = this.editor.ui.page2obj(event);
    } else {
        this._hoverHelper.hover(this.editor.render.findItem(event, ['rxnArrows']));
    }
};
rnd.Editor.ReactionArrowTool.prototype.OnMouseUp = function(event) {
    if ('dragCtx' in this) {
        this.editor.ui.addUndoAction(this.dragCtx.action, false); // TODO investigate, subsiquent undo/redo fails
        this.editor.render.update();
        delete this.dragCtx;
    } else {
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
            action : this.editor.ui.Action.fromSelectedRxnPlusPos(),
            xy0 : this.editor.ui.page2obj(event)
        };
    }
};
rnd.Editor.ReactionPlusTool.prototype.OnMouseMove = function(event) {
    if ('dragCtx' in this) {
        this.editor.render._multipleMoveRel(
            this.editor._selectionHelper.selection,
            this.editor.ui.page2obj(event).sub(this.dragCtx.xy0)
        );
        this.editor.ui.render.update();
        this.dragCtx.xy0 = this.editor.ui.page2obj(event);
    } else {
        this._hoverHelper.hover(this.editor.render.findItem(event, ['rxnPluses']));
    }
};
rnd.Editor.ReactionPlusTool.prototype.OnMouseUp = function(event) {
    if ('dragCtx' in this) {
        this.editor.ui.addUndoAction(this.dragCtx.action, false); // TODO investigate, subsiquent undo/redo fails
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
