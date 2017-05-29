import { escapeRegExp, chunk } from 'lodash/fp';

import { h, Component, render } from 'preact';
/** @jsx h */
import memoize from 'lru-memoize';

import sdf from '../../chem/sdf';

import VisibleView from '../component/visibleview';
import StructRender from '../component/structrender';
import SelectList from '../component/select';
import Dialog from '../component/dialog';
import SaveButton from '../component/savebutton';

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

function RenderTmpl({tmpl, ...props}) {
	return tmpl.props && tmpl.props.prerender ?
	    ( <svg {...props}><use xlinkHref={tmpl.props.prerender}/></svg> ) :
	    ( <StructRender struct={tmpl.struct} options={{autoScaleMargin: 15 }} {...props}/> );
}

class TemplateLib extends Component {
	constructor(props) {
		console.info('lib constructor');
		super(props);
		this.state = {
			selected: props.selected || null,
			filter: '',
			group: props.group || props.lib[0].name
		};
	}

	select(tmpl) {
		if (tmpl === this.state.selected)
			this.props.onOk(this.result());
		else
			this.setState({ selected: tmpl });
	}

	selectGroup(group) {
		if (this.state.group !== group) // don't drop selection
			this.setState({            // if not changed
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
		let tmpl = this.state.selected;
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
		this.props.onOk({event: 'attachEdit', tmpl: tmpl, index: index});
	}

	renderRow (row, index, COLS) {
		return (
			<div className="tr" key={index}>{ row.map((tmpl, i) => (
				<div className={tmpl == this.state.selected ? 'td selected' : 'td'} title={greekify(tmplName(tmpl, index * COLS + i))}>
				  <RenderTmpl tmpl={tmpl}
							  className="struct"
							  onClick={() => this.select(tmpl)} />
					<button className="attach-button" onClick={() => this.onAttach(tmpl, index * COLS + i)}>Edit</button>
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

	render () {
		const COLS = 3;
		let {group, filter} = this.state;
		let lib = libFilter(this.props.lib, filter);

		console.info('all rerender');
		return (
			<Dialog title="Template Library"
					className="template-lib" params={this.props}
					result={() => this.result()}
					buttons={[
						<SaveButton className="save" data={this.saveToSDF()}
									filename={'ketcher-tmpls.sdf'} >
							Save To SDF…
						</SaveButton>,
						"OK", "Cancel"]} >
				<label>
					<input type="search" placeholder="Filter" value={filter}
						   onInput={(ev) => this.setFilter(ev.target.value)} />
				</label>
				<SelectList className="groups"
					onChange={g => this.selectGroup(g)}
					value={ group } options={ lib.map(g => greekify(g.name)) } />
				  <VisibleView data={libRows(lib, group, COLS)}
							   rowHeight={120} className="table">
					{ (row, i) => this.renderRow(row, i, COLS) }
				</VisibleView>
			</Dialog>
		);
	}
}

function prefetchStatic(url) {
	return fetch(url, { credentials: 'same-origin' }).then(function (resp) {
		if (resp.ok)
			return resp.text();
		throw "Could not fetch " + url;
	});
}

function prefetchSplit(tmpl) {
	var pr = tmpl.props.prerender;
	var res = pr && pr.split('#', 2);
	return {
		file: pr && res[0],
		id: pr && res[1]
	};
}

function prefetchRender(tmpls, baseUrl, cacheEl) {
	var files = tmpls.reduce((res, tmpl) => {
		let file = prefetchSplit(tmpl).file;
		if (file && res.indexOf(file) == -1)
			res.push(file);
		return res;
	}, []);
	var fetch = Promise.all(files.map(fn => (
		prefetchStatic(baseUrl + fn).catch(() => null)
	)));
	return fetch.then(svgs => {
		svgs.forEach(svgContent => {
			if (svgContent)
				cacheEl.innerHTML += svgContent;
		});
		return files.filter((file, i) => (
			!!svgs[i]
		));
	});

}

export function init(baseUrl, cacheEl) {
	return prefetchStatic(baseUrl + 'library.sdf').then(text => {
		var tmpls = sdf.parse(text);
		var prefetch = prefetchRender(tmpls, baseUrl, cacheEl);
		return prefetch.then(cachedFiles => (
			tmpls.map(tmpl => {
				let pr = prefetchSplit(tmpl);
				if (pr.file)
					tmpl.props.prerender = cachedFiles.indexOf(pr.file) != -1 ? `#${pr.id}` : '';
				return tmpl;
			})
		));
	});
}

export default function dialog(params) {
	var overlay = $$('.overlay')[0];
	var lib = tmplsLib(params.tmpls).concat({
		name: 'User Templates',
		templates: params.userTmpls
	});
	if (params.group == 'User') params.group = 'User Templates';
	return render((
		<TemplateLib lib={lib} {...params}/>
	), overlay);
};
