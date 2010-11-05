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

ketcher.init = function ()
{
    ui.init();
};

ketcher.getSmiles = function ()
{
    var saver = new chem.SmilesSaver();
    return saver.saveMolecule(ui.ctab, true);
}

ketcher.getMolfile = function ()
{
    var saver = new chem.MolfileSaver();
    return saver.saveMolecule(ui.ctab);
}

ketcher.setMolecule = function (mol_string)
{
    if (!Object.isString(mol_string))
        return;

    ui.loadMolecule(mol_string);
}

ketcher.showMolfile = function (clientArea, molfileText, isRxn, autoScale)
{
    this.render = new rnd.Render(clientArea, 75, {
        'showSelectionRegions':false,
        'showBondIds':false,
        'showHalfBondIds':false,
        'showLoopIds':false,
        'showAtomIds':false,
		'autoScale':autoScale||false,
		'autoScaleMargin':20
    });
    if (molfileText)
        this.render.setMolecule(chem.Molfile.parseMolfile(molfileText.split('\n'), isRxn));
    this.render.update();
    return this.render;
}

/*
ketcher.testShiftRayBox = function (clientArea)
{
    var bx = 50, by = 180, bw = 220, bh = 40;

    var b = new chem.Box2Abs(bx, by, bx + bw, by + bh);
    var c = new Raphael(clientArea);

    c.rect(0, 0, 300, 300).attr({stroke:'#0f0'});
    c.rect(bx, by, bw, bh).attr({stroke:'#00f'});

    for (var i = 0; i < 3; ++i)
    {
        var p = new chem.Vec2(Math.random() * 300, Math.random() * 300);
        var d = new chem.Vec2(Math.random() * 300, Math.random() * 300);
        var p1 = p.add(d);
        c.circle(p.x, p.y, 4).attr({fill:'#0f0'});
        c.path("M{0},{1}L{2},{3}", p.x, p.y, p1.x, p1.y).attr({'stroke-width':'3','stroke':'#f00'});
        var t = Math.max(0, chem.Vec2.shiftRayBox(p, d, b));
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
