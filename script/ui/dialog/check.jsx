/****************************************************************************
 * Copyright 2017 EPAM Systems
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
import { connect } from 'preact-redux';

import Dialog from '../component/dialog';
import Tabs from '../component/tabs';
import Form, { Field } from '../component/form';
import { check } from '../state/server';

const checkSchema = {
	title: 'Check',
	type: 'object',
	properties: {
		checkOptions: {
			type: 'array',
			items: {
				type: 'string',
				enum: ['valence', 'radicals', 'pseudoatoms', 'stereo', 'query', 'overlapping_atoms',
					'overlapping_bonds', 'rgroups', 'chiral', '3d'],
				enumNames: ['Valence', 'Radical', 'Pseudoatom', 'Stereochemistry', 'Query', 'Overlapping Atoms',
					'Overlapping Bonds', 'R-Groups', 'Chirality', '3D Structure']
			}
		}
	}
};
function getOptionName(opt) {
	const d = checkSchema.properties.checkOptions.items;
	return d.enumNames[d.enum.indexOf(opt)];
}

function Check(props) {
	const tabs = ['Check', 'Settings'];
	const { formState, onCheck, ...prop } = props;
	const { result, moleculeErrors } = formState;

	return (
		<Dialog
			title="Structure Check"
			className="check"
			result={() => result}
			params={prop}
		>
			<Form schema={checkSchema} {...formState}>
				<Tabs
					className="tabs"
					captions={tabs}
					  changeTab={i => (i === 0 ? onCheck(result.checkOptions) : null)}
				>
					<ErrorsCheck moleculeErrors={moleculeErrors} />
					<Field name="checkOptions" multiple type="checkbox" />
				</Tabs>
			</Form>
		</Dialog>
	);
}

function ErrorsCheck(props) {
	const { moleculeErrors } = props;
	const moleculeErrorsTypes = Object.keys(moleculeErrors);

	return (
		<fieldset {...props}>
			{moleculeErrorsTypes.length === 0 ?
				<dt>No errors found</dt> :
				moleculeErrorsTypes.map(type => (
					<div>
						<dt>{getOptionName(type)} error :</dt>
						<dd>{moleculeErrors[type]}</dd>
					</div>
				))}
		</fieldset>
	);
}

export default connect(
	store => ({	formState: store.modal.form }),
	dispatch => ({
		onCheck: opts => dispatch(check(opts))
	})
)(Check);
