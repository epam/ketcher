import { escapeRegExp, chunk } from 'lodash/fp';

import { h, Component, render } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */
import memoize from 'lru-memoize';

import sdf from '../../chem/sdf';

import VisibleView from '../component/visibleview';
import StructRender from '../component/structrender';
import Dialog from '../component/dialog';
import SaveButton from '../component/savebutton';
import Input from '../component/input';

import { changeFilter, changeGroup, selectTmpl } from '../state/templates';

const GREEK_SIMBOLS = {
	'Alpha': 'A', 'alpha': 'α',
	'Beta': 'B', 'beta': 'β',
	'Gamma': 'Г', 'gamma': 'γ'
};

function tmplName(tmpl, i) {
	console.assert(tmpl.props && tmpl.props.group, "No group");
	return tmpl.struct.name || `${tmpl.props.group} template ${i + 1}`;
}

function tmplsLib(tmpls) {
	return tmpls.reduce((res, tmpl) => {
		var name = tmpl.props.group || 'Ungroupt';
		var group = res.find(group => group.name === name);
		if (!group) {
			group = { name: name, templates: [] };
			res.push(group);
		}
		group.templates.push(tmpl);
		return res;
	}, []);
}

function partition(n, array) {
	console.warn('partition', n);
	return chunk(n)(array);
}

const greekRe = new RegExp('\\b' + Object.keys(GREEK_SIMBOLS).join('\\b|\\b') + '\\b', 'g');
function greekify(str) {
	return str.replace(greekRe, sym => GREEK_SIMBOLS[sym]);
}

function filterLib(lib, filter) {
	console.warn('filter', filter);
	if (!filter)
		return lib;
	let re = new RegExp(escapeRegExp(greekify(filter)), 'i');
	return lib.reduce((res, group) => {
		if (greekify(group.name).search(re) !== -1 && group.templates.length > 0) {
			res.push(group);
		} else {
			let tmpls = group.templates.filter((tmpl, i) => (
				greekify(tmplName(tmpl, i)).search(re) !== -1
			));
			if (tmpls.length > 0)
				res.push({ name: group.name, templates: tmpls });
		}
		return res;
	}, []);
}

function groupTemplates(lib, groupName) {
	console.warn('group', groupName);
	var group = lib.find((group) => group.name === groupName);
	return group ? group.templates : lib.reduce((res, group) => (
		res.concat(...group.templates)
	), []);
}

var libFilter = memoize(30)((lib, filter) => filterLib(lib, filter));
var libRows = memoize(5)((lib, group, n) =>
	partition(n, groupTemplates(lib, group))
);

function RenderTmpl({ tmpl, ...props }) {
	return tmpl.props && tmpl.props.prerender ?
		( <svg {...props}><use xlinkHref={tmpl.props.prerender}/></svg> ) :
		( <StructRender struct={tmpl.struct} options={{ autoScaleMargin: 15 }} {...props}/> );
}

class TemplateLib extends Component {
	select(tmpl) {
		if (tmpl === this.props.selected)
			this.props.onOk(this.result());
		else
			this.props.onSelect(tmpl);
	}

	result() {
		let tmpl = this.props.selected;
		console.assert(!tmpl || tmpl.props, 'Incorrect SDF parse');
		return tmpl ? {
			event: 'chooseTmpl',
			tmpl: {
				struct: tmpl.struct,
				aid: parseInt(tmpl.props.atomid) + 1 || null, // TODO: Why +1??
				bid: parseInt(tmpl.props.bondid) + 1 || null
			}
		} : null;
	}

	onAttach(tmpl, index) {
		this.props.onOk({ event: 'attachEdit', tmpl: tmpl, index: index });
	}

	renderRow(row, index, COLS) {
		return (
			<div className="tr" key={index}>{ row.map((tmpl, i) => (
				<div className={tmpl === this.props.selected ? 'td selected' : 'td'}
					 title={greekify(tmplName(tmpl, index * COLS + i))}>
					<RenderTmpl tmpl={tmpl} className="struct" onClick={() => this.select(tmpl)}/>
					<button className="attach-button" onClick={() => this.onAttach(tmpl, index * COLS + i)}>
						Edit
					</button>
				</div>
			))}</div>
		);
	}

	saveToSDF() {
		let sdfStr = '';
		this.props.lib.forEach(function (item) {
			sdfStr += sdf.stringify(item.templates);
		});
		return sdfStr;
	}

	render() {
		const COLS = 3;
		let { group, filter, onFilter, onChangeGroup, ...props } = this.props;
		let lib = libFilter(this.props.lib, filter);

		return (
			<Dialog title="Template Library"
					className="template-lib" params={props}
					result={() => this.result()}
					buttons={[
						<SaveButton className="save" data={this.saveToSDF()}
									filename={'ketcher-tmpls.sdf'}>
							Save To SDF…
						</SaveButton>,
						"OK", "Cancel"]}>
				<label>
					<Input type="search" placeholder="Filter" value={ filter }
						   onChange={value => onFilter(value)}/>
				</label>
				<Input className="groups" value={ group } onChange={g => onChangeGroup(g)}
					   schema={{
						   enum: lib.map(g => g.name),
						   enumNames: lib.map(g => greekify(g.name))
					   }} size={this.props.lib.length} key={lib}/>

				<VisibleView data={libRows(lib, group, COLS)}
							 rowHeight={120} className="table">
					{ (row, i) => this.renderRow(row, i, COLS) }
				</VisibleView>
			</Dialog>
		);
	}
}

export default connect((store, props) => {
	let lib = tmplsLib(props.tmpls).concat({
		name: 'User Templates',
		templates: props.userTmpls
	});
	if (props.group === 'User') props.group = 'User Templates';
	return {
		lib: lib,
		selected: store.templates.selected,
		filter: store.templates.filter,
		group: store.templates.group || lib[0].name
	};
}, dispatch => ({
	onFilter: filter => dispatch(changeFilter(filter)),
	onSelect: tmpl => dispatch(selectTmpl(tmpl)),
	onChangeGroup: group => dispatch(changeGroup(group))
}))(TemplateLib);
