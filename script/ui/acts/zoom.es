export const zoomList = [
	0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1,
	1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 2, 2.5, 3, 3.5, 4
];

export default {
	"zoom": {
		selected: editor => editor.zoom()
	},
	"zoom-in": {
		shortcut: ["+", "=", "Shift+="],
		title: "Zoom In"
	},
	"zoom-out": {
		shortcut: ["-", "_", "Shift+-"],
		title: "Zoom Out"
	}
}
