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
import generics from '../../../chem/generics';

const viewSchema = {
	atom: {
		caption: 'Atom Generics',
		order: ['any', 'no-carbon', 'metal', 'halogen']
	},
	group: {
		caption: 'Group Generics',
		order: ['acyclic', 'cyclic']
	},
	special: {
		caption: 'Special Nodes',
		order: []
	},
	'group/acyclic': {
		caption: 'Acyclic',
		order: ['carbo', 'hetero']
	},
	'group/cyclic': {
		caption: 'Cyclic',
		order: ['no-carbon', 'carbo', 'hetero']
	},
	'group/acyclic/carbo': {
		caption: 'Carbo',
		order: ['alkynyl', 'alkyl', 'alkenyl']
	},
	'group/acyclic/hetero': {
		caption: 'Hetero',
		order: ['alkoxy']
	},
	'group/cyclic/carbo': {
		caption: 'Carbo',
		order: ['aryl', 'cycloalkyl', 'cycloalkenyl']
	},
	'group/cyclic/hetero': {
		caption: 'Hetero',
		order: ['aryl']
	},
	'atom/any': 'any atom',
	'atom/no-carbon': 'except C or H',
	'atom/metal': 'any metal',
	'atom/halogen': 'any halogen',
	'group/cyclic/no-carbon': 'no carbon',
	'group/cyclic/hetero/aryl': 'hetero aryl'
};

function GenSet({ labels, caption = '', selected, onSelect, ...props }) {
	return (
		<fieldset {...props}>
			{
				labels.map(label => (
					<button
						onClick={() => onSelect(label)}
						className={selected(label) ? 'selected' : ''}
					>
						{label}
					</button>
				))
			}
			{
				caption ? (
					<legend>{caption}</legend>
				) : null
			}
		</fieldset>
	);
}

function GenGroup({ gen, name, path, selected, onSelect }) {
	const group = gen[name];
	const pk = path ? `${path}/${name}` : name;
	const schema = viewSchema[pk];

	return (schema && schema.caption) ? (
		<fieldset className={name}>
			<legend>{schema.caption}</legend>
			{
				group.labels ? (
					<GenSet
						labels={group.labels}
						selected={selected}
						onSelect={onSelect}
					/>
				) : null
			}
			{
				schema.order.map(child => ( // TODO:order = Object.keys ifndef
					<GenGroup
						gen={group}
						name={child}
						path={pk}
						selected={selected}
						onSelect={onSelect}
					/>
				))
			}
		</fieldset>
	) : (
		<GenSet
			labels={group.labels}
			caption={schema || name}
			className={name}
			selected={selected}
			onSelect={onSelect}
		/>
	);
}

function GenericGroups({ selected, onSelect, ...props }) {
	return (
		<div summary="Generic Groups" {...props}>
			<div className="col">
				<GenGroup
					gen={generics}
					name="atom"
					selected={l => selected(l)}
					onSelect={l => onSelect(l)}
				/>
				<GenGroup
					gen={generics}
					name="special"
					selected={l => selected(l)}
					onSelect={l => onSelect(l)}
				/>
			</div>
			<div className="col">
				<GenGroup
					gen={generics}
					name="group"
					selected={l => selected(l)}
					onSelect={l => onSelect(l)}
				/>
			</div>
		</div>
	);
}

export default GenericGroups;
