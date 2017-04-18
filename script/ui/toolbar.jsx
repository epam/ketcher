import { h } from 'preact';
/** @jsx h */

import acts from './acts';

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
			//"zoom-list"
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
	{
		id: "atom",
		menu: [
			"atom-h",
			"atom-c",
			"atom-n",
			"atom-o",
			"atom-s",
			"atom-p",
			"atom-f",
			"atom-cl",
			"atom-br",
			"atom-i"
		]
	},
	"period-table",
	"generic-groups"
];

function ToolButton({item}) {
	console.info(acts, item, acts[item]);
	return (
		<button title={acts[item].title}>
		  {acts[item].title}
		</button>
	)
}

function ToolBar({menu, ...props}) {
	return (
		<menu>
		{
		  menu.map(item => (
			  typeof item == 'function' ? item() : (
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
		  <li id="mainmenu"><ToolBar menu={mainmenu}/></li>
		  <li id="toolbox"><ToolBar menu={toolbox}/></li>
		  <li id="template"><ToolBar menu={template}/></li>
		  <li id="elements"><ToolBar menu={elements}/></li>
		</menu>
	)
};
