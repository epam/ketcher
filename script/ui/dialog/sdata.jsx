import { h } from 'preact';
import { connect } from 'preact-redux';
import { Form, Field, SelectOneOf } from '../component/form';
import Dialog from '../component/dialog';
import ComboBox from '../component/combobox';
import { sdataSchema, sdataCustomSchema, getSdataDefault } from '../data/sdata-schema'
/** @jsx h */

function SelectInput({ title, name, schema, ...prop }) {
	const inputSelect = Object.keys(schema).reduce((acc, item) => {
			acc.enum.push(item);
			acc.enumNames.push(schema[item].title || item);
			return acc;
		},
		{
			title: title,
			type: 'string',
			default: '',
			minLength: 1,
			enum: [],
			enumNames: []
		}
	);

	return <Field name={name} schema={inputSelect} component={ComboBox} {...prop} />
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
		fieldValue: result.fieldValue.trim()
	};

	return (
		<Dialog title={"S-Group Properties"} className="sgroup"
				result={() => result} valid={() => valid} params={prop}>
            <Form serialize={serialize} schema={formSchema} init={init} {...formState}>
                <SelectOneOf title="Context" name="context" schema={sdataSchema}/>
                <fieldset className={"data"}>
                    <SelectInput title="Field name" name="fieldName" schema={sdataSchema[result.context]}/>
                    {
                        content(formSchema, result.context, result.fieldName)
                    }
                </fieldset>
            </Form>
		</Dialog>
	);
}

const content = (schema, context, fieldName) => Object.keys(schema.properties)
	.filter(prop => prop !== "type" && prop !== "context" && prop !== "fieldName")
	.map(prop => prop === "radiobuttons" ?
		<Field name={prop} type="radio" key={`${context}-${fieldName}-${prop}-radio`}/> :
		<Field name={prop} type="textarea" size="10" key={`${context}-${fieldName}-${prop}-select`}/>
	);

export default connect(
	store => ({ formState: store.modal.form })
)(SData);
