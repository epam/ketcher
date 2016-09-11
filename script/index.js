var queryString = require('query-string');

var util = require('./util');
var api = require('./api.js');
var molfile = require('./chem/molfile');
var smiles = require('./chem/smiles');

require('./ui');
var ui = global.ui;

var Render = require('./render');

function getSmiles() {
	return smiles.stringify(ui.ctab, { ignoreErrors: true });
}

function getMolfile() {
	return molfile.stringify(ui.ctab, { ignoreErrors: true });
}

function setMolecule(molString) {
	if (!Object.isString(molString))
		return;
	ui.loadMolecule(molString);
}

function addFragment(molString) {
	if (!Object.isString(molString))
		return;
	ui.loadFragment(molString);
}

function showMolfile(clientArea, molString, options) {
	var opts = Object.assign({
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
	var render = new Render(clientArea, opts.bondLength, opts);
	if (molString) {
		var mol = molfile.parse(molString);
		render.setMolecule(mol);
	}
	render.update();
	// not sure we need to expose guts
	return render;
}

function onStructChange(handler) {
	util.assert(handler);
	ui.render.addStructChangeHandler(handler);
}

// TODO: replace window.onload with something like <https://github.com/ded/domready>
// to start early
window.onload = function () {
	var params = queryString.parse(document.location.search);
	if (params.api_path)
		ketcher.apiPath = params.api_path;
	var server = ketcher.server = api(ketcher.apiPath, {
		'smart-layout': 'false'
	});
	server.then(function () {
		if (params.mol)
			ui.loadMolecule(params.mol);
	}, function () {
		document.title += ' (standalone)';
	});
	ui.init(Object.assign({}, params, buildInfo), server);
};

var buildInfo = {
	version: '__VERSION__',
	apiPath: '__API_PATH__',
	buildDate: '__BUILD_DATE__',
	buildNumber: '__BUILD_NUMBER__' || null,
	buildOptions: '__BUILD_OPTIONS__'
};

var ketcher = module.exports = Object.assign({
	getSmiles: getSmiles,
	getMolfile: getMolfile,
	setMolecule: setMolecule,
	addFragment: addFragment,
	showMolfile: showMolfile,
	onStructChange: onStructChange
}, buildInfo);
