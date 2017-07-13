import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import { sgroup as sgroupSchema } from '../structschema';
import { Form, Field, SelectOneOf } from '../component/form';
import { mapOf } from '../utils';
import Dialog from '../component/dialog';

const schemes = mapOf(sgroupSchema, 'type');

function Sgroup(props) {
	const { stateForm, valid, errors, ...prop } = props;
	const type = stateForm.type;
	let formProps = { stateForm, errors };

	return (
		<Dialog title="S-Group Properties" className="sgroup"
				result={() => stateForm} valid={() => valid} params={prop}>
			<Form storeName="sgroup" schema={schemes[type]} init={prop} {...formProps}>
				<SelectOneOf title="Type" name="type" schema={schemes}/>
				<fieldset class={type === 'DAT' ? 'data' : 'base'}>
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

			return <Field name={prop} key={`${type}-${prop}`} {...props}/>;
		}
	);

export default connect((store) => ({
		stateForm: store.modal.form.stateForm,
		valid: store.modal.form.valid,
		errors: store.modal.form.errors
	})
)(Sgroup);
