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

import { capitalize } from 'lodash/fp';

import { h } from 'preact';
import { connect } from 'preact-redux';

import { atom as atomSchema } from '../../data/schema/struct-schema';
import Form, { Field } from '../../component/form/form';
import Dialog from '../../component/dialog';

import element from '../../../chem/element';

function ElementNumber(props, { stateStore }) {
	const { result } = stateStore.props;
	return (
		<label>Number:
			<input
				className="number"
				type="text"
				readOnly
				value={element.map[capitalize(result.label)] || ''}
			/>
		</label>
	);
}

function Atom(props) {
	const { formState, ...prop } = props;
	return (
		<Dialog
			title="Atom Properties"
			className="atom-props"
			result={() => formState.result}
			valid={() => formState.valid}
			params={prop}
		>
			<Form
				schema={atomSchema}
				customValid={{
					label: l => atomValid(l),
					charge: ch => chargeValid(ch)
				}}
				init={prop}
				{...formState}
			>
				<fieldset className="main">
					<Field name="label" />
					<Field name="alias" />
					<ElementNumber />
					<Field name="charge" maxlength="5" />
					<Field name="explicitValence" />
					<Field name="isotope" />
					<Field name="radical" />
				</fieldset>
				<fieldset className="query">
					<legend>Query specific</legend>
					<Field name="ringBondCount" />
					<Field name="hCount" />
					<Field name="substitutionCount" />
					<Field name="unsaturatedAtom" />
				</fieldset>
				<fieldset className="reaction">
					<legend>Reaction flags</legend>
					<Field name="invRet" />
					<Field name="exactChangeFlag" />
				</fieldset>
			</Form>
		</Dialog>
	);
}

function atomValid(label) {
	return label && !!element.map[capitalize(label)];
}

function chargeValid(charge) {
	const pch = atomSchema.properties.charge.pattern.exec(charge);
	return !(pch === null || (pch[1] !== '' && pch[3] !== ''));
}

export default connect(
	store => ({ formState: store.modal.form })
)(Atom);
