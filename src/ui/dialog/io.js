/*global require, global, chem:false*/

/*eslint-disable*/

require('../ui');
require('../../chem');
require('../../util');

var ui = global.ui = global.ui || function () {};
var chem = global.chem;
var util = global.util;
var Promise = global.Promise;

ui.openDialog = function(params) {
    var dialog = ui.showDialog('open-file'),
        okButton = dialog.select('input[value=OK]')[0],
        textInput = dialog.select('textarea')[0],
        fileInput = dialog.select('input[type=file]')[0],
        fragmentInput = dialog.select('input[name=fragment]')[0],
        readFile,
        handlers = [];

    handlers[0] = dialog.on('click', 'input[type=button]', function(_, button) {
        handlers.forEach(function (h) { h.stop(); });
        ui.hideDialog('open-file');

        var key = 'on' + button.value.capitalize();
        if (params && key in params) {
            // TODO: generalize to form serialization
            params[key]({
                fragment: fragmentInput.checked,
                value: textInput.value
            });
        }
    });

    handlers[1] = fileInput.on('change', function(_, input) {
        console.assert(readFile, 'No valid file opener');
        if (input.files.length) {
            dialog.select('input').each(function (el) {
                el.disabled = true;
            });
            readFile(input.files[0]).then(function (content) {
                textInput.value = content;
                dialog.select('input').each(function (el) {
                    el.disabled = false;
                });
            }, ui.echo);
        }
    });

    handlers[2] = textInput.on('input', function(_, input) {
        var text = textInput.value.trim();
        okButton.disabled = !text;
    });

    textInput.value = '';
    fragmentInput.checked = false;
    okButton.disabled = true;

    fileInput.disabled = true;
    fileInput.parentNode.addClassName('disabled');
    ui.fileOpener().then(function (f) {
        readFile = f;
        fileInput.disabled = false;
        fileInput.parentNode.removeClassName('disabled');
    });
};

ui.fileOpener = function() {
    function throughFileReader(file) {
        return new Promise(function (resolve, reject) {
            var rd = new FileReader();
            rd.onload = function(event) {
                resolve(event.target.result);
            };
            rd.onerror = function(event) {
                reject(event);
            };
            rd.readAsText(file, 'UTF-8');
        });
    }
    function throughFileSystemObject(fso, file) {
        // IE9 and below
        var fd =  fso.OpenTextFile(file.name, 1),
            content = fd.ReadAll();
        fd.Close();
        return content;
    }
    function throughForm2IframePosting(file) {
    }
    return new Promise(function (resolve, reject) {
        // TODO: refactor return
        if (global.FileReader)
            return resolve(throughFileReader);

        if (global.ActiveXObject) {
            try {
                var fso = new ActiveXObject("Scripting.FileSystemObject");
                return resolve(function (file) {
                    return Promise.resolve(throughFileSystemObject(fso, file));
                });
            } catch (e) {
            }
        }

        if (ui.standalone)
            return reject('Standalone mode!');
        return resolve(throughForm2IframePosting);
    });
};

ui.saveDialog = function(params) {
    var dialog = ui.showDialog('save-file'),
        output = dialog.select('textarea')[0],
        formatInput = dialog.select('select')[0],
        saveButton = dialog.select('.save')[0],
        saveFile,
        handlers = [];

    function outputMolecule(text, format) {
        format = format || 'mol';
        output.value = text;
        output.className = format;
        output.activate();
    }

    handlers[0] = dialog.on('click', 'input[type=button]', function(_, button) {
        handlers.forEach(function (h) { h.stop(); });
        ui.hideDialog('save-file');

        var key = 'on' + button.value.capitalize();
        if (params && key in params) {
            params[key]({});
        }
    });

    handlers[1] = formatInput.on('change', function(_, input) {
        var format = formatInput.value;
        ui.convertMolecule(params.molecule, format).then(function (res) {
            outputMolecule(res, format);
        }, ui.echo);
    });

    handlers[2] = saveButton.on('click', function (event) {
        if (saveFile) {
            saveFile(output.value, formatInput.value);
            dialog.select('input[type=button]')[0].click();
        }
        event.preventDefault();
    });

    outputMolecule(new chem.MolfileSaver().saveMolecule(params.molecule));
    saveButton.addClassName('disabled');
    ui.fileSaver().then(function (f) {
        saveFile = f;
        saveButton.removeClassName('disabled');
    });
    formatInput.select('[value=inchi]')[0].disabled = ui.standalone;
};

ui.fileSaver = function() {
    var mimemap = {
        'smi': 'chemical/x-daylight-smiles',
        'mol': 'chemical/x-mdl-molfile',
        'rxn': 'chemical/x-mdl-rxnfile',
        'inchi': 'chemical/x-inchi'
    };
    return new Promise(function (resolve, reject) {
        if (global.Blob && global.saveAs)
            resolve(function (data, type) {
                if (type == 'mol' && data.indexOf('$RXN') == 0)
                    type = 'rxn';
                console.assert(mimemap[type], 'Unknown chemical file type');
                var blob = new Blob([data], {type: mimemap[type] });
                global.saveAs(blob, 'ketcher.' + type);
            });
        else if (ui.standalone)
            reject('Standalone mode!');
        else
            resolve(function (data, type) {
                ui.server.save({filedata: [type, data].join('\n')});
            });
    });
};

ui.convertMolecule = function (molecule, format) {
    return new Promise(function (resolve, reject) {
        var moldata = new chem.MolfileSaver().saveMolecule(molecule);
        if (format == 'mol') {
            resolve(moldata);
        }
        else if (format == 'smi') {
            resolve(!ui.standalone ? ui.server.smiles({ moldata: moldata }):
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
                molecule.sgroups.each(function(sgid, sg) {
                    if (sg.type !== 'MUL')
                        throw Error('InChi data format doesn\'t support s-groups');
                }, this);

                resolve(ui.server.inchi({ moldata: moldata }));
            }
        }
    });
};

ui.loadMoleculeFromFile = function ()
{
    // Called from iframe's 'onload'
};
