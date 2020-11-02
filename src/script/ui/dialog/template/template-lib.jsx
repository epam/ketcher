/****************************************************************************
 * Copyright 2018 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { escapeRegExp, chunk, flow, filter as _filter, reduce, omit } from 'lodash/fp';
import { createSelector } from 'reselect';

import { h, Component } from 'preact';
import { connect } from 'preact-redux';

import sdf from '../../../chem/sdf';

import VisibleView from '../../component/view/visibleview';
import StructRender from '../../component/structrender';
import Dialog from '../../component/dialog';
import SaveButton from '../../component/view/savebutton';
import Input from '../../component/form/input';
import SelectList from '../../component/form/select';

import { changeFilter, changeGroup, selectTmpl, editTmpl } from '../../state/templates';
import { onAction } from '../../state';

const GREEK_SIMBOLS = {
	Alpha: 'A',
	alpha: 'α',
	Beta: 'B',
	beta: 'β',
	Gamma: 'Г',
	gamma: 'γ'
};

function tmplName(tmpl, i) {
	console.assert(tmpl.props && tmpl.props.group, 'No group');
	return tmpl.struct.name || `${tmpl.props.group} template ${i + 1}`;
}

function partition(n, array) {
	console.warn('partition', n);
	return chunk(n)(array);
}

const greekRe = new RegExp('\\b' + Object.keys(GREEK_SIMBOLS).join('\\b|\\b') + '\\b', 'g');
function greekify(str) {
	return str.replace(greekRe, sym => GREEK_SIMBOLS[sym]);
}

const filterLibSelector = createSelector(
	props => props.lib,
	props => props.filter,
	filterLib
);

function filterLib(lib, filter) {
	console.warn('Filter', filter);
	const re = new RegExp(escapeRegExp(greekify(filter)), 'i');
	return flow(
		_filter(item =>
			!filter || re.test(greekify(item.struct.name)) || re.test(greekify(item.props.group))),
		reduce((res, item) => {
			if (!res[item.props.group]) res[item.props.group] = [item];
			else res[item.props.group].push(item);
			return res;
		}, {})
	)(lib);
}

const libRowsSelector = createSelector(
	props => props.lib,
	props => props.group,
	props => props.COLS,
	libRows
);

function libRows(lib, group, COLS) {
	console.warn('Group', group);
	return partition(COLS, lib[group]);
}

function RenderTmpl({ tmpl, ...props }) {
	return tmpl.props && tmpl.props.prerender ?
		(<svg {...props}><use xlinkHref={tmpl.props.prerender} /></svg>) :
		(<StructRender struct={tmpl.struct} options={{ autoScaleMargin: 15 }} {...props} />);
}

class TemplateLib extends Component {
	select(tmpl) {
		if (tmpl === this.props.selected)
			this.props.onOk(this.result());
		else
			this.props.onSelect(tmpl);
	}

	result() {
		const tmpl = this.props.selected;
		console.assert(!tmpl || tmpl.props, 'Incorrect SDF parse');
		return tmpl ? {
			struct: tmpl.struct,
			aid: parseInt(tmpl.props.atomid) || null,
			bid: parseInt(tmpl.props.bondid) || null
		} : null;
	}

	renderRow(row, index, COLS) {
		return (
			<div className="tr" key={index}>{ row.map((tmpl, i) => (
				<div
					className={tmpl === this.props.selected ? 'td selected' : 'td'}
					title={greekify(tmplName(tmpl, (index * COLS) + i))}
				>
					<RenderTmpl tmpl={tmpl} className="struct" onClick={() => this.select(tmpl)} />
					<button className="attach-button" onClick={() => this.props.onAttach(tmpl)}>
						Edit
					</button>
				</div>
			))}
			</div>
		);
	}

	render() {
		const COLS = 3;
		const { filter, onFilter, onChangeGroup, ...props } = this.props;
		let group = props.group;
		const lib = filterLibSelector(this.props);
		group = lib[group] ? group : Object.keys(lib)[0];

		return (
			<Dialog
				title="Template Library"
				className="template-lib"
				params={omit(['group'], props)}
				result={() => this.result()}
				buttons={[
					<SaveButton
						data={sdf.stringify(this.props.lib)}
						filename="ketcher-tmpls.sdf"
					>
						Save To SDF…
					</SaveButton>,
					'Cancel', 'OK']}
			>
				<label>
					Filter:
					<Input
						type="search"
						value={filter}
						onChange={value => onFilter(value)}
					/>
				</label>
				<Input
					className="groups"
					component={SelectList}
					splitIndexes={[Object.keys(lib).indexOf('User Templates')]}
					value={group}
					onChange={g => onChangeGroup(g)}
					schema={{
						enum: Object.keys(lib),
						enumNames: Object.keys(lib).map(g => greekify(g))
					}}
				/>
				<VisibleView
					data={libRowsSelector({ lib, group, COLS })}
					rowHeight={120}
					className="table"
				>
					{ (row, i) => this.renderRow(row, i, COLS) }
				</VisibleView>
			</Dialog>
		);
	}
}

export default connect(
	store => ({ ...omit(['attach'], store.templates) }),
	(dispatch, props) => ({
		onFilter: filter => dispatch(changeFilter(filter)),
		onSelect: tmpl => dispatch(selectTmpl(tmpl)),
		onChangeGroup: group => dispatch(changeGroup(group)),
		onAttach: tmpl => dispatch(editTmpl(tmpl)),
		onOk: (res) => {
			dispatch(onAction({	tool: 'template', opts: res	}));
			props.onOk(res);
		}
	})
)(TemplateLib);
