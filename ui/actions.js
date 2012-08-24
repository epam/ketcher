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
ui.Action = function ()
{
    this.operations = new Array();
};

ui.Action.prototype.addOp = function(op) {
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

    this.operations.each(function (op) {
        action.addOp(op.perform(ui.editor));
        idx++;
    }, this);

    action.operations.reverse();
    return action;
};

ui.Action.prototype.isDummy = function ()
{
    return this.operations.detect(function(op) {
        return !op.isDummy(ui.editor); // TODO [RB] the condition is always true for ui.Action.Op* operations
    }, this) == null;
};

ui.Action.fromSelectedAtomsMove = function(selection, d)
{
    selection = selection || ui.selection;

    var action = new ui.Action();

    selection.atoms.each(function(id) {
        action.addOp(new ui.Action.OpAtomMove(id, d));
    }, this);

    return action;
};

ui.Action.fromMultipleMove = function (lists, d)
{
    d = new util.Vec2(d);

    var action = new ui.Action();
    var i;
    if (lists.atoms)
        for (i = 0; i < lists.atoms.length; ++i)
            action.addOp(new ui.Action.OpAtomMove(lists.atoms[i], d));

    if (lists.rxnArrows)
        for (i = 0; i < lists.rxnArrows.length; ++i)
            action.addOp(new ui.Action.OpRxnArrowMove(lists.rxnArrows[i], d));

    if (lists.rxnPluses)
        for (i = 0; i < lists.rxnPluses.length; ++i)
            action.addOp(new ui.Action.OpRxnPlusMove(lists.rxnPluses[i], d));

    if (lists.sgroupData)
        for (i = 0; i < lists.sgroupData.length; ++i)
            action.addOp(new ui.Action.OpSGroupDataMove(lists.sgroupData[i], d));
    
    if (lists.chiralFlags)
        for (i = 0; i < lists.chiralFlags.length; ++i)
            action.addOp(new ui.Action.OpChiralFlagMove(d));

    return action.perform();
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

ui.Action.mergeFragments = function (action, frid, frid2) {
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
            ui.Action.mergeFragments(action, frid, frid2);
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
        // TODO: <op>.data.aid here is a hack, need a better way to access the id of a newly created atom
        end = action.addOp(new ui.Action.OpAtomAdd(end, pos).perform(ui.editor)).data.aid;
        if (Object.isNumber(begin)) {
            ui.render.atomGetSGroups(begin).each(function (sid) {
                action.addOp(new ui.Action.OpSGroupAtomAdd(sid, end).perform(ui.editor));
            }, this);
        }
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

ui.Action.fromChiralFlagAddition = function (pos)
{
    var action = new ui.Action();
    if (ui.render.ctab.chiralFlags.count() < 1) {
        action.addOp(new ui.Action.OpChiralFlagAdd(pos).perform(ui.editor));
    }
    return action;
};

ui.Action.fromChiralFlagDeletion = function ()
{
    var action = new ui.Action();
    action.addOp(new ui.Action.OpChiralFlagDelete());
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
            this.addOp(new ui.Action.OpSGroupAtomRemove(sid, id));
        }, this);

        return true;
    }

    return false;
};

// Add action operations to remove whole s-group if needed
ui.Action.prototype.removeSgroupIfNeeded = function (atoms)
{
    var R = ui.render;
    var RS = R.ctab;
    var DS = RS.molecule;
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
            var sgroup = DS.sgroups.get(sid);
            this.mergeWith(ui.Action.sGroupAttributeAction(sid, sgroup.getAttrs()));
            this.addOp(new ui.Action.OpSGroupDelete(sid));
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
        action.addOp(new ui.Action.OpSGroupDelete(sid));
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

    var actionRemoveDataSGroups = new ui.Action();
    if (selection.sgroupData) {
        selection.sgroupData.each(function (id) {
            actionRemoveDataSGroups.mergeWith(ui.Action.fromSgroupDeletion(id));
        }, this);
    }

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
            var frid1 = ui.ctab.atoms.get(bond.begin).fragment;
            if (frids.indexOf(frid1) < 0)
                frids.push(frid1);

            if (action.removeAtomFromSgroupIfNeeded(bond.begin))
                atoms_to_remove.push(bond.begin);

            action.addOp(new ui.Action.OpAtomDelete(bond.begin));
        }
        if (selection.atoms.indexOf(bond.end) == -1 && ui.render.atomGetDegree(bond.end) == 1)
        {
            var frid2 = ui.ctab.atoms.get(bond.end).fragment;
            if (frids.indexOf(frid2) < 0)
                frids.push(frid2);

            if (action.removeAtomFromSgroupIfNeeded(bond.end))
                atoms_to_remove.push(bond.end);

            action.addOp(new ui.Action.OpAtomDelete(bond.end));
        }
    }, this);


    selection.atoms.each(function (aid)
    {
        var frid3 = ui.ctab.atoms.get(aid).fragment;
        if (frids.indexOf(frid3) < 0)
            frids.push(frid3);

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

    selection.chiralFlags.each(function (id) {
        action.addOp(new ui.Action.OpChiralFlagDelete(id));
    }, this);
    
    action = action.perform();

    while (frids.length > 0) action.mergeWith(new ui.Action.__fromFragmentSplit(frids.pop()));

    action.mergeWith(actionRemoveDataSGroups);

    return action;
};

ui.Action.fromAtomMerge = function (src_id, dst_id)
{
    var fragAction = new ui.Action();
    var src_frid = ui.render.atomGetAttr(src_id, 'fragment'), dst_frid = ui.render.atomGetAttr(dst_id, 'fragment');
    if (src_frid != dst_frid) {
        ui.Action.mergeFragments(fragAction, src_frid, dst_frid);
    }

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
            action.addOp(new ui.Action.OpBondAdd(begin, end, bond));
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

    return action.perform().mergeWith(fragAction);
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
            var frid2 = ui.render.atomGetAttr(id1, 'fragment');
            ui.Action.mergeFragments(action, frid, frid2);
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
        pos.normalize();
        pos = pos.scaled(0.5 / Math.cos(angle));
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

    action.addOp(new ui.Action.OpCanvasLoad(ctab));
    return action.perform();
};

ui.Action.fromSgroupType = function (id, type)
{
    var R = ui.render;
    var cur_type = R.sGroupGetType(id);
    if (type && type != cur_type) {
        var atoms = util.array(R.sGroupGetAtoms(id));
        var attrs = R.sGroupGetAttrs(id);
        var actionDeletion = ui.Action.fromSgroupDeletion(id); // [MK] order of execution is important, first delete then recreate
        var actionAddition = ui.Action.fromSgroupAddition(type, atoms, attrs, id);
        return actionAddition.mergeWith(actionDeletion); // the actions are already performed and reversed, so we merge them backwards
    }
    return new ui.Action();
};

ui.Action.fromSgroupAttrs = function (id, attrs)
{
    var action = new ui.Action();
    var R = ui.render;
    var RS = R.ctab;
    var sg = RS.sgroups.get(id).item;

    new Hash(attrs).each(function (attr) {
        if (!sg.checkAttr(attr.key, attr.value)) {
            action.addOp(new ui.Action.OpSGroupAttr(id, attr.key, attr.value));
        }
    }, this);

    return action.perform();
};

ui.Action.sGroupAttributeAction = function (id, attrs)
{
    var action = new ui.Action();

    new Hash(attrs).each(function (attr) { // store the attribute assignment
        action.addOp(new ui.Action.OpSGroupAttr(id, attr.key, attr.value));
    }, this);

    return action;
}

ui.Action.fromSgroupDeletion = function (id)
{
    var action = new ui.Action();
    var R = ui.render;
    var RS = R.ctab;
    var DS = RS.molecule;

    if (ui.render.sGroupGetType(id) == 'SRU') {
        ui.render.sGroupsFindCrossBonds();
        var nei_atoms = ui.render.sGroupGetNeighborAtoms(id);

        nei_atoms.each(function(aid) {
            if (ui.render.atomGetAttr(aid, 'label') == '*') {
                action.addOp(new ui.Action.OpAtomAttr(aid, 'label', 'C'));
            }
        }, this);
    }

    var sg = DS.sgroups.get(id);
    var atoms = chem.SGroup.getAtoms(DS, sg);
    var attrs = sg.getAttrs();
    for (var i = 0; i < atoms.length; ++i) {
        action.addOp(new ui.Action.OpSGroupAtomRemove(id, atoms[i]));
    }
    action.addOp(new ui.Action.OpSGroupDelete(id));

    action = action.perform();

    action.mergeWith(ui.Action.sGroupAttributeAction(id, attrs));

    return action;
};

ui.Action.fromSgroupAddition = function (type, atoms, attrs, sgid)
{
    var action = new ui.Action();
    var i;

    // TODO: shoud the id be generated when OpSGroupCreate is executed?
    //      if yes, how to pass it to the following operations?
    sgid = sgid-0 === sgid ? sgid : ui.render.ctab.molecule.sgroups.newId();

    action.addOp(new ui.Action.OpSGroupCreate(sgid, type));
    for (i = 0; i < atoms.length; i++)
        action.addOp(new ui.Action.OpSGroupAtomAdd(sgid, atoms[i]));

    action = action.perform();

    if (type == 'SRU') {
        ui.render.sGroupsFindCrossBonds();
        var nei_atoms = ui.render.sGroupGetNeighborAtoms(sgid);
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

    return ui.Action.fromSgroupAttrs(sgid, attrs).mergeWith(action);
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
        amap[aid] = action.addOp(new ui.Action.OpAtomAdd(atom, atom.pp.add(offset)).perform(ui.editor)).data.aid;
    }

    var rgnew = [];
    for (var rgid in ui.clipboard.rgroups) {
        if (!ui.ctab.rgroups.has(rgid)) {
            rgnew.push(rgid);
        }
    }
    
    // assign fragments to r-groups
    for (var frid in ui.clipboard.rgmap) {
        action.addOp(new ui.Action.OpRGroupFragment(ui.clipboard.rgmap[frid], fmap[frid]).perform(ui.editor));
    }
    
    for (var i = 0; i < rgnew.length; ++i) {
        action.mergeWith(ui.Action.fromRGroupAttrs(rgnew[i], ui.clipboard.rgroups[rgnew[i]]));
    }

    //bonds
    for (var bid = 0; bid < objects.bonds.length; bid++) {
        var bond = Object.clone(objects.bonds[bid]);
        action.addOp(new ui.Action.OpBondAdd(amap[bond.begin], amap[bond.end], bond).perform(ui.editor));
    }
    //sgroups
    for (var sgid = 0; sgid < objects.sgroups.length; sgid++) {
        var sgroup_info = objects.sgroups[sgid];
        var atoms = sgroup_info.atoms;
        var sgatoms = [];
        for (var sgaid = 0; sgaid < atoms.length; sgaid++) {
            sgatoms.push(amap[atoms[sgaid]]);
        }
        var newsgid = ui.render.ctab.molecule.sgroups.newId();
        var sgaction = ui.Action.fromSgroupAddition(sgroup_info.type, sgatoms, sgroup_info.attrs, newsgid);
        for (var iop = sgaction.operations.length - 1; iop >= 0; iop--) {
            action.addOp(sgaction.operations[iop]);
        }
    }
    //reaction arrows
    if (ui.editor.render.ctab.rxnArrows.count() < 1) {
        for (var raid = 0; raid < objects.rxnArrows.length; raid++) {
            action.addOp(new ui.Action.OpRxnArrowAdd(objects.rxnArrows[raid].pp.add(offset)).perform(ui.editor));
        }
    }
    //reaction pluses
    for (var rpid = 0; rpid < objects.rxnPluses.length; rpid++) {
        action.addOp(new ui.Action.OpRxnPlusAdd(objects.rxnPluses[rpid].pp.add(offset)).perform(ui.editor));
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
    if (this.render.current_tool)
        this.render.current_tool.OnCancel();

    ui.redoStack.push(ui.undoStack.pop().perform());
    ui.updateActionButtons();
    ui.updateSelection();
};

ui.redo = function ()
{
    if (this.render.current_tool)
        this.render.current_tool.OnCancel();

    ui.undoStack.push(ui.redoStack.pop().perform());
    ui.updateActionButtons();
    ui.updateSelection();
};


ui.Action.OpBase = function() {};
ui.Action.OpBase.prototype.type = 'OpBase';
ui.Action.OpBase.prototype._execute = function() {
    throw new Error('Operation._execute() is not implemented');
};
ui.Action.OpBase.prototype._invert = function() {
    throw new Error('Operation._invert() is not implemented');
};
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
        var pp = {};
        if (this.data.atom)
            for (var p in this.data.atom)
                pp[p] = this.data.atom[p];
        pp.label = pp.label || 'C';
        if (!Object.isNumber(this.data.aid)) {
            this.data.aid = DS.atoms.add(new chem.Struct.Atom(pp));
        } else {
            DS.atoms.set(this.data.aid, new chem.Struct.Atom(pp));
        }
        RS.notifyAtomAdded(this.data.aid);
        DS._atomSetPos(this.data.aid, new util.Vec2(this.data.pos));
    };
    this._invert = function() {
        var ret = new ui.Action.OpAtomDelete();
        ret.data = this.data;
        return ret;
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
        var ret = new ui.Action.OpAtomAdd();
        ret.data = this.data;
        return ret;
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
        var ret = new ui.Action.OpAtomAttr();
        ret.data = this.data2;
        ret.data2 = this.data;return ret;
    };
};
ui.Action.OpAtomAttr.prototype = new ui.Action.OpBase();

ui.Action.OpAtomMove = function(aid, d) {
    this.data = {aid : aid, d : d};
    this._execute = function(editor) {
        ui.ctab.atoms.get(this.data.aid).pp.add_(this.data.d);
        this.data.d = this.data.d.negated();
        editor.render.invalidateAtom(this.data.aid, 1);
    };
    this._invert = function() {
        var ret = new ui.Action.OpAtomMove();
        ret.data = this.data;
        return ret;
    };
};
ui.Action.OpAtomMove.prototype = new ui.Action.OpBase();

ui.Action.OpSGroupAtomAdd = function(sgid, aid) {
    this.type = 'OpSGroupAtomAdd';
    this.data = {'aid' : aid, 'sgid' : sgid};
    this._execute = function(editor) {
        var R = editor.render, RS = R.ctab, DS = RS.molecule;
        var aid = this.data.aid;
        var sgid = this.data.sgid;
	var atom = DS.atoms.get(aid);
	var sg = DS.sgroups.get(sgid);
	chem.SGroup.addAtom(sg, aid);
        if (!atom)
            throw new Error("OpSGroupAtomAdd: Atom " + aid + " not found");
	util.Set.add(atom.sgs, sgid);
        R.invalidateAtom(aid);
    };
    this._invert = function() {
        var ret = new ui.Action.OpSGroupAtomRemove();
        ret.data = this.data;
        return ret;
    };
};
ui.Action.OpSGroupAtomAdd.prototype = new ui.Action.OpBase();

ui.Action.OpSGroupAtomRemove = function(sgid, aid) {
    this.type = 'OpSGroupAtomRemove';
    this.data = {'aid' : aid, 'sgid' : sgid};
    this._execute = function(editor) {
        var aid = this.data.aid;
        var sgid = this.data.sgid;
        var R = editor.render, RS = R.ctab, DS = RS.molecule;
	var atom = DS.atoms.get(aid);
	var sg = DS.sgroups.get(sgid);
	chem.SGroup.removeAtom(sg, aid);
	util.Set.remove(atom.sgs, sgid);
        R.invalidateAtom(aid);
    };
    this._invert = function() {
        var ret = new ui.Action.OpSGroupAtomAdd();
        ret.data = this.data;
        return ret;
    };
};
ui.Action.OpSGroupAtomRemove.prototype = new ui.Action.OpBase();

ui.Action.OpSGroupAttr = function(sgid, attr, value) {
    this.type = 'OpSGroupAttr';
    this.data = {sgid : sgid, attr : attr, value : value};
    this._execute = function(editor) {
        var R = editor.render, RS = R.ctab, DS = RS.molecule;
        var sgid = this.data.sgid;
	var sg = DS.sgroups.get(sgid);
        if (sg.type == 'DAT' && RS.sgroupData.has(sgid)) { // clean the stuff here, else it might be left behind if the sgroups is set to "attached"
            RS.clearVisel(RS.sgroupData.get(sgid).visel);
            RS.sgroupData.unset(sgid);
        }

        this.data.value = sg.setAttr(this.data.attr, this.data.value);
    };
    this._invert = function() {
        var ret = new ui.Action.OpSGroupAttr();
        ret.data = this.data;
        return ret;
    };
};
ui.Action.OpSGroupAttr.prototype = new ui.Action.OpBase();

ui.Action.OpSGroupCreate = function(sgid, type) {
    this.type = 'OpSGroupCreate';
    this.data = {'sgid' : sgid, 'type' : type};
    this._execute = function(editor) {
        var R = editor.render, RS = R.ctab, DS = RS.molecule;
        var sg = new chem.SGroup(this.data.type);
        var sgid = this.data.sgid;
        sg.id = sgid;
        DS.sgroups.set(sgid, sg);
        RS.sgroups.set(sgid, new rnd.ReSGroup(DS.sgroups.get(sgid)));
        this.data.sgid = sgid;
    };
    this._invert = function() {
        var ret = new ui.Action.OpSGroupDelete();
        ret.data = this.data;
        return ret;
    };
};
ui.Action.OpSGroupCreate.prototype = new ui.Action.OpBase();

ui.Action.OpSGroupDelete = function(sgid) {
    this.type = 'OpSGroupDelete';
    this.data = {'sgid' : sgid};
    this._execute = function(editor) {
        var R = editor.render, RS = R.ctab, DS = RS.molecule;
        var sgid = this.data.sgid;
        var sg = RS.sgroups.get(sgid);
        this.data.type = sg.item.type;
        if (sg.item.type == 'DAT' && RS.sgroupData.has(sgid)) {
            RS.clearVisel(RS.sgroupData.get(sgid).visel);
            RS.sgroupData.unset(sgid);
        }

        RS.clearVisel(sg.visel);
        if (sg.item.atoms.length != 0)
            throw new Error("S-Group not empty!");
        RS.sgroups.unset(sgid);
        DS.sgroups.remove(sgid);
    };
    this._invert = function() {
        var ret = new ui.Action.OpSGroupCreate();
        ret.data = this.data;
        return ret;
    };
};
ui.Action.OpSGroupDelete.prototype = new ui.Action.OpBase();

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

        var pp = {};
        if (this.data.bond)
            for (var p in this.data.bond)
                pp[p] = this.data.bond[p];
        pp.type = pp.type || chem.Struct.BOND.TYPE.SINGLE;
        pp.begin = this.data.begin;
        pp.end = this.data.end;

        if (!Object.isNumber(this.data.bid)) {
            this.data.bid = DS.bonds.add(new chem.Struct.Bond(pp));
        } else {
            DS.bonds.set(this.data.bid, new chem.Struct.Bond(pp));
        }
        DS.bondInitHalfBonds(this.data.bid);
        DS.atomAddNeighbor(DS.bonds.get(this.data.bid).hb1);
        DS.atomAddNeighbor(DS.bonds.get(this.data.bid).hb2);

        RS.notifyBondAdded(this.data.bid);
    };
    this._invert = function() {
        var ret = new ui.Action.OpBondDelete();
        ret.data = this.data;
        return ret;
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
        var ret = new ui.Action.OpBondAdd();
        ret.data = this.data;
        return ret;
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
        var ret = new ui.Action.OpBondAttr();
        ret.data = this.data2;
        ret.data2 = this.data;
        return ret;
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
        var ret = new ui.Action.OpRGroupAttr();
        ret.data = this.data2;
        ret.data2 = this.data;
        return ret;
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
        var ret = new ui.Action.OpRxnArrowDelete();
        ret.data = this.data;
        return ret;
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
        var ret = new ui.Action.OpRxnArrowAdd();
        ret.data = this.data;
        return ret;
    };
};
ui.Action.OpRxnArrowDelete.prototype = new ui.Action.OpBase();

ui.Action.OpRxnArrowMove = function(id, d) {
    this.data = {id : id, d : d};
    this._execute = function(editor) {
        ui.ctab.rxnArrows.get(this.data.id).pp.add_(this.data.d);
        this.data.d = this.data.d.negated();
        editor.render.invalidateItem('rxnArrows', this.data.id, 1);
    };
    this._invert = function() {
        var ret = new ui.Action.OpRxnArrowMove();
        ret.data = this.data;
        return ret;
    };
};
ui.Action.OpRxnArrowMove.prototype = new ui.Action.OpBase();

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
        var ret = new ui.Action.OpRxnPlusDelete();
        ret.data = this.data;
        return ret;
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
        var ret = new ui.Action.OpRxnPlusAdd();
        ret.data = this.data;
        return ret;
    };
};
ui.Action.OpRxnPlusDelete.prototype = new ui.Action.OpBase();

ui.Action.OpRxnPlusMove = function(id, d) {
    this.data = {id : id, d : d};
    this._execute = function(editor) {
        ui.ctab.rxnPluses.get(this.data.id).pp.add_(this.data.d);
        this.data.d = this.data.d.negated();
        editor.render.invalidateItem('rxnPluses', this.data.id, 1);
    };
    this._invert = function() {
        var ret = new ui.Action.OpRxnPlusMove();
        ret.data = this.data;
        return ret;
    };
};
ui.Action.OpRxnPlusMove.prototype = new ui.Action.OpBase();

ui.Action.OpSGroupDataMove = function(id, d) {
    this.data = {id : id, d : d};
    this._execute = function(editor) {
        ui.ctab.sgroups.get(this.data.id).pp.add_(this.data.d);
        this.data.d = this.data.d.negated();
        editor.render.invalidateItem('sgroupData', this.data.id, 1); // [MK] this currently does nothing since the DataSGroupData Visel only contains the highlighting/selection and SGroups are redrawn every time anyway
    };
    this._invert = function() {
        var ret = new ui.Action.OpSGroupDataMove();
        ret.data = this.data;
        return ret;
    };
};
ui.Action.OpSGroupDataMove.prototype = new ui.Action.OpBase();

ui.Action.OpCanvasLoad = function(ctab) {
    this.data = {ctab : ctab, norescale : false};
    this._execute = function(editor) {
        var R = editor.render;

        R.ctab.clearVisels();
        var oldCtab = ui.ctab;
        ui.ctab = this.data.ctab;
        R.setMolecule(ui.ctab, this.data.norescale);
        this.data.ctab = oldCtab;
        this.data.norescale = true;
    };

    this._invert = function() {
        var ret = new ui.Action.OpCanvasLoad();
        ret.data = this.data;
        return ret;
    };
};
ui.Action.OpCanvasLoad.prototype = new ui.Action.OpBase();

ui.Action.OpChiralFlagAdd = function(pos) {
    this.data = {pos : pos};
    this._execute = function(editor) {
        var R = editor.render, RS = R.ctab, DS = RS.molecule;
        if (RS.chiralFlags.count() > 0)
            throw new Error("Cannot add more than one Chiral flag");
        RS.chiralFlags.set(0, new rnd.ReChiralFlag(pos));
        DS.isChiral = true;
        R.invalidateItem('chiralFlags', 0, 1);
    };
    this._invert = function() {
        var ret = new ui.Action.OpChiralFlagDelete();
        ret.data = this.data;
        return ret;
    };
};
ui.Action.OpChiralFlagAdd.prototype = new ui.Action.OpBase();

ui.Action.OpChiralFlagDelete = function() {
    this.data = {pos : null};
    this._execute = function(editor) {
        var R = editor.render, RS = R.ctab, DS = RS.molecule;
        if (RS.chiralFlags.count() < 1)
            throw new Error("Cannot remove chiral flag");
        RS.clearVisel(RS.chiralFlags.get(0).visel);
        this.data.pos = RS.chiralFlags.get(0).pp;
        RS.chiralFlags.unset(0);
        DS.isChiral = false;
    };
    this._invert = function() {
        var ret = new ui.Action.OpChiralFlagAdd(this.data.pos);
        ret.data = this.data;
        return ret;
    };
};
ui.Action.OpChiralFlagDelete.prototype = new ui.Action.OpBase();

ui.Action.OpChiralFlagMove = function(d) {
    this.data = {d : d};
    this._execute = function(editor) {
        var R = editor.render, RS = R.ctab;
        RS.chiralFlags.get(0).pp.add_(this.data.d);
        this.data.d = this.data.d.negated();
        R.invalidateItem('chiralFlags', 0, 1);
    };
    this._invert = function() {
        var ret = new ui.Action.OpChiralFlagMove();
        ret.data = this.data;
        return ret;
    };
};
ui.Action.OpChiralFlagMove.prototype = new ui.Action.OpBase();
