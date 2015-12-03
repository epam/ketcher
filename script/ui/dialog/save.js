/*global require, module, global*/

var Promise = require('promise-polyfill');
var fs = require('filesaver.js');

require('../../chem');

var chem = global.chem;
var ui = global.ui;

function saveDialog (params, server) {
	var dlg = ui.showDialog('save-file'),
	output = dlg.select('textarea')[0],
	formatInput = dlg.select('select')[0],
	saveButton = dlg.select('.save')[0],
	saveFile,
	handlers = [];

	function outputMolecule(text, format) {
		format = format || 'mol';
		output.value = text;
		output.className = format;
		output.activate();
	}

	handlers[0] = dlg.on('click', 'input[type=button]', function (_, button) {
		handlers.forEach(function (h) { h.stop(); });
		ui.hideDialog('save-file');

		var key = 'on' + button.value.capitalize();
		if (params && key in params) {
			params[key]({});
		}
	});

	handlers[1] = formatInput.on('change', function (_, input) {
		var format = formatInput.value;
		convertMolecule(server, params.molecule, format).then(function (res) {
			outputMolecule(res, format);
		}, ui.echo);
	});

	handlers[2] = saveButton.on('click', function (event) {
		if (saveFile) {
			saveFile(output.value, formatInput.value);
			dlg.select('input[type=button]')[0].click();
		}
		event.preventDefault();
	});

	outputMolecule(new chem.MolfileSaver().saveMolecule(params.molecule));
	saveButton.addClassName('disabled');
	fileSaver(server).then(function (f) {
		saveFile = f;
		saveButton.removeClassName('disabled');
	});
	formatInput.select('[value=inchi]')[0].disabled = ui.standalone;
};

function fileSaver (server) {
	var mimemap = {
		'smi': 'chemical/x-daylight-smiles',
		'mol': 'chemical/x-mdl-molfile',
		'rxn': 'chemical/x-mdl-rxnfile',
		'inchi': 'chemical/x-inchi'
	};
	return new Promise(function (resolve, reject) {
		if (global.Blob && fs.saveAs)
			resolve(function (data, type) {
				if (type == 'mol' && data.indexOf('$RXN') == 0)
					type = 'rxn';
				console.assert(mimemap[type], 'Unknown chemical file type');
				var blob = new Blob([data], {type: mimemap[type] });
				fs.saveAs(blob, 'ketcher.' + type);
			});
		else if (ui.standalone)
			reject('Standalone mode!');
		else
			resolve(function (data, type) {
				server.save({filedata: [type, data].join('\n')});
			});
	});
};

function convertMolecule (server, molecule, format) {
	return new Promise(function (resolve, reject) {
		var moldata = new chem.MolfileSaver().saveMolecule(molecule);
		if (format == 'mol') {
			resolve(moldata);
		}
		else if (format == 'smi') {
			resolve(!ui.standalone ? server.smiles({ moldata: moldata }) :
				new chem.SmilesSaver().saveMolecule(molecule));
		}
		else if (format == 'inchi') {
			if (ui.standalone)
				throw Error('InChI is not supported in the standalone mode');

			if (molecule.rgroups.count() !== 0)
				ui.echo('R-group fragments are not supported and will be discarded');
			molecule = molecule.getScaffold();
			if (molecule.atoms.count() === 0)
				resolve('');
			else {
				molecule = molecule.clone();
				molecule.sgroups.each(function (sgid, sg) {
					// ? Not sure we should check it client side
					if (sg.type != 'MUL' && !/^INDIGO_.+_DESC$/i.test(sg.data.fieldName))
						throw Error('InChi data format doesn\'t support s-groups');
				});

				resolve(server.inchi({ moldata: moldata }));
			}
		}
	});
}

module.exports = saveDialog;
