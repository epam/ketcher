import { h, Component, render } from 'preact';
/** @jsx h */

import VisibleView from '../component/visibleview';
import StructRender from '../component/structrender';
import SelectList from '../component/select';
import Dialog from '../component/dialog';

function tmplName(tmpl, i) {
	console.assert(tmpl.props && tmpl.props.group, "No group");
	return tmpl.struct.name || `${tmpl.props.group} template ${i + 1}`;
}

function partition(n, array) {
	var res = [];
	for (var i = 0; i < array.length; i += n)
		res.push(array.slice(i, i + n));
	return res;
}

function filterLib(lib, filter) {
	console.info('filter', filter);
	if (!filter)
		return lib;
	var re = RegExp(filter, 'i');
	return lib.reduce((res, group) => {
		if (group.name.search(re) != -1 && group.templates.length > 0) {
			res.push(group);
		} else {
			let tmpls = group.templates.filter((tmpl, i) => (
				tmplName(tmpl, i).search(re) != -1
			));
			if (tmpls.length > 0)
				res.push({ name: group.name, templates: tmpls });
		}
		return res;
	}, []);
}

function groupTemplates(lib, groupName) {
	console.info('group', groupName);
	var group = lib.find(function (group) {
		return group.name == groupName;
	});
	return group ? group.templates : lib.reduce((res, group) => (
		res.concat(...group.templates)
	), []);
}

function RenderTmpl({tmpl, ...props}) {
	return tmpl.props && tmpl.props.prerender ?
	    ( <div {...props}><img src={tmpl.props.prerender}/></div> ) :
	    ( <StructRender struct={tmpl.struct} {...props}/> );
}

class Templates extends Component {
	constructor(props) {
		super(props);
		console.info(props);
		this.state = {
			selected: null,
			filter: '',
			group: props.lib[0].name
		};
	}

	select(tmpl) {
		if (tmpl == this.state.selected)
			this.props.onOk(this.result());
		else
			this.setState({ selected: tmpl });
	}

	selectGroup(group) {
		this.setState({
			group: group,
			selected: null
		});
	}

	setFilter(filter) {
		this.setState({
			filter: filter.trim(),
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
		return (
			<div class="tr" key={index}>{ row.map((tmpl, i) => (
				<div class="td">
				  <RenderTmpl tmpl={tmpl}
							  title={tmplName(tmpl, index + i)}
							  className={tmpl == this.state.selected ? 'struct selected' : 'struct'}
							  onClick={() => this.select(tmpl)} />
				</div>
			))}</div>
		);
	}

	render () {
		const COLS = 3;
		let {group, filter} = this.state;
		let lib = filterLib(this.props.lib, filter);
		let rows = partition(COLS, groupTemplates(lib, group));

		console.info('all rerender');
		return (
			<Dialog caption="Template Library"
					name="template-lib" params={this.props}
					result={() => this.result()}>
				<label>
					<input type="search" placeholder="Filter" value={filter}
						   onInput={(ev) => this.setFilter(ev.target.value)} />
				</label>
				<SelectList className="groups"
					onChange={g => this.selectGroup(g)}
					value={group} options={ lib.map(g => g.name) } />
				<VisibleView data={rows} rowHeight={120} className="table">
					{ (row, i) => this.renderRow(row, i) }
				</VisibleView>
			</Dialog>
		);
	}
}

export default function dialog(params) {
	var overlay = $$('.overlay')[0];
	return render((
		<Templates {...params}/>
	), overlay);
};
