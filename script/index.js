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

var server;   // TODO: Remove me. Remains here for getSmiles api compatibility
function getSmiles(forceLocal) {
	var local = ui.standalone || forceLocal;
	var saver = local ? new chem.SmilesSaver() : new chem.MolfileSaver();
	var mol = saver.saveMolecule(ui.ctab, true);
	return local ? mol : server.smiles.sync({
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
		// TODO: move split to file parsing
		var mt = typeof molString === 'string' ? molString.split('\n') : molString;
		var mol = chem.Molfile.parseCTFile(mt);
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
	server = api(params.api_path || '');
	ui.init(util.extend({}, params), server);
};

module.exports = {
	time_created: '__TIME_CREATED__',
	version: '2.0.0-alpha.2',
	getSmiles: getSmiles,
	getMolfile: getMolfile,
	setMolecule: setMolecule,
	addFragment: addFragment,
	showMolfile: showMolfile,
	onStructChange: onStructChange
};
