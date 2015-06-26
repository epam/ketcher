/*global require, global*/

/* eslint-disable */

require('../ui');
require('../../chem');
require('../../rnd');

var ajax = require('../../util/ajax.js');

var ui = global.ui = global.ui || function () {};
var rnd = global.rnd;
var chem = global.chem;

ui.parseTemplateCustom = function (sdf) {
	var items = sdf.split(/^[$][$][$][$]$/m);
	var parsed = [];

	items.each(function (item) {
		item = item.replace(/\r/g, '');
		item = item.strip();
		var end_idx = item.indexOf('M  END');

		if (end_idx == -1) {
			return;
		}

		var iparsed = {};

		iparsed.molfile = item.substring(0, end_idx + 6);
		iparsed.name = item.substring(0, item.indexOf('\n')).strip();
		item = item.substr(end_idx + 7).strip();

		var entries = item.split(/^$/m);

		entries.each(function (entry) {
			entry = entry.strip();
			if (!entry.startsWith('> <')) {
				return;
			}
			var lines = entry.split('\n');
			var field = lines[0].strip().substring(3, lines[0].lastIndexOf('>')).strip();

			iparsed[field] = parseInt(lines[1].strip()) || lines[1].strip();
		});
		parsed.push(iparsed);
	});

	return parsed;
};

ui.fetchTemplateCustom = function (base_url) {
	return ajax(base_url + 'templates.sdf').then(function (xhr) {
		//headers: {Accept: 'application/octet-stream'}
		var items = ui.parseTemplateCustom(xhr.responseText);

		var templates = [];
		var i = 0;
		items.each(function (item) {
			templates.push({
				name: (item.name || ('customtemplate ' + (++i))).capitalize(),
				molfile: item.molfile,
				aid: (item.atomid || 1) - 1,
				bid: (item.bondid || 1) - 1
			});
		});

		return templates;
	});
};

var custom_templates;
ui.initTemplateCustom = function (el, base_url) {
	return ui.fetchTemplateCustom(base_url).then(function (templates) {
		custom_templates = templates;
		return eachAsync(templates, function (tmpl, _) {
			var li =  new Element('li');
			li.title = tmpl.name;
			el.insert({ bottom: li });
			var mol = chem.Molfile.parseCTFile(tmpl.molfile.split('\n')),
			render = new rnd.Render(li, 0, {
				'autoScale': true,
				'autoScaleMargin': 0,
				//'debug': true,
				'ignoreMouseEvents': true,
				'hideChiralFlag': true,
				'maxBondLength': 30
			});
			render.setMolecule(mol);
			render.update();
		}, 50);
	});
};

ui.showTemplateCustom = function (base_url, params) {
	var dialog = ui.showDialog('custom_templates'),
	selectedLi = dialog.select('.selected')[0],
	okButton = dialog.select('[value=OK]')[0],
	ul = dialog.select('ul')[0];

	if (ul.children.length === 0) { // first time
		$('loading').style.display = '';
		dialog.addClassName('loading');
		var loading = ui.initTemplateCustom(ul, base_url).then(function () {
			$('loading').style.display = 'none';
			dialog.removeClassName('loading');
		});

		loading.then(function () {
			okButton.disabled = true;
			dialog.on('click', 'li', function (_, li) {
				if (selectedLi == li)
					okButton.click();
				else {
					if (selectedLi)
						selectedLi.removeClassName('selected');
					else
						okButton.disabled = false;
					li.addClassName('selected');
					selectedLi = li;
				}
			});
			dialog.on('click', 'input', function (_, input) {
				var mode = input.value,
				key = 'on' + input.value.capitalize(),
				res;
				if (mode == 'OK') {
					console.assert(selectedLi, 'No element selected');
					var ind = selectedLi.previousSiblings().size();
					res = custom_templates[ind];
				}
				ui.hideDialog('custom_templates');
				if (params && key in params)
					params[key](res);
			});
		});
	}
};

function eachAsync(list, process, timeGap, startTimeGap) {
	return new Promise(function (resolve) {
		var i = 0;
		var n = list.length;
		function iterate() {
			if (i < n) {
				process(list[i], i++);
				setTimeout(iterate, timeGap);
			} else {
				resolve();
			}
		}
		setTimeout(iterate, startTimeGap || timeGap);
	});
};
