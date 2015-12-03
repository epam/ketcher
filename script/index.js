/*global require, module, global*/

var queryString = require('query-string');

var util = require('./util');
var api = require('./api.js');

require('./ui');
require('./chem');
require('./rnd');

var ui = global.ui;
var chem = global.chem;
var rnd = global.rnd;

function getSmiles(forceLocal) {
	var local = ui.standalone || forceLocal;
	var saver = local ? new chem.SmilesSaver() : new chem.MolfileSaver();
	var mol = saver.saveMolecule(ui.ctab, true);
	// TODO: Remove me. Remains here for getSmiles api compatibility
	return local ? mol : ketcher.server.smiles.sync({
		moldata: mol
	});
};

function getMolfile() {
	var saver = new chem.MolfileSaver();
	return saver.saveMolecule(ui.ctab, true);
};

function setMolecule(molString) {
	if (!Object.isString(molString)) {
		return;
	}
	ui.loadMolecule(molString);
};

function addFragment(molString) {
	if (!Object.isString(molString)) {
		return;
	}
	ui.loadFragment(molString);
};

function showMolfile(clientArea, molString, options) {
	var opts = util.extend({
		bondLength: 75,
		showSelectionRegions: false,
		showBondIds: false,
		showHalfBondIds: false,
		showLoopIds: false,
		showAtomIds: false,
		autoScale: false,
		autoScaleMargin: 4,
		hideImplicitHydrogen: false
	}, options);
	var render = new rnd.Render(clientArea, opts.bondLength, opts);
	if (molString) {
		var mol = chem.Molfile.parseCTFile(molString);
		render.setMolecule(mol);
	}
	render.update();
	// not sure we need to expose guts
	return render;
};

function onStructChange(handler) {
	util.assert(handler);
	ui.render.addStructChangeHandler(handler);
};

// TODO: replace window.onload with something like <https://github.com/ded/domready>
// to start early
window.onload = function () {
	var params = queryString.parse(document.location.search);
	if (params.api_path)
		ketcher.api_path = params.api_path;
	ketcher.server = api(ketcher.api_path);
	ui.init(util.extend({}, params), ketcher.server);
};

var ketcher = module.exports = {
	version: '__VERSION__',
	api_path: '__API_PATH__',
	build_date: '__BUILD_DATE__',
	build_number: '__BUILD_NUMBER__' || null,
	build_options: '__BUILD_NUMBER__',

	getSmiles: getSmiles,
	getMolfile: getMolfile,
	setMolecule: setMolecule,
	addFragment: addFragment,
	showMolfile: showMolfile,
	onStructChange: onStructChange
};
