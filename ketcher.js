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

ketcher = function () {
    this.render = null;
};

ketcher.version = "1.1-beta";

ketcher.init = function (parameters, opt)
{    
    document.title += ' v' + ketcher.version;
	ketcher.button_areas = {};
	var elemLabelOpts = {'fontSize':25};
	ketcher.button_areas.atom_h = new rnd.ElementTable('atom_h', elemLabelOpts).renderSingle('H');
	ketcher.button_areas.atom_c = new rnd.ElementTable('atom_c', elemLabelOpts).renderSingle('C');
	ketcher.button_areas.atom_n = new rnd.ElementTable('atom_n', elemLabelOpts).renderSingle('N');
	ketcher.button_areas.atom_o = new rnd.ElementTable('atom_o', elemLabelOpts).renderSingle('O');
	ketcher.button_areas.atom_s = new rnd.ElementTable('atom_s', elemLabelOpts).renderSingle('S');
	ketcher.button_areas.atom_p = new rnd.ElementTable('atom_p', elemLabelOpts).renderSingle('P');
	ketcher.button_areas.atom_f = new rnd.ElementTable('atom_f', elemLabelOpts).renderSingle('F');
	ketcher.button_areas.atom_cl = new rnd.ElementTable('atom_cl', elemLabelOpts).renderSingle('Cl');
	ketcher.button_areas.atom_br = new rnd.ElementTable('atom_br', elemLabelOpts).renderSingle('Br');
	ketcher.button_areas.atom_i = new rnd.ElementTable('atom_i', elemLabelOpts).renderSingle('I');
	ketcher.button_areas.atom_table = new rnd.ElementTable('atom_table', elemLabelOpts).renderSingle('...');
	ketcher.button_areas.atom_any = new rnd.ElementTable('atom_reagenerics', {'fontSize':9}).renderSingle('Generic\nGroups');
	ui.init(parameters, opt);
	$("ketcher_version").innerHTML = "Version " + ketcher.version;
};

ketcher.getSmiles = function ()
{
    var saver = new chem.SmilesSaver();
    return saver.saveMolecule(ui.ctab, true);
};

ketcher.getMolfile = function ()
{
    var saver = new chem.MolfileSaver();
    return saver.saveMolecule(ui.ctab, true);
};

ketcher.setMolecule = function (mol_string)
{
    if (!Object.isString(mol_string))
        return;

    ui.loadMolecule(mol_string);
};

ketcher.addFragment = function (mol_string)
{
    if (!Object.isString(mol_string))
        return;

    ui.loadMolecule(mol_string, undefined, undefined, true);
};

ketcher.showMolfile = function (clientArea, molfileText, autoScale, hideImplicitHydrogen)
{
	return ketcher.showMolfileOpts(clientArea, molfileText, 75, {
        'showSelectionRegions':false,
        'showBondIds':false,
        'showHalfBondIds':false,
        'showLoopIds':false,
        'showAtomIds':false,
		'autoScale':autoScale||false,
		'autoScaleMargin':4,
		'hideImplicitHydrogen':hideImplicitHydrogen||false
    });
};

ketcher.showMolfileOpts = function (clientArea, molfileText, bondLength, opts)
{
    this.render = new rnd.Render(clientArea, bondLength, opts);
    if (molfileText)
        this.render.setMolecule(chem.Molfile.parseCTFile(typeof(molfileText)=='string' ? molfileText.split('\n') : molfileText));
    this.render.update();
    return this.render;
};

ketcher.testSegment = function (clientArea)
{
    var sz = 600;
    var bx = 50, by = 50, bw = sz, bh = sz;

    var b = new util.Box2Abs(bx, by, bx + bw, by + bh);
    var c = new Raphael(clientArea);

    var list = [];
    for (var i = 0; i < 100000; ++i) {
        var a = new util.Vec2(Math.random() * sz + 50, Math.random() * sz + 50);
        var b = new util.Vec2(Math.random() * sz + 50, Math.random() * sz + 50);
        var add = true;
        for (var j = 0; j < list.length; ++j) {
            if (util.Vec2.segmentIntersection(a, b, list[j][0], list[j][1])) {
                add = false;
                break;
            }
        }
        if (add)
            list.push([a,b]);
    }
    c.rect(50, 50, sz, sz).attr({stroke:'#0f0'});
    for (var j = 0; j < list.length; ++j) {
        c.path("M{0},{1}L{2},{3}",list[j][0].x,list[j][0].y,list[j][1].x,list[j][1].y).attr({'stroke-width':1, stroke:'#000'});
    }
}

/*
ketcher.testShiftRayBox = function (clientArea)
{
    var bx = 50, by = 180, bw = 220, bh = 40;

    var b = new util.Box2Abs(bx, by, bx + bw, by + bh);
    var c = new Raphael(clientArea);

    c.rect(0, 0, 300, 300).attr({stroke:'#0f0'});
    c.rect(bx, by, bw, bh).attr({stroke:'#00f'});

    for (var i = 0; i < 3; ++i)
    {
        var p = new util.Vec2(Math.random() * 300, Math.random() * 300);
        var d = new util.Vec2(Math.random() * 300, Math.random() * 300);
        var p1 = p.add(d);
        c.circle(p.x, p.y, 4).attr({fill:'#0f0'});
        c.path("M{0},{1}L{2},{3}", p.x, p.y, p1.x, p1.y).attr({'stroke-width':'3','stroke':'#f00'});
        var t = Math.max(0, util.Vec2.shiftRayBox(p, d, b));
        var p0 = p.addScaled(d, t / d.length());
        c.path("M{0},{1}L{2},{3}", p0.x, p0.y, p1.x, p1.y).attr({'stroke-width':'1','stroke':'#000'});
    }
}

ketcher.runTest = function(test, context) {
    var runs = [], nr = 5, diff;

    for (var r = 0; r < nr; ++r) {
        var start = (new Date).getTime();
        for ( var n = 0; (diff = (new Date).getTime() - start) < 1000; n++ )
            test.call(context);
        runs.push( diff / n );
    }

    var avg = 0, std = 0, t;
    for (r = 0; r < nr; ++r) {
        t = runs[r];
        avg += t;
        std += t * t;
    }
    avg /= nr;
    std = Math.sqrt(std - avg * avg) / nr;
    console.log(avg + ' ' + std);
}
*/
