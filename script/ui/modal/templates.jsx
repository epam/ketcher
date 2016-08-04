import molfile from '../../chem/molfile';
import ajax from '../../util/ajax.js';
import VisibleView from './visibleview';

// import ReactDOM from 'react-dom';
// import React from 'react';

import { h, Component, render } from 'preact';
/** @jsx h */

var ui = global.ui;

import Render from '../../render';

// TODO: move to Molfile
function parseSdf (sdf) {
	var items = sdf.split(/^[$][$][$][$]$/m);
	var parsed = [];

	items.each(item => {
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

		entries.each(entry => {
			entry = entry.strip();
			var m = entry.match(/^> {1,3}<(\S+)>/);
			if (m) {
				var lines = entry.split('\n');
				var field = m[1].strip();
				iparsed[field] = parseInt(lines[1].strip()) || lines[1].strip();
			}
		});
		parsed.push(iparsed);
	});

	return parsed;
}

function fetchTemplateCustom (base_url) {
	return ajax(base_url + 'templates.sdf').then(xhr => {
		var items = parseSdf(xhr.responseText);

		var templates = [];
		var i = 0;
		items.each(item => {
			templates.push({
				name: (item.name || ('customtemplate ' + (++i))).capitalize(),
				molfile: item.molfile,
				group: item.group,
				aid: (item.atomid || 1) - 1,
				bid: (item.bondid || 1) - 1
			});
		});

		return templates;
	});
}

function renderTmpl(el, tmpl) {
	if (tmpl.prerender)
		el.innerHTML = tmpl.prerender;
	else {
		var mol = molfile.parse(tmpl.molfile);
		var rnd = new Render(el, 0, {
			'autoScale': true,
			'autoScaleMargin': 0,
			//'debug': true,
			'hideChiralFlag': true,
			'maxBondLength': 30
		});
		rnd.setMolecule(mol);
		rnd.update();
		el.title = mol.name;
		console.info('render!');//, el.innerHTML);
		//tmpl.prerender = el.innerHTML;
	}
}

function eachAsync(list, process, timeGap, startTimeGap) {
	return new Promise(resolve => {
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
}

function dialog2(base_url, params) {
	var dlg = ui.showDialog('custom_templates');
	var selectedLi = dlg.select('.selected')[0];
	var ul = dlg.select('ul')[0];

	fetchTemplateCustom(base_url).then(templates => {
		// renders a single row
		var Row = row => (
				<li class="row" ref={ el => renderTmpl(el, row) }>loading..</li>
		);

		var groups = templates.reduce(function (res, tmpl) {
			var group = tmpl.group || 'Ungroupt';
			if (!res.includes(group))
				res.push(group);
			return res;
		}, []);
		console.info('Groups', groups);

		render((
				<VisibleView data={templates} rowHeight={120} renderRow={Row} />
		), ul);
	});

	dlg.on('click', 'input', (_, input) => {
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
}

function dialog (base_url, params) {
	var dlg = ui.showDialog('custom_templates'),
	    selectedLi = dlg.select('.selected')[0],
	okButton = dlg.select('[value=OK]')[0],
	ul = dlg.select('ul')[0];

	if (ul.children.length === 0) { // first time
		$('loading').style.display = '';
		dlg.addClassName('loading');
		var loading = initTemplateCustom(ul, base_url).then(() => {
			$('loading').style.display = 'none';
			dlg.removeClassName('loading');
		});

		loading.then(() => {
			okButton.disabled = true;
			dlg.on('click', 'li', (_, li) => {
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
			dlg.on('click', 'input', (_, input) => {
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
}
export default dialog2;
