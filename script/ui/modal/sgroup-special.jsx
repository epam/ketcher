import { h } from 'preact';
import { connect } from 'preact-redux';
import { form as Form, Field, SelectOneOf } from '../component/form';
import Dialog from '../component/dialog';
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

	return <Field name={name} schema={inputSelect} {...prop} />
}

const customFieldNameSchema = {
	key: 'Custom',
	properties: {
		type: { enum: ["DAT"] },
		context: {
			title: 'Context',
			enum: [
				'Fragment',
				'Single Bond',
				'Atom',
				'Group'
			],
			default: 'Fragment'
		},
		fieldName: {
			title: 'Field name',
			type: "string",
			default: "",
			minLength: 1,
			invalidMessage: "Please, specify field name"
		},
		fieldValue: {
			title: 'Field value',
			type: "string",
			default: "",
			minLength: 1,
			invalidMessage: "Please, specify field value"
		},
		radiobuttons: {
			enum: [
				"Absolute",
				"Relative",
				"Attached"
			],
			default: "Absolute"
		}
	},
	required: ["fieldName", "fieldValue", "radiobuttons"]
};

function SgroupSpecial(props) {
	const { stateForm, schema, valid, ...prop } = props;

	const context = stateForm.context;
	const fieldName = stateForm.fieldName;

	const formSchema = schema[context][fieldName] || customFieldNameSchema;

	return (
		<Dialog title={"S-Group Properties"} className="sgroup"
				result={() => stateForm} valid={() => valid} params={prop}>
            <Form storeName="sgroupSpecial" schema={formSchema} init={prop}>
                <SelectOneOf title="Context" name="context" schema={schema}/>
                <fieldset className={"data"}>
                    <SelectInput title="Field name" name="fieldName" schema={schema[context]}/>
                    {
                        content(formSchema, context, fieldName)
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

export default connect((store) => {
	return {
		schema: store.sgroupSpecial.schema,
		stateForm: store.sgroupSpecial.stateForm,
		valid: store.sgroupSpecial.valid
	};
})(SgroupSpecial);
