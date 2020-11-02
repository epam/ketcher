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

import { h } from 'preact';

function SelectList({ schema, value, onSelect, splitIndexes, ...props }) {
	return (
		<ul {...props}>{
			schema.enum.map((opt, index) => (
				<li
					onClick={() => onSelect(opt, index)}
					className={
						(opt === value ? 'selected ' : '') +
						(isSplitIndex(index, splitIndexes) ? 'split' : '')
					}
				>
					{schema.enumNames ? schema.enumNames[index] : opt}
				</li>
			))
		}
		</ul>
	);
}

function isSplitIndex(index, splitIndexes) {
	return index > 0 && splitIndexes && splitIndexes.includes(index);
}

export default SelectList;
