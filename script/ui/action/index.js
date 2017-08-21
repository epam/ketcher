import tools from './tools';
import atoms from './atoms';
import zoom from './zoom';
import server from './server';
import debug from './debug';

export default {
	"new": {
		shortcut: "Mod+n",
		title: "Clear Canvas",
		action: editor => {
			if (!editor.struct().isBlank())
				editor.struct(null);
		}
	},
	"open": {
		shortcut: "Mod+o",
		title: "Open…",
		action: { dialog: 'open' }
	},
	"save": {
		shortcut: "Mod+s",
		title: "Save As…",
		action: { dialog: 'save' }
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
			actions && // TMP
				actions.active && actions.active.tool == 'paste'
		)
	},
	"check": {
		title: "Check Structure",
		action: { dialog: 'check' }
	},
	"analyse": {
		title: "Calculated Values",
		action: { dialog: 'analyse' }
	},
	"recognize": {
		title: "Recognize Molecule",
		action: { dialog: 'recognize' }
	},
	"settings": {
		title: "Settings",
		action: { dialog: 'settings' }
	},
	"help": {
		shortcut: ["?", "Shift+/"],
		title: "Help",
		action: { dialog: 'help' }
	},
	"about": {
		title: "About",
		action: { dialog: 'about' }
	},
	"reaction-automap": {
		title: "Reaction Auto-Mapping Tool",
		action: { dialog: 'automap' },
		disabled: editor => !editor.struct().hasRxnArrow()
	},
	"templates": {
		shortcut: "t",
		title: "Switch Basic Templates"
	},
	"template-lib": {
		shortcut: "Shift+t",
		title: "Custom Templates",
		action: { dialog: 'templates' }
	},
	"period-table": {
		title: "Periodic Table",
		action: { dialog: 'period-table' }
	},
	"select-all": {
		title: "Select All",
		shortcut: "Mod+a",
		action: editor => {
			editor.selection('all');
			//selectAction(null);
		}
	},
	"deselect-all": {
		title: "Deselect All",
		shortcut: "Mod+Shift+a",
		action: editor => {
			editor.selection(null);
		}
	},
	...server,
	...debug,
	...tools,
	...atoms,
	...zoom
};

function hasSelection(editor) {
	let selection = editor.selection();
	return selection &&  // if not only sgroupData selected
		(Object.keys(selection).length > 1 || !selection.sgroupData);
};
