import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import {sgroup as sgroupSchema} from '../structschema';
import {form as Form, Field, mapOf} from '../component/form';
import Dialog from '../component/dialog';

const schemes = mapOf(sgroupSchema, 'type');

function SelectOneOf(props, {stateStore}) {
	const { name, ...prop } = props;

	const selectDesc = {
		title: 'Type',
		enum: [],
		enumNames: []
	};

	Object.keys(schemes).forEach((item) => {
		selectDesc.enum.push(item);
		selectDesc.enumNames.push(schemes[item].title);
	});

	return <Field schema={selectDesc} {...stateStore.field(name)} {...prop}/>;
}

function Sgroup(props) {
	let {stateForm, ...prop} = props;
	let type = stateForm.type;

	return (
		<Form storeName="sgroup" component={Dialog} title="S-Group Properties" className="sgroup"
			  schema={schemes[type]} init={prop} params={prop}>
			<SelectOneOf name="type"/>
			<fieldset class={type === 'DAT' ? 'data' : 'base'}>
				{ content(type) }
			</fieldset>
		</Form>
	);
}

const content = type => Object.keys(schemes[type].properties)
	.filter(prop => prop !== 'type')
	.map(prop => {
			const fieldType = prop === 'radiobuttons' ? 'radio' :
				prop === 'fieldValue' ? 'textarea' : 'text';

			return <Field name={prop} type={fieldType} key={`${type}-${prop}`}/>;
		}
	);

export default connect((store) => {
	return {
		stateForm: store.sgroup.stateForm
	};
})(Sgroup);
