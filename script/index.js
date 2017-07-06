import 'babel-polyfill';
import 'whatwg-fetch';
var queryString = require('query-string');

var api = require('./api.js');
var molfile = require('./chem/molfile');
var smiles = require('./chem/smiles');

var ui = require('./ui');
var Render = require('./render');

function getSmiles() {
	return smiles.stringify(ketcher.editor.struct(),
	                        { ignoreErrors: true });
}

function getMolfile() {
	return molfile.stringify(ketcher.editor.struct(),
	                         { ignoreErrors: true });
}

function setMolecule(molString) {
	if (!(typeof molString === "string"))
		return;
	ketcher.ui.load(molString, {
		rescale: true
	});
}

function addFragment(molString) {
	if (!(typeof molString === "string"))
		return;
	ketcher.ui.load(molString, {
		rescale: true,
		fragment: true
	});
}

function showMolfile(clientArea, molString, options) {
	var render = new Render(clientArea, Object.assign({
		scale: options.bondLength || 75
	}, options));
	if (molString) {
		var mol = molfile.parse(molString);
		render.setMolecule(mol);
	}
	render.update();
	// not sure we need to expose guts
	return render;
}

// TODO: replace window.onload with something like <https://github.com/ded/domready>
// to start early
window.onload = function () {
	var params = queryString.parse(document.location.search);
	if (params.api_path)
		ketcher.apiPath = params.api_path;
	ketcher.server = api(ketcher.apiPath, {
		'smart-layout': true,
		'ignore-stereochemistry-errors': true,
		'mass-skip-error-on-pseudoatoms': false,
		'gross-formula-add-rsites': true
	});
	ketcher.ui = ui(Object.assign({}, params, buildInfo),
	                ketcher.server);
	ketcher.editor = ketcher.ui.editor;
	ketcher.server.then(function () {
		if (params.mol)
			ketcher.ui.load(params.mol);
	}, function () {
		document.title += ' (standalone)';
	});
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
	showMolfile: showMolfile
}, buildInfo);
