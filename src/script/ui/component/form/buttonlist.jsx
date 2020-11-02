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
import { xor } from 'lodash/fp';

function oneOrMore(multipl, values, item) {
	if (multipl) return xor(values, [item]);
	return xor(values, values.concat([item]));
}

function ButtonList({ value, onChange, schema, disabledIds, multiple }) {
	let className;
	return (
		<ul>
			{
				schema.items.enum.map((item, i) => {
					className = value.includes(item) ? 'selected' : '';
					return (
						<li>
							<button
								disabled={disabledIds.includes(item)}
								type="button"
								className={className}
								onClick={() => (onChange(oneOrMore(multiple, value, item)))}
							>
								{schema.items.enumNames[i]}
							</button>
						</li>
					);
				})
			}
		</ul>
	);
}

export default ButtonList;

