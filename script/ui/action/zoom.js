/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

import { findIndex, findLastIndex } from 'lodash/fp';

export const zoomList = [
	0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1,
	1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 2, 2.5, 3, 3.5, 4
];

export default {
	"zoom": {
		selected: editor => editor.zoom()
	},
	"zoom-out": {
		shortcut: ["-", "_", "Shift+-"],
		title: "Zoom Out",
		disabled: editor => (
			editor.zoom() <= zoomList[0] // unsave
		),
		action: editor => {
			let zoom = editor.zoom();
			let i = findIndex(z => z >= zoom, zoomList);
			editor.zoom(
				zoomList[(zoomList[i] === zoom && i > 0) ? i - 1 : i]
			);
		}
	},
	"zoom-in": {
		shortcut: ["+", "=", "Shift+="],
		title: "Zoom In",
		disabled: editor => (
			zoomList[zoomList.length - 1] <= editor.zoom()
		),
		action: editor => {
			let zoom = editor.zoom();
			let i = findLastIndex(z => z <= zoom, zoomList);
			editor.zoom(
				zoomList[(zoomList[i] === zoom && i < zoomList.length - 1) ? i + 1 : i]
			);
		}
	}
}
