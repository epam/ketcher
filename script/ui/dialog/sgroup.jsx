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

import { sgroup as sgroupSchema } from '../structschema';
import { Form, Field, SelectOneOf } from '../component/form';
import { mapOf } from '../utils';
import Dialog from '../component/dialog';

const schemes = mapOf(sgroupSchema, 'type');

function Sgroup({ formState, ...prop }) {
	const { result, valid } = formState;

	const type = result.type;

	return (
		<Dialog
			title="S-Group Properties"
			className="sgroup"
			result={() => result}
			valid={() => valid}
			params={prop}
		>
			<Form schema={schemes[type]} init={prop} {...formState}>
				<SelectOneOf title="Type" name="type" schema={schemes} />
				<fieldset className={type === 'DAT' ? 'data' : 'base'}>
					{ content(type) }
				</fieldset>
			</Form>
		</Dialog>
	);
}

const content = type => Object.keys(schemes[type].properties)
	.filter(prop => prop !== 'type')
	.map(prop => {
			let props = {};
			if (prop === 'name') props.maxlength = 15;
			if (prop === 'fieldName') props.maxlength = 30;
			if (prop === 'fieldValue') props.type = 'textarea';
			if (prop === 'radiobuttons') props.type = 'radio';

			return <Field name={prop} key={`${type}-${prop}`} {...props} />;
		}
	);

export default connect(
	(store) => ({ formState: store.modal.form })
)(Sgroup);
