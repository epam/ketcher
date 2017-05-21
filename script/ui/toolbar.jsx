import { connect } from 'preact-redux';
import { h } from 'preact';
/** @jsx h */

import element from '../chem/element';
import Atom from './component/atom';
import ActionMenu, { shortcutStr } from './component/actionmenu';

import acts from './acts';
import { atomCuts, basic as basicAtoms } from './acts/atoms';
import { zoomList } from './acts/zoom';
import templates from './templates';

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
			'recognize'
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
]

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
	'template-lib'
];

const elements = [
	{
		id: 'atom',
		component: AtomsList
	},
	'period-table',
	'generic-groups'
];

const toolbar = [
	{ id: 'mainmenu', menu: mainmenu },
	{ id: 'toolbox', menu: toolbox },
	{ id: 'template', menu: template },
	{ id: 'elements', menu: elements }
];

function ZoomList() {
	return (
		<select>
		  {
			  zoomList.map(val => (
				  <option value={val}>{`${Math.round(val * 100)}%`}</option>
			  ))
		  }
		</select>
	);
}

function AtomsList({atoms, ...props}) {
	return (
		<menu>
		  {
			  atoms.map(label => {
				  let index = element.map[label];
				  let shortcut = shortcutStr(atomCuts[label]);
				  return (
					  <li>
						<Atom el={element[index]} shortcut={shortcut}/>
					  </li>
				  );
			  })
		  }
		</menu>
	);
}

function TemplatesList({...props}) {
	let shortcut = shortcutStr(acts.templates.shortcut);
	return (
		<menu>
		  {
			  templates.map((struct, i) => (
				  <li id={`template-${i}`}>
				  <button title={`${struct.name} (${shortcut})`}>
					{struct.name}
				  </button>
				  </li>
			  ))
		  }
		</menu>
	);
}

export default connect(
	(state, props) => ({
		atoms: basicAtoms.concat(state.freqAtoms)
	}),
)(props => (console.info('render'),
	<ActionMenu menu={toolbar} role="toolbar" {...props}/>
));
