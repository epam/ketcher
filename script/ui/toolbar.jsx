import { h } from 'preact';
/** @jsx h */

import element from '../chem/element';
import Atom from './component/atom';
import acts from './acts';
import keymap from './keymap';

const mainmenu = [
	{
		id: "document",
		menu: [
			"new",
			"open",
			"save"
		]
	},
	{
		id: "edit",
		menu: [
			"undo",
			"redo",
			"cut",
			"copy",
			"paste"
		]
	},
	{
		id: "zoom",
		menu: [
			"zoom-in",
			"zoom-out",
			ZoomList
		]
	},
	{
		id: "process",
		menu: [
			"layout",
			"clean",
			"arom",
			"dearom",
			"cip",
			"check",
			"analyse",
			"recognize"
		]
	},
	{
		id: "meta",
		menu: [
			"settings",
			"help",
			"about"
		]
	}
]

const toolbox = [
	{
		id: "select",
		menu: [
			"select-lasso",
			"select-rectangle",
			"select-fragment"
		]
	},
	"erase",
	{
		id: "bond",
		menu: [
			{
				id: "bond-common",
				menu: [
					"bond-single",
					"bond-double",
					"bond-triple"
				]
			},
			{
				id: "bond-stereo",
				menu: [
					"bond-up",
					"bond-down",
					"bond-updown",
					"bond-crossed"
				]
			},
			{
				id: "bond-query",
				menu: [
					"bond-any",
					"bond-aromatic",
					"bond-singledouble",
					"bond-singlearomatic",
					"bond-doublearomatic"
				]
			}
		]
	},
	"chain",
	{
		id: "charge",
		menu: [
			"charge-plus",
			"charge-minus"
		]
	},
	{
		id: "transform",
		menu: [
			"transform-rotate",
			"transform-flip-h",
			"transform-flip-v"
		]
	},
	"sgroup",
	"sgroup-data",
	{
		id: "reaction",
		menu: [
			"reaction-arrow",
			"reaction-plus",
			"reaction-automap",
			"reaction-map",
			"reaction-unmap"
		]
	},
	{
		id: "rgroup",
		menu: [
			"rgroup-label",
			"rgroup-fragment",
			"rgroup-attpoints"
		]
	}
];

const template = [
	{
		id: "template-common",
		menu: [
			"template-0",
			"template-1",
			"template-2",
			"template-3",
			"template-4",
			"template-5",
			"template-6",
			"template-7"
		]
	},
	"template-lib"
];

const elements = [
	AtomsList,
	"period-table",
	"generic-groups"
];

function shortcutStr(key) {
	var isMac = /Mac/.test(navigator.platform);
	return key.replace(/Mod/g, isMac ? '⌘' : 'Ctrl')
		.replace(/-(?!$)/g, '+')
		.replace(/\+?([^+]+)$/, function (key) {
			return key.length == 1 ? key.toUpperCase() : key;
		});
}

const zoomList = [
	0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1,
	1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 2, 2.5, 3, 3.5, 4
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
		<menu id="atom">
		  {
			  atoms.map(label => {
				  let index = element.map[label];
				  return ( <Atom el={element[index]}/> );
			  })
		  }
		</menu>
	);
}

function ToolButton({item, ...props}) {
	return (
		<button title={keymap[item] ? shortcutStr(acts[item].title}>
		  {acts[item].title}
		</button>
	)
}

function ToolBar({menu, ...props}) {
	return (
		<menu>
		{
		  menu.map(item => (
			  typeof item == 'function' ? item(props) : (
				  <li id={item.id || item}>
					{ typeof item == 'object' ?
						( <ToolBar menu={item.menu}/> ) :
					    ( <ToolButton item={item} /> )
					}
				  </li>
			  )
		  ))
		}
		</menu>
	);
}

export default function (props) {
	return (
		<menu role="toolbar">
		  <li id="mainmenu"><ToolBar menu={mainmenu} {...props}/></li>
		  <li id="toolbox"><ToolBar menu={toolbox} {...props}/></li>
		  <li id="template"><ToolBar menu={template} {...props}/></li>
		  <li id="elements"><ToolBar menu={elements} {...props}/></li>
		</menu>
	)
};
