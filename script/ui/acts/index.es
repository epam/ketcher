import tools from './tools';

export default Object.assign({
	"new": {
		shortcut: "Mod-n",
		title: "Clear Canvas"
	},
	"open": {
		shortcut: "Mod-o",
		title: "Open…"
	},
	"save": {
		shortcut: "Mod-s",
		title: "Save As…"
	},
	"undo": {
		shortcut: "Mod-z",
		title: "Undo"
	},
	"redo": {
		shortcut: ["Mod-Shift-z", "Mod-y"],
		title: "Redo"
	},
	"cut": {
		shortcut: "Mod-x",
		title: "Cut"
	},
	"copy": {
		shortcut: "Mod-c",
		title: "Copy"
	},
	"paste": {
		shortcut: "Mod-v",
		title: "Paste"
	},
	"zoom-in": {
		shortcut: ["+", "=", "Shift-="],
		title: "Zoom In"
	},
	"zoom-out": {
		shortcut: ["-", "_", "Shift--"],
		title: "Zoom Out"
	},
	"layout": {
		shortcut: "Mod-l",
		title: "Layout"
	},
	"clean": {
		shortcut: "Mod-Shift-l",
		title: "Clean Up"
	},
	"arom": {
		title: "Aromatize"
	},
	"dearom": {
		title: "Dearomatize"
	},
	"cip": {
		shortcut: "Mod-p",
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
		shortcut: ["?", "Shift-/"],
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
		shortcut: "Shift-t",
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
		shortcut: "Mod-a"
	},
	"deselect-all": {
		title: "Deselect All",
		shortcut: "Mod-Shift-a"
	},
	"force-update": {
		shortcut: "Ctrl-Shift-r"
	},
	"qs-serialize": {
		shortcut: "Alt-Shift-r"
	}
}, tools);
