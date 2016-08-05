// import ReactDOM from 'react-dom';
// import React from 'react';

import { h, Component, render } from 'preact';
/** @jsx h */

import molfile from '../../chem/molfile';
import ajax from '../../util/ajax.js';
import VisibleView from './visibleview';

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
			var m = entry.match(/^> [ \d]*<(\S+)>/);
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

function DialogCommon ({ children, caption, name, params={}, result=() => null, valid=() => true }) {
	function exit(mode) {
		var key = 'on' + mode.capitalize();
		var res = result();
		console.info(mode);
		if (params && key in params)
			params[key](res);
	}
	return (
			<form role="dialog" className={name}>
			<header>{caption}</header>
			{ children }
			<footer>
			<input type="button" onClick={() => exit('Cancel')} value="Cancel"/>
			<input type="button" disabled={!valid()} onClick={() => exit('OK')} value="OK"/>
			</footer>
			</form>
	);
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

class Comp extends Component {
	constructor({params, templates}) {
		super();
		this.all = templates;
		this.params = params;
		var groups = this.getGroups();

		this.state.selected = null;
		this.state.selectedGroup = groups[0];
		this.state.filter = '';
		console.info(this.state);
	}

	getGroups() {
		console.info('groups', this.state);
		return this.getFilter().reduce(function (res, tmpl) {
			var group = tmpl.group || 'Ungroupt';
			if (!res.includes(group))
				res.push(group);
			return res;
		}, []);
	}

	getFilter() {
		console.info('filter', this.state);
		if (!this.state.filter)
			return this.all;
		var re = RegExp(this.state.filter, 'i');
		return this.all.filter(tmpl => tmpl.name.search(re) != -1);
	}

	getTemplates() {
		console.info('templates', this.state);
		if (!this.getGroups().includes(this.state.selectedGroup))
			return this.getFilter();
		return this.getFilter().filter(tmpl => {
			var group = tmpl.group || 'Ungroupt';
			return this.state.selectedGroup == group;
		});
	}

	select(tmpl) {
		if (tmpl == this.state.selected)
			this.params.onOk(tmpl);
		else
			this.setState({ selected: tmpl });
	}

	selectGroup(select) {
		var group = select.options[select.selectedIndex].value;
		this.setState({
			selectedGroup: group,
			selected: null
		});
	}

	setFilter(filter) {
		this.setState({
			filter: filter,
			selected: null           // TODO: change this
		});
	}

	render (props, {selected, selectedGroup, filter}) {
		console.info('all rerender');
		var Row = row => (
				<li class={row == selected ? 'selected' : ''} onClick={() => this.select(row)} ref={ el => renderTmpl(el, row) }>loading..</li>
		);

		return (
				<DialogCommon caption="Custom Templates" name="custom-templates" params={props.params} result={() => selected} valid={() => !!selected}>
				<label>
				<input type="search" placeholder="Filter" value={filter} onInput={(ev) => this.setFilter(ev.target.value)} />
				</label>
				<select size="10" class="groups" onChange={ev => this.selectGroup(ev.target)}>
				{ this.getGroups().map(group => (<option>{group}</option>)) }
			  </select>
				<VisibleView data={this.getTemplates()} rowHeight={120} renderRow={Row} />
				</DialogCommon>
		);
	}
}

export default function dialog(base_url, params) {
	var overlay = $$('.overlay')[0];
	fetchTemplateCustom(base_url).then(templates => {
		// renders a single row
		return render((
				<Comp params={params} templates={templates}/>
		), overlay);
	});
};
