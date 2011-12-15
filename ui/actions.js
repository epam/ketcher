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
ui.atomMap = new Array();
ui.bondMap = new Array();
ui.sgroupMap = new Array();

ui.Action = function ()
{
    this.operations = new Array();
};

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
    SGROUP_ATOM_DEL: 14,
    RXN_ARROW_DEL:   15,
    RXN_ARROW_ADD:   16,
    RXN_ARROW_POS:   17,
    RXN_PLUS_DEL:    18,
    RXN_PLUS_ADD:    19,
    RXN_PLUS_POS:    20
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
            ui.highlightSGroup(id, false);
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

            var id = ui.render.rxnArrowAdd(op.params.pos);
            op.inverted.params = { id: id };
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
    return this.operations.detect(function (op)
    {
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
};

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
};

ui.Action.fromBondAttrs = function (id, attrs, flip)
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
    if (flip) {
        action.addOperation(ui.Action.OPERATION.BOND_FLIP,
        {
            id: id_map
        });
        ui.bondMap[id_map] = ui.render.bondFlip(id);
    }
    return action;
};

ui.Action.fromSelectedBondsAttrs = function (attrs, flips)
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
                attr_value: attr.value
            });
        }, this);
    }, this);
    if (flips)
        flips.each(function (id)
        {
            var id_map = ui.bondMap.indexOf(id);
            action.addOperation(ui.Action.OPERATION.BOND_FLIP,
            {
                id: id_map
            });
        }, this);
    return action.perform();
};

ui.Action.fromAtomAddition = function (pos, atom)
{
    var action = new ui.Action();

    action.addOperation(ui.Action.OPERATION.ATOM_DEL,
    {
        id: ui.atomMap.push(ui.render.atomAdd(pos, atom)) - 1
    });

    return action;
};

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
    } else if (ui.render.atomGetAttr(begin, 'label') == '*')
    {
        ui.render.atomSetAttr(begin, 'label', 'C');
        action.addOperation(ui.Action.OPERATION.ATOM_ATTR,
        {
            id: ui.atomMap.indexOf(begin),
            attr_name: 'label',
            attr_value: '*'
        });
    }


    if (!Object.isNumber(end))
    {
        end = ui.atomMap.push(ui.render.atomAdd(pos, end)) - 1;
        end_op = action.addOperation(ui.Action.OPERATION.ATOM_DEL,
        {
            id: end
        });

        end = ui.atomMap[end];
    } else if (ui.render.atomGetAttr(end, 'label') == '*')
    {
        ui.render.atomSetAttr(end, 'label', 'C');
        action.addOperation(ui.Action.OPERATION.ATOM_ATTR,
        {
            id: ui.atomMap.indexOf(end),
            attr_name: 'label',
            attr_value: '*'
        });
    }

    action.addOperation(ui.Action.OPERATION.BOND_DEL,
    {
        id: ui.bondMap.push(ui.render.bondAdd(begin, end, bond)) - 1
    });

    action.operations.reverse();

    return [action, begin, end];
};

ui.Action.fromArrowAddition = function (pos)
{
    var action = new ui.Action();

    action.addOperation(ui.Action.OPERATION.RXN_ARROW_DEL, {
        id: ui.render.rxnArrowAdd(pos)
    });

    return action;
};

ui.Action.fromArrowDeletion = function (id)
{
    var action = new ui.Action();

    action.addOperation(ui.Action.OPERATION.RXN_ARROW_DEL, {
        'id': id
    });

    return action.perform();
};

ui.Action.fromPlusAddition = function (pos)
{
    var action = new ui.Action();

    action.addOperation(ui.Action.OPERATION.RXN_PLUS_DEL, {
        id: ui.render.rxnPlusAdd(pos)
    });

    return action;
};

ui.Action.fromPlusDeletion = function (id)
{
    var action = new ui.Action();

    action.addOperation(ui.Action.OPERATION.RXN_PLUS_DEL, {
        'id': id
    });

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
};

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

    ui.selection.rxnArrows.each(function (id) {
        action.addOperation(ui.Action.OPERATION.RXN_ARROW_DEL, {id: id});
    }, this);

    ui.selection.rxnPluses.each(function (id) {
        action.addOperation(ui.Action.OPERATION.RXN_PLUS_DEL, {id: id});
    }, this);

    return action;
};

ui.Action.fromFragmentDeletion = function(selection)
{
    selection = selection || ui.selection;
        
    var action = new ui.Action();
    var atoms_to_remove = new Array();

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
        action.addOperation(ui.Action.OPERATION.BOND_DEL,
        {
            id: ui.bondMap.indexOf(bid)
        });

        var bond = ui.ctab.bonds.get(bid);

        if (selection.atoms.indexOf(bond.begin) == -1 && ui.render.atomGetDegree(bond.begin) == 1)
        {
            if (action.removeAtomFromSgroupIfNeeded(bond.begin))
                atoms_to_remove.push(bond.begin);

            action.addOperation(ui.Action.OPERATION.ATOM_DEL,
            {
                id: ui.atomMap.indexOf(bond.begin)
            });
        }
        if (selection.atoms.indexOf(bond.end) == -1 && ui.render.atomGetDegree(bond.end) == 1)
        {
            if (action.removeAtomFromSgroupIfNeeded(bond.end))
                atoms_to_remove.push(bond.end);

            action.addOperation(ui.Action.OPERATION.ATOM_DEL,
            {
                id: ui.atomMap.indexOf(bond.end)
            });
        }
    }, this);


    selection.atoms.each(function (aid)
    {
        if (action.removeAtomFromSgroupIfNeeded(aid))
            atoms_to_remove.push(aid);

        action.addOperation(ui.Action.OPERATION.ATOM_DEL,
        {
            id: ui.atomMap.indexOf(aid)
        });
    }, this);

    action.removeSgroupIfNeeded(atoms_to_remove);

    selection.rxnArrows.each(function (id) {
        action.addOperation(ui.Action.OPERATION.RXN_ARROW_DEL, {id: id});
    }, this);

    selection.rxnPluses.each(function (id) {
        action.addOperation(ui.Action.OPERATION.RXN_PLUS_DEL, {id: id});
    }, this);

    return action.perform();
};

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

    var attrs = chem.Struct.Atom.getAttrHash(ui.ctab.atoms.get(src_id));

    if (ui.render.atomGetDegree(src_id) == 1 && attrs.get('label') == '*')
        attrs.set('label', 'C');

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
};

ui.Action.fromBondFlipping = function (id)
{
    var action = new ui.Action();

    action.addOperation(ui.Action.OPERATION.BOND_FLIP,
    {
        id: ui.bondMap.indexOf(id)
    });

    return action.perform();
};

ui.Action.fromPatternOnCanvas = function (pos, pattern)
{
    var angle = 2 * Math.PI / pattern.length;
    var l = 1.0 / (2 * Math.sin(angle / 2));
    var v = new util.Vec2(0, -l);

    var action = new ui.Action();

    pattern.each(function ()
    {
        action.addOperation(ui.Action.OPERATION.ATOM_DEL,
        {
            id: ui.atomMap.push(ui.render.atomAdd(util.Vec2.sum(pos, v), {label: 'C'})) - 1
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
};

ui.Action.fromChain = function (p0, v, nSect)
{
    var angle = Math.PI / 6;
    var dx = Math.cos(angle), dy = Math.sin(angle);

    var action = new ui.Action();

    var id0 = -1;
    if (ui.drag.atom_id != null) {
        id0 = ui.drag.atom_id;
    } else {
        id0 = ui.render.atomAdd(p0, {label: 'C'});
        action.addOperation(ui.Action.OPERATION.ATOM_DEL,
        {
            id: ui.atomMap.push(id0) - 1
        });
    }

    nSect.times(function (i)
    {
        var pos = new util.Vec2(dx * (i + 1), i & 1 ? 0 : dy).rotate(v).add(p0);

        var a = ui.render.findClosestAtom(pos, 0.1);

        var id1 = -1;
        if (a == null)
        {
            id1 = ui.render.atomAdd(pos, {label: 'C'});
            action.addOperation(ui.Action.OPERATION.ATOM_DEL,
            {
                id: ui.atomMap.push(id1) - 1
            });
        } else {
            id1 = a.id;
        }

        if (!ui.render.checkBondExists(id0, id1))
        {
            var bid = ui.render.bondAdd(id0, id1, {});
            action.addOperation(ui.Action.OPERATION.BOND_DEL,
            {
                id: ui.bondMap.push(bid) - 1
            });
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

    if (on_atom)
    {
        var nei_id = ui.render.atomGetNeighbors(id)[0].aid;
        var atom_pos = ui.render.atomGetPos(id);

        pos = util.Vec2.diff(atom_pos, ui.render.atomGetPos(nei_id));
        pos = pos.scaled(pos.length() / 2 / Math.cos(angle));
        v = pos.negated();
        pos.add_(atom_pos);
        angle = Math.PI - 2 * angle;
    } else
    {
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
        ui.ctab.atoms.each(function (a_id)
        {
            if (util.Vec2.dist(pos, ui.render.atomGetPos(a_id)) < l * 1.1)
            {
                cnt++;
                bcnt += ui.render.atomGetDegree(a_id);
            } else if (util.Vec2.dist(pos_sym, ui.render.atomGetPos(a_id)) < l * 1.1)
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
    ui.render.update();

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
            var new_pos = util.Vec2.sum(pos, v);

            var a = ui.render.findClosestAtom(new_pos, 0.1);

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
            if (bond_type == chem.Struct.BOND.TYPE.AROMATIC)
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

    if ((cur_type == 'SRU' || type == 'SRU') && cur_type != type)
    {
        ui.render.sGroupsFindCrossBonds();
        var nei_atoms = ui.render.sGroupGetNeighborAtoms(id);

        if (cur_type == 'SRU')
        {
            nei_atoms.each(function (aid)
            {
                if (ui.render.atomGetAttr(aid, 'label') == '*')
                {
                    action.addOperation(ui.Action.OPERATION.ATOM_ATTR,
                    {
                        id: ui.atomMap.indexOf(aid),
                        attr_name: 'label',
                        attr_value: 'C'
                    });
                }
            }, this);
        } else
        {
            nei_atoms.each(function (aid)
            {
                if (ui.render.atomGetDegree(aid) == 1 && ui.render.atomIsPlainCarbon(aid))
                {
                    action.addOperation(ui.Action.OPERATION.ATOM_ATTR,
                    {
                        id: ui.atomMap.indexOf(aid),
                        attr_name: 'label',
                        attr_value: '*'
                    });
                }
            }, this);
        }
    }

    return action.perform();
};

ui.Action.fromSgroupDeletion = function (id)
{
    var action = new ui.Action();

    if (ui.render.sGroupGetType(id) == 'SRU')
    {
        ui.render.sGroupsFindCrossBonds();
        var nei_atoms = ui.render.sGroupGetNeighborAtoms(id);

        nei_atoms.each(function (aid)
        {
            if (ui.render.atomGetAttr(aid, 'label') == '*')
            {
                action.addOperation(ui.Action.OPERATION.ATOM_ATTR,
                {
                    id: ui.atomMap.indexOf(aid),
                    attr_name: 'label',
                    attr_value: 'C'
                });
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

    if (type == 'SRU')
    {
        var sid = ui.sgroupMap[action.operations[0].params.id];

        ui.render.sGroupsFindCrossBonds();
        var nei_atoms = ui.render.sGroupGetNeighborAtoms(sid);
        var asterisk_action = new ui.Action();

        nei_atoms.each(function (aid)
        {
            if (ui.render.atomGetDegree(aid) == 1 && ui.render.atomIsPlainCarbon(aid))
            {
                asterisk_action.addOperation(ui.Action.OPERATION.ATOM_ATTR,
                {
                    id: ui.atomMap.indexOf(aid),
                    attr_name: 'label',
                    attr_value: '*'
                });
            }
        }, this);

        asterisk_action = asterisk_action.perform();
        asterisk_action.mergeWith(action);
        action = asterisk_action;
    }

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
