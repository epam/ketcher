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

import templates from '../data/templates';

const templateLib = {
	'template-lib': {
		shortcut: 'Shift+t',
		title: 'Custom Templates',
		action: { dialog: 'templates' },
		disabled: (editor, server, options) => !options.app.templates
	}
};

export default templates.reduce((res, struct, i) => {
	res[`template-${i}`] = {
		title: `${struct.name}`,
		shortcut: 't',
		action: {
			tool: 'template',
			opts: { struct }
		}
	};
	return res;
}, templateLib);

