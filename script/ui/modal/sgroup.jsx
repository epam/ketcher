import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import { sgroup as sgroupSchema } from '../structschema';
import { form as Form, Field, SelectOneOf, mapOf } from '../component/form';
import Dialog from '../component/dialog';

const schemes = mapOf(sgroupSchema, 'type');

function Sgroup(props) {
	const { stateForm, ...prop } = props;
	const type = stateForm.type;

	return (
		<Form storeName="sgroup" component={Dialog} title="S-Group Properties" className="sgroup"
			  schema={schemes[type]} params={prop}>
			<SelectOneOf title="Type" name="type"
						 schema={schemes} key={`${type}-type`}
			/>
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
