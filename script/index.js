var queryString = require('query-string');

var api = require('./api.js');
var molfile = require('./chem/molfile');
var smiles = require('./chem/smiles');

require('./ui');
var ui = global.ui;

var Render = require('./render');

function getSmiles() {
	return smiles.stringify(ui.editor.struct(),
	                        { ignoreErrors: true });
}

function getMolfile() {
	return molfile.stringify(ui.editor.struct(),
	                         { ignoreErrors: true });
}

function setMolecule(molString) {
	if (!(typeof molString === "string"))
		return;
	ui.load(molString, {
		rescale: true
	});
}

function addFragment(molString) {
	if (!(typeof molString === "string"))
		return;
	ui.load(molString, {
		rescale: true,
		fragment: true
	});
}

function showMolfile(clientArea, molString, options) {
	var render = new Render(clientArea, Object.assign({ scale: options.bondLength || 75 }, options));
	if (molString) {
		var mol = molfile.parse(molString);
		render.setMolecule(mol);
	}
	render.update();
	// not sure we need to expose guts
	return render;
}

function onStructChange(handler) {
	ui.render.addStructChangeHandler(handler);
}

// TODO: replace window.onload with something like <https://github.com/ded/domready>
// to start early
window.onload = function () {
	var params = queryString.parse(document.location.search);
	if (params.api_path)
		ketcher.apiPath = params.api_path;
	var server = ketcher.server = api(ketcher.apiPath, {
		'smart-layout': true,
		'ignore-stereochemistry-errors': true,
		'mass-skip-error-on-pseudoatoms': false,
		'gross-formula-add-rsites': true
	});
	server.then(function () {
		if (params.mol)
			ui.load(params.mol);
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
