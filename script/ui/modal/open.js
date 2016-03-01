/*global module, global, require*/

/*eslint-disable*/

var Promise = require('promise-polyfill');
// var base64 = require('base64-js');

var ui = global.ui;

function dialog (params) {
	var dlg = ui.showDialog('open-file');
	var okButton = dlg.select('input[value=OK]')[0];
	var textInput = dlg.select('textarea')[0];
	var fileInput = dlg.select('input[type=file]')[0];
	var fragmentInput = dlg.select('input[name=fragment]')[0];
	var readFile;
	var handlers = [];

	handlers[0] = dlg.on('click', 'input[type=button]', function (_, button) {
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

	handlers[1] = fileInput.on('change', function (_, input) {
		console.assert(readFile, 'No valid file opener');
		if (input.files.length) {
			dlg.select('input').each(function (el) {
				el.disabled = true;
			});
			readFile(input.files[0]).then(function (content) {
				textInput.value = content;
				dlg.select('input').each(function (el) {
					el.disabled = false;
				});
			}, ui.echo);
		}
	});

	handlers[2] = textInput.on('input', function (_, input) {
		var text = textInput.value.trim();
		okButton.disabled = !text;
	});

	textInput.value = '';
	fragmentInput.checked = false;
	okButton.disabled = true;

	fileInput.disabled = true;
	fileInput.parentNode.addClassName('disabled');
	fileOpener().then(function (f) {
		readFile = f;
		fileInput.disabled = false;
		fileInput.parentNode.removeClassName('disabled');
	});
};

function fileOpener () {
	function throughFileReader(file) {
		return new Promise(function (resolve, reject) {
			var rd = new FileReader();
			rd.onload = function (event) {
				resolve(event.target.result);
			};
			rd.onerror = function (event) {
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
				var fso = new global.ActiveXObject('Scripting.FileSystemObject');
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
}

function loadHook() {
	// Called from iframe's 'onload'
}

// basicaly hack to export just the dialog func
dialog.loadHook = loadHook;
module.exports = dialog;
