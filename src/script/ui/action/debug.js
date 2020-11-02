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

import molfile from '../../chem/molfile';

export default {
	// original: for dev purposes
	'force-update': {
		shortcut: 'Ctrl+Shift+r',
		action: (editor) => {
			editor.update(true);
		}
	},
	'qs-serialize': {
		shortcut: 'Alt+Shift+r',
		action: (editor) => {
			const molStr = molfile.stringify(editor.struct());
			const molQs = 'mol=' + encodeURIComponent(molStr).replace(/%20/g, '+');
			const qs = document.location.search;
			document.location.search = !qs ? '?' + molQs : // eslint-disable-line
				qs.search('mol=') === -1 ? qs + '&' + molQs :
					qs.replace(/mol=[^&$]*/, molQs);
		}
	}
};
