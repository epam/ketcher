import { h, Component, render } from 'preact';
/** @jsx h */

import sdf from '../../chem/sdf';
import molfile from '../../chem/molfile';

import VisibleView from '../component/visibleview';
import StructRender from '../component/structrender';
import SelectList from '../component/select';
import Dialog from '../component/dialog';

function normGroup(tmpl, i) {
	return tmpl.props.group || 'Ungroupt';
}

function normName(tmpl, i) {
	return tmpl.struct.name || `${normGroup(tmpl)} template ${i + 1}`;
}

function partition(n, array) {
	var res = [];
	for (var i = 0; i < array.length; i += n)
		res.push(array.slice(i, i + n));
	return res;
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

	selectGroup(group) {
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

	renderRow (row, index) {
		let { selected } = this.state;
		return (
			<tr key={index}>{ row.map((tmpl, i) => (
				<td>
				<StructRender struct={tmpl.struct}
							  xhref={ tmpl.props && tmpl.props.prerender }
							  title={normName(tmpl, index + i)}
							  class={tmpl == selected ? 'selected' : ''}
							  onClick={() => this.select(tmpl)} />
				</td>

			))
			}</tr>
		);
	}

	render () {
		const COLS = 3;
		let {selectedGroup, filter} = this.state;
		let rows = partition(COLS, this.getTemplates());

		console.info('all rerender');
		return (
			<Dialog caption="Template Library"
					name="template-lib" params={this.params}
					result={() => this.result()}>
				<label>
					<input type="search" placeholder="Filter" value={filter}
						   onInput={(ev) => this.setFilter(ev.target.value)} />
				</label>
				<SelectList className="groups" onChange={g => this.selectGroup(g)} value={selectedGroup} options={ this.getGroups() } />
				<VisibleView data={rows} rowHeight={120} Tag="table">{
						(row, i) => this.renderRow(row, i)

        }</VisibleView>
			</Dialog>
		);
	}
}

function getTemplates(baseUrl) {
	return fetch(baseUrl + 'templates.sdf').then(response => {
    if (response.ok)
      return response.text();
  }).then(text => {
	  var templates = sdf.parse(text);
      var userTemplates = JSON.parse(localStorage['ketcher-tmpl'] || 'null') || [];

    return userTemplates.reduce((res, struct) => {
      res.push({ struct: molfile.parse(struct), props: { group: 'User' }});
      return res;
    }, templates);
  });
}

export default function dialog(baseUrl, params) {
	var overlay = $$('.overlay')[0];
	return getTemplates(baseUrl).then(templates => {
		return render((
			<Templates params={params} templates={templates}/>
		), overlay);
	});
};
