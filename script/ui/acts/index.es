import tools from './tools';
import atoms from './atoms';
import zoom from './zoom';

export default {
	"new": {
		shortcut: "Mod+n",
		title: "Clear Canvas"
	},
	"open": {
		shortcut: "Mod+o",
		title: "Open…"
	},
	"save": {
		shortcut: "Mod+s",
		title: "Save As…"
	},
	"undo": {
		shortcut: "Mod+z",
		title: "Undo",
		action: editor => {
			editor.undo();
		},
		disabled: editor => (
			editor.historySize().undo == 0
		)
	},
	"redo": {
		shortcut: ["Mod+Shift+z", "Mod+y"],
		title: "Redo",
		action: editor => {
			editor.redo();
		},
		disabled: editor => (
			editor.historySize().redo == 0
		)
	},
	"cut": {
		shortcut: "Mod+x",
		title: "Cut",
		disabled: editor => !hasSelection(editor)
	},
	"copy": {
		shortcut: "Mod+c",
		title: "Copy",
		disabled: editor => !hasSelection(editor)
	},
	"paste": {
		shortcut: "Mod+v",
		title: "Paste",
		selected: ({ actions }) => (
			actions.active && actions.active.tool == 'paste'
		)
	},
	"layout": {
		shortcut: "Mod+l",
		title: "Layout"
	},
	"clean": {
		shortcut: "Mod+Shift+l",
		title: "Clean Up"
	},
	"arom": {
		title: "Aromatize"
	},
	"dearom": {
		title: "Dearomatize"
	},
	"cip": {
		shortcut: "Mod+p",
		title: "Calculate CIP"
	},
	"check": {
		title: "Check Structure"
	},
	"analyse": {
		title: "Calculated Values"
	},
	"recognize": {
		title: "Recognize Molecule"
	},
	"settings": {
		title: "Settings"
	},
	"help": {
		shortcut: ["?", "Shift+/"],
		title: "Help"
	},
	"about": {
		title: "About"
	},
	"reaction-automap": {
		title: "Reaction Auto-Mapping Tool"
	},
	"templates": {
		shortcut: "t",
		title: "Switch Basic Templates"
	},
	"template-lib": {
		shortcut: "Shift+t",
		title: "Custom Templates"
	},
	"period-table": {
		title: "Periodic Table"
	},
	"generic-groups": {
		title: "Generic Groups"
	},
	"select-all": {
		title: "Select All",
		shortcut: "Mod+a"
	},
	"deselect-all": {
		title: "Deselect All",
		shortcut: "Mod+Shift+a"
	},
	"force-update": {
		shortcut: "Ctrl+Shift+r"
	},
	"qs-serialize": {
		shortcut: "Alt+Shift+r"
	},
	...tools,
	...atoms,
	...zoom
};

function hasSelection(editor) {
	let selection = editor.selection();
	return selection &&  // if not only sgroupData selected
		(Object.keys(selection).length > 1 || !selection.sgroupData);
};
