/****************************************************************************
 * Copyright (C) 2009-2011 GGA Software Services LLC
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

//
// Undo/redo actions
//
ui.__fixMap = function(map) { // TODO [RB] temporary
    map.indexOf = function(x) {
        var ret = [].indexOf.call(this, x);
        if (ret < 0) ret = this.push(x) - 1;
        return ret;
    };
};
ui.atomMap = new Array(); ui.__fixMap(ui.atomMap);
ui.bondMap = new Array(); ui.__fixMap(ui.bondMap);
ui.sgroupMap = new Array();

ui.Action = function ()
{
    this.operations = new Array();
};

ui.Action.OPERATION =
{
    ATOM_POS:        1,
    /** @deprecated Please use action.addOp(new ui.Action.OpAtomAttr(...)) instead */
    ATOM_ATTR:       2,
    /** @deprecated Please use action.addOp(new ui.Action.OpAtomAdd(...)) instead */
    ATOM_ADD:        3,
     /** @deprecated Please use action.addOp(new ui.Action.OpAtomDelete(...)) instead */
    ATOM_DEL:        4,
    /** @deprecated Please use action.addOp(new ui.Action.OpBondAttr(...)) instead */
    BOND_ATTR:       5,
    /** @deprecated Please use action.addOp(new ui.Action.OpBondAdd(...)) instead */
    BOND_ADD:        6,
    /** @deprecated Please use action.addOp(new ui.Action.OpBondDelete(...)) instead */
    BOND_DEL:        7,
    /** @deprecated Please use action.mergeWith(ui.Action.toBondFlipping(...)) instead */
    BOND_FLIP:       8,
    CANVAS_LOAD:     9,
    SGROUP_ATTR:     10,
    SGROUP_ADD:      11,
    SGROUP_DEL:      12,
    SGROUP_ATOM_ADD: 13,
    SGROUP_ATOM_DEL: 14,
    /** @deprecated Please use action.addOp(new ui.Action.OpRxnArrowDelete(...)) instead */
    RXN_ARROW_DEL:   15,
    /** @deprecated Please use action.addOp(new ui.Action.OpRxnArrowAdd(...)) instead */
    RXN_ARROW_ADD:   16,
    RXN_ARROW_POS:   17,
    /** @deprecated Please use action.addOp(new ui.Action.OpRxnPlusDelete(...)) instead */
    RXN_PLUS_DEL:    18,
    /** @deprecated Please use action.addOp(new ui.Action.OpRxnPlusAdd(...)) instead */
    RXN_PLUS_ADD:    19,
    RXN_PLUS_POS:    20
};

ui.Action.prototype.addOp = function(op) {
    this.operations.push(op);
    return op;
};

/** @deprecated addOp to be used instead */
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
};

ui.Action.prototype.mergeWith = function (action)
{
    this.operations = this.operations.concat(action.operations);
    return this; //rbalabanov: let it be possible to chain actions in code easier
};

// Perform action and return inverted one
ui.Action.prototype.perform = function ()
{
    var action = new ui.Action();
    var idx = 0;

    this.operations.each(function (op)
    {
        if ('perform' in op) {
            //TODO [RB] all the operations in the switch statement below are to be re-factored to this form, this "if" to be removed
            action.addOp(op.perform(ui.editor));
            idx++;
            return;
        }
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
                op.params.atom_map = new Array(); ui.__fixMap(op.params.atom_map);
                op.params.bond_map = new Array(); ui.__fixMap(op.params.bond_map);
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
                    subscript: ui.render.sGroupGetAttr(id, 'subscript'),
                    fieldName: ui.render.sGroupGetAttr(id, 'fieldName'),
                    fieldValue: ui.render.sGroupGetAttr(id, 'fieldValue')
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
                id: op.params.id,
                sid: op.params.sid
            };
            ui.render.atomAddToSGroup(ui.atomMap[op.params.id], ui.sgroupMap[op.params.sid]);

            break;

        case ui.Action.OPERATION.SGROUP_ATOM_DEL:
            op.inverted.type = ui.Action.OPERATION.SGROUP_ATOM_ADD;
            op.inverted.params =
            {
                id: op.params.id,
                sid: op.params.sid
            };
            ui.render.atomRemoveFromSGroup(ui.atomMap[op.params.id], ui.sgroupMap[op.params.sid]);
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
                ui.render.atomAddToSGroup(ui.atomMap[aid], id);
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
            var atoms = ui.render.sGroupGetAtoms(id).clone();
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
                    subscript: ui.render.sGroupGetAttr(id, 'subscript'),
                    fieldName: ui.render.sGroupGetAttr(id, 'fieldName'),
                    fieldValue: ui.render.sGroupGetAttr(id, 'fieldValue')
                },
                atoms: atoms
            };
            // remove highlighting
            // RB: this call seems to be obsolete // TODO Misha K. review, pls
            //BEGIN
            //ui.highlightSGroup(id, false);
            //END
            ui.render.sGroupDelete(id);
            break;

        case ui.Action.OPERATION.RXN_ARROW_DEL:
            op.inverted.type = ui.Action.OPERATION.RXN_ARROW_ADD;
            op.inverted.params =
            {
                pos: ui.render.rxnArrowGetPos(op.params.id)
            };
            ui.render.rxnArrowRemove(op.params.id);
            break;

        case ui.Action.OPERATION.RXN_ARROW_ADD:
            op.inverted.type = ui.Action.OPERATION.RXN_ARROW_DEL;
            if (ui.ctab.rxnArrows.count() < 1) {
                var id = ui.render.rxnArrowAdd(op.params.pos);
                op.inverted.params = { id: id };
            }
            break;

        case ui.Action.OPERATION.RXN_ARROW_POS:
            op.inverted.type = ui.Action.OPERATION.RXN_ARROW_POS;
            op.inverted.params =
            {
                id: op.params.id, // TODO: fix
                pos: ui.render.rxnArrowGetPos(op.params.id)
            };
            ui.render.rxnArrowMove(op.params.id, op.params.pos);
            break;

        case ui.Action.OPERATION.RXN_PLUS_DEL:
            op.inverted.type = ui.Action.OPERATION.RXN_PLUS_ADD;
            op.inverted.params =
            {
                pos: ui.render.rxnPlusGetPos(op.params.id)
            };
            ui.render.rxnPlusRemove(op.params.id);
            break;

        case ui.Action.OPERATION.RXN_PLUS_ADD:
            op.inverted.type = ui.Action.OPERATION.RXN_PLUS_DEL;

            var id = ui.render.rxnPlusAdd(op.params.pos);
            op.inverted.params = { id: id };
            break;

        case ui.Action.OPERATION.RXN_PLUS_POS:
            op.inverted.type = ui.Action.OPERATION.RXN_PLUS_POS;
            op.inverted.params =
            {
                id: op.params.id, // TODO: fix
                pos: ui.render.rxnPlusGetPos(op.params.id)
            };
            ui.render.rxnPlusMove(op.params.id, op.params.pos);
            break;

        default:
            return;
        }
        action.operations.push(op.inverted);
        idx++;
    }, this);

    action.operations.reverse();

    return action;
};

ui.Action.prototype.isDummy = function ()
{
    return this.operations.detect(function(op) {
        if ('isDummy' in op) return !op.isDummy(ui.editor); // TODO [RB] the condition is always true for ui.Action.Op* operations
        switch (op.type)
        {
        case ui.Action.OPERATION.ATOM_POS:
            return !ui.render.atomGetPos(ui.atomMap[op.params.id]).equals(op.params.pos);
        case ui.Action.OPERATION.ATOM_ATTR:
            return ui.render.atomGetAttr(ui.atomMap[op.params.id], op.params.attr_name) != op.params.attr_value;
        case ui.Action.OPERATION.BOND_ATTR:
            return ui.render.bondGetAttr(ui.bondMap[op.params.id], op.params.attr_name) != op.params.attr_value;
        case ui.Action.OPERATION.SGROUP_ATTR:
            if (ui.render.sGroupGetType(ui.sgroupMap[op.params.id]) == op.params.type)
            {
                var attr_hash = new Hash(op.params.attrs);

                if (Object.isUndefined(attr_hash.detect(function (attr)
                {
                    return ui.render.sGroupGetAttr(ui.sgroupMap[op.params.id], attr.key) != attr.value;
                }, this)))
                    return false;
            }
            return true;
        }
        return true;
    }, this) == null;
};

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
};

ui.Action.fromSelectedAtomsPos = function(selection)
{
    selection = selection || ui.selection;

    var action = new ui.Action();

    selection.atoms.each(
        function(id) {
            action.addOperation(
                ui.Action.OPERATION.ATOM_POS,
                {
                    id: ui.atomMap.indexOf(id),
                    pos: ui.render.atomGetPos(id)
                }
            );
        },
        this
    );

    return action;
};

ui.Action.fromRxnArrowPos = function (id, pos)
{
    var action = new ui.Action();

    action.addOperation(ui.Action.OPERATION.RXN_ARROW_POS,
    {
        id: id,
        pos: ui.render.rxnArrowGetPos(id)
    });

    if (arguments.length > 1)
        ui.render.rxnArrowMove(id, pos);

    return action;
};

ui.Action.fromSelectedRxnArrowPos = function ()
{
    var action = new ui.Action();

    ui.selection.rxnArrows.each(function (id)
    {
        action.addOperation(ui.Action.OPERATION.RXN_ARROW_POS,
        {
            id: id,
            pos: ui.render.rxnArrowGetPos(id)
        });
    }, this);

    return action;
};

ui.Action.fromRxnPlusPos = function (id, pos)
{
    var action = new ui.Action();

    action.addOperation(ui.Action.OPERATION.RXN_PLUS_POS,
    {
        id: id,
        pos: ui.render.rxnPlusGetPos(id)
    });

    if (arguments.length > 1)
        ui.render.rxnPlusMove(id, pos);

    return action;
};

ui.Action.fromSelectedRxnPlusPos = function ()
{
    var action = new ui.Action();

    ui.selection.rxnPluses.each(function (id)
    {
        action.addOperation(ui.Action.OPERATION.RXN_PLUS_POS,
        {
            id: id,
            pos: ui.render.rxnPlusGetPos(id)
        });
    }, this);

    return action;
};

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
};

ui.Action.fromAtomAttrs = function (id, attrs)
{
    var action = new ui.Action();
    new Hash(attrs).each(function (attr) {
        action.addOp(new ui.Action.OpAtomAttr(id, attr.key, attr.value));
    }, this);
    return action.perform();
};

ui.Action.fromSelectedAtomsAttrs = function (attrs)
{
    var action = new ui.Action();
    new Hash(attrs).each(function(attr) {
        ui.selection.atoms.each(function(id) {
            action.addOp(new ui.Action.OpAtomAttr(id, attr.key, attr.value));
        }, this)
    }, this);
    return action.perform();
};

ui.Action.fromBondAttrs = function (id, attrs, flip)
{
    var action = new ui.Action();

    new Hash(attrs).each(function(attr) {
        action.addOp(new ui.Action.OpBondAttr(id, attr.key, attr.value));
    }, this);
    if (flip) {
        action.mergeWith(ui.Action.toBondFlipping(id));
    }
    return action.perform();
};

ui.Action.fromSelectedBondsAttrs = function (attrs, flips)
{
    var action = new ui.Action();

    attrs = new Hash(attrs);

    ui.selection.bonds.each(function(id) {
        attrs.each(function(attr) {
            action.addOp(new ui.Action.OpBondAttr(id, attr.key, attr.value));
        }, this);
    }, this);
    if (flips)
        flips.each(function (id) {
            action.mergeWith(ui.Action.toBondFlipping(id));
        }, this);
    return action.perform();
};

ui.Action.fromAtomAddition = function (pos, atom)
{
    atom = Object.clone(atom);
    var action = new ui.Action();
    atom.fragment = action.addOp(new ui.Action.OpFragmentAdd().perform(ui.editor)).frid;
    action.addOp(new ui.Action.OpAtomAdd(atom, pos).perform(ui.editor));
    return action;
};

ui.Action.fromBondAddition = function (bond, begin, end, pos, pos2)
{
    var action = new ui.Action();

    var frid = null;
    if (!Object.isNumber(begin)) {
        if (Object.isNumber(end)) {
            frid = ui.render.atomGetAttr(end, 'fragment');
        }
    }
    else {
        frid = ui.render.atomGetAttr(begin, 'fragment');
        if (Object.isNumber(end)) {
            var frid2 = ui.render.atomGetAttr(end, 'fragment');
            if (frid2 != frid && Object.isNumber(frid2)) {
                var rgid = chem.Struct.RGroup.findRGroupByFragment(ui.render.ctab.molecule.rgroups, frid2);
                if (!Object.isUndefined(rgid)) {
                    action.mergeWith(ui.Action.fromRGroupFragment(null, frid2));
                }
                ui.render.ctab.molecule.atoms.each(function(aid, atom) {
                    if (atom.fragment == frid2) {
                        action.addOp(new ui.Action.OpAtomAttr(aid, 'fragment', frid).perform(ui.editor));
                    }
                });
                action.addOp(new ui.Action.OpFragmentDelete(frid2).perform(ui.editor));
            }
        }
    }
    if (frid == null) {
        frid = action.addOp(new ui.Action.OpFragmentAdd().perform(ui.editor)).frid;
    }

    if (!Object.isNumber(begin)) {
        begin.fragment = frid;
        begin = action.addOp(new ui.Action.OpAtomAdd(begin, pos).perform(ui.editor)).data.aid;

        pos = pos2;
    }
    else {
        if (ui.render.atomGetAttr(begin, 'label') == '*') {
            action.addOp(new ui.Action.OpAtomAttr(begin, 'label', 'C').perform(ui.editor));
        }
    }


    if (!Object.isNumber(end)) {
        end.fragment = frid;
        end = action.addOp(new ui.Action.OpAtomAdd(end, pos).perform(ui.editor)).data.aid;
    }
    else {
        if (ui.render.atomGetAttr(end, 'label') == '*') {
            action.addOp(new ui.Action.OpAtomAttr(end, 'label', 'C').perform(ui.editor));
        }
    }

    action.addOp(new ui.Action.OpBondAdd(begin, end, bond).perform(ui.editor));

    action.operations.reverse();

    return [action, begin, end];
};

ui.Action.fromArrowAddition = function (pos)
{
    var action = new ui.Action();
    if (ui.ctab.rxnArrows.count() < 1) {
        action.addOp(new ui.Action.OpRxnArrowAdd(pos).perform(ui.editor));
    }
    return action;
};

ui.Action.fromArrowDeletion = function (id)
{
    var action = new ui.Action();
    action.addOp(new ui.Action.OpRxnArrowDelete(id));
    return action.perform();
};

ui.Action.fromPlusAddition = function (pos)
{
    var action = new ui.Action();
    action.addOp(new ui.Action.OpRxnPlusAdd(pos).perform(ui.editor));
    return action;
};

ui.Action.fromPlusDeletion = function (id)
{
    var action = new ui.Action();
    action.addOp(new ui.Action.OpRxnPlusDelete(id));
    return action.perform();
};

// Add action operation to remove atom from s-group if needed
ui.Action.prototype.removeAtomFromSgroupIfNeeded = function (id)
{
    var sgroups = ui.render.atomGetSGroups(id);

    if (sgroups.length > 0)
    {
        sgroups.each(function (sid)
        {
            this.addOperation(ui.Action.OPERATION.SGROUP_ATOM_DEL,
            {
                id: ui.atomMap.indexOf(id),
                sid: ui.sgroupMap.indexOf(sid)
            });
        }, this);

        return true;
    }

    return false;
};

// Add action operations to remove whole s-group if needed
ui.Action.prototype.removeSgroupIfNeeded = function (atoms)
{
    var sg_counts = new Hash();

    atoms.each(function (id)
    {
        var sgroups = ui.render.atomGetSGroups(id);

        sgroups.each(function (sid)
        {
            var n = sg_counts.get(sid);
            if (Object.isUndefined(n))
                n = 1;
            else
                n++;
            sg_counts.set(sid, n);
        }, this);
    }, this);

    sg_counts.each(function (sg)
    {
        var sid = parseInt(sg.key);
        var sg_atoms = ui.render.sGroupGetAtoms(sid);

        if (sg_atoms.length == sg.value)
        { // delete whole s-group
            this.addOperation(ui.Action.OPERATION.SGROUP_DEL,
            {
                id: ui.sgroupMap.indexOf(sid)
            });
        }
    }, this);
};

ui.Action.fromAtomDeletion = function (id)
{
    var action = new ui.Action();
    var atoms_to_remove = new Array();

    var frid = ui.ctab.atoms.get(id).fragment;

    ui.render.atomGetNeighbors(id).each(function (nei)
    {
        action.addOp(new ui.Action.OpBondDelete(nei.bid));// [RB] !!
        if (ui.render.atomGetDegree(nei.aid) == 1)
        {
            if (action.removeAtomFromSgroupIfNeeded(nei.aid))
                atoms_to_remove.push(nei.aid);

            action.addOp(new ui.Action.OpAtomDelete(nei.aid));
        }
    }, this);

    if (action.removeAtomFromSgroupIfNeeded(id))
        atoms_to_remove.push(id);

    action.addOp(new ui.Action.OpAtomDelete(id));

    action.removeSgroupIfNeeded(atoms_to_remove);

    action = action.perform();

    action.mergeWith(ui.Action.__fromFragmentSplit(frid));

    return action;
};

ui.Action.fromBondDeletion = function (id)
{
    var action = new ui.Action();
    var bond = ui.ctab.bonds.get(id);
    var frid = ui.ctab.atoms.get(bond.begin).fragment;
    var atoms_to_remove = new Array();

    action.addOp(new ui.Action.OpBondDelete(id));

    if (ui.render.atomGetDegree(bond.begin) == 1)
    {
        if (action.removeAtomFromSgroupIfNeeded(bond.begin))
            atoms_to_remove.push(bond.begin);

        action.addOp(new ui.Action.OpAtomDelete(bond.begin));
    }

    if (ui.render.atomGetDegree(bond.end) == 1)
    {
        if (action.removeAtomFromSgroupIfNeeded(bond.end))
            atoms_to_remove.push(bond.end);

        action.addOp(new ui.Action.OpAtomDelete(bond.end));
    }

    action.removeSgroupIfNeeded(atoms_to_remove);

    action = action.perform();

    action.mergeWith(ui.Action.__fromFragmentSplit(frid));

    return action;
};

ui.Action.__fromFragmentSplit = function(frid) { // TODO [RB] the thing is too tricky :) need something else in future
    var action = new ui.Action();
    var rgid = chem.Struct.RGroup.findRGroupByFragment(ui.ctab.rgroups, frid);
    ui.ctab.atoms.each(function(aid, atom) {
        if (atom.fragment == frid) {
            var newfrid = action.addOp(new ui.Action.OpFragmentAdd().perform(ui.editor)).frid;
            var processAtom = function(aid1) {
                action.addOp(new ui.Action.OpAtomAttr(aid1, 'fragment', newfrid).perform(ui.editor));
                ui.render.atomGetNeighbors(aid1).each(function(nei) {
                    if (ui.ctab.atoms.get(nei.aid).fragment == frid) {
                        processAtom(nei.aid);
                    }
                });
            };
            processAtom(aid);
            if (rgid) {
                action.mergeWith(ui.Action.fromRGroupFragment(rgid, newfrid));
            }
        }
    });
    if (frid != -1) {
        action.mergeWith(ui.Action.fromRGroupFragment(0, frid));
        action.addOp(new ui.Action.OpFragmentDelete(frid).perform(ui.editor));
    }
    return action;
};

ui.Action.fromFragmentAddition = function (atoms, bonds, sgroups, rxnArrows, rxnPluses)
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


    bonds.each(function (bid) {
        action.addOp(new ui.Action.OpBondDelete(bid));
    }, this);


    atoms.each(function(aid) {
        action.addOp(new ui.Action.OpAtomDelete(aid));
    }, this);

    rxnArrows.each(function (id) {
        action.addOp(new ui.Action.OpRxnArrowDelete(id));
    }, this);

    rxnPluses.each(function (id) {
        action.addOp(new ui.Action.OpRxnPlusDelete(id));
    }, this);

    action.mergeWith(new ui.Action.__fromFragmentSplit(-1));

    return action;
};

ui.Action.fromFragmentDeletion = function(selection)
{
    selection = selection || ui.selection;
        
    var action = new ui.Action();
    var atoms_to_remove = new Array();

    var frids = [];

    selection.atoms.each(function (aid)
    {
        ui.render.atomGetNeighbors(aid).each(function (nei)
        {
            if (selection.bonds.indexOf(nei.bid) == -1)
                selection.bonds = selection.bonds.concat([nei.bid]);
        }, this);
    }, this);

    selection.bonds.each(function (bid)
    {
        action.addOp(new ui.Action.OpBondDelete(bid));

        var bond = ui.ctab.bonds.get(bid);

        if (selection.atoms.indexOf(bond.begin) == -1 && ui.render.atomGetDegree(bond.begin) == 1)
        {
            var frid1 = ui.ctab.atoms.get(bond.begin).fragment; if (frids.indexOf(frid1) < 0) frids.push(frid1);

            if (action.removeAtomFromSgroupIfNeeded(bond.begin))
                atoms_to_remove.push(bond.begin);

            action.addOp(new ui.Action.OpAtomDelete(bond.begin));
        }
        if (selection.atoms.indexOf(bond.end) == -1 && ui.render.atomGetDegree(bond.end) == 1)
        {
            var frid2 = ui.ctab.atoms.get(bond.end).fragment; if (frids.indexOf(frid2) < 0) frids.push(frid2);

            if (action.removeAtomFromSgroupIfNeeded(bond.end))
                atoms_to_remove.push(bond.end);

            action.addOp(new ui.Action.OpAtomDelete(bond.end));
        }
    }, this);


    selection.atoms.each(function (aid)
    {
        var frid3 = ui.ctab.atoms.get(aid).fragment; if (frids.indexOf(frid3) < 0) frids.push(frid3);

        if (action.removeAtomFromSgroupIfNeeded(aid))
            atoms_to_remove.push(aid);

        action.addOp(new ui.Action.OpAtomDelete(aid));
    }, this);

    action.removeSgroupIfNeeded(atoms_to_remove);

    selection.rxnArrows.each(function (id) {
        action.addOp(new ui.Action.OpRxnArrowDelete(id));
    }, this);

    selection.rxnPluses.each(function (id) {
        action.addOp(new ui.Action.OpRxnPlusDelete(id));
    }, this);

    action = action.perform();

    while (frids.length > 0) action.mergeWith(new ui.Action.__fromFragmentSplit(frids.pop()));

    return action;
};

ui.Action.fromAtomMerge = function (src_id, dst_id)
{
    var action = new ui.Action();
    ui.render.atomGetNeighbors(src_id).each(function (nei)
    {
        var bond = ui.ctab.bonds.get(nei.bid);
        var begin, end;

        if (bond.begin == nei.aid) {
            begin = nei.aid;
            end = dst_id;
        } else {
            begin = dst_id;
            end = nei.aid;
        }
        if (dst_id != bond.begin && dst_id != bond.end && ui.ctab.findBondId(begin, end) == -1) // TODO: improve this
        {
            //TODO [RB] the trick to merge fragments, will find more stright way later
            //action.addOp(new ui.Action.OpBondAdd(begin, end, bond));
            action.mergeWith(ui.Action.fromBondAddition(bond, begin, end)[0].perform());
        }
        action.addOp(new ui.Action.OpBondDelete(nei.bid));
    }, this);

    var attrs = chem.Struct.Atom.getAttrHash(ui.ctab.atoms.get(src_id));

    if (ui.render.atomGetDegree(src_id) == 1 && attrs.get('label') == '*')
        attrs.set('label', 'C');

    attrs.each(function(attr) {
        action.addOp(new ui.Action.OpAtomAttr(dst_id, attr.key, attr.value));
    }, this);

    var sg_changed = action.removeAtomFromSgroupIfNeeded(src_id);

    action.addOp(new ui.Action.OpAtomDelete(src_id));

    if (sg_changed)
        action.removeSgroupIfNeeded([src_id]);

    return action.perform();
};

ui.Action.toBondFlipping = function (id)
{
    var bond = ui.ctab.bonds.get(id);

    var action = new ui.Action();
    action.addOp(new ui.Action.OpBondDelete(id));
    action.addOp(new ui.Action.OpBondAdd(bond.end, bond.begin, bond)).data.bid = id;
    return action;
};
ui.Action.fromBondFlipping = function(bid) {
    return ui.Action.toBondFlipping(bid).perform();
};

ui.Action.fromPatternOnCanvas = function (pos, pattern)
{
    var angle = 2 * Math.PI / pattern.length;
    var l = 1.0 / (2 * Math.sin(angle / 2));
    var v = new util.Vec2(0, -l);

    var action = new ui.Action();

    var fragAction = new ui.Action.OpFragmentAdd().perform(ui.editor);

    pattern.each(function() {
        action.addOp(
            new ui.Action.OpAtomAdd(
                { label: 'C', fragment: fragAction.frid },
                util.Vec2.sum(pos, v)
            ).perform(ui.editor)
        );
        v = v.rotate(angle);
    }, this);

    for (var i = 0, n = action.operations.length; i < n; i++) {
        action.addOp(
            new ui.Action.OpBondAdd(
                action.operations[i].data.aid,
                action.operations[(i + 1) % pattern.length].data.aid,
                { type: pattern[i] }
            ).perform(ui.editor)
        );
    }

    action.operations.reverse();
    action.addOp(fragAction);

    return action;
};

ui.Action.fromChain = function (p0, v, nSect, atom_id)
{
    var angle = Math.PI / 6;
    var dx = Math.cos(angle), dy = Math.sin(angle);

    var action = new ui.Action();

    var frid;
    if (atom_id != null) {
        frid = ui.render.atomGetAttr(atom_id, 'fragment');
    } else {
        frid = action.addOp(new ui.Action.OpFragmentAdd().perform(ui.editor)).frid;
    }

    var id0 = -1;
    if (atom_id != null) {
        id0 = atom_id;
    } else {
        id0 = action.addOp(new ui.Action.OpAtomAdd({ label: 'C', fragment : frid }, p0).perform(ui.editor)).data.aid;
    }

    nSect.times(function (i)
    {
        var pos = new util.Vec2(dx * (i + 1), i & 1 ? 0 : dy).rotate(v).add(p0);

        var a = ui.render.findClosestAtom(pos, 0.1);

        var id1 = -1;
        if (a == null)
        {
            id1 = action.addOp(new ui.Action.OpAtomAdd({ label: 'C', fragment : frid }, pos).perform(ui.editor)).data.aid;
        } else {
            //TODO [RB] need to merge fragments: is there a way to reuse fromBondAddition (which performs it) instead of using code below???
            id1 = a.id;
        }

        if (!ui.render.checkBondExists(id0, id1))
        {
            action.addOp(new ui.Action.OpBondAdd(id0, id1, {}).perform(ui.editor));
        }
        id0 = id1;
    }, this);

    action.operations.reverse();

    return action;
};

ui.Action.fromPatternOnAtom = function (aid, pattern)
{
    if (ui.render.atomGetDegree(aid) != 1)
    {
        var atom = ui.atomForNewBond(aid);
        atom.fragment = ui.render.atomGetAttr(aid, 'fragment');
        var action_res = ui.Action.fromBondAddition({type: 1}, aid, atom.atom, atom.pos);

        var action = ui.Action.fromPatternOnElement(action_res[2], pattern, true);

        action.mergeWith(action_res[0]);

        return action;
    }

    return ui.Action.fromPatternOnElement(aid, pattern, true);
};

ui.Action.fromPatternOnElement = function (id, pattern, on_atom)
{
    var angle = (pattern.length - 2) * Math.PI / (2 * pattern.length);
    var first_idx = 0; //pattern.indexOf(bond.type) + 1; // 0 if there's no
    var pos = null; // center pos
    var v = null; // rotating vector from center

    if (on_atom) {
        var nei_id = ui.render.atomGetNeighbors(id)[0].aid;
        var atom_pos = ui.render.atomGetPos(id);

        pos = util.Vec2.diff(atom_pos, ui.render.atomGetPos(nei_id));
        pos = pos.scaled(pos.length() / 2 / Math.cos(angle));
        v = pos.negated();
        pos.add_(atom_pos);
        angle = Math.PI - 2 * angle;
    }
    else {
        var bond = ui.ctab.bonds.get(id);
        var begin_pos = ui.render.atomGetPos(bond.begin);
        var end_pos = ui.render.atomGetPos(bond.end);

        v = util.Vec2.diff(end_pos, begin_pos);
        var l = v.length() / (2 * Math.cos(angle));

        v = v.scaled(l / v.length());

        var v_sym = v.rotate(-angle);
        v = v.rotate(angle);

        pos = util.Vec2.sum(begin_pos, v);
        var pos_sym = util.Vec2.sum(begin_pos, v_sym);

        var cnt = 0, bcnt = 0;
        var cnt_sym = 0, bcnt_sym = 0;

        // TODO: improve this enumeration
        ui.ctab.atoms.each(function (a_id) {
            if (util.Vec2.dist(pos, ui.render.atomGetPos(a_id)) < l * 1.1) {
                cnt++;
                bcnt += ui.render.atomGetDegree(a_id);
            }
            else if (util.Vec2.dist(pos_sym, ui.render.atomGetPos(a_id)) < l * 1.1) {
                cnt_sym++;
                bcnt_sym += ui.render.atomGetDegree(a_id);
            }
        });

        angle = Math.PI - 2 * angle;

        if (cnt > cnt_sym || (cnt == cnt_sym && bcnt > bcnt_sym)) {
            pos = pos_sym;
            v = v_sym;
        }
        else angle = -angle;

        v = v.negated();
    }
    ui.render.update();

    var action = new ui.Action();
    var atom_ids = new Array(pattern.length);

    if (!on_atom) {
        atom_ids[0] = bond.begin;
        atom_ids[pattern.length - 1] = bond.end;
    }

    var frid = ui.render.ctab.molecule.atoms.get(on_atom ? id : ui.render.ctab.molecule.bonds.get(id).begin).fragment;

    (pattern.length - (on_atom ? 0 : 1)).times(function(idx) {
        if (idx > 0 || on_atom) {
            var new_pos = util.Vec2.sum(pos, v);

            var a = ui.render.findClosestAtom(new_pos, 0.1);

            if (a == null) {
                atom_ids[idx] = action.addOp(
                    new ui.Action.OpAtomAdd({ label: 'C', fragment : frid }, new_pos).perform(ui.editor)
                ).data.aid;
            }
            else {
                // TODO [RB] need to merge fragments?
                atom_ids[idx] = a.id;
            }
        }

        v = v.rotate(angle);
    }, this);

    var i = 0;

    pattern.length.times(function(idx) {
        var begin = atom_ids[idx];
        var end = atom_ids[(idx + 1) % pattern.length];
        var bond_type = pattern[(first_idx + idx) % pattern.length];

        if (!ui.render.checkBondExists(begin, end)) {
/*
            var bond_id = ui.render.bondAdd(begin, end, {type: bond_type});

            action.addOperation(
                ui.Action.OPERATION.BOND_DEL,
                { id: ui.bondMap.push(bond_id) - 1 }
            );
*/
            action.addOp(new ui.Action.OpBondAdd(begin, end, { type: bond_type }).perform(ui.editor));
        }
        else {
            if (bond_type == chem.Struct.BOND.TYPE.AROMATIC) {
                var nei = ui.render.atomGetNeighbors(begin);

                nei.find(function(n) {
                    if (n.aid == end) {
                        var src_type = ui.render.bondGetAttr(n.bid, 'type');

                        if (src_type != bond_type) {
/*
                            action.addOperation(
                                ui.Action.OPERATION.BOND_ATTR,
                                { id: ui.bondMap.indexOf(n.bid), attr_name: 'type', attr_value: src_type }
                            );
                            ui.render.bondSetAttr(n.bid, 'type', bond_type);
*/
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
};

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
};

ui.Action.fromSgroupAttrs = function (id, type, attrs)
{
    var action = new ui.Action();
    var id_map = ui.sgroupMap.indexOf(id);
    var cur_type = ui.render.sGroupGetType(id);

    action.addOperation(ui.Action.OPERATION.SGROUP_ATTR,
    {
        id: id_map,
        type: type,
        attrs: attrs
    });

    if ((cur_type == 'SRU' || type == 'SRU') && cur_type != type) {
        ui.render.sGroupsFindCrossBonds();
        var nei_atoms = ui.render.sGroupGetNeighborAtoms(id);

        if (cur_type == 'SRU') {
            nei_atoms.each(function(aid) {
                if (ui.render.atomGetAttr(aid, 'label') == '*') {
                    action.addOp(new ui.Action.OpAtomAttr(aid, 'label', 'C'));
                }
            }, this);
        } else {
            nei_atoms.each(function (aid) {
                if (ui.render.atomGetDegree(aid) == 1 && ui.render.atomIsPlainCarbon(aid)) {
                    action.addOp(new ui.Action.OpAtomAttr(aid, 'label', '*'));
                }
            }, this);
        }
    }

    return action.perform();
};

ui.Action.fromSgroupDeletion = function (id)
{
    var action = new ui.Action();

    if (ui.render.sGroupGetType(id) == 'SRU') {
        ui.render.sGroupsFindCrossBonds();
        var nei_atoms = ui.render.sGroupGetNeighborAtoms(id);

        nei_atoms.each(function(aid) {
            if (ui.render.atomGetAttr(aid, 'label') == '*') {
                action.addOp(new ui.Action.OpAtomAttr(aid, 'label', 'C'));
            }
        }, this);
    }

    action.addOperation(ui.Action.OPERATION.SGROUP_DEL,
    {
        id: ui.sgroupMap.indexOf(id)
    });

    return action.perform();
};

ui.Action.fromSgroupAddition = function (type, attrs, atoms)
{
    var action = new ui.Action();
    var i;

    for (i = 0; i < atoms.length; i++)
        atoms[i] = ui.atomMap.indexOf(atoms[i]);

    action.addOperation(ui.Action.OPERATION.SGROUP_ADD,
    {
        type: type,
        attrs: attrs,
        atoms: atoms
    });

    action = action.perform();

    if (type == 'SRU') {
        var sid = ui.sgroupMap[action.operations[0].params.id];

        ui.render.sGroupsFindCrossBonds();
        var nei_atoms = ui.render.sGroupGetNeighborAtoms(sid);
        var asterisk_action = new ui.Action();

        nei_atoms.each(function(aid) {
            if (ui.render.atomGetDegree(aid) == 1 && ui.render.atomIsPlainCarbon(aid)) {
                asterisk_action.addOp(new ui.Action.OpAtomAttr(aid, 'label', 'C'));
            }
        }, this);

        asterisk_action = asterisk_action.perform();
        asterisk_action.mergeWith(action);
        action = asterisk_action;
    }

    return action;
};

ui.Action.fromRGroupAttrs = function(id, attrs) {
    var action = new ui.Action();
    new Hash(attrs).each(function(attr) {
        action.addOp(new ui.Action.OpRGroupAttr(id, attr.key, attr.value));
    }, this);
    return action.perform();
};

ui.Action.fromRGroupFragment = function(rgidNew, frid) {
    var action = new ui.Action();
    action.addOp(new ui.Action.OpRGroupFragment(rgidNew, frid));
    return action.perform();
};

ui.Action.fromPaste = function(objects, offset) {
    offset = offset || new util.Vec2();
    var action = new ui.Action(), amap = {}, fmap = {};
    // atoms
    for (var aid = 0; aid < objects.atoms.length; aid++) {
        var atom = Object.clone(objects.atoms[aid]);
        if (!(atom.fragment in fmap)) {
            fmap[atom.fragment] = action.addOp(new ui.Action.OpFragmentAdd().perform(ui.editor)).frid;
        }
        atom.fragment = fmap[atom.fragment];
        amap[aid] = action.addOp(new ui.Action.OpAtomAdd(atom, atom.pos.add(offset)).perform(ui.editor)).data.aid;
    }
    //bonds
    for (var bid = 0; bid < objects.bonds.length; bid++) {
        var bond = Object.clone(objects.bonds[bid]);
        action.addOp(new ui.Action.OpBondAdd(amap[bond.begin], amap[bond.end], bond).perform(ui.editor));
    }
    //sgroups
    for (var sgid = 0; sgid < objects.sgroups.length; sgid++) {
        var sgroup = Object.clone(objects.sgroups[sgid]), sgatoms = [];
        for (var sgaid = 0; sgaid < sgroup.atoms.length; sgaid++) {
            sgatoms.push(amap[sgroup.atoms[sgaid]]);
        }
        var sgaction = ui.Action.fromSgroupAddition(sgroup.type, sgroup, sgatoms);
        //action.mergeWith(sgaction);
        for (var iop = sgaction.operations.length - 1; iop >= 0; iop--) {
            action.addOp(sgaction.operations[iop]);
        }
    }
    //reaction arrows
    if (ui.editor.render.ctab.rxnArrows.count() < 1) {
        for (var raid = 0; raid < objects.rxnArrows.length; raid++) {
            action.addOp(new ui.Action.OpRxnArrowAdd(objects.rxnArrows[raid].pos.add(offset)).perform(ui.editor));
        }
    }
    //reaction pluses
    for (var rpid = 0; rpid < objects.rxnPluses.length; rpid++) {
        action.addOp(new ui.Action.OpRxnPlusAdd(objects.rxnPluses[rpid].pos.add(offset)).perform(ui.editor));
    }
    //thats all
    action.operations.reverse();
    return action;
};

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
};

ui.removeDummyAction = function ()
{
    if (ui.undoStack.length != 0 && ui.undoStack.last().isDummy())
    {
        ui.undoStack.pop();
        ui.updateActionButtons();
    }
};

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
};

ui.undo = function ()
{
    ui.redoStack.push(ui.undoStack.pop().perform());
    ui.updateActionButtons();
    ui.updateSelection();
};

ui.redo = function ()
{
    ui.undoStack.push(ui.redoStack.pop().perform());
    ui.updateActionButtons();
    ui.updateSelection();
};


ui.Action.OpBase = function() {};
ui.Action.OpBase.prototype._execute = function() { throw new Error('Operation._execute() is not implemented'); };
ui.Action.OpBase.prototype._invert = function() { throw new Error('Operation._invert() is not implemented');};
ui.Action.OpBase.prototype.perform = function(editor) {
    this._execute(editor);
    if (!('__inverted' in this)) {
        this.__inverted = this._invert();
        this.__inverted.__inverted = this;
    }
    return this.__inverted;
};
ui.Action.OpBase.prototype.isDummy = function(editor) {
    return '_isDummy' in this ? this['_isDummy'](editor) : false;
};

ui.Action.OpAtomAdd = function(atom, pos) {
    this.data = { aid : null, atom : atom, pos : pos };
    this._execute = function(editor) {
        var R = editor.render, RS = R.ctab, DS = RS.molecule;
        var pp = {}; if (this.data.atom) for (var p in this.data.atom) pp[p] = this.data.atom[p];
        pp.label = pp.label || 'C';
        if (!Object.isNumber(this.data.aid)) {
            this.data.aid = DS.atoms.add(new chem.Struct.Atom(pp));
            ui.atomMap.indexOf(this.data.aid); // TODO [RB] temporary kludge
        } else {
            DS.atoms.set(this.data.aid, new chem.Struct.Atom(pp));
        }
        RS.notifyAtomAdded(this.data.aid);
        DS._atomSetPos(this.data.aid, new util.Vec2(this.data.pos));
    };
    this._invert = function() {
        var ret = new ui.Action.OpAtomDelete(); ret.data = this.data; return ret;
    };
};
ui.Action.OpAtomAdd.prototype = new ui.Action.OpBase();

ui.Action.OpAtomDelete = function(aid) {
    this.data = { aid : aid, atom : null, pos : null };
    this._execute = function(editor) {
        var R = editor.render, RS = R.ctab, DS = RS.molecule;
        if (!this.data.atom) {
            this.data.atom = DS.atoms.get(this.data.aid);
            this.data.pos = R.atomGetPos(this.data.aid);
        }
        RS.notifyAtomRemoved(this.data.aid);
        DS.atoms.remove(this.data.aid);
    };
    this._invert = function() {
        var ret = new ui.Action.OpAtomAdd(); ret.data = this.data; return ret;
    };
};
ui.Action.OpAtomDelete.prototype = new ui.Action.OpBase();

ui.Action.OpAtomAttr = function(aid, attribute, value) {
    this.data = { aid : aid, attribute : attribute, value : value };
    this.data2 = null;
    this._execute = function(editor) {
        var atom = editor.render.ctab.molecule.atoms.get(this.data.aid);
        if (!this.data2) {
            this.data2 = { aid : this.data.aid, attribute : this.data.attribute, value : atom[this.data.attribute] };
        }

        if (this.data.attribute == 'label' && this.data.value != null) // HACK TODO review
            atom['atomList'] = null;

        atom[this.data.attribute] = this.data.value;

        editor.render.invalidateAtom(this.data.aid);
    };
    this._isDummy = function(editor) {
        return editor.render.ctab.molecule.atoms.get(this.data.aid)[this.data.attribute] == this.data.value;
    };
    this._invert = function() {
        var ret = new ui.Action.OpAtomAttr(); ret.data = this.data2; ret.data2 = this.data; return ret;
    };
};
ui.Action.OpAtomAttr.prototype = new ui.Action.OpBase();

ui.Action.OpBondAdd = function(begin, end, bond) {
    this.data = { bid : null, bond : bond, begin : begin, end : end };
    this._execute = function(editor) {
        var R = editor.render, RS = R.ctab, DS = RS.molecule;
        if (this.data.begin == this.data.end)
            throw new Error("Distinct atoms expected");
        if (rnd.DEBUG && this.molecule.checkBondExists(this.data.begin, this.data.end))
            throw new Error("Bond already exists");

        R.invalidateAtom(this.data.begin, 1);
        R.invalidateAtom(this.data.end, 1);

        var pp = {}; if (this.data.bond) for (var p in this.data.bond) pp[p] = this.data.bond[p];
        pp.type = pp.type || chem.Struct.BOND.TYPE.SINGLE;
        pp.begin = this.data.begin;
        pp.end = this.data.end;

        if (!Object.isNumber(this.data.bid)) {
            this.data.bid = DS.bonds.add(new chem.Struct.Bond(pp));
            ui.bondMap.indexOf(this.data.bid); // TODO [RB] temporary kludge
        } else {
            DS.bonds.set(this.data.bid, new chem.Struct.Bond(pp));
        }
        DS.bondInitHalfBonds(this.data.bid);
        DS.atomAddNeighbor(DS.bonds.get(this.data.bid).hb1);
        DS.atomAddNeighbor(DS.bonds.get(this.data.bid).hb2);

        RS.notifyBondAdded(this.data.bid);
    };
    this._invert = function() {
        var ret = new ui.Action.OpBondDelete(); ret.data = this.data; return ret;
    };
};
ui.Action.OpBondAdd.prototype = new ui.Action.OpBase();

ui.Action.OpBondDelete = function(bid) {
    this.data = { bid : bid, bond : null, begin : null, end : null };
    this._execute = function(editor) {
        var R = editor.render, RS = R.ctab, DS = RS.molecule;
        if (!this.data.bond) {
            this.data.bond = DS.bonds.get(this.data.bid);
            this.data.begin = this.data.bond.begin;
            this.data.end = this.data.bond.end;
        }

        R.invalidateBond(this.data.bid);

        RS.notifyBondRemoved(this.data.bid);

        var bond = DS.bonds.get(this.data.bid);
        [bond.hb1, bond.hb2].each(function(hbid) {
            var hb = DS.halfBonds.get(hbid);
            var atom = DS.atoms.get(hb.begin);
            var pos = atom.neighbors.indexOf(hbid);
            var prev = (pos + atom.neighbors.length - 1) % atom.neighbors.length;
            var next = (pos + 1) % atom.neighbors.length;
            DS.setHbNext(atom.neighbors[prev], atom.neighbors[next]);
            atom.neighbors.splice(pos, 1);
        }, this);
        DS.halfBonds.unset(bond.hb1);
        DS.halfBonds.unset(bond.hb2);

        DS.bonds.remove(this.data.bid);
    };
    this._invert = function() {
        var ret = new ui.Action.OpBondAdd(); ret.data = this.data; return ret;
    };
};
ui.Action.OpBondDelete.prototype = new ui.Action.OpBase();

ui.Action.OpBondAttr = function(bid, attribute, value) {
    this.data = { bid : bid, attribute : attribute, value : value };
    this.data2 = null;
    this._execute = function(editor) {
        var bond = editor.render.ctab.molecule.bonds.get(this.data.bid);
        if (!this.data2) {
            this.data2 = { bid : this.data.bid, attribute : this.data.attribute, value : bond[this.data.attribute] };
        }

        bond[this.data.attribute] = this.data.value;

        editor.render.invalidateBond(this.data.bid, this.data.attribute == 'type' ? 1 : 0);
    };
    this._isDummy = function(editor) {
        return editor.render.ctab.molecule.bonds.get(this.data.bid)[this.data.attribute] == this.data.value;
    };
    this._invert = function() {
        var ret = new ui.Action.OpBondAttr(); ret.data = this.data2; ret.data2 = this.data; return ret;
    };
};
ui.Action.OpBondAttr.prototype = new ui.Action.OpBase();

ui.Action.OpFragmentAdd = function(frid) {
    this.frid = Object.isUndefined(frid) ? null : frid;
    this._execute = function(editor) {
        var RS = editor.render.ctab, DS = RS.molecule;
        var frag = new chem.Struct.Fragment();
        if (this.frid == null) {
            this.frid = DS.frags.add(frag);
        } else {
            DS.frags.set(this.frid, frag);
        }
        RS.frags.set(this.frid, new rnd.ReFrag(frag)); // TODO add ReStruct.notifyFragmentAdded
    };
    this._invert = function() {
        return new ui.Action.OpFragmentDelete(this.frid);
    };
};
ui.Action.OpFragmentAdd.prototype = new ui.Action.OpBase();

ui.Action.OpFragmentDelete = function(frid) {
    this.frid = frid;
    this._execute = function(editor) {
        var R = editor.render, RS = R.ctab, DS = RS.molecule;
        R.invalidateItem('frags', this.frid, 1);
        RS.frags.unset(this.frid);
        DS.frags.remove(this.frid); // TODO add ReStruct.notifyFragmentRemoved
    };
    this._invert = function() {
        return new ui.Action.OpFragmentAdd(this.frid);
    };
};
ui.Action.OpFragmentDelete.prototype = new ui.Action.OpBase();

ui.Action.OpRGroupAttr = function(rgid, attribute, value) {
    this.data = { rgid : rgid, attribute : attribute, value : value };
    this.data2 = null;
    this._execute = function(editor) {
        var rgp = editor.render.ctab.molecule.rgroups.get(this.data.rgid);
        if (!this.data2) {
            this.data2 = { rgid : this.data.rgid, attribute : this.data.attribute, value : rgp[this.data.attribute] };
        }

        rgp[this.data.attribute] = this.data.value;

        editor.render.invalidateItem('rgroups', this.data.rgid);
    };
    this._isDummy = function(editor) {
        return editor.render.ctab.molecule.rgroups.get(this.data.rgid)[this.data.attribute] == this.data.value;
    };
    this._invert = function() {
        var ret = new ui.Action.OpRGroupAttr(); ret.data = this.data2; ret.data2 = this.data; return ret;
    };
};
ui.Action.OpRGroupAttr.prototype = new ui.Action.OpBase();

ui.Action.OpRGroupFragment = function(rgid, frid) {
    this.rgid_new = rgid;
    this.rgid_old = null;
    this.frid = frid;
    this._execute = function(editor) {
        var RS = editor.render.ctab, DS = RS.molecule;
        this.rgid_old = this.rgid_old || chem.Struct.RGroup.findRGroupByFragment(DS.rgroups, this.frid);

        var rgOld = (this.rgid_old ? DS.rgroups.get(this.rgid_old) : null);
        if (rgOld) {
            rgOld.frags.remove(rgOld.frags.keyOf(this.frid));
            RS.clearVisel(RS.rgroups.get(this.rgid_old).visel);
            if (rgOld.frags.count() == 0) {
                RS.rgroups.unset(this.rgid_old);
                DS.rgroups.unset(this.rgid_old);
                RS.markItemRemoved();
            } else {
                RS.markItem('rgroups', this.rgid_old, 1);
            }
        }
        if (this.rgid_new) {
            var rgNew = DS.rgroups.get(this.rgid_new);
            if (!rgNew) {
                rgNew = new chem.Struct.RGroup();
                DS.rgroups.set(this.rgid_new, rgNew);
                RS.rgroups.set(this.rgid_new, new rnd.ReRGroup(rgNew));
            } else {
                RS.markItem('rgroups', this.rgid_new, 1);
            }
            rgNew.frags.add(this.frid);
        }
    };
    this._invert = function() {
        return new ui.Action.OpRGroupFragment(this.rgid_old, this.frid);
    };
};
ui.Action.OpRGroupFragment.prototype = new ui.Action.OpBase();

ui.Action.OpRxnArrowAdd = function(pos) {
    this.data = { arid : null, pos : pos };
    this._execute = function(editor) {
        var R = editor.render, RS = R.ctab, DS = RS.molecule;
        if (!Object.isNumber(this.data.arid)) {
            this.data.arid = DS.rxnArrows.add(new chem.Struct.RxnArrow());
        } else {
            DS.rxnArrows.set(this.data.arid, new chem.Struct.RxnArrow());
        }
        RS.notifyRxnArrowAdded(this.data.arid);
        DS._rxnArrowSetPos(this.data.arid, new util.Vec2(this.data.pos));

        R.invalidateItem('rxnArrows', this.data.arid, 1);
    };
    this._invert = function() {
        var ret = new ui.Action.OpRxnArrowDelete(); ret.data = this.data; return ret;
    };
};
ui.Action.OpRxnArrowAdd.prototype = new ui.Action.OpBase();

ui.Action.OpRxnArrowDelete = function(arid) {
    this.data = { arid : arid, pos : null };
    this._execute = function(editor) {
        var R = editor.render, RS = R.ctab, DS = RS.molecule;
        if (!this.data.pos) {
            this.data.pos = R.rxnArrowGetPos(this.data.arid);
        }
        RS.notifyRxnArrowRemoved(this.data.arid);
        DS.rxnArrows.remove(this.data.arid);
    };
    this._invert = function() {
        var ret = new ui.Action.OpRxnArrowAdd(); ret.data = this.data; return ret;
    };
};
ui.Action.OpRxnArrowDelete.prototype = new ui.Action.OpBase();

ui.Action.OpRxnPlusAdd = function(pos) {
    this.data = { plid : null, pos : pos };
    this._execute = function(editor) {
        var R = editor.render, RS = R.ctab, DS = RS.molecule;
        if (!Object.isNumber(this.data.plid)) {
            this.data.plid = DS.rxnPluses.add(new chem.Struct.RxnPlus());
        } else {
            DS.rxnPluses.set(this.data.plid, new chem.Struct.RxnPlus());
        }
        RS.notifyRxnPlusAdded(this.data.plid);
        DS._rxnPlusSetPos(this.data.plid, new util.Vec2(this.data.pos));

        R.invalidateItem('rxnPluses', this.data.plid, 1);
    };
    this._invert = function() {
        var ret = new ui.Action.OpRxnPlusDelete(); ret.data = this.data; return ret;
    };
};
ui.Action.OpRxnPlusAdd.prototype = new ui.Action.OpBase();

ui.Action.OpRxnPlusDelete = function(plid) {
    this.data = { plid : plid, pos : null };
    this._execute = function(editor) {
        var R = editor.render, RS = R.ctab, DS = RS.molecule;
        if (!this.data.pos) {
            this.data.pos = R.rxnPlusGetPos(this.data.plid);
        }
        RS.notifyRxnPlusRemoved(this.data.plid);
        DS.rxnPluses.remove(this.data.plid);
    };
    this._invert = function() {
        var ret = new ui.Action.OpRxnPlusAdd(); ret.data = this.data; return ret;
    };
};
ui.Action.OpRxnPlusDelete.prototype = new ui.Action.OpBase();
