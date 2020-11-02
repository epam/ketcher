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

import { range, xor } from 'lodash/fp';

import { h, Component } from 'preact';
import { connect } from 'preact-redux';

import element from '../../../chem/element';
import { sketchingColors as elementColor } from '../../../chem/element-color';

import Dialog from '../../component/dialog';
import Atom from '../../component/view/atom';
import Tabs from '../../component/view/tabs';

import GenericGroups from './generic-groups';

import { fromElement, toElement } from '../../data/convert/structconv';
import { onAction } from '../../state';
import { addAtoms } from '../../state/toolbar';

const typeSchema = [
	{ title: 'Single', value: 'atom' },
	{ title: 'List', value: 'list' },
	{ title: 'Not List', value: 'not-list' }
];

const beforeSpan = {
	He: 16,
	B: 10,
	Al: 10,
	Hf: 1,
	Rf: 1
};

const main = rowPartition(element.filter(el => el && el.type !== 'actinide' &&
	el.type !== 'lanthanide'));
const lanthanides = element.filter(el => el && el.type === 'lanthanide');
const actinides = element.filter(el => el && el.type === 'actinide');

function Header() {
	return (
		<tr>
			{ range(0, 19).map(i => (<th>{i || ''}</th>)) }
		</tr>
	);
}

function TypeChoise({ value, onChange, ...props }) {
	return (
		<fieldset>
			{
				typeSchema.map(sc => (
					<label>
						<input
							type="radio"
							value={sc.value}
							checked={sc.value === value}
							onClick={() => onChange(sc.value)}
							{...props}
						/>
						{sc.title}
					</label>
				))
			}
		</fieldset>
	);
}

function MainRow({ row, caption, refer, selected, onSelect, curEvents }) {
	return (
		<tr>
			<th>{caption}</th>
			{
				row.map(el => (typeof el !== 'number') ? (  // eslint-disable-line
					<td>
						<Atom
							el={el}
							className={selected(el.label) ? 'selected' : ''}
							onClick={() => onSelect(el.label)}
							{...curEvents(el)}
						/>
					</td>
				) : (
					refer(el) ? <td className="ref">{refer(el)}</td> : <td colSpan={el} />
				))
			}
		</tr>
	);
}

function OutinerRow({ row, caption, selected, onSelect, curEvents }) {
	return (
		<tr>
			<th colSpan="3" className="ref">{caption}</th>
			{
				row.map(el => (
					<td>
						<Atom
							el={el}
							className={selected(el.label) ? 'selected' : ''}
							onClick={() => onSelect(el.label)}
							{...curEvents(el)}
						/>
					</td>
				))
			}
			<td />
		</tr>
	);
}

function AtomInfo({ el, isInfo }) {
	const numberStyle = { color: elementColor[el.label] || 'black', 'font-size': '1.2em' };
	const elemStyle = { color: elementColor[el.label] || 'black', 'font-weight': 'bold', 'font-size': '2em' };
	return (
		<div className={`ket-atom-info ${isInfo ? '' : 'none'}`}>
			<div style={numberStyle}>{element.map[el.label]}</div>
			<span style={elemStyle}>{el.label}</span><br />
			{el.title}<br />
			{el.atomic_mass}
		</div>
	);
}

class PeriodTable extends Component {
	constructor(props) {
		super(props);
		const genType = !this.props.pseudo ? null : 'gen';
		this.state = {
			type: props.type || genType || 'atom',
			value: props.values || props.label || null,
			cur: element[2],
			isInfo: false
		};
		this.firstType = true;
		this.selected = this.selected.bind(this);
		this.onSelect = this.onSelect.bind(this);
	}
	changeType(type) {
		if (this.firstType) {
			this.firstType = false;
			return;
		}
		const pl = this.state.type === 'list' || this.state.type === 'not-list';
		const l = type === 'list' || type === 'not-list';
		if (l && pl) {
			this.setState({ type });
		} else {
			this.setState({
				type,
				value: type === 'atom' || type === 'gen' ? null : []
			});
		}
	}
	selected(label) {
		const { type, value } = this.state;
		return (type === 'atom' || type === 'gen') ? value === label :
			value.includes(label);
	}
	onSelect(label) {
		const { type, value } = this.state;
		this.setState({ value: (type === 'atom' || type === 'gen') ? label : xor([label], value) });
	}
	result() {
		const { type, value } = this.state;
		if (type === 'atom')
			return value ? { label: value, pseudo: null } : null;
		else if (type === 'gen')
			return value ? { type, label: value, pseudo: value } : null;
		return value.length ? { type, values: value } : null;
	}
	curEvents = el => ({
		onMouseEnter: () => this.setState({ cur: el, isInfo: true }),
		onMouseLeave: () => this.setState({ isInfo: false })
	});
	render() {
		const tabs = ['Table', 'Extended'];
		const { type, value } = this.state;
		return (
			<Dialog
				title="Periodic table"
				className="elements-table"
				params={this.props}
				result={() => this.result()}
			>
				<Tabs
					className="tabs"
					captions={tabs}
					tabIndex={type !== 'gen' ? 0 : 1}
					changeTab={i => this.changeType(i === 0 ? 'atom' : 'gen')}
				>
					<div className="period-table">
						<AtomInfo el={this.state.cur} isInfo={this.state.isInfo} />
						<ElementsTable
							value={value}
							curEvents={this.curEvents}
							selected={this.selected}
							onSelect={this.onSelect}
						/>
						<TypeChoise
							value={type}
							onChange={t => this.changeType(t)}
						/>
					</div>
					<GenericGroups
						className="generic-groups"
						selected={this.selected}
						onSelect={this.onSelect}
					/>
				</Tabs>
			</Dialog>
		);
	}
}

class ElementsTable extends Component { // eslint-disable-line
	shouldComponentUpdate(nextProps) {
		return nextProps.value !== this.props.value;
	}

	render() {
		const { curEvents, selected, onSelect } = this.props;
		const callbacks = { curEvents, selected, onSelect };
		return (
			<table summary="Periodic table of the chemical elements">
				<Header />
				{
					main.map((row, i) => (
						<MainRow
							row={row}
							caption={i + 1}
							refer={o => o === 1 && (i === 5 ? '*' : '**')}
							{...callbacks}
						/>
					))
				}
				<OutinerRow
					row={lanthanides}
					caption="*"
					{...callbacks}
				/>
				<OutinerRow
					row={actinides}
					caption="**"
					{...callbacks}
				/>
			</table>
		);
	}
}

function rowPartition(elements) {
	return elements.reduce((res, el) => {
		const row = res[el.period - 1];
		if (!row) {
			res.push([el]);
		} else {
			if (beforeSpan[el.label])
				row.push(beforeSpan[el.label]);
			row.push(el);
		}
		return res;
	}, []);
}

function mapSelectionToProps(editor) {
	const selection = editor.selection();

	if (selection && Object.keys(selection).length === 1 &&
		selection.atoms && Object.keys(selection.atoms).length === 1) {
		const struct = editor.struct();
		const atom = struct.atoms.get(selection.atoms[0]);
		return { ...fromElement(atom) };
	}

	return {};
}

export default connect(
	(store, props) => {
		if (props.values || props.label) return {};
		return mapSelectionToProps(store.editor);
	},
	(dispatch, props) => ({
		onOk: (res) => {
			if (!res.type || res.type === 'atom') dispatch(addAtoms(res.label));
			dispatch(onAction({ tool: 'atom', opts: toElement(res) }));
			props.onOk(res);
		}
	})
)(PeriodTable);
