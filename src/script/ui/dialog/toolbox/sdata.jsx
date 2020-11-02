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
import { connect } from 'preact-redux';
import Form, { Field, SelectOneOf } from '../../component/form/form';
import Dialog from '../../component/dialog';
import ComboBox from '../../component/form/combobox';
import { sdataSchema, sdataCustomSchema, getSdataDefault } from '../../data/schema/sdata-schema';

function SelectInput({ title, name, schema, ...prop }) {
	const inputSelect = Object.keys(schema)
		.reduce((acc, item) => {
			acc.enum.push(item);
			acc.enumNames.push(schema[item].title || item);
			return acc;
		},
		{
			title,
			type: 'string',
			default: '',
			minLength: 1,
			enum: [],
			enumNames: []
		});

	return <Field name={name} schema={inputSelect} component={ComboBox} {...prop} />;
}

function SData({ context, fieldName, fieldValue, type, radiobuttons, formState, ...prop }) {
	const { result, valid } = formState;

	const init = {
		context,
		fieldName: fieldName || getSdataDefault(context),
		type,
		radiobuttons
	};

	init.fieldValue = fieldValue || getSdataDefault(context, init.fieldName);

	const formSchema = sdataSchema[result.context][result.fieldName] || sdataCustomSchema;

	const serialize = {
		context: result.context.trim(),
		fieldName: result.fieldName.trim(),
		fieldValue: typeof (result.fieldValue) === 'string' ? result.fieldValue.trim() : result.fieldValue
	};

	return (
		<Dialog
			title="S-Group Properties"
			className="sgroup"
			result={() => result}
			valid={() => valid}
			params={prop}
		>
			<Form serialize={serialize} schema={formSchema} init={init} {...formState}>
				<SelectOneOf title="Context" name="context" schema={sdataSchema} />
				<fieldset className="data">
					<SelectInput title="Field name" name="fieldName" schema={sdataSchema[result.context]} />
					{
						content(formSchema, result.context, result.fieldName)
					}
				</fieldset>
			</Form>
		</Dialog>
	);
}

const content = (schema, context, fieldName) => Object.keys(schema.properties)
	.filter(prop => prop !== 'type' && prop !== 'context' && prop !== 'fieldName')
	.map(prop => (prop === 'radiobuttons' ?
		<Field name={prop} type="radio" key={`${context}-${fieldName}-${prop}-radio`} /> :
		<Field name={prop} type="textarea" multiple size="10" key={`${context}-${fieldName}-${prop}-select`} />));

export default connect(
	store => ({ formState: store.modal.form })
)(SData);
