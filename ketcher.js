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

ketcher.version = "1.0b5";

ketcher.init = function ()
{
    document.title += ' v' + ketcher.version;
    ketcher.templates = {};
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

	var charge_head = ['', '  fun stuff 0123456789AB', '',
		'  1  0  0  0  0  0            999 V2000',
		'    0.4714    1.8562    0.0000 A   0  3  0  0  0  0  0  0  0  0  0  0'];
	var charge_tail = ['M  END'];

    var tmpl = ketcher.templates;
	tmpl.charge_plus = charge_head.concat(['M  CHG  1   1   1'], charge_tail);
	tmpl.charge_minus = charge_head.concat(['M  CHG  1   1  -1'], charge_tail);

	var renderOpts = {
		'autoScale':true,
		'autoScaleMargin':2,
		'hideImplicitHydrogen':true,
		'hideTerminalLabels':true,
		'ignoreMouseEvents':true};

	var renderOptsBond = {
		'autoScale':true,
		'autoScaleMargin':4,
		'hideImplicitHydrogen':true,
		'hideTerminalLabels':true,
		'ignoreMouseEvents':true};

	ketcher.button_areas.charge_plus = ketcher.showMolfileOpts('charge_plus', tmpl.charge_plus, 75, renderOpts);
	ketcher.button_areas.charge_minus = ketcher.showMolfileOpts('charge_minus', tmpl.charge_minus, 75, renderOpts);

	var bond_head = ['', '  Ketcher 08191119302D 1   1.00000     0.00000     0', '',
		'  2  1  0     0  0            999 V2000',
		'   -2.5000   -0.3000    0.0000 C   0  0  0  0  0  0  0        0  0  0',
		'   -1.0000    0.3000    0.0000 C   0  0  0  0  0  0  0        0  0  0'];
	var bond_tail = ['M  END'];

    // will use this templates in dropdown list
	tmpl.bond_any = bond_head.concat(['  1  2  8  0     0  0'], bond_tail);
	tmpl.bond_single = bond_head.concat(['  1  2  1  0     0  0'], bond_tail);
	tmpl.bond_up = bond_head.concat(['  1  2  1  1     0  0'], bond_tail);
	tmpl.bond_down = bond_head.concat(['  1  2  1  6     0  0'], bond_tail);
	tmpl.bond_updown = bond_head.concat(['  1  2  1  4     0  0'], bond_tail);
	tmpl.bond_double  = bond_head.concat(['  1  2  2  0     0  0'], bond_tail);
	tmpl.bond_crossed  = bond_head.concat(['  1  2  2  3     0  0'], bond_tail);
	tmpl.bond_triple = bond_head.concat(['  1  2  3  0     0  0'], bond_tail);
	tmpl.bond_aromatic = bond_head.concat(['  1  2  4  0     0  0'], bond_tail);
	tmpl.bond_singledouble = bond_head.concat(['  1  2  5  0     0  0'], bond_tail);
	tmpl.bond_singlearomatic = bond_head.concat(['  1  2  6  0     0  0'], bond_tail);
	tmpl.bond_doublearomatic = bond_head.concat(['  1  2  7  0     0  0'], bond_tail);

	ketcher.button_areas.bond_single = ketcher.showMolfileOpts('bond', tmpl.bond_single, 20, renderOptsBond);

	var renderOptsPattern = {
		'autoScale':true,
		'autoScaleMargin':2,
		'hideImplicitHydrogen':true,
		'hideTerminalLabels':true,
		'ignoreMouseEvents':true};

	tmpl.chain = ['', '  Ketcher 10181123552D 1   1.00000     0.00000     0', '',
		'  4  3  0     0  0            999 V2000',
		'   -5.8000   -0.6500    0.0000 C   0  0  0  0  0  0        0  0  0',
		'   -4.9340   -1.1500    0.0000 C   0  0  0  0  0  0        0  0  0',
		'   -4.0679   -0.6500    0.0000 C   0  0  0  0  0  0        0  0  0',
		'   -3.2019   -1.1500    0.0000 C   0  0  0  0  0  0        0  0  0',
		'  1  2  1  0     0  0',
		'  2  3  1  0     0  0',
		'  3  4  1  0     0  0',
		'M  END'
	];

	tmpl.template_0 = ['', '  Ketcher 12101120452D 1   1.00000     0.00000     0', '',
        '  6  6  0     0  0            999 V2000',
        '    0.8660    2.0000    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    1.7320    1.5000    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    1.7320    0.5000    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    0.8660    0.0000    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    0.0000    0.5000    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    0.0000    1.5000    0.0000 C   0  0  0  0  0  0        0  0  0',
        '  1  2  1  0     0  0',
        '  2  3  2  0     0  0',
        '  3  4  1  0     0  0',
        '  4  5  2  0     0  0',
        '  5  6  1  0     0  0',
        '  6  1  2  0     0  0',
        'M  END'
    ];
    tmpl.template_1 = ['', '  Ketcher 12101117232D 1   1.00000     0.00000     0', '',
        '  5  5  0     0  0            999 V2000',
        '    0.0000    1.4257    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    0.8090    0.8379    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    0.5000   -0.1132    0.0000 C   0  0  0  0  0  0        0  0  0',
        '   -0.5000   -0.1132    0.0000 C   0  0  0  0  0  0        0  0  0',
        '   -0.8090    0.8379    0.0000 C   0  0  0  0  0  0        0  0  0',
        '  1  2  1  0     0  0',
        '  2  3  2  0     0  0',
        '  3  4  1  0     0  0',
        '  4  5  2  0     0  0',
        '  5  1  1  0     0  0',
        'M  END'
    ];
	tmpl.template_2 = ['', '  Ketcher 12101120472D 1   1.00000     0.00000     0', '',
        '  6  6  0     0  0            999 V2000',
        '    0.8660    2.0000    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    1.7320    1.5000    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    1.7320    0.5000    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    0.8660    0.0000    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    0.0000    0.5000    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    0.0000    1.5000    0.0000 C   0  0  0  0  0  0        0  0  0',
        '  1  2  1  0     0  0',
        '  2  3  1  0     0  0',
        '  3  4  1  0     0  0',
        '  4  5  1  0     0  0',
        '  5  6  1  0     0  0',
        '  6  1  1  0     0  0',
        'M  END'
    ];
	tmpl.template_3 = ['', '  Ketcher 12101120492D 1   1.00000     0.00000     0', '',
        '  5  5  0     0  0            999 V2000',
        '    0.8090    1.5389    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    1.6180    0.9511    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    1.3090    0.0000    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    0.3090    0.0000    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    0.0000    0.9511    0.0000 C   0  0  0  0  0  0        0  0  0',
        '  1  2  1  0     0  0',
        '  2  3  1  0     0  0',
        '  3  4  1  0     0  0',
        '  4  5  1  0     0  0',
        '  5  1  1  0     0  0',
        'M  END'
    ];
    tmpl.template_4 = ['', '  Ketcher 12101118272D 1   1.00000     0.00000     0', '',
        '  3  3  0     0  0            999 V2000',
        '   -3.2250   -0.2750    0.0000 C   0  0  0  0  0  0        0  0  0',
        '   -2.2250   -0.2750    0.0000 C   0  0  0  0  0  0        0  0  0',
        '   -2.7250    0.5910    0.0000 C   0  0  0  0  0  0        0  0  0',
        '  1  2  1  0     0  0',
        '  2  3  1  0     0  0',
        '  1  3  1  0     0  0',
        'M  END'
    ];
    tmpl.template_5 = ['', '  Ketcher 12101118312D 1   1.00000     0.00000     0', '',
        '  4  4  0     0  0            999 V2000',
        '   -3.8250    1.5500    0.0000 C   0  0  0  0  0  0        0  0  0',
        '   -3.8250    0.5500    0.0000 C   0  0  0  0  0  0        0  0  0',
        '   -2.8250    1.5500    0.0000 C   0  0  0  0  0  0        0  0  0',
        '   -2.8250    0.5500    0.0000 C   0  0  0  0  0  0        0  0  0',
        '  1  2  1  0     0  0',
        '  1  3  1  0     0  0',
        '  3  4  1  0     0  0',
        '  4  2  1  0     0  0',
        'M  END'
    ];
    tmpl.template_6 = ['', '  Ketcher 12101118372D 1   1.00000     0.00000     0', '',
        '  7  7  0     0  0            999 V2000',
        '    0.0000    1.6293    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    0.7835    2.2465    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    1.7559    2.0242    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    2.1897    1.1289    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    0.0000    0.6228    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    1.7566    0.2224    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    0.7835    0.0000    0.0000 C   0  0  0  0  0  0        0  0  0',
        '  6  7  1  0     0  0',
        '  5  7  1  0     0  0',
        '  1  5  1  0     0  0',
        '  4  6  1  0     0  0',
        '  3  4  1  0     0  0',
        '  2  3  1  0     0  0',
        '  1  2  1  0     0  0',
        'M  END'
    ];
    tmpl.template_7 = ['', '  Ketcher 12101118392D 1   1.00000     0.00000     0', '',
        '  8  8  0     0  0            999 V2000',
        '    0.0000    0.7053    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    0.0000    1.7078    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    0.7053    2.4131    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    0.7056    0.0000    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    1.7079    0.0000    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    2.4133    0.7053    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    2.4133    1.7078    0.0000 C   0  0  0  0  0  0        0  0  0',
        '    1.7079    2.4131    0.0000 C   0  0  0  0  0  0        0  0  0',
        '  8  3  1  0     0  0',
        '  7  8  1  0     0  0',
        '  6  7  1  0     0  0',
        '  5  6  1  0     0  0',
        '  4  5  1  0     0  0',
        '  1  4  1  0     0  0',
        '  2  3  1  0     0  0',
        '  1  2  1  0     0  0',
        'M  END'
    ];

	ketcher.button_areas.chain = ketcher.showMolfileOpts('chain', tmpl.chain, 20, renderOptsPattern);
    ketcher.button_areas.template_0 = ketcher.showMolfileOpts('template', tmpl.template_0, 20, renderOptsPattern);

    // TODO code cleanup
/*
    tmpl.rgroup_label = ['', '  Ketcher 12131120282D 1   1.00000     0.00000     0', '',
        '  1  0  0     0  0            999 V2000',
        '    0.0000    0.0000    0.0000 R#  0  0  0  0  0  0        0  0  0',
        'M  END'
    ];
    tmpl.rgroup_attpoints = ['', '  Ketcher 12131120282D 1   1.00000     0.00000     0', '',
        '  1  0  0  0  0  0  0  0  0  0999 V2000',
        '    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
        'M  APO  1   1   1',
        'M  END'
    ];
    ketcher.button_areas.rgroup_label = ketcher.showMolfileOpts('rgroup', tmpl.rgroup_label, 75, renderOpts);
*/

    ui.init();
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
		'autoScaleMargin':20,
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
