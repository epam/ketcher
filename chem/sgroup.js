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

if (!window.chem || !util.Vec2 || !util.Pool)
    throw new Error("Vec2, Pool should be defined first");
chem.SGroup = function (type)
{
    if (!type || !(type in chem.SGroup.TYPES))
        throw new Error("Invalid or unsupported s-group type");

    this.type = type;
    this.id = -1;
    chem.SGroup.equip(this, type);
    this.label = -1;
    this.bracketBox = null;
        this.bracketDir = new util.Vec2(1,0);
        this.areas = [];

    this.highlight = false;
    this.highlighting = null;
    this.selected = false;
    this.selectionPlate = null;

    this.atoms = [];
    this.patoms = [];
    this.bonds = [];
    this.xBonds = [];
    this.neiAtoms = [];
    this.pp = null;
    this.data = {
        'mul': 1, // multiplication count for MUL group
        'connectivity': 'ht', // head-to-head, head-to-tail or either-unknown
        'name' : '',
        'subscript' : 'n',

        // data s-group fields
        'attached' : false,
        'absolute' : true,
        'showUnits' : false,
        'nCharsToDisplay' : -1,
        'tagChar' : '',
        'daspPos' : 1,
        'fieldType' : 'F',
        'fieldName' : '',
        'fieldValue' : '',
        'units' : '',
        'query' : '',
        'queryOp' : ''
    }
};

// TODO: these methods should be overridden
//      and should only accept valid attributes for each S-group type.
//      The attributes should be accessed via these methods only and not directly through this.data.
// stub
chem.SGroup.prototype.getAttr = function (attr) {
    return this.data[attr];
};

// TODO: should be group-specific
chem.SGroup.prototype.getAttrs = function () {
    var attrs = {};
    for (var attr in this.data)
        attrs[attr] = this.data[attr];
    return attrs;
};

// stub
chem.SGroup.prototype.setAttr = function (attr, value) {
    var oldValue = this.data[attr];
    this.data[attr] = value;
    return oldValue;
};

// stub
chem.SGroup.prototype.checkAttr = function (attr, value) {
    return this.data[attr] == value;
};

chem.SGroup.equip = function (sgroup, type) {
    var impl = chem.SGroup.TYPES[type];
    for (var method in impl)
        sgroup[method] = impl[method];
};

chem.SGroup.numberArrayToString = function (numbers, map) {
    var str = util.stringPadded(numbers.length, 3);
    for (var i = 0; i < numbers.length; ++i) {
        str += ' ' + util.stringPadded(map[numbers[i]], 3);
    }
    return str;
};

chem.SGroup.addGroup = function (mol, sg, atomMap)
{
    // add the group to the molecule
    sg.id = mol.sgroups.add(sg);

    // apply type-specific post-processing
    sg.postLoad(mol, atomMap);

    // mark atoms in the group as belonging to it
    for (var s = 0; s < sg.atoms.length; ++s)
        if (mol.atoms.has(sg.atoms[s]))
            util.Set.add(mol.atoms.get(sg.atoms[s]).sgs, sg.id);

    mol.sGroupForest.insert(sg.id);
    return sg.id;
};

chem.SGroup.bracketsToMolfile = function (mol, sg, idstr) {
    var inBonds = [], xBonds = [];
    var atomSet = util.Set.fromList(sg.atoms);
    chem.SGroup.getCrossBonds(inBonds, xBonds, mol, atomSet);
    chem.SGroup.bracketPos(sg, null, mol, xBonds);
    var bb = sg.bracketBox;
    var d = sg.bracketDir, n = d.rotateSC(1, 0);
    var brackets = chem.SGroup.getBracketParameters(mol, xBonds, atomSet, bb, d, n, null, sg.id);
    var lines = [];
    for (var i = 0; i < brackets.length; ++i) {
        var bracket = brackets[i];
        var a0 = bracket.c.addScaled(bracket.n, -0.5 * bracket.h).yComplement();
        var a1 = bracket.c.addScaled(bracket.n, 0.5 * bracket.h).yComplement();
        var line = 'M  SDI ' + idstr + util.paddedInt(4, 3);
        var coord = [a0.x, a0.y, a1.x, a1.y];
        for (var j = 0; j < coord.length; ++j) {
            line += util.paddedFloat(coord[j], 10, 4);
        }
        lines.push(line);
    }
    return lines;
};

chem.SGroup.filterAtoms = function (atoms, map) {
    var newAtoms = [];
    for (var i = 0; i < atoms.length; ++i) {
        var aid = atoms[i];
        if (typeof(map[aid]) != "number") {
            newAtoms.push(aid);
        } else if (map[aid] >= 0) {
            newAtoms.push(map[aid]);
        } else {
            newAtoms.push(-1);
        }
    }
    return newAtoms;
};

chem.SGroup.removeNegative = function (atoms) {
    var newAtoms = [];
    for (var j = 0; j < atoms.length; ++j)
        if (atoms[j] >= 0)
            newAtoms.push(atoms[j]);
    return newAtoms;
};

chem.SGroup.filter = function (mol, sg, atomMap)
{
    sg.atoms = chem.SGroup.removeNegative(chem.SGroup.filterAtoms(sg.atoms, atomMap));
};

chem.SGroup.clone = function (sgroup, aidMap, bidMap)
{
    var cp = new chem.SGroup(sgroup.type);

    for (var field in sgroup.data) { // TODO: remove all non-primitive properties from 'data'
        cp.data[field] = sgroup.data[field];
    }
    cp.atoms = util.mapArray(sgroup.atoms, aidMap);
    cp.pp = sgroup.pp;
    cp.bracketBox = sgroup.bracketBox;
    cp.patoms = null;
    cp.bonds = null;
    cp.allAtoms = sgroup.allAtoms;
    return cp;
};

chem.SGroup.addAtom = function (sgroup, aid)
{
    sgroup.atoms.push(aid);
};

chem.SGroup.removeAtom = function (sgroup, aid)
{
    for (var i = 0; i < sgroup.atoms.length; ++i) {
        if (sgroup.atoms[i] === aid) {
            sgroup.atoms.splice(i, 1);
            return;
        }
    }
    throw new Error("The atom is not found in the given s-group");
};

chem.SGroup.getCrossBonds = function (inBonds, xBonds, mol, parentAtomSet) {
    mol.bonds.each(function(bid, bond){
        if (util.Set.contains(parentAtomSet, bond.begin) && util.Set.contains(parentAtomSet, bond.end)) {
            if (!util.isNull(inBonds))
                inBonds.push(bid);
        } else if (util.Set.contains(parentAtomSet, bond.begin) || util.Set.contains(parentAtomSet, bond.end)) {
            if (!util.isNull(xBonds))
                xBonds.push(bid);
        }
    }, this);
};

chem.SGroup.bracketPos = function(sg, render, mol, xbonds) {
    var atoms = sg.atoms;
    if (!xbonds || xbonds.length !== 2) {
        sg.bracketDir = new util.Vec2(1, 0);
    } else {
        var b1 = mol.bonds.get(xbonds[0]), b2 = mol.bonds.get(xbonds[1]);
        var p1 = b1.getCenter(mol), p2 = b2.getCenter(mol);
        sg.bracketDir = util.Vec2.diff(p2, p1).normalized();
    }
    var d = sg.bracketDir;
    var n = d.rotateSC(1, 0);

    var bb = null;
    var contentBoxes = [];
    util.each(atoms, function(aid) {
        var atom = mol.atoms.get(aid);
        var bba = render ? render.ctab.atoms.get(aid).visel.boundingBox : null;
        var pos = new util.Vec2(atom.pp);
        if (util.isNull(bba)) {
            bba = new util.Box2Abs(pos, pos);
            var ext = new util.Vec2(0.05 * 3, 0.05 * 3);
            bba = bba.extend(ext, ext);
        } else {
            bba = bba.translate((render.offset || new util.Vec2()).negated()).transform(render.scaled2obj, render);
        }
        contentBoxes.push(bba);
    }, this);
    util.each(mol.sGroupForest.children.get(sg.id), function(sgid) {
        var bba = render ? render.ctab.sgroups.get(sgid).visel.boundingBox : null;
        if (util.isNull(bba))
            return; // TODO: use object box instead
        bba = bba.translate((render.offset || new util.Vec2()).negated()).transform(render.scaled2obj, render);
        contentBoxes.push(bba);
    }, this);
    util.each(contentBoxes, function(bba) {
        var bbb = null;
        util.each([bba.p0.x, bba.p1.x], function(x) {
            util.each([bba.p0.y, bba.p1.y], function(y) {
                var v = new util.Vec2(x, y);
                var p = new util.Vec2(util.Vec2.dot(v, d), util.Vec2.dot(v, n));
                bbb = util.isNull(bbb) ? new util.Box2Abs(p, p) : bbb.include(p);
            }, this);
        }, this);
        bb = util.isNull(bb) ? bbb : util.Box2Abs.union(bb, bbb);
    }, this);
    var vext = new util.Vec2(0.2, 0.4);
    if (!util.isNull(bb))
        bb = bb.extend(vext, vext);
    sg.bracketBox = bb;
};

chem.SGroup.drawBrackets = function (set, render, sg, xbonds, atomSet, bb, d, n, lowerIndexText, upperIndexText, indexAttribute) {
    var brackets = chem.SGroup.getBracketParameters(render.ctab.molecule, xbonds, atomSet, bb, d, n, render, sg.id);
    var ir = -1;
    for (var i = 0; i < brackets.length; ++i) {
       var bracket = brackets[i];
       var path = chem.SGroup.drawBracket(render, render.paper, render.styles, bracket.d, bracket.n, bracket.c, bracket.w, bracket.h);
       set.push(path);
       if (ir < 0 || brackets[ir].d.x < bracket.d.x || (brackets[ir].d.x == bracket.d.x && brackets[ir].d.y > bracket.d.y))
           ir = i;
    }
    var bracketR = brackets[ir];
    var renderIndex = function(text, shift) {
        var indexPos = render.ps(bracketR.c.addScaled(bracketR.n, shift * bracketR.h));
        var indexPath = render.paper.text(indexPos.x, indexPos.y, text)
        .attr({
            'font' : render.settings.font,
            'font-size' : render.settings.fontszsub
        });
        if (indexAttribute)
            indexPath.attr(indexAttribute);
        var indexBox = util.Box2Abs.fromRelBox(rnd.relBox(indexPath.getBBox()));
        var t = Math.max(util.Vec2.shiftRayBox(indexPos, bracketR.d.negated(), indexBox), 3) + 2;
        indexPath.translateAbs(t * bracketR.d.x, t * bracketR.d.y);
        set.push(indexPath);
    }
    if (lowerIndexText) {
        renderIndex(lowerIndexText, 0.5);
    }
    if (upperIndexText) {
        renderIndex(upperIndexText, -0.5);
    }
};

chem.SGroup.drawBracket = function (render, paper, styles, d, n, c, bracketWidth, bracketHeight) {
    bracketWidth = bracketWidth || 0.25;
    bracketHeight = bracketHeight || 1.0;
    var a0 = c.addScaled(n, -0.5*bracketHeight);
    var a1 = c.addScaled(n, 0.5*bracketHeight);
    var b0 = a0.addScaled(d, -bracketWidth);
    var b1 = a1.addScaled(d, -bracketWidth);

    a0 = render.obj2scaled(a0);
    a1 = render.obj2scaled(a1);
    b0 = render.obj2scaled(b0);
    b1 = render.obj2scaled(b1);

    return paper.path("M {0}, {1} L {2} , {3} L {4} , {5} L {6} , {7}",
        b0.x, b0.y, a0.x, a0.y, a1.x, a1.y, b1.x, b1.y)
        .attr(styles.sgroupBracketStyle);
}

chem.SGroup.getBracketParameters = function (mol, xbonds, atomSet, bb, d, n, render, id) {
    var bracketParams = function(c, d, w, h) {
        this.c = c;
        this.d = d;
        this.n = d.rotateSC(1,0);
        this.w = w;
        this.h = h;
    }
    var brackets = [];
    if (xbonds.length < 2) {
        (function () {
            d = d || new util.Vec2(1, 0);
            n = n || d.rotateSC(1, 0);
            var bracketWidth = Math.min(0.25, bb.sz().x * 0.3);
            var cl = util.Vec2.lc2(d, bb.p0.x, n, 0.5*(bb.p0.y+bb.p1.y));
            var cr = util.Vec2.lc2(d, bb.p1.x, n, 0.5*(bb.p0.y+bb.p1.y));
            var bracketHeight = bb.sz().y;

            brackets.push(new bracketParams(cl, d.negated(), bracketWidth, bracketHeight), new bracketParams(cr, d, bracketWidth, bracketHeight));
        })();
    } else if (xbonds.length === 2) {
        (function () {
            var b1 = mol.bonds.get(xbonds[0]), b2 = mol.bonds.get(xbonds[1]);
            var cl0 = b1.getCenter(mol), cr0 = b2.getCenter(mol), tl = -1, tr = -1, tt = -1, tb = -1, cc = util.Vec2.centre(cl0, cr0);
            var dr = util.Vec2.diff(cr0, cl0).normalized(), dl = dr.negated(), dt = dr.rotateSC(1,0), db = dt.negated();
            
            util.each(mol.sGroupForest.children.get(id), function(sgid) {
                var bba = render ? render.ctab.sgroups.get(sgid).visel.boundingBox : null;
                if (util.isNull(bba))
                    return; // TODO: use object box instead
                bba = bba.translate((render.offset || new util.Vec2()).negated()).transform(render.scaled2obj, render);
                tl = Math.max(tl, util.Vec2.shiftRayBox(cl0, dl, bba));
                tr = Math.max(tr, util.Vec2.shiftRayBox(cr0, dr, bba));
                tt = Math.max(tt, util.Vec2.shiftRayBox(cc, dt, bba));
                tb = Math.max(tb, util.Vec2.shiftRayBox(cc, db, bba));
            }, this);
            tl = Math.max(tl + 0.2, 0);
            tr = Math.max(tr + 0.2, 0);
            tt = Math.max(Math.max(tt, tb) + 0.1, 0);
            var bracketWidth = 0.25, bracketHeight = 1.5 + tt;
            brackets.push(new bracketParams(cl0.addScaled(dl, tl), dl, bracketWidth, bracketHeight),
            new bracketParams(cr0.addScaled(dr, tr), dr, bracketWidth, bracketHeight));
        })();

    } else {
        (function () {
            for (var i = 0; i < xbonds.length; ++i) {
                var b = mol.bonds.get(xbonds[i]);
                var c = b.getCenter(mol);
                var d = util.Set.contains(atomSet, b.begin) ? b.getDir(mol) : b.getDir(mol).negated();
                brackets.push(new bracketParams(c, d, 0.2, 1.0));
            }
        })();
    }
    return brackets;
};

chem.SGroup.getObjBBox = function (atoms, mol)
{
    if (atoms.length == 0)
        throw new Error("Atom list is empty");

    var a0 = mol.atoms.get(atoms[0]).pp;
    var bb = new util.Box2Abs(a0, a0);
    for (var i = 1; i < atoms.length; ++i) {
        var aid = atoms[i];
        var atom = mol.atoms.get(aid);
        var p = atom.pp;
        bb = bb.include(p);
    }
    return bb;
};

chem.SGroup.makeAtomBondLines = function (prefix, idstr, ids, map) {
    if (!ids)
        return [];
    var lines = [];
    for (var i = 0; i < Math.floor((ids.length + 14) / 15); ++i) {
        var rem = Math.min(ids.length - 15 * i, 15);
        var salLine = 'M  ' + prefix + ' ' + idstr + ' ' + util.paddedInt(rem, 2);
        for (var j = 0; j < rem; ++j) {
            salLine += ' ' + util.paddedInt(map[ids[i * 15 + j]], 3);
        }
        lines.push(salLine);
    }
    return lines;
};

chem.SGroup.getAtoms = function (mol, sg) {
    if (!sg.allAtoms)
        return sg.atoms;
    var atoms = [];
    mol.atoms.each(function(aid){
        atoms.push(aid);
    });
    return atoms;
};

chem.SGroup.getBonds = function (mol, sg) {
    var atoms = chem.SGroup.getAtoms(mol, sg);
    var bonds = [];
    mol.bonds.each(function(bid, bond){
        if (atoms.indexOf(bond.begin) >= 0 && atoms.indexOf(bond.end) >= 0) bonds.push(bid);
    });
    return bonds;
};

chem.SGroup.GroupMul = {
    draw: function (remol) {
            var render = remol.render;
            var set = render.paper.set();
            var inBonds = [], xBonds = [];
            var atomSet = util.Set.fromList(this.atoms);
            chem.SGroup.getCrossBonds(inBonds, xBonds, remol.molecule, atomSet);
            chem.SGroup.bracketPos(this, render, remol.molecule, xBonds);
            var bb = this.bracketBox;
            var d = this.bracketDir, n = d.rotateSC(1, 0);
            this.areas = [bb];
            chem.SGroup.drawBrackets(set, render, this, xBonds, atomSet, bb, d, n, this.data.mul);
            return set;
    },

    saveToMolfile: function (mol, sgMap, atomMap, bondMap) {
        var idstr = util.stringPadded(sgMap[this.id], 3);

        var lines = [];
        lines = lines.concat(chem.SGroup.makeAtomBondLines('SAL', idstr, util.idList(this.atomSet), atomMap)); // TODO: check atomSet
        lines = lines.concat(chem.SGroup.makeAtomBondLines('SPA', idstr, util.idList(this.parentAtomSet), atomMap));
        lines = lines.concat(chem.SGroup.makeAtomBondLines('SBL', idstr, this.bonds, bondMap));
        var smtLine = 'M  SMT ' + idstr + ' ' + this.data.mul;
        lines.push(smtLine);
        lines = lines.concat(chem.SGroup.bracketsToMolfile(mol, this, idstr));
        return lines.join('\n');
    },

    prepareForSaving: function (mol) {
            var j;
            this.atoms.sort();
            this.atomSet = util.Set.fromList(this.atoms);
            this.parentAtomSet = util.Set.clone(this.atomSet);
            var inBonds = [];
            var xBonds = [];

            mol.bonds.each(function(bid, bond){
                if (util.Set.contains(this.parentAtomSet, bond.begin) && util.Set.contains(this.parentAtomSet, bond.end))
                    inBonds.push(bid);
                else if (util.Set.contains(this.parentAtomSet, bond.begin) || util.Set.contains(this.parentAtomSet,bond.end))
                    xBonds.push(bid);
            }, this);
            if (xBonds.length != 0 && xBonds.length != 2)
                throw {
                    'id':this.id,
                    'error-type':'cross-bond-number',
                    'message':"Unsupported cross-bonds number"
                };

            var xAtom1 = -1,
            xAtom2 = -1;
            var crossBond = null;
            if (xBonds.length == 2) {
                var bond1 = mol.bonds.get(xBonds[0]);
                if (util.Set.contains(this.parentAtomSet, bond1.begin)) {
                    xAtom1 = bond1.begin;
                } else {
                    xAtom1 = bond1.end;
                }
                var bond2 = mol.bonds.get(xBonds[1]);
                if (util.Set.contains(this.parentAtomSet, bond2.begin)) {
                    xAtom2 = bond2.begin;
                } else {
                    xAtom2 = bond2.end;
                }
                crossBond = bond2;
            }

            var amap = null;
            var tailAtom = xAtom1;

            var newAtoms = [];
            for (j = 0; j < this.data.mul - 1; ++j) {
                amap = {};
                util.each(this.atoms, function(aid) {
                    var atom = mol.atoms.get(aid);
                    var aid2 = mol.atoms.add(new chem.Struct.Atom(atom));
                    newAtoms.push(aid2);
                    this.atomSet[aid2] = 1;
                    amap[aid] = aid2;
                }, this);
                util.each(inBonds, function(bid) {
                    var bond = mol.bonds.get(bid);
                    var newBond = new chem.Struct.Bond(bond);
                    newBond.begin = amap[newBond.begin];
                    newBond.end = amap[newBond.end];
                    mol.bonds.add(newBond);
                }, this);
                if (crossBond != null) {
                    var newCrossBond = new chem.Struct.Bond(crossBond);
                    newCrossBond.begin = tailAtom;
                    newCrossBond.end = amap[xAtom2];
                    mol.bonds.add(newCrossBond);
                    tailAtom = amap[xAtom1];
                }
            }
            
            util.each(newAtoms, function(aid) {
                util.each(mol.sGroupForest.getPathToRoot(this.id).reverse(), function(sgid) {
                    mol.atomAddToSGroup(sgid, aid);
                }, this);
            }, this);
            if (tailAtom >= 0) {
                var xBond2 = mol.bonds.get(xBonds[0]);
                if (xBond2.begin == xAtom1)
                    xBond2.begin = tailAtom;
                else
                    xBond2.end = tailAtom;
            }

            this.bonds = xBonds;
    },

    postLoad: function (mol, atomMap)
    {
        this.data.mul = this.data.subscript - 0;
        var atomReductionMap = {};

        this.atoms = chem.SGroup.filterAtoms(this.atoms, atomMap);
        this.patoms = chem.SGroup.filterAtoms(this.patoms, atomMap);

        // mark repetitions for removal
        for (var k = 1; k < this.data.mul; ++k) {
            for (var m = 0; m < this.patoms.length; ++m) {
                var raid = this.atoms[k * this.patoms.length + m];
                if (raid < 0)
                    continue;
                if (this.patoms[m] < 0) {
                    throw new Error("parent atom missing");
                }
//                mol.atoms.get(raid).pp.y -= 3*k; // for debugging purposes
                atomReductionMap[raid] = this.patoms[m]; // "merge" atom in parent
            }
        }
        this.patoms = chem.SGroup.removeNegative(this.patoms);

        var patomsMap = util.identityMap(this.patoms);

        var bondsToRemove = [];
        mol.bonds.each(function(bid, bond){
            var beginIn = bond.begin in atomReductionMap;
            var endIn = bond.end in atomReductionMap;
            // if both adjacent atoms of a bond are to be merged, remove it
            if (beginIn && endIn
                || beginIn && bond.end in patomsMap
                || endIn && bond.begin in patomsMap) {
                bondsToRemove.push(bid);
            // if just one atom is merged, modify the bond accordingly
            } else if (beginIn) {
                bond.begin = atomReductionMap[bond.begin];
            } else if (endIn) {
                bond.end = atomReductionMap[bond.end];
            }
        }, this);

        // apply removal lists
        for (var b = 0; b < bondsToRemove.length; ++b) {
            mol.bonds.remove(bondsToRemove[b]);
        }
        for (var a in atomReductionMap) {
            mol.atoms.remove(a);
            atomMap[a] = -1;
        }
        this.atoms = this.patoms;
        this.patoms = null;
    }
};

chem.SGroup.GroupSru = {
    draw: function (remol) {
            var render = remol.render;
            var set = render.paper.set();
            var inBonds = [], xBonds = [];
            var atomSet = util.Set.fromList(this.atoms);
            chem.SGroup.getCrossBonds(inBonds, xBonds, remol.molecule, atomSet);
            chem.SGroup.bracketPos(this, render, remol.molecule, xBonds);
            var bb = this.bracketBox;
            var d = this.bracketDir, n = d.rotateSC(1, 0);
            this.areas = [bb];
            var connectivity = this.data.connectivity || 'eu';
            if (connectivity == 'ht')
                connectivity = '';
            var subscript = this.data.subscript || 'n';
            chem.SGroup.drawBrackets(set, render, this, xBonds, atomSet, bb, d, n, subscript, connectivity);
            return set;
    },

    saveToMolfile: function (mol, sgMap, atomMap, bondMap) {
        var idstr = util.stringPadded(sgMap[this.id], 3);

        var lines = [];
        lines = lines.concat(chem.SGroup.makeAtomBondLines('SAL', idstr, this.atoms, atomMap));
        lines = lines.concat(chem.SGroup.makeAtomBondLines('SBL', idstr, this.bonds, bondMap));
        lines = lines.concat(chem.SGroup.bracketsToMolfile(mol, this, idstr));
        return lines.join('\n');
    },

    prepareForSaving: function (mol) {
        var xBonds = [];
        mol.bonds.each(function(bid, bond){
            var a1 = mol.atoms.get(bond.begin);
            var a2 = mol.atoms.get(bond.end);
            if (util.Set.contains(a1.sgs, this.id) && !util.Set.contains(a2.sgs, this.id) ||
                util.Set.contains(a2.sgs, this.id) && !util.Set.contains(a1.sgs, this.id))
                xBonds.push(bid);
        },this);
        if (xBonds.length != 0 && xBonds.length != 2)
            throw {'id':this.id, 'error-type':'cross-bond-number', 'message':"Unsupported cross-bonds number"};
        this.bonds = xBonds;
    },

    postLoad: function (mol, atomMap) {
        this.data.connectivity = (this.data.connectivity || 'EU').strip().toLowerCase();
    }
};

chem.SGroup.GroupSup = {
    draw: function (remol) {
            var render = remol.render;
            var set = render.paper.set();
            var inBonds = [], xBonds = [];
            var atomSet = util.Set.fromList(this.atoms);
            chem.SGroup.getCrossBonds(inBonds, xBonds, remol.molecule, atomSet);
            chem.SGroup.bracketPos(this, render, remol.molecule, xBonds);
            var bb = this.bracketBox;
            var d = this.bracketDir, n = d.rotateSC(1, 0);
            this.areas = [bb];
            chem.SGroup.drawBrackets(set, render, this, xBonds, atomSet, bb, d, n, this.data.name, null, {
                'font-style' : 'italic'
            });
            return set;
    },

    saveToMolfile: function (mol, sgMap, atomMap, bondMap) {
        var idstr = util.stringPadded(sgMap[this.id], 3);

        var lines = [];
        lines = lines.concat(chem.SGroup.makeAtomBondLines('SAL', idstr, this.atoms, atomMap));
        lines = lines.concat(chem.SGroup.makeAtomBondLines('SBL', idstr, this.bonds, bondMap));
        if (this.data.name && this.data.name != '')
            lines.push('M  SMT ' + idstr + ' ' + this.data.name);
        return lines.join('\n');
    },

    prepareForSaving: function (mol) {
        // This code is also used for GroupSru and should be moved into a separate common method
        // It seems that such code should be used for any sgroup by this this should be checked
        var xBonds = [];
        mol.bonds.each(function(bid, bond){
            var a1 = mol.atoms.get(bond.begin);
            var a2 = mol.atoms.get(bond.end);
            if (util.Set.contains(a1.sgs, this.id) && !util.Set.contains(a2.sgs, this.id) ||
                util.Set.contains(a2.sgs, this.id) && !util.Set.contains(a1.sgs, this.id))
                xBonds.push(bid);
        },this);
        this.bonds = xBonds;
    },

    postLoad: function (mol, atomMap) {
        this.data.name = (this.data.subscript || '').strip();
                this.data.subscript = '';
    }
};

chem.SGroup.GroupGen = {
        draw: function (remol) {
            var render = remol.render;
            var settings = render.settings;
            var styles = render.styles;
            var paper = render.paper;
            var set = paper.set();
            var inBonds = [], xBonds = [];
            var atomSet = util.Set.fromList(this.atoms);
            chem.SGroup.getCrossBonds(inBonds, xBonds, remol.molecule, atomSet);
            chem.SGroup.bracketPos(this, render, remol.molecule, xBonds);
            var bb = this.bracketBox;
            var d = this.bracketDir, n = d.rotateSC(1, 0);
            this.areas = [bb];
            chem.SGroup.drawBrackets(set, render, this, xBonds, atomSet, bb, d, n);
            return set;
    },

    saveToMolfile: function (mol, sgMap, atomMap, bondMap) {
        var idstr = util.stringPadded(sgMap[this.id], 3);

        var lines = [];
        lines = lines.concat(chem.SGroup.makeAtomBondLines('SAL', idstr, this.atoms, atomMap));
        lines = lines.concat(chem.SGroup.makeAtomBondLines('SBL', idstr, this.bonds, bondMap));
        lines = lines.concat(chem.SGroup.bracketsToMolfile(mol, this, idstr));
        return lines.join('\n');
    },

    prepareForSaving: function (mol) {
    },

    postLoad: function (mol, atomMap) {
    }
};

chem.SGroup.getMassCentre = function (mol, atoms) {
    var c = new util.Vec2(); // mass centre
    for (var i = 0; i < atoms.length; ++i) {
        c = c.addScaled(mol.atoms.get(atoms[i]).pp, 1.0 / atoms.length);
    }
    return c;
};

chem.SGroup.setPos = function (remol, sg, pos) {
    sg.pp = pos;
};

chem.SGroup.GroupDat = {
    showValue: function (paper, pos, sg, settings) {
        var name = paper.text(pos.x, pos.y, sg.data.fieldValue)
        .attr({
            'font' : settings.font,
            'font-size' : settings.fontsz
        });
        return name;
    },

    draw: function (remol) {
        var render = remol.render;
        var settings = render.settings;
        var paper = render.paper;
        var set = paper.set();
        var atoms = chem.SGroup.getAtoms(remol, this);
        var i;
        chem.SGroup.bracketPos(this, render, remol.molecule);
        this.areas = this.bracketBox ? [this.bracketBox] : [];
        if (this.pp == null) {
            // NB: we did not pass xbonds parameter to the backetPos method above,
            //  so the result will be in the regular coordinate system
            chem.SGroup.setPos(remol, this, this.bracketBox.p1.add(new util.Vec2(0.5, 0.5)));
        }
        var ps = this.pp.scaled(settings.scaleFactor);

        if (this.data.attached) {
                for (i = 0; i < atoms.length; ++i) {
                var atom = remol.atoms.get(atoms[i]);
                var p = render.ps(atom.a.pp);
                var bb = atom.visel.boundingBox;
                if (bb != null) {
                    p.x = Math.max(p.x, bb.p1.x);
                }
                p.x += settings.lineWidth; // shift a bit to the right
                var name_i = this.showValue(paper, p, this, settings);
                var box_i = rnd.relBox(name_i.getBBox());
                name_i.translateAbs(0.5 * box_i.width, -0.3 * box_i.height);
                set.push(name_i);
                var sbox_i = util.Box2Abs.fromRelBox(rnd.relBox(name_i.getBBox()));
                sbox_i = sbox_i.transform(render.scaled2obj, render);
                this.areas.push(sbox_i);
            }
        } else {
            var name = this.showValue(paper, ps, this, settings);
            var box = rnd.relBox(name.getBBox());
            name.translateAbs(0.5 * box.width, -0.5 * box.height);
            set.push(name);
            var sbox = util.Box2Abs.fromRelBox(rnd.relBox(name.getBBox()));
            this.dataArea = sbox.transform(render.scaled2obj, render);
            if (!remol.sgroupData.has(this.id))
                remol.sgroupData.set(this.id, new rnd.ReDataSGroupData(this));
        }
        return set;
    },

    saveToMolfile: function (mol, sgMap, atomMap, bondMap) {
        var idstr = util.stringPadded(sgMap[this.id], 3);

        var data = this.data;
        var pp = this.pp;
        if (!data.absolute)
            pp = pp.sub(chem.SGroup.getMassCentre(mol, this.atoms));
        var lines = [];
        lines = lines.concat(chem.SGroup.makeAtomBondLines('SAL', idstr, this.atoms, atomMap));
        var sdtLine = 'M  SDT ' + idstr +
        ' ' + util.stringPadded(data.fieldName, 30, true) +
        util.stringPadded(data.fieldType, 2) +
        util.stringPadded(data.units, 20, true) +
        util.stringPadded(data.query, 2) +
        util.stringPadded(data.queryOp, 3);
        lines.push(sdtLine);
        var sddLine = 'M  SDD ' + idstr +
        ' ' + util.paddedFloat(pp.x, 10, 4) + util.paddedFloat(-pp.y, 10, 4) +
        '    ' + // ' eee'
        (data.attached ? 'A' : 'D') + // f
        (data.absolute ? 'A' : 'R') + // g
        (data.showUnits ? 'U' : ' ') + // h
        '   ' + //  i
        (data.nCharnCharsToDisplay >= 0 ? util.paddedInt(data.nCharnCharsToDisplay, 3) : 'ALL') + // jjj
        '  1   ' + // 'kkk ll '
        util.stringPadded(data.tagChar, 1) + // m
        '  ' + util.paddedInt(data.daspPos, 1) + // n
        '  '; // oo
        lines.push(sddLine);
        data.fieldValue.replace(/[\r\n|\n|\r]*$/, '').split(/\r\n|\n|\r/).each(function(str) {
            var charsPerLine = 69;
            while (str.length > charsPerLine) {
                lines.push('M  SCD ' + idstr + ' ' + str.slice(0, charsPerLine));
                str = str.slice(69);
            }
            lines.push('M  SED ' + idstr + ' ' + util.stringPadded(str, charsPerLine, true));
        }, this);
        return lines.join('\n');
    },

    prepareForSaving: function (mol) {
        this.atoms = chem.SGroup.getAtoms(mol, this);
    },

    postLoad: function (mol, atomMap) {
        var allAtomsInGroup = this.atoms.length == mol.atoms.count();
        if (!this.data.absolute)
            this.pp = this.pp.add(chem.SGroup.getMassCentre(mol, this.atoms));
        if (allAtomsInGroup &&
            (    this.data.fieldName == 'MDLBG_FRAGMENT_STEREO' ||
                this.data.fieldName == 'MDLBG_FRAGMENT_COEFFICIENT' ||
                this.data.fieldName == 'MDLBG_FRAGMENT_CHARGE')) {
            this.atoms = [];
            this.allAtoms = true;
        }
    }
};

chem.SGroup.TYPES = {
    'MUL': chem.SGroup.GroupMul,
    'SRU': chem.SGroup.GroupSru,
    'SUP': chem.SGroup.GroupSup,
    'DAT': chem.SGroup.GroupDat,
    'GEN': chem.SGroup.GroupGen
};


chem.SGroupForest = function (molecule) {
    this.parent = new util.Map(); // child id -> parent id
    this.children = new util.Map(); // parent id -> list of child ids
    this.children.set(-1, []); // extra root node
    this.molecule = molecule;
}

// returns an array or s-group ids in the order of breadth-first search
chem.SGroupForest.prototype.getSGroupsBFS = function() {
    var order = [], queue = [], id = -1;
    queue = util.array(this.children.get(-1));
    while (queue.length > 0) {
        var id = queue.shift();
        queue = queue.concat(this.children.get(id));
        order.push(id);
    }
    return order;
}

chem.SGroupForest.prototype.getAtomSets = function() {
    return this.molecule.sgroups.map(function(sgid, sgroup){
        return util.Set.fromList(sgroup.atoms);
    });
}

chem.SGroupForest.prototype.getAtomSetRelations = function(newId, atoms /* util.Set */, atomSets /* util.Map of util.Set */) {
    // find the lowest superset in the hierarchy
    var isStrictSuperset = new util.Map(), isSubset = new util.Map();
    var atomSets = this.getAtomSets();
    atomSets.unset(newId);
    atomSets.each(function(id, atomSet) {
       isSubset.set(id, util.Set.subset(atoms, atomSet));
       isStrictSuperset.set(id, util.Set.subset(atomSet, atoms) && !util.Set.eq(atomSet, atoms));
    }, this);
    var parents = atomSets.findAll(function(id) {
        if (!isSubset.get(id))
            return false;
        if (util.find(this.children.get(id), function(childId) {
            return isSubset.get(childId);
        }, this) >= 0) {
            return false;
        }
        return true;
    }, this);
    util.assert(parents.length <= 1); // there should be only one parent
    var children = atomSets.findAll(function(id, set) {
        return isStrictSuperset.get(id) && !isStrictSuperset.get(this.parent.get(id));
    }, this);
    return {
        'children': children,
        'parent': parents.length === 0 ? -1 : parents[0]
    };
}

chem.SGroupForest.prototype.getPathToRoot = function(sgid) {
    var path = [];
    for (var id = sgid; id >= 0; id = this.parent.get(id)) {
        util.assert(path.indexOf(id) < 0, "SGroupForest: loop detected");
        path.push(id);
    }
    return path;
}

chem.SGroupForest.prototype.validate = function() {
    var atomSets = this.getAtomSets();
    this.molecule.sgroups.each(function(id) {
        this.getPathToRoot(id); // this will throw an exception if there is a loop in the path to root
    }, this);

    var valid = true;
    // 1) child group's atom set is a subset of the parent one's
    this.parent.each(function(id, parentId) {
        if (parentId >= 0 && !util.Set.subset(atomSets.get(id), atomSets.get(parentId)))
            valid = false;
    }, this);

    // 2) siblings have disjoint atom sets
    this.children.each(function(parentId) {
        var list = this.children.get(parentId);
        for (var i = 0; i < list.length; ++i)
            for (var j = i + 1; j < list.length; ++j)
                if (!util.Set.disjoint(atomSets.get(list[i]), atomSets.get(list[j])))
                    valid = false;
    }, this);
    return valid;
}

chem.SGroupForest.prototype.insert = function(id, parent /* int, optional */, children /* [int], optional */) {
    util.assert(!this.parent.has(id), "sgid already present in the forest");
    util.assert(!this.children.has(id), "sgid already present in the forest");

    util.assert(this.validate(), "s-group forest invalid");
    var atomSets = this.getAtomSets();
    var atoms = util.Set.fromList(this.molecule.sgroups.get(id).atoms);
    if (util.isUndefined(parent) || util.isUndefined(children)) { // if these are not provided, deduce automatically
        var guess = this.getAtomSetRelations(id, atoms, atomSets);
        parent = guess.parent;
        children = guess.children;
    }

    // TODO: make children Map<int, Set> instead of Map<int, []>?
    util.each(children, function (childId){ // reset parent links
        util.assert(util.arrayRemoveByValue(this.children.get(this.parent.get(childId)), childId) === 1);
        this.parent.set(childId, id);
    }, this);
    this.children.set(id, children);
    this.parent.set(id, parent);
    this.children.get(parent).push(id);
    util.assert(this.validate(), "s-group forest invalid");
    return {parent: parent, children: children};
}

chem.SGroupForest.prototype.remove = function(id) {
    util.assert(this.parent.has(id), "sgid is not in the forest");
    util.assert(this.children.has(id), "sgid is not in the forest");

    util.assert(this.validate(), "s-group forest invalid");
    var parentId = this.parent.get(id);
    util.each(this.children.get(id), function (childId){ // reset parent links
        this.parent.set(childId, parentId);
        this.children.get(parentId).push(childId);
    }, this);
    util.assert(util.arrayRemoveByValue(this.children.get(parentId), id) === 1);
    this.children.unset(id);
    this.parent.unset(id);
    util.assert(this.validate(), "s-group forest invalid");
}
