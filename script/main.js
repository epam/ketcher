ketcher = function () {
    this.render = null;
};

// TODO: generate on build time
ketcher.version = "2.0.0-alpha.1";

ketcher.getSmiles = function () {
	var saver = ui.standalone ? new chem.SmilesSaver() : new chem.MolfileSaver(),
	    mol = saver.saveMolecule(ui.ctab, true);
	return ui.standalone ? mol : ui.server.smiles.sync({
		moldata: mol
	});
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

ketcher.onStructChange = function (handler)
{
    util.assert(handler);
    ui.render.addStructChangeHandler(handler);
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

// TODO: replace window.onload with something like <https://github.com/ded/domready>
// to start early
window.onload = function() {
	// Parse URL parameters
	var param_string = document.location.search,
	    pathname = document.location.pathname,
	    basename = pathname.substring(0, pathname.lastIndexOf('/') + 1);

	if (param_string.length > 0)
		param_string = param_string.substring(1);

	var param_list = param_string.split(/&/g);
	var param_hash = {};

	for (var i = 0; i < param_list.length; ++i) {
		var pair = param_list[i].split('=', 2);
		param_hash[pair[0]] = pair.length != 2 || unescape(pair[1]);
	}

	// Initialize UI
	ui.init(param_hash);
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
