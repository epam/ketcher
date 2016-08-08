import { h, Component, render } from 'preact';
/** @jsx h */

import sdf from '../../chem/sdf';
import ajax from '../../util/ajax.js';
import VisibleView from './visibleview';

import Render from '../../render';

import Dialog from './dialog';

function normGroup(tmpl, i) {
	return tmpl.props.group || 'Ungroupt';
}

function normName(tmpl, i) {
	return tmpl.struct.name || `{normGroup(tmpl)} template {i + 1}`;
}

function renderTmpl(el, tmpl) {
	if (tmpl.prerender)           // Should it sit here?
		el.innerHTML = tmpl.prerender;
	else {
		var rnd = new Render(el, 0, {
			'autoScale': true,
			'autoScaleMargin': 0,
			//'debug': true,
			'hideChiralFlag': true,
			'maxBondLength': 30
		});
		rnd.setMolecule(tmpl.struct);
		rnd.update();
		console.info('render!');//, el.innerHTML);
		//tmpl.prerender = el.innerHTML;
	}
}

class Templates extends Component {
	constructor({params, templates}) {
		super();
		this.all = templates;
		this.params = params;
		var groups = this.getGroups();
		this.state.selected = null;
		this.state.selectedGroup = groups[0];
		this.state.filter = '';
	}

	getGroups() {
		console.info('groups', this.state);
		return this.getFilter().reduce(function (res, tmpl, i) {
			var group = normGroup(tmpl, i);
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
		return this.all.filter((tmpl, i) => (
			normName(tmpl, i).search(re) != -1
		));
	}

	getTemplates() {
		console.info('templates', this.state);
		if (!this.getGroups().includes(this.state.selectedGroup))
			return this.getFilter();
		return this.getFilter().filter((tmpl, i) => (
			this.state.selectedGroup == normGroup(tmpl, i)
		));
	}

	select(tmpl) {
		if (tmpl == this.state.selected)
			this.params.onOk(this.result());
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

	result() {
		var tmpl = this.state.selected;
		//console.assert(tmpl.props, 'Incorrect SDF parse');
		return tmpl ? {
			struct: tmpl.struct,
			aid: parseInt(tmpl.props.atomid) || null,
			bid: parseInt(tmpl.props.bondid) || null
		} : null;
	}

	render () {
		var {selected, selectedGroup, filter} = this.state;

		console.info('all rerender');
		var Tmpl = (tmpl, i) => (
			<li title={normName(tmpl, i)}
			    class={tmpl == selected ? 'selected' : ''}
			    onClick={() => this.select(tmpl)}
			    ref={ el => renderTmpl(el, tmpl) }>loading..</li>
		);

		return (
			<Dialog caption="Template Library"
					name="template-lib" params={this.params}
					result={() => this.result()}>
				<label>
					<input type="search" placeholder="Filter" value={filter}
						   onInput={(ev) => this.setFilter(ev.target.value)} />
				</label>
				<select size="10" class="groups" onChange={ev => this.selectGroup(ev.target)}>
					{ this.getGroups().map(group => (
						<option selected={group == selectedGroup}>{group}</option>
					)) }
				</select>
				<VisibleView data={this.getTemplates()} rowHeight={120}
                             renderRow={Tmpl} />
			</Dialog>
		);
	}
}

export default function dialog(baseUrl, params) {
	var overlay = $$('.overlay')[0];
	return ajax(baseUrl + 'templates.sdf').then(xhr => {
		var templates = sdf.parse(xhr.responseText);
		return render((
			<Templates params={params} templates={templates}/>
		), overlay);
	});
};
