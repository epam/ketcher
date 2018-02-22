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

import { connect } from 'preact-redux';
import { h } from 'preact';

import classNames from 'classnames';

import element from '../../chem/element';
import Atom from '../component/view/atom';
import Icon from '../component/view/icon';
import ActionMenu, { shortcutStr } from '../component/actionmenu';

import action from '../action';
import { atomCuts, basic as basicAtoms } from '../action/atoms';
import { zoomList } from '../action/zoom';
import templates from '../data/templates';

const mainmenu = [
	{
		id: 'document',
		menu: [
			'new',
			'open',
			'save'
		]
	},
	{
		id: 'edit',
		menu: [
			'undo',
			'redo',
			'cut',
			'copy',
			'paste'
		]
	},
	{
		id: 'zoom',
		menu: [
			'zoom-in',
			'zoom-out',
			{
				id: 'zoom-list',
				component: ZoomList
			}
		]
	},
	{
		id: 'process',
		menu: [
			'layout',
			'clean',
			'arom',
			'dearom',
			'cip',
			'check',
			'analyse',
			'recognize',
			'miew'
		]
	},
	{
		id: 'meta',
		menu: [
			'settings',
			'help',
			'about'
		]
	}
];

const toolbox = [
	{
		id: 'select',
		menu: [
			'select-lasso',
			'select-rectangle',
			'select-fragment'
		]
	},
	'erase',
	{
		id: 'bond',
		menu: [
			{
				id: 'bond-common',
				menu: [
					'bond-single',
					'bond-double',
					'bond-triple'
				]
			},
			{
				id: 'bond-stereo',
				menu: [
					'bond-up',
					'bond-down',
					'bond-updown',
					'bond-crossed'
				]
			},
			{
				id: 'bond-query',
				menu: [
					'bond-any',
					'bond-aromatic',
					'bond-singledouble',
					'bond-singlearomatic',
					'bond-doublearomatic'
				]
			}
		]
	},
	'chain',
	{
		id: 'charge',
		menu: [
			'charge-plus',
			'charge-minus'
		]
	},
	{
		id: 'transform',
		menu: [
			'transform-rotate',
			'transform-flip-h',
			'transform-flip-v'
		]
	},
	'sgroup',
	'sgroup-data',
	{
		id: 'reaction',
		menu: [
			'reaction-arrow',
			'reaction-plus',
			'reaction-automap',
			'reaction-map',
			'reaction-unmap'
		]
	},
	{
		id: 'rgroup',
		menu: [
			'rgroup-label',
			'rgroup-fragment',
			'rgroup-attpoints'
		]
	}
];

const template = [
	{
		id: 'template-common',
		component: TemplatesList
	},
	'template-lib',
	'chiral-flag'
];

const elements = [
	{
		id: 'atom',
		component: props => AtomsList(basicAtoms, props)
	},
	{
		id: 'freq-atoms',
		component: props => AtomsList(props['freqAtoms'], props)

	},
	'period-table'
];

const toolbar = [
	{ id: 'mainmenu', menu: mainmenu },
	{ id: 'toolbox', menu: toolbox },
	{ id: 'template', menu: template },
	{ id: 'elements', menu: elements }
];

function ZoomList({ status, onAction }) {
	const zoom = status.zoom && status.zoom.selected; // TMP
	return (
		<select
			value={zoom}
			onChange={ev => onAction(editor => editor.zoom(parseFloat(ev.target.value)))}
		>
			{
				zoomList.map(val => (
					<option value={val}>{`${(val * 100).toFixed()}%`}</option>
				))
			}
		</select>
	);
}

function AtomsList(atoms, { active, onAction }) {
	const isAtom = active && active.tool === 'atom';
	return (
		<menu>
			{
				atoms.map((label) => {
					const index = element.map[label];
					const shortcut = basicAtoms.indexOf(label) > -1 ? shortcutStr(atomCuts[label]) : null;
					return (
						<li
							className={classNames({
								selected: isAtom && active.opts.label === label
							})}
						>
							<Atom
								el={element[index]}
								shortcut={shortcut}
								onClick={() => onAction({ tool: 'atom', opts: { label } })}
							/>
						</li>
					);
				})
			}
		</menu>
	);
}

function TemplatesList({ active, onAction }) {
	const shortcut = shortcutStr(action['template-0'].shortcut);
	const isTmpl = active && active.tool === 'template';
	return (
		<menu>
			{
				templates.map((struct, i) => (
					<li
						id={`template-${i}`}
						className={classNames({
							selected: isTmpl && active.opts.struct === struct
						})}
					>
						<button
							title={`${struct.name} (${shortcut})`}
							onClick={() => onAction({ tool: 'template', opts: { struct } })}
						>
							<Icon name={`template-${i}`} />{struct.name}
						</button>
					</li>
				))
			}
		</menu>
	);
}

export default connect(
	state => ({
		active: state.actionState && state.actionState.activeTool,
		status: state.actionState || {},
		freqAtoms: state.toolbar.freqAtoms,
		opened: state.toolbar.opened,
		visibleTools: state.toolbar.visibleTools
	}),	{
		onOpen: (menuName, isSelected) => ({ type: 'OPENED', data: { menuName, isSelected } })
	}
)(props => (
	<ActionMenu menu={toolbar} role="toolbar" {...props} />
));
