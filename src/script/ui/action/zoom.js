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

import { findIndex, findLastIndex } from 'lodash/fp';

export const zoomList = [
	0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1,
	1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 2, 2.5, 3, 3.5, 4
];

export default {
	zoom: {
		selected: editor => editor.zoom()
	},
	'zoom-out': {
		shortcut: ['-', '_', 'Shift+-'],
		title: 'Zoom Out',
		disabled: editor => (
			editor.zoom() <= zoomList[0] // unsave
		),
		action: (editor) => {
			const zoom = editor.zoom();
			const i = findIndex(z => z >= zoom, zoomList);
			editor.zoom(
				zoomList[(zoomList[i] === zoom && i > 0) ? i - 1 : i]
			);
		}
	},
	'zoom-in': {
		shortcut: ['+', '=', 'Shift+='],
		title: 'Zoom In',
		disabled: editor => (
			zoomList[zoomList.length - 1] <= editor.zoom()
		),
		action: (editor) => {
			const zoom = editor.zoom();
			const i = findLastIndex(z => z <= zoom, zoomList);
			editor.zoom(
				zoomList[(zoomList[i] === zoom && i < zoomList.length - 1) ? i + 1 : i]
			);
		}
	}
};
